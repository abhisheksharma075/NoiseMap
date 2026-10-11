import React, { useState } from 'react';
import { UserPin } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { MapPin, Plus, Trash2, Bell, ShieldCheck } from 'lucide-react';
import { NotificationService } from '../../services/notificationService';

interface AlertPinsPanelProps {
  pins: UserPin[];
  onUpdatePins: (pins: UserPin[]) => void;
}

export const AlertPinsPanel: React.FC<AlertPinsPanelProps> = ({
  pins,
  onUpdatePins,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('Home Residence');
  const [newThreshold, setNewThreshold] = useState<number>(65);

  const handleAddPin = () => {
    const newPin: UserPin = {
      id: 'pin_' + crypto.randomUUID().slice(0, 8),
      session_id: 'local_user',
      label: newLabel,
      lat: 26.144,
      lng: 91.736,
      threshold_db: newThreshold,
      created_at: new Date().toISOString(),
    };

    const updated = [...pins, newPin];
    onUpdatePins(updated);
    NotificationService.savePins(updated);
    setShowAddForm(false);
  };

  const handleDeletePin = (id: string) => {
    const updated = pins.filter((p) => p.id !== id);
    onUpdatePins(updated);
    NotificationService.savePins(updated);
  };

  const handleTestNotification = async () => {
    const ok = await NotificationService.dispatchPushAlert(
      '🚨 NOISEMAP TEST ALERT',
      'This is how you will be notified when your pinned zone sustains noise exceeding safe thresholds.'
    );
    if (!ok) {
      alert("Browser notifications are blocked or unsupported on this device. In-app alerts remain active.");
    }
  };

  return (
    <VectorCard
      label="GEO-FENCED ALERT PINS"
      tag="THRESHOLD RISK MONITOR"
      variant="olive"
      className="space-y-4 shadow-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-graphite-900 dark:text-night-text font-serif">
            Monitored Sensitive Zones
          </h3>
          <p className="text-xs text-stone-600 dark:text-night-muted font-mono">
            Receive automated alerts when sustained noise breaches your safe limits
          </p>
        </div>

        <div className="flex gap-2">
          <TactileButton
            variant="ghost"
            size="sm"
            icon={<Bell className="w-3.5 h-3.5 text-forest-700 dark:text-lime-400" />}
            onClick={handleTestNotification}
          >
            TEST PUSH
          </TactileButton>

          <TactileButton
            variant="forest"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5 text-paper-50 dark:text-forest-950" />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            ADD PIN
          </TactileButton>
        </div>
      </div>

      {/* Add New Pin Form */}
      {showAddForm && (
        <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg space-y-3 font-mono text-xs animate-in fade-in duration-150 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Home, School, Hospital"
              className="flex-1 bg-paper-50 dark:bg-night-800 border border-paper-border dark:border-night-border rounded-lg px-3 py-1.5 text-graphite-900 dark:text-night-text focus:outline-none focus:border-forest-600 dark:focus:border-lime-400"
            />
            <div className="flex items-center gap-2">
              <span className="text-stone-600 dark:text-night-muted">ALERT THRESHOLD:</span>
              <input
                type="number"
                min="40"
                max="90"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 65)}
                className="w-16 bg-paper-50 dark:bg-night-800 border border-paper-border dark:border-night-border rounded-lg px-2 py-1.5 text-center text-forest-800 dark:text-lime-300 font-bold"
              />
              <span className="text-stone-600 dark:text-night-muted">dB</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <TactileButton variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              CANCEL
            </TactileButton>
            <TactileButton variant="forest" size="sm" onClick={handleAddPin}>
              SAVE PIN
            </TactileButton>
          </div>
        </div>
      )}

      {/* Pins List */}
      <div className="space-y-2">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="flex items-center justify-between p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-olive-100 dark:bg-olive-950/60 border border-olive-300 dark:border-olive-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-olive-700 dark:text-lime-400" />
              </div>
              <div>
                <span className="font-bold text-graphite-900 dark:text-night-text block">{pin.label}</span>
                <span className="text-[11px] text-stone-600 dark:text-night-muted">
                  Threshold: <strong className="text-terracotta-700 dark:text-terracotta-400">{pin.threshold_db} dB(A)</strong> · Sector {pin.lat.toFixed(3)}_{pin.lng.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-950/60 border border-forest-300 dark:border-forest-700 text-forest-800 dark:text-lime-300 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> ACTIVE WATCH
              </span>
              <button
                onClick={() => handleDeletePin(pin.id)}
                className="text-stone-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 p-1.5 transition-colors cursor-pointer"
                title="Remove Pin"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </VectorCard>
  );
};
