# NOISEMAP PWA — PROJECT EXECUTION PLAN & COMPLETION ROADMAP

**Project:** NoiseMap (Privacy-First Environmental Acoustic Intelligence Grid)  
**Target Delivery:** Production Readiness & Civic Demonstration  
**Baseline:** `origin/main` (`a88d93e`) in `NoiseMap-fresh`  

---

## 1. Project Goal & Objectives

NoiseMap transforms citizen smartphone microphones into a decentralized, privacy-first environmental noise monitoring grid. It equips communities and municipalities with:
1. Calibrated-indicative decibel measurements with zero raw audio transmission.
2. 100m mathematical privacy grid snapping to protect citizen residences.
3. Spatio-temporal 3+ peer consensus clustering to verify genuine civic incidents.
4. Instant statutory CPCB 2000 PDF evidence dossiers for regulatory grievance filing.
5. Real-time Leaflet radar with zero-key OpenStreetMap standard tiles.
6. Geo-fenced sensitive zone monitoring (Home, Office, Study, Silence Zones) with automated breach alerts.

---

## 2. Workstream Status & Task Matrix

| Workstream | Priority | Owner | Baseline Status | Next Action |
| :--- | :--- | :--- | :--- | :--- |
| **WS-1: Map & Tile Provider** | High | Abhishek / Team | **COMPLETED** | Verified OpenStreetMap standard zero-key tiles as default. |
| **WS-2: Audio DSP & Race Guards** | High | Bhardwaj / Lead | **COMPLETED & VERIFIED** | Fast-forward merged `workstream-c/audio-dsp-qa` (`e8b9b54`), centralized thresholds (`audioThresholds.ts`), live noise meter, transient spike detection (+15 dB / 300ms), event history, privacy indicator & audio diagnostics. |
| **WS-3: Backend & Realtime Sync** | High | Aman Tyagi / Team | **COMPLETED** | PostgreSQL schema + RLS policies + WebSocket sync active. |
| **WS-4: Push Alert Pipeline Wiring** | High | Lead | **PENDING WIRING** | Connect `checkAndDispatchBreaches` in `src/App.tsx`. |
| **WS-5: Sensitive Zones & CPCB Leq** | High | Lead | **PENDING INTEGRATION** | Add 100m/250m/500m/1km radius picker, CPCB Day/Night Leq engine, and Health Guidance modal. |
| **WS-6: Vite Chunk Optimization** | Medium | Lead | **PENDING OPTIMIZATION**| Add Rollup manualChunks in `vite.config.ts` to keep chunks under 500 kB. |
| **WS-7: Final PWA & Mobile Polish** | Medium | Team | **READY FOR DEMO** | Verify manifest, offline caching, and viewport scaling on mobile. |

---

## 3. Phased Execution Roadmap

### Phase 1: Baseline Stabilization & Branch Synchronization
- Keep clean baseline at `origin/main`.
- Integrate teammate audio-capture hardening commit `e8b9b54` (`workstream-c/audio-dsp-qa`).
- Verify all 5 existing test suites continue passing 100%.

### Phase 2: Notification Pipeline & Push Wiring
- In `src/App.tsx`, connect `NotificationService.checkAndDispatchBreaches(pins, incidents)` into the `useEffect` trigger so real push notifications fire when breaches occur.
- Test cooldown suppression (15 mins) and zero-raw-audio payload guarantee.

### Phase 3: Geo-Fenced Sensitive Zones & CPCB Ambient Engine
- Implement user-pinned locations (Home, Office, Study, Other) with configurable radii (100m, 250m, 500m, 1km).
- Implement deterministic 4-band acoustic spectrum classifier (`Safe/Low <50 dB`, `Moderate 50-70 dB`, `Harmful 70-85 dB`, `Breach >85 dB`).
- Implement CPCB Schedule III Day (06:00-22:00) vs Night (22:00-06:00) statutory limits comparison using logarithmic energy Leq ($10 \log_{10} \frac{1}{N} \sum 10^{L_i/10}$).
- Enforce minimum 3-sample quorum before evaluating sustained exposure (preventing single isolated spikes from triggering false alarms).

### Phase 4: Proactive Health & Regulatory Guidance
- Build `HealthGuidanceModal.tsx` presenting CPCB statutory standards, WHO guidelines context (53 dB Lden, 45 dB Lnight), and practical exposure mitigation tips.
- Prominently include smartphone microphone uncalibrated hardware (AGC) disclaimer.

### Phase 5: Production Build & Vercel Verification
- Configure Rollup `manualChunks` in `vite.config.ts` (`vendor-react`, `vendor-leaflet`, `vendor-supabase`, `vendor-pdf`).
- Verify production bundle compile time and size (`npm run build`).
- Verify PWA installability and offline service worker operation.

---

## 4. Acceptance Criteria

1. **Zero Watermark Map:** OpenStreetMap Standard raster tiles load smoothly without API key or external watermarks.
2. **Audio Accuracy & Zero Leakage:** Audio capture calculates true energy Leq; zero audio streams or buffers leave the browser.
3. **Consensus Reliability:** Incidents only escalate to `active` when $\ge 3$ distinct sessions report within 500m and 15 mins.
4. **Instant Complaint Export:** Client-side vector PDF compiles in $<400\text{ms}$ with accurate CPCB Schedule III references.
5. **Zero Build Errors:** `npm run build` completes with 0 TypeScript errors and 0 bundler warnings.
