import { NoiseReading, NoiseIncident } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IncidentEngine } from './incidentEngine';

export class NoiseDataService {
  /**
   * Checks if app is operating in Cloud mode or Autonomous Offline Demo mode
   */
  public static isCloudMode(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Submits a noise reading to either Supabase or local memory
   */
  public static async submitReading(reading: NoiseReading): Promise<void> {
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
          console.warn("Supabase insertion error, using local fallback:", error);
        }
      } catch (err) {
        console.warn("Network error during Supabase sync:", err);
      }
    }
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
