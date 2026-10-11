/**
 * NoiseMap Noise Classification Standards
 * Shared configuration and classification logic across all components.
 * 
 * Prototype display bands:
 * LOW:      Valid reading < 50.0 dB
 * MODERATE: Valid reading >= 50.0 dB and < 70.0 dB
 * HIGH:     Valid reading >= 70.0 dB
 * 
 * DISCLAIMER:
 * These thresholds are configurable NoiseMap prototype display bands for demonstration.
 * They are not certified Type-1 acoustic assessments or official CPCB regulatory citations.
 */

export type NoiseBand = 'low' | 'moderate' | 'high';

export interface NoiseClassification {
  band: NoiseBand;
  label: string;
  shortLabel: string;
  colorName: 'forest' | 'olive' | 'terracotta';
  colorHex: string;
  textColorClass: string;
  description: string;
  avatarMood: 'calm' | 'moderate' | 'concerned';
}

export const NOISE_THRESHOLDS = {
  LOW_MAX: 50.0,      // < 50.0 dB is LOW
  MODERATE_MAX: 70.0, // >= 50.0 and < 70.0 dB is MODERATE; >= 70.0 dB is HIGH
} as const;

export function classifyNoiseLevel(decibels: number | null | undefined): NoiseClassification | null {
  if (decibels === null || decibels === undefined || isNaN(decibels) || decibels <= 0) {
    return null;
  }

  if (decibels < NOISE_THRESHOLDS.LOW_MAX) {
    return {
      band: 'low',
      label: 'Low Noise Reading',
      shortLabel: 'LOW (<50 dB)',
      colorName: 'forest',
      colorHex: '#354C3C',
      textColorClass: 'text-forest dark:text-lime-signal',
      description: 'NoiseMap demo classification: ambient sound is relatively quiet, below typical urban daytime limits.',
      avatarMood: 'calm',
    };
  }

  if (decibels < NOISE_THRESHOLDS.MODERATE_MAX) {
    return {
      band: 'moderate',
      label: 'Moderate Noise Reading',
      shortLabel: 'MODERATE (50-70 dB)',
      colorName: 'olive',
      colorHex: '#798263',
      textColorClass: 'text-olive dark:text-lime-signal',
      description: 'NoiseMap demo classification: typical urban daytime background levels such as active commerce or light traffic.',
      avatarMood: 'moderate',
    };
  }

  return {
    band: 'high',
    label: 'High Noise Reading',
    shortLabel: 'HIGH (≥70 dB)',
    colorName: 'terracotta',
    colorHex: '#C46E50',
    textColorClass: 'text-terracotta dark:text-[#E2886A]',
    description: 'NoiseMap demo classification: elevated sound levels commonly linked to industrial activity, machinery, or heavy honking.',
    avatarMood: 'concerned',
  };
}
