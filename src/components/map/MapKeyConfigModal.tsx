import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { MapConfigService, MapTileProvider } from '../../services/mapConfigService';
import { Map, Key, CheckCircle, RefreshCw, X, AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react';

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

    // If MapTiler is selected, validate key presence
    if (selectedProvider === 'maptiler_dark') {
      const trimmed = apiKey.trim();
      if (!trimmed || trimmed === 'get_your_free_key' || trimmed.toLowerCase().includes('placeholder')) {
        setErrorMessage(
          'MapTiler requires a valid personal API key. Sign up for free at cloud.maptiler.com to get your key, or select CARTO Dark Matter.'
        );
        return;
      }
    }

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
    setSelectedProvider('osm_dark');
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="GEOSPATIAL TILE & API KEY MANAGER"
          tag="TILE LAYER CONTROLLER"
          variant="cyan"
          className="space-y-4 font-mono text-xs"
        >
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <Map className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Map Provider & API Key Setup</h3>
              <p className="text-[11px] text-slate-400">Configure high-resolution vector and raster dark tile layers</p>
            </div>
          </div>

          {/* Provider Select Grid */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">01. SELECT MAP BASEMAP PROVIDER:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('osm_dark')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'osm_dark'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan/20'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>OpenStreetMap Standard</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero API Key · Inverted Dark CSS Filter</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('carto_dark')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'carto_dark'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan/20'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>CARTO Dark Matter</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero API Key Needed · High Availability</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('stadia_dark')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'stadia_dark'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan/20'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="font-bold">Stadia Alidade Dark</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Free on Localhost · Key for Production</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('maptiler_dark')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedProvider === 'maptiler_dark'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-glow-amber/20'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>MapTiler Dataviz Dark</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
                    KEY REQ.
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Requires Personal Key from MapTiler</div>
              </button>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="space-y-1.5 pt-1">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  02.{' '}
                  {selectedProvider === 'maptiler_dark'
                    ? 'ENTER MAPTILER API KEY (REQUIRED):'
                    : selectedProvider === 'stadia_dark'
                    ? 'ENTER STADIA API KEY (OPTIONAL ON LOCALHOST):'
                    : 'API KEY (NOT REQUIRED FOR THIS PROVIDER):'}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">Stored in localStorage</span>
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
                selectedProvider === 'maptiler_dark'
                  ? 'Paste your MapTiler key from cloud.maptiler.com'
                  : selectedProvider === 'stadia_dark'
                  ? 'Paste Stadia key or leave blank on localhost'
                  : 'No key needed for this provider'
              }
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />

            {/* Provider specific helper note */}
            {selectedProvider === 'maptiler_dark' && (
              <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded text-[11px] text-amber-200 flex items-start gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  To use MapTiler Dataviz Dark, obtain a free personal key at{' '}
                  <a
                    href="https://cloud.maptiler.com/account/keys/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-amber-300 font-semibold hover:text-white"
                  >
                    cloud.maptiler.com/account/keys/
                  </a>
                  . If you do not have one, select <strong>CARTO Dark Matter</strong>.
                </span>
              </div>
            )}

            {selectedProvider === 'osm_dark' && (
              <p className="text-[11px] text-emerald-400 font-mono">
                ✓ OpenStreetMap Standard works immediately without configuring an API key.
              </p>
            )}

            {selectedProvider === 'carto_dark' && (
              <p className="text-[11px] text-slate-400 font-mono">
                ✓ CARTO Dark Matter works immediately without configuring an API key.
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Settings applied! Updating map tile layer...</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <TactileButton
              variant="ghost"
              size="md"
              icon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
              onClick={handleResetToDefault}
            >
              RESET TO OSM DEFAULT
            </TactileButton>

            <div className="flex-1 flex gap-2">
              <TactileButton variant="ghost" size="md" className="flex-1" onClick={onClose}>
                CANCEL
              </TactileButton>
              <TactileButton
                variant="cyan"
                size="md"
                className="flex-1"
                icon={<RefreshCw className="w-4 h-4 text-cyan-400" />}
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
