/**
 * Automated Verification Script: Supabase Database & WebSocket Realtime Latency
 * Usage: node scripts/test-supabase-sync.js
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parse .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
  return env;
}

async function runVerification() {
  console.log('======================================================');
  console.log('📡 NOISEMAP SUPABASE & WEBSOCKET SYNC VERIFICATION');
  console.log('======================================================\n');

  const env = loadEnv();
  const rawUrl = env.VITE_SUPABASE_URL || '';
  const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const key = env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !url.startsWith('https://') || !key || key.length < 20) {
    console.log('⚠️ Supabase credentials not found or incomplete in .env.');
    console.log('App will operate in autonomous offline mode with in-memory persistence.\n');
    process.exit(0);
  }

  console.log(`[TARGET URL] ${url}`);
  console.log(`[ANON KEY]   ${key.substring(0, 15)}... (${key.length} chars)\n`);

  const client = createClient(url, key);

  // --- Step 1: Database Query Verification ---
  console.log('[TEST 1/2] Verifying PostgreSQL + PostGIS Tables Connectivity...');
  const dbStart = Date.now();
  const { data: readings, error: readErr } = await client.from('noise_readings').select('*').limit(5);
  const dbDuration = Date.now() - dbStart;

  if (readErr) {
    console.error(`❌ [FAIL] Database query error: ${readErr.message}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] Successfully queried 'noise_readings' table in ${dbDuration}ms. (Rows returned: ${readings.length})`);
  }

  // --- Step 2: WebSocket Realtime Broadcast Roundtrip ---
  console.log('\n[TEST 2/2] Measuring Multi-User WebSocket Broadcast Latency...');
  const channelName = 'noisemap_sync_benchmark_' + Date.now();
  const channel = client.channel(channelName, {
    config: { broadcast: { self: true } },
  });

  let sendTimestamp = 0;
  let broadcastReceived = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!broadcastReceived) {
        console.error('❌ [FAIL] Timed out waiting for WebSocket broadcast response (6s).');
        process.exit(1);
      }
    }, 6000);

    channel.on('broadcast', { event: 'latency_ping' }, () => {
      broadcastReceived = true;
      clearTimeout(timeout);
      const latencyMs = Date.now() - sendTimestamp;
      console.log(`✅ [PASS] WebSocket broadcast received in ${latencyMs}ms!`);

      if (latencyMs <= 200) {
        console.log(`⚡ [PERFORMANCE] Fully compliant with sub-200ms benchmark (${latencyMs}ms <= 200ms)`);
      } else {
        console.log(`⚠️ [PERFORMANCE] Latency (${latencyMs}ms) exceeded 200ms target.`);
      }

      client.removeChannel(channel).then(() => resolve());
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        sendTimestamp = Date.now();
        channel.send({
          type: 'broadcast',
          event: 'latency_ping',
          payload: { timestamp: sendTimestamp },
        });
      }
    });
  });

  console.log('\n======================================================');
  console.log('SUMMARY: ALL BACKEND CLOUD & WEBSOCKET CHECKS PASSED');
  console.log('======================================================\n');
}

runVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
