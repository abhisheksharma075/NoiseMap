# NoiseMap — Phase-by-Phase Master Execution Prompts & Specifications

This memory document details the exact technical prompts, scope, file paths, acceptance tests, and engineering requirements for every upcoming phase of the NoiseMap project.

---

## Phase 2: Project Initialization & Tooling Setup
- **Objective:** Establish the production-grade React 18 + TypeScript + Vite project foundation in the root directory, install all required peer dependencies without version conflicts, and verify clean compilation.
- **Detailed Step Prompts:**
  1. *Scaffold Tooling:* Create root Vite configuration, `package.json`, `tsconfig.json`, `tsconfig.node.json`, and `.gitignore`.
  2. *Install Dependencies:* Using `npm.cmd` (handling Windows execution policies), install `@supabase/supabase-js`, `leaflet`, `react-leaflet`, `@types/leaflet`, `pdf-lib`, `chart.js`, `react-chartjs-2`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite` (or PostCSS tailwind setup), and font tokens.
  3. *Environment Variables:* Establish `.env` and `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  4. *Compilation Verification:* Execute `npm.cmd run build` to verify clean TypeScript compilation and zero bundle errors.
- **Definition of Done:** Project compiles, dev server starts without error, and clean base dependencies are locked.

---

## Phase 3: Zajno Retro-Vector & Precision HUD Design System
- **Objective:** Implement the bespoke retro-vector computing design tokens, coordinate background grid, typography, custom oscilloscope animations, and tactile UI components.
- **Detailed Step Prompts:**
  1. *Styling Engine & CSS Tokens:* Configure Tailwind with deep obsidian `#0B0F17`, card slate `#111827`, oxidized amber `#F59E0B`, phosphor cyan `#00F2FE`, acoustic emerald `#10B981`, and alert crimson `#EF4444`.
  2. *Background Grid & Registration Marks:* Implement SVG/CSS vector hairline grids (`rgba(255,255,255,0.04)`) with corner crosshair registration marks (`+`) and scanning radar beams.
  3. *Core HUD Primitives:* Create `Button` (tactile mechanical feel), `Card` (glassmorphic bordered container with glowing corner accents), `Badge` (monospace system tags like `[SYS_OK]`), and `Modal` (cinematic overlay).
  4. *Navigation & Header:* Implement high-tech terminal Header with live status indicators (WebSocket latency, GPS lock status, active incidents counter) and a mobile-first bottom dock (`MEASURE`, `MAP`, `INCIDENTS`, `PROFILE`).

---

## Phase 4: Sensory Audio Capture & Edge DSP Engine
- **Objective:** Implement the HTML5 Web Audio API sensory pipeline for 10-second ambient audio capture with zero audio persistence, real-time waveform visualization, and 100m coordinate quantization.
- **Detailed Step Prompts:**
  1. *Audio DSP Service (`audioDspService.ts`):* Construct `AudioContext` + `AnalyserNode` FFT frequency analysis, calculating real-time RMS, instantaneous decibels, rolling average dB, and peak dB.
  2. *Privacy Layer & Ram Flush:* Guarantee that the `MediaStreamTrack` is stopped and `AudioContext` closed immediately after 10 seconds. Zero audio files or raw byte arrays are ever stored.
  3. *Circular Vector Gauge (`CircularNoiseGauge.tsx`):* Build custom SVG circular decibel gauge (0–120 dB) with dynamic needle/arc animation and color transitions matching WHO/CPCB limits.
  4. *Vector Oscilloscope Canvas (`LiveWaveformVisualizer.tsx`):* Render high-fps green/amber CRT phosphor waveform trails on HTML5 `<canvas>`.
  5. *Source Tagger Modal (`SourceTaggerModal.tsx`):* Allow user to tag noise source (Traffic, Construction, Loudspeaker, Industrial, Aircraft, Siren, Unknown).
  6. *GPS Privacy Snapping (`locationService.ts`):* Implement `Math.round(coord * 1000) / 1000` (~100m grid cell) and anonymous UUID generation.

---

## Phase 5: Interactive Leaflet Heatmap & Real-Time Sync
- **Objective:** Deploy the full-featured interactive Leaflet map with CartoDB Dark Matter tiles, acoustic pulse rings, city navigation presets, and sub-200ms real-time updates.
- **Detailed Step Prompts:**
  1. *Leaflet Dark Theme Setup (`LiveHeatmap.tsx`):* Render Leaflet map with CartoDB Dark tiles, custom zoom controls, and geolocation centering.
  2. *Dynamic Acoustic Vector Markers:* Render color-coded circles (Emerald `<50dB`, Amber `50–70dB`, Orange `70–85dB`, Crimson `>85dB`) with animated expanding pulse waves for active readings.
  3. *Quick-Jump Presets:* Add rapid navigation for key cities: Guwahati (IITG / GS Road / Zoo Road), Delhi NCR, Mumbai, Bengaluru.
  4. *Filter Controls (`MapFilterBar.tsx`):* Filter by time (Live / 1h / 24h / 7d) and categorical source type.
  5. *Interactive Popups (`IncidentPopup.tsx`):* Display detailed decibel stats, time elapsed, source tag, and reading counts.

---

## Phase 6: Algorithmic Incident Engine & Confidence Scoring
- **Objective:** Implement the multi-contributor spatial-temporal consensus verification engine and mathematical confidence scoring formula.
- **Detailed Step Prompts:**
  1. *Spatial-Temporal Clustering (`incidentEngine.ts`):* Detect when $\ge 3$ distinct sessions report noise exceeding zone thresholds (e.g. $>70\,\text{dB}$) in the same 100m grid cell within a 15-minute sliding window.
  2. *Mathematical Confidence Scoring (`scoreCalculator.ts`):*
     $$\text{Score} = (0.25 \times C_{\text{count}}) + (0.25 \times C_{\text{users}}) + (0.20 \times C_{\text{duration}}) + (0.15 \times C_{\text{avg}}) + (0.15 \times C_{\text{peak}})$$
  3. *Incident Cards & Badges (`IncidentCard.tsx`, `EvidenceScoreBar.tsx`):* Render high-priority glowing warning card with verification criteria checkmarks (`100m Grid ✓`, `15-min Window ✓`, `3+ Devices ✓`).
  4. *Community Incident Banner (`IncidentBanner.tsx`):* Top-level broadcast banner alerting users to active verified civic violations.

---

## 7. Phase 7: CPCB Statutory Evidence Dossier (PDF Engine)
- **Objective:** Generate legally defensible, printable CPCB complaint packages client-side using `pdf-lib` without any backend latency.
- **Detailed Step Prompts:**
  1. *Legal Template Engine (`complaintPdfService.ts`):* Generate official letterhead referencing the *Noise Pollution (Regulation and Control) Rules, 2000*, citing Section 5 & 7.
  2. *Data Compilation:* Embed reference ID (`CPCB-NM-2026-XXXX`), GPS coordinates & landmark, start/end timestamps, duration, average/peak decibels, contributor count, and confidence score.
  3. *Acoustic Curve Embedding:* Draw vector decibel time-series comparison chart and statutory threshold lines directly onto the PDF canvas.
  4. *One-Tap Download Action (`ComplaintGeneratorModal.tsx`):* Instant PDF generation and browser file download within 400ms.

---

## 8. Phase 8: Geo-Pins, Alerts, Analytics & Gamification
- **Objective:** Allow users to monitor sensitive zones, receive simulated push/toast alerts, explore 24h time-series trends, and earn civic engagement streaks.
- **Detailed Step Prompts:**
  1. *User Pinned Zones (`AlertPinsPanel.tsx`):* Allow user to pin Home, School, or Work with customizable threshold (e.g., 65 dB).
  2. *Alert Notification Handler (`notificationService.ts`):* Trigger browser Notification API or custom HUD audio alert when an incident intersects a pinned zone.
  3. *Before/After Noise Graph (`NoiseTimelineChart.tsx`):* Chart.js line graph displaying 24-hour diurnal acoustic curve vs statutory day/night limits.
  4. *Civic Streaks & Badges (`BadgeDisplay.tsx`):* Award *Noise Watcher* (10), *Community Sensor* (25), and *Noise Guardian* (50) badges with local persistence.

---

## 9. Phase 9: Dual-Mode Backend & Live Demo Simulator
- **Objective:** Build a bulletproof dual-mode storage layer (Supabase PostgreSQL + autonomous in-memory store) and an interactive floating Demo Simulator Toolbar for live presentations.
- **Detailed Step Prompts:**
  1. *Dual-Mode Store (`noiseDataService.ts`, `mockStore.ts`):* If Supabase credentials are valid, sync with cloud; otherwise, seamlessly operate offline with zero errors.
  2. *Floating Demo Simulator HUD (`DemoSimulatorModal.tsx`):* A bottom floating controller with one-click scenarios:
     - Scenario A: "Simulate 3 Citizens on GS Road (82 dB)" → triggers real-time clustering, confidence score calculation, and active alert.
     - Scenario B: "Simulate Evening Festival at Zoo Road (94 dB)" → instant critical violation incident.
     - Scenario C: "Reset & Clear Grid".

---

## 10. Phase 10: PWA Offline Shell & Polish
- **Objective:** Configure web manifest, service worker caching, app icons, and full mobile responsiveness.
- **Detailed Step Prompts:**
  1. *Web App Manifest (`manifest.webmanifest`):* Name, icons (192px, 512px), theme color `#0B0F17`, standalone display mode.
  2. *Service Worker (`sw.js`):* Cache app shell, fonts, and map tiles for offline availability.
  3. *Mobile Viewport & Touch Optimization:* Optimize navigation dock, gauge touch responsiveness, and mobile card spacing.

---

## 11. Phase 11: End-to-End Testing & Verification
- **Objective:** Execute comprehensive unit, integration, and manual test suites across all core features.
- **Detailed Step Prompts:**
  1. *DSP & Math Tests:* Validate decibel calculations, FFT normalization, and coordinate rounding logic.
  2. *Clustering Tests:* Verify spatial distance calculation and 3-session verification triggers.
  3. *PDF Compilation Test:* Verify valid PDF binary generation and layout.
  4. *Build & Linter Verification:* Confirm zero TypeScript errors and successful production build.

---

## 12. Phase 12: Final Hackathon Deliverables & Presentation Script
- **Objective:** Complete all project documentation, demo rehearsal guide, and delivery readiness.
- **Detailed Step Prompts:**
  1. *Final Execution Log:* Update `PROJECT_EXECUTION_PLAN.md` with verified test results.
  2. *Demo Workflow Script:* 3-minute, 6-scene judging pitch walkthrough matching presentation slide 15.
  3. *Setup Documentation:* Complete `README.md` with step-by-step developer setup and CPCB regulatory references.
