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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class NoiseDataService {
  private static realtimeChannel: any = null;
  private static listeners: Set<(reading: NoiseReading) => void> = new Set();
  private static isSubscribed: boolean = false;

  /**
   * Initializes or returns the Supabase Realtime WebSocket channel for instant (<200ms) multi-user synchronization
   */
  public static initRealtimeChannel(): any {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    if (this.realtimeChannel) {
      return this.realtimeChannel;
    }

    const channel = supabase.channel('noisemap_live_feed', {
      config: {
        broadcast: { self: false },
      },
    });

    // 1. Direct WebSocket broadcast listener (< 50ms peer-to-peer relay)
    channel.on(
      'broadcast' as any,
      { event: 'reading_submitted' },
      (payload: { payload?: NoiseReading }) => {
        if (payload?.payload) {
          this.handleIncomingReading(payload.payload);
        }
      }
    );

    // 2. PostgreSQL CDC Realtime changes listener
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'noise_readings' },
      (payload: any) => {
        if (payload?.new) {
          const row = payload.new;
          const reading: NoiseReading = {
            id: row.id,
            session_id: row.session_id,
            lat: Number(row.lat),
            lng: Number(row.lng),
            grid_id: row.grid_id || `${Number(row.lat).toFixed(3)}_${Number(row.lng).toFixed(3)}`,
            db_avg: Number(row.db_avg),
            db_peak: Number(row.db_peak),
            source_type: row.source_type,
            zone_type: row.zone_type,
            created_at: row.created_at,
          };
          this.handleIncomingReading(reading);
        }
      }
    );

    channel.subscribe((status: string) => {
      this.isSubscribed = status === 'SUBSCRIBED';
      console.log('[NoiseDataService] Realtime channel status:', status);
    });

    this.realtimeChannel = channel;
    return channel;
  }

  /**
   * Handles incoming realtime reading from WebSocket or Postgres CDC
   */
  private static handleIncomingReading(reading: NoiseReading): void {
    const current = this.getAllReadings();
    if (current.some((r) => r.id === reading.id)) {
      return;
    }

    const updated = this.sortReadingsNewestFirst([reading, ...current]);
    this.saveReadings(updated);

    this.listeners.forEach((listener) => {
      try {
        listener(reading);
      } catch (e) {
        console.warn('[NoiseDataService] Listener error:', e);
      }
    });
  }

  /**
   * Subscribes a listener to live incoming readings via WebSockets
   * Returns an unsubscription callback
   */
  public static subscribeToLiveReadings(listener: (reading: NoiseReading) => void): () => void {
    this.listeners.add(listener);
    this.initRealtimeChannel();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.realtimeChannel && supabase) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
        this.isSubscribed = false;
      }
    };
  }

  /**
   * Fetches latest remote readings from Supabase and merges them into local storage
   */
  public static async fetchRemoteReadings(): Promise<NoiseReading[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return this.getAllReadings();
    }

    try {
      const { data, error } = await supabase
        .from('noise_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) {
        console.warn('[NoiseDataService] Error querying cloud readings:', error);
        return this.getAllReadings();
      }

      const cloudReadings: NoiseReading[] = data.map((row: any) => ({
        id: row.id,
        session_id: row.session_id,
        lat: Number(row.lat),
        lng: Number(row.lng),
        grid_id: row.grid_id || `${Number(row.lat).toFixed(3)}_${Number(row.lng).toFixed(3)}`,
        db_avg: Number(row.db_avg),
        db_peak: Number(row.db_peak),
        source_type: row.source_type,
        zone_type: row.zone_type,
        created_at: row.created_at,
      }));

      const local = this.getAllReadings();
      const readingMap = new Map<string, NoiseReading>();
      local.forEach((r) => readingMap.set(r.id, r));
      cloudReadings.forEach((r) => readingMap.set(r.id, r));

      const merged = this.sortReadingsNewestFirst(Array.from(readingMap.values()));
      this.saveReadings(merged);
      return merged;
    } catch (err) {
      console.warn('[NoiseDataService] Network error fetching cloud readings:', err);
      return this.getAllReadings();
    }
  }

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
   * Checks if the WebSocket channel is currently connected and active
   */
  public static isRealtimeConnected(): boolean {
    return this.isSubscribed;
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

    // 2. If Supabase is configured, broadcast via WebSocket and sync to cloud
    if (isSupabaseConfigured() && supabase) {
      // 2a. Broadcast immediately across connected WebSocket clients (<50ms)
      try {
        const channel = this.initRealtimeChannel();
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'reading_submitted',
            payload: reading,
          });
        }
      } catch (broadcastErr) {
        console.warn('[NoiseDataService] Realtime broadcast warning:', broadcastErr);
      }

      // 2b. Persist to Postgres database
      try {
        const payload: Record<string, any> = {
          session_id: reading.session_id,
          lat: reading.lat,
          lng: reading.lng,
          db_avg: reading.db_avg,
          db_peak: reading.db_peak,
          source_type: reading.source_type,
          zone_type: reading.zone_type,
        };

        // Only supply ID if it is a valid UUID, otherwise Postgres will auto-generate one
        if (UUID_REGEX.test(reading.id)) {
          payload.id = reading.id;
        }

        const { error } = await supabase.from('noise_readings').insert([payload]);
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
