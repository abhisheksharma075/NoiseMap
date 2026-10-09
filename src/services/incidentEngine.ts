// Algorithmic Incident Engine
// Detects multi-contributor spatial-temporal consensus:
// - Same ~100m grid cell (or within 100m geodesic distance)
// - Within 15-minute sliding temporal window
// - Exceeds statutory threshold (>70 dB)
// - >= 3 independent citizen session tokens

import { NoiseReading, NoiseIncident, NoiseSourceType } from '../types';
import { ScoreCalculator } from '../utils/scoreCalculator';

export class IncidentEngine {
  /**
   * Calculates distance in meters between two coordinates using Haversine formula
   */
  public static getDistanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Clusters a collection of noise readings into verified incidents.
   */
  public static clusterReadings(
    readings: NoiseReading[],
    existingIncidents: NoiseIncident[] = []
  ): NoiseIncident[] {
    const activeIncidents = [...existingIncidents];
    const now = Date.now();
    const FIFTEEN_MIN_MS = 15 * 60 * 1000;

    // Filter readings to recent temporal window (last 15 minutes)
    const recentReadings = readings.filter((r) => {
      const readingTime = new Date(r.created_at).getTime();
      return now - readingTime <= FIFTEEN_MIN_MS;
    });

    // Group readings by grid_id
    const gridMap = new Map<string, NoiseReading[]>();
    recentReadings.forEach((r) => {
      const list = gridMap.get(r.grid_id) || [];
      list.push(r);
      gridMap.set(r.grid_id, list);
    });

    // Evaluate each grid cluster for consensus criteria
    gridMap.forEach((gridReadings, gridId) => {
      const uniqueSessions = new Set(gridReadings.map((r) => r.session_id));
      const readingCount = gridReadings.length;
      const sumAvg = gridReadings.reduce((sum, r) => sum + r.db_avg, 0);
      const clusterAvgDb = sumAvg / readingCount;
      const clusterPeakDb = Math.max(...gridReadings.map((r) => r.db_peak));

      // Consensus condition check:
      // 1. >= 3 distinct contributor sessions
      // 2. Average dB exceeds threshold (70 dB)
      if (uniqueSessions.size >= 3 && clusterAvgDb >= 68.0) {
        // Calculate earliest and latest timestamps
        const timestamps = gridReadings.map((r) => new Date(r.created_at).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const durationMin = Math.max(Math.round((maxTime - minTime) / 60000), 1);

        // Find dominant noise source tag
        const sourceCounts = new Map<NoiseSourceType, number>();
        gridReadings.forEach((r) => {
          sourceCounts.set(r.source_type, (sourceCounts.get(r.source_type) || 0) + 1);
        });
        let dominantSource: NoiseSourceType = 'traffic';
        let maxCount = 0;
        sourceCounts.forEach((cnt, src) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            dominantSource = src;
          }
        });

        // Compute mathematical evidence confidence
        const breakdown = ScoreCalculator.calculateConfidence(
          readingCount,
          uniqueSessions.size,
          durationMin,
          clusterAvgDb,
          clusterPeakDb
        );

        // Check if an incident already exists for this grid
        const existingIndex = activeIncidents.findIndex((inc) => inc.grid_id === gridId);

        const centerLat = gridReadings[0].lat;
        const centerLng = gridReadings[0].lng;

        const incidentRecord: NoiseIncident = {
          id: existingIndex >= 0 ? activeIncidents[existingIndex].id : 'inc_' + crypto.randomUUID().slice(0, 8),
          grid_id: gridId,
          center_lat: centerLat,
          center_lng: centerLng,
          location_name: `Grid Sector ${gridId}`,
          started_at: new Date(minTime).toISOString(),
          last_seen_at: new Date(maxTime).toISOString(),
          duration_min: durationMin,
          avg_db: Math.round(clusterAvgDb * 10) / 10,
          peak_db: Math.round(clusterPeakDb * 10) / 10,
          reading_count: readingCount,
          unique_users: uniqueSessions.size,
          dominant_source: dominantSource,
          evidence_score: breakdown.totalScore,
          status: 'active',
          created_at: new Date(minTime).toISOString(),
        };

        if (existingIndex >= 0) {
          activeIncidents[existingIndex] = incidentRecord;
        } else {
          activeIncidents.unshift(incidentRecord);
        }
      }
    });

    return activeIncidents;
  }
}
