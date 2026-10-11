import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { MapConfigService, MapTileProvider } from '../../services/mapConfigService';
import { Map, Key, CheckCircle, RefreshCw, X, AlertTriangle, RotateCcw } from 'lucide-react';

interface MapKeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const MapKeyConfigModal: React.FC<MapKeyConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<MapTileProvider>(() => MapConfigService.getMapProvider());
  const [apiKey, setApiKey] = useState<string>(() => MapConfigService.getApiKeyForProvider(MapConfigService.getMapProvider()));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleProviderSelect = (prov: MapTileProvider) => {
    setSelectedProvider(prov);
    setApiKey(MapConfigService.getApiKeyForProvider(prov));
    setErrorMessage(null);
  };

  const handleSave = () => {
    setErrorMessage(null);

    // Save provider and isolated key
    MapConfigService.setMapProvider(selectedProvider);
    MapConfigService.setApiKeyForProvider(selectedProvider, apiKey);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 800);
  };

  const handleResetToDefault = () => {
    MapConfigService.resetToDefault();
    setSelectedProvider('stadia_dark');
    setApiKey('');
    setErrorMessage(null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-graphite-950/65 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto max-h-[92vh] max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="GEOSPATIAL TILE & API KEY MANAGER"
          tag="TILE LAYER CONTROLLER"
          variant="forest"
          className="flex flex-col max-h-[92vh] max-h-[92dvh] overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-night-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 text-graphite-900 dark:text-night-text">
            <div className="w-9 h-9 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border flex items-center justify-center flex-shrink-0">
              <Map className="w-4 h-4 text-forest-700 dark:text-lime-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-graphite-900 dark:text-night-text">Map Provider & API Key Setup</h3>
              <p className="text-[11px] text-stone-500 dark:text-night-muted">Configure high-resolution cartographic tile layers</p>
            </div>
          </div>

          {/* Provider Select Grid */}
          <div className="space-y-1.5">
            <label className="text-graphite-800 dark:text-night-text font-semibold block">01. SELECT MAP BASEMAP PROVIDER:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('stadia_dark')}
                className={`p-2.5 min-h-[56px] rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'stadia_dark'
                    ? 'bg-forest-900 text-paper-50 dark:bg-lime-400 dark:text-forest-950 border-forest-900 dark:border-lime-400 shadow-sm'
                    : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-700 dark:text-night-muted hover:border-forest-600 dark:hover:border-lime-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Stadia Alidade</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${selectedProvider === 'stadia_dark' ? 'bg-forest-800 text-paper-50 dark:bg-lime-500 dark:text-forest-950 border-transparent' : 'bg-paper-200 dark:bg-night-900 border-paper-border text-forest-700 dark:text-lime-400'}`}>
                    REC
                  </span>
                </div>
                <div className={`text-[10px] mt-0.5 ${selectedProvider === 'stadia_dark' ? 'text-paper-200 dark:text-forest-800' : 'text-stone-500 dark:text-night-muted'}`}>
                  High-Res Dark Tiles
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('osm_dark')}
                className={`p-2.5 min-h-[56px] rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'osm_dark'
                    ? 'bg-forest-900 text-paper-50 dark:bg-lime-400 dark:text-forest-950 border-forest-900 dark:border-lime-400 shadow-sm'
                    : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-700 dark:text-night-muted hover:border-forest-600 dark:hover:border-lime-400'
                }`}
              >
                <div className="font-bold">OSM Standard</div>
                <div className={`text-[10px] mt-0.5 ${selectedProvider === 'osm_dark' ? 'text-paper-200 dark:text-forest-800' : 'text-stone-500 dark:text-night-muted'}`}>
                  Zero Key · Open Data
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('carto_dark')}
                className={`p-2.5 min-h-[56px] rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'carto_dark'
                    ? 'bg-forest-900 text-paper-50 dark:bg-lime-400 dark:text-forest-950 border-forest-900 dark:border-lime-400 shadow-sm'
                    : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-700 dark:text-night-muted hover:border-forest-600 dark:hover:border-lime-400'
                }`}
              >
                <div className="font-bold">CARTO Dark</div>
                <div className={`text-[10px] mt-0.5 ${selectedProvider === 'carto_dark' ? 'text-paper-200 dark:text-forest-800' : 'text-stone-500 dark:text-night-muted'}`}>
                  Zero Key · High Availability
                </div>
              </button>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="space-y-1.5 pt-1">
            <label className="text-graphite-800 dark:text-night-text font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-forest-700 dark:text-lime-400" />
                <span>
                  02.{' '}
                  {selectedProvider === 'stadia_dark'
                    ? 'STADIA API KEY (OPTIONAL / PRODUCTION DOMAIN):'
                    : 'API KEY (NOT REQUIRED FOR THIS PROVIDER):'}
                </span>
              </span>
              <span className="text-[10px] text-stone-500 dark:text-night-muted">Stored locally</span>
            </label>

            <input
              type="text"
              value={apiKey}
              disabled={selectedProvider === 'carto_dark' || selectedProvider === 'osm_dark'}
              onChange={(e) => {
                setApiKey(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={
                selectedProvider === 'stadia_dark'
                  ? 'Paste Stadia key or leave empty (works immediately on localhost)'
                  : 'No API key needed for this provider'
              }
              className="w-full bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg px-3 py-2 text-graphite-900 dark:text-night-text font-mono focus:outline-none focus:border-forest-600 dark:focus:border-lime-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />

            {/* Provider specific helper notes */}
            {selectedProvider === 'stadia_dark' && (
              <p className="text-[11px] text-forest-700 dark:text-lime-400 font-mono">
                ✓ Stadia Alidade Dark works seamlessly as recommended default. Optional API key can be supplied for custom production domains.
              </p>
            )}

            {selectedProvider === 'osm_dark' && (
              <p className="text-[11px] text-forest-700 dark:text-lime-400 font-mono">
                ✓ OpenStreetMap Standard works immediately without configuring an API key.
              </p>
            )}

            {selectedProvider === 'carto_dark' && (
              <p className="text-[11px] text-stone-600 dark:text-night-muted font-mono">
                ✓ CARTO Dark Matter works immediately without configuring an API key.
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-terracotta-50 dark:bg-night-900 border border-terracotta-300 dark:border-terracotta-700 rounded-lg text-terracotta-800 dark:text-terracotta-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {savedSuccess && (
            <div className="p-2.5 bg-forest-50 dark:bg-night-900 border border-forest-400 dark:border-forest-700 rounded-lg text-forest-800 dark:text-forest-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-forest-600 dark:text-lime-400" />
              <span>Settings applied! Updating map tile layer...</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <TactileButton
              variant="ghost"
              size="md"
              icon={<RotateCcw className="w-3.5 h-3.5 text-stone-500" />}
              onClick={handleResetToDefault}
            >
              RESET TO DEFAULT
            </TactileButton>

            <div className="flex-1 flex gap-2">
              <TactileButton variant="ghost" size="md" className="flex-1" onClick={onClose}>
                CANCEL
              </TactileButton>
              <TactileButton
                variant="forest"
                size="md"
                className="flex-1"
                icon={<RefreshCw className="w-4 h-4 text-lime-400" />}
                onClick={handleSave}
              >
                APPLY SETTINGS
              </TactileButton>
            </div>
          </div>
        </VectorCard>
      </div>
    </div>
  );
};
