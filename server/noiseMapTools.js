/**
 * NoiseMap AI Copilot - Stage 2 Environmental Data Tools
 * Server-side read-only tool layer providing controlled, validated access to
 * NoiseMap readings, incident clusters, temporal trends, and statistical summaries.
 */

// Statutory threshold constants matching src/config/audioThresholds.ts
export const TOOL_CONFIG = {
  DECIBEL_INCIDENT_THRESHOLD: 68.0,
  ACTIVE_WINDOW_MINUTES: 15,
  MAX_READINGS_LIMIT: 25,
  CPCB_RESIDENTIAL_DAY_LIMIT: 55.0,
  CPCB_RESIDENTIAL_NIGHT_LIMIT: 45.0,
};

// Baseline seed data matching NoiseDataService for server execution
export const DEFAULT_BASELINE_RECORDS = [
  {
    id: 'demo-1',
    session_id: 'anon_demo1',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 82.4,
    db_peak: 94.1,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'demo-2',
    session_id: 'anon_demo2',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 84.2,
    db_peak: 91.5,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'demo-3',
    session_id: 'anon_demo3',
    lat: 26.144,
    lng: 91.736,
    grid_id: '26.144_91.736',
    db_avg: 80.7,
    db_peak: 88.0,
    source_type: 'traffic',
    zone_type: 'commercial',
    created_at: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: 'demo-4',
    session_id: 'anon_demo4',
    lat: 26.148,
    lng: 91.741,
    grid_id: '26.148_91.741',
    db_avg: 74.2,
    db_peak: 83.5,
    source_type: 'construction',
    zone_type: 'residential',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'demo-5',
    session_id: 'anon_demo5',
    lat: 26.141,
    lng: 91.731,
    grid_id: '26.141_91.731',
    db_avg: 48.7,
    db_peak: 54.0,
    source_type: 'unknown',
    zone_type: 'silence',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

// In-memory server-side readings store
let serverReadingsStore = [...DEFAULT_BASELINE_RECORDS];

/**
 * Updates or sets server readings store (e.g. from client request context or database)
 */
export function setServerReadings(readings) {
  if (Array.isArray(readings) && readings.length > 0) {
    serverReadingsStore = [...readings];
  }
}

/**
 * Returns current server readings
 */
export function getServerReadings() {
  return [...serverReadingsStore];
}

/**
 * Resets server readings to baseline
 */
export function resetServerReadings() {
  serverReadingsStore = [...DEFAULT_BASELINE_RECORDS];
  return getServerReadings();
}

/**
 * Calculates measurement freshness classification
 */
export function getReadingFreshness(created_at, now = Date.now()) {
  if (!created_at) return 'unknown';
  const timeMs = new Date(created_at).getTime();
  if (Number.isNaN(timeMs) || timeMs <= 0) return 'unknown';
  const ageMinutes = (now - timeMs) / 60000;
  if (ageMinutes < 0) return 'fresh'; // Slight skew
  return ageMinutes <= TOOL_CONFIG.ACTIVE_WINDOW_MINUTES ? 'fresh' : 'stale';
}

/**
 * Calculates elapsed age in minutes
 */
export function getReadingAgeMinutes(created_at, now = Date.now()) {
  if (!created_at) return Infinity;
  const timeMs = new Date(created_at).getTime();
  if (Number.isNaN(timeMs) || timeMs <= 0) return Infinity;
  return Math.max(0, Math.round(((now - timeMs) / 60000) * 10) / 10);
}

/**
 * Calculates distance in meters between two coordinates using Haversine formula
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
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

/**
 * Clusters readings into verified incidents (matches IncidentEngine logic)
 */
export function clusterReadingsToIncidents(readings, now = Date.now()) {
  const FIFTEEN_MIN_MS = TOOL_CONFIG.ACTIVE_WINDOW_MINUTES * 60 * 1000;
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const incidents = [];

  // Group by grid_id
  const gridMap = new Map();
  readings.forEach((r) => {
    if (!r.grid_id && (!r.lat || !r.lng)) return;
    const gridId = r.grid_id || `${Number(r.lat).toFixed(3)}_${Number(r.lng).toFixed(3)}`;
    const list = gridMap.get(gridId) || [];
    list.push(r);
    gridMap.set(gridId, list);
  });

  gridMap.forEach((gridReadings, gridId) => {
    // Sort newest first
    gridReadings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const latestReading = gridReadings[0];
    const latestTime = new Date(latestReading.created_at).getTime();
    const ageMs = now - latestTime;
    const isWithin15m = ageMs <= FIFTEEN_MIN_MS;

    const uniqueSessions = new Set(gridReadings.map((r) => r.session_id));
    const avgDb = Math.round((gridReadings.reduce((sum, r) => sum + r.db_avg, 0) / gridReadings.length) * 10) / 10;
    const peakDb = Math.max(...gridReadings.map((r) => r.db_peak));

    // Consensus rule: >= 3 unique users & avg >= 68 dB
    if (uniqueSessions.size >= 3 && avgDb >= TOOL_CONFIG.DECIBEL_INCIDENT_THRESHOLD) {
      const timestamps = gridReadings.map((r) => new Date(r.created_at).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const durationMin = Math.max(Math.round((maxTime - minTime) / 60000), 1);

      // Dominant source
      const counts = {};
      gridReadings.forEach((r) => {
        counts[r.source_type] = (counts[r.source_type] || 0) + 1;
      });
      let dominant = 'traffic';
      let maxCnt = 0;
      for (const src of Object.keys(counts)) {
        if (counts[src] > maxCnt) {
          maxCnt = counts[src];
          dominant = src;
        }
      }

      // Evidence confidence formula (0-100)
      const evidenceScore = Math.min(
        100,
        Math.round(
          uniqueSessions.size * 15 +
            Math.min(gridReadings.length, 10) * 3 +
            (avgDb >= 75 ? 20 : 10) +
            (isWithin15m ? 20 : 0)
        )
      );

      // Lifecycle state determination:
      // - active: fresh evidence within 15 minutes
      // - monitoring: age between 15m and 60m (unconfirmed subsidence / device left)
      // - resolved: age > 60m or latest verified quiet reading < 68 dB
      let lifecycleState = 'resolved';
      if (isWithin15m) {
        lifecycleState = 'active';
      } else if (ageMs <= ONE_HOUR_MS) {
        lifecycleState = 'monitoring';
      }

      incidents.push({
        id: `inc_${gridId.replace('.', '_')}`,
        grid_id: gridId,
        center_lat: latestReading.lat,
        center_lng: latestReading.lng,
        location_name: `Grid Sector ${gridId}`,
        started_at: new Date(minTime).toISOString(),
        last_seen_at: new Date(maxTime).toISOString(),
        duration_min: durationMin,
        avg_db: avgDb,
        peak_db: peakDb,
        reading_count: gridReadings.length,
        unique_users: uniqueSessions.size,
        dominant_source: dominant,
        evidence_score: evidenceScore,
        status: isWithin15m ? 'active' : 'resolved',
        lifecycle_state: lifecycleState,
        created_at: new Date(minTime).toISOString(),
        reading_ids: gridReadings.map((r) => r.id),
      });
    }
  });

  return incidents.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
}

// -----------------------------------------------------------------------------
// TOOL IMPLEMENTATIONS
// -----------------------------------------------------------------------------

/**
 * TOOL A: get_latest_noise_readings
 * Retrieves validated noise readings sorted newest first with freshness flags.
 */
export function getLatestNoiseReadings(params = {}, dataset = serverReadingsStore) {
  const { area, limit = 10, since, until } = params;
  const now = Date.now();

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), TOOL_CONFIG.MAX_READINGS_LIMIT);

  let filtered = dataset.filter((r) => {
    // Validate numbers
    if (typeof r.db_avg !== 'number' || Number.isNaN(r.db_avg) || r.db_avg < 30 || r.db_avg > 130) {
      return false;
    }

    // Area filter (case-insensitive substring match on grid_id, zone_type, or source_type)
    if (area && typeof area === 'string' && area.trim()) {
      const q = area.toLowerCase().trim();
      const match =
        (r.grid_id && r.grid_id.toLowerCase().includes(q)) ||
        (r.zone_type && r.zone_type.toLowerCase().includes(q)) ||
        (r.source_type && r.source_type.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Temporal filter: since
    if (since) {
      const sinceTime = new Date(since).getTime();
      if (!Number.isNaN(sinceTime) && new Date(r.created_at).getTime() < sinceTime) {
        return false;
      }
    }

    // Temporal filter: until
    if (until) {
      const untilTime = new Date(until).getTime();
      if (!Number.isNaN(untilTime) && new Date(r.created_at).getTime() > untilTime) {
        return false;
      }
    }

    return true;
  });

  // Sort strictly newest first
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const sliced = filtered.slice(0, safeLimit);

  const records = sliced.map((r) => ({
    id: r.id,
    grid_id: r.grid_id,
    lat: r.lat,
    lng: r.lng,
    db_avg: r.db_avg,
    db_peak: r.db_peak,
    source_type: r.source_type,
    zone_type: r.zone_type,
    created_at: r.created_at,
    age_minutes: getReadingAgeMinutes(r.created_at, now),
    freshness: getReadingFreshness(r.created_at, now),
  }));

  const elevatedCount = records.filter((r) => r.db_avg >= TOOL_CONFIG.DECIBEL_INCIDENT_THRESHOLD).length;

  return {
    ok: true,
    tool: 'get_latest_noise_readings',
    query: { area: area || null, limit: safeLimit, since: since || null, until: until || null },
    totalAvailableInDataset: dataset.length,
    returnedCount: records.length,
    elevatedCount,
    latestMeasurementAt: records[0]?.created_at || null,
    freshnessSummary: {
      freshCount: records.filter((r) => r.freshness === 'fresh').length,
      staleCount: records.filter((r) => r.freshness === 'stale').length,
    },
    records,
    warnings: records.length === 0 ? ['No measurements matched the specified criteria in the current dataset.'] : [],
  };
}

/**
 * TOOL B: get_noise_summary
 * Computes descriptive noise statistics, exceedances, and breakdown by source and zone.
 */
export function getNoiseSummary(params = {}, dataset = serverReadingsStore) {
  const { area, from, to } = params;
  const now = Date.now();

  let filtered = dataset.filter((r) => {
    if (typeof r.db_avg !== 'number' || Number.isNaN(r.db_avg)) return false;

    if (area && typeof area === 'string' && area.trim()) {
      const q = area.toLowerCase().trim();
      const match =
        (r.grid_id && r.grid_id.toLowerCase().includes(q)) ||
        (r.zone_type && r.zone_type.toLowerCase().includes(q)) ||
        (r.source_type && r.source_type.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (from) {
      const fromTime = new Date(from).getTime();
      if (!Number.isNaN(fromTime) && new Date(r.created_at).getTime() < fromTime) return false;
    }

    if (to) {
      const toTime = new Date(to).getTime();
      if (!Number.isNaN(toTime) && new Date(r.created_at).getTime() > toTime) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    return {
      ok: true,
      tool: 'get_noise_summary',
      query: { area: area || null, from: from || null, to: to || null },
      sampleCount: 0,
      summary: null,
      warnings: ['No measurements available for the requested area and time window.'],
    };
  }

  // Sort chronologically
  filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const dbValues = filtered.map((r) => r.db_avg).sort((a, b) => a - b);
  const minDb = dbValues[0];
  const maxDb = dbValues[dbValues.length - 1];
  const medianDb =
    dbValues.length % 2 === 0
      ? Math.round(((dbValues[dbValues.length / 2 - 1] + dbValues[dbValues.length / 2]) / 2) * 10) / 10
      : Math.round(dbValues[Math.floor(dbValues.length / 2)] * 10) / 10;
  const sum = dbValues.reduce((acc, val) => acc + val, 0);
  const arithmeticMeanDb = Math.round((sum / dbValues.length) * 10) / 10;

  // Exceedance counts
  const exceedCount68 = dbValues.filter((v) => v >= TOOL_CONFIG.DECIBEL_INCIDENT_THRESHOLD).length;
  const exceedCount55 = dbValues.filter((v) => v >= TOOL_CONFIG.CPCB_RESIDENTIAL_DAY_LIMIT).length;
  const compliantCount50 = dbValues.filter((v) => v < 50.0).length;

  // Source breakdown
  const sourceBreakdown = {};
  filtered.forEach((r) => {
    sourceBreakdown[r.source_type] = (sourceBreakdown[r.source_type] || 0) + 1;
  });

  // Zone breakdown
  const zoneBreakdown = {};
  filtered.forEach((r) => {
    zoneBreakdown[r.zone_type] = (zoneBreakdown[r.zone_type] || 0) + 1;
  });

  const earliestTimestamp = filtered[0].created_at;
  const latestTimestamp = filtered[filtered.length - 1].created_at;

  return {
    ok: true,
    tool: 'get_noise_summary',
    query: { area: area || null, from: from || null, to: to || null },
    sampleCount: filtered.length,
    earliestMeasurementAt: earliestTimestamp,
    latestMeasurementAt: latestTimestamp,
    freshness: getReadingFreshness(latestTimestamp, now),
    statistics: {
      minDb,
      maxDb,
      medianDb,
      arithmeticMeanDb,
      exceedanceStatutory68Db: exceedCount68,
      exceedanceResidentialDay55Db: exceedCount55,
      compliantUnder50Db: compliantCount50,
    },
    sourceBreakdown,
    zoneBreakdown,
    acousticAveragingNote:
      'Arithmetic mean is provided as a descriptive statistic. It is not equivalent to LAeq (energy-equivalent sound level), as continuous integration duration metadata is not captured.',
    warnings: [],
  };
}

/**
 * TOOL C: get_noise_trend
 * Compares noise observations over time intervals to detect changes, deltas, and coverage gaps.
 */
export function getNoiseTrend(params = {}, dataset = serverReadingsStore) {
  const { area, time_window = '24h' } = params;
  const now = Date.now();

  let windowMs = 24 * 60 * 60 * 1000;
  if (time_window === '1h') windowMs = 60 * 60 * 1000;
  else if (time_window === '7d') windowMs = 7 * 24 * 60 * 60 * 1000;
  else if (time_window === 'all') windowMs = 30 * 24 * 60 * 60 * 1000;

  const startTime = now - windowMs;
  const midTime = now - windowMs / 2;

  let filtered = dataset.filter((r) => {
    if (typeof r.db_avg !== 'number' || Number.isNaN(r.db_avg)) return false;
    const t = new Date(r.created_at).getTime();
    if (t < startTime || t > now) return false;

    if (area && typeof area === 'string' && area.trim()) {
      const q = area.toLowerCase().trim();
      const match =
        (r.grid_id && r.grid_id.toLowerCase().includes(q)) ||
        (r.zone_type && r.zone_type.toLowerCase().includes(q)) ||
        (r.source_type && r.source_type.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  if (filtered.length < 2) {
    return {
      ok: true,
      tool: 'get_noise_trend',
      query: { area: area || null, time_window },
      periodCoveredMs: windowMs,
      totalObservations: filtered.length,
      observationsCount: filtered.length,
      trend: 'insufficient_data',
      trendDirection: 'insufficient_data',
      explanation:
        'Insufficient measurements in the selected time window to establish a statistically meaningful trend.',
      warnings: ['Fewer than 2 measurements available; trend cannot be reliably asserted.'],
    };
  }

  const periodA = filtered.filter((r) => new Date(r.created_at).getTime() < midTime);
  const periodB = filtered.filter((r) => new Date(r.created_at).getTime() >= midTime);

  if (periodA.length === 0 || periodB.length === 0) {
    return {
      ok: true,
      tool: 'get_noise_trend',
      query: { area: area || null, time_window },
      totalObservations: filtered.length,
      observationsCount: filtered.length,
      trend: 'uneven_coverage',
      trendDirection: 'uneven_coverage',
      explanation: `All ${filtered.length} measurements are clustered in one half of the time window. Long-term trend cannot be established.`,
      warnings: ['Measurement gap detected: one half of the window lacks coverage.'],
    };
  }

  const avgA = Math.round((periodA.reduce((sum, r) => sum + r.db_avg, 0) / periodA.length) * 10) / 10;
  const avgB = Math.round((periodB.reduce((sum, r) => sum + r.db_avg, 0) / periodB.length) * 10) / 10;
  const deltaDb = Math.round((avgB - avgA) * 10) / 10;

  let trendDirection = 'stable';
  if (deltaDb >= 3.0) trendDirection = 'increasing';
  else if (deltaDb <= -3.0) trendDirection = 'decreasing';

  return {
    ok: true,
    tool: 'get_noise_trend',
    query: { area: area || null, time_window },
    totalObservations: filtered.length,
    observationsCount: filtered.length,
    earlierPeriod: {
      sampleCount: periodA.length,
      averageDb: avgA,
    },
    recentPeriod: {
      sampleCount: periodB.length,
      averageDb: avgB,
    },
    deltaDb,
    trendDirection,
    summary: `Noise has changed by ${deltaDb > 0 ? '+' : ''}${deltaDb} dB between the earlier and recent periods (trend: ${trendDirection}).`,
    warnings: [],
  };
}

/**
 * TOOL D: get_active_incident_clusters
 * Retrieves multi-contributor incidents with active/resolved/monitoring status and confidence score.
 */
export function getActiveIncidentClusters(params = {}, dataset = serverReadingsStore) {
  const { status = 'active', area } = params;
  const now = Date.now();

  const allIncidents = clusterReadingsToIncidents(dataset, now);

  let filtered = allIncidents.filter((inc) => {
    if (status && status !== 'all') {
      if (status === 'monitoring') {
        if (inc.lifecycle_state !== 'monitoring') return false;
      } else if (inc.status !== status && inc.lifecycle_state !== status) {
        return false;
      }
    }
    if (area && typeof area === 'string' && area.trim()) {
      const q = area.toLowerCase().trim();
      const match =
        inc.grid_id.toLowerCase().includes(q) ||
        inc.location_name.toLowerCase().includes(q) ||
        inc.dominant_source.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return {
    ok: true,
    tool: 'get_active_incident_clusters',
    query: { status, area: area || null },
    totalClustersDetected: allIncidents.length,
    returnedClustersCount: filtered.length,
    incidents: filtered.map((inc) => ({
      id: inc.id,
      grid_id: inc.grid_id,
      location_name: inc.location_name,
      center: { lat: inc.center_lat, lng: inc.center_lng },
      averageDb: inc.avg_db,
      peakDb: inc.peak_db,
      reading_count: inc.reading_count,
      unique_contributing_users: inc.unique_users,
      dominant_source: inc.dominant_source,
      evidence_confidence_score: inc.evidence_score,
      status: inc.status,
      lifecycle_state: inc.lifecycle_state || (inc.status === 'active' ? 'active' : 'resolved'),
      started_at: inc.started_at,
      last_seen_at: inc.last_seen_at,
      age_minutes: getReadingAgeMinutes(inc.last_seen_at, now),
      freshness: getReadingFreshness(inc.last_seen_at, now),
    })),
    warnings: filtered.length === 0 ? ['No incident clusters found matching the requested status and area.'] : [],
  };
}

/**
 * TOOL E: get_incident_details
 * Retrieves complete corroboration telemetry for a specific incident.
 */
export function getIncidentDetails(params = {}, dataset = serverReadingsStore) {
  const { incident_id } = params;
  if (!incident_id || typeof incident_id !== 'string') {
    return { ok: false, error: 'incident_id is required.', code: 'INVALID_ARGUMENT' };
  }

  const incidents = clusterReadingsToIncidents(dataset, Date.now());
  const incident = incidents.find(
    (inc) => inc.id === incident_id || inc.grid_id === incident_id || inc.id.includes(incident_id)
  );

  if (!incident) {
    return {
      ok: false,
      tool: 'get_incident_details',
      incident_id,
      error: `Incident with ID "${incident_id}" was not found in the current incident registry.`,
      code: 'INCIDENT_NOT_FOUND',
    };
  }

  const deltaAboveResidentialDay = Math.round((incident.avg_db - TOOL_CONFIG.CPCB_RESIDENTIAL_DAY_LIMIT) * 10) / 10;

  return {
    ok: true,
    tool: 'get_incident_details',
    incident: {
      ...incident,
      cpcbDayResidentialDeltaDb: deltaAboveResidentialDay,
      exceedsCpcbStatutoryLimit: deltaAboveResidentialDay > 0,
      freshness: getReadingFreshness(incident.last_seen_at),
    },
  };
}

/**
 * TOOL F: get_noise_data_availability
 * Summarizes the environmental dataset scope, bounds, and provenance.
 */
export function getNoiseDataAvailability(_params = {}, dataset = serverReadingsStore) {
  const now = Date.now();
  const validReadings = dataset.filter((r) => typeof r.db_avg === 'number' && !Number.isNaN(r.db_avg));
  const incidents = clusterReadingsToIncidents(validReadings, now);
  const activeIncidents = incidents.filter((i) => i.status === 'active');

  const timestamps = validReadings.map((r) => new Date(r.created_at).getTime()).filter((t) => !Number.isNaN(t));
  const earliestAt = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null;
  const latestAt = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

  const uniqueGrids = Array.from(new Set(validReadings.map((r) => r.grid_id)));

  return {
    ok: true,
    tool: 'get_noise_data_availability',
    totalReadingsCount: validReadings.length,
    totalIncidentsDetected: incidents.length,
    activeIncidentsCount: activeIncidents.length,
    resolvedIncidentsCount: incidents.length - activeIncidents.length,
    earliestMeasurementAt: earliestAt,
    latestMeasurementAt: latestAt,
    overallFreshness: latestAt ? getReadingFreshness(latestAt, now) : 'unknown',
    geographicCoverage: {
      uniqueSectorsCount: uniqueGrids.length,
      sampleSectors: uniqueGrids.slice(0, 5),
    },
    dataProvenance: {
      source: 'NoiseMap Data Service',
      mode: process.env.VITE_SUPABASE_URL ? 'supabase_cloud_sync' : 'autonomous_local_pwa_store',
      isBaselineDataIncluded: validReadings.some((r) => r.id.startsWith('demo-')),
    },
    warnings: validReadings.length === 0 ? ['Dataset is currently empty.'] : [],
  };
}

/**
 * TOOL G: get_readings_nearby
 * Retrieves verified noise readings within a geospatial radius (in meters) around a coordinate.
 */
export function getReadingsNearby(params = {}, dataset = serverReadingsStore) {
  const { lat, lng, radius_meters = 1000, limit = 10, since } = params;
  const now = Date.now();

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (Number.isNaN(numLat) || numLat < -90 || numLat > 90) {
    return { ok: false, error: 'Valid latitude between -90 and 90 is required.', code: 'INVALID_ARGUMENT' };
  }
  if (Number.isNaN(numLng) || numLng < -180 || numLng > 180) {
    return { ok: false, error: 'Valid longitude between -180 and 180 is required.', code: 'INVALID_ARGUMENT' };
  }

  const safeRadius = Math.min(Math.max(10, parseFloat(radius_meters) || 1000), 50000);
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), TOOL_CONFIG.MAX_READINGS_LIMIT);

  let filtered = dataset.filter((r) => {
    if (typeof r.db_avg !== 'number' || Number.isNaN(r.db_avg) || r.db_avg < 30 || r.db_avg > 130) {
      return false;
    }
    if (typeof r.lat !== 'number' || typeof r.lng !== 'number') {
      return false;
    }
    if (since) {
      const sinceTime = new Date(since).getTime();
      if (!Number.isNaN(sinceTime) && new Date(r.created_at).getTime() < sinceTime) {
        return false;
      }
    }
    return true;
  });

  // Calculate distance for each reading
  const withDistance = filtered.map((r) => {
    const dist = haversineDistanceMeters(numLat, numLng, r.lat, r.lng);
    return {
      ...r,
      distance_meters: Math.round(dist * 10) / 10,
    };
  }).filter((r) => r.distance_meters <= safeRadius);

  // Sort by distance ascending, then by timestamp descending
  withDistance.sort((a, b) => {
    if (Math.abs(a.distance_meters - b.distance_meters) > 5) {
      return a.distance_meters - b.distance_meters;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const sliced = withDistance.slice(0, safeLimit);

  const records = sliced.map((r) => ({
    id: r.id,
    grid_id: r.grid_id,
    lat: r.lat,
    lng: r.lng,
    distance_meters: r.distance_meters,
    db_avg: r.db_avg,
    db_peak: r.db_peak,
    source_type: r.source_type,
    zone_type: r.zone_type,
    created_at: r.created_at,
    age_minutes: getReadingAgeMinutes(r.created_at, now),
    freshness: getReadingFreshness(r.created_at, now),
  }));

  return {
    ok: true,
    tool: 'get_readings_nearby',
    center: { lat: numLat, lng: numLng },
    radius_meters: safeRadius,
    totalNearbyFound: withDistance.length,
    returnedCount: records.length,
    records,
    warnings: records.length === 0 ? [`No noise measurements found within ${safeRadius}m of (${numLat}, ${numLng}).`] : [],
  };
}

/**
 * TOOL H: suggest_map_action
 * Generates an allowlisted, structured UI map navigation payload.
 */
export function suggestMapAction(params = {}) {
  const { action_type, target_id, lat, lng, zoom = 15, label } = params;

  const validTypes = ['focus_location', 'show_incident', 'open_incident_details'];
  if (!action_type || !validTypes.includes(action_type)) {
    return {
      ok: false,
      error: `action_type must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_ARGUMENT',
    };
  }

  const payload = {};
  if (action_type === 'focus_location') {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    if (Number.isNaN(numLat) || Number.isNaN(numLng)) {
      return { ok: false, error: 'lat and lng numbers are required for focus_location.', code: 'INVALID_ARGUMENT' };
    }
    payload.lat = numLat;
    payload.lng = numLng;
    payload.zoom = Math.min(Math.max(1, parseInt(zoom, 10) || 15), 19);
  } else if (action_type === 'show_incident' || action_type === 'open_incident_details') {
    if (!target_id && !params.incident_id) {
      return { ok: false, error: 'target_id or incident_id is required.', code: 'INVALID_ARGUMENT' };
    }
    payload.incident_id = target_id || params.incident_id;
    if (lat !== undefined && lng !== undefined) {
      payload.lat = parseFloat(lat);
      payload.lng = parseFloat(lng);
    }
  }

  return {
    ok: true,
    tool: 'suggest_map_action',
    action: {
      type: action_type,
      payload,
      label: label || `Navigate map to ${action_type.replace('_', ' ')}`,
    },
    message: `Suggested map action prepared: ${action_type}`,
  };
}

/**
 * TOOL I: draft_noise_complaint
 * Prepares a structured CPCB statutory grievance draft for explicit citizen review.
 * Guaranteed zero autonomous mutation: user review and confirmation modal required.
 */
export function draftNoiseComplaint(params = {}, dataset = serverReadingsStore) {
  const { location_name, dominant_source, description, incident_id, zone_type = 'residential' } = params;

  if (!location_name || typeof location_name !== 'string' || !location_name.trim()) {
    return { ok: false, error: 'location_name is required.', code: 'INVALID_ARGUMENT' };
  }

  const cleanLocation = location_name.trim();
  const cleanSource = (dominant_source || 'unspecified').trim().toLowerCase();
  const cleanDesc = (description || '').trim();

  // If incident_id is provided, look up incident telemetry
  let incident = null;
  if (incident_id) {
    const incidents = clusterReadingsToIncidents(dataset, Date.now());
    incident = incidents.find((i) => i.id === incident_id || i.grid_id === incident_id);
  }

  const avgDb = incident ? incident.avg_db : (params.db_level ? parseFloat(params.db_level) : 72.0);
  const peakDb = incident ? incident.peak_db : (avgDb + 10.0);
  const cpcbDayLimit = zone_type === 'commercial' ? 65.0 : zone_type === 'industrial' ? 75.0 : zone_type === 'silence' ? 50.0 : TOOL_CONFIG.CPCB_RESIDENTIAL_DAY_LIMIT;
  const exceedanceDb = Math.max(0, Math.round((avgDb - cpcbDayLimit) * 10) / 10);

  const draftId = `DRAFT-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

  const draft = {
    draftId,
    incidentId: incident?.id || incident_id || null,
    locationName: cleanLocation,
    zoneType: zone_type,
    dominantSource: cleanSource,
    description: cleanDesc || `Citizen grievance regarding excessive ${cleanSource} noise reaching ${avgDb} dB in ${cleanLocation}.`,
    averageDb: avgDb,
    peakDb: peakDb,
    cpcbLimit: cpcbDayLimit,
    exceedanceDb,
    contributorCount: incident?.unique_users || 1,
    evidenceConfidenceScore: incident?.evidence_score || 70,
    status: 'draft_pending_user_confirmation',
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    tool: 'draft_noise_complaint',
    requiresUserConfirmation: true,
    disclaimer: 'This draft grievance has been formulated for citizen review. NoiseMap will not file or transmit any complaint autonomously without explicit user approval.',
    draft,
  };
}

// -----------------------------------------------------------------------------
// TOOL REGISTRY FOR GEMINI FUNCTION DECLARATIONS
// -----------------------------------------------------------------------------

export const TOOL_REGISTRY = {
  get_latest_noise_readings: {
    fn: getLatestNoiseReadings,
    declaration: {
      name: 'get_latest_noise_readings',
      description:
        'Retrieves the latest verified noise measurements from NoiseMap, with dB levels, sector IDs, timestamps, and freshness classifications.',
      parameters: {
        type: 'OBJECT',
        properties: {
          area: {
            type: 'STRING',
            description: 'Optional location sector or zone name (e.g. "commercial", "residential", or grid "26.144_91.736").',
          },
          limit: {
            type: 'INTEGER',
            description: 'Maximum number of readings to return (default 10, max 25).',
          },
          since: {
            type: 'STRING',
            description: 'Optional ISO timestamp boundary to filter readings recorded after this time.',
          },
        },
      },
    },
  },

  get_noise_summary: {
    fn: getNoiseSummary,
    declaration: {
      name: 'get_noise_summary',
      description:
        'Calculates descriptive environmental noise statistics (min, max, median, arithmetic mean, CPCB exceedances) and breakdown by source for an area.',
      parameters: {
        type: 'OBJECT',
        properties: {
          area: {
            type: 'STRING',
            description: 'Optional area or sector identifier to summarize.',
          },
          from: {
            type: 'STRING',
            description: 'Optional start ISO timestamp for the summary window.',
          },
          to: {
            type: 'STRING',
            description: 'Optional end ISO timestamp for the summary window.',
          },
        },
      },
    },
  },

  get_noise_trend: {
    fn: getNoiseTrend,
    declaration: {
      name: 'get_noise_trend',
      description:
        'Analyzes historical sound changes over a time window (1h, 24h, 7d) to determine if noise is increasing, decreasing, or steady.',
      parameters: {
        type: 'OBJECT',
        properties: {
          area: {
            type: 'STRING',
            description: 'Optional sector or area to analyze.',
          },
          time_window: {
            type: 'STRING',
            description: 'Time window to compare: "1h", "24h", "7d", or "all".',
          },
        },
      },
    },
  },

  get_active_incident_clusters: {
    fn: getActiveIncidentClusters,
    declaration: {
      name: 'get_active_incident_clusters',
      description:
        'Retrieves multi-contributor civic noise incident clusters confirmed by 3+ independent devices, with status (active vs resolved) and evidence scores.',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: {
            type: 'STRING',
            description: 'Incident status filter: "active", "resolved", or "all" (default "active").',
          },
          area: {
            type: 'STRING',
            description: 'Optional area or sector name filter.',
          },
        },
      },
    },
  },

  get_incident_details: {
    fn: getIncidentDetails,
    declaration: {
      name: 'get_incident_details',
      description:
        'Fetches deep corroboration telemetry for a specific noise incident by its incident ID or sector grid ID.',
      parameters: {
        type: 'OBJECT',
        properties: {
          incident_id: {
            type: 'STRING',
            description: 'The unique incident ID or grid ID (e.g. "inc_26_144_91_736").',
          },
        },
        required: ['incident_id'],
      },
    },
  },

  get_noise_data_availability: {
    fn: getNoiseDataAvailability,
    declaration: {
      name: 'get_noise_data_availability',
      description:
        'Checks what environmental data is currently available in NoiseMap, including total readings count, temporal range, and active incidents.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
    },
  },

  get_readings_nearby: {
    fn: getReadingsNearby,
    declaration: {
      name: 'get_readings_nearby',
      description:
        'Retrieves verified noise readings within a specified geodesic radius (meters) around a GPS coordinate, sorted closest-first.',
      parameters: {
        type: 'OBJECT',
        properties: {
          lat: {
            type: 'NUMBER',
            description: 'Center latitude coordinate (-90 to 90).',
          },
          lng: {
            type: 'NUMBER',
            description: 'Center longitude coordinate (-180 to 180).',
          },
          radius_meters: {
            type: 'NUMBER',
            description: 'Search radius in meters (default 1000m, min 10m, max 50000m).',
          },
          limit: {
            type: 'INTEGER',
            description: 'Maximum number of nearby readings to return (default 10, max 25).',
          },
          since: {
            type: 'STRING',
            description: 'Optional ISO timestamp boundary to filter readings recorded after this time.',
          },
        },
        required: ['lat', 'lng'],
      },
    },
  },

  suggest_map_action: {
    fn: suggestMapAction,
    declaration: {
      name: 'suggest_map_action',
      description:
        'Suggests an allowlisted client-side map navigation action (e.g. focus_location, show_incident, open_incident_details) to guide the citizen on the NoiseMap interface.',
      parameters: {
        type: 'OBJECT',
        properties: {
          action_type: {
            type: 'STRING',
            description: 'The type of UI action: "focus_location", "show_incident", or "open_incident_details".',
          },
          lat: {
            type: 'NUMBER',
            description: 'Target latitude coordinate for focus_location.',
          },
          lng: {
            type: 'NUMBER',
            description: 'Target longitude coordinate for focus_location.',
          },
          zoom: {
            type: 'INTEGER',
            description: 'Map zoom level (default 15).',
          },
          target_id: {
            type: 'STRING',
            description: 'Target incident ID or sector ID for show_incident / open_incident_details.',
          },
          label: {
            type: 'STRING',
            description: 'Human-readable button label for the suggested action.',
          },
        },
        required: ['action_type'],
      },
    },
  },

  draft_noise_complaint: {
    fn: draftNoiseComplaint,
    declaration: {
      name: 'draft_noise_complaint',
      description:
        'Formulates a pre-filled CPCB statutory grievance draft for citizen review. Does NOT file or mutate any data autonomously; requires explicit citizen review and confirmation.',
      parameters: {
        type: 'OBJECT',
        properties: {
          location_name: {
            type: 'STRING',
            description: 'Locality or address where the noise violation is occurring.',
          },
          dominant_source: {
            type: 'STRING',
            description: 'Dominant source tag (traffic, construction, loudspeaker, industrial, siren).',
          },
          description: {
            type: 'STRING',
            description: 'Citizen narrative explaining the nature and impact of the disturbance.',
          },
          incident_id: {
            type: 'STRING',
            description: 'Optional ID of verified incident cluster to link telemetry evidence.',
          },
          zone_type: {
            type: 'STRING',
            description: 'Statutory zone classification (residential, commercial, industrial, silence).',
          },
        },
        required: ['location_name'],
      },
    },
  },
};

/**
 * Returns formatted tool declarations for the Google Gemini API request body.
 */
export function getGeminiToolDeclarations() {
  const functionDeclarations = Object.values(TOOL_REGISTRY).map((t) => t.declaration);
  return [{ functionDeclarations }];
}

/**
 * Executes an allowlisted tool function safely with parameter validation and result bounding.
 */
export function executeTool(toolName, args = {}, dataset = serverReadingsStore) {
  const entry = TOOL_REGISTRY[toolName];
  if (!entry) {
    return {
      ok: false,
      error: `Tool "${toolName}" is not recognized or not allowlisted.`,
      code: 'UNKNOWN_TOOL',
    };
  }

  try {
    return entry.fn(args || {}, dataset);
  } catch (err) {
    return {
      ok: false,
      error: `Error executing tool "${toolName}": ${err.message}`,
      code: 'TOOL_EXECUTION_ERROR',
    };
  }
}
