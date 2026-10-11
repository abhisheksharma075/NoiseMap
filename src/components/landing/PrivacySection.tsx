import React from 'react';
import { ShieldCheck, Lock, EyeOff, Terminal } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  const privacyPillars = [
    {
      title: 'Zero Audio Recordings',
      description:
        'Raw audio samples are analyzed strictly within transient browser RAM via the Web Audio API. Audio buffers are discarded immediately after computing RMS amplitude and Leq. No audio is ever recorded, stored on disk, or streamed.',
      icon: <EyeOff className="w-5 h-5 text-forest dark:text-lime-signal" />,
    },
    {
      title: '100m Privacy Grid Snapping',
      description:
        'Exact device GPS coordinates are truncated to 3 decimal places (~100m bounding sector) on your client before any persistence. Your home, office, and precise physical location are never exposed.',
      icon: <Lock className="w-5 h-5 text-forest dark:text-lime-signal" />,
    },
    {
      title: 'Zero Personal Identifiers (No KYC)',
      description:
        'NoiseMap never asks for your name, phone number, email address, or device IMEI. Contributors are identified solely by ephemeral crypto session tokens that you can rotate or delete at any moment.',
      icon: <ShieldCheck className="w-5 h-5 text-forest dark:text-lime-signal" />,
    },
    {
      title: 'Scientific Honesty & Open Audit',
      description:
        'Smartphones are consumer acoustic devices, not laboratory Class-1 sound level meters. NoiseMap openly communicates measurement tolerances and relies on multi-node consensus to validate environmental patterns.',
      icon: <Terminal className="w-5 h-5 text-olive dark:text-lime-signal" />,
    },
  ];

  return (
    <section className="w-full py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-paper-soft dark:bg-night-surface border border-forest/25 dark:border-forest/40 shadow-field-lg relative overflow-hidden transition-colors duration-150">
          {/* Header */}
          <div className="max-w-xl space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20 text-forest dark:text-lime-signal font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MATHEMATICAL ZERO-KNOWLEDGE PRIVACY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite dark:text-night-text tracking-tight font-sans">
              Citizen Protection Built into the Physics of the App
            </h2>
            <p className="text-xs sm:text-sm text-graphite-secondary dark:text-night-secondary font-sans leading-relaxed">
              We believe civic environmental action must never come at the expense of personal surveillance.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-paper-border dark:border-night-border">
            {privacyPillars.map((p, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border shadow-field">
                <div className="p-2.5 rounded-xl bg-forest-subtle dark:bg-forest/20 flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-graphite dark:text-night-text font-sans">
                    {p.title}
                  </h3>
                  <p className="text-xs text-graphite-secondary dark:text-night-secondary font-sans mt-1.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
