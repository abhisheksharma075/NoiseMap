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
      // Default to true (active music tap effect) unless user has explicitly toggled off
      this.soundEnabled = savedSound === null ? true : savedSound === 'true';

      const savedVoice = localStorage.getItem('noisemap_voice_feedback_enabled');
      this.voiceEnabled = savedVoice === 'true';
    } catch {
      this.soundEnabled = true;
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
   * Musical tactile tap (soft marimba/acoustic harmonic ping with subtle warm overtone)
   */
  public playTap(): void {
    if (!this.soundEnabled || this.isRecordingActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Fundamental tone (784 Hz - G5 acoustic bell)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.045);
      gain1.gain.setValueAtTime(0.045, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Sweet harmonic overtone (1174.66 Hz - D6)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now);
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.035);
      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now);
      osc2.stop(now + 0.04);
    } catch {
      // Gracefully continue without sound
    }
  }

  /**
   * Selection confirmation tick (musical ascending major second)
   */
  public playSelection(): void {
    if (!this.soundEnabled || this.isRecordingActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.04); // A5
      gain.gain.setValueAtTime(0.04, now);
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
