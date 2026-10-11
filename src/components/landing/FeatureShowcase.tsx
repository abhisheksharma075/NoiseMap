import React from 'react';
import {
  Map,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Cpu,
  Scale,
  Award,
} from 'lucide-react';

interface FeatureShowcaseProps {
  onNavigateTab?: (tab: 'measure' | 'map' | 'incidents' | 'evidence' | 'profile') => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ onNavigateTab }) => {
  const features = [
    {
      id: 'dsp',
      tab: 'measure' as const,
      category: '01. SIGNAL PROCESSING',
      title: 'Acoustic Intelligence Engine',
      description:
        'Browser Web Audio DSP calculates root-mean-square amplitude and continuously integrates equivalent sound levels (Leq). Decibel mathematics occur purely in transient RAM—zero audio is stored or uploaded.',
      icon: <Cpu className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: 'WEB AUDIO DSP',
      badgeColor: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
      specs: ['10-sec ambient sample cycle', 'True Leq energy-equivalent integration', 'Dynamic limits (30-120 dB SPL)'],
    },
    {
      id: 'mapping',
      tab: 'map' as const,
      category: '02. FIELD CARTOGRAPHY',
      title: 'Real-Time Spatial Heatmapping',
      description:
        'Responsive Leaflet cartography renders crowdsourced acoustic vectors. Raw GPS coordinates are truncated to 3 decimal places (~100m grid sectors) to protect home privacy while surfacing community hotspots.',
      icon: <Map className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: '100M PRIVACY GRID',
      badgeColor: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
      specs: ['Sub-second vector rendering', 'Temporal filter sliding windows', 'Live location pulsing beacon'],
    },
    {
      id: 'consensus',
      tab: 'incidents' as const,
      category: '03. CORROBORATION ALGORITHM',
      title: 'Multi-Contributor Consensus',
      description:
        'Eliminating single-user bias and false alarms: verified noise incidents require consensus from at least 3 distinct citizen nodes in the same sector within a 15-minute sliding window.',
      icon: <Users className="w-5 h-5 text-olive dark:text-lime-signal" />,
      tag: '3+ CITIZEN NODES',
      badgeColor: 'text-olive dark:text-lime-signal bg-olive-subtle dark:bg-olive/20 border-olive/30',
      specs: ['5-factor mathematical confidence', 'Temporal sliding window', 'Foreign-key reading verification'],
    },
    {
      id: 'evidence',
      tab: 'evidence' as const,
      category: '04. STATUTORY COMPLIANCE',
      title: 'CPCB 2000 Evidence Dossier',
      description:
        'Compiles tamper-evident municipal grievance packages client-side using pdf-lib in under 400ms. Cites Rules 5 and 7 of The Noise Pollution (Regulation and Control) Rules, 2000 under the Environment Protection Act.',
      icon: <Scale className="w-5 h-5 text-terracotta" />,
      tag: 'STATUTORY DOSSIER',
      badgeColor: 'text-terracotta bg-terracotta-subtle dark:bg-terracotta/25 border-terracotta/30',
      specs: ['Tamper-evident reference code', 'Day & Night zone exceedance metrics', 'Ready for municipal filing'],
    },
    {
      id: 'civic',
      tab: 'profile' as const,
      category: '05. CIVIC PARTICIPATION',
      title: 'Civic ID & Diurnal Analytics',
      description:
        'Zero-knowledge citizen participation with rotatable ephemeral crypto session tokens. Track personal contribution streaks, unlock civic guardian badges, and visualize 24-hour diurnal noise timelines.',
      icon: <Award className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: 'ANONYMOUS TOKENS',
      badgeColor: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
      specs: ['One-click session rotation', 'Streak gamification & badges', '24-hour diurnal chart curve'],
    },
    {
      id: 'privacy',
      tab: 'measure' as const,
      category: '06. PRIVACY ARCHITECTURE',
      title: 'Privacy by Design Core',
      description:
        'Engineered from the ground up to respect citizen privacy: zero microphone recordings leave your phone, raw GPS coordinates are never retained, and no personal account, phone, or email is ever requested.',
      icon: <ShieldCheck className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: 'ZERO KYC · ZERO LEAKS',
      badgeColor: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
      specs: ['Microphone active only during sample', 'Autonomous offline persistence', 'Installable PWA capability'],
    },
  ];

  return (
    <section className="w-full py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20 text-forest dark:text-lime-signal font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL CAPABILITIES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite dark:text-night-text tracking-tight font-sans">
            Engineered for Acoustic Truth & Privacy
          </h2>
          <p className="text-xs sm:text-sm text-graphite-secondary dark:text-night-secondary font-sans">
            Every layer of NoiseMap balances scientific acoustic precision with uncompromising mathematical citizen privacy.
          </p>
        </div>

        {/* 6-Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.id}
              onClick={() => onNavigateTab && onNavigateTab(f.tab)}
              className="p-5 sm:p-6 rounded-2xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border transition-all duration-150 flex flex-col justify-between group cursor-pointer shadow-field hover:shadow-field-md hover:-translate-y-0.5"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-paper-border/60 dark:border-night-border/60 font-mono">
                  <div className="p-2.5 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border group-hover:scale-105 transition-transform">
                    {f.icon}
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded border uppercase font-bold tracking-wider ${f.badgeColor}`}>
                    {f.tag}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <span className="text-[10px] font-mono text-graphite-secondary dark:text-night-secondary uppercase tracking-wider block mb-1">
                  {f.category}
                </span>
                <h3 className="text-base font-bold text-graphite dark:text-night-text tracking-tight group-hover:text-forest dark:group-hover:text-lime-signal transition-colors font-sans">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-graphite-secondary dark:text-night-secondary leading-relaxed mt-2 font-sans">
                  {f.description}
                </p>

                {/* Technical Specifications */}
                <ul className="mt-4 pt-3 border-t border-paper-border/60 dark:border-night-border/60 space-y-1.5 font-mono text-[11px] text-graphite-secondary dark:text-night-secondary">
                  {f.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-lime-signal" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-paper-border/60 dark:border-night-border/60 flex items-center justify-between text-xs font-mono text-forest dark:text-lime-signal font-semibold">
                <span>Explore Workflow</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
