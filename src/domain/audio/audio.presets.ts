import type { AudioEngineConfig, VoiceType } from './audio.types';

/**
 * Preset fragment applied to AudioEngine.
 * Instrument presets carry `voiceType` for additive banks (P1B-05).
 * Waveform / envelope remain as pure-path fallbacks (and for P1B-06 pure force).
 */
export type AudioPreset = Partial<AudioEngineConfig> & {
  voiceType?: VoiceType;
};

export const AudioEnginePresets: Record<string, AudioPreset> = {
  flute: {
    waveform: 'sine',
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.8,
    voiceType: 'flute'
  },
  veena: {
    waveform: 'triangle',
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.75, release: 0.15 },
    masterVolume: 0.75,
    voiceType: 'plucked'
  },
  violin: {
    waveform: 'sawtooth',
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 },
    masterVolume: 0.6,
    voiceType: 'bow'
  },
  harmonium: {
    waveform: 'square',
    envelope: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.5,
    voiceType: 'reed'
  }
};
