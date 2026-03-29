import { writable } from 'svelte/store';
import { DEFAULT_TEMPO, DEFAULT_TUNING, DEFAULT_VOLUME, DEFAULT_WAVEFORM } from '../../domain/shared/constants';

export interface SettingsState {
  tempo: number;
  volume: number;
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  tuning: 'equal' | 'just';
  preset: string;
}

export const settingsStore = writable<SettingsState>({
  tempo: DEFAULT_TEMPO,
  volume: DEFAULT_VOLUME,
  waveform: DEFAULT_WAVEFORM,
  tuning: DEFAULT_TUNING,
  preset: 'veena'
});
