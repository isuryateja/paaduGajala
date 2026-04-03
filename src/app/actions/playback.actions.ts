import { get } from 'svelte/store';
import { AudioEngine } from '../../domain/audio/audio-engine';
import type { SequenceItem } from '../../domain/audio/audio.types';
import { buildTimedNotationSequence } from '../../domain/notation/notation.sequence';
import { playbackStore } from '../stores/playback.store';
import { notationStore } from '../stores/notation.store';
import { settingsStore } from '../stores/settings.store';
import { pushToast, setStatus } from '../stores/ui.store';

export const audioEngine = new AudioEngine();
let playbackBindingsInitialized = false;
let suppressReadyResetOnSequenceEnd = false;
let pausedPlayback: { items: SequenceItem[]; tempo: number; sequenceLength: number } | null = null;

function createPlaybackSequence(): { items: SequenceItem[]; sequenceLength: number } {
  const { parsed } = get(notationStore);
  const { items, sequenceLength } = buildTimedNotationSequence(parsed);
  return { items, sequenceLength };
}

function findResumeItemIndex(items: SequenceItem[], resumeIndex: number): number {
  return items.findIndex((item) => item.type === 'svara' && (item.originalIndex ?? -1) >= resumeIndex);
}

function initializePlaybackBindings(): void {
  if (playbackBindingsInitialized) {
    return;
  }

  playbackBindingsInitialized = true;

  audioEngine.on('noteIndex', (event) => {
    const data = event as { index?: number };
    playbackStore.update((state) => ({
      ...state,
      currentIndex: typeof data.index === 'number' ? data.index : state.currentIndex
    }));
  });

  audioEngine.on('sequenceEnd', () => {
    if (suppressReadyResetOnSequenceEnd) {
      suppressReadyResetOnSequenceEnd = false;
      return;
    }

    pausedPlayback = null;
    playbackStore.update((state) => ({
      ...state,
      status: 'ready',
      currentIndex: -1,
      sequenceLength: 0
    }));
    setStatus({ tone: 'ready', text: 'Ready' });
  });
}

initializePlaybackBindings();

export async function ensureAudioReady(): Promise<void> {
  await audioEngine.init();
}

export async function startPlayback(): Promise<void> {
  const { items, sequenceLength } = createPlaybackSequence();
  if (sequenceLength === 0) {
    setStatus({ tone: 'warning', text: 'Parse notation before playback' });
    pushToast('Please parse notation first', 'warning');
    return;
  }

  await ensureAudioReady();
  const { tempo } = get(settingsStore);

  pausedPlayback = null;
  audioEngine.playSequence(items, tempo);
  playbackStore.set({
    status: 'playing',
    currentIndex: -1,
    sequenceLength
  });
  setStatus({ tone: 'info', text: 'Playing' });
}

export function pausePlayback(): void {
  const state = get(playbackStore);
  if (state.status !== 'playing') {
    return;
  }

  const { items, sequenceLength } = createPlaybackSequence();
  const resumeIndex = Math.max(state.currentIndex, 0);
  const resumeItemIndex = findResumeItemIndex(items, resumeIndex);
  const remainingItems = resumeItemIndex >= 0 ? items.slice(resumeItemIndex) : [];

  if (remainingItems.length === 0) {
    stopPlayback();
    return;
  }

  pausedPlayback = {
    items: remainingItems,
    tempo: get(settingsStore).tempo,
    sequenceLength
  };

  suppressReadyResetOnSequenceEnd = true;
  audioEngine.stopAll();
  playbackStore.update((current) => ({
    ...current,
    status: 'paused',
    currentIndex: current.currentIndex,
    sequenceLength
  }));
  setStatus({ tone: 'info', text: 'Paused' });
  pushToast('Playback paused', 'info');
}

export async function resumePlayback(): Promise<void> {
  if (!pausedPlayback || pausedPlayback.items.length === 0) {
    await startPlayback();
    return;
  }

  await ensureAudioReady();
  const { items, tempo, sequenceLength } = pausedPlayback;
  pausedPlayback = null;

  audioEngine.playSequence(items, tempo);
  playbackStore.update((state) => ({
    ...state,
    status: 'playing',
    sequenceLength
  }));
  setStatus({ tone: 'info', text: 'Playing' });
}

export function stopPlayback(): void {
  pausedPlayback = null;
  suppressReadyResetOnSequenceEnd = false;
  audioEngine.stopAll();
  playbackStore.update((state) => ({ ...state, status: 'ready', currentIndex: -1, sequenceLength: 0 }));
  setStatus({ tone: 'ready', text: 'Ready' });
}
