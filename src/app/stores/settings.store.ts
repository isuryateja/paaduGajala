import { writable } from 'svelte/store';
import type { ReverbPreset } from '../../domain/audio/audio.types';
import {
  DEFAULT_REVERB_MIX,
  DEFAULT_REVERB_PRESET,
  DEFAULT_TEMPO,
  DEFAULT_TUNING,
  DEFAULT_VOLUME,
  DEFAULT_WAVEFORM
} from '../../domain/shared/constants';

export interface SettingsState {
  tempo: number;
  volume: number;
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  tuning: 'equal' | 'just';
  preset: string;
  /** Wet reverb send (0..1). Ship default 0.25 (P2B-03). */
  reverbMix: number;
  /** Shared convolver IR character. */
  reverbPreset: ReverbPreset;
}

export const settingsStore = writable<SettingsState>({
  tempo: DEFAULT_TEMPO,
  volume: DEFAULT_VOLUME,
  waveform: DEFAULT_WAVEFORM,
  tuning: DEFAULT_TUNING,
  preset: 'veena',
  reverbMix: DEFAULT_REVERB_MIX,
  reverbPreset: DEFAULT_REVERB_PRESET
});
