# NOISEMAP — COMPREHENSIVE REMAINING TASKS & COMPLETION BACKLOG

**Document ID:** NM-DOC-FINAL-TASKS-004  
**Audit Date:** October 19, 2026  
**Auditor:** Technical Project Manager & Senior Architect

---

## 1. Prioritized Task Backlog

### Category A — Critical Blockers (P0)
*No blocking compilation or runtime crashes currently exist in the repository.*

---

### Category B — Core Functionality & Real-World Validation (P1)

#### `TASK-P1-01`: Production Supabase Project Provisioning & Live Key Insertion
- **Category:** Backend & Cloud Integration
- **Owner:** Aman Tyagi
- **Files Involved:** `.env`, `supabase/migrations/001_init.sql`, `supabase/migrations/002_rls_policies.sql`.
- **Problem:** App currently operates in offline fallback mode because `.env` lacks production Supabase keys.
- **Implementation Requirements:**
  1. Create a Supabase project at [supabase.com](https://supabase.com).
  2. Execute `001_init.sql` and `002_rls_policies.sql` in the Supabase SQL Editor.
  3. Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- **Acceptance Criteria:** `NoiseDataService.isCloudMode()` returns `true`; readings submitted on Device A sync to Device B via WebSockets.
- **Testing Procedure:** Run `node scripts/test-supabase-sync.js` with live `.env` credentials.

#### `TASK-P1-02`: Vite Rollup Bundle Chunk Splitting
- **Category:** Performance & Build Optimization
- **Owner:** Abhishek Sharma
- **Files Involved:** `vite.config.ts`.
- **Problem:** Production build produces a chunk warning: initial asset bundle is $1.18\,\text{MB}$ ($384\,\text{kB}$ gzipped), exceeding the 500 kB budget.
- **Implementation Requirements:**
  1. Configure `build.rollupOptions.output.manualChunks` in `vite.config.ts`.
  2. Split vendor libraries (`leaflet`, `pdf-lib`, `chart.js`) into separate chunks.
- **Acceptance Criteria:** `npm run build` compiles with zero chunks over 500 kB.
- **Testing Procedure:** Run `cmd /c "npm run build"` and verify terminal output has no warnings.

#### `TASK-P1-03`: Physical Mobile Hardware Verification on iOS Safari
- **Category:** Sensory Audio & Mobile QA
- **Owner:** Abhishek Bharadwaj
- **Files Involved:** `src/services/audioDspService.ts`, `src/hooks/useAudioCapture.ts`.
- **Problem:** Mobile Safari has aggressive audio auto-play restrictions. Must verify that Bharadwaj's monotonic token startup handles physical microphone prompts cleanly.
- **Implementation Requirements:**
  1. Start local dev server via `npm run dev -- --host`.
  2. Open on physical iPhone Safari over local Wi-Fi.
  3. Tap the circular gauge, grant permission, and verify 10-second capture completes with live decibels.
- **Acceptance Criteria:** 10-second measurement completes on physical iPhone Safari without error.
- **Testing Procedure:** Perform 5 consecutive measurements on iOS Safari; verify no frozen states.

---

### Category C — Integration & Visual Polish (P2)

#### `TASK-P2-01`: Production VAPID Push Key Registration
- **Category:** Notifications & Cloud
- **Owner:** Aman Tyagi
- **Files Involved:** `public/sw.js`, `src/services/notificationService.ts`, `.env`.
- **Problem:** Native OS-level push notifications require a public VAPID key to subscribe browser service workers.
- **Implementation Requirements:**
  1. Generate VAPID key pair via `web-push generate-vapid-keys`.
  2. Store public key in `VITE_VAPID_PUBLIC_KEY`.
  3. Wire subscription payload to Supabase `user_alerts` table.
- **Acceptance Criteria:** A threshold breach near a pinned quiet zone triggers an OS notification banner.
- **Testing Procedure:** Run `node scripts/test-notifications.js`.

#### `TASK-P2-02`: Leaflet Radar Radial Heatmap Blur Overlay
- **Category:** Frontend & Cartography
- **Owner:** Abhishek Sharma
- **Files Involved:** `src/components/map/LiveHeatmap.tsx`.
- **Problem:** Markers are rendered as discrete colored SVG circles. Adding a subtle radial blur gradient creates an authentic "AQI-style" visual atmosphere.
- **Implementation Requirements:**
  1. Apply radial CSS backdrop filters or canvas blur circles around high-decibel clusters.
  2. Ensure 60 FPS pan and zoom on mobile devices.
- **Acceptance Criteria:** High-density noise clusters render with a soft radial glow transitioning from green to red.
- **Testing Procedure:** Verify smooth map interaction on desktop and mobile viewports.

---

### Category D — Optional Enhancements & Future Scope (P3)

#### `TASK-P3-01`: On-Device AI Sound Classification (TensorFlow.js YAMNet)
- **Category:** Future Machine Learning
- **Owner:** Future Scope / Shared
- **Files Involved:** `src/services/aiClassifierService.ts`.
- **Problem:** Noise sources (Traffic, Construction, Loudspeaker) are currently selected manually by the citizen.
- **Implementation Requirements:**
  1. Load a quantized YAMNet audio model in an offscreen Web Worker.
  2. Suggest dominant noise source automatically from 10-second spectrogram.
- **Acceptance Criteria:** App automatically suggests "Loudspeaker" during festive music events.
