# NoiseMap PWA — Comprehensive Bug Audit Report & Quality Assurance

**Date:** 2026-10-11  
**Project:** NoiseMap PWA (Privacy-First Urban Noise Monitoring)  
**Status:** AUDIT COMPLETE — ROOT CAUSES IDENTIFIED — TARGETED FIXES READY  
**Git Safety Policy:** Strictly Enforced (Zero commits or pushes without explicit user authorization)

---

## 1. Executive Summary & Audit Scope

NoiseMap is a Progressive Web App (PWA) built with React, TypeScript, Tailwind CSS, Leaflet, and the Web Audio API. It provides decentralized, privacy-preserving acoustic measurement, algorithmic incident consensus clustering, geofenced alerts, and statutory evidence generation.

A rigorous architectural and functional inspection was conducted covering:
1. Noise reading consistency and persistence across page reloads and state changes.
2. Temporal filtering synchronization between the filter controls, map heatmap, and reading listings.
3. Chronological sorting verification (newest reading strictly first).
4. Audio DSP measurement accuracy, acoustic unit labeling, and Leq vs. arithmetic average definitions.
5. Analytical chart dynamic reactivity with user and grid readings.
6. Mobile PWA usability, action button accessibility, safe-area offsets, and offline resilience.

---

## 2. Identified Bugs & Root Causes

### Issue 1: Reading Volatility & Stale Mock Generation on Refresh
- **Location:** `src/App.tsx`, `src/services/noiseDataService.ts`
- **Root Cause:** 
  1. Default readings were initialized in `App.tsx` state with `new Date().toISOString()`, causing timestamps to recalculate and change on every page load.
  2. Submitted readings via `handleReadingSubmitted` were only kept in component React state (`useState`) when Supabase was absent (offline/demo mode). `NoiseDataService.submitReading` merely logged a console warning on offline/unconfigured cloud mode without persisting to browser storage.
  3. Consequently, refreshing the page deleted all newly submitted readings and reverted to fresh mock timestamps.
- **Fix:** Implement robust local persistence in `NoiseDataService` using `localStorage` (`noisemap_readings_store`) with schema validation, fallback initialization, and synchronous retrieval so user readings persist across reloads.

### Issue 2: Broken Time-Window Filtering in MapView
- **Location:** `src/components/map/MapView.tsx`
- **Root Cause:**
  `MapView` tracks `timeFilter` state (`'live' | '1h' | '24h' | '7d' | 'all'`) from `MapFilterBar`, but `filteredReadings` ignored it:
  ```ts
  const filteredReadings = readings.filter((r) => {
    if (sourceFilter !== 'all' && r.source_type !== sourceFilter) return false;
    return true; // timeFilter is completely ignored!
  });
  ```
  Users clicking "LIVE (15m)", "1 HOUR", "24 HOURS", or "7 DAYS" experienced zero filtering behavior.
- **Fix:** Implement full temporal window evaluation (`15m` = 15 minutes, `1h` = 60 minutes, `24h` = 24 hours, `7d` = 7 days, `all` = unlimited).

### Issue 3: Inconsistent Chronological Ordering (Newest First)
- **Location:** `src/App.tsx`, `src/services/noiseDataService.ts`, `src/components/measure/MeasureView.tsx`
- **Root Cause:**
  Readings were prepended into state, but any bulk load or re-clustering did not enforce a deterministic comparator (`b.created_at - a.created_at` with secondary ID comparison).
- **Fix:** Enforce deterministic timestamp-based descending sorting (`newest first`) across all data pipelines.

### Issue 4: Acoustic Metric Inaccuracy & Incorrect "Leq" Terminology
- **Location:** `src/services/audioDspService.ts`, `src/components/evidence/EvidenceView.tsx`, `src/components/measure/SourceTaggerModal.tsx`
- **Root Cause:**
  1. `audioDspEngine.getMetrics()` calculated an arithmetic average of dB values (`avgDb = sum / length`). Mathematically, decibels are logarithmic; arithmetic averaging of dB values is not true Equivalent Continuous Sound Level ($L_{\text{eq}}$).
  2. In `EvidenceView.tsx`, this metric was explicitly labeled as "Recorded Leq Level".
  3. Smartphone microphones are uncalibrated consumer hardware subject to manufacturer AGC/equalization.
- **Fix:**
  - Add logarithmic energy integration in `AudioDspEngine` ($L_{\text{eq}} = 10 \log_{10}\left(\frac{1}{N} \sum 10^{L_i / 10}\right)$).
  - Clarify UI labels: "Estimated Avg Sound Level" and "Uncalibrated Smartphone Acoustic Node".

### Issue 5: Static Hardcoded Data in Analytics Timeline
- **Location:** `src/components/analytics/NoiseTimelineChart.tsx`, `src/components/profile/ProfileView.tsx`
- **Root Cause:**
  `NoiseTimelineChart` ignored real readings and rendered hardcoded arrays (`todayMeasured = [45, 43, 42...]`).
- **Fix:** Pass `readings: NoiseReading[]` prop into `NoiseTimelineChart`, bin real readings into 2-hour diurnal intervals, and render live aggregate curves alongside CPCB regulatory thresholds.

### Issue 6: Mobile PWA Action Button Responsiveness
- **Location:** `src/components/measure/SourceTaggerModal.tsx`, `src/components/measure/MeasureView.tsx`
- **Root Cause:**
  Mobile viewport height (`100vh` vs `100dvh`) and modal scroll container configurations could clip action buttons when virtual keyboards or navigation bars were visible.
- **Fix:** Ensure dynamic viewport height units (`100dvh`), `overscroll-contain`, flexible action buttons with `env(safe-area-inset-bottom)`, and two-stage discard confirmation.

---

## 3. Implementation Plan

1. **Service Layer (`src/services/noiseDataService.ts`):**
   - Add persistent `localStorage` store with fallback initial records.
   - Implement `getAllReadings()`, `submitReading()`, `saveReadings()`.
   - Deterministic newest-first sort comparator.
2. **Audio DSP Layer (`src/services/audioDspService.ts`):**
   - Logarithmic continuous energy integration for true $L_{\text{eq}}$ approximation.
   - Rounding consistency (1 decimal place standard).
3. **App State Orchestration (`src/App.tsx`):**
   - Initialize readings from `NoiseDataService.getAllReadings()`.
   - Pass real readings to `ProfileView` and `NoiseTimelineChart`.
   - Update user streaks dynamically.
4. **Map Filtering (`src/components/map/MapView.tsx`):**
   - Implement full temporal filtering.
5. **Timeline Chart (`src/components/analytics/NoiseTimelineChart.tsx`):**
   - Compute real diurnal averages from readings.
6. **Evidence & Dossier Labels (`src/components/evidence/EvidenceView.tsx`):**
   - Update terminology to scientifically accurate standards.
7. **Verification & Regression Testing:**
   - Run test runner and Vite production build.
