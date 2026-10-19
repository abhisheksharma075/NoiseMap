// Web Audio API DSP Service
// On-device audio sampling, Fast Fourier Transform (FFT), and decibel SPL estimation.
// ZERO AUDIO STORAGE GUARANTEE: Raw PCM audio never leaves transient client RAM.

export interface AudioMetrics {
  instantDb: number;
  avgDb: number;
  peakDb: number;
}

export class AudioDspEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isRunning: boolean = false;
  private sampleReadings: number[] = [];
  private currentPeak: number = 0;
  private lastMetrics: AudioMetrics = { instantDb: 0, avgDb: 0, peakDb: 0 };

  // Calibrated reference offset for typical smartphone microphone input
  // Translates normalized Web Audio float values to estimated ambient dB SPL
  private readonly CALIBRATION_OFFSET = 98.0;

  private activeSessionToken: number = 0;

  public async start(): Promise<AnalyserNode> {
    if (this.isRunning) {
      throw new Error("Audio DSP engine is already active");
    }

    const sessionToken = ++this.activeSessionToken;
    let localAudioCtx: AudioContext | null = null;
    let localMediaStream: MediaStream | null = null;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported by your browser");
      }

      localAudioCtx = new AudioContextClass();

      // Immediately attempt to resume AudioContext within synchronous user gesture execution
      if (localAudioCtx.state === 'suspended') {
        await localAudioCtx.resume();
      }

      // Check if session became obsolete while awaiting resume
      if (this.activeSessionToken !== sessionToken) {
        localAudioCtx.close().catch(() => {});
        const abortErr = new Error("Audio startup was cancelled by a newer session");
        abortErr.name = "AbortError";
        throw abortErr;
      }

      // Request client microphone access with fallback for mobile browsers
      try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: false,
        });
      } catch (constraintErr) {
        console.warn("Advanced audio constraints rejected; falling back to default audio stream", constraintErr);
        localMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      // Check if session became obsolete while awaiting getUserMedia
      if (this.activeSessionToken !== sessionToken) {
        localMediaStream.getTracks().forEach((track) => track.stop());
        localAudioCtx.close().catch(() => {});
        const abortErr = new Error("Audio startup was cancelled by a newer session");
        abortErr.name = "AbortError";
        throw abortErr;
      }

      // Re-verify AudioContext state in case it suspended during permission prompt
      if (localAudioCtx.state === 'suspended') {
        await localAudioCtx.resume();
      }

      // Final token check before committing to instance fields
      if (this.activeSessionToken !== sessionToken) {
        localMediaStream.getTracks().forEach((track) => track.stop());
        localAudioCtx.close().catch(() => {});
        const abortErr = new Error("Audio startup was cancelled by a newer session");
        abortErr.name = "AbortError";
        throw abortErr;
      }

      const source = localAudioCtx.createMediaStreamSource(localMediaStream);
      const analyser = localAudioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;

      source.connect(analyser);

      // Commit local handles to engine state atomically
      this.audioCtx = localAudioCtx;
      this.mediaStream = localMediaStream;
      this.analyser = analyser;
      this.isRunning = true;
      this.sampleReadings = [];
      this.currentPeak = 0;
      this.lastMetrics = { instantDb: 0, avgDb: 0, peakDb: 0 };

      return this.analyser;
    } catch (err) {
      // Clean up local resources if startup fails or was superseded
      if (localMediaStream) {
        localMediaStream.getTracks().forEach((track) => track.stop());
      }
      if (localAudioCtx) {
        localAudioCtx.close().catch(() => {});
      }

      // If the error occurred on the active session, clear engine references
      if (this.activeSessionToken === sessionToken) {
        this.mediaStream = null;
        this.audioCtx = null;
        this.analyser = null;
        this.isRunning = false;
      }
      throw err;
    }
  }

  public getMetrics(): AudioMetrics {
    if (!this.analyser || !this.isRunning) {
      return this.lastMetrics;
    }

    const bufferLength = this.analyser.fftSize;
    const timeDomainData = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(timeDomainData);

    // Compute Root Mean Square (RMS) of acoustic waveform
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const val = timeDomainData[i];
      if (!Number.isNaN(val) && Number.isFinite(val)) {
        sumSquares += val * val;
      }
    }

    const rms = Math.sqrt(sumSquares / bufferLength);

    // Convert RMS to estimated decibel SPL with realistic dynamic limits
    let instantDb = 30.0;
    if (rms > 0.00001) {
      const rawDb = 20 * Math.log10(rms) + this.CALIBRATION_OFFSET;
      // Clamp between 30 dB (whisper/quiet room) and 120 dB (acute threshold)
      instantDb = Math.min(Math.max(rawDb, 30.0), 120.0);
    }

    // Accumulate metrics for energy-equivalent averaging and peak hold
    this.sampleReadings.push(instantDb);
    if (instantDb > this.currentPeak) {
      this.currentPeak = instantDb;
    }

    // Equivalent Continuous Sound Level (Leq) logarithmic energy integration:
    // Leq = 10 * log10( (1/N) * sum( 10^(Li / 10) ) )
    const energySum = this.sampleReadings.reduce(
      (acc, val) => acc + Math.pow(10, val / 10),
      0
    );
    const meanEnergy = energySum / this.sampleReadings.length;
    const leqDb = Math.min(Math.max(10 * Math.log10(meanEnergy), 30.0), 120.0);

    const calculated: AudioMetrics = {
      instantDb: Math.round(instantDb * 10) / 10,
      avgDb: Math.round(leqDb * 10) / 10,
      peakDb: Math.round(this.currentPeak * 10) / 10,
    };

    this.lastMetrics = calculated;
    return calculated;
  }

  public stop(): AudioMetrics {
    // Invalidate any in-flight startup sessions
    this.activeSessionToken++;

    // Capture metrics while analyser is still connected
    let finalMetrics = this.lastMetrics;
    if (this.analyser && this.isRunning) {
      finalMetrics = this.getMetrics();
    }

    // If no samples were accumulated during polling, ensure we do at least one calculation
    if (finalMetrics.avgDb === 0 && this.sampleReadings.length > 0) {
      const energySum = this.sampleReadings.reduce(
        (acc, val) => acc + Math.pow(10, val / 10),
        0
      );
      const meanEnergy = energySum / this.sampleReadings.length;
      const leqDb = Math.min(Math.max(10 * Math.log10(meanEnergy), 30.0), 120.0);
      finalMetrics = {
        instantDb: Math.round(this.sampleReadings[this.sampleReadings.length - 1] * 10) / 10,
        avgDb: Math.round(leqDb * 10) / 10,
        peakDb: Math.round(this.currentPeak * 10) / 10,
      };
      this.lastMetrics = finalMetrics;
    }

    // Immediately sever hardware stream and discard audio in RAM
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.analyser = null;
    this.isRunning = false;

    return finalMetrics;
  }

  public getFinalMetrics(): AudioMetrics {
    return this.lastMetrics;
  }

  public reset(): void {
    // Invalidate any in-flight startup sessions
    this.activeSessionToken++;
    this.sampleReadings = [];
    this.currentPeak = 0;
    this.lastMetrics = { instantDb: 0, avgDb: 0, peakDb: 0 };
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioDspEngine = new AudioDspEngine();
