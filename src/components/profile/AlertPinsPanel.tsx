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
      variant="amber"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-mono">
            Monitored Sensitive Zones
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Receive automated alerts when sustained noise breaches your safe limits
          </p>
        </div>

        <div className="flex gap-2">
          <TactileButton
            variant="ghost"
            size="sm"
            icon={<Bell className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleTestNotification}
          >
            TEST PUSH
          </TactileButton>

          <TactileButton
            variant="amber"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            ADD PIN
          </TactileButton>
        </div>
      </div>

      {/* Add New Pin Form */}
      {showAddForm && (
        <div className="p-3 bg-slate-950 border border-white/10 rounded-lg space-y-3 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Home, School, Hospital"
              className="flex-1 bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-slate-400">ALERT THRESHOLD:</span>
              <input
                type="number"
                min="40"
                max="90"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 65)}
                className="w-16 bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-center text-amber-300 font-bold"
              />
              <span className="text-slate-400">dB</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <TactileButton variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              CANCEL
            </TactileButton>
            <TactileButton variant="cyan" size="sm" onClick={handleAddPin}>
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
            className="flex items-center justify-between p-3 bg-slate-950/70 border border-white/5 rounded-lg font-mono text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-white block">{pin.label}</span>
                <span className="text-[11px] text-slate-400">
                  Threshold: <strong className="text-amber-300">{pin.threshold_db} dB(A)</strong> · Sector {pin.lat.toFixed(3)}_{pin.lng.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ACTIVE WATCH
              </span>
              <button
                onClick={() => handleDeletePin(pin.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
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
