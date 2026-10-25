/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deliberate Urban Fieldwork Palette
        paper: {
          DEFAULT: '#F4F1E8',       // Warm Paper (primary daylight background)
          soft: '#FBF9F2',          // Soft Paper (elevated surfaces, cards, forms)
          border: '#DCD9CE',        // Paper Border (dividers, input boundaries)
          muted: '#EAE6D9',         // Muted Paper tint
        },
        graphite: {
          DEFAULT: '#252922',       // Graphite Ink (primary readable text)
          secondary: '#74766C',     // Stone (subdued supporting text)
          muted: '#8F9185',         // Muted graphite
        },
        forest: {
          DEFAULT: '#354C3C',       // Forest (primary brand actions)
          deep: '#26382D',          // Deep Forest (selected elements, active nav)
          hover: '#2A3D30',         // Forest hover
          subtle: '#E8EFEA',        // Subtle forest tint
          border: '#45614E',
        },
        olive: {
          DEFAULT: '#798263',       // Muted Olive (secondary accents, data markers)
          subtle: '#EDF1E7',
          dark: '#5C634B',
        },
        lime: {
          signal: '#D5E66B',        // Signal Lime (brand highlight & measurement focus)
          dark: '#A4B826',
          subtle: '#F6FCE0',
        },
        terracotta: {
          DEFAULT: '#C46E50',       // Terracotta (reporting, attention, violations)
          hover: '#AD5C3F',
          subtle: '#FAEEEA',
        },
        stone: {
          DEFAULT: '#74766C',       // Stone secondary text
          border: '#D5D3C8',
        },

        // Environmental-Tech Dark Navy Monitoring Theme
        night: {
          bg: '#0A0F1D',            // Deep Navy Obsidian background
          surface: '#0F172A',       // Elevated navy surface
          card: '#161F33',          // Polished navy card surface
          text: '#F8FAFC',          // Crisp light text
          secondary: '#94A3B8',     // High-legibility slate text
          border: '#1E293B',        // Subtle high-tech slate borders
        },

        // Restrained Environmental Teal & Mint Accents
        teal: {
          DEFAULT: '#0D9488',
          light: '#14B8A6',
          signal: '#2DD4BF',
          subtle: 'rgba(45, 212, 191, 0.12)',
        },

        // Retained and harmonized semantic badges
        surface: {
          DEFAULT: '#FBF9F2',
          dark: '#262E27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'field': '0 1px 3px rgba(37, 41, 34, 0.05), 0 1px 2px rgba(37, 41, 34, 0.03)',
        'field-md': '0 4px 6px -1px rgba(37, 41, 34, 0.07), 0 2px 4px -2px rgba(37, 41, 34, 0.04)',
        'field-lg': '0 10px 15px -3px rgba(37, 41, 34, 0.08), 0 4px 6px -4px rgba(37, 41, 34, 0.04)',
        'field-dark': '0 4px 12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
