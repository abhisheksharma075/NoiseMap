// NoiseMap Real-Time Noise Activity Lifecycle Test Suite
// Verifies 15-minute freshness window, active vs quiet states, supersession,
// out-of-order packet protection, incident resolution, and spatial aggregation.
import assert from 'assert';

console.log('\n========================================================================');
console.log('📡 NOISEMAP REAL-TIME NOISE ACTIVITY LIFECYCLE TEST SUITE');
console.log('========================================================================\n');

let passed = 0;
const total = 12;

const AUDIO_CONFIG = {
  DECIBEL_INCIDENT_THRESHOLD: 68,
  SCORE_NORM_FACTOR: 15,
  CALIBRATION_OFFSET_DEFAULT: 98.0,
  SPIKE_DELTA_DB: 15,
  SPIKE_TIME_WINDOW_MS: 300,
  ACTIVE_NOISE_WINDOW_MINUTES: 15,
  MAP_REFRESH_INTERVAL_MS: 30000,
};

// Mirror of NoiseActivityLifecycleService implementation
class NoiseActivityLifecycleService {
  static getMeasurementAgeMinutes(timestamp, now = Date.now()) {
    if (!timestamp) return Infinity;
    const timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    if (Number.isNaN(timeMs) || !Number.isFinite(timeMs) || timeMs <= 0) {
      return Infinity;
    }
    const elapsedMs = now - timeMs;
    if (elapsedMs < -30000) {
      return Infinity;
    }
    return Math.max(0, elapsedMs / 60000);
  }

  static isMeasurementFresh(timestamp, now = Date.now(), windowMinutes = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES) {
    const age = this.getMeasurementAgeMinutes(timestamp, now);
    return Number.isFinite(age) && age <= windowMinutes;
  }

  static aggregateGridActivity(readings, now = Date.now(), windowMinutes = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES) {
    if (!readings || readings.length === 0) return [];

    const gridMap = new Map();
    readings.forEach((reading) => {
      if (!Number.isFinite(reading.lat) || !Number.isFinite(reading.lng)) return;
      const gridId = reading.grid_id || `${reading.lat.toFixed(3)}_${reading.lng.toFixed(3)}`;
      const list = gridMap.get(gridId) || [];
      list.push(reading);
      gridMap.set(gridId, list);
    });

    const activities = [];
    gridMap.forEach((gridReadings, gridId) => {
      const validReadings = gridReadings.filter((r) => {
        const timeMs = new Date(r.created_at).getTime();
        return !Number.isNaN(timeMs) && timeMs > 0;
      });

      if (validReadings.length === 0) return;

      // Sort newest-first by measurement timestamp
      validReadings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const latestReading = validReadings[0];
      const ageMinutes = this.getMeasurementAgeMinutes(latestReading.created_at, now);
      const isFresh = ageMinutes <= windowMinutes;
      const isElevated = latestReading.db_avg >= AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD;

      let activityState;
      if (isFresh) {
        activityState = isElevated ? 'active' : 'quiet';
      } else {
        activityState = 'stale';
      }

      activities.push({
        grid_id: gridId,
        lat: latestReading.lat,
        lng: latestReading.lng,
        latestReading,
        activityState,
        ageMinutes: Math.round(ageMinutes * 10) / 10,
        isFresh,
        isElevated,
        totalObservations: validReadings.length,
        historicalReadings: validReadings,
      });
    });

    return activities.sort((a, b) => new Date(b.latestReading.created_at).getTime() - new Date(a.latestReading.created_at).getTime());
  }

  static filterActivitiesByTime(activities, timeFilter, windowMinutes = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES) {
    switch (timeFilter) {
      case 'live':
        return activities.filter((act) => act.ageMinutes <= windowMinutes);
      case '1h':
        return activities.filter((act) => act.ageMinutes <= 60);
      case '24h':
        return activities.filter((act) => act.ageMinutes <= 1440);
      case '7d':
        return activities.filter((act) => act.ageMinutes <= 10080);
      case 'all':
      default:
        return activities;
    }
  }

  static evaluateIncidentFreshness(incidents, now = Date.now(), windowMinutes = AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES) {
    return incidents.map((inc) => {
      const ageMinutes = this.getMeasurementAgeMinutes(inc.last_seen_at || inc.created_at, now);
      const isFresh = ageMinutes <= windowMinutes;
      if (!isFresh && inc.status === 'active') {
        return {
          ...inc,
          status: 'resolved',
        };
      }
      return inc;
    });
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Fresh High-Noise Reading (>= 68 dB, <= 15m) -> Active Marker
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 1/12] Fresh high-noise reading (>= 68 dB, <= 15m) qualifies as ACTIVE: ');
  const now = 1700000000000;
  const readings = [
    {
      id: 'r1',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 74.5,
      db_peak: 82.0,
      source_type: 'construction',
      zone_type: 'commercial',
      created_at: new Date(now - 5 * 60 * 1000).toISOString(), // 5 mins ago
    },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 1);
  assert.strictEqual(activities[0].activityState, 'active');
  assert.strictEqual(activities[0].isFresh, true);
  assert.strictEqual(activities[0].isElevated, true);
  assert.strictEqual(activities[0].ageMinutes, 5.0);

  console.log('✓ PASSED (State: active, Age: 5.0m, db: 74.5)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 2: Recent Lower-Noise Reading (< 68 dB) Strictly Supersedes Older High-Noise Reading
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 2/12] Recent lower-noise reading (< 68 dB) supersedes older high reading in grid: ');
  const now = 1700000000000;
  const readings = [
    {
      id: 'r_old_loud',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 84.0, // High noise
      db_peak: 89.0,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(now - 10 * 60 * 1000).toISOString(), // 10 mins ago
    },
    {
      id: 'r_new_quiet',
      session_id: 's2',
      lat: 26.1443,
      lng: 91.7364,
      grid_id: '26.144_91.736',
      db_avg: 48.5, // Quiet
      db_peak: 52.0,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(now - 2 * 60 * 1000).toISOString(), // 2 mins ago
    },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 1, 'Must collapse into single grid activity');
  assert.strictEqual(activities[0].latestReading.id, 'r_new_quiet');
  assert.strictEqual(activities[0].activityState, 'quiet', 'Grid state must be quiet');
  assert.strictEqual(activities[0].isElevated, false);
  assert.strictEqual(activities[0].totalObservations, 2);

  console.log('✓ PASSED (Older 84.0 dB reading superseded by newer 48.5 dB reading -> quiet state)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 3: Expired High-Noise Reading (> 15m) -> Stale, Filtered from Live View
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 3/12] Expired high-noise reading (> 15m) becomes STALE and hidden from live view: ');
  const now = 1700000000000;
  const readings = [
    {
      id: 'r_stale',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 82.0,
      db_peak: 88.0,
      source_type: 'loudspeaker',
      zone_type: 'residential',
      created_at: new Date(now - 22 * 60 * 1000).toISOString(), // 22 mins ago (> 15m)
    },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 1);
  assert.strictEqual(activities[0].activityState, 'stale');
  assert.strictEqual(activities[0].isFresh, false);

  const liveActivities = NoiseActivityLifecycleService.filterActivitiesByTime(activities, 'live');
  assert.strictEqual(liveActivities.length, 0, 'Must be excluded from live map view');

  const historyActivities = NoiseActivityLifecycleService.filterActivitiesByTime(activities, '1h');
  assert.strictEqual(historyActivities.length, 1, 'Must be retained in historical view');

  console.log('✓ PASSED (Excluded from live, retained in 1h historical view)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 4: Exact Boundary Timestamp (15.0 Minutes) Freshness Check
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 4/12] Exact boundary timestamp (15.0 mins) evaluated consistently: ');
  const now = 1700000000000;
  const boundaryTime = new Date(now - 15 * 60 * 1000).toISOString(); // exactly 15m
  const justPastBoundary = new Date(now - 15.01 * 60 * 1000).toISOString(); // 15.01m

  const freshAt15 = NoiseActivityLifecycleService.isMeasurementFresh(boundaryTime, now);
  const staleAt15Point01 = NoiseActivityLifecycleService.isMeasurementFresh(justPastBoundary, now);

  assert.strictEqual(freshAt15, true, 'Timestamp at exactly 15.0m must be fresh');
  assert.strictEqual(staleAt15Point01, false, 'Timestamp at 15.01m must be stale');

  console.log('✓ PASSED (15.0m -> fresh, 15.01m -> stale)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 5: Invalid & Extreme Future Timestamp Handling
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 5/12] Invalid and extreme future timestamps handled gracefully: ');
  const now = 1700000000000;

  const ageInvalid1 = NoiseActivityLifecycleService.getMeasurementAgeMinutes('invalid-date-string', now);
  const ageInvalid2 = NoiseActivityLifecycleService.getMeasurementAgeMinutes(null, now);
  const ageInvalid3 = NoiseActivityLifecycleService.getMeasurementAgeMinutes(undefined, now);
  const ageFuture = NoiseActivityLifecycleService.getMeasurementAgeMinutes(new Date(now + 3600000).toISOString(), now); // 1 hr in future

  assert.strictEqual(ageInvalid1, Infinity);
  assert.strictEqual(ageInvalid2, Infinity);
  assert.strictEqual(ageInvalid3, Infinity);
  assert.strictEqual(ageFuture, Infinity);

  // Slight clock skew (+10 seconds) handled gracefully as 0 age
  const ageSlightSkew = NoiseActivityLifecycleService.getMeasurementAgeMinutes(new Date(now + 10000).toISOString(), now);
  assert.strictEqual(ageSlightSkew, 0);

  console.log('✓ PASSED (All invalid/future inputs returned Infinity without throwing)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 6: Late Arriving Out-of-Order Packet Protection
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 6/12] Out-of-order older packets cannot overwrite newer quiet readings: ');
  const now = 1700000000000;
  // Array where the older packet appears FIRST in the network payload
  const readings = [
    {
      id: 'delayed_old_packet',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 92.0, // Screaming siren
      db_peak: 98.0,
      source_type: 'siren',
      zone_type: 'residential',
      created_at: new Date(now - 12 * 60 * 1000).toISOString(), // 12 mins ago
    },
    {
      id: 'current_quiet_packet',
      session_id: 's2',
      lat: 26.1442,
      lng: 91.7361,
      grid_id: '26.144_91.736',
      db_avg: 44.0, // Quiet
      db_peak: 46.0,
      source_type: 'traffic',
      zone_type: 'residential',
      created_at: new Date(now - 1 * 60 * 1000).toISOString(), // 1 min ago
    },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 1);
  assert.strictEqual(activities[0].latestReading.id, 'current_quiet_packet');
  assert.strictEqual(activities[0].activityState, 'quiet');
  assert.strictEqual(activities[0].latestReading.db_avg, 44.0);

  console.log('✓ PASSED (Grid state correctly maintained at quiet despite delayed old 92 dB packet)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 7: New Activity Re-activates Previously Stale Sector
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 7/12] Fresh elevated reading re-activates a previously stale sector: ');
  const now = 1700000000000;
  const staleReadings = [
    {
      id: 'old_reading',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 72.0,
      db_peak: 76.0,
      source_type: 'construction',
      zone_type: 'residential',
      created_at: new Date(now - 30 * 60 * 1000).toISOString(), // 30 mins ago
    },
  ];

  const initialActivities = NoiseActivityLifecycleService.aggregateGridActivity(staleReadings, now);
  assert.strictEqual(initialActivities[0].activityState, 'stale');

  // New noise event occurs at now
  const updatedReadings = [
    ...staleReadings,
    {
      id: 'new_reading',
      session_id: 's2',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 78.0,
      db_peak: 84.0,
      source_type: 'construction',
      zone_type: 'residential',
      created_at: new Date(now - 30 * 1000).toISOString(), // 30 sec ago
    },
  ];

  const updatedActivities = NoiseActivityLifecycleService.aggregateGridActivity(updatedReadings, now);
  assert.strictEqual(updatedActivities[0].activityState, 'active');
  assert.strictEqual(updatedActivities[0].isFresh, true);
  assert.strictEqual(updatedActivities[0].totalObservations, 2);

  console.log('✓ PASSED (Sector successfully transitioned from stale -> active)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 8: Historical Incident Retention & Automatic Resolution
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 8/12] Incidents with aged evidence transition to resolved without data loss: ');
  const now = 1700000000000;
  const incidents = [
    {
      id: 'inc_active',
      grid_id: '26.144_91.736',
      center_lat: 26.144,
      center_lng: 91.736,
      location_name: 'Paltan Bazaar',
      started_at: new Date(now - 10 * 60 * 1000).toISOString(),
      last_seen_at: new Date(now - 2 * 60 * 1000).toISOString(), // 2 mins ago
      duration_min: 8,
      avg_db: 74.5,
      peak_db: 81.0,
      reading_count: 5,
      unique_users: 3,
      dominant_source: 'traffic',
      evidence_score: 85,
      status: 'active',
      created_at: new Date(now - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'inc_aged',
      grid_id: '26.155_91.745',
      center_lat: 26.155,
      center_lng: 91.745,
      location_name: 'Ganeshguri Flyover',
      started_at: new Date(now - 45 * 60 * 1000).toISOString(),
      last_seen_at: new Date(now - 20 * 60 * 1000).toISOString(), // 20 mins ago (> 15m)
      duration_min: 25,
      avg_db: 79.2,
      peak_db: 88.0,
      reading_count: 8,
      unique_users: 4,
      dominant_source: 'construction',
      evidence_score: 92,
      status: 'active',
      created_at: new Date(now - 45 * 60 * 1000).toISOString(),
    },
  ];

  const evaluated = NoiseActivityLifecycleService.evaluateIncidentFreshness(incidents, now);
  assert.strictEqual(evaluated.length, 2, 'No records must be deleted');
  assert.strictEqual(evaluated[0].status, 'active', 'Fresh incident must remain active');
  assert.strictEqual(evaluated[1].status, 'resolved', 'Aged incident must transition to resolved');
  assert.strictEqual(evaluated[1].id, 'inc_aged');

  console.log('✓ PASSED (Active incident kept active; aged incident transitioned to resolved)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 9: Clock Tick Simulation & Automatic Expiration
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 9/12] Clock advancement causes active markers to age out on timer tick: ');
  const t0 = 1700000000000;
  const readings = [
    {
      id: 'r_t0',
      session_id: 's1',
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 75.0,
      db_peak: 82.0,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(t0).toISOString(),
    },
  ];

  // At T0: reading is 0 mins old -> active
  const actAtT0 = NoiseActivityLifecycleService.aggregateGridActivity(readings, t0);
  assert.strictEqual(actAtT0[0].activityState, 'active');

  // Advance time by 16 minutes (past 15m window)
  const t16 = t0 + 16 * 60 * 1000;
  const actAtT16 = NoiseActivityLifecycleService.aggregateGridActivity(readings, t16);
  assert.strictEqual(actAtT16[0].activityState, 'stale');
  assert.strictEqual(actAtT16[0].isFresh, false);

  const liveAtT16 = NoiseActivityLifecycleService.filterActivitiesByTime(actAtT16, 'live');
  assert.strictEqual(liveAtT16.length, 0, 'Auto-expired from live view after 16m');

  console.log('✓ PASSED (At T+0m: active; At T+16m: stale & automatically expired from live map)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 10: Multiple Observations per Grid Cell Coalescence
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 10/12] Multi-observation coalescence (5 readings in 1 sector -> 1 marker): ');
  const now = 1700000000000;
  const readings = [];
  for (let i = 1; i <= 5; i++) {
    readings.push({
      id: `r_${i}`,
      session_id: `s_${i}`,
      lat: 26.1441,
      lng: 91.7362,
      grid_id: '26.144_91.736',
      db_avg: 60 + i * 2, // 62, 64, 66, 68, 70
      db_peak: 75,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(now - (6 - i) * 60 * 1000).toISOString(), // i=5 is newest (1 min ago)
    });
  }

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 1);
  assert.strictEqual(activities[0].totalObservations, 5);
  assert.strictEqual(activities[0].latestReading.id, 'r_5');
  assert.strictEqual(activities[0].latestReading.db_avg, 70);
  assert.strictEqual(activities[0].activityState, 'active');

  console.log('✓ PASSED (5 readings correctly coalesced to newest reading r_5 @ 70 dB)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 11: Geolocation Coordinate Quantization & Spatial Sectors
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 11/12] GPS quantization accurately collapses points within ~100m into single sector: ');
  const now = 1700000000000;
  const readings = [
    {
      id: 'p1',
      session_id: 's1',
      lat: 26.144102, // sector 26.144_91.736
      lng: 91.736201,
      grid_id: '',
      db_avg: 65.0,
      db_peak: 70.0,
      source_type: 'traffic',
      zone_type: 'residential',
      created_at: new Date(now - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'p2',
      session_id: 's2',
      lat: 26.144498, // same 3-decimal sector: 26.144_91.736 (~44m away)
      lng: 91.736412,
      grid_id: '',
      db_avg: 72.0,
      db_peak: 78.0,
      source_type: 'traffic',
      zone_type: 'residential',
      created_at: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'p3_distinct',
      session_id: 's3',
      lat: 26.155010, // distinct sector: 26.155_91.745
      lng: 91.745100,
      grid_id: '',
      db_avg: 50.0,
      db_peak: 55.0,
      source_type: 'traffic',
      zone_type: 'residential',
      created_at: new Date(now - 2 * 60 * 1000).toISOString(),
    },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(readings, now);
  assert.strictEqual(activities.length, 2, 'p1 and p2 must collapse into 1 sector, p3 distinct');
  assert.strictEqual(activities[0].grid_id, '26.144_91.736');
  assert.strictEqual(activities[0].latestReading.id, 'p2');
  assert.strictEqual(activities[0].totalObservations, 2);

  console.log('✓ PASSED (3 GPS coordinates correctly partitioned into 2 spatial sectors)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST 12: End-to-End Non-Destructive Data Flow & Regulatory Compliance
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 12/12] Non-destructive retention preserves raw historical records and audit trail: ');
  const now = 1700000000000;
  const allReadings = [
    { id: '1', lat: 26.1, lng: 91.7, grid_id: '26.100_91.700', db_avg: 70, db_peak: 75, source_type: 'traffic', zone_type: 'commercial', created_at: new Date(now - 2 * 60000).toISOString() },
    { id: '2', lat: 26.2, lng: 91.8, grid_id: '26.200_91.800', db_avg: 75, db_peak: 80, source_type: 'construction', zone_type: 'commercial', created_at: new Date(now - 35 * 60000).toISOString() },
    { id: '3', lat: 26.3, lng: 91.9, grid_id: '26.300_91.900', db_avg: 80, db_peak: 85, source_type: 'siren', zone_type: 'industrial', created_at: new Date(now - 120 * 60000).toISOString() },
  ];

  const activities = NoiseActivityLifecycleService.aggregateGridActivity(allReadings, now);
  const live = NoiseActivityLifecycleService.filterActivitiesByTime(activities, 'live');
  const pastHour = NoiseActivityLifecycleService.filterActivitiesByTime(activities, '1h');
  const all = NoiseActivityLifecycleService.filterActivitiesByTime(activities, 'all');

  assert.strictEqual(live.length, 1, 'Only 1 fresh observation in live layer');
  assert.strictEqual(pastHour.length, 2, '2 observations within past 1 hour');
  assert.strictEqual(all.length, 3, 'All 3 observations preserved in complete historical record');
  assert.strictEqual(allReadings.length, 3, 'Original readings array remained pristine and untouched');

  console.log('✓ PASSED (Live: 1/3, 1h: 2/3, All: 3/3; Zero raw records deleted)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n------------------------------------------------------------------------');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
if (passed === total) {
  console.log('🎉 ALL 12 REAL-TIME NOISE ACTIVITY LIFECYCLE TESTS PASSED!');
  console.log('------------------------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED.');
  console.log('------------------------------------------------------------------------\n');
  process.exit(1);
}
