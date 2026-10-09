// Mathematical Evidence Confidence Scoring Model
// Blueprint Section 4 & Presentation Slide 4
// Weights: Reading Count (25%), Unique Contributors (25%), Duration (20%), Avg dB (15%), Peak dB (15%)

export interface ConfidenceBreakdown {
  totalScore: number;       // 0 to 100%
  readingCountScore: number; // 0 to 25
  usersScore: number;       // 0 to 25
  durationScore: number;    // 0 to 20
  avgDbScore: number;       // 0 to 15
  peakDbScore: number;      // 0 to 15
}

export class ScoreCalculator {
  /**
   * Computes mathematical confidence score based on the 5-factor civic evidence breakdown
   */
  public static calculateConfidence(
    readingCount: number,
    uniqueUsers: number,
    durationMin: number,
    avgDb: number,
    peakDb: number
  ): ConfidenceBreakdown {
    // 1. Reading Count (Weight: 25%) - Normalized up to 15 readings
    const normCount = Math.min(readingCount / 15, 1.0);
    const readingCountScore = Math.round(normCount * 25 * 10) / 10;

    // 2. Unique Contributors (Weight: 25%) - Normalized up to 5 independent session tokens
    const normUsers = Math.min(uniqueUsers / 5, 1.0);
    const usersScore = Math.round(normUsers * 25 * 10) / 10;

    // 3. Incident Duration (Weight: 20%) - Normalized up to 45 minutes of persistent noise
    const normDuration = Math.min(Math.max(durationMin, 1) / 45, 1.0);
    const durationScore = Math.round(normDuration * 20 * 10) / 10;

    // 4. Average Decibel Severity (Weight: 15%) - Evaluated relative to 55 dB baseline
    // 55 dB = 0%, 90 dB = 100%
    const normAvgDb = Math.min(Math.max((avgDb - 55) / 35, 0), 1.0);
    const avgDbScore = Math.round(normAvgDb * 15 * 10) / 10;

    // 5. Peak Impulse Factor (Weight: 15%) - Evaluated relative to acute 70 dB threshold
    // 70 dB = 0%, 105 dB = 100%
    const normPeakDb = Math.min(Math.max((peakDb - 70) / 35, 0), 1.0);
    const peakDbScore = Math.round(normPeakDb * 15 * 10) / 10;

    const total = Math.min(
      Math.max(
        readingCountScore + usersScore + durationScore + avgDbScore + peakDbScore,
        15
      ),
      100
    );

    return {
      totalScore: Math.round(total * 10) / 10,
      readingCountScore,
      usersScore,
      durationScore,
      avgDbScore,
      peakDbScore,
    };
  }
}
