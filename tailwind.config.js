/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#111827',
          elevated: '#182234',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        retro: {
          amber: '#F59E0B',
          'amber-dim': '#B45309',
          cyan: '#00F2FE',
          'cyan-dim': '#0891B2',
          emerald: '#10B981',
          crimson: '#EF4444',
          muted: '#64748B',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-crimson': '0 0 25px -2px rgba(239, 68, 68, 0.45)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [],
}
