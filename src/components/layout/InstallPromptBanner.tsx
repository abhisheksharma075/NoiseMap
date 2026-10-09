import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { TactileButton } from '../common/TactileButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPromptBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 inset-x-0 mx-auto w-[92%] max-w-lg z-50 animate-in slide-in-from-top-4 duration-300 font-mono text-xs">
      <div className="p-3 bg-surface/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-glow-cyan/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-white block">INSTALL NOISEMAP PWA</span>
            <span className="text-[11px] text-slate-400">Zero-install mobile sensor grid for your home screen</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <TactileButton
            variant="cyan"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleInstallClick}
          >
            INSTALL
          </TactileButton>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-500 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
