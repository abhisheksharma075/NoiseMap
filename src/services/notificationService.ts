/**
 * NoiseMap Notification & Geofenced Push Alert Service
 * 
 * ZERO-RAW-AUDIO PRIVACY ARCHITECTURE:
 * Alerts strictly operate on derived scalar telemetry (dBA average, dBA peak,
 * spatial bounding boxes, and timestamp deltas). Absolutely zero raw audio data,
 * waveform buffers, or microphone recordings are processed, stored, or dispatched
 * by this service.
 */

import { UserPin, NoiseIncident } from '../types';
import { IncidentEngine } from './incidentEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PINS_STORAGE_KEY = 'noisemap_user_pins';
const ALERT_HISTORY_KEY = 'noisemap_dispatched_alert_history';
const ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15-minute suppression window to prevent notification spam
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface GeofenceBreach {
  pin: UserPin;
  incident: NoiseIncident;
  excessDb: number;
  distanceMeters: number;
}

export interface PushAlertOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  vibrate?: number[];
  actions?: { action: string; title: string }[];
  requireInteraction?: boolean;
}

export class NotificationService {
  /**
   * Retrieves saved pinned zones from localStorage with baseline default pins
   */
  public static getSavedPins(): UserPin[] {
    try {
      const data = localStorage.getItem(PINS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[NotificationService] Failed to parse saved pins:', e);
    }

    // Default sample pins for first-time session
    return [
      {
        id: 'pin_home',
        session_id: 'local_user',
        label: 'Home Residence',
        lat: 26.144,
        lng: 91.736,
        threshold_db: 65,
        created_at: new Date().toISOString(),
      },
      {
        id: 'pin_school',
        session_id: 'local_user',
        label: 'Primary School Zone',
        lat: 26.141,
        lng: 91.731,
        threshold_db: 50,
        created_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Saves pinned zones to localStorage and syncs with Supabase if configured
   */
  public static savePins(pins: UserPin[]): void {
    try {
      localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
    } catch (e) {
      console.warn('[NotificationService] Failed to persist pins:', e);
    }

    // Cloud sync to user_pins table
    if (isSupabaseConfigured() && supabase) {
      this.syncPinsToCloud(pins).catch((err) => {
        console.warn('[NotificationService] Cloud sync pins warning:', err);
      });
    }
  }

  /**
   * Background cloud synchronization for pins
   */
  private static async syncPinsToCloud(pins: UserPin[]): Promise<void> {
    if (!supabase) return;
    try {
      for (const pin of pins) {
        const payload: Record<string, any> = {
          session_id: pin.session_id || 'local_user',
          label: pin.label,
          lat: pin.lat,
          lng: pin.lng,
          threshold_db: pin.threshold_db,
        };
        if (UUID_REGEX.test(pin.id)) {
          payload.id = pin.id;
        }
        await supabase.from('user_pins').upsert([payload], { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[NotificationService] Error syncing pins to Supabase:', e);
    }
  }

  /**
   * Evaluates active incidents against pinned zones and returns mathematical breaches
   */
  public static evaluateBreaches(
    pins: UserPin[],
    incidents: NoiseIncident[]
  ): GeofenceBreach[] {
    const breaches: GeofenceBreach[] = [];

    pins.forEach((pin) => {
      incidents.forEach((inc) => {
        if (inc.status !== 'active') return;

        // Check if incident center is within 500m of the user pin
        const distance = IncidentEngine.getDistanceMeters(
          pin.lat,
          pin.lng,
          inc.center_lat,
          inc.center_lng
        );

        if (distance <= 500 && inc.avg_db > pin.threshold_db) {
          breaches.push({
            pin,
            incident: inc,
            excessDb: Math.round((inc.avg_db - pin.threshold_db) * 10) / 10,
            distanceMeters: Math.round(distance),
          });
        }
      });
    });

    return breaches;
  }

  /**
   * Retrieves alert history map to prevent duplicate notification spamming
   */
  private static getAlertHistory(): Record<string, number> {
    try {
      const stored = localStorage.getItem(ALERT_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[NotificationService] Failed to read alert history:', e);
    }
    return {};
  }

  /**
   * Records a dispatched alert timestamp for cooldown tracking
   */
  private static recordDispatchedAlert(pinId: string, incidentId: string): void {
    try {
      const history = this.getAlertHistory();
      const key = `${pinId}_${incidentId}`;
      history[key] = Date.now();
      localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('[NotificationService] Failed to record alert history:', e);
    }
  }

  /**
   * Clears alert history (useful for testing or resetting session)
   */
  public static clearAlertHistory(): void {
    localStorage.removeItem(ALERT_HISTORY_KEY);
  }

  /**
   * Evaluates breaches, respects cooldown, dispatches push alerts, and logs events
   * Returns array of newly dispatched breaches
   */
  public static async checkAndDispatchBreaches(
    pins: UserPin[],
    incidents: NoiseIncident[]
  ): Promise<GeofenceBreach[]> {
    const breaches = this.evaluateBreaches(pins, incidents);
    const history = this.getAlertHistory();
    const now = Date.now();
    const newlyDispatched: GeofenceBreach[] = [];

    for (const breach of breaches) {
      const key = `${breach.pin.id}_${breach.incident.id}`;
      const lastAlertTime = history[key] || 0;

      // Check if cooldown has expired (15 minutes)
      if (now - lastAlertTime > ALERT_COOLDOWN_MS) {
        const sent = await this.dispatchBreachAlert(breach);
        if (sent) {
          this.recordDispatchedAlert(breach.pin.id, breach.incident.id);
          newlyDispatched.push(breach);
          this.logAlertToSupabase(breach).catch((err) => {
            console.warn('[NotificationService] Cloud alert logging warning:', err);
          });
        }
      }
    }

    return newlyDispatched;
  }

  /**
   * Dispatches a formatted threshold breach alert for a specific geofenced pin
   */
  public static async dispatchBreachAlert(breach: GeofenceBreach): Promise<boolean> {
    const title = `🚨 NOISE BREACH: ${breach.pin.label}`;
    const body = `${breach.incident.avg_db} dB detected ${breach.distanceMeters}m from zone (+${breach.excessDb} dB over ${breach.pin.threshold_db} dB limit). Dominant: ${breach.incident.dominant_source.toUpperCase()}.`;

    return this.dispatchPushAlert(title, {
      body,
      tag: `breach_${breach.pin.id}`,
      requireInteraction: true,
      data: {
        url: '/?tab=map',
        incident_id: breach.incident.id,
        pin_id: breach.pin.id,
        excessDb: breach.excessDb,
      },
    });
  }

  /**
   * Logs alert record to Supabase user_alerts table for civic tracking
   */
  private static async logAlertToSupabase(breach: GeofenceBreach): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const payload: Record<string, any> = {
        session_id: breach.pin.session_id || 'local_user',
        threshold_db: breach.pin.threshold_db,
      };

      if (UUID_REGEX.test(breach.incident.id)) {
        payload.incident_id = breach.incident.id;
      }
      if (UUID_REGEX.test(breach.pin.id)) {
        payload.pin_id = breach.pin.id;
      }

      await supabase.from('user_alerts').insert([payload]);
    } catch (e) {
      console.warn('[NotificationService] Error logging alert to Supabase:', e);
    }
  }

  /**
   * Gets current browser notification permission status
   */
  public static getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Prompts the user for browser native notification permissions
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.requestPermission();
  }

  /**
   * Dispatches browser native notification via Service Worker (preferred for PWA/Mobile)
   * with automatic fallback to desktop window Notification API.
   */
  public static async dispatchPushAlert(
    title: string,
    bodyOrOptions?: string | PushAlertOptions
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    const options: PushAlertOptions =
      typeof bodyOrOptions === 'string'
        ? { body: bodyOrOptions }
        : bodyOrOptions || {};

    // 1. Verify or request permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return false;
    }

    const notificationPayload = {
      body: options.body || '',
      icon: options.icon || '/radar-icon.svg',
      badge: options.badge || '/radar-icon.svg',
      tag: options.tag || 'noisemap-alert',
      vibrate: options.vibrate || [200, 100, 200, 100, 200],
      requireInteraction: options.requireInteraction ?? false,
      data: options.data || { url: '/?tab=map' },
      actions: options.actions || [
        { action: 'explore', title: 'Open Radar Map' },
        { action: 'close', title: 'Dismiss' },
      ],
    };

    // 2. Try Service Worker registration first (standard modern PWA & mobile compliance)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, notificationPayload as NotificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('[NotificationService] ServiceWorker showNotification failed, falling back to window Notification:', swErr);
      }
    }

    // 3. Fallback to desktop window Notification constructor
    try {
      new Notification(title, {
        body: notificationPayload.body,
        icon: notificationPayload.icon,
        tag: notificationPayload.tag,
      });
      return true;
    } catch (windowErr) {
      console.warn('[NotificationService] Window Notification constructor failed:', windowErr);
      return false;
    }
  }
}
