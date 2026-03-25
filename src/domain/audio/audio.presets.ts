import type { AudioEngineConfig } from './audio.types';

type AudioPreset = Partial<AudioEngineConfig>;

export const AudioEnginePresets: Record<string, AudioPreset> = {
  flute: {
    waveform: 'sine',
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.8
  },
  veena: {
    waveform: 'triangle',
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.75, release: 0.15 },
    masterVolume: 0.75
  },
  violin: {
    waveform: 'sawtooth',
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 },
    masterVolume: 0.6
  },
  harmonium: {
    waveform: 'square',
    envelope: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.2 },
    masterVolume: 0.5
  }
};
