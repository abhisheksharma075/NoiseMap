// Map Tile Provider Configuration & Key Management
// Providers:
// 1. CARTO Dark Matter (Default) - Zero-key required, high availability, dark theme
// 2. Stadia Alidade Smooth Dark - Works on localhost, requires key on remote production domains
// 3. MapTiler Dataviz Dark - Requires a valid personal MapTiler API key
// 4. OpenStreetMap Standard - Standard OpenStreetMap raster tiles with dark styling filter

export type MapTileProvider = 'carto_dark' | 'stadia_dark' | 'maptiler_dark' | 'osm_dark';

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
  private static readonly DEFAULT_PROVIDER: MapTileProvider = 'carto_dark';
  private static readonly PROVIDER_STORAGE_KEY = 'noisemap_custom_map_provider';
  private static readonly KEY_STORAGE_PREFIX = 'noisemap_map_key_';

  /**
   * Retrieves the API key for a specific provider.
   * Priority: localStorage -> Environment variable -> empty string.
   */
  public static getApiKeyForProvider(provider: MapTileProvider): string {
    const localKey = localStorage.getItem(`${this.KEY_STORAGE_PREFIX}${provider}`)?.trim();
    if (localKey) return localKey;

    if (provider === 'maptiler_dark') {
      return (import.meta.env.VITE_MAPTILER_API_KEY || import.meta.env.VITE_MAP_API_KEY || '').trim();
    }
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
   * Defaults to 'carto_dark' for reliability.
   */
  public static getMapProvider(): MapTileProvider {
    const saved = localStorage.getItem(this.PROVIDER_STORAGE_KEY);
    if (saved && ['carto_dark', 'stadia_dark', 'maptiler_dark', 'osm_dark'].includes(saved)) {
      return saved as MapTileProvider;
    }

    const envProvider = import.meta.env.VITE_MAP_PROVIDER;
    if (envProvider && ['carto_dark', 'stadia_dark', 'maptiler_dark', 'osm_dark'].includes(envProvider)) {
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
  public static validateProvider(provider: MapTileProvider): { isValid: boolean; error?: string } {
    if (provider === 'maptiler_dark') {
      const key = this.getApiKeyForProvider('maptiler_dark');
      if (!key) {
        return {
          isValid: false,
          error: 'MapTiler requires a personal API key. Get a free key at cloud.maptiler.com or switch to CARTO Dark Matter.',
        };
      }
      if (key === 'get_your_free_key' || key.toLowerCase().includes('placeholder') || key.length < 8) {
        return {
          isValid: false,
          error: 'The entered MapTiler API key appears to be a placeholder. Please enter a valid key from cloud.maptiler.com.',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Builds the tile layer configuration.
   * If a provider lacks its required key, automatically falls back to 'carto_dark'.
   */
  public static getTileLayerConfig(provider: MapTileProvider = this.getMapProvider()): TileLayerConfig {
    const targetProvider = provider;
    const maptilerKey = this.getApiKeyForProvider('maptiler_dark');
    const stadiaKey = this.getApiKeyForProvider('stadia_dark');

    switch (targetProvider) {
      case 'maptiler_dark': {
        const validation = this.validateProvider('maptiler_dark');
        if (!validation.isValid) {
          // Fall back gracefully to CARTO Dark Matter so user never sees a broken screen
          console.warn(`[NoiseMap MapConfig] MapTiler key missing or invalid. Falling back to CARTO Dark Matter.`);
          return {
            ...this.getTileLayerConfig('carto_dark'),
            requiresKey: true,
            hasKey: false,
          };
        }

        return {
          provider: 'maptiler_dark',
          name: 'MapTiler Dataviz Dark',
          url: `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${encodeURIComponent(maptilerKey)}`,
          attribution:
            '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
          maxZoom: 19,
          requiresKey: true,
          hasKey: true,
        };
      }

      case 'stadia_dark': {
        // Stadia maps allows localhost origin for development without an API key, but requires one for remote domains
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
          requiresKey: false, // Optional on localhost
          hasKey: !!stadiaKey,
        };
      }

      case 'osm_dark': {
        return {
          provider: 'osm_dark',
          name: 'OpenStreetMap (Inverted Dark Filter)',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
          maxZoom: 19,
          subdomains: 'abc',
          requiresKey: false,
          hasKey: true,
          className: 'osm-dark-tiles',
        };
      }

      case 'carto_dark':
      default: {
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
    }
  }

  /**
   * Resets provider and keys back to clean default (CARTO Dark Matter)
   */
  public static resetToDefault(): void {
    localStorage.removeItem(this.PROVIDER_STORAGE_KEY);
    localStorage.removeItem(`${this.KEY_STORAGE_PREFIX}maptiler_dark`);
    localStorage.removeItem(`${this.KEY_STORAGE_PREFIX}stadia_dark`);
    localStorage.removeItem('noisemap_custom_map_api_key');
    localStorage.removeItem('noisemap_custom_map_provider');
  }
}
