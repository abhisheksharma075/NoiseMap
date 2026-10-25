import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { NoiseReading, NoiseIncident } from '../../types';
import { MapConfigService, TileLayerConfig } from '../../services/mapConfigService';
import { locationService } from '../../services/locationService';
import { LiveGridActivity } from '../../services/noiseActivityLifecycleService';
import { AlertCircle, RotateCcw, Crosshair, Loader2 } from 'lucide-react';

export interface LiveHeatmapProps {
  readings?: NoiseReading[];
  gridActivities?: LiveGridActivity[];
  incidents: NoiseIncident[];
  onSelectNode: (item: { reading?: NoiseReading; incident?: NoiseIncident; activity?: LiveGridActivity }) => void;
  className?: string;
  onTileError?: (errorMsg: string) => void;
}

export const LiveHeatmap: React.FC<LiveHeatmapProps> = ({
  readings = [],
  gridActivities,
  incidents,
  onSelectNode,
  className = '',
  onTileError,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasAutoCenteredRef = useRef<boolean>(false);

  const [activeTileConfig, setActiveTileConfig] = useState<TileLayerConfig>(() =>
    MapConfigService.getTileLayerConfig()
  );
  const [tileLoadError, setTileLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Default fallback coordinate center (universal viewport)
  const defaultCenter: [number, number] = [26.144, 91.736];

  // Helper to attach a tile layer and handle errors gracefully
  const attachTileLayer = useCallback((map: L.Map, config: TileLayerConfig) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let errorCount = 0;
    const maxErrorsBeforeFallback = 3;

    const layer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abcd',
      attribution: config.attribution,
      className: config.className || '',
    });

    layer.on('tileerror', (errorEvent) => {
      errorCount++;
      console.warn(`[NoiseMap Tile Layer] Error loading tile from ${config.name}:`, errorEvent);

      if (errorCount >= maxErrorsBeforeFallback && config.provider !== 'osm_dark') {
        const warning = `Provider "${config.name}" tiles failed to load (Invalid key or network rejection). Automatically falling back to OpenStreetMap Standard.`;
        setTileLoadError(warning);
        if (onTileError) onTileError(warning);

        // Fall back automatically to OpenStreetMap Standard
        const fallbackConfig = MapConfigService.getTileLayerConfig('osm_dark');
        MapConfigService.setMapProvider('osm_dark');
        setActiveTileConfig(fallbackConfig);
        attachTileLayer(map, fallbackConfig);
      }
    });

    layer.on('load', () => {
      if (errorCount === 0) {
        setTileLoadError(null);
      }
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [onTileError]);

  // Center on coordinates and place/update the yellow live-location marker
  const updateLiveLocationMarker = useCallback((lat: number, lng: number, accuracyMeters?: number, isLive: boolean = true) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Create high-visibility pulsing yellow live-location pin
    const yellowLiveIcon = L.divIcon({
      className: 'custom-live-user-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${isLive ? 'bg-amber-400' : 'bg-slate-400'} opacity-75"></span>
          <span class="relative inline-flex items-center justify-center rounded-full h-5 w-5 ${isLive ? 'bg-amber-400' : 'bg-slate-300'} border-2 border-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)]">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
          </span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(yellowLiveIcon);
    } else {
      userMarkerRef.current = L.marker([lat, lng], {
        icon: yellowLiveIcon,
        zIndexOffset: 1000, // Keep user marker on top of noise circles
      }).addTo(map);

      userMarkerRef.current.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #1e293b; padding: 2px;">
          <strong style="color: ${isLive ? '#d97706' : '#475569'};">${isLive ? 'YOUR LIVE LOCATION' : 'LAST RECORDED LOCATION'}</strong><br/>
          Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°<br/>
          ${accuracyMeters ? `GPS Precision: ±${accuracyMeters}m` : ''}
        </div>
      `);
    }
  }, []);

  // Center map on user location
  const centerOnUserLocation = useCallback(async (isManualTrigger: boolean = false) => {
    setIsLocating(true);
    setLocationStatus(null);

    try {
      const pos = await locationService.getQuantizedPosition();
      if (mapInstanceRef.current) {
        updateLiveLocationMarker(pos.lat, pos.lng, pos.accuracyMeters, true);
        mapInstanceRef.current.setView([pos.lat, pos.lng], 15, { animate: true });
        hasAutoCenteredRef.current = true;
      }
    } catch (locErr) {
      console.warn('[LiveHeatmap] Geolocation query failed or denied:', locErr);

      // Check for cached previous location
      const cached = locationService.getLastKnownLocation();
      if (cached && mapInstanceRef.current) {
        updateLiveLocationMarker(cached.lat, cached.lng, cached.accuracyMeters, false);
        if (isManualTrigger || !hasAutoCenteredRef.current) {
          mapInstanceRef.current.setView([cached.lat, cached.lng], 15, { animate: true });
          hasAutoCenteredRef.current = true;
        }
        setLocationStatus('Using last known location (GPS unavailable)');
      } else if (readings.length > 0 && readings[0] && mapInstanceRef.current) {
        // If no GPS, center on user's most recent submitted sample
        const latestReading = readings[0];
        updateLiveLocationMarker(latestReading.lat, latestReading.lng, 100, false);
        if (isManualTrigger || !hasAutoCenteredRef.current) {
          mapInstanceRef.current.setView([latestReading.lat, latestReading.lng], 15, { animate: true });
          hasAutoCenteredRef.current = true;
        }
        setLocationStatus('Centered on recent reading sector');
      } else {
        if (isManualTrigger) {
          setLocationStatus('GPS permission denied. Using universal map center.');
        }
      }
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationStatus(null), 5000);
    }
  }, [readings, updateLiveLocationMarker]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Determine initial center
      const cached = locationService.getLastKnownLocation();
      const initialCenter: [number, number] = cached ? [cached.lat, cached.lng] : defaultCenter;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      map.attributionControl.setPosition('bottomright');
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      const config = MapConfigService.getTileLayerConfig();
      setActiveTileConfig(config);
      attachTileLayer(map, config);

      if (cached) {
        updateLiveLocationMarker(cached.lat, cached.lng, cached.accuracyMeters, false);
      }

      // Request fresh GPS location and center map automatically
      centerOnUserLocation(false);

      // Invalidate Leaflet canvas size to ensure crisp rendering after layout paint
      const invalidateTimer1 = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      const invalidateTimer2 = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
      const invalidateTimer3 = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 500);

      // Mobile viewport and orientation change listener
      const handleResize = () => {
        mapInstanceRef.current?.invalidateSize();
      };
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      // ResizeObserver to automatically track container dimension changes
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          mapInstanceRef.current?.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(invalidateTimer1);
        clearTimeout(invalidateTimer2);
        clearTimeout(invalidateTimer3);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          userMarkerRef.current = null;
          hasAutoCenteredRef.current = false;
        }
      };
    }
  }, [attachTileLayer, centerOnUserLocation, updateLiveLocationMarker]);

  // Sync readings, grid activities, and verified incidents onto map canvas
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Render Acoustical Node Markers (using gridActivities if provided, else readings)
    if (gridActivities && gridActivities.length > 0) {
      gridActivities.forEach((activity) => {
        const reading = activity.latestReading;
        const db = reading.db_avg;

        // Visual color logic based on activity lifecycle state
        let color = '#10B981'; // Emerald (<50 dB Safe)
        let fillOpacity = 0.7;

        if (activity.activityState === 'stale') {
          color = '#64748B'; // Muted Slate (Expired / Stale observation)
          fillOpacity = 0.35;
        } else if (activity.activityState === 'active') {
          color = db >= 85 ? '#EF4444' : '#F97316'; // Crimson or Orange for Active Noise
          fillOpacity = 0.85;
        } else {
          // Quiet state (< 68 dB)
          color = db < 50 ? '#10B981' : '#F59E0B'; // Emerald (<50) or Amber (50-68)
          fillOpacity = 0.65;
        }

        const radius = Math.min(Math.max((db - 30) / 2.5, 8), 26);

        const circle = L.circleMarker([activity.lat, activity.lng], {
          radius,
          fillColor: color,
          fillOpacity,
          color: activity.activityState === 'active' ? '#FFFFFF' : color,
          weight: activity.activityState === 'active' ? 2 : 1.5,
        });

        circle.on('click', () => {
          onSelectNode({ reading, activity });
        });

        circle.addTo(markersLayerRef.current!);
      });
    } else {
      // Fallback: raw readings
      readings.forEach((reading) => {
        const getZoneColor = (db: number) => {
          if (db < 50) return '#10B981'; // Emerald
          if (db < 68) return '#F59E0B'; // Amber
          if (db < 85) return '#F97316'; // Orange
          return '#EF4444'; // Crimson
        };

        const color = getZoneColor(reading.db_avg);
        const radius = Math.min(Math.max((reading.db_avg - 30) / 2.5, 8), 26);

        const circle = L.circleMarker([reading.lat, reading.lng], {
          radius,
          fillColor: color,
          fillOpacity: 0.65,
          color,
          weight: 1.5,
        });

        circle.on('click', () => {
          onSelectNode({ reading });
        });

        circle.addTo(markersLayerRef.current!);
      });
    }

    // 2. Render Verified Incidents
    incidents.forEach((incident) => {
      const isLiveActive = incident.status === 'active';

      const incidentIcon = L.divIcon({
        className: 'custom-incident-icon',
        html: `
          <div class="relative flex items-center justify-center">
            ${isLiveActive ? '<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-75"></span>' : ''}
            <span class="relative inline-flex items-center justify-center rounded-full h-7 w-7 ${
              isLiveActive ? 'bg-rose-600 border-2 border-white shadow-glow-crimson' : 'bg-slate-600 border border-slate-300 opacity-75'
            } text-[10px] font-bold text-white font-mono">
              ${incident.avg_db.toFixed(0)}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([incident.center_lat, incident.center_lng], {
        icon: incidentIcon,
      });

      marker.on('click', () => {
        onSelectNode({ incident });
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [readings, gridActivities, incidents, onSelectNode]);

  const handleManualFallback = () => {
    if (mapInstanceRef.current) {
      MapConfigService.resetToDefault();
      const config = MapConfigService.getTileLayerConfig('stadia_dark');
      setActiveTileConfig(config);
      attachTileLayer(mapInstanceRef.current, config);
      setTileLoadError(null);
    }
  };

  return (
    <div className={`relative w-full h-[440px] sm:h-[520px] max-h-[75vh] rounded-xl overflow-hidden border border-paper-border dark:border-night-border shadow-md ${className}`}>
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-paper-200 dark:bg-night-bg" />

      {/* Non-blocking tile error notification banner */}
      {tileLoadError && (
        <div className="absolute top-3 inset-x-0 mx-auto w-[92%] max-w-md z-[500] p-2.5 rounded-lg bg-terracotta-50/95 dark:bg-night-surface/95 border border-terracotta-300 dark:border-rose-900/60 text-terracotta-900 dark:text-rose-200 text-xs font-mono shadow-xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta-600 dark:text-rose-400 flex-shrink-0" />
            <span className="text-[11px] leading-tight">{tileLoadError}</span>
          </div>
          <button
            onClick={handleManualFallback}
            className="px-2 py-1 bg-paper-100 dark:bg-night-card border border-paper-border dark:border-night-border rounded text-[10px] font-semibold text-graphite-900 dark:text-night-text hover:bg-paper-200 flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-forest-700 dark:text-teal-signal" />
            <span>USE STADIA</span>
          </button>
        </div>
      )}

      {/* Retro-vector crosshairs */}
      <span className="absolute top-2 left-2 font-mono text-xs text-stone-400 dark:text-slate-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute top-2 right-2 font-mono text-xs text-stone-400 dark:text-slate-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 left-2 font-mono text-xs text-stone-400 dark:text-slate-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 right-2 font-mono text-xs text-stone-400 dark:text-slate-600 z-10 select-none pointer-events-none">+</span>

      {/* Active Provider Indicator Badge & Locate Me Button */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-paper-50/90 dark:bg-night-surface/90 backdrop-blur-md border border-paper-border dark:border-night-border rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-graphite-800 dark:text-teal-300 pointer-events-none select-none flex items-center gap-1.5 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 dark:bg-teal-signal animate-pulse"></span>
          <span className="font-semibold tracking-wide">LAYER: {activeTileConfig.name}</span>
        </div>

        <button
          onClick={() => centerOnUserLocation(true)}
          disabled={isLocating}
          className="bg-paper-50/90 hover:bg-paper-100 dark:bg-night-surface/90 dark:hover:bg-night-card backdrop-blur-md border border-forest-600/40 hover:border-forest-700 dark:border-teal-500/40 hover:dark:border-teal-400 text-forest-800 dark:text-teal-300 rounded-lg px-3 py-1.5 font-mono text-[10px] font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
          title="Center Map on Live Location"
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 text-forest-600 dark:text-teal-signal animate-spin" />
          ) : (
            <Crosshair className="w-3 h-3 text-forest-700 dark:text-teal-signal" />
          )}
          <span>{isLocating ? 'LOCATING...' : 'LOCATE ME'}</span>
        </button>
      </div>

      {/* Geolocation status banner */}
      {locationStatus && (
        <div className="absolute top-12 left-3 z-10 bg-paper-50/95 dark:bg-night-surface/95 border border-forest-600/30 dark:border-teal-500/30 text-forest-800 dark:text-teal-200 rounded-lg px-2.5 py-1 font-mono text-[10px] shadow-md animate-in fade-in select-none pointer-events-none">
          {locationStatus}
        </div>
      )}

      {/* Map Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-paper-50/90 dark:bg-night-surface/90 backdrop-blur-md border border-paper-border dark:border-night-border rounded-xl p-3 font-mono text-[10px] space-y-1.5 shadow-xl pointer-events-none select-none text-graphite-800 dark:text-night-text">
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-paper-border/50 dark:border-night-border/70">
          <span className="text-stone-500 dark:text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">LIFECYCLE & SPECTRUM</span>
          <span className="text-[9px] text-forest-600 dark:text-teal-signal font-mono font-medium">15M WINDOW</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
          <span>&lt;50 dB Quiet &amp; Safe</span>
        </div>
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"></span>
          <span>50–68 dB Moderate Ambient</span>
        </div>
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
          <span>&ge;68 dB Active Noise Breach</span>
        </div>
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span>Pulsing Beacon (3+ Device Incident)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-400 opacity-60"></span>
          <span>Muted Gray (Stale Observation &gt;15m)</span>
        </div>
      </div>
    </div>
  );
};
