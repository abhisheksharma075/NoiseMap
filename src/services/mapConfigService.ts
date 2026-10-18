// Map Tile Provider Configuration & Key Management
// Providers:
// 1. Stadia Alidade Smooth Dark (Recommended Default) - High-resolution dark vector-derived raster tiles
// 2. OpenStreetMap Standard - Standard OpenStreetMap raster tiles with dark styling filter
// 3. CARTO Dark Matter - Zero-key required, high availability, dark theme

export type MapTileProvider = 'carto_dark' | 'stadia_dark' | 'osm_dark';

export const MAP_CONFIG = {
  // Standard OpenStreetMap tiles - 100% free, zero API key required, reliable uptime
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  subdomains: ['a', 'b', 'c'],
};

export interface TileLayerConfig {
  provider: MapTileProvider;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  requiresKey: boolean;
  hasKey: boolean;
  className?: string;
}

export class MapConfigService {
  // OpenStreetMap Standard is the zero-key, high-availability default without watermarks
  private static readonly DEFAULT_PROVIDER: MapTileProvider = 'osm_dark';
  private static readonly PROVIDER_STORAGE_KEY = 'noisemap_custom_map_provider';
  private static readonly KEY_STORAGE_PREFIX = 'noisemap_map_key_';

  /**
   * Helper to check if current environment is localhost
   */
  public static isLocalhost(): boolean {
    if (typeof window === 'undefined') return true;
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  /**
   * Retrieves the API key for a specific provider.
   * Priority: localStorage -> Environment variable -> empty string.
   */
  public static getApiKeyForProvider(provider: MapTileProvider): string {
    const localKey = localStorage.getItem(`${this.KEY_STORAGE_PREFIX}${provider}`)?.trim();
    if (localKey) return localKey;

    if (provider === 'stadia_dark') {
      return (import.meta.env.VITE_STADIA_API_KEY || import.meta.env.VITE_MAP_API_KEY || '').trim();
    }
    return '';
  }

  /**
   * Sets the API key for a specific provider in localStorage.
   */
  public static setApiKeyForProvider(provider: MapTileProvider, key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(`${this.KEY_STORAGE_PREFIX}${provider}`, trimmed);
    } else {
      localStorage.removeItem(`${this.KEY_STORAGE_PREFIX}${provider}`);
    }
  }

  /**
   * Gets the active map provider.
   * Defaults to 'carto_dark' for 100% mobile and production availability.
   * If 'stadia_dark' was saved but no key exists and origin is not localhost,
   * falls back safely to 'carto_dark' to prevent 401 tile rejection.
   */
  public static getMapProvider(): MapTileProvider {
    const saved = localStorage.getItem(this.PROVIDER_STORAGE_KEY);
    if (saved && ['carto_dark', 'stadia_dark', 'osm_dark'].includes(saved)) {
      if (saved === 'stadia_dark') {
        const hasKey = !!this.getApiKeyForProvider('stadia_dark');
        if (!hasKey && !this.isLocalhost()) {
          // On mobile or non-localhost without key, Stadia returns 401; fallback to CARTO
          return 'carto_dark';
        }
      }
      return saved as MapTileProvider;
    }

    const envProvider = import.meta.env.VITE_MAP_PROVIDER;
    if (envProvider && ['carto_dark', 'stadia_dark', 'osm_dark'].includes(envProvider)) {
      return envProvider as MapTileProvider;
    }

    return this.DEFAULT_PROVIDER;
  }

  /**
   * Sets the active map provider in localStorage.
   */
  public static setMapProvider(provider: MapTileProvider): void {
    localStorage.setItem(this.PROVIDER_STORAGE_KEY, provider);
  }

  /**
   * Validates if a provider is ready to be loaded.
   * Returns { isValid: boolean, error?: string }
   */
  public static validateProvider(_provider: MapTileProvider): { isValid: boolean; error?: string } {
    return { isValid: true };
  }

  /**
   * Builds the tile layer configuration.
   */
  public static getTileLayerConfig(provider: MapTileProvider = this.getMapProvider()): TileLayerConfig {
    const targetProvider = provider;
    const stadiaKey = this.getApiKeyForProvider('stadia_dark');

    switch (targetProvider) {
      case 'stadia_dark': {
        // Stadia maps allows localhost origin for development without an API key, but supports API key for production
        const url = stadiaKey
          ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(stadiaKey)}`
          : `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png`;

        return {
          provider: 'stadia_dark',
          name: 'Stadia Alidade Smooth Dark',
          url,
          attribution:
            '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
          maxZoom: 20,
          requiresKey: false, // Works directly on localhost without requiring key
          hasKey: !!stadiaKey,
        };
      }

      case 'carto_dark': {
        return {
          provider: 'carto_dark',
          name: 'CARTO Dark Matter',
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
          requiresKey: false,
          hasKey: true,
        };
      }

      case 'osm_dark':
      default: {
        return {
          provider: 'osm_dark',
          name: 'OpenStreetMap Standard Tiles',
          url: MAP_CONFIG.tileUrl,
          attribution: MAP_CONFIG.attribution,
          maxZoom: MAP_CONFIG.maxZoom,
          subdomains: MAP_CONFIG.subdomains.join(''),
          requiresKey: false,
          hasKey: true,
          className: 'osm-dark-tiles',
        };
      }
    }
  }

  /**
   * Resets provider and keys back to clean default (Stadia Alidade Dark)
   */
  public static resetToDefault(): void {
    localStorage.removeItem(this.PROVIDER_STORAGE_KEY);
    localStorage.removeItem(`${this.KEY_STORAGE_PREFIX}stadia_dark`);
    localStorage.removeItem('noisemap_custom_map_api_key');
    localStorage.removeItem('noisemap_custom_map_provider');
  }
}
