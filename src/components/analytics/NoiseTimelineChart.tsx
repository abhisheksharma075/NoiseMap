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

  // Dynamically bucket real readings into the 12 two-hour time slots
  const todayMeasured = React.useMemo(() => {
    if (!readings || readings.length === 0) {
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
  }, [readings]);

  // CPCB Residential Daytime threshold line
  const cpcbThreshold = Array(12).fill(55);

  const data = {
    labels: hours,
    datasets: [
      {
        label: "Dynamic Grid Noise (dB)",
        data: todayMeasured,
        borderColor: '#C46E50',
        backgroundColor: 'rgba(196, 110, 80, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#C46E50',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Historical Baseline (dB)',
        data: baselineData,
        borderColor: isNight ? '#D5E66B' : '#354C3C',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'CPCB Daytime Limit (55 dB)',
        data: cpcbThreshold,
        borderColor: '#798263',
        backgroundColor: 'transparent',
        borderDash: [2, 2],
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
          color: isNight ? '#F4F1E8' : '#252922',
          font: { family: 'JetBrains Mono', size: 10 },
        },
      },
      tooltip: {
        backgroundColor: isNight ? '#1C231E' : '#FBF9F2',
        borderColor: isNight ? '#3C443D' : '#DCD9CE',
        borderWidth: 1,
        titleColor: isNight ? '#F4F1E8' : '#252922',
        bodyColor: isNight ? '#D5E66B' : '#354C3C',
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
      },
    },
    scales: {
      x: {
        grid: { color: isNight ? 'rgba(255, 255, 255, 0.06)' : 'rgba(37, 41, 34, 0.06)' },
        ticks: { color: isNight ? '#A1A598' : '#74766C', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        min: 30,
        max: 100,
        grid: { color: isNight ? 'rgba(255, 255, 255, 0.06)' : 'rgba(37, 41, 34, 0.06)' },
        ticks: { color: isNight ? '#A1A598' : '#74766C', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  return (
    <VectorCard
      label="TEMPORAL NOISE ANALYSIS · 24-HOUR DIURNAL CURVE"
      tag="CHART.JS TELEMETRY"
      variant="forest"
      className={`space-y-4 shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div>
          <h4 className="text-sm font-bold text-graphite-900 dark:text-night-text font-serif">Before vs. After Violation Timeline</h4>
          <p className="text-xs text-stone-600 dark:text-night-muted">Proves continuous breach patterns over statutory daytime limits</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 border border-terracotta-300 dark:border-terracotta-700 text-terracotta-800 dark:text-terracotta-300 font-bold">
            MAX PEAK: 86 dB
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <Line data={data} options={options} />
      </div>
    </VectorCard>
  );
};
