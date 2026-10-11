import React from 'react';
import { Radio, ShieldCheck, ArrowUp } from 'lucide-react';
import { TabType } from '../layout/NavigationBar';

interface LandingFooterProps {
  onNavigateTab: (tab: TabType) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigateTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full pt-10 pb-24 sm:pb-20 border-t border-paper-border dark:border-night-border bg-paper-soft dark:bg-night-surface font-mono text-xs text-graphite-secondary dark:text-night-secondary transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest text-lime-signal flex items-center justify-center">
                <Radio className="w-4 h-4 text-lime-signal" />
              </div>
              <span className="font-bold text-graphite dark:text-night-text tracking-tight font-sans text-base">
                NOISE<span className="text-forest dark:text-lime-signal">MAP</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border text-graphite-secondary dark:text-night-secondary font-bold">
                PWA v1.0
              </span>
            </div>

            <p className="text-xs text-graphite-secondary dark:text-night-secondary font-sans leading-relaxed max-w-sm">
              Privacy-first crowdsourced acoustic intelligence. Measuring, mapping, and converting everyday urban sound into actionable civic evidence.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-graphite-secondary dark:text-night-secondary">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-lime-signal" />
              <span>Zero-Audio Retention · ~100m Privacy Grid Snapping</span>
            </div>
          </div>

          {/* Quick Tab Links */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-graphite dark:text-night-text uppercase tracking-wider block mb-3 font-sans">
              PLATFORM WORKFLOWS
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('measure')}
                  className="hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer text-left font-sans"
                >
                  → Acoustic Sensor Node [Measure]
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('map')}
                  className="hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer text-left font-sans"
                >
                  → Live Geospatial Heatmap [Map]
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('incidents')}
                  className="hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer text-left font-sans"
                >
                  → Verified Consensus Hotspots [Incidents]
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('evidence')}
                  className="hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer text-left font-sans"
                >
                  → Statutory Evidence Dossier [CPCB 2000]
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer text-left font-sans"
                >
                  → Ephemeral Civic Identity [Profile & Badges]
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Statutory Citation */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] font-bold text-graphite dark:text-night-text uppercase tracking-wider block mb-3 font-sans">
              STATUTORY CITATIONS
            </span>
            <div className="p-3.5 rounded-2xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border space-y-1.5 text-[11px] leading-relaxed shadow-field">
              <span className="text-forest dark:text-lime-signal font-semibold block font-sans">CPCB Rules 2000</span>
              <p className="text-graphite-secondary dark:text-night-secondary font-sans">
                Grievance dossiers compiled in accordance with Rules 5 and 7 of The Noise Pollution (Regulation and Control) Rules, 2000 under Environment (Protection) Act, 1986.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-paper-border dark:border-night-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 NoiseMap Civic Intelligence Engine · Open Acoustic Protocol
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-forest dark:hover:text-lime-signal transition-colors cursor-pointer"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
