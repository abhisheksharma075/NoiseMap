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
    <aside
      aria-label="Install NoiseMap PWA"
      className="fixed top-14 inset-x-0 mx-auto w-[94%] max-w-lg z-50 animate-in slide-in-from-top-3 duration-200 font-sans"
    >
      <div className="p-3 sm:p-3.5 bg-paper-soft dark:bg-night-surface border border-forest/30 dark:border-forest/50 rounded-2xl shadow-field-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-forest-subtle dark:bg-forest/30 text-forest dark:text-lime-signal flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-graphite dark:text-night-text text-xs sm:text-sm block">
              Install NoiseMap PWA
            </span>
            <span className="text-[11px] text-graphite-secondary dark:text-night-secondary">
              Phone-friendly acoustic monitor for your home screen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <TactileButton
            variant="lime"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleInstallClick}
          >
            INSTALL
          </TactileButton>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss install banner"
            className="text-graphite-secondary dark:text-night-secondary hover:text-graphite dark:hover:text-night-text p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
