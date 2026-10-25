# NOISEMAP — COMPREHENSIVE PROJECT AUDIT & SYSTEM ARCHITECTURE REPORT

**Document ID:** NM-DOC-AUDIT-001  
**Project:** NoiseMap — Privacy-First Civic Acoustic Intelligence PWA  
**Date of Audit:** October 18, 2026  
**Auditor:** Senior Software Architect & QA Lead  
**Audit Scope:** Full codebase, dependencies, sensory pipelines, cartography, persistence layer, CPCB legal dossiers, test runners, and PWA configurations.

---

## 1. Executive Summary & Project Health

NoiseMap is an open-standard, privacy-first Progressive Web Application designed to turn everyday consumer smartphones into an anonymous, distributed environmental acoustic monitoring network. It addresses the systemic national monitoring void in India (merely ~50 Central Pollution Control Board static stations for 1.4B citizens) by enabling crowd-sourced decibel sampling, ~100m geodetic privacy gridding, multi-contributor spatial-temporal incident consensus, and statutory CPCB complaint PDF generation in $<400\,\text{ms}$.

### Project Health Scorecard
- **TypeScript & Build Health:** **100% CLEAN** (`npm run build` exits with code `0`, `tsc` emits zero errors, Vite compiles 2,204 modules cleanly).
- **Automated Verification Suite:** **5/5 SUITES PASSED (100% SUCCESS)** via `node scripts/test-runner.js`.
- **Runtime Integrity:** Zero runtime script crashes. Runs seamlessly on desktop and mobile browsers.
- **PWA Status:** Installable on iOS, Android, macOS, and Windows with active Service Worker caching, web app manifest, and multi-resolution maskable app icons.
- **Core Architecture:** Dual-mode design — operates autonomously with local browser storage (`localStorage`) and seamlessly syncs to Supabase Cloud PostgreSQL + PostGIS whenever cloud credentials are configured.

---

## 2. Actual Technology Stack Inventory

| Architectural Layer | Specific Technology | Version | Purpose in Codebase |
|:---|:---|:---|:---|
| **Frontend Framework** | React | `^18.3.1` | Declarative reactive UI components, hooks, and routing state |
| **Language & Typing** | TypeScript | `^5.7.3` | Strict type safety for coordinates, decibel metrics, and incident models |
| **Build System & Dev Server**| Vite | `^5.4.14` | Sub-second HMR, tree-shaking, CSS bundling, and production asset rollup |
| **Styling & Design System** | Tailwind CSS + Autoprefixer | `^3.4.17` | High-classic design tokens (Deep Obsidian Forest, Signal Lime, Warm Paper) |
| **Class Merging Utilities** | `clsx` + `tailwind-merge` | `^2.1.1` / `^3.0.2` | Conditional CSS class merging in reusable UI components |
| **Sensory Audio Processing** | HTML5 Web Audio API | Native Browser | In-memory DSP, Float32Array PCM streaming, RMS-to-dB SPL calibration |
| **Geospatial & Mapping** | Leaflet + React-Leaflet | `^1.9.4` / `^4.2.1` | Interactive vector map layers, acoustic heatmaps, and geodetic marker pins |
| **Map Tile Provider** | CARTO Dark Matter & OSM | Dynamic TileLayer | High-contrast dark basemaps with automatic failover to OpenStreetMap |
| **Document Generation** | `pdf-lib` | `^1.17.1` | Client-side vector PDF generation citing statutory CPCB 2000 Rules |
| **Visual Charting** | Chart.js + `react-chartjs-2` | `^4.4.8` / `^5.3.0` | Decibel timeline and historical frequency visual charts |
| **Iconography** | Lucide React | `^1.16.0` | Lightweight high-contrast vector UI icons |
| **Database & Cloud Sync** | Supabase JS Client | `^2.49.1` | Optional PostgreSQL 15 + PostGIS cloud backend with real-time WebSockets |
| **PWA & Caching** | Service Worker + Web Manifest | Native HTML5 | Offline app shell caching, standalone display mode, homescreen installation |
| **Audio Micro-Interactions**| Web Audio Oscillators | Native Browser | Synthesized dual-tone mallet/marimba tap sounds with mic-lock safeguards |

---

## 3. Architecture & 5-Tier Data Pipeline

```mermaid
flowchart TD
    subgraph T1["Tier 1: Sensory Edge (Client PWA)"]
        MIC["Microphone Hardware\nnavigator.mediaDevices"] --> DSP["Web Audio DSP Engine\nFloat32Array RMS -> dB SPL"]
        GPS["Location Sensor\nnavigator.geolocation"] --> GEO["100m Privacy Snapper\n3-Decimal Quantization"]
    end

    subgraph T2["Tier 2: In-Memory Isolation"]
        DSP -->|Zero Storage| RAM["Transient RAM Buffer\n(Immediately Destroyed)"]
        GEO --> PAYLOAD["Sanitized Civic Reading\n{grid_id, db_avg, db_peak, source}"]
    end

    subgraph T3["Tier 3: Consensus & Storage"]
        PAYLOAD --> PERSIST["Dual-Mode Persistence\nLocalStore / Supabase Edge"]
        PERSIST --> ENGINE["Incident Consensus Engine\n3+ Devices / 15-min Window"]
    end

    subgraph T4["Tier 4: Action & Legal Output"]
        ENGINE --> RADAR["Live Leaflet Radar\nRealtime Acoustic Heatmap"]
        ENGINE --> DOSSIER["pdf-lib Vector Engine\nCPCB Rule 5 & 7 Complaint PDF"]
    end

    classDef stage fill:#141E17,stroke:#D5E66B,stroke-width:1.5px,color:#FAF8F2;
    class T1,T2,T3,T4 stage;
```

### Architectural Principles Verified in Code:
1. **Zero-Raw Audio Retention:** Audited in `src/services/audioDspService.ts`. The audio stream is tapped via `AudioContext.createAnalyser()`, converted to RMS energy, and the media tracks are explicitly terminated (`track.stop()`) on measurement completion. No audio files or binary streams are ever written to disk or transmitted over HTTP/WebSockets.
2. **~100m Geodetic Privacy:** Audited in `src/services/locationService.ts`. Raw GPS coordinates are truncated on-device via `Math.round(coord * 1000) / 1000`. Precise room/house latitude/longitude coordinates are never emitted.
3. **Consensus-Driven Verification:** Audited in `src/services/incidentEngine.ts`. Single readings can never trigger an incident alone. An active verified incident requires $\ge 3$ distinct citizen session tokens in the same 100m geodetic grid within a 15-minute sliding window with $\text{Average dB} \ge 68.0\,\text{dB}$.
4. **Statutory Legal Defensibility:** Audited in `src/services/complaintPdfService.ts`. Direct in-browser PDF vector generation citing Rules 5 & 7 of *The Noise Pollution (Regulation and Control) Rules, 2000* under the *Environment (Protection) Act, 1986*.

---

## 4. Codebase Directory Map

```text
NoiseMap/
├── public/                     # Static PWA assets & high-classic branding
│   ├── apple-touch-icon.png    # iOS homescreen icon
│   ├── banner-logo.svg         # High-resolution vector header logo
│   ├── favicon.svg             # 32x32 vector browser tab icon
│   ├── manifest.webmanifest    # PWA configuration and scope manifest
│   ├── pwa-192x192.png         # Standard Android PWA icon
│   ├── pwa-512x512.png         # High-density splash icon
│   ├── radar-icon.svg          # Master 512x512 vector symbol
│   └── sw.js                   # Service worker cache implementation
├── scripts/                    # Automated testing & verification suites
│   ├── test-audio-dsp.js       # RMS and dB SPL calculation verification
│   ├── test-data-flow.js       # Grid snapping & consensus validation
│   └── test-runner.js          # Master E2E 5/5 verification runner
├── src/                        # Main application source code
│   ├── components/             # Reusable and page-level React components
│   │   ├── analytics/          # Chart.js decibel timeline components
│   │   ├── common/             # Cards, buttons, gauges, and logos
│   │   ├── evidence/           # CPCB dossier views and export modals
│   │   ├── incidents/          # Incident cards, lists, and scoring bars
│   │   ├── landing/            # High-classic landing page & avatar
│   │   ├── layout/             # Header, navigation, and simulator modals
│   │   ├── map/                # Leaflet radar, popups, and layer toggles
│   │   ├── measure/            # Circular gauge, avatar, & waveform
│   │   └── profile/            # Ephemeral Civic ID, badges, & pins
│   ├── context/                # Theme context (Dark / Light)
│   ├── hooks/                  # Custom audio capture hook (`useAudioCapture`)
│   ├── lib/                    # Supabase client initialization & validation
│   ├── services/               # Core business logic & singleton engines
│   │   ├── audioDspService.ts  # Web Audio API analyser & RMS processing
│   │   ├── complaintPdfService.ts # pdf-lib statutory dossier generator
│   │   ├── incidentEngine.ts   # PostGIS / Haversine consensus clustering
│   │   ├── locationService.ts  # Geolocation & 100m grid snapping
│   │   ├── mapConfigService.ts # Leaflet basemap providers & fallbacks
│   │   ├── noiseDataService.ts # LocalStorage & Supabase persistence
│   │   ├── notificationService.ts # Geofenced pin breach evaluator
│   │   └── soundFeedbackService.ts # Synthesized UI audio feedback
│   ├── styles/                 # Tailwind custom utility classes & tokens
│   ├── types/                  # Master TypeScript data contracts
│   ├── utils/                  # Noise classification & scoring formulas
│   ├── App.tsx                 # Root layout & tab router
│   ├── main.tsx                # React DOM entry point
│   └── vite-env.d.ts           # Vite client environment typing
├── supabase/                   # Database migrations & PostGIS schema
│   └── migrations/
│       └── 001_init.sql        # 6-table spatial database schema
├── .env.example                # Example environment variables
├── ARCHITECTURE.md             # High-level architecture documentation
├── index.html                  # HTML5 entry shell with viewport meta
├── package.json                # Project dependencies and build scripts
├── README.md                   # Project overview & live deployment links
├── tailwind.config.js          # Bespoke theme design tokens
└── tsconfig.json               # Strict TypeScript configuration
```

---

## 5. Database Schema & Persistence State

### Implemented Schema: `supabase/migrations/001_init.sql`
The database schema consists of **6 relational PostGIS tables**:
1. `noise_readings`: Stores individual crowd-sourced contributions (`lat`, `lng`, generated `grid_id`, `db_avg`, `db_peak`, `source_type`, `zone_type`, `geom` Point).
2. `noise_incidents`: Stores multi-witness clustered incidents (`center_lat`, `center_lng`, `started_at`, `last_seen_at`, `duration_min`, `avg_db`, `peak_db`, `reading_count`, `unique_users`, `evidence_score`, `status`).
3. `user_pins`: Stores citizen geofenced watchpoints (`home`, `school`, `hospital`, `office`, `radius_m`, `threshold_db`).
4. `complaints`: Stores generated CPCB complaint records with verification references.
5. `user_streaks`: Tracks anonymous gamified civic participation (`total_readings`, `verified_readings`, `current_streak`, `badge_level`).
6. `user_alerts`: Log of dispatched threshold breach notifications.

### Dual-Mode Persistence Architecture
- **Offline / Autonomous Mode (Active by default):** If Supabase environment variables are missing, `noiseDataService.ts` seamlessly utilizes a local browser storage engine (`localStorage`) pre-seeded with realistic baseline readings in Guwahati (`demo-1` through `demo-5`). The application remains 100% functional without internet connectivity.
- **Cloud Mode (Auto-activated):** When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in `.env`, the service automatically transmits readings to PostgreSQL via Supabase REST & WebSocket subscriptions.

---

## 6. Verification Results & Testing Log

All test suites were executed directly against the current repository state:

```text
======================================================
🧪 NOISEMAP E2E AUTOMATED VERIFICATION SUITE
======================================================

[TEST 1/5] DSP Audio RMS to Decibel Conversion: ✅ PASSED (RMS 0.05 -> 72 dB SPL estimated)
[TEST 2/5] 100m Mathematical Privacy Grid Snapping: ✅ PASSED (26.14418934, 91.73684122 -> Grid 26.144_91.737)
[TEST 3/5] Algorithmic Multi-Contributor Consensus (3+ Users): ✅ PASSED (2 users rejected, 3rd user triggers ACTIVE incident)
[TEST 4/5] 5-Factor Mathematical Evidence Confidence Formula: ✅ PASSED (Computed Confidence: 78.4%)
[TEST 5/5] Client-Side CPCB PDF Document Vector Binary: ✅ PASSED (894 bytes compiled cleanly with %PDF- header)

======================================================
SUMMARY: 5/5 TEST SUITES PASSED (100% SUCCESS)
======================================================
```

---

## 7. Known Limitations & Technical Risks

1. **Hardware Transducer Calibration Variance:** Consumer smartphone microphones do not possess Type-1 acoustic laboratory certification. While the software utilizes logarithmic normalization with a 98.0 dB SPL calibration offset, readings are accurately framed as **relative crowd-sourced estimates** rather than certified metrological measurements.
2. **Background Audio Constraints on iOS Safari:** Mobile Safari restricts microphone capture when the screen is locked or when the browser tab is backgrounded. Continuous passive monitoring requires the PWA tab to remain active.
3. **Map Tile Rate Limits:** CARTO Dark Matter tiles operate with zero-key access for moderate volumes. If high-volume rate limiting occurs, the app incorporates an automatic fallback to standard OpenStreetMap tiles (`osm_dark` in `mapConfigService.ts`).
4. **Supabase Cloud Dependency:** In deployments lacking a configured Supabase backend, multi-device consensus is simulated locally. Cross-device synchronization requires provisioning a live Supabase project.
