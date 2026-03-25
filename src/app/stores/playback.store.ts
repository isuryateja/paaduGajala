import { writable } from 'svelte/store';
import { DEFAULT_PLAYBACK_STATUS } from '../../domain/shared/constants';
import type { PlaybackStatus } from '../../domain/shared/types';

export interface PlaybackState {
  status: PlaybackStatus;
  currentIndex: number;
  sequenceLength: number;
}

export const playbackStore = writable<PlaybackState>({
  status: DEFAULT_PLAYBACK_STATUS,
  currentIndex: -1,
  sequenceLength: 0
});
