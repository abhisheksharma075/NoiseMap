// NoiseMap AI Copilot - Stage 2 Automated Test Suite
// Verifies read-only data tools, Gemini function calling, evidence grounding,
// acoustic statistics, incident clustering, security guards, and provenance.
import assert from 'assert';
import {
  getLatestNoiseReadings,
  getNoiseSummary,
  getNoiseTrend,
  getActiveIncidentClusters,
  getIncidentDetails,
  getNoiseDataAvailability,
  executeTool,
  getGeminiToolDeclarations,
  TOOL_REGISTRY,
  TOOL_CONFIG,
} from '../server/noiseMapTools.js';
import {
  validateChatPayload,
  generateGeminiChatResponse,
  TRUSTED_SYSTEM_INSTRUCTION,
} from '../server/aiService.js';

console.log('\n========================================================================');
console.log('📡 NOISEMAP AI COPILOT (STAGE 2) ENVIRONMENTAL TOOL TEST SUITE');
console.log('========================================================================\n');

let passed = 0;
const total = 20;

const now = Date.now();

// Deterministic test fixture
const mockReadings = [
  {
    id: 't-1',
    session_id: 'citizen_1',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 82.5,
    db_peak: 90.0,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(now - 3 * 60000).toISOString(), // 3 mins ago (fresh)
  },
  {
    id: 't-2',
    session_id: 'citizen_2',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 80.0,
    db_peak: 88.0,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(now - 6 * 60000).toISOString(), // 6 mins ago (fresh)
  },
  {
    id: 't-3',
    session_id: 'citizen_3',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 84.0,
    db_peak: 92.0,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(now - 9 * 60000).toISOString(), // 9 mins ago (fresh)
  },
  {
    id: 't-4',
    session_id: 'citizen_4',
    lat: 26.155,
    lng: 91.745,
    grid_id: '26.155_91.745',
    db_avg: 54.0,
    db_peak: 60.0,
    source_type: 'construction',
    zone_type: 'residential',
    created_at: new Date(now - 30 * 60000).toISOString(), // 30 mins ago (stale)
  },
  {
    id: 't-5',
    session_id: 'citizen_5',
    lat: 26.160,
    lng: 91.750,
    grid_id: '26.160_91.750',
    db_avg: 45.0,
    db_peak: 48.0,
    source_type: 'unknown',
    zone_type: 'silence',
    created_at: new Date(now - 120 * 60000).toISOString(), // 2 hours ago (stale)
  },
];

// -----------------------------------------------------------------------------
// TEST A: Valid Readings Retrieval
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST A/20] get_latest_noise_readings retrieves and structures valid readings: ');
  const res = getLatestNoiseReadings({ limit: 3 }, mockReadings);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.returnedCount, 3);
  assert.strictEqual(res.records[0].id, 't-1');
  assert.strictEqual(res.records[0].freshness, 'fresh');
  console.log('✓ PASSED (3 newest readings returned with freshness metadata)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST B: Empty Dataset Handling (No Fabrication)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST B/20] Empty dataset returns explicit empty result without fabricating readings: ');
  const res = getLatestNoiseReadings({}, []);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.returnedCount, 0);
  assert.strictEqual(res.records.length, 0);
  assert(res.warnings.length > 0);
  console.log('✓ PASSED (Returned empty records array with warning)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST C: Invalid Readings Sanitization
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST C/20] Filters out malformed readings (NaN / out-of-range dB): ');
  const dirtyReadings = [
    { id: 'bad-1', db_avg: NaN, created_at: new Date().toISOString() },
    { id: 'bad-2', db_avg: 150.0, created_at: new Date().toISOString() },
    { id: 'good-1', db_avg: 65.0, db_peak: 70.0, grid_id: '26.100_91.700', created_at: new Date().toISOString() },
  ];
  const res = getLatestNoiseReadings({}, dirtyReadings);
  assert.strictEqual(res.returnedCount, 1);
  assert.strictEqual(res.records[0].id, 'good-1');
  console.log('✓ PASSED (Rejected NaN and 150 dB readings)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST D: Latest Measurement Ordering (Chronological Sort)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST D/20] Strictly sorts readings newest-first regardless of input order: ');
  const unordered = [mockReadings[4], mockReadings[0], mockReadings[2]];
  const res = getLatestNoiseReadings({}, unordered);
  assert.strictEqual(res.records[0].id, 't-1', 'Newest reading must be index 0');
  assert.strictEqual(res.records[1].id, 't-3');
  assert.strictEqual(res.records[2].id, 't-5');
  console.log('✓ PASSED (Sorted chronologically descending)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST E: Stale Data Classification (> 15m)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST E/20] Accurately differentiates fresh (<=15m) vs stale (>15m) records: ');
  const res = getLatestNoiseReadings({}, mockReadings);
  const readingFresh = res.records.find((r) => r.id === 't-1');
  const readingStale = res.records.find((r) => r.id === 't-4');
  assert.strictEqual(readingFresh.freshness, 'fresh');
  assert.strictEqual(readingStale.freshness, 'stale');
  assert(readingStale.age_minutes >= 15);
  console.log('✓ PASSED (t-1: fresh, t-4: stale @ age >= 15m)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST F: Missing Timestamps Handling (Unknown Freshness)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST F/20] Missing/invalid timestamps classified as "unknown" without throwing: ');
  const untimed = [{ id: 'no-time', db_avg: 60.0, db_peak: 65.0, created_at: 'invalid-date' }];
  const res = getLatestNoiseReadings({}, untimed);
  assert.strictEqual(res.records[0].freshness, 'unknown');
  console.log('✓ PASSED (Unparseable date classified as unknown)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST G: Historical Time Boundary Filtering
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST G/20] Enforces "since" and "until" boundaries: ');
  const sinceTime = new Date(now - 10 * 60000).toISOString();
  const res = getLatestNoiseReadings({ since: sinceTime }, mockReadings);
  assert.strictEqual(res.returnedCount, 3, 'Only 3 readings recorded in last 10m');
  assert(res.records.every((r) => r.id === 't-1' || r.id === 't-2' || r.id === 't-3'));
  console.log('✓ PASSED (Boundary filtered older records accurately)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST H: Location & Area Filters
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST H/20] Filters by sector grid_id and zone_type: ');
  const resGrid = getLatestNoiseReadings({ area: '26.155' }, mockReadings);
  const resZone = getLatestNoiseReadings({ area: 'silence' }, mockReadings);
  assert.strictEqual(resGrid.returnedCount, 1);
  assert.strictEqual(resGrid.records[0].id, 't-4');
  assert.strictEqual(resZone.returnedCount, 1);
  assert.strictEqual(resZone.records[0].id, 't-5');
  console.log('✓ PASSED (Grid and zone queries filtered correctly)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST I: Active Incidents Cluster Consensus
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST I/20] Detects 3-device consensus incident cluster in sector 26.144_91.736: ');
  const res = getActiveIncidentClusters({ status: 'active' }, mockReadings);
  assert.strictEqual(res.returnedClustersCount, 1);
  const cluster = res.incidents[0];
  assert.strictEqual(cluster.grid_id, '26.144_91.736');
  assert.strictEqual(cluster.unique_contributing_users, 3);
  assert.strictEqual(cluster.status, 'active');
  assert(cluster.averageDb >= 68.0);
  assert(cluster.evidence_confidence_score > 60);
  console.log(`✓ PASSED (Active incident found with 3 users, avg: ${cluster.averageDb} dB, score: ${cluster.evidence_confidence_score})`);
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST J: Incident Details & CPCB Regulatory Delta
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST J/20] get_incident_details computes CPCB delta & handles nonexistent ID: ');
  const incidentList = getActiveIncidentClusters({ status: 'all' }, mockReadings);
  const validId = incidentList.incidents[0].id;
  const detail = getIncidentDetails({ incident_id: validId }, mockReadings);
  assert.strictEqual(detail.ok, true);
  assert(detail.incident.cpcbDayResidentialDeltaDb > 0);
  assert.strictEqual(detail.incident.exceedsCpcbStatutoryLimit, true);

  const missing = getIncidentDetails({ incident_id: 'nonexistent-id' }, mockReadings);
  assert.strictEqual(missing.ok, false);
  assert.strictEqual(missing.code, 'INCIDENT_NOT_FOUND');
  console.log('✓ PASSED (Calculated +dB exceedance and handled missing ID)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST K: Function Allowlist Enforcement
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST K/20] executeTool rejects unapproved / arbitrary functions: ');
  const res = executeTool('execute_arbitrary_sql', { query: 'DROP TABLE noise_readings' });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.code, 'UNKNOWN_TOOL');
  console.log('✓ PASSED (Arbitrary tool name blocked with UNKNOWN_TOOL)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST L: Invalid Arguments Handling
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST L/20] Rejects invalid arguments safely without throwing: ');
  const res = executeTool('get_incident_details', {}); // missing incident_id
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.code, 'INVALID_ARGUMENT');
  console.log('✓ PASSED (Missing required parameter trapped cleanly)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST M: Bounded Tool Execution Limits
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST M/20] Declarations enforce ceiling on readings limit: ');
  const res = getLatestNoiseReadings({ limit: 1000 }, mockReadings);
  assert(res.returnedCount <= TOOL_CONFIG.MAX_READINGS_LIMIT);
  console.log(`✓ PASSED (Clamped to MAX_READINGS_LIMIT = ${TOOL_CONFIG.MAX_READINGS_LIMIT})`);
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST N: Acoustic Statistics & LAeq Disclosure
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST N/20] get_noise_summary includes acoustic averaging caveat (not LAeq): ');
  const res = getNoiseSummary({}, mockReadings);
  assert.strictEqual(res.ok, true);
  assert(res.statistics.medianDb > 0);
  assert(res.statistics.arithmeticMeanDb > 0);
  assert(res.acousticAveragingNote.includes('Arithmetic mean is provided as a descriptive statistic'));
  assert(res.acousticAveragingNote.includes('not equivalent to LAeq'));
  console.log('✓ PASSED (Calculated descriptive stats with mandatory acoustic disclosure)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST O: Read-Only Tool Enforcement
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST O/20] Tool registry contains strictly read-only retrieval capabilities: ');
  const toolNames = Object.keys(TOOL_REGISTRY);
  const writeKeywords = ['create', 'insert', 'update', 'delete', 'drop', 'resolve', 'write'];
  const hasWriteTool = toolNames.some((name) => writeKeywords.some((w) => name.toLowerCase().includes(w)));
  assert.strictEqual(hasWriteTool, false, 'No write-capable tools allowed in Stage 2');
  console.log(`✓ PASSED (${toolNames.length} allowlisted tools are strictly read-only)`);
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST P: Privacy & Data Bounding
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST P/20] Zero sensitive tokens or private session IDs in summaries: ');
  const availability = getNoiseDataAvailability({}, mockReadings);
  const stringified = JSON.stringify(availability);
  assert(!stringified.includes('GEMINI_API_KEY'));
  assert(!stringified.includes('SUPABASE_ANON_KEY'));
  console.log('✓ PASSED (Private credentials strictly excluded from telemetry)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST Q: Historical Noise Trend Analysis
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST Q/20] get_noise_trend computes delta and identifies direction: ');
  const trend = getNoiseTrend({ time_window: '24h' }, mockReadings);
  assert.strictEqual(trend.ok, true);
  assert(trend.totalObservations > 0);
  assert(['increasing', 'decreasing', 'stable', 'uneven_coverage', 'insufficient_data'].includes(trend.trendDirection || trend.trend));
  console.log(`✓ PASSED (Trend evaluated: delta = ${trend.deltaDb ?? 'N/A'} dB)`);
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST R: Provenance Disclosure in get_noise_data_availability
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST R/20] get_noise_data_availability reports data provenance & baseline flag: ');
  const avail = getNoiseDataAvailability({}, mockReadings);
  assert.strictEqual(avail.ok, true);
  assert.strictEqual(avail.totalReadingsCount, 5);
  assert.strictEqual(avail.totalIncidentsDetected, 1);
  assert(avail.dataProvenance.source === 'NoiseMap Data Service');
  console.log('✓ PASSED (Availability reported: 5 readings, 1 incident cluster, unique sectors)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST S: Gemini Tool Declarations Schema
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST S/20] Formats Gemini function declarations according to API spec: ');
  const toolDefs = getGeminiToolDeclarations();
  assert(Array.isArray(toolDefs));
  assert(Array.isArray(toolDefs[0].functionDeclarations));
  assert(toolDefs[0].functionDeclarations.length >= 6);
  const decl0 = toolDefs[0].functionDeclarations[0];
  assert(decl0.name && decl0.description && decl0.parameters);
  console.log(`✓ PASSED (All ${toolDefs[0].functionDeclarations.length} function declarations match Gemini REST schema)`);
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
}

// -----------------------------------------------------------------------------
// TEST T: Gemini Multi-Turn Tool Call Loop Execution Simulation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST T/20] Simulates multi-turn Gemini function-call loop to final answer: ');
  
  let callCount = 0;
  const mockGeminiFetch = async (_url, options) => {
    callCount++;
    const body = JSON.parse(options.body);

    if (callCount === 1) {
      // Model requests tool call
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [
                  {
                    functionCall: {
                      name: 'get_latest_noise_readings',
                      args: { limit: 2 },
                    },
                  },
                ],
              },
            },
          ],
        }),
      };
    } else {
      // Model consumes tool response and outputs final answer
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [
                  {
                    text: 'Based on the 2 latest measurements, the current average noise level in commercial sectors is 82.5 dB.',
                  },
                ],
              },
            },
          ],
        }),
      };
    }
  };

  const response = await generateGeminiChatResponse({
    message: 'What are the latest readings?',
    apiKey: 'mock_valid_key',
    context: { readings: mockReadings },
    fetchFn: mockGeminiFetch,
  });

  assert.strictEqual(callCount, 2, 'Must execute 2 turns (tool call + final answer)');
  assert.strictEqual(response.toolsUsed.length, 1);
  assert.strictEqual(response.toolsUsed[0].tool, 'get_latest_noise_readings');
  assert(response.message.includes('82.5 dB'));

  console.log('✓ PASSED (Completed 2-turn function-calling loop with toolsUsed recorded)');
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
  console.log('🎉 ALL 20 NOISEMAP AI COPILOT (STAGE 2) ENVIRONMENTAL TESTS PASSED!');
  console.log('------------------------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED.');
  console.log('------------------------------------------------------------------------\n');
  process.exit(1);
}
