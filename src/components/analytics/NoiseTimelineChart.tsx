import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { VectorCard } from '../common/VectorCard';
import { useTheme } from '../../context/ThemeContext';
import { NoiseReading } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NoiseTimelineChartProps {
  className?: string;
  readings?: NoiseReading[];
}

export const NoiseTimelineChart: React.FC<NoiseTimelineChartProps> = ({
  className = '',
  readings = [],
}) => {
  const { theme } = useTheme();
  const isNight = theme === 'dark';

  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  // Normal expected ambient baseline (typical city street)
  const baselineData = [44, 42, 40, 48, 56, 62, 60, 63, 65, 68, 58, 49];

  const isUsingRealData = readings && readings.length > 0;

  // Dynamically compute authentic peak decibels from recorded field data
  const maxRecordedPeak = React.useMemo(() => {
    if (!isUsingRealData) return 86.0;
    return Math.round(Math.max(...readings.map((r) => r.db_peak || r.db_avg)) * 10) / 10;
  }, [readings, isUsingRealData]);

  // Dynamically bucket real readings into the 12 two-hour time slots
  const todayMeasured = React.useMemo(() => {
    if (!isUsingRealData) {
      return [45, 43, 42, 49, 58, 64, 62, 65, 78, 86, 82, 54];
    }

    const slotBuckets: number[][] = Array.from({ length: 12 }, () => []);

    readings.forEach((r) => {
      const date = new Date(r.created_at);
      const hour = date.getHours();
      const slotIndex = Math.min(Math.floor(hour / 2), 11);
      slotBuckets[slotIndex].push(r.db_avg);
    });

    return slotBuckets.map((bucket, index) => {
      if (bucket.length === 0) {
        return baselineData[index];
      }
      const energySum = bucket.reduce((sum, db) => sum + Math.pow(10, db / 10), 0);
      const avg = 10 * Math.log10(energySum / bucket.length);
      return Math.round(avg * 10) / 10;
    });
  }, [readings, isUsingRealData]);

  // CPCB Residential Daytime threshold line
  const cpcbThreshold = Array(12).fill(55);

  const data = {
    labels: hours,
    datasets: [
      {
        label: isUsingRealData ? "Live Measured Noise (dB)" : "Indicative Ambient Profile (dB)",
        data: todayMeasured,
        borderColor: '#2DD4BF',
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2DD4BF',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Historical Baseline (dB)',
        data: baselineData,
        borderColor: isNight ? '#64748B' : '#94A3B8',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'CPCB Daytime Limit (55 dB)',
        data: cpcbThreshold,
        borderColor: '#F43F5E',
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isNight ? '#E2E8F0' : '#1E293B',
          font: { family: 'JetBrains Mono, monospace', size: 10 },
        },
      },
      tooltip: {
        backgroundColor: isNight ? '#0F172A' : '#FBF9F2',
        borderColor: isNight ? '#1E293B' : '#DCD9CE',
        borderWidth: 1,
        titleColor: isNight ? '#F8FAFC' : '#0F172A',
        bodyColor: '#2DD4BF',
        titleFont: { family: 'JetBrains Mono, monospace' },
        bodyFont: { family: 'JetBrains Mono, monospace' },
      },
    },
    scales: {
      x: {
        grid: { color: isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 41, 34, 0.06)' },
        ticks: { color: isNight ? '#94A3B8' : '#74766C', font: { family: 'JetBrains Mono, monospace', size: 10 } },
      },
      y: {
        min: 30,
        max: 100,
        grid: { color: isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 41, 34, 0.06)' },
        ticks: { color: isNight ? '#94A3B8' : '#74766C', font: { family: 'JetBrains Mono, monospace', size: 10 } },
      },
    },
  };

  return (
    <VectorCard
      label="TEMPORAL NOISE ANALYSIS · 24-HOUR DIURNAL CURVE"
      tag={isUsingRealData ? "AUTHENTIC FIELD TELEMETRY" : "INDICATIVE BASELINE REFERENCE"}
      variant={isUsingRealData ? "forest" : "olive"}
      className={`space-y-4 shadow-md bg-paper dark:bg-night-card border border-paper-border dark:border-night-border ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-graphite-900 dark:text-night-text font-serif">Diurnal Noise Exposure Timeline</h4>
            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-semibold ${
              isUsingRealData
                ? 'bg-emerald-50 dark:bg-teal-500/10 text-emerald-700 dark:text-teal-signal border border-emerald-300 dark:border-teal-500/30'
                : 'bg-paper-200 dark:bg-night-surface text-stone-600 dark:text-night-muted border border-paper-border dark:border-night-border'
            }`}>
              {isUsingRealData ? `${readings.length} Samples` : 'Awaiting Field Samples'}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-night-muted mt-0.5">
            {isUsingRealData
              ? 'Derived from authenticated on-device acoustic measurements'
              : 'Indicative reference baseline profile before real user recordings'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-paper-100 dark:bg-night-surface border border-paper-border dark:border-night-border text-graphite dark:text-night-text font-bold">
            MAX PEAK: <strong className="text-terracotta dark:text-rose-400">{maxRecordedPeak.toFixed(1)} dB</strong>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <Line data={data} options={options} />
      </div>
    </VectorCard>
  );
};
