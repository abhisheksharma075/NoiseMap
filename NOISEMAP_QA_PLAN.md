# NoiseMap PWA — Comprehensive Quality Assurance & End-to-End Test Plan

**Document Version:** 1.0.0  
**Date:** 2026-10-11  
**Project:** NoiseMap (Privacy-First Acoustic Intelligence Progressive Web App)  
**Classification:** Quality Assurance & Testing Specification  
**Safety Protocol:** Strict Git Lock (Zero automated commits or remote pushes)

---

## 1. Executive Test Strategy & Objectives

The primary objective of this QA Plan is to provide an exhaustive, reproducible testing framework for the **NoiseMap Progressive Web App**. NoiseMap is a decentralized, privacy-first civic acoustic monitoring application designed to capture real-time ambient noise levels via browser-based Web Audio DSP, aggregate readings into mathematical privacy grid sectors (~100m bounding boxes), detect multi-contributor noise violations through algorithmic consensus, and compile legally defensible Central Pollution Control Board (CPCB) evidence dossiers client-side.

### Core Testing Pillars
1. **Mathematical & DSP Accuracy:** Validating root-mean-square (RMS) time-domain sampling, logarithmic decibel conversion ($L_{\text{eq}}$ continuous equivalent energy integration), and microphone lifecycle management.
2. **Zero-Knowledge Privacy:** Ensuring raw audio streams never escape transient browser RAM and GPS coordinates are strictly quantized to 3 decimal places (~100m grid sectors) before persistence or transmission.
3. **Multi-Contributor Consensus:** Enforcing strict algorithmic rules where noise incidents require $\ge 3$ distinct citizen nodes recording $\ge 68.0\text{ dB}$ within a 15-minute sliding window to prevent malicious or single-user false alarms.
4. **End-to-End Data Flow & State Synchronization:** Guaranteeing that every recorded sample immediately propagates to local persistent storage (`localStorage`), the Live Heatmap, Civic ID contribution metrics, the Incidents telemetry board, and the CPCB Dossier generator.
5. **Mobile PWA Usability & Hardware Resilience:** Ensuring seamless operation on Android and iOS mobile devices, responsive dynamic viewport sizing (`100dvh`), sticky touch-friendly action controls, and full offline functionality via service workers.

---

## 2. System Architecture & Component Inventory

| Component / Service | File Path | Core Functionality Under Test |
| :--- | :--- | :--- |
| **Audio DSP Engine** | `src/services/audioDspService.ts` | Web Audio API analyser, RMS calculation, logarithmic $L_{\text{eq}}$ accumulation, peak hold, hardware stream cleanup. |
| **Audio Capture Hook** | `src/hooks/useAudioCapture.ts` | 10-second sampling cycle, 20fps telemetry polling, state transition guards, permission handling. |
| **Measure View & Modal** | `src/components/measure/MeasureView.tsx`<br>`src/components/measure/SourceTaggerModal.tsx` | Circular decibel gauge, oscilloscope, source tagger, CPCB zone selection, discard confirmation, mobile action buttons. |
| **Location & Privacy Service** | `src/services/locationService.ts` | HTML5 Geolocation querying, 3-decimal quantization, sector ID generation, session ID crypto rotation. |
| **Live Map & Heatmap** | `src/components/map/LiveHeatmap.tsx`<br>`src/components/map/MapView.tsx` | Leaflet tile layers, pulsing live location marker, GPS auto-centering, locate me control, acoustic radius scaling. |
| **Incident Consensus Engine**| `src/services/incidentEngine.ts`<br>`src/components/incidents/IncidentsView.tsx` | Algorithmic 3-node spatial/temporal clustering, 5-factor confidence formula, pending consensus notifications. |
| **CPCB Dossier & PDF** | `src/services/complaintPdfService.ts`<br>`src/components/evidence/EvidenceView.tsx` | Client-side `pdf-lib` vector document generation, statutory citations (Rules 5 & 7), citizen sample fallback. |
| **Civic ID & Analytics** | `src/components/profile/ProfileView.tsx`<br>`src/components/analytics/NoiseTimelineChart.tsx` | Ephemeral session token rotation, contributed sample log, diurnal diurnal timeline chart, streak & badge logic. |
| **Data Persistence Layer** | `src/services/noiseDataService.ts` | Newest-first deterministic sorting, `localStorage` fallback persistence, optional Supabase cloud sync. |
| **PWA Service Worker** | `public/sw.js`<br>`public/manifest.webmanifest` | Cache-first offline asset caching, app manifest shortcuts, standalone launch. |

---

## 3. Test Environment Specifications

### A. Desktop Browsers
- Google Chrome (v120+ / Windows 11 & macOS)
- Mozilla Firefox (v122+ / Windows 11)
- Microsoft Edge (v120+ / Chromium Engine)

### B. Mobile Devices & Emulators
- Android Chrome (Android 13/14, Pixel 7, Samsung Galaxy S23)
- Mobile Viewport Emulation: 360x640, 390x844 (iPhone 12/13/14), 412x915 (Pixel 7), 768x1024 (Tablet)
- Responsive Features: Dynamic Viewport Units (`100dvh`), `safe-area-inset-bottom` for gesture navigation bars.

### C. Test Tooling
- Node.js Test Runners (`scripts/test-runner.js`, `scripts/test-audio-dsp.js`, `scripts/test-data-flow.js`)
- TypeScript Compiler (`tsc --noEmit`)
- Vite Bundler (`vite build`)

---

## 4. Test Matrix & Detailed Scenarios

### Module 1: Web Audio DSP & Decibel Measurement
- **TC-AUDIO-01: Waveform RMS Calculation:** Verify that silent buffers return $0.0\text{ RMS}$ and that sinusoidal test tones yield accurate root-mean-square values.
- **TC-AUDIO-02: Decibel Dynamic Clamping:** Validate that calculated decibel values are bounded within the physical sensitivity curve of consumer smartphone microphones ($30.0\text{ dB}$ to $120.0\text{ dB}$).
- **TC-AUDIO-03: Logarithmic Energy Integration ($L_{\text{eq}}$):** Verify that continuous equivalent sound levels are calculated using logarithmic power summation ($10 \log_{10} \frac{1}{N} \sum 10^{L_i / 10}$) rather than inaccurate arithmetic means.
- **TC-AUDIO-04: Metric Retention on Stream Termination:** Confirm that stopping hardware microphone tracks preserves peak and average decibels in memory without zeroing them.
- **TC-AUDIO-05: Silent Audio Hardware Guard:** Ensure that samples registering $\le 0.0\text{ dB}$ (due to muted inputs or driver errors) trigger an informative notification and are blocked from sensor grid submission.

### Module 2: Privacy Geolocation & Grid Snapping
- **TC-GEO-01: 3-Decimal Truncation:** Validate that coordinates (e.g. `26.144189, 91.736841`) are snapped to `26.144, 91.737`, defining a ~100m spatial grid bounding cell.
- **TC-GEO-02: Raw Coordinate RAM Eviction:** Verify that sub-grid precision coordinates are never written to `localStorage` or transmitted in network payloads.
- **TC-GEO-03: GPS Permission Denied Graceful Fallback:** Validate that if location permissions are denied, the system falls back to the user's last known cached location or universal sector baseline.

### Module 3: Multi-Contributor Algorithmic Consensus
- **TC-CONS-01: Single-User Rejection:** Verify that 1 or 2 users recording excessive decibels ($> 68\text{ dB}$) do not create a confirmed legal incident.
- **TC-CONS-02: 3-Node Consensus Trigger:** Confirm that $\ge 3$ distinct anonymous session tokens in the same grid cell within 15 minutes trigger an active `NoiseIncident`.
- **TC-CONS-03: 5-Factor Mathematical Confidence Formula:** Verify that the evidence confidence percentage incorporates user count, sample volume, decibel exceedance, temporal duration, and reading density.
- **TC-CONS-04: Reading ID Foreign Key Preservation:** Confirm that newly generated incidents retain an array of the underlying `reading_ids`.

### Module 4: Live Map HUD & Navigation
- **TC-MAP-01: Auto-Centering on Mount:** Verify that the map requests GPS coordinates on load and smoothly centers on the user's live position.
- **TC-MAP-02: Pulsing Yellow Live User Marker:** Confirm that the user's location is rendered with a pulsing yellow circular vector pin (`custom-live-user-icon`) at high z-index.
- **TC-MAP-03: Tactile LOCATE ME Button:** Verify that pressing `LOCATE ME` smoothly pans and zooms the camera back to current device coordinates.
- **TC-MAP-04: Canvas Size Invalidation:** Confirm that `map.invalidateSize()` is invoked after mounting to prevent gray/unrendered tile strips.
- **TC-MAP-05: Tile Error Graceful Fallback:** Verify that if Stadia or Mapbox tiles fail, the system automatically falls back to OpenStreetMap standard without throwing an unhandled exception.

### Module 5: CPCB Dossier & Client-Side PDF Generation
- **TC-EVID-01: Client-Side PDF Compilation:** Verify that `ComplaintPdfService.generateComplaintPdf` returns a valid binary starting with `%PDF-` in $< 500\text{ms}$.
- **TC-EVID-02: Statutory Citations:** Confirm that the generated document includes Rule 5 and Rule 7 citations under The Noise Pollution Rules, 2000.
- **TC-EVID-03: Selection Synchronization:** Confirm that selecting an incident in the incidents list updates the dossier preview on the evidence page.
- **TC-EVID-04: Uncorroborated Reading Fallback:** Confirm that when zero active incidents exist, the dossier tab displays the user's latest submitted reading and clarifies consensus rules instead of showing a blank screen.

### Module 6: Civic ID, Badges & Gamification
- **TC-CIVIC-01: Anonymous Session Token Rotation:** Verify that users can rotate their ephemeral token at any time without wiping previously stored readings.
- **TC-CIVIC-02: Contributed Sample History:** Verify that `ProfileView` displays an archived list of readings matching the active `sessionId`.
- **TC-CIVIC-03: User Streak & Badge Calculation:** Confirm that badges ('noise_watcher', 'community_sensor', 'noise_guardian') update dynamically based on real reading volume.

### Module 7: Mobile PWA Usability & Action Buttons
- **TC-MOB-01: SourceTagger Action Button Accessibility:** Verify that `DISCARD SAMPLE` and `SUBMIT TO SENSOR GRID` remain sticky and visible at the bottom of the modal on all viewport heights.
- **TC-MOB-02: Safe Area Insets:** Confirm that the bottom navigation bar and action buttons accommodate iOS and Android home bars using `env(safe-area-inset-bottom)`.
- **TC-MOB-03: Modal Discard Confirmation:** Verify that tapping `DISCARD SAMPLE` triggers a secondary confirmation step to prevent accidental loss of telemetry.

---

## 5. Execution Protocols & Pass/Fail Criteria

1. **Automated Unit & Integration Test Suites:** All scripts in `scripts/` must achieve a 100% pass rate.
2. **Production Compilation:** `npm run build` (`tsc && vite build`) must succeed with zero TypeScript or bundling errors.
3. **No Synthetic / Fake Data:** Validation criteria must never be bypassed using hardcoded mock numbers or dummy decibel levels.
4. **Git Lock:** Zero commits or pushes to remote repository until user explicitly reviews and authorizes.
