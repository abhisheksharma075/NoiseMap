# NoiseMap — Master Project Execution Plan

**Project:** NoiseMap — Privacy-First, Real-Time Noise Pollution Mapping & Reporting PWA  
**Team:** Wave Builders (Aman Tyagi · Abhishek Sharma · Abhishek Bharadwaj) | *Hackyard Build 2026, IIT Guwahati*  
**Core Pipeline:** `MEASURE` → `MAP` → `VERIFY` → `ALERT` → `ACT`  
**Current Phase:** Phase 1 Complete (Technical Planning & Approval) → Ready for Phase 2 (Project Initialization)

---

## 1. Approved Technical Decisions Matrix

| Decision Area | Selected Standard | Status | Rationale |
|---|---|---|---|
| **Frontend Framework** | React 18 + Vite + TypeScript | APPROVED | Strong typing for audio DSP and geospatial coordinates, sub-second HMR, optimal bundle footprint. |
| **Styling & Aesthetics** | Zajno Retro-Vector & Precision Acoustic HUD (Tailwind CSS) | APPROVED | Deep slate `#0B0F17`, warm oxidized amber-orange & phosphor cyan accents, hairline coordinate grids, crosshairs (`+`), CRT vector oscilloscope animations, heavy tactile controls (inspired by Zajno's Superlinked Open-Source design). |
| **Sensory Audio Engine** | Native HTML5 Web Audio API | APPROVED | 100% on-device DSP calculation; raw audio never leaves RAM; immediate memory deallocation. |
| **Geospatial Mapping** | Leaflet.js + CartoDB Dark Matter | APPROVED | Dark-themed, high-performance canvas/SVG vector marker rendering, mobile touch-optimized. |
| **Database & Persistence** | PostgreSQL 15 + PostGIS (6 Tables) + Offline Local Store | APPROVED | Dual-mode: Direct Supabase connectivity with an autonomous in-memory/IndexedDB fallback for demo reliability. |
| **Evidence Engine** | Mathematical 5-factor weighted scoring formula | APPROVED | Sample count (25%), Unique users (25%), Duration (20%), Avg dB (15%), Peak dB (15%). |
| **Civic Action Output** | Client-side `pdf-lib` CPCB Evidence Dossier | APPROVED | Direct PDF generation citing statutory *Noise Pollution Rules, 2000*, ready for municipal submission. |
| **Demo Simulator** | Floating Demo Simulator Toolbar | APPROVED | Enables instant 1-click generation of 3+ citizen readings in Guwahati for live judging demonstrations. |

---

## 2. Phase-Wise Execution Roadmap & Tracking

| Phase | Phase Name | Scope Summary | Status |
|---|---|---|---|
| **Phase 0** | Blueprint & Requirements Analysis | Detailed extraction of blueprint & presentation specs. | **COMPLETED** |
| **Phase 1** | Technical Planning & Alignment | User approval on stack, UI/UX aesthetics, schema, and demo simulator. | **VERIFIED** |
| **Phase 2** | Project Initialization & Tooling | Vite + React + TS setup, dependencies, Tailwind config, scripts. | **VERIFIED** |
| **Phase 3** | Cyber-Civic UI/UX Design System | Acoustic tokens, typography, audio meter HUD components, radar pulse styles. | **VERIFIED** |
| **Phase 4** | Sensory Audio Capture & Edge DSP | Web Audio API hook, FFT visualizer, 10s countdown, 100m coordinate quantization. | **VERIFIED** |
| **Phase 5** | Interactive Leaflet Heatmap & Feed | Dark map canvas, dynamic zone circles, city quick-jumps, category filters. | **VERIFIED** |
| **Phase 6** | Algorithmic Incident Engine | Spatial-temporal clustering (100m / 15m / 3+ sessions), confidence score calculation. | **VERIFIED** |
| **Phase 7** | CPCB Statutory PDF Generator | Client-side `pdf-lib` complaint dossier compilation with legal citations and curves. | **VERIFIED** |
| **Phase 8** | Geo-Pins, Alerts, Analytics & Badges | Monitored pins, threshold push/toast notifications, 24h timeline charts, streaks. | **VERIFIED** |
| **Phase 9** | Dual-Mode Backend & Demo Simulator | Supabase client + autonomous offline store + floating hackathon demo simulator. | **VERIFIED** |
| **Phase 10** | PWA Offline Shell & Polish | Web app manifest, service worker caching, responsive mobile audit. | **VERIFIED** |
| **Phase 11** | End-to-End Testing & Verification | Comprehensive test suites, DSP accuracy tests, clustering validation. | **VERIFIED** |
| **Phase 12** | Hackathon Presentation & Final Assets | Demo rehearsal script, setup guide, clean GitHub repository readiness. | **VERIFIED** |

---

## 3. Detailed Progress Log

- **2026-10-09 (Session Start):**
  - Thoroughly extracted and analyzed `NoiseMap_Final_Blueprint.pdf` and `NoiseMap_Final_Presentation.pdf`.
  - Defined 5-tier reactive architecture and 6-table database schema with PostGIS spatial indexing.
  - Aligned with user on 4 core architectural choices via interactive prompt modal (React+TS, Cyber-Civic UI, 6-Table Schema, Demo Simulator).
  - Authored [ARCHITECTURE.md](file:///c:/Users/abhis/OneDrive/Desktop/NoiseMap/ARCHITECTURE.md).
  - Authored [PROJECT_EXECUTION_PLAN.md](file:///c:/Users/abhis/OneDrive/Desktop/NoiseMap/PROJECT_EXECUTION_PLAN.md).
