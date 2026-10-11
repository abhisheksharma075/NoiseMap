import React, { useMemo } from 'react';
import { NoiseReading, NoiseIncident } from '../../types';
import { Activity, MapPin, AlertTriangle, Users, Database, ShieldCheck } from 'lucide-react';

interface EnvironmentalStatisticsProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
}

export const EnvironmentalStatistics: React.FC<EnvironmentalStatisticsProps> = ({
  readings,
  incidents,
}) => {
  // Compute authentic application metrics from actual persistent storage
  const stats = useMemo(() => {
    const sampleCount = readings.length;
    const uniqueSectors = new Set(readings.map((r) => r.grid_id)).size;
    const activeIncidents = incidents.filter((i) => i.status === 'active').length;
    const uniqueContributors = new Set(readings.map((r) => r.session_id)).size;

    return {
      sampleCount,
      uniqueSectors,
      activeIncidents,
      uniqueContributors,
    };
  }, [readings, incidents]);

  const cards = [
    {
      id: 'samples',
      label: 'RECORDED NOISE SAMPLES',
      value: stats.sampleCount,
      subtext: 'Decibels computed in transient RAM',
      icon: <Activity className="w-5 h-5 text-forest dark:text-lime-signal" />,
      badge: 'PERSISTED LOCALLY',
      badgeClass: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
    },
    {
      id: 'sectors',
      label: 'MONITORED GRID SECTORS',
      value: stats.uniqueSectors,
      subtext: '~100m spatial privacy sectors',
      icon: <MapPin className="w-5 h-5 text-olive dark:text-lime-signal" />,
      badge: '3-DECIMAL QUANTIZED',
      badgeClass: 'text-olive dark:text-lime-signal bg-olive-subtle dark:bg-olive/20 border-olive/30',
    },
    {
      id: 'incidents',
      label: 'ACTIVE INCIDENTS',
      value: stats.activeIncidents,
      subtext: 'Corroborated by 3+ citizen nodes',
      icon: <AlertTriangle className="w-5 h-5 text-terracotta" />,
      badge: stats.activeIncidents > 0 ? 'STATUTORY BREACH' : 'WITHIN CPCB LIMITS',
      badgeClass: stats.activeIncidents > 0
        ? 'text-terracotta bg-terracotta-subtle dark:bg-terracotta/25 border-terracotta/30'
        : 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30',
    },
    {
      id: 'contributors',
      label: 'COMMUNITY CONTRIBUTORS',
      value: stats.uniqueContributors,
      subtext: 'Anonymous crypto session tokens',
      icon: <Users className="w-5 h-5 text-forest-deep dark:text-lime-signal" />,
      badge: 'ZERO IDENTIFIERS',
      badgeClass: 'text-graphite dark:text-night-text bg-paper-border/50 dark:bg-night-border border-paper-border',
    },
  ];

  return (
    <section className="w-full py-8 sm:py-12 border-y border-paper-border dark:border-night-border bg-paper-soft dark:bg-night-surface transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-forest dark:text-lime-signal font-mono text-xs tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>FIELD OBSERVATION TELEMETRY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-graphite dark:text-night-text tracking-tight mt-1 font-sans">
              Decentralized Sensor Grid Summary
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-graphite-secondary dark:text-night-secondary">
            <ShieldCheck className="w-4 h-4 text-forest dark:text-lime-signal" />
            <span>Bound strictly to verified local storage</span>
          </div>
        </div>

        {/* 4-Column Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-4 sm:p-5 rounded-2xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border shadow-field transition-all duration-150 flex flex-col justify-between font-mono"
            >
              <div className="flex items-center justify-between pb-3 border-b border-paper-border/60 dark:border-night-border/60">
                <div className="p-2 rounded-xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border">
                  {card.icon}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>

              <div className="my-3 sm:my-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-graphite dark:text-night-text tracking-tight font-sans">
                  {card.value}
                </span>
                <span className="text-xs text-graphite-secondary dark:text-night-secondary block font-medium mt-1">
                  {card.label}
                </span>
              </div>

              <p className="text-[11px] text-graphite-secondary dark:text-night-secondary font-sans border-t border-paper-border/60 dark:border-night-border/60 pt-2">
                {card.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
