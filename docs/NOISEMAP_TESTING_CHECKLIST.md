# NOISEMAP — COMPREHENSIVE TESTING & QA AUDIT CHECKLIST

**Document ID:** NM-DOC-TEST-005  
**Version:** 1.0.0  
**Test Suite Status:** 5/5 Passing (100%)  
**Auditor:** Quality Assurance Lead

---

## 1. Automated Test Suite Results

NoiseMap includes a native Node.js test runner validating all core algorithmic formulas and file generation pipelines:

| Test ID | Test Description | Target Algorithm | Result | Evidence / Details |
|:---|:---|:---|:---:|:---|
| **E2E-T1** | **DSP Audio RMS to Decibel Conversion** | Float32Array RMS $\rightarrow$ Logarithmic dB SPL | ✅ **PASSED** | RMS 0.05 yields 72 dB SPL within expected calibration window. |
| **E2E-T2** | **100m Mathematical Privacy Grid Snapping** | 3-Decimal Truncation $\lfloor \text{coord} \times 1000 \rceil / 1000$ | ✅ **PASSED** | (26.144189, 91.736841) correctly quantized to `26.144_91.737`. |
| **E2E-T3** | **Multi-Contributor Consensus Clustering** | 3+ Unique Sessions in 15m Window | ✅ **PASSED** | 2 users fail to trigger; 3rd distinct user promotes cluster to ACTIVE. |
| **E2E-T4** | **5-Factor Evidence Confidence Math** | 25/25/20/15/15 Weighted Scoring Model | ✅ **PASSED** | Multi-factor matrix computes exact expected 78.4% confidence rating. |
| **E2E-T5** | **Client-Side Vector CPCB PDF Compilation** | `pdf-lib` In-Memory Document Assembly | ✅ **PASSED** | Generates valid 894-byte binary stream starting with `%PDF-` header. |

---

## 2. Manual Testing Checklist for Teammates

### A. Sensory Audio DSP & Microphone Capture
- [ ] **Desktop Browser (Chrome/Edge):** Click "START 10s MEASUREMENT". Microphone permission prompt appears.
- [ ] **Ambient Noise Reactivity:** Speaking or making noise causes the circular gauge needle and waveform to fluctuate in real time.
- [ ] **Avatar Mood Synchronization:**
  - [ ] $<50.0\,\text{dB}$: Avatar displays a gentle smile with green accent.
  - [ ] $50.0\text{--}69.9\,\text{dB}$: Avatar displays an observant expression with olive accent.
  - [ ] $\ge 70.0\,\text{dB}$: Avatar displays alert angled brows with terracotta warning glow.
- [ ] **Source Tagging Modal:** After 10 seconds, the modal opens allowing the user to select Traffic, Construction, Loudspeaker, or Industrial.
- [ ] **Submission Feedback:** Tapping submit triggers an ascending chime sound and updates the local reading history.

### B. Interactive Noise Map & Geolocation
- [ ] **Map Tile Loading:** Leaflet loads CARTO Dark Matter basemap tiles without visual tearing or 404 tile errors.
- [ ] **User Location Pin:** Current location button centers the map and displays a yellow pulsing marker at your coordinates.
- [ ] **Sector Grid Clusters:** Tapping a colored sector circle displays an inspection popup with average dB, peak dB, and reading count.
- [ ] **Tile Failover Test:** Disconnecting internet or using an invalid tile key automatically falls back to OpenStreetMap without crashing.

### C. Incident Management & Demo Simulator
- [ ] **Demo Ingestion:** Open "DEMO SIMULATOR" in the top HUD and click "Simulate 3+ Users in Guwahati".
- [ ] **Consensus Promotion:** Verify that a new incident appears in the **INCIDENTS** tab marked as **ACTIVE**.
- [ ] **Evidence Confidence Bar:** Verify that the 5-factor confidence bar shows a score $\ge 75\%$.
- [ ] **Reset Action:** Click "Reset to Baseline" and verify that the system returns to the default demo state.

### D. Statutory CPCB PDF Dossier Export
- [ ] **Verified Incident Export:** In the **DOSSIER** tab, select an incident and click "DOWNLOAD OFFICIAL CPCB DOSSIER".
  - [ ] PDF downloads within 1 second.
  - [ ] Document opens cleanly in Adobe Acrobat, Chrome, or Preview.
  - [ ] Header cites Rules 5 & 7 of The Noise Pollution Rules, 2000.
  - [ ] Contains incident coordinates, timestamps, duration, and legal declaration.
- [ ] **Single Sample Export:** Under "Recent Sample Reading", click "DOWNLOAD SAMPLE REPORT (PDF)".
  - [ ] PDF compiles and downloads cleanly for raw individual readings.

### E. Civic ID & Settings
- [ ] **Session Rotation:** In the **CIVIC ID** tab, click "REGENERATE CIVIC ID TOKEN". Session token updates and clears historical association.
- [ ] **Tap Sounds Toggle:** Toggle "Musical UI Tap Sounds" off and on. Clicks mute and unmute accordingly.
- [ ] **Voice Announcements:** Toggle "Voice Status Feedback" on. Device speaks status updates via Web Speech Synthesis.
- [ ] **Pinned Zones:** Add a new quiet zone (e.g., "Home", radius 150m, threshold 65 dB). Pin is saved in localStorage.

### F. PWA & Mobile Installation
- [ ] **Install Banner:** Opening the web app on Chrome Android or Safari iOS prompts the "ADD TO HOMESCREEN" banner.
- [ ] **Standalone Launch:** When launched from homescreen, app runs in standalone mode without browser address bars.
- [ ] **Offline Resilience:** Turn on Airplane Mode. Navigate between Home, Measure, Map, and Dossier tabs. App shell loads cleanly without offline errors.
