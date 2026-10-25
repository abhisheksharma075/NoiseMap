# NOISEMAP — TEAM ONBOARDING & CODEBASE HANDOVER GUIDE

**Welcome to the NoiseMap Engineering Team!**  
This guide will get you set up, running, and contributing to the project in under 10 minutes.

---

## 1. What NoiseMap Does

NoiseMap is an open-standard Progressive Web Application (PWA) that transforms smartphones into a privacy-preserving environmental noise monitoring grid.

### The Problem
India suffers from severe urban noise pollution, yet the entire country has only ~50 official government static monitoring stations. Individual complaints are routinely dismissed by authorities due to lack of objective evidence and peer corroboration.

### The Solution: The Closed-Loop Civic Pipeline
1. **MEASURE:** Citizens tap once to capture a 10-second ambient sample. The Web Audio API calculates true $L_{eq}$ (dB SPL) entirely in RAM. **No audio files are ever saved or uploaded.**
2. **MAP:** Readings are quantized to ~100m geodetic grid cells to protect home privacy, then rendered on a dark Leaflet radar heatmap.
3. **VERIFY:** When **3+ independent devices** report violations in the same 100m area within 15 minutes, the system promotes them to an **ACTIVE Verified Noise Incident**.
4. **ALERT:** Pinned quiet zones (home, school, hospital) receive geo-fenced breach warnings.
5. **ACT:** The app compiles a statutory Central Pollution Control Board (**CPCB Noise Rules 2000**) complaint PDF directly inside the browser using `pdf-lib` in $<400\,\text{ms}$.

---

## 2. Quickstart: Setting Up Locally

### Prerequisites
- Node.js version 18+ (Node 20 or 22 LTS recommended)
- Git installed on your system
- Modern web browser (Chrome, Edge, Firefox, or Safari)

### Step 1: Clone the Repository
```bash
git clone https://github.com/abhisheksharma075/NoiseMap.git
cd NoiseMap
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

> **Note:** The application is designed with **dual-mode resilience**. If you leave the Supabase keys empty, the app automatically runs in **Autonomous Local Mode** using browser `localStorage` and pre-seeded demo readings. You do not need Supabase to test frontend, DSP, maps, or PDF generation!

### Step 4: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5: Verify Build & Automated Tests
Before making changes, verify that your local environment passes all checks:
```bash
# 1. Run TypeScript check & Vite build
npm run build

# 2. Run the master automated test suite
node scripts/test-runner.js
```
You should see: `SUMMARY: 5/5 TEST SUITES PASSED (100% SUCCESS)`.

---

## 3. Architecture & File Structure for New Developers

### Key Directories to Know
- `src/components/measure/`: The acoustic measurement interface, circular decibel gauge, live waveform visualizer, and reactive Acoustic Guardian Avatar.
- `src/components/map/`: Leaflet map integration (`LiveHeatmap.tsx`), dark tile layers, user location markers, and reading detail popups.
- `src/components/incidents/`: Incident feed, multi-witness consensus badges, and evidence confidence score breakdown.
- `src/components/evidence/`: CPCB statutory complaint dossier view and PDF export modals.
- `src/services/audioDspService.ts`: Web Audio API `AnalyserNode`, Float32Array PCM streaming, and RMS-to-decibel math.
- `src/services/incidentEngine.ts`: Spatial-temporal clustering algorithm and 3+ device consensus logic.
- `src/services/complaintPdfService.ts`: `pdf-lib` vector engine that generates statutory PDF documents.
- `src/services/noiseDataService.ts`: Dual-mode persistence engine (localStorage fallback + Supabase sync).

---

## 4. How to Test Without Making Real Noise

We built a **Floating Demo Simulator Toolbar** directly into the application for hackathon judging and testing:
1. Open the app at [http://localhost:5173](http://localhost:5173).
2. Look at the top HUD header and click the **"DEMO SIMULATOR"** button (or access via the floating badge).
3. Click **"Simulate 3+ Users in Guwahati (Triggers Active Incident)"**.
4. Observe the live system:
   - 3 separate citizen readings are injected with unique session IDs.
   - The consensus engine promotes the cluster to an **ACTIVE Incident**.
   - The Incident tab badge alerts you with a pulsing indicator.
   - Navigate to the **DOSSIER** tab and download the compiled statutory CPCB complaint PDF.
5. Click **"Reset to Baseline"** when you want to restore the default state.

---

## 5. Team Git Workflow & Collaboration Guidelines

To keep development fast and prevent merge conflicts, follow this workflow:

### Branching Convention
Always create a feature branch off `main`:
- `feature/<short-name>`: New functionality (e.g., `feature/bundle-split`)
- `fix/<short-name>`: Bug fixes (e.g., `fix/ios-audio-resume`)
- `test/<short-name>`: New automated tests (e.g., `test/push-notifications`)

```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-task
```

### Pre-Commit Checklist
Before committing, ALWAYS run:
```bash
npm run build
node scripts/test-runner.js
```
Never commit code that breaks TypeScript compilation or the test suite!

### Commit Messages
Use structured conventional commits:
```bash
git commit -m "feat(map): add radial blur gradient overlay to noise clusters"
git commit -m "fix(audio): resume AudioContext on mobile touch start"
```

### Pull Requests
1. Push your branch: `git push origin feature/my-new-task`
2. Open a Pull Request into `main` on GitHub.
3. Request a review from at least one teammate.
4. Ensure the PR description explains what changed and how it was tested.
