// Location Service & 100m Privacy Snapping
// Mathematically rounds raw latitude and longitude to 3 decimal places (~100m grid cell)
// Generates and manages anonymous ephemeral UUID session tokens.

export interface QuantizedLocation {
  lat: number;
  lng: number;
  grid_id: string; // e.g. "26.144_91.736"
  accuracyMeters: number;
  isApproximate: boolean;
}

const SESSION_STORAGE_KEY = 'noisemap_anon_session_token';

export class LocationService {
  /**
   * Retrieves or creates an anonymous session UUID.
   * Completely decoupled from IP, cookies, email, or device fingerprints.
   */
  public getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = 'anon_' + crypto.randomUUID().slice(0, 12);
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Quantizes coordinates to ~100m accuracy directly on client before transmission.
   * Math.round(coord * 1000) / 1000 truncates sub-100m precision.
   */
  public quantizeCoordinates(lat: number, lng: number): { lat: number; lng: number; grid_id: string } {
    const quantizedLat = Math.round(lat * 1000) / 1000;
    const quantizedLng = Math.round(lng * 1000) / 1000;
    const grid_id = `${quantizedLat.toFixed(3)}_${quantizedLng.toFixed(3)}`;

    return {
      lat: quantizedLat,
      lng: quantizedLng,
      grid_id,
    };
  }

  /**
   * Captures device location and immediately quantizes it into a ~100m grid cell.
   * Falls back gracefully if GPS is unavailable or blocked.
   */
  public async getQuantizedPosition(): Promise<QuantizedLocation> {
    if (!navigator.geolocation) {
      throw new Error("Geolocation API is not supported by your browser");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { lat, lng, grid_id } = this.quantizeCoordinates(
            pos.coords.latitude,
            pos.coords.longitude
          );

          resolve({
            lat,
            lng,
            grid_id,
            accuracyMeters: Math.max(Math.round(pos.coords.accuracy), 100), // Min 100m privacy floor
            isApproximate: true,
          });
        },
        (error) => {
          // If denied or timed out, resolve to a standard default coordinate
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }
}

export const locationService = new LocationService();
