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
}

export const NoiseTimelineChart: React.FC<NoiseTimelineChartProps> = ({ className = '' }) => {
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  // Normal expected ambient baseline (typical city street)
  const baselineData = [44, 42, 40, 48, 56, 62, 60, 63, 65, 68, 58, 49];

  // Measured timeline showing evening spike violation
  const todayMeasured = [45, 43, 42, 49, 58, 64, 62, 65, 78, 86, 82, 54];

  // CPCB Residential Daytime threshold line
  const cpcbThreshold = Array(12).fill(55);

  const data = {
    labels: hours,
    datasets: [
      {
        label: "Today's Measured Noise (dB)",
        data: todayMeasured,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#EF4444',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Historical Baseline (dB)',
        data: baselineData,
        borderColor: '#00F2FE',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'CPCB Daytime Limit (55 dB)',
        data: cpcbThreshold,
        borderColor: '#F59E0B',
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
          color: '#94A3B8',
          font: { family: 'JetBrains Mono', size: 10 },
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#38BDF8',
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        min: 30,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  return (
    <VectorCard
      label="TEMPORAL NOISE ANALYSIS [24-HOUR DIURNAL CURVE]"
      tag="CHART.JS TELEMETRY"
      variant="cyan"
      className={`space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div>
          <h4 className="text-sm font-bold text-white">Before vs. After Violation Timeline</h4>
          <p className="text-xs text-slate-400">Proves continuous breach patterns over statutory daytime limits</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
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
