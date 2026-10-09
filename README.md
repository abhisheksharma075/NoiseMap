# NoiseMap — Privacy-First Acoustic Intelligence PWA

> **Transforming 750M+ Indian Smartphones into a Distributed Acoustic Sensor Grid for Smarter, Quieter Cities.**

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![pdf-lib](https://img.shields.io/badge/pdf--lib-1.17-EC1C24?style=flat)](https://pdf-lib.js.org/)

---

## 📌 Executive Summary

India is the 2nd noisiest country globally, with over 500 million citizens subjected to hazardous ambient noise pollution daily. Yet, the entire nation relies on merely **~50 government-run static noise monitoring stations** across 1.4 billion people. Individual citizen complaints are routinely dismissed as subjective personal hypersensitivity due to lack of empirical timestamps and peer corroboration.

**NoiseMap** closes this regulatory void. Built as a zero-install Progressive Web App (PWA) with a bespoke **Retro-Vector Computing & Precision Acoustic Instrument HUD** aesthetic (inspired by *Zajno's Superlinked Open-Source vector infrastructure design*), NoiseMap turns any smartphone into an active acoustic sensor while preserving mathematical privacy.

---

## ⚡ The Closed-Loop Civic Pipeline

```
MEASURE  ──▶  MAP  ──▶  VERIFY  ──▶  ALERT  ──▶  ACT
 1-Tap        Live      3+ Peer      Geo-Push     CPCB Legal
 Audio       Radar     Consensus    Threshold     PDF Dossier
```

1. **MEASURE (1-Tap Sensory Edge):** 10-second ambient audio sample processed on-device via HTML5 Web Audio API (`AnalyserNode`). Computes Root Mean Square (RMS) decibels and peak impulse hold.
2. **MAP (Live Spatial Radar):** Sub-200ms real-time map sync rendering dynamic acoustic nodes color-coded to WHO/CPCB limits on CartoDB Dark Matter tiles.
3. **VERIFY (Consensus Engine):** Algorithmic spatial-temporal clustering ($100\,\text{m}$ radius, $15\,\text{min}$ sliding window, $\ge 3$ distinct citizen sessions) promotes noise spikes into **Verified Noise Incidents** with a 5-factor Evidence Confidence Score ($0\text{--}100\%$).
4. **ALERT (Geo-Fenced Push):** Users pin sensitive zones (Home, School, Hospital) and receive automated threshold alerts when sustained violations occur.
5. **ACT (Statutory Evidence Dossier):** Client-side vector `pdf-lib` engine compiles official complaint dossiers citing Rule 5 & 7 of the *Noise Pollution Rules, 2000*, ready for municipal filing.

---

## 🔒 Privacy-First Guarantees

- **Zero-Audio RAM Retention:** Raw PCM audio buffers exist exclusively in transient device RAM during the 10-second sampling window. As soon as decibels are computed, hardware streams are terminated and audio buffers are garbage-collected. **Zero audio recordings ever leave the phone.**
- **Mathematical 100m Coordinate Gridding:** GPS coordinates are mathematically rounded to 3 decimal places (`lat_grid = round(lat * 1000) / 1000`) on the client before transmission. Precise residential locations cannot be derived.
- **Zero-KYC Anonymous Ephemeral Sessions:** No accounts, sign-ups, emails, or phone numbers. Contributors use rotating crypto UUID tokens stored in `localStorage`.
- **Scientific Calibration Honesty:** Consumer microphones vary in hardware and AGC. NoiseMap explicitly frames readings as *crowdsourced relative acoustic estimates*, not certified Type-1 Sound Level Meter data.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript + Vite | Blazing fast HMR, strong typing for spatial & audio data contracts |
| **Styling & Design** | Tailwind CSS + Lucide Icons | Zajno retro-vector dark aesthetic (`#0B0F17`), CRT scanlines, phosphor glows |
| **Sensory Audio DSP** | HTML5 Web Audio API | Fast Fourier Transform (FFT) analysis, RMS calculation, zero persistence |
| **Interactive Heatmap** | Leaflet.js + CartoDB Dark Matter | High-performance vector circle canvas markers, pulse waves, zoom controls |
| **Evidence Dossier** | `pdf-lib` vector engine | Client-side statutory CPCB PDF complaint compilation (<400ms compile time) |
| **Analytics & Trends** | Chart.js + react-chartjs-2 | 24-hour diurnal acoustic curve vs statutory day/night threshold lines |
| **Database & Cloud** | PostgreSQL 15 + PostGIS | 6 strongly typed tables, GIST spatial indexes (`supabase/migrations/001_init.sql`) |
| **PWA & Offline** | Web App Manifest + Service Worker | Standalone mobile shell, offline cache fallback, home screen install prompt |

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node v24.14.1 & npm v11.11.0)

### 1. Installation
```powershell
# Clone or navigate to the workspace
cd NoiseMap

# Install dependencies (React, Vite, Leaflet, Tailwind, Chart.js, pdf-lib, Supabase)
npm.cmd install
```

### 2. Run Local Development Server
```powershell
npm.cmd run dev
# Opens at http://localhost:5173/ with live hot module replacement (HMR)
```

### 3. Run Automated E2E Verification Tests
```powershell
node scripts/test-runner.js
# Executes 5/5 unit & integration suites (DSP math, 100m grid snapping, clustering, scoring, PDF bytes)
```

### 4. Build for Production
```powershell
npm.cmd run build
# Compiles TypeScript and creates optimized bundle in dist/
```

### 5. Preview Production Bundle
```powershell
npm.cmd run preview
# Serves the production build on http://localhost:4173/
```

---

## 📊 Database Architecture (Supabase / PostGIS)

A full PostgreSQL 15 migration script with PostGIS spatial triggers is located at [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql). It defines:
1. `noise_readings` (Spatial points, GIST index, auto-generated grid cell IDs)
2. `noise_incidents` (Clustered verified violations with evidence scores)
3. `user_pins` (User monitored sensitive zones and dB thresholds)
4. `complaints` (Generated statutory audit logs)
5. `user_streaks` (Anonymous gamification progression)
6. `user_alerts` (Dispatched threshold notifications)

---

## 📂 Project Directory Structure

```
NoiseMap/
├── public/
│   ├── manifest.webmanifest      # PWA installation manifest
│   ├── sw.js                     # Offline cache-first service worker
│   └── radar-icon.svg            # Phosphor radar vector icon
├── scripts/
│   └── test-runner.js            # Automated E2E verification test runner
├── src/
│   ├── components/
│   │   ├── common/               # Zajno retro-vector HUD primitives
│   │   │   ├── VectorCard.tsx    # Glassmorphic panel with corner crosshairs (+)
│   │   │   ├── TactileButton.tsx # Mechanical spring tactile controls
│   │   │   ├── StatusBadge.tsx   # Monospace LED status indicator
│   │   │   └── AcousticGaugeBar.tsx # 24-segment phosphor decibel LED bar
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Top instrument telemetry HUD
│   │   │   ├── NavigationBar.tsx # Floating bottom dock (5 civic hubs)
│   │   │   ├── DemoSimulatorModal.tsx # Hackathon 1-click judging simulator
│   │   │   └── InstallPromptBanner.tsx # PWA install promotion prompt
│   │   ├── measure/              # 1-Tap audio capture modules
│   │   │   ├── MeasureView.tsx
│   │   │   ├── CircularNoiseGauge.tsx
│   │   │   ├── LiveWaveformVisualizer.tsx
│   │   │   └── SourceTaggerModal.tsx
│   │   ├── map/                  # Leaflet interactive mapping
│   │   │   ├── MapView.tsx
│   │   │   ├── LiveHeatmap.tsx
│   │   │   ├── MapFilterBar.tsx
│   │   │   └── NodePopupDetails.tsx
│   │   ├── incidents/            # Algorithmic incident consensus
│   │   │   ├── IncidentsView.tsx
│   │   │   ├── IncidentCard.tsx
│   │   │   └── EvidenceScoreBar.tsx
│   │   ├── evidence/             # CPCB statutory evidence hub
│   │   │   ├── EvidenceView.tsx
│   │   │   └── ComplaintGeneratorModal.tsx
│   │   ├── analytics/            # 24-hour diurnal curves
│   │   │   └── NoiseTimelineChart.tsx
│   │   └── profile/              # Civic ID & geofenced alert pins
│   │       ├── ProfileView.tsx
│   │       ├── AlertPinsPanel.tsx
│   │       └── BadgeDisplay.tsx
│   ├── services/
│   │   ├── audioDspService.ts    # Web Audio API FFT & RMS (Zero RAM audio retention)
│   │   ├── locationService.ts    # 100m grid mathematical snapping
│   │   ├── incidentEngine.ts     # Spatial-temporal consensus clustering
│   │   ├── complaintPdfService.ts# Client-side pdf-lib CPCB document generator
│   │   ├── notificationService.ts# Geofenced alert notification engine
│   │   └── noiseDataService.ts   # Dual-mode Supabase + offline reactive store
│   ├── utils/
│   │   └── scoreCalculator.ts    # 5-factor mathematical confidence scoring
│   ├── types/
│   │   └── index.ts              # Strongly typed TypeScript interfaces
│   ├── styles/
│   │   └── index.css             # Vector grid backgrounds, scanlines, animations
│   ├── App.tsx                   # Master reactive application router
│   ├── main.tsx                  # React DOM mount point
│   └── vite-env.d.ts             # Vite client environment types
├── supabase/
│   └── migrations/
│       └── 001_init.sql          # Production PostGIS 6-table schema
├── ARCHITECTURE.md               # Detailed technical architecture document
├── DEMO_SCRIPT_WALKTHROUGH.md    # 3-Minute 6-scene hackathon judging rehearsal script
├── PROJECT_EXECUTION_PLAN.md     # Master phase-by-phase execution tracker
└── package.json
```

---

## 🏆 Hackathon Team Wave Builders

- **Abhishek Sharma**
- **Aman Tyagi**
- **Abhishek Bharadwaj**

*NoiseMap: From Noise to Action — For Quieter, Healthier, Smarter Cities.*
