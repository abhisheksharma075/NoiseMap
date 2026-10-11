# NoiseMap End-to-End Data Flow & Live Map Resolution Report

## Executive Summary
This report details the technical investigation, root cause discovery, and comprehensive implementation fixes for the **End-to-End Data Flow, Persistence Synchronization, and Live Map Centering** issues across NoiseMap PWA.

---

## 1. Problem Statements & Root Causes

### A. The Incident Page Empty Evidence Preview
- **Observed Behavior:** Submitting an individual noise sample did not immediately populate or display an active incident on the Incident page.
- **Root Cause:**
  1. The Incident Engine correctly implements statutory consensus requirements: an incident is formed only when **>= 3 distinct citizen session tokens** record >= 68.0 dB in the same ~100m grid cell within a 15-minute sliding window.
  2. A single submitted reading by one user is not yet an incident under statutory CPCB guidelines; however, the UI lacked a state explaining this. It showed an empty state without acknowledging that the user's reading was saved and waiting for peer corroboration.
  3. In `IncidentEngine.ts`, when an incident was created, the originating reading IDs were not persisted in a `reading_ids` property, preventing direct lookup of the underlying readings.

### B. The CPCB Dossier Section Empty State
- **Observed Behavior:** The CPCB Dossier page appeared blank or required manually clicking an incident, and if no active incidents existed, showed an uninformative empty state.
- **Root Cause:**
  1. `EvidenceView.tsx` only accepted `incidents` as a prop and only filtered for `status === 'active'`.
  2. If the active incidents array changed after submission, `selectedIncident` was not automatically synchronized.
  3. When zero active incidents were detected, `EvidenceView.tsx` showed a static "Select an incident from the left to view evidence preview" message rather than displaying the user's latest saved readings and explaining the multi-contributor consensus requirements.

### C. Civic ID Contributor Records Disconnection
- **Observed Behavior:** Civic ID displayed a static streak count of 10 samples regardless of whether the user had submitted 0 or 1 samples.
- **Root Cause:**
  1. In `App.tsx`, `streak` was initialized with `Math.max(initialReadings.length, 10)`, hardcoding 10 readings even for new sessions.
  2. In `ProfileView.tsx`, the user's actual submitted readings under their active `sessionId` were not filtered or displayed in an archived sample log.

### D. Map Initialization & Live Location Centering
- **Observed Behavior:** When opening the Map tab, the camera initialized to a default coordinate center (`26.144, 91.736`) and did not automatically pan/zoom to the user's live position or position the yellow live marker at the returned coordinates.
- **Root Cause:**
  1. In `LiveHeatmap.tsx`, `L.map()` was initialized statically to `defaultCenter` without requesting `navigator.geolocation` or checking for a previously cached position.
  2. There was no user location marker created on the Leaflet canvas; only acoustic reading circles and incident beacon markers existed.
  3. No interactive **"LOCATE ME"** control existed on the map overlay to allow users to recenter the camera.

---

## 2. Technical Modifications

### 1. `src/services/locationService.ts`
- Added `lastKnownLocation` in-memory and `localStorage` caching (`noisemap_last_known_loc`).
- `getQuantizedPosition()` automatically caches the latest resolved coordinates for seamless map restoration.

### 2. `src/components/map/LiveHeatmap.tsx`
- Added **Live User Marker**: A glowing, pulsing yellow circular vector beacon (`custom-live-user-icon`) placed at the user's exact coordinates with higher `zIndexOffset` so it stays above noise circles.
- Added **Auto-Centering on Mount**: Requests device GPS on mount; if granted, smoothly pans and zooms the camera to level 15 on the user's location.
- Added **Locate Me Control**: An interactive tactical button on the map HUD (`LOCATE ME`) that recenters the view on demand and displays an informative status banner.
- Added **Graceful GPS Fallback**: If GPS permission is denied or delayed, falls back to the user's last known location or latest submitted sample sector without breaking tile rendering.

### 3. `src/services/incidentEngine.ts`
- Added `reading_ids?: string[]` to `NoiseIncident` so every incident retains the exact foreign keys of its originating readings.
- Added automatic sorting of incidents by `last_seen_at` (newest first).

### 4. `src/components/incidents/IncidentsView.tsx`
- Added `readings` prop support.
- Added a **Pending Consensus Telemetry Banner**: When zero multi-contributor hazards exist, it displays an honest message confirming that the user's submitted readings are safely preserved in storage and radar, and explains that CPCB statutory incidents require corroboration by 3+ citizen nodes.

### 5. `src/components/evidence/EvidenceView.tsx`
- Added `readings` prop support.
- Synchronized `selectedIncident` state with incoming incident updates via `useEffect`.
- Added **Citizen Noise Log Dossier Fallback**: When no peer-corroborated incident exists yet, displays the user's latest submitted reading with decibel metrics, grid cell, and CPCB limits instead of an empty screen.

### 6. `src/App.tsx` & `src/components/profile/ProfileView.tsx`
- Synchronized `UserStreak` in `App.tsx` directly with the user's actual `sessionId` readings (eliminating the artificial `Math.max(..., 10)` fallback).
- Added a **"YOUR CONTRIBUTED SAMPLES"** log to `ProfileView.tsx` listing all samples submitted under the active Civic ID.
- Passed `readings` into both `IncidentsView` and `EvidenceView`.

---

## 3. Verification & Test Execution

### Automated Integration Suites
1. **Data Flow Integration Test Suite** (`node scripts/test-data-flow.js`):
   - `[TEST 1/6]` Submission Persistence & Newest-First Sort: **PASSED**
   - `[TEST 2/6]` Incident Consensus Criteria & Reading ID Association: **PASSED**
   - `[TEST 3/6]` Sub-Threshold Protection (Honest Non-Incident State): **PASSED**
   - `[TEST 4/6]` Civic ID Contribution Counts Derived from Actual Storage: **PASSED**
   - `[TEST 5/6]` CPCB Dossier Selection Sync & Report Previews: **PASSED**
   - `[TEST 6/6]` Live Map Geolocation Auto-Centering & Fallback: **PASSED**
   **Result: 6/6 Passed (100% Success)**

2. **Audio DSP Unit Test Suite** (`node scripts/test-audio-dsp.js`):
   - `[TEST 1/6]` Time-Domain Waveform RMS & dB Conversion: **PASSED**
   - `[TEST 2/6]` Decibel Dynamic Limits (30.0 dB to 120.0 dB): **PASSED**
   - `[TEST 3/6]` Leq Energy-Equivalent Logarithmic Integration: **PASSED**
   - `[TEST 4/6]` Metric Retention After Stopping Hardware Stream: **PASSED**
   - `[TEST 5/6]` Hook State Transition Guard: **PASSED**
   - `[TEST 6/6]` Submission Payload Integrity: **PASSED**
   **Result: 6/6 Passed (100% Success)**

3. **Full End-to-End Test Suite** (`node scripts/test-runner.js`):
   - `[TEST 1/5]` DSP Audio RMS to Decibel Conversion: **PASSED**
   - `[TEST 2/5]` 100m Mathematical Privacy Grid Snapping: **PASSED**
   - `[TEST 3/5]` Algorithmic Multi-Contributor Consensus (3+ Users): **PASSED**
   - `[TEST 4/5]` 5-Factor Mathematical Evidence Confidence Formula: **PASSED**
   - `[TEST 5/5]` Client-Side CPCB PDF Document Vector Binary: **PASSED**
   **Result: 5/5 Passed (100% Success)**

4. **Production TypeScript & Vite Build** (`npm run build`):
   - Compiled with **0 errors**.

---

## 4. Manual Verification Steps

1. **Test Live Map Centering:**
   - Navigate to the **MAP** tab.
   - If prompted for location, grant permission.
   - Verify that the map centers on your actual location and displays the yellow pulsing beacon.
   - Pan away and click **LOCATE ME**; verify that the camera smoothly animates back to your position.
2. **Test Sample Submission & Persistence:**
   - In the **MEASURE** tab, tap **START 10-SEC SAMPLE**.
   - Complete sampling, tag the source and CPCB zone, and tap **SUBMIT TO SENSOR GRID**.
   - Navigate to the **MAP** tab: verify that your noise circle appears at your location.
   - Navigate to the **CIVIC ID** tab: verify that the sample appears in **"YOUR CONTRIBUTED SAMPLES"** and the sample count increments.
   - Navigate to the **INCIDENTS** tab: verify the pending consensus telemetry banner is visible.
   - Navigate to the **CPCB DOSSIER** tab: verify the latest submitted sample details or active incident preview are displayed.
3. **Test Consensus Incident Trigger:**
   - Click the header HUD button to open the **Demo Simulator**.
   - Click **INJECT 3-CITIZEN CLUSTER**.
   - Check the **INCIDENTS** and **CPCB DOSSIER** tabs: verify that a verified incident appears with evidence score and downloadable PDF.

---

## 5. Strict Git Lock Status
- Branch: `main`
- All changes are **uncommitted in your working directory** (`git status`).
- **NO `git commit` or `git push` operations were performed.**
