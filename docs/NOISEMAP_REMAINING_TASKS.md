# NOISEMAP — REMAINING TASKS & PRIORITIZED ENGINEERING BACKLOG

**Document ID:** NM-DOC-TASK-003  
**Sprint Cycle:** Pre-Hackathon & Teammate Handover  
**Target Delivery:** Production Readiness & Live Demonstration

---

## 1. Prioritization Framework

- **P0 — Critical:** Fundamental security, blocking bugs, or core data pipeline defects.
- **P1 — High:** Essential features required to complete the end-to-end user journey across all real-world devices.
- **P2 — Medium:** Polish, multi-user real-time sync, automated alert push, and performance optimizations.
- **P3 — Low:** Optional future expansions (on-device AI models, predictive municipal heatmaps).

---

## 2. Prioritized Task Backlog

### P0 — Critical Priority Tasks

#### `TASK-P0-01`: Physical Hardware Microphone Verification on iOS Safari
- **Problem:** Web Audio API on iOS Safari has strict auto-play policies and background thread suspension. While simulated tests pass, physical iPhone testing must verify that the microphone stream resumes cleanly after user taps the gauge.
- **Affected Files:** `src/services/audioDspService.ts`, `src/components/measure/MeasureView.tsx`.
- **Requirements:** 
  1. Verify `AudioContext.resume()` executes inside the direct touch event handler on iOS.
  2. Confirm permission denial displays a user-friendly error card rather than failing silently.
- **Suggested Owner:** Workstream C (Core Functionality Lead).
- **Effort:** Small.
- **Definition of Done:** 10-second capture completes on physical iPhone Safari, displaying live decibels.

---

### P1 — High Priority Tasks

#### `TASK-P1-01`: Connect Live Supabase Project & Execute Migrations
- **Problem:** Currently, the application defaults to the offline autonomous LocalStorage mode because `.env` lacks production Supabase keys. Teammates must connect a live project to enable real-time cross-device consensus.
- **Affected Files:** `.env`, `supabase/migrations/001_init.sql`, `src/lib/supabase.ts`.
- **Requirements:**
  1. Create a Supabase project at [supabase.com](https://supabase.com).
  2. Run the SQL script `supabase/migrations/001_init.sql` in the Supabase SQL editor to create the 6 tables and GIST spatial indexes.
  3. Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
  4. Test that `noiseDataService.submitReading()` successfully writes to `noise_readings` in PostgreSQL.
- **Suggested Owner:** Workstream B (Backend & Database Lead).
- **Effort:** Medium.
- **Definition of Done:** Readings submitted on Device A appear in the Supabase table and sync to Device B via WebSockets.

#### `TASK-P1-02`: Bundle Chunk Optimization & Code Splitting
- **Problem:** Production build produces a chunk warning: `dist/assets/index-ea-IlQmx.js` is $1.18\,\text{MB}$ ($382\,\text{kB}$ gzipped), which exceeds the recommended 500 kB initial budget.
- **Affected Files:** `vite.config.ts`.
- **Requirements:**
  1. Configure `build.rollupOptions.output.manualChunks` in `vite.config.ts`.
  2. Split vendor bundles: `leaflet`, `pdf-lib`, and `chart.js` into separate async lazy-loaded chunks.
- **Suggested Owner:** Workstream A (Frontend Lead).
- **Effort:** Small.
- **Definition of Done:** `npm run build` generates clean chunks with zero warnings over 500 kB.

---

### P2 — Medium Priority Tasks

#### `TASK-P2-01`: Real Web Push Notification Service Worker Integration
- **Problem:** Geofenced pin breaches currently log to the console and in-app toasts. Real OS-level push notifications require Web Push VAPID key registration.
- **Affected Files:** `public/sw.js`, `src/services/notificationService.ts`.
- **Requirements:**
  1. Add Web Push event listener in `public/sw.js` (`self.addEventListener('push', ...)`).
  2. Request `Notification.requestPermission()` when user pins a new quiet zone in `AlertPinsPanel.tsx`.
  3. Trigger local system notification when an active incident breaches a pinned radius.
- **Suggested Owner:** Workstream B / C.
- **Effort:** Medium.
- **Definition of Done:** When an incident exceeds 70 dB near a pinned home zone, the browser emits a native system alert.

#### `TASK-P2-02`: Dynamic Leaflet Heatmap Layer Polish
- **Problem:** Leaflet currently renders discrete colored circles for noise readings and incidents. Adding a gradient density heatmap overlay (`leaflet.heat` or canvas density interpolation) will enhance the visual "AQI-style" aesthetic.
- **Affected Files:** `src/components/map/LiveHeatmap.tsx`.
- **Requirements:**
  1. Implement a canvas-based radial blur gradient around high-decibel clusters.
  2. Maintain 60 FPS pan and zoom performance on mobile devices.
- **Suggested Owner:** Workstream A (Frontend Lead).
- **Effort:** Medium.
- **Definition of Done:** High-density noise clusters display a smooth radial gradient transitioning from green to red.

---

### P3 — Low Priority / Future Enhancements

#### `TASK-P3-01`: On-Device AI Sound Classification (TensorFlow.js YAMNet)
- **Problem:** Noise sources (traffic, construction, music, industrial) are currently tagged manually by the citizen via a modal.
- **Affected Files:** `src/services/audioDspService.ts`, new `src/services/aiClassifierService.ts`.
- **Requirements:**
  1. Load a lightweight quantized YAMNet model in an offscreen Web Worker.
  2. Predict the top noise category from the 10-second spectrogram without transmitting audio.
- **Suggested Owner:** Workstream C / Future Scope.
- **Effort:** Large.
- **Definition of Done:** App automatically suggests "Loudspeaker" or "Heavy Traffic" based on acoustic frequency peaks.
