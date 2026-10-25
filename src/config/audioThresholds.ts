export const AUDIO_CONFIG = {
  DECIBEL_INCIDENT_THRESHOLD: 68, // dB threshold for incident tagging
  SCORE_NORM_FACTOR: 15,          // Normalization scale factor for scoring
  CALIBRATION_OFFSET_DEFAULT: 98.0, // SPL microphone calibration offset
  SPIKE_DELTA_DB: 15,             // Sudden increase in dB to flag a spike
  SPIKE_TIME_WINDOW_MS: 300,      // Max time window for spike delta detection
  ACTIVE_NOISE_WINDOW_MINUTES: 15, // Maximum age in minutes for a measurement to qualify as active noise
  MAP_REFRESH_INTERVAL_MS: 30000,   // Real-time map freshness re-evaluation cadence (30 seconds)
  WHO_EXPOSURE_LIMITS: [          // NIOSH/WHO safe exposure limits (in seconds)
    { maxDb: 80, safeSeconds: Infinity },
    { maxDb: 85, safeSeconds: 28800 }, // 8 hours
    { maxDb: 88, safeSeconds: 14400 }, // 4 hours
    { maxDb: 91, safeSeconds: 7200 },  // 2 hours
    { maxDb: 95, safeSeconds: 2880 },  // 48 minutes
    { maxDb: 100, safeSeconds: 900 },  // 15 minutes
    { maxDb: 105, safeSeconds: 300 },  // 5 minutes
    { maxDb: Infinity, safeSeconds: 30 } // Critical limit
  ]
} as const;

export type AudioConfig = typeof AUDIO_CONFIG;
