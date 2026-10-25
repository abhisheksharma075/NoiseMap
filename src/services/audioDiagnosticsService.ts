export type AudioDiagnosticCategory =
  | 'permission_denied'
  | 'device_unavailable'
  | 'device_in_use'
  | 'unsupported_api'
  | 'insecure_context'
  | 'audio_context_interrupted'
  | 'track_ended'
  | 'startup_aborted'
  | 'invalid_measurement'
  | 'unknown_failure';

export interface AudioDiagnosticInfo {
  category: AudioDiagnosticCategory;
  title: string;
  message: string;
  recoveryInstruction: string;
  recoverable: boolean;
  technicalDetails?: string;
}

export class AudioDiagnosticsService {
  /**
   * Analyze an error or abnormal audio capture state and return user-friendly diagnostic guidance.
   */
  public diagnoseError(error: unknown): AudioDiagnosticInfo {
    const err = error as { name?: string; message?: string } | null;
    const errorName = err?.name || '';
    const errorMessage = err?.message || '';

    // 1. Insecure Context (HTTP instead of HTTPS)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return {
        category: 'insecure_context',
        title: 'Insecure Connection (HTTPS Required)',
        message: 'Web Audio API and microphone sensors require a secure HTTPS connection or localhost.',
        recoveryInstruction: 'Ensure you are accessing NoiseMap over HTTPS (e.g., https://... or localhost).',
        recoverable: false,
        technicalDetails: 'window.isSecureContext is false; navigator.mediaDevices is restricted.',
      };
    }

    // 2. Unsupported Web Audio API or navigator.mediaDevices
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      return {
        category: 'unsupported_api',
        title: 'Microphone API Unavailable',
        message: 'Your browser environment does not support mediaDevices.getUserMedia.',
        recoveryInstruction: 'Please use a modern standards-compliant browser such as Chrome, Safari, Firefox, or Edge.',
        recoverable: false,
        technicalDetails: 'navigator.mediaDevices.getUserMedia is undefined.',
      };
    }

    // 3. Permission Denied
    if (
      errorName === 'NotAllowedError' ||
      errorName === 'PermissionDeniedError' ||
      /denied|permission/i.test(errorMessage)
    ) {
      return {
        category: 'permission_denied',
        title: 'Microphone Permission Blocked',
        message: 'Browser microphone access was denied or dismissed.',
        recoveryInstruction:
          'On iOS Safari: Tap "aA" or lock in address bar → Website Settings → Microphone → "Allow". On Chrome/Android: Tap tune icon next to URL → Permissions → Allow Microphone.',
        recoverable: true,
        technicalDetails: `${errorName}: ${errorMessage}`,
      };
    }

    // 4. Device Unavailable / Missing Hardware
    if (
      errorName === 'NotFoundError' ||
      errorName === 'DevicesNotFoundError' ||
      /no audio input|device not found/i.test(errorMessage)
    ) {
      return {
        category: 'device_unavailable',
        title: 'No Microphone Detected',
        message: 'NoiseMap could not detect an operational audio input device on your system.',
        recoveryInstruction: 'Connect a headset or ensure your built-in microphone is enabled in OS sound settings.',
        recoverable: true,
        technicalDetails: `${errorName}: ${errorMessage}`,
      };
    }

    // 5. Device In Use / Hardware Conflict
    if (
      errorName === 'NotReadableError' ||
      errorName === 'TrackStartError' ||
      /could not start|in use/i.test(errorMessage)
    ) {
      return {
        category: 'device_in_use',
        title: 'Microphone In Use by Another App',
        message: 'The audio hardware is currently locked by another application or video call.',
        recoveryInstruction: 'Close other tabs, Zoom, Teams, or voice recorders using the microphone and retry.',
        recoverable: true,
        technicalDetails: `${errorName}: ${errorMessage}`,
      };
    }

    // 6. Startup Aborted (Superseded session)
    if (errorName === 'AbortError') {
      return {
        category: 'startup_aborted',
        title: 'Measurement Cancelled',
        message: 'The audio startup request was replaced by a more recent interaction.',
        recoveryInstruction: 'Tap Start Measurement to initialize a fresh acoustic sample.',
        recoverable: true,
        technicalDetails: `${errorName}: ${errorMessage}`,
      };
    }

    // 7. Generic / Unknown Fallback
    return {
      category: 'unknown_failure',
      title: 'Audio Sensor Initialization Failure',
      message: errorMessage || 'An unexpected failure occurred while initializing the Web Audio hardware.',
      recoveryInstruction: 'Refresh the page or verify browser permissions to reinitialize audio capture.',
      recoverable: true,
      technicalDetails: `${errorName}: ${errorMessage}`,
    };
  }

  /**
   * Diagnostic for zero-audio or silent sample condition
   */
  public diagnoseSilentSample(): AudioDiagnosticInfo {
    return {
      category: 'invalid_measurement',
      title: 'Zero Acoustic Signal Detected',
      message: 'The microphone stream was active but received zero signal amplitude.',
      recoveryInstruction: 'Ensure your microphone is unmuted, speak closer to the device, and verify input volume in system settings.',
      recoverable: true,
      technicalDetails: 'RMS amplitude <= 0.00001 throughout sampling duration.',
    };
  }
}

export const audioDiagnosticsService = new AudioDiagnosticsService();
