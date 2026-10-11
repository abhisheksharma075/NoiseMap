# NoiseMap PWA — Project Execution Plan & Verification Matrix

**Project:** NoiseMap PWA (Privacy-First Urban Noise Monitoring)  
**Execution Phase:** IMPLEMENTATION & SYSTEM VERIFICATION  
**Strict Constraint:** Zero git commits/pushes without explicit user approval.

---

## 1. Roadmap & Status

| Phase | Milestone | Status | Key Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Inspection & Bug Audit | **COMPLETED** | `BUG_AUDIT_REPORT.md` created with verified root causes |
| **Phase 2** | Reading Consistency & Persistence | **IN PROGRESS** | Persistent store in `NoiseDataService`, newest-first sorting |
| **Phase 3** | Audio DSP & Metric Accuracy | **PENDING** | Logarithmic Leq integration, calibrated uncalibrated labels |
| **Phase 4** | MapView Time Filtering & Cross-Sync | **PENDING** | 15m, 1h, 24h, 7d, all filtering in `MapView.tsx` |
| **Phase 5** | Analytics Timeline Reactivity | **PENDING** | Dynamic aggregation in `NoiseTimelineChart.tsx` |
| **Phase 6** | Evidence View Terminology & UX | **PENDING** | Accurate legal & scientific labeling in `EvidenceView.tsx` |
| **Phase 7** | Verification, Build & QA | **PENDING** | Automated unit tests, TypeScript typecheck, Vite build |

---

## 2. Test & Verification Matrix

| Verification Item | Expected Behavior | Verification Command/Method |
| :--- | :--- | :--- |
| **Persistence Across Reload** | Submitted readings remain in local store and reappear on refresh | Unit test & storage inspection |
| **Chronological Ordering** | Readings strictly ordered newest first | Comparator test `newest-first` |
| **MapView Time Filter** | Selecting 'live' filters to last 15 min; '1h' to last hour | Functional test with multi-timestamp fixtures |
| **Logarithmic Leq DSP** | Audio RMS converts via energy sum rather than simple arithmetic mean | Math validation test in DSP suite |
| **Production Build** | Clean TypeScript and Vite bundle without errors | `npm run build` |
