import { useState, useEffect, useRef, useCallback } from 'react';
import { audioDspEngine, AudioMetrics } from '../services/audioDspService';
import { locationService, QuantizedLocation } from '../services/locationService';
import { soundFeedback } from '../services/soundFeedbackService';

export interface UseAudioCaptureReturn {
  isSampling: boolean;
  isComplete: boolean;
  countdown: number;
  instantDb: number;
  avgDb: number;
  peakDb: number;
  analyserNode: AnalyserNode | null;
  location: QuantizedLocation | null;
  error: string | null;
  permissionDenied: boolean;
  startSampling: () => Promise<void>;
  stopSampling: () => void;
  reset: () => void;
}

export const useAudioCapture = (): UseAudioCaptureReturn => {
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [metrics, setMetrics] = useState<AudioMetrics>({ instantDb: 0, avgDb: 0, peakDb: 0 });
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [location, setLocation] = useState<QuantizedLocation | null>(() =>
    locationService.getLastKnownLocation()
  );
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const countdownIntervalRef = useRef<number | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const isSamplingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const startupGenerationRef = useRef<number>(0);

  const stopSampling = useCallback(() => {
    startupGenerationRef.current++;
    isStartingRef.current = false;

    // Immediately inform soundFeedback that mic recording has finished
    soundFeedback.setRecordingActive(false);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }

    if (!isSamplingRef.current && !audioDspEngine.isActive()) {
      setIsSampling(false);
      return;
    }

    isSamplingRef.current = false;
    const finalMetrics = audioDspEngine.stop();

    setMetrics((prev) => {
      // Ensure we do not overwrite valid accumulated metrics with zeroes
      if (finalMetrics.avgDb > 0) {
        return finalMetrics;
      }
      if (prev.avgDb > 0) {
        return prev;
      }
      return finalMetrics;
    });

    setIsSampling(false);
    setIsComplete(true);
    setAnalyserNode(null);
  }, []);

  const startSampling = useCallback(async () => {
    // Guard against concurrent invocations or rapid double-taps
    if (isStartingRef.current || isSamplingRef.current || audioDspEngine.isActive()) {
      return;
    }

    const currentGeneration = ++startupGenerationRef.current;
    isStartingRef.current = true;

    try {
      // CRITICAL: Suppress all tap sounds and voice feedback before mic activation
      soundFeedback.setRecordingActive(true);

      setError(null);
      setPermissionDenied(false);
      setIsComplete(false);
      setCountdown(10);
      setMetrics({ instantDb: 0, avgDb: 0, peakDb: 0 });
      audioDspEngine.reset();

      // Start geolocation concurrently WITHOUT awaiting to protect user gesture on iOS Safari
      locationService
        .getQuantizedPosition()
        .then((pos) => {
          if (startupGenerationRef.current === currentGeneration) {
            setLocation(pos);
          }
        })
        .catch((locErr) => {
          console.warn("GPS location unavailable or denied. Using default 100m grid cell.", locErr);
          if (startupGenerationRef.current === currentGeneration) {
            const fallback = locationService.quantizeCoordinates(26.144, 91.736);
            setLocation({
              lat: fallback.lat,
              lng: fallback.lng,
              grid_id: fallback.grid_id,
              accuracyMeters: 100,
              isApproximate: true,
            });
          }
        });

      // Directly initialize Web Audio hardware on user gesture call path
      const analyser = await audioDspEngine.start();

      // Check if sampling was cancelled/aborted while audio was starting
      if (startupGenerationRef.current !== currentGeneration) {
        return;
      }

      isStartingRef.current = false;
      isSamplingRef.current = true;
      setAnalyserNode(analyser);
      setIsSampling(true);

      // Immediately take a first sample reading
      const initialMetrics = audioDspEngine.getMetrics();
      if (initialMetrics.avgDb > 0) {
        setMetrics(initialMetrics);
      }

      // Poll real-time decibel metrics at 20fps for smooth needle animation
      metricsIntervalRef.current = window.setInterval(() => {
        if (!isSamplingRef.current) return;
        const current = audioDspEngine.getMetrics();
        setMetrics(current);
      }, 50);

      // 10-second countdown timer
      let remaining = 10;
      countdownIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          stopSampling();
        }
      }, 1000);

    } catch (err: unknown) {
      // If this error is from an obsolete / superseded startup, ignore it completely
      if (startupGenerationRef.current !== currentGeneration) {
        return;
      }

      isStartingRef.current = false;
      isSamplingRef.current = false;
      soundFeedback.setRecordingActive(false);
      if (audioDspEngine.isActive()) {
        audioDspEngine.stop();
      }

      const errObj = err as { name?: string; message?: string };
      if (errObj.name === 'AbortError') {
        // Cleanly superseded or cancelled
        return;
      }
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError("Microphone permission was denied. Please allow microphone access in your browser settings to sample noise.");
      } else {
        setError(errObj.message || "Failed to initialize Web Audio sensor.");
      }
      setIsSampling(false);
    }
  }, [stopSampling]);

  const reset = useCallback(() => {
    startupGenerationRef.current++;
    isStartingRef.current = false;
    soundFeedback.setRecordingActive(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    isSamplingRef.current = false;
    if (audioDspEngine.isActive()) {
      audioDspEngine.stop();
    }
    audioDspEngine.reset();
    setIsSampling(false);
    setIsComplete(false);
    setCountdown(10);
    setMetrics({ instantDb: 0, avgDb: 0, peakDb: 0 });
    setAnalyserNode(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      startupGenerationRef.current++;
      isStartingRef.current = false;
      isSamplingRef.current = false;
      if (audioDspEngine.isActive()) {
        audioDspEngine.stop();
      }
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, []);

  return {
    isSampling,
    isComplete,
    countdown,
    instantDb: metrics.instantDb,
    avgDb: metrics.avgDb,
    peakDb: metrics.peakDb,
    analyserNode,
    location,
    error,
    permissionDenied,
    startSampling,
    stopSampling,
    reset,
  };
};
