/**
 * Sound Feedback Utility using Web Audio API
 * Generates subtle, pleasant micro-interactions without remote audio files or dependencies.
 * 
 * CRITICAL RULE:
 * Absolutely suppressed while active microphone recording is occurring.
 * Tap sounds are optional, user-configurable, and default to enabled after user opt-in.
 */

class SoundFeedbackService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private voiceEnabled: boolean = false;
  private isRecordingActive: boolean = false;

  constructor() {
    try {
      const savedSound = localStorage.getItem('noisemap_tap_sounds_enabled');
      this.soundEnabled = savedSound === 'true';

      const savedVoice = localStorage.getItem('noisemap_voice_feedback_enabled');
      this.voiceEnabled = savedVoice === 'true';
    } catch {
      this.soundEnabled = false;
      this.voiceEnabled = false;
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('noisemap_tap_sounds_enabled', String(enabled));
    } catch {
      // ignore
    }
    if (enabled && !this.audioCtx) {
      this.initContext();
    }
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    try {
      localStorage.setItem('noisemap_voice_feedback_enabled', String(enabled));
    } catch {
      // ignore
    }
  }

  public setRecordingActive(active: boolean): void {
    this.isRecordingActive = active;
  }

  private initContext(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass && !this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Subtle soft click (very short, low amplitude 800Hz damped ping)
   */
  public playTap(): void {
    if (!this.soundEnabled || this.isRecordingActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const now = this.audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Gracefully continue without sound
    }
  }

  /**
   * Selection confirmation tick (two soft harmonic frequencies)
   */
  public playSelection(): void {
    if (!this.soundEnabled || this.isRecordingActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const now = this.audioCtx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Success chime (gentle ascending major third)
   */
  public playSuccess(): void {
    if (!this.soundEnabled || this.isRecordingActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      [523.25, 659.25].forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const t = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.13);
      });
    } catch {
      // Graceful degradation
    }
  }

  /**
   * Spoken status announcement (optional voice feedback for completion events)
   */
  public speakStatus(message: string): void {
    if (!this.voiceEnabled || this.isRecordingActive) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful degradation
    }
  }
}

export const soundFeedback = new SoundFeedbackService();
