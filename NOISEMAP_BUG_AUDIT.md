# NoiseMap PWA — Complete Defect Audit & Root-Cause Resolution Report

**Document Version:** 1.0.0  
**Date:** 2026-10-11  
**Project:** NoiseMap (Privacy-First Progressive Web App)  
**Safety Protocol:** Strict Git Lock (Zero automated commits or remote pushes)

---

## 1. Executive Summary

This Defect Audit & Root-Cause Resolution Report documents all architectural, algorithmic, and user experience issues discovered during the complete audit of the NoiseMap application. Every identified bug was traced to its fundamental technical root cause, repaired with clean and maintainable code, and validated against automated regression test suites without introducing mock data or bypassing statutory validation.

---

## 2. Comprehensive Defect Inventory & Severity Classification

| Bug ID | Component | Defect Summary | Severity | Status |
| :---: | :--- | :--- | :---: | :---: |
| **BUG-01** | `audioDspService.ts`<br>`useAudioCapture.ts` | **Zero-Decibel Recording Bug:** Sampling modal opening with 0.0 dB / rejecting submission | **CRITICAL** | **FIXED** |
| **BUG-02** | `SourceTaggerModal.tsx`<br>`VectorCard.tsx` | **Mobile Modal Action Button Clipping:** "Discard Sample" and "Submit" hidden on mobile | **HIGH** | **FIXED** |
| **BUG-03** | `LiveHeatmap.tsx`<br>`locationService.ts` | **Map Not Auto-Centering on Live Location:** Camera defaulted to static sector without GPS marker | **HIGH** | **FIXED** |
| **BUG-04** | `IncidentsView.tsx`<br>`EvidenceView.tsx` | **Data Flow Disconnection Across Tabs:** Submissions missing in Incidents, Dossier & Civic ID | **HIGH** | **FIXED** |
| **BUG-05** | `noiseDataService.ts`<br>`App.tsx` | **Reading Volatility on Reload:** Submitted readings disappeared on page refresh | **MEDIUM** | **FIXED** |
| **BUG-06** | `MapView.tsx` | **Temporal Filter Bar Inoperable:** Time filters ('15m', '1h', '24h', '7d') were ignored | **MEDIUM** | **FIXED** |
| **BUG-07** | `audioDspService.ts` | **Acoustic Metric Inaccuracy ($L_{\text{eq}}$):** Arithmetic average computed instead of logarithmic | **MEDIUM** | **FIXED** |
| **BUG-08** | `NoiseTimelineChart.tsx` | **Hardcoded Diurnal Chart:** Profile analytics ignored user readings | **LOW** | **FIXED** |
| **BUG-09** | `NavigationBar.tsx` | **Mobile Gesture Bar Overlap:** Floating nav lacked `safe-area-inset-bottom` padding | **LOW** | **FIXED** |

---

## 3. Deep-Dive Root-Cause Analysis & Applied Fixes

### BUG-01: Zero-Decibel Recording Bug
- **Symptoms:** User completes a 10-second noise recording, but the application displays "AVG LEVEL: 0.0 dB, PEAK: 0.0 dB". When pressing "SUBMIT TO SENSOR GRID", validation rejects the reading because decibels must be $> 0\text{ dB}$.
- **Root Cause:**
  1. In `useAudioCapture.ts`, when the 10-second timer finished, `stopSampling()` called `audioDspEngine.stop()`. However, the hardware media stream tracks were terminated and the analyser was disconnected before reading the final accumulated metrics.
  2. Because the metrics polling interval cleared concurrently, the React state held the reset zero state (`{ avgDb: 0, peakDb: 0 }`).
  3. No state transition guard existed in `MeasureView.tsx` to distinguish between valid acoustic telemetry and a silent microphone input.
- **Implemented Fix:**
  1. Updated `AudioDspEngine` to cache continuous acoustic metrics in an internal `cachedMetrics` structure that persists after stopping the hardware stream tracks.
  2. In `useAudioCapture.ts`, `stopSampling()` now captures and returns these cached metrics directly, guaranteeing that the hook state retains the calculated decibel level.
  3. In `MeasureView.tsx`, introduced `capturedSample` freezing on completion and an informative banner notifying the user if their microphone is muted or disconnected, preventing submission of zero-decibel payloads.

---

### BUG-02: Mobile Modal Action Button Clipping on Android
- **Symptoms:** On desktop and laptop screens, the "DISCARD SAMPLE" and "SUBMIT TO SENSOR GRID" action buttons are visible. On Android phones, the buttons were clipped, hidden, or pushed off the bottom of the screen.
- **Root Cause:**
  1. In CSS flexbox, flex column items default to `min-height: auto`.
  2. When `SourceTaggerModal` rendered inside a flex column with `max-h-[92dvh]`, the browser calculated that the content required full height, expanding the container beyond the screen edge instead of constraining the scrollable body (`flex-1 overflow-y-auto`).
  3. Virtual keyboards, browser URL bars, and bottom navigation controls further compressed the viewport, pushing the buttons off-screen.
- **Implemented Fix:**
  1. Added `min-h-0` to the outer modal flex container, `min-h-0 overflow-hidden` to `VectorCard`, and `min-h-0 overflow-y-auto` to the inner scroll body.
  2. Kept the action buttons inside a `flex-shrink-0 pt-3 border-t border-white/10` sticky footer container.
  3. Switched to `max-h-[92dvh]` to account for dynamic mobile browser address bars.

---

### BUG-03: Map Not Auto-Centering on Live Location
- **Symptoms:** Navigating to the Map tab showed a map centered on hardcoded coordinates (`26.144, 91.736`). The user's live position was not centered, and no marker indicated their current location.
- **Root Cause:**
  1. `LiveHeatmap.tsx` initialized `L.map()` statically to `defaultCenter` without invoking `navigator.geolocation` or checking for cached positions.
  2. No live location marker was created on the Leaflet canvas; only acoustic reading circles and incident markers existed.
  3. No "LOCATE ME" button existed on the map interface.
- **Implemented Fix:**
  1. In `locationService.ts`, implemented `lastKnownLocation` in-memory and `localStorage` caching (`noisemap_last_known_loc`).
  2. In `LiveHeatmap.tsx`, added automatic geolocation querying on mount that smoothly pans and zooms the camera to the user's coordinates.
  3. Added a pulsing yellow circular vector marker (`custom-live-user-icon`) at the user's location with a high `zIndexOffset: 1000`.
  4. Added a tactical **"LOCATE ME"** HUD button to recenter the map on demand.
  5. Added `setTimeout(() => map.invalidateSize(), 250)` to ensure Leaflet recalculates dimensions when switching between tabs.

---

### BUG-04: End-to-End Data Flow Disconnection Across Tabs
- **Symptoms:** Submitted samples did not appear on the Incidents, CPCB Dossier, or Civic ID pages.
- **Root Cause:**
  1. **Incidents Page:** By design, CPCB statutory incidents require consensus from $\ge 3$ distinct citizen nodes recording $\ge 68\text{ dB}$ in a ~100m sector. Submitting a single reading did not create an incident, but the UI had no state explaining this, displaying a blank screen.
  2. **CPCB Dossier Page:** `EvidenceView.tsx` only accepted `incidents` as a prop. When no multi-user incident was active, it showed an empty state rather than displaying the user's latest recorded reading.
  3. **Civic ID Page:** The profile view displayed a static streak count of 10 samples and did not list the user's submitted samples.
- **Implemented Fix:**
  1. In `IncidentsView.tsx`, passed `readings` and added a **Pending Consensus Telemetry Banner** confirming that the user's reading is stored and explaining the 3-node requirement.
  2. In `EvidenceView.tsx`, synchronized `selectedIncident` via `useEffect` and added a **Citizen Noise Log Dossier Fallback** showing the latest submitted sample when no multi-user incident exists yet.
  3. In `ProfileView.tsx`, connected user streaks directly to actual session readings and added a **"YOUR CONTRIBUTED SAMPLES"** log.

---

### BUG-05: Reading Volatility on Reload
- **Symptoms:** Refreshing the browser wiped all newly submitted readings and reverted to default mock readings with fresh timestamps.
- **Root Cause:**
  1. Baseline mock readings used dynamic timestamps (`new Date().toISOString()`).
  2. In offline/demo mode, `NoiseDataService.submitReading` only updated in-memory state without writing to browser storage.
- **Implemented Fix:**
  1. Implemented persistent `localStorage` storage (`noisemap_readings_store`) in `NoiseDataService`.
  2. Enforced deterministic descending timestamp sorting (`newest first`).
  3. Added synchronous retrieval and fallback initialization so readings persist indefinitely across reloads.

---

### BUG-06: Temporal Filter Bar Inoperability in MapView
- **Symptoms:** Clicking "LIVE (15m)", "1 HOUR", "24 HOURS", or "7 DAYS" had no effect on the map.
- **Root Cause:**
  In `MapView.tsx`, the `filteredReadings` calculation checked `sourceFilter` but completely ignored `timeFilter`, returning `true` unconditionally.
- **Implemented Fix:**
  Implemented time-window calculations filtering readings based on elapsed milliseconds ($15\text{m} = 900{,}000\text{ms}$, $1\text{h} = 3{,}600{,}000\text{ms}$, $24\text{h} = 86{,}400{,}000\text{ms}$, $7\text{d} = 604{,}800{,}000\text{ms}$).

---

### BUG-07: Acoustic Metric Inaccuracy ($L_{\text{eq}}$)
- **Symptoms:** Continuous noise levels were calculated as simple arithmetic averages of decibels, which is mathematically invalid for logarithmic acoustic units.
- **Root Cause:**
  Decibels represent a logarithmic power ratio: $L = 10 \log_{10}(P / P_0)$. An arithmetic mean of decibel values underestimates acoustic energy during intermittent loud sounds.
- **Implemented Fix:**
  Replaced arithmetic averaging with true equivalent continuous sound level integration:
  $$L_{\text{eq}} = 10 \log_{10}\left(\frac{1}{N} \sum_{i=1}^{N} 10^{L_i / 10}\right)$$
  Updated UI labels to accurately reflect consumer smartphone capabilities: "Estimated Avg Sound Level" and "Uncalibrated Smartphone Acoustic Node".

---

## 4. Verification Summary

All 9 defects have been resolved and verified through:
- **`node scripts/test-runner.js`:** 5/5 PASSED
- **`node scripts/test-audio-dsp.js`:** 6/6 PASSED
- **`node scripts/test-data-flow.js`:** 6/6 PASSED
- **`npm run build`:** Production compilation succeeded with 0 errors.

---

## 5. Strict Git Safety Notice

As requested by the project instructions:
- **Branch:** `main`
- **Git Commit / Push:** Not executed.
- All modifications are preserved directly in the working directory for user inspection.
