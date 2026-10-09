import { UserPin, NoiseIncident } from '../types';
import { IncidentEngine } from './incidentEngine';

const PINS_STORAGE_KEY = 'noisemap_user_pins';

export class NotificationService {
  /**
   * Retrieves saved pinned zones from localStorage
   */
  public static getSavedPins(): UserPin[] {
    try {
      const data = localStorage.getItem(PINS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Could not parse saved pins:", e);
    }

    // Default sample pins
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
   * Saves pinned zones to localStorage
   */
  public static savePins(pins: UserPin[]): void {
    localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
  }

  /**
   * Evaluates active incidents against pinned zones and returns breaches
   */
  public static evaluateBreaches(
    pins: UserPin[],
    incidents: NoiseIncident[]
  ): { pin: UserPin; incident: NoiseIncident; excessDb: number }[] {
    const breaches: { pin: UserPin; incident: NoiseIncident; excessDb: number }[] = [];

    pins.forEach((pin) => {
      incidents.forEach((inc) => {
        if (inc.status !== 'active') return;

        // Check if incident center is within 500m of the pin
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
          });
        }
      });
    });

    return breaches;
  }

  /**
   * Requests browser native notification permissions and dispatches alert
   */
  public static async dispatchPushAlert(title: string, body: string): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/radar-icon.svg',
      });
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/radar-icon.svg',
        });
        return true;
      }
    }

    return false;
  }
}
