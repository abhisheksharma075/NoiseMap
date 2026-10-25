# NOISEMAP — NEXT STEPS & IMMEDIATE TEAM COORDINATION PLAN

**Document ID:** NM-DOC-FINAL-NEXT-007  
**Audit Date:** October 19, 2026  
**Auditor:** Technical Project Manager & Integration Specialist

---

## 1. Immediate Blockers (Status: None)

The application has **zero critical code-level blockers**. All components compile cleanly without runtime crashes. Both teammates' branches have been integrated cleanly into `main`.

---

## 2. Top 5 Actionable Tasks (What to Do Next)

1. **Abhishek Sharma (Now):**
   - Implement Rollup `manualChunks` in `vite.config.ts` to split vendor dependencies (`leaflet`, `pdf-lib`, `chart.js`) and eliminate the 500 kB asset size warning.
2. **Aman Tyagi (Now):**
   - Log into [supabase.com](https://supabase.com), open the SQL editor, and run `supabase/migrations/001_init.sql` and `supabase/migrations/002_rls_policies.sql`.
   - Add the live project URL and anon key to `.env` so cross-device WebSocket sync is active.
3. **Abhishek Bharadwaj (Now):**
   - Run `npm run dev -- --host` on the local network.
   - Open the web app on a physical iPhone and Android phone.
   - Perform 5 consecutive 10-second measurements to confirm mic auto-play and permission handling work on real hardware.
4. **Abhishek Sharma (Next):**
   - Apply a subtle radial blur gradient overlay to Leaflet radar clusters in `LiveHeatmap.tsx` to enhance the AQI-style visual atmosphere.
5. **Team Integration Rehearsal (Final):**
   - Open the live app, launch the Demo Simulator from the top HUD header, simulate 3+ users in Guwahati, and verify that the CPCB statutory complaint PDF downloads cleanly.

---

## 3. Recommended Development Order

```text
[Step 1] Abhishek Sharma: Configures vite.config.ts chunk splitting ──▶ Clean build with zero warnings.
[Step 2] Aman Tyagi: Runs database migrations on live Supabase ───────▶ Enables real multi-phone cloud sync.
[Step 3] Abhishek Bharadwaj: Tests physical mobile audio capture ─────▶ Validates hardware sensor performance.
[Step 4] Final Production Verification: Run test-runner.js ──────────▶ 100% demo-ready for hackathon presentation.
```
