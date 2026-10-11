import React from 'react';
import { Mic, Grid, Users, FileCheck } from 'lucide-react';
import { TactileButton } from '../common/TactileButton';

interface HowItWorksProps {
  onStartMeasuring?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartMeasuring }) => {
  const steps = [
    {
      step: '01',
      title: 'Sample Ambient Audio',
      subtitle: '10-Second Transient DSP',
      description:
        'Tap start to measure 10 seconds of ambient environmental sound. The browser Web Audio API computes RMS amplitude and true Leq continuous decibels purely in device RAM.',
      icon: <Mic className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: 'LOCAL FFT & RMS',
    },
    {
      step: '02',
      title: 'Snap to 100m Grid',
      subtitle: 'Mathematical Privacy Obfuscation',
      description:
        'GPS coordinates are mathematically quantized to 3 decimal places (~100m bounding sector). Raw GPS coordinates never escape device RAM, ensuring absolute home location privacy.',
      icon: <Grid className="w-5 h-5 text-olive dark:text-lime-signal" />,
      tag: 'NO RAW GPS SAVED',
    },
    {
      step: '03',
      title: 'Algorithmic Consensus',
      subtitle: '3+ Citizen Node Corroboration',
      description:
        'To prevent single-user bias or malicious reports, statutory violation incidents are created only when 3 or more independent citizen devices record exceedances in the same sector within 15 minutes.',
      icon: <Users className="w-5 h-5 text-forest dark:text-lime-signal" />,
      tag: 'NO SINGLE-USER BIAS',
    },
    {
      step: '04',
      title: 'Generate Legal Dossier',
      subtitle: 'Client-Side PDF in <400ms',
      description:
        'Download a tamper-evident municipal grievance package citing Rules 5 & 7 of The Noise Pollution Rules, 2000, formatted for direct filing with Municipal Ward officers.',
      icon: <FileCheck className="w-5 h-5 text-terracotta" />,
      tag: 'CPCB 2000 RULES READY',
    },
  ];

  return (
    <section className="w-full py-10 sm:py-16 bg-paper-soft dark:bg-night-surface border-y border-paper-border dark:border-night-border transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-bold text-forest dark:text-lime-signal uppercase tracking-widest px-3 py-1 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20">
            FIELDWORK PROTOCOL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite dark:text-night-text tracking-tight font-sans">
            From Everyday Sound to Defensible Civic Action
          </h2>
          <p className="text-xs sm:text-sm text-graphite-secondary dark:text-night-secondary font-sans">
            A transparent 4-stage pipeline that converts raw smartphone audio into verifiable environmental data without surveillance.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-2xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border shadow-field relative flex flex-col justify-between font-mono transition-transform duration-150 hover:-translate-y-0.5"
            >
              {/* Step Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-paper-border/60 dark:border-night-border/60">
                <span className="text-2xl font-extrabold text-forest dark:text-lime-signal font-sans">
                  {s.step}
                </span>
                <div className="p-2 rounded-xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border">
                  {s.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="my-3 sm:my-4">
                <span className="text-[10px] text-forest dark:text-lime-signal font-semibold uppercase tracking-wider block mb-1">
                  {s.subtitle}
                </span>
                <h3 className="text-base font-bold text-graphite dark:text-night-text tracking-tight mb-2 font-sans">
                  {s.title}
                </h3>
                <p className="text-xs text-graphite-secondary dark:text-night-secondary font-sans leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Tag */}
              <div className="pt-3 border-t border-paper-border/60 dark:border-night-border/60">
                <span className="text-[10px] text-graphite-secondary dark:text-night-secondary font-bold tracking-wider">
                  {s.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        {onStartMeasuring && (
          <div className="flex justify-center pt-2">
            <TactileButton
              variant="forest"
              size="lg"
              onClick={onStartMeasuring}
              className="py-3 px-8 font-sans text-xs sm:text-sm shadow-field"
            >
              Try 10-Second Sample Now →
            </TactileButton>
          </div>
        )}
      </div>
    </section>
  );
};
