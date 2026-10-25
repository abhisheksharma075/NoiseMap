# NOISEMAP — DEVELOPER CONTRIBUTION & TASK VERIFICATION REPORT

**Document ID:** NM-DOC-FINAL-CONTRIB-003  
**Audit Date:** October 19, 2026  
**Auditor:** Team Integration Specialist & Senior Architect

---

## 1. Attribution Methodology & Evidence Standards

Every attribution in this document is backed by verifiable Git commit logs, branch histories, file modification diffs, and automated test execution results. Contributions are categorized strictly based on concrete evidence.

---

## 2. Developer Contribution Breakdown

### ☁️ Aman Tyagi (Teammate B — Backend, Cloud Sync & Notifications Lead)
- **Git Commit Attribution:**
  - `fd410b4`: README updates.
  - `058af8b`: `fix(supabase): sanitize project url to strip trailing rest/v1 paths safely`.
  - `79669d6`: `feat(backend): implement multi-user realtime websocket sync and rls crowdsourcing policies`.
  - `83f49db`: `feat(notifications): implement w3c push api service worker and geofenced threshold breach alerts`.
  - `a88d93e`: `fix(map): switch default tile provider to zero-key OpenStreetMap to resolve API watermark`.
- **Files Modified / Created by Tyagi:**
  - `supabase/migrations/002_rls_policies.sql` (Created: 73 lines of PostGIS RLS security rules).
  - `public/sw.js` (Modified: +93 lines adding W3C Web Push event handlers and notification clicks).
  - `src/services/notificationService.ts` (Modified: +299 lines adding geofenced breach evaluation and local notification triggers).
  - `src/services/noiseDataService.ts` (Modified: +206 lines adding Supabase Realtime channel subscription and reconnection logic).
  - `src/services/mapConfigService.ts` (Modified: Changed default tile provider to zero-key OSM/Carto Dark).
  - `src/lib/supabase.ts` (Modified: URL sanitization to prevent double `/rest/v1` path concatenation).
  - `scripts/test-notifications.js` (Created: 122 lines; 4/4 passing notification tests).
  - `scripts/test-supabase-sync.js` (Created: 118 lines validating Supabase channel lifecycle).
- **Verified Completed Tasks:**
  - `TASK-P1-01` (Supabase Realtime WebSocket synchronization engine).
  - `TASK-P2-01` (Service Worker Web Push notification event handlers).
  - Map watermark fix (Default provider set to zero-key OSM).
  - Database Row-Level Security policies script (`002_rls_policies.sql`).
- **Remaining Work for Tyagi:**
  - Connect live Supabase project credentials in production `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Generate production VAPID push keys (`VITE_VAPID_PUBLIC_KEY`) for native browser push subscriptions.

---

### 🎙️ Abhishek Bharadwaj (Teammate C — Audio DSP, QA & Calibration Lead)
- **Git Commit Attribution:**
  - Branch: `workstream-c/audio-dsp-qa` (commit `e8b9b54`): `fix: harden audio capture startup and add failure tests`.
- **Files Modified / Created by Bharadwaj:**
  - `src/services/audioDspService.ts` (Modified: +132 lines adding monotonic startup session tokens, touch-start context resumption, and rapid-tap cancellation guards).
  - `src/hooks/useAudioCapture.ts` (Modified: +84 lines adding state transition guards and clean startup race cleanup).
  - `scripts/test-audio-dsp.js` (Modified: Added Test 7/7 validating monotonic token isolation).
  - `scripts/test-audio-dsp-failures.js` (Created: 224 lines testing mic permission denial, AudioContext suspension rejection, and recovery).
  - `scripts/test-audio-dsp-production.js` (Created: 159 lines validating audio engine race conditions).
- **Verified Completed Tasks:**
  - `TASK-P0-01` (Hardened Web Audio API startup lifecycle on mobile/Safari).
  - Rapid-tap startup race condition elimination via monotonic token invalidation.
  - Test suite expansion (Audio tests expanded from 6/6 to 7/7; created dedicated failure suites).
- **Remaining Work for Bharadwaj:**
  - Physical mobile testing over local Wi-Fi across iPhone and Android devices.
  - Fine-tuning real-world microphone calibration offsets against reference sound meters.

---

### 🏛️ Abhishek Sharma (You — Lead Architect & Frontend/PWA Lead)
- **Git Commit Attribution:**
  - Commits `f2d812e`, `de2ca71`, `4619925`, `eb5af4c`, `f3d0516`, `3c5e610`, `21bfaf0`.
- **Verified Completed Work:**
  - Architecture of the complete 5-tier reactive system and tab navigation (`App.tsx`).
  - High-classic visual redesign with bespoke design tokens (Deep Obsidian, Signal Lime, Warm Paper).
  - Interactive Acoustic Guardian Avatar inside the circular measurement gauge (`InteractiveAcousticAvatar.tsx`).
  - Client-side statutory CPCB PDF grievance dossier compilation via `pdf-lib` (`complaintPdfService.ts`).
  - Interactive Leaflet dark radar visualization with pulsing user location pins (`LiveHeatmap.tsx`).
  - Ephemeral Civic ID with 1-click cryptographic token rotation and streak badges (`ProfileView.tsx`).
  - Synthesized dual-tone mallet UI tap sound effects with microphone silence lock (`soundFeedbackService.ts`).
  - Hackathon Demo Simulator Controller Modal (`DemoSimulatorModal.tsx`).
  - Master E2E Automated Verification Test Suite (`scripts/test-runner.js`).
  - 11-slide Chandigarh University Code Yudh Presentation (`NoiseMap_Chandigarh_University_Presentation.pptx`).
  - Comprehensive documentation and team onboarding briefing (`docs/*`).
- **Remaining Work for Abhishek Sharma:**
  - `TASK-P1-02`: Configure Rollup `manualChunks` in `vite.config.ts` to eliminate the 500 kB initial bundle size warning.
  - `TASK-P2-02`: Add smooth radial blur gradient overlays to Leaflet radar noise clusters.
  - Merge and review teammates' pull requests into `main`.

---

## 3. Individual Developer Progress Summary Table

| Developer | Verified Completed Contributions | Verified Tests | Remaining Tasks | Blockers | Recommended Next Action |
|:---|:---|:---:|:---|:---:|:---|
| **Aman Tyagi** | • Supabase Realtime pub/sub sync<br>• RLS policies SQL (`002_rls_policies.sql`)<br>• W3C Web Push in Service Worker<br>• Geofenced breach detection<br>• Tile provider watermark fix | 4/4 passing notification tests | • Production Supabase keys in `.env`<br>• Production VAPID key pair | None | Run `supabase/migrations/002_rls_policies.sql` on live project |
| **Abhishek Bharadwaj** | • Monotonic session token race guard<br>• Touch-start AudioContext resumption<br>• Permission denial error handling<br>• Audio failure and production test suites | 7/7 passing audio DSP tests | • Physical iPhone Safari verification<br>• Real-world acoustic calibration | None | Test mic sampling on physical iPhone over local Wi-Fi |
| **Abhishek Sharma** | • 5-tier reactive architecture & PWA<br>• High-classic UI & Acoustic Avatar<br>• Statutory CPCB PDF dossier engine<br>• Leaflet radar map & popup inspection<br>• Ephemeral Civic ID & Demo Simulator<br>• Master E2E test runner (5/5 passing) | 5/5 passing master E2E tests | • Vite `manualChunks` bundle splitting<br>• Heatmap radial gradient polish<br>• Final deployment verification | None | Configure `manualChunks` in `vite.config.ts` |
