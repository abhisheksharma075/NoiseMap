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
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
    {
      id: 'community_sensor',
      name: 'Community Sensor',
      threshold: 25,
      description: 'Contributed 25 corroborated civic data points',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
    },
    {
      id: 'noise_guardian',
      name: 'Noise Guardian',
      threshold: 50,
      description: 'Corroborated 50 multi-contributor incidents',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    },
  ];

  return (
    <VectorCard
      label="CIVIC GAMIFICATION & CONTRIBUTOR MERIT"
      tag="ZERO-KYC REPUTATION"
      variant="cyan"
      className={`space-y-4 font-mono ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Civic Contribution Streak</h3>
          <p className="text-xs text-slate-400">Rewarding data quality, consistency, and peer corroboration</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-white/10 text-amber-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{streak.current_streak} DAY STREAK</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-white/10 text-cyan-300 font-bold text-xs">
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
                  ? b.color
                  : 'bg-slate-900/40 border-white/5 opacity-40 text-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded bg-black/40 border border-white/10">
                    {b.icon}
                  </div>
                  {isUnlocked ? (
                    <span className="text-[10px] flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      {streak.total_readings}/{b.threshold}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-xs">{b.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
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
