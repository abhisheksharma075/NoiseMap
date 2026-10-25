# NOISEMAP — DETAILED FEATURE INVENTORY & STATUS MATRIX

**Document ID:** NM-DOC-FEAT-002  
**Last Verified:** October 18, 2026  
**Auditor:** QA Automation & Architecture Lead

---

## 1. Feature Status Classification Definitions

- **DONE:** Fully implemented in frontend and backend, styled, and verified to function properly.
- **PARTIALLY DONE:** Code implementation exists, but some aspects or edge cases remain incomplete.
- **UI ONLY:** Interface or mock presentation exists, but backend/data connectivity is stubbed.
- **MOCK DATA:** Operates using static simulated local data (fully functional for demo purposes).
- **BROKEN:** Code exists but fails during execution or contains defects.
- **NEEDS TESTING:** Feature is implemented but requires real-world physical device verification.

---

## 2. Complete Feature Inventory Matrix

| Feature ID | Feature Name | Status | Frontend File Location | Backend / Service Location | Testing Status | Priority | Owner |
|:---|:---|:---:|:---|:---|:---:|:---:|:---:|
| **NM-F001** | **Landing Page & Hero Section** | **DONE** | `src/components/landing/LandingView.tsx` | N/A | Verified | P1 | Frontend |
| **NM-F002** | **Acoustic Guardian Avatar (Landing)** | **DONE** | `src/components/landing/AcousticGuardianAvatar.tsx` | Local State | Verified | P2 | Frontend |
| **NM-F003** | **Live Noise Map Preview (Landing)** | **DONE** | `src/components/landing/LiveMapPreview.tsx` | `noiseDataService.ts` | Verified | P2 | Frontend |
| **NM-F004** | **Environmental Stats Cards** | **DONE** | `src/components/landing/EnvironmentalStatistics.tsx` | `noiseDataService.ts` | Verified | P2 | Frontend |
| **NM-F005** | **1-Tap Audio Measurement** | **DONE** | `src/components/measure/MeasureView.tsx` | `audioDspService.ts` | Verified | P0 | Core |
| **NM-F006** | **AnalyserNode DSP RMS to dB SPL** | **DONE** | `src/components/measure/CircularNoiseGauge.tsx` | `audioDspService.ts` | Verified (Test 1/5) | P0 | Core |
| **NM-F007** | **Zero-Raw Audio Memory Flush** | **DONE** | `src/hooks/useAudioCapture.ts` | `audioDspService.ts` | Verified | P0 | Core |
| **NM-F008** | **Interactive Acoustic Avatar (Gauge)** | **DONE** | `src/components/measure/InteractiveAcousticAvatar.tsx`| Decibel State Machine | Verified | P1 | Frontend |
| **NM-F009** | **Live Waveform Canvas Visualizer** | **DONE** | `src/components/measure/LiveWaveformVisualizer.tsx` | Time-Domain Float32 | Verified | P2 | Frontend |
| **NM-F10** | **Noise Source Tagging Modal** | **DONE** | `src/components/measure/SourceTaggerModal.tsx` | Local/Cloud sync | Verified | P1 | Frontend |
| **NM-F011** | **100m Geodetic Privacy Snapping** | **DONE** | `src/services/locationService.ts` | Math Rounding ($10^{-3}$) | Verified (Test 2/5) | P0 | Core |
| **NM-F012** | **Interactive Leaflet Radar Map** | **DONE** | `src/components/map/LiveHeatmap.tsx` | `mapConfigService.ts` | Verified | P0 | Core |
| **NM-F013** | **Zero-Key CARTO Dark Matter Tiles** | **DONE** | `src/components/map/LiveHeatmap.tsx` | Auto OSM fallback | Verified | P1 | Core |
| **NM-F014** | **Node Details & Reading Inspection** | **DONE** | `src/components/map/NodePopupDetails.tsx` | `MapView.tsx` | Verified | P1 | Frontend |
| **NM-F015** | **Live User GPS Centering & Pin** | **DONE** | `src/components/map/LiveHeatmap.tsx` | `locationService.ts` | Verified | P1 | Core |
| **NM-F016** | **3+ Contributor Consensus Engine** | **DONE** | `src/components/incidents/IncidentsView.tsx`| `incidentEngine.ts` | Verified (Test 3/5) | P0 | Core |
| **NM-F017** | **5-Factor Evidence Confidence Math** | **DONE** | `src/components/incidents/EvidenceScoreBar.tsx` | `scoreCalculator.ts` | Verified (Test 4/5) | P0 | Core |
| **NM-F018** | **Active Incident Cards & Filtering** | **DONE** | `src/components/incidents/IncidentCard.tsx` | `incidentEngine.ts` | Verified | P1 | Frontend |
| **NM-F019** | **Client-Side CPCB PDF Dossier** | **DONE** | `src/components/evidence/EvidenceView.tsx` | `complaintPdfService.ts` | Verified (Test 5/5) | P0 | Core |
| **NM-F020** | **Single Sample PDF Export** | **DONE** | `src/components/evidence/EvidenceView.tsx` | `complaintPdfService.ts` | Verified | P1 | Core |
| **NM-F021** | **CPCB Complaint Generator Modal** | **DONE** | `src/components/evidence/ComplaintGeneratorModal.tsx`| `complaintPdfService.ts` | Verified | P1 | Frontend |
| **NM-F022** | **Ephemeral Civic ID (Zero-KYC)** | **DONE** | `src/components/profile/ProfileView.tsx` | Local token rotation | Verified | P1 | Core |
| **NM-F023** | **Civic Streak & Badge Gamification** | **DONE** | `src/components/profile/BadgeDisplay.tsx` | `noiseDataService.ts` | Verified | P2 | Frontend |
| **NM-F024** | **Geofenced Quiet Zone Pins** | **DONE** | `src/components/profile/AlertPinsPanel.tsx` | `notificationService.ts`| Verified | P1 | Core |
| **NM-F025** | **Synthesized UI Tap Sounds** | **DONE** | `src/services/soundFeedbackService.ts` | Web Audio Oscillator | Verified | P2 | Frontend |
| **NM-F026** | **Microphone Audio Silence Lock** | **DONE** | `src/services/soundFeedbackService.ts` | Mute during capture | Verified | P0 | Core |
| **NM-F027** | **PWA Install Banner & Manifest** | **DONE** | `src/components/layout/InstallPromptBanner.tsx` | `manifest.webmanifest` | Verified | P1 | Frontend |
| **NM-F028** | **Offline Service Worker Caching** | **DONE** | `public/sw.js` | Cache-first shell | Verified | P1 | Frontend |
| **NM-F029** | **Demo Simulator Controller Toolbar** | **DONE** | `src/components/layout/DemoSimulatorModal.tsx` | Synthetic Ingestion | Verified | P0 | QA/Demo |
| **NM-F030** | **Supabase Cloud Synchronization** | **PARTIALLY DONE** | `src/services/noiseDataService.ts` | `src/lib/supabase.ts` | Needs Live Keys | P1 | Backend |
| **NM-F031** | **Browser Web Push Notifications** | **PARTIALLY DONE** | `src/services/notificationService.ts` | Local alerts active | Needs Push VAPID | P2 | Backend |
| **NM-F032** | **Edge TensorFlow AI Classification** | **NOT STARTED** | Future Planning | Future ML Roadmap | Not Started | P3 | Future |

---

## 3. Detailed Component & Section Analysis

### 3.1. Landing Page (`LandingView.tsx`)
- **Status:** **DONE**
- **Capabilities:** Responsive hero section with high-classic typography, real-time statistics cards, interactive Acoustic Guardian Avatar with mood transitions, live interactive map preview, visual sound wave simulation, and feature showcase.
- **Verification:** Tested across desktop viewport ($1920\times 1080$) and mobile viewport ($390\times 844$). All navigation triggers dispatch to the correct application tab.

### 3.2. Measurement System (`MeasureView.tsx`, `audioDspService.ts`)
- **Status:** **DONE**
- **Capabilities:** 
  - Initiates microphone stream via `navigator.mediaDevices.getUserMedia()`.
  - Computes root-mean-square (RMS) over a 2048-sample Float32 buffer.
  - Converts RMS to logarithmic sound pressure level: $\text{dB SPL} = 20 \log_{10}(\text{RMS}) + 98.0$.
  - Clamps output between 30.0 dB and 120.0 dB.
  - Automatically suppresses tap-sound playback during active capture to prevent audio transducer feedback.
  - Prompts noise source tagging modal on 10-second completion.

### 3.3. Interactive Noise Map (`MapView.tsx`, `LiveHeatmap.tsx`)
- **Status:** **DONE**
- **Capabilities:**
  - Renders vector map using Leaflet 1.9.4 on top of CARTO Dark Matter tiles.
  - Categorizes circles: Safe ($<55\,\text{dB}$, Green), Moderate ($55\text{--}70\,\text{dB}$, Yellow), Loud ($70\text{--}80\,\text{dB}$, Orange), Extreme ($>80\,\text{dB}$, Red).
  - Automatically calculates user GPS location and places a pulsing live location marker.
  - Provides fallback to OpenStreetMap if CARTO tile requests fail.

### 3.4. Incident Management & Consensus (`IncidentsView.tsx`, `incidentEngine.ts`)
- **Status:** **DONE**
- **Capabilities:**
  - Aggregates readings into 100m geodetic spatial clusters.
  - Evaluates independent sessions over a sliding 15-minute window.
  - Promotes clusters to **ACTIVE** when unique users $\ge 3$ and average decibels $\ge 68.0\,\text{dB}$.
  - Computes 5-factor mathematical confidence score using weighted distribution.

### 3.5. Statutory CPCB Evidence Engine (`EvidenceView.tsx`, `complaintPdfService.ts`)
- **Status:** **DONE**
- **Capabilities:**
  - Generates tamper-evident A4 legal grievance dossiers using `pdf-lib` in $<400\,\text{ms}$.
  - Cites statutory provisions: Rule 5 (Loudspeaker restrictions) and Rule 7 (Authority redressal) of *The Noise Pollution (Regulation and Control) Rules, 2000*.
  - Supports both **Verified Incident Dossiers** and **Instant Individual Reading Dossiers**.

### 3.6. Ephemeral Civic Identity (`ProfileView.tsx`, `locationService.ts`)
- **Status:** **DONE**
- **Capabilities:**
  - Zero-KYC architecture: no email, phone number, or password required.
  - Generates a local cryptographic UUID session token.
  - Allows 1-click token regeneration to completely purge historical session ties.
  - Tracks user contributions and badges (`newcomer`, `noise_watcher`, `community_sensor`, `noise_guardian`).
