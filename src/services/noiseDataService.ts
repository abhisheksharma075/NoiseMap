import { NoiseReading, NoiseIncident } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IncidentEngine } from './incidentEngine';

const READINGS_STORAGE_KEY = 'noisemap_readings_store';

const DEFAULT_BASELINE_READINGS: NoiseReading[] = [
  {
    id: 'demo-1',
    session_id: 'anon_demo1',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 82.4,
    db_peak: 94.1,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'demo-2',
    session_id: 'anon_demo2',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 84.2,
    db_peak: 91.5,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'demo-3',
    session_id: 'anon_demo3',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 80.7,
    db_peak: 88.0,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: 'demo-4',
    session_id: 'anon_demo4',
    lat: 26.148,
    lng: 91.741,
    grid_id: '26.148_91.741',
    db_avg: 74.2,
    db_peak: 83.5,
    source_type: 'construction',
    zone_type: 'residential',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'demo-5',
    session_id: 'anon_demo5',
    lat: 26.141,
    lng: 91.731,
    grid_id: '26.141_91.731',
    db_avg: 48.7,
    db_peak: 54.0,
    source_type: 'unknown',
    zone_type: 'silence',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

export class NoiseDataService {
  /**
   * Sorts readings chronologically: newest reading strictly first
   */
  public static sortReadingsNewestFirst(readings: NoiseReading[]): NoiseReading[] {
    return [...readings].sort((a, b) => {
      const timeDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.id.localeCompare(a.id);
    });
  }

  /**
   * Checks if app is operating in Cloud mode or Autonomous Offline Demo mode
   */
  public static isCloudMode(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Retrieves all readings from local storage with fallback to baseline demo readings
   */
  public static getAllReadings(): NoiseReading[] {
    try {
      const stored = localStorage.getItem(READINGS_STORAGE_KEY);
      if (stored) {
        const parsed: NoiseReading[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.sortReadingsNewestFirst(parsed);
        }
      }
    } catch (e) {
      console.warn('[NoiseDataService] Failed to read from localStorage:', e);
    }

    // Initialize with sorted baseline readings if storage empty
    const baseline = this.sortReadingsNewestFirst(DEFAULT_BASELINE_READINGS);
    this.saveReadings(baseline);
    return baseline;
  }

  /**
   * Saves readings to localStorage
   */
  public static saveReadings(readings: NoiseReading[]): void {
    try {
      const sorted = this.sortReadingsNewestFirst(readings);
      localStorage.setItem(READINGS_STORAGE_KEY, JSON.stringify(sorted));
    } catch (e) {
      console.warn('[NoiseDataService] Failed to persist readings:', e);
    }
  }

  /**
   * Submits a noise reading to either Supabase or local memory with persistent fallback
   */
  public static async submitReading(reading: NoiseReading): Promise<void> {
    // 1. Always persist to localStorage for instant offline consistency
    const current = this.getAllReadings();
    const updated = this.sortReadingsNewestFirst([reading, ...current]);
    this.saveReadings(updated);

    // 2. If Supabase is configured, sync to cloud
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('noise_readings').insert([
          {
            id: reading.id,
            session_id: reading.session_id,
            lat: reading.lat,
            lng: reading.lng,
            db_avg: reading.db_avg,
            db_peak: reading.db_peak,
            source_type: reading.source_type,
            zone_type: reading.zone_type,
          },
        ]);
        if (error) {
          console.warn('[NoiseDataService] Supabase insertion warning, local copy active:', error);
        }
      } catch (err) {
        console.warn('[NoiseDataService] Network error during Supabase sync:', err);
      }
    }
  }

  /**
   * Resets local storage to default baseline readings
   */
  public static resetToBaseline(): NoiseReading[] {
    const baseline = this.sortReadingsNewestFirst(DEFAULT_BASELINE_READINGS);
    this.saveReadings(baseline);
    return baseline;
  }

  /**
   * Generates a simulated 3-citizen cluster in a specific sector
   */
  public static generateSimulatedCluster(
    baseLat: number = 26.144,
    baseLng: number = 91.736,
    avgDb: number = 84.5
  ): { readings: NoiseReading[]; incident: NoiseIncident } {
    const gridId = `${baseLat.toFixed(3)}_${baseLng.toFixed(3)}`;
    const now = Date.now();

    const simReadings: NoiseReading[] = [
      {
        id: 'sim_' + crypto.randomUUID().slice(0, 8),
        session_id: 'citizen_alpha_' + Math.random().toString(36).substring(7),
        lat: baseLat,
        lng: baseLng,
        grid_id: gridId,
        db_avg: avgDb - 1.2,
        db_peak: avgDb + 8.4,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date(now - 6 * 60000).toISOString(),
      },
      {
        id: 'sim_' + crypto.randomUUID().slice(0, 8),
        session_id: 'citizen_beta_' + Math.random().toString(36).substring(7),
        lat: baseLat,
        lng: baseLng,
        grid_id: gridId,
        db_avg: avgDb + 1.8,
        db_peak: avgDb + 11.2,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date(now - 3 * 60000).toISOString(),
      },
      {
        id: 'sim_' + crypto.randomUUID().slice(0, 8),
        session_id: 'citizen_gamma_' + Math.random().toString(36).substring(7),
        lat: baseLat,
        lng: baseLng,
        grid_id: gridId,
        db_avg: avgDb,
        db_peak: avgDb + 9.0,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date(now).toISOString(),
      },
    ];

    const incidents = IncidentEngine.clusterReadings(simReadings);
    return {
      readings: simReadings,
      incident: incidents[0],
    };
  }
}
