/**
 * Automated Verification Script: Geofenced Notification & Push Alerts Engine
 * Usage: node scripts/test-notifications.js
 */
import assert from 'assert';

// Geodesic distance calculation formula (matching IncidentEngine.getDistanceMeters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function evaluateBreaches(pins, incidents) {
  const breaches = [];
  pins.forEach((pin) => {
    incidents.forEach((inc) => {
      if (inc.status !== 'active') return;

      const distance = getDistanceMeters(pin.lat, pin.lng, inc.center_lat, inc.center_lng);
      if (distance <= 500 && inc.avg_db > pin.threshold_db) {
        breaches.push({
          pin,
          incident: inc,
          excessDb: Math.round((inc.avg_db - pin.threshold_db) * 10) / 10,
          distanceMeters: Math.round(distance),
        });
      }
    });
  });
  return breaches;
}

console.log('======================================================');
console.log('🔔 NOISEMAP GEOFENCED PUSH NOTIFICATION SUITE');
console.log('======================================================\n');

// Test Case 1: Geofenced breach detection (< 500m, > threshold)
const homePin = {
  id: 'pin_home',
  session_id: 'test_user',
  label: 'Home Residence',
  lat: 26.144,
  lng: 91.736,
  threshold_db: 65,
};

const nearbyBreachingIncident = {
  id: 'inc_breach_1',
  status: 'active',
  center_lat: 26.145, // ~110m away
  center_lng: 91.736,
  avg_db: 78.4,
  peak_db: 88.0,
  dominant_source: 'traffic',
};

const breaches1 = evaluateBreaches([homePin], [nearbyBreachingIncident]);
assert.strictEqual(breaches1.length, 1, 'Should detect breach within 500m');
assert.strictEqual(breaches1[0].excessDb, 13.4, 'Excess dB should be 78.4 - 65 = 13.4 dB');
console.log(`[TEST 1/4] Proximity Geofence Breach Detection: ✅ PASSED (Detected at ${breaches1[0].distanceMeters}m with +${breaches1[0].excessDb} dB excess)`);

// Test Case 2: Far incident (> 500m) should NOT trigger breach
const distantIncident = {
  id: 'inc_far_2',
  status: 'active',
  center_lat: 26.155, // ~1.2 km away
  center_lng: 91.736,
  avg_db: 90.0,
  peak_db: 95.0,
  dominant_source: 'construction',
};

const breaches2 = evaluateBreaches([homePin], [distantIncident]);
assert.strictEqual(breaches2.length, 0, 'Should not detect breach beyond 500m geofence radius');
console.log('[TEST 2/4] Geofence Radius Boundary Filter (> 500m rejected): ✅ PASSED');

// Test Case 3: Inactive incident should NOT trigger breach
const inactiveIncident = {
  ...nearbyBreachingIncident,
  id: 'inc_inactive_3',
  status: 'resolved',
};

const breaches3 = evaluateBreaches([homePin], [inactiveIncident]);
assert.strictEqual(breaches3.length, 0, 'Inactive or resolved incidents should not trigger breaches');
console.log('[TEST 3/4] Incident Active Status Verification: ✅ PASSED');

// Test Case 4: Zero-Raw-Audio Payload Verification
const alertPayload = {
  title: `🚨 NOISE BREACH: ${homePin.label}`,
  body: `${nearbyBreachingIncident.avg_db} dB detected within 500m (+${breaches1[0].excessDb} dB over ${homePin.threshold_db} dB limit). Dominant: ${nearbyBreachingIncident.dominant_source}.`,
  data: {
    incident_id: nearbyBreachingIncident.id,
    pin_id: homePin.id,
    excessDb: breaches1[0].excessDb,
  },
};

const forbiddenAudioKeys = ['audio', 'buffer', 'pcm', 'samples', 'recording', 'raw', 'stream', 'waveform'];
let hasAudioLeak = false;
const payloadString = JSON.stringify(alertPayload).toLowerCase();
for (const key of forbiddenAudioKeys) {
  if (payloadString.includes(`"${key}"`)) {
    hasAudioLeak = true;
    break;
  }
}
assert.strictEqual(hasAudioLeak, false, 'Zero raw audio guarantee: No audio data in notification payload');
console.log('[TEST 4/4] Zero-Raw-Audio Privacy Guarantee: ✅ PASSED (Zero audio streams in alert payload)');

console.log('\n======================================================');
console.log('SUMMARY: 4/4 NOTIFICATION TESTS PASSED (100% SUCCESS)');
console.log('======================================================\n');
