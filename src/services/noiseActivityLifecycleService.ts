import { NoiseReading, NoiseIncident } from '../types';
import { AUDIO_CONFIG } from '../config/audioThresholds';

export type NoiseActivityState = 'active' | 'quiet' | 'stale' | 'resolved';

export interface LiveGridActivity {
  grid_id: string;
  lat: number;
  lng: number;
  latestReading: NoiseReading;
  activityState: NoiseActivityState;
  ageMinutes: number;
  isFresh: boolean;
  isElevated: boolean;
  totalObservations: number;
  historicalReadings: NoiseReading[];
}

export class NoiseActivityLifecycleService {
  /**
   * Calculate the elapsed age in decimal minutes between a measurement timestamp and the current time.
   * Handles ISO strings, millisecond numbers, invalid timestamps, and future clock drift safely.
   */
  public static getMeasurementAgeMinutes(
    timestamp: string | number | undefined | null,
    now: number = Date.now()
  ): number {
    if (!timestamp) return Infinity;

    const timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();

    // Invalid timestamp check (e.g. invalid date format or NaN)
    if (Number.isNaN(timeMs) || !Number.isFinite(timeMs) || timeMs <= 0) {
      return Infinity;
    }

    const elapsedMs = now - timeMs;

    // Handle minor client clock skew / future timestamps (up to 30s) gracefully
    if (elapsedMs < -30000) {
      // Significantly in the future -> invalid
      return Infinity;
    }

    return Math.max(0, elapsedMs / 60000);
  }

  /**
   * Determine whether a measurement is within the active freshness window.
   */
  public static isMeasurementFresh(
    timestamp: string | number | undefined | null,
    now: number = Date.now(),
    windowMinutes: number = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
  ): boolean {
    const age = this.getMeasurementAgeMinutes(timestamp, now);
    return Number.isFinite(age) && age <= windowMinutes;
  }

  /**
   * Aggregates raw noise readings by geographical grid cell (~100m privacy sector).
   * 
   * CRITICAL GUARANTEE:
   * For any grid cell, the newest measurement by timestamp ALWAYS takes precedence.
   * A late-arriving older reading (e.g. from network latency) will NEVER overwrite
   * a newer measurement.
   */
  public static aggregateGridActivity(
    readings: NoiseReading[],
    now: number = Date.now(),
    windowMinutes: number = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
  ): LiveGridActivity[] {
    if (!readings || readings.length === 0) {
      return [];
    }

    // 1. Group readings by grid_id (or quantize coordinates if grid_id is missing)
    const gridMap = new Map<string, NoiseReading[]>();

    readings.forEach((reading) => {
      // Validate coordinates and numbers
      if (!Number.isFinite(reading.lat) || !Number.isFinite(reading.lng)) {
        return;
      }

      const gridId = reading.grid_id || `${reading.lat.toFixed(3)}_${reading.lng.toFixed(3)}`;
      const list = gridMap.get(gridId) || [];
      list.push(reading);
      gridMap.set(gridId, list);
    });

    const activities: LiveGridActivity[] = [];

    // 2. Evaluate each grid cell based on its newest observation
    gridMap.forEach((gridReadings, gridId) => {
      // Filter out invalid timestamps
      const validReadings = gridReadings.filter((r) => {
        const timeMs = new Date(r.created_at).getTime();
        return !Number.isNaN(timeMs) && timeMs > 0;
      });

      if (validReadings.length === 0) {
        return;
      }

      // Sort strictly newest-first by measurement timestamp
      validReadings.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // The first element is the newest relevant observation
      const latestReading = validReadings[0];
      const ageMinutes = this.getMeasurementAgeMinutes(latestReading.created_at, now);
      const isFresh = ageMinutes <= windowMinutes;
      const isElevated = latestReading.db_avg >= AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD;

      // 3. Determine Noise Activity State
      let activityState: NoiseActivityState;
      if (isFresh) {
        if (isElevated) {
          activityState = 'active'; // Fresh & elevated noise (>= 68 dB)
        } else {
          activityState = 'quiet'; // Fresh & below incident threshold (< 68 dB)
        }
      } else {
        activityState = 'stale'; // Expired past the active window (> 15 mins)
      }

      activities.push({
        grid_id: gridId,
        lat: latestReading.lat,
        lng: latestReading.lng,
        latestReading,
        activityState,
        ageMinutes: Math.round(ageMinutes * 10) / 10,
        isFresh,
        isElevated,
        totalObservations: validReadings.length,
        historicalReadings: validReadings,
      });
    });

    // Sort by latest measurement timestamp descending
    return activities.sort((a, b) => {
      return (
        new Date(b.latestReading.created_at).getTime() -
        new Date(a.latestReading.created_at).getTime()
      );
    });
  }

  /**
   * Filters and classifies grid activities for live or historical map display.
   * In 'live' mode, only returns fresh observations (active + quiet).
   * In historical modes ('1h', '24h', '7d', 'all'), includes stale observations.
   */
  public static filterActivitiesByTime(
    activities: LiveGridActivity[],
    timeFilter: 'live' | '1h' | '24h' | '7d' | 'all',
    windowMinutes: number = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
  ): LiveGridActivity[] {
    switch (timeFilter) {
      case 'live':
        // Only fresh measurements within the active window (15m)
        return activities.filter((act) => act.ageMinutes <= windowMinutes);
      case '1h':
        return activities.filter((act) => act.ageMinutes <= 60);
      case '24h':
        return activities.filter((act) => act.ageMinutes <= 1440);
      case '7d':
        return activities.filter((act) => act.ageMinutes <= 10080);
      case 'all':
      default:
        return activities;
    }
  }

  /**
   * Synchronizes incident active vs resolved status based on evidence freshness.
   * Incidents with evidence older than the active window transition to 'resolved'
   * so they do not pulse as live beacons on the map forever.
   */
  public static evaluateIncidentFreshness(
    incidents: NoiseIncident[],
    now: number = Date.now(),
    windowMinutes: number = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
  ): NoiseIncident[] {
    return incidents.map((inc) => {
      const ageMinutes = this.getMeasurementAgeMinutes(inc.last_seen_at || inc.created_at, now);
      const isFresh = ageMinutes <= windowMinutes;

      // If an active incident has no fresh evidence past the window, transition to 'resolved'
      if (!isFresh && inc.status === 'active') {
        return {
          ...inc,
          status: 'resolved' as const,
        };
      }

      return inc;
    });
  }
}
