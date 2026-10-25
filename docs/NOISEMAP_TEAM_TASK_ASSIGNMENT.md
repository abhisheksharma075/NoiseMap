# NOISEMAP — TEAM WORKSTREAM & TASK ASSIGNMENT PLAN

**Document ID:** NM-DOC-ASSIGN-004  
**Sprint Cycle:** Team Collaboration & Parallel Execution  
**Objective:** Enable 3 teammates to develop in parallel without code collisions or file merge conflicts.

---

## 1. Workstream Division Overview

To prevent multiple developers from editing the same critical files at the same time, the project is structured into three clear, decoupled workstreams:

```text
Teammate A (Workstream A) ──▶ Frontend UI, Visual Polish, PWA & Vite Optimization
Teammate B (Workstream B) ──▶ Backend, Supabase Cloud Integration & Push Notifications
Teammate C (Workstream C) ──▶ Core Audio DSP, Real-Device Testing & Sensor Calibration
```

---

## 2. Teammate A — Frontend UI, Map Visuals & PWA Lead

### Primary Responsibilities
- User interface polish, responsive mobile design, and component ergonomics.
- Vite build performance and bundle chunk optimization.
- Interactive map visual styling and heatmap gradient layers.

### Assigned Tasks
1. **`TASK-P1-02`: Bundle Chunk Optimization & Code Splitting**
   - **Target File:** `vite.config.ts`.
   - **Action:** Configure manual chunks for vendor libraries (`leaflet`, `pdf-lib`, `chart.js`). Eliminate the 500 kB build warning.
2. **`TASK-P2-02`: Dynamic Leaflet Heatmap Layer Polish**
   - **Target File:** `src/components/map/LiveHeatmap.tsx`.
   - **Action:** Enhance visual marker styling with smooth radial color gradients without degrading mobile touch responsiveness.
3. **PWA Mobile Safe-Area Verification**
   - **Target Files:** `src/components/layout/NavigationBar.tsx`, `src/components/layout/Header.tsx`.
   - **Action:** Ensure docked navigation bar respects notch/home-bar margins (`env(safe-area-inset-bottom)`).

### Files Owned by Teammate A (Exclusive Ownership)
- `vite.config.ts`
- `src/components/landing/*`
- `src/components/common/*`
- `src/components/layout/NavigationBar.tsx`
- `src/styles/*`

---

## 3. Teammate B — Backend, Cloud Sync & Push Notifications Lead

### Primary Responsibilities
- Live Supabase project provisioning and spatial database schema migrations.
- Real-time WebSocket pub/sub synchronization across multi-user sessions.
- Service Worker Web Push notification architecture for geofenced breach alerts.

### Assigned Tasks
1. **`TASK-P1-01`: Connect Live Supabase Project & Execute Migrations**
   - **Target Files:** `.env`, `supabase/migrations/001_init.sql`, `src/lib/supabase.ts`.
   - **Action:** Create project, run migration script, verify table creation (`noise_readings`, `noise_incidents`, etc.), and test REST insert.
2. **`TASK-P2-01`: Web Push Notification Integration**
   - **Target Files:** `public/sw.js`, `src/services/notificationService.ts`, `src/components/profile/AlertPinsPanel.tsx`.
   - **Action:** Wire up browser Notification API to dispatch system alerts when geofenced pins detect incident breaches.
3. **Supabase Realtime Channel Subscription Verification**
   - **Target File:** `src/services/noiseDataService.ts`.
   - **Action:** Ensure new readings broadcast over WebSockets update the Leaflet map on connected peer devices in $<200\,\text{ms}$.

### Files Owned by Teammate B (Exclusive Ownership)
- `supabase/migrations/*`
- `src/lib/supabase.ts`
- `src/services/noiseDataService.ts`
- `src/services/notificationService.ts`
- `public/sw.js`

---

## 4. Teammate C — Core Audio DSP, Quality Assurance & Mobile Testing Lead

### Primary Responsibilities
- Web Audio API DSP pipeline verification on physical smartphones.
- Incident consensus algorithms and mathematical evidence scoring.
- Comprehensive end-to-end test execution and hardware sensor calibration.

### Assigned Tasks
1. **`TASK-P0-01`: Physical Hardware Microphone Verification on iOS Safari**
   - **Target Files:** `src/services/audioDspService.ts`, `src/hooks/useAudioCapture.ts`.
   - **Action:** Verify iOS touch-start audio context resumption and permission denial handling.
2. **Real-World Ambient Calibration Testing**
   - **Target Files:** `src/services/audioDspService.ts`, `scripts/test-audio-dsp.js`.
   - **Action:** Test decibel readings against reference ambient environments (quiet room ~35–45 dB, office ~55–65 dB, roadside traffic ~75–85 dB).
3. **Expanding the Automated Test Suite**
   - **Target Files:** `scripts/test-runner.js`, new test scripts.
   - **Action:** Add automated integration tests for pin breach evaluation and PDF byte validation.

### Files Owned by Teammate C (Exclusive Ownership)
- `src/services/audioDspService.ts`
- `src/hooks/useAudioCapture.ts`
- `src/services/incidentEngine.ts`
- `src/services/complaintPdfService.ts`
- `src/utils/*`
- `scripts/*`

---

## 5. Shared Files & Integration Rules

The following files are touched by multiple workstreams:
- `src/App.tsx`: The application root router and state coordinator.
- `src/types/index.ts`: The central TypeScript data contracts.

### Conflict Prevention Protocol
1. **Type Changes First:** If you need to change a data contract in `src/types/index.ts`, discuss with teammates before committing.
2. **App.tsx State Isolation:** Do not add heavy inline logic to `App.tsx`. All business logic must reside inside dedicated services in `src/services/`.
3. **Branch Merging Order:**
   - Step 1: Teammate B lands Supabase schema and database connection.
   - Step 2: Teammate C verifies audio DSP and physical mobile capture.
   - Step 3: Teammate A lands UI visual polish and bundle chunk optimizations.
