import React from 'react';
import { UserStreak } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { Award, Zap, Shield, Flame, CheckCircle } from 'lucide-react';

interface BadgeDisplayProps {
  streak: UserStreak;
  className?: string;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ streak, className = '' }) => {
  const badges = [
    {
      id: 'noise_watcher',
      name: 'Noise Watcher',
      threshold: 10,
      description: 'Submitted 10 verified acoustic samples',
      icon: <Award className="w-5 h-5 text-olive-700 dark:text-lime-400" />,
      color: 'border-paper-border dark:border-night-border bg-paper-50 dark:bg-night-800 text-graphite-900 dark:text-night-text',
    },
    {
      id: 'community_sensor',
      name: 'Community Sensor',
      threshold: 25,
      description: 'Contributed 25 corroborated civic data points',
      icon: <Zap className="w-5 h-5 text-forest-700 dark:text-lime-400" />,
      color: 'border-paper-border dark:border-night-border bg-paper-50 dark:bg-night-800 text-graphite-900 dark:text-night-text',
    },
    {
      id: 'noise_guardian',
      name: 'Noise Guardian',
      threshold: 50,
      description: 'Corroborated 50 multi-contributor incidents',
      icon: <Shield className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />,
      color: 'border-paper-border dark:border-night-border bg-paper-50 dark:bg-night-800 text-graphite-900 dark:text-night-text',
    },
  ];

  return (
    <VectorCard
      label="CIVIC GAMIFICATION & CONTRIBUTOR MERIT"
      tag="ZERO-KYC REPUTATION"
      variant="forest"
      className={`space-y-4 font-mono shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-graphite-900 dark:text-night-text font-serif">Civic Contribution Streak</h3>
          <p className="text-xs text-stone-600 dark:text-night-muted">Rewarding data quality, consistency, and peer corroboration</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-terracotta-700 dark:text-terracotta-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
            <span>{streak.current_streak} DAY STREAK</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-forest-800 dark:text-lime-300 font-bold text-xs">
            <span>{streak.total_readings} SAMPLES</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {badges.map((b) => {
          const isUnlocked = streak.total_readings >= b.threshold;

          return (
            <div
              key={b.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isUnlocked
                  ? `${b.color} shadow-sm border-forest-600/40 dark:border-lime-400/40`
                  : 'bg-paper-100/50 dark:bg-night-900/40 border-paper-border/60 dark:border-night-border opacity-50 text-stone-400 dark:text-stone-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border">
                    {b.icon}
                  </div>
                  {isUnlocked ? (
                    <span className="text-[10px] flex items-center gap-1 text-forest-700 dark:text-lime-400 font-bold">
                      <CheckCircle className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 dark:text-night-muted font-medium">
                      {streak.total_readings}/{b.threshold}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-graphite-900 dark:text-night-text text-xs">{b.name}</h4>
                <p className="text-[10px] text-stone-600 dark:text-night-muted mt-0.5 leading-snug">
                  {b.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </VectorCard>
  );
};
