import React from 'react';
import { TactileButton } from '../common/TactileButton';
import { FieldGuideAvatar } from '../common/FieldGuideAvatar';
import {
  Map,
  Mic,
  ShieldCheck,
  Radio,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { NoiseReading, NoiseIncident } from '../../types';

interface HeroSectionProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
  onStartMeasuring: () => void;
  onExploreMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  readings,
  incidents,
  onStartMeasuring,
  onExploreMap,
}) => {
  const activeIncidentsCount = incidents.filter((i) => i.status === 'active').length;

  return (
    <section className="relative w-full pt-4 sm:pt-6 pb-10 sm:pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: Editorial Fieldwork Copy & Action Controls */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20 dark:border-forest/40 text-forest dark:text-lime-signal font-mono text-xs shadow-field">
            <span className="w-2 h-2 rounded-full bg-forest dark:bg-lime-signal animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              CIVIC ACOUSTIC INTELLIGENCE · FIELD MONITOR
            </span>
          </div>

          {/* Main Editorial Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-graphite dark:text-night-text font-sans leading-[1.12]">
              Hear Your City.{' '}
              <span className="text-forest dark:text-lime-signal block sm:inline">
                Understand Its Soundscape.
              </span>
            </h1>
          </div>

          {/* Thoughtful Supporting Description */}
          <p className="text-sm sm:text-base text-graphite-secondary dark:text-night-secondary font-sans leading-relaxed max-w-xl">
            A privacy-first environmental instrument for everyday citizens. Measure ambient decibel levels, map neighborhood sound in ~100m privacy sectors, and corroborate community noise violations into legal evidence for quieter, healthier cities.
          </p>

          {/* Primary & Secondary Action Buttons (48px touch targets) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
            <TactileButton
              variant="forest"
              size="lg"
              icon={<Mic className="w-4 h-4 text-lime-signal" />}
              onClick={onStartMeasuring}
              className="py-3.5 px-6 font-sans text-sm justify-center shadow-field"
            >
              Start Measuring
            </TactileButton>

            <TactileButton
              variant="paper"
              size="lg"
              icon={<Map className="w-4 h-4 text-forest dark:text-lime-signal" />}
              onClick={onExploreMap}
              className="py-3.5 px-6 font-sans text-sm justify-center"
            >
              Explore Live Noise Map
            </TactileButton>
          </div>

          {/* Trust Statement (Field Ethics) */}
          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-graphite-secondary dark:text-night-secondary border-t border-paper-border dark:border-night-border w-full">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
              <span>Zero Audio Retention</span>
            </div>
            <span className="text-paper-border dark:text-night-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
              <span>100m Privacy Snapping</span>
            </div>
            <span className="text-paper-border dark:text-night-border hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
              <span>Statutory CPCB Citations</span>
            </div>
          </div>

          {/* The Field Guide Companion */}
          <FieldGuideAvatar mood="idle" />

          {/* Live Field Telemetry Ticker */}
          <div className="p-3 bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border rounded-xl font-mono text-xs w-full max-w-lg flex items-center justify-between gap-3 shadow-field">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-forest dark:text-lime-signal animate-pulse" />
              <span className="text-graphite-secondary dark:text-night-secondary text-[11px]">ACTIVE SENSOR SAMPLES:</span>
              <span className="text-graphite dark:text-night-text font-bold">{readings.length} Logged</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${activeIncidentsCount > 0 ? 'bg-terracotta animate-pulse' : 'bg-forest dark:bg-lime-signal'}`} />
              <span className="font-semibold">
                {activeIncidentsCount > 0 ? (
                  <span className="text-terracotta dark:text-[#E2886A]">{activeIncidentsCount} HAZARD AREAS</span>
                ) : (
                  <span className="text-forest dark:text-lime-signal">ALL SECTORS QUIET</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Field Acoustic Instrument Dial & Calibration Matrix */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4 pt-2 lg:pt-0">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border shadow-field-md relative overflow-hidden font-mono">
            {/* Field Notebook Label Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-paper-border dark:border-night-border text-xs">
              <div className="flex items-center gap-2 text-forest dark:text-lime-signal font-bold">
                <Compass className="w-4 h-4" />
                <span>FIELD INSTRUMENT CALIBRATION</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border text-graphite-secondary dark:text-night-secondary font-medium">
                TYPE: CITIZEN PWA
              </span>
            </div>

            {/* Central Instrument Gauge Representation */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* Outer Rotating Compass Ring */}
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    className="text-paper-border dark:text-night-border"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="76"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray="280 400"
                    className="text-forest dark:text-lime-signal"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="62"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-stone/30"
                  />
                </svg>

                {/* Center Instrument Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-graphite-secondary dark:text-night-secondary font-medium tracking-wider uppercase">
                    STANDBY READOUT
                  </span>
                  <div className="flex items-baseline justify-center my-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-graphite dark:text-night-text tracking-tight">
                      {readings[0] ? readings[0].db_avg.toFixed(1) : '48.5'}
                    </span>
                    <span className="text-xs text-graphite-secondary dark:text-night-secondary ml-1">dB(A)</span>
                  </div>
                  <span className="text-[10px] font-bold text-forest dark:text-lime-signal uppercase">
                    {readings[0] ? `LAST: ${readings[0].source_type}` : 'RESIDENTIAL AMBIENT'}
                  </span>
                </div>
              </div>
            </div>

            {/* WHO / CPCB Regulatory Acoustic Standards Scale */}
            <div className="pt-3 border-t border-paper-border dark:border-night-border space-y-1.5 text-[11px]">
              <div className="text-[10px] text-graphite-secondary dark:text-night-secondary font-bold uppercase tracking-wider flex justify-between">
                <span>CPCB Permissible Limits:</span>
                <span>Day / Night</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-1.5 rounded-lg bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex justify-between items-center">
                  <span className="text-graphite-secondary dark:text-night-secondary">Residential:</span>
                  <strong className="text-forest dark:text-lime-signal">55 / 45 dB</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex justify-between items-center">
                  <span className="text-graphite-secondary dark:text-night-secondary">Commercial:</span>
                  <strong className="text-graphite dark:text-night-text">65 / 55 dB</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex justify-between items-center">
                  <span className="text-graphite-secondary dark:text-night-secondary">Industrial:</span>
                  <strong className="text-graphite dark:text-night-text">75 / 70 dB</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex justify-between items-center">
                  <span className="text-graphite-secondary dark:text-night-secondary">Silence Zone:</span>
                  <strong className="text-terracotta">50 / 40 dB</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
