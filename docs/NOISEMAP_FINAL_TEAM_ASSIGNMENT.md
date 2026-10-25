# NOISEMAP — UPDATED TEAM TASK ASSIGNMENT & PARALLEL WORKFLOW

**Document ID:** NM-DOC-FINAL-ASSIGN-005  
**Audit Date:** October 19, 2026  
**Auditor:** Technical Project Manager

---

## 1. Updated Developer Responsibilities

Following the merge of recent contributions, responsibilities are updated based on actual codebase progress:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ABHISHEK SHARMA (Lead Architect & Frontend UI / PWA)                   │
│ • Vite manualChunks bundle optimization (vite.config.ts)               │
│ • Leaflet radar radial blur polish (LiveHeatmap.tsx)                   │
│ • Production deployment verification on Vercel Edge Global CDN         │
│ • Team PR code reviews and architectural integrity                     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│ AMAN TYAGI (Backend, Cloud Database & Push Notifications Lead)         │
│ • Provision live Supabase project & run 001_init.sql & 002_rls.sql     │
│ • Populate live VITE_SUPABASE_URL and ANON_KEY in .env                 │
│ • Verify cross-device WebSocket real-time subscription sync            │
│ • Generate VAPID keys for browser push alerts                          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│ ABHISHEK BHARADWAJ (Audio DSP, Mobile QA & Calibration Lead)           │
│ • Physical iPhone Safari touch-start audio context verification        │
│ • Physical Android Chrome microphone permission testing                │
│ • Fine-tune ambient dB offset against reference sound meters           │
│ • Verify 1-click statutory CPCB PDF export on mobile devices           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Parallel Development Sequence

To guarantee zero merge conflicts and continuous delivery:

```
[Now] Abhishek Sharma:
      └─ Implements Rollup manualChunks in vite.config.ts. (Eliminates 500 kB build warning)

[In Parallel] Aman Tyagi:
      └─ Sets up live Supabase project at supabase.com and inserts credentials in .env.

[In Parallel] Abhishek Bharadwaj:
      └─ Connects physical mobile phones over local Wi-Fi to test live microphone sampling.

[Final Integration] Team Sync:
      └─ Rehearse live demonstration using Demo Simulator Modal.
```

---

## 3. File Ownership Boundaries

| File / Directory | Sole Owner | Permitted Editors | Conflict Risk |
|:---|:---:|:---:|:---:|
| `vite.config.ts` | Abhishek Sharma | Abhishek only | Low |
| `src/components/landing/*` | Abhishek Sharma | Abhishek only | Low |
| `src/components/common/*` | Abhishek Sharma | Abhishek only | Low |
| `src/components/map/LiveHeatmap.tsx` | Abhishek Sharma | Abhishek / Tyagi | Medium (Coordinate first) |
| `supabase/migrations/*` | Aman Tyagi | Tyagi only | Low |
| `src/lib/supabase.ts` | Aman Tyagi | Tyagi only | Low |
| `src/services/noiseDataService.ts` | Aman Tyagi | Tyagi only | Low |
| `src/services/notificationService.ts` | Aman Tyagi | Tyagi only | Low |
| `public/sw.js` | Aman Tyagi | Tyagi only | Low |
| `src/services/audioDspService.ts` | Abhishek Bharadwaj | Bharadwaj only | Low |
| `src/hooks/useAudioCapture.ts` | Abhishek Bharadwaj | Bharadwaj only | Low |
| `scripts/test-audio-dsp*` | Abhishek Bharadwaj | Bharadwaj only | Low |
| `src/App.tsx` | Shared Coordinator | Any (Coordinate first) | High |
| `src/types/index.ts` | Shared Coordinator | Any (Coordinate first) | High |
