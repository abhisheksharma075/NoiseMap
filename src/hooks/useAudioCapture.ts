import { useState, useEffect, useRef, useCallback } from 'react';
import { audioDspEngine, AudioMetrics } from '../services/audioDspService';
import { locationService, QuantizedLocation } from '../services/locationService';

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
  const [location, setLocation] = useState<QuantizedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const countdownIntervalRef = useRef<number | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);

  const stopSampling = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }

    const finalMetrics = audioDspEngine.stop();
    setMetrics(finalMetrics);
    setIsSampling(false);
    setIsComplete(true);
    setAnalyserNode(null);
  }, []);

  const startSampling = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      setIsComplete(false);
      setCountdown(10);

      // Attempt to retrieve and quantize geolocation in parallel
      try {
        const pos = await locationService.getQuantizedPosition();
        setLocation(pos);
      } catch (locErr) {
        console.warn("GPS location unavailable or denied. Using default 100m grid cell.", locErr);
        // Fallback default grid
        const fallback = locationService.quantizeCoordinates(26.144, 91.736);
        setLocation({
          lat: fallback.lat,
          lng: fallback.lng,
          grid_id: fallback.grid_id,
          accuracyMeters: 100,
          isApproximate: true,
        });
      }

      // Initialize Web Audio API hardware analyser
      const analyser = await audioDspEngine.start();
      setAnalyserNode(analyser);
      setIsSampling(true);

      // Poll real-time decibel metrics at 20fps for smooth needle animation
      metricsIntervalRef.current = window.setInterval(() => {
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
      const errObj = err as { name?: string; message?: string };
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
    stopSampling();
    setIsComplete(false);
    setCountdown(10);
    setMetrics({ instantDb: 0, avgDb: 0, peakDb: 0 });
    setError(null);
  }, [stopSampling]);

  useEffect(() => {
    return () => {
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
