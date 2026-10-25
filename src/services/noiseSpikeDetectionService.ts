import { AUDIO_CONFIG } from '../config/audioThresholds';

export type SpikeClassification =
  | 'spike_only'
  | 'high_level_only'
  | 'spike_and_incident'
  | 'normal';

export interface NoiseSpikeEvent {
  id: string;
  timestamp: number; // Wall-clock timestamp for UI display (Date.now())
  monotonicTime: number; // Monotonic time for precise window calculation (performance.now())
  previousDb: number;
  currentDb: number;
  deltaDb: number;
  spikeThresholdUsed: number;
  incidentThresholdExceeded: boolean;
  classification: SpikeClassification;
  message: string;
}

export interface SpikeDetectorOptions {
  spikeDeltaDb?: number;
  spikeTimeWindowMs?: number;
  incidentThresholdDb?: number;
  cooldownMs?: number;
}

export class NoiseSpikeDetector {
  private spikeDeltaDb: number;
  private spikeTimeWindowMs: number;
  private incidentThresholdDb: number;
  private cooldownMs: number;

  private lastValidDb: number | null = null;
  private lastMonotonicTime: number | null = null;
  private lastSpikeTriggerTime: number = 0;

  constructor(options?: SpikeDetectorOptions) {
    this.spikeDeltaDb = options?.spikeDeltaDb ?? AUDIO_CONFIG.SPIKE_DELTA_DB;
    this.spikeTimeWindowMs = options?.spikeTimeWindowMs ?? AUDIO_CONFIG.SPIKE_TIME_WINDOW_MS;
    this.incidentThresholdDb = options?.incidentThresholdDb ?? AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD;
    this.cooldownMs = options?.cooldownMs ?? 1000; // 1-second cooldown between duplicate spike triggers
  }

  /**
   * Process a live decibel reading and detect transient spikes.
   * @param currentDb Current estimated sound pressure level in dB
   * @param monotonicTime Monotonic timestamp (defaults to performance.now())
   * @returns NoiseSpikeEvent if a valid transient spike occurred, otherwise null
   */
  public processSample(
    currentDb: number,
    monotonicTime: number = typeof performance !== 'undefined' ? performance.now() : Date.now()
  ): NoiseSpikeEvent | null {
    // 1. Validate sample integrity: reject NaN, Infinity, negative, or uninitialized zeroes
    if (!Number.isFinite(currentDb) || currentDb <= 0) {
      return null;
    }

    // 2. Initial sample establishes baseline comparison point
    if (this.lastValidDb === null || this.lastMonotonicTime === null) {
      this.lastValidDb = currentDb;
      this.lastMonotonicTime = monotonicTime;
      return null;
    }

    const elapsedMs = monotonicTime - this.lastMonotonicTime;

    // Guard against negative or zero elapsed time
    if (elapsedMs <= 0) {
      this.lastValidDb = currentDb;
      return null;
    }

    const deltaDb = Math.round((currentDb - this.lastValidDb) * 10) / 10;
    const isWithinTimeWindow = elapsedMs <= this.spikeTimeWindowMs;
    const isSpikeMagnitude = deltaDb >= this.spikeDeltaDb;
    const incidentThresholdExceeded = currentDb >= this.incidentThresholdDb;

    let event: NoiseSpikeEvent | null = null;

    // 3. Primary Spike Detection Condition
    if (isWithinTimeWindow && isSpikeMagnitude) {
      const timeSinceLastSpike = monotonicTime - this.lastSpikeTriggerTime;

      // Apply cooldown to prevent duplicate triggers from the same sustained sound burst
      if (timeSinceLastSpike >= this.cooldownMs) {
        this.lastSpikeTriggerTime = monotonicTime;

        let classification: SpikeClassification = 'spike_only';
        let message = `Sudden noise surge (+${deltaDb.toFixed(1)} dB in ${Math.round(elapsedMs)}ms)`;

        if (incidentThresholdExceeded) {
          classification = 'spike_and_incident';
          message = `Severe spike (+${deltaDb.toFixed(1)} dB) exceeding ${this.incidentThresholdDb} dB incident limit`;
        }

        event = {
          id: `spike_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          monotonicTime,
          previousDb: this.lastValidDb,
          currentDb,
          deltaDb,
          spikeThresholdUsed: this.spikeDeltaDb,
          incidentThresholdExceeded,
          classification,
          message,
        };
      }
    }

    // Advance baseline to current reading
    this.lastValidDb = currentDb;
    this.lastMonotonicTime = monotonicTime;

    return event;
  }

  /**
   * Reset the detector state (e.g. on measurement restart)
   */
  public reset(): void {
    this.lastValidDb = null;
    this.lastMonotonicTime = null;
    this.lastSpikeTriggerTime = 0;
  }
}

export const noiseSpikeDetector = new NoiseSpikeDetector();
