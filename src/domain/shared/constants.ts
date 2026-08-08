import type { PlaybackStatus, StatusState } from './types';

export const DEFAULT_TEMPO = 120;
export const MIN_TEMPO = 30;
export const MAX_TEMPO = 300;
export const DEFAULT_VOLUME = 0.7;
export const DEFAULT_WAVEFORM = 'triangle' as const;
export const DEFAULT_TUNING = 'equal' as const;
/** Ship default wet reverb send (P2B-03). Mix 0 remains available for dry-identical. */
export const DEFAULT_REVERB_MIX = 0.25;
export const DEFAULT_REVERB_PRESET = 'room' as const;
export const DEFAULT_PLAYBACK_STATUS: PlaybackStatus = 'ready';
export const DEFAULT_STATUS_STATE: StatusState = {
  tone: 'ready',
  text: 'Ready'
};
export const SESSION_STORAGE_KEYS = {
  settings: 'paadugajala-settings'
} as const;
