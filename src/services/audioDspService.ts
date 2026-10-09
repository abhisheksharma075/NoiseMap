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

  // Calibrated reference offset for typical smartphone microphone input
  // Translates normalized Web Audio float values to estimated ambient dB SPL
  private readonly CALIBRATION_OFFSET = 98.0;

  public async start(): Promise<AnalyserNode> {
    if (this.isRunning) {
      throw new Error("Audio DSP engine is already active");
    }

    // Request client microphone access
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.75;

    source.connect(this.analyser);

    this.isRunning = true;
    this.sampleReadings = [];
    this.currentPeak = 0;

    return this.analyser;
  }

  public getMetrics(): AudioMetrics {
    if (!this.analyser || !this.isRunning) {
      return { instantDb: 0, avgDb: 0, peakDb: 0 };
    }

    const bufferLength = this.analyser.fftSize;
    const timeDomainData = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(timeDomainData);

    // Compute Root Mean Square (RMS) of acoustic waveform
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const val = timeDomainData[i];
      sumSquares += val * val;
    }

    const rms = Math.sqrt(sumSquares / bufferLength);

    // Convert RMS to estimated decibel SPL with realistic dynamic limits
    let instantDb = 30.0;
    if (rms > 0.00001) {
      const rawDb = 20 * Math.log10(rms) + this.CALIBRATION_OFFSET;
      // Clamp between 30 dB (whisper/quiet room) and 120 dB (acute threshold)
      instantDb = Math.min(Math.max(rawDb, 30.0), 120.0);
    }

    // Accumulate metrics for averaging and peak hold
    this.sampleReadings.push(instantDb);
    if (instantDb > this.currentPeak) {
      this.currentPeak = instantDb;
    }

    const sum = this.sampleReadings.reduce((acc, val) => acc + val, 0);
    const avgDb = sum / this.sampleReadings.length;

    return {
      instantDb: Math.round(instantDb * 10) / 10,
      avgDb: Math.round(avgDb * 10) / 10,
      peakDb: Math.round(this.currentPeak * 10) / 10,
    };
  }

  public stop(): AudioMetrics {
    const finalMetrics = this.getMetrics();

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

  public isActive(): boolean {
    return this.isRunning;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const audioDspEngine = new AudioDspEngine();
