import { get } from 'svelte/store';
import { AudioEngine } from '../../domain/audio/audio-engine';
import type { SequenceNote } from '../../domain/audio/audio.types';
import { playbackStore } from '../stores/playback.store';
import { notationStore } from '../stores/notation.store';
import { settingsStore } from '../stores/settings.store';
import { pushToast, setStatus } from '../stores/ui.store';

export const audioEngine = new AudioEngine();
let playbackBindingsInitialized = false;
let suppressReadyResetOnSequenceEnd = false;
let pausedPlayback: { notes: SequenceNote[]; tempo: number } | null = null;

function createSequenceNotes(): SequenceNote[] {
  const { parsed } = get(notationStore);
  return parsed
    .filter((node) => node.type === 'svara')
    .map((node, index) => ({
      svara: node.svara,
      octave: node.octave,
      duration: node.duration,
      originalIndex: index
    }));
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
  const notes = createSequenceNotes();
  if (notes.length === 0) {
    setStatus({ tone: 'warning', text: 'Parse notation before playback' });
    pushToast('Please parse notation first', 'warning');
    return;
  }

  await ensureAudioReady();
  const { tempo } = get(settingsStore);

  pausedPlayback = null;
  audioEngine.playSequence(notes, tempo);
  playbackStore.set({
    status: 'playing',
    currentIndex: -1,
    sequenceLength: notes.length
  });
  setStatus({ tone: 'info', text: 'Playing' });
}

export function pausePlayback(): void {
  const state = get(playbackStore);
  if (state.status !== 'playing') {
    return;
  }

  const notes = createSequenceNotes();
  const resumeIndex = Math.max(state.currentIndex, 0);
  const remainingNotes = notes.slice(resumeIndex);

  if (remainingNotes.length === 0) {
    stopPlayback();
    return;
  }

  pausedPlayback = {
    notes: remainingNotes,
    tempo: get(settingsStore).tempo
  };

  suppressReadyResetOnSequenceEnd = true;
  audioEngine.stopAll();
  playbackStore.update((current) => ({
    ...current,
    status: 'paused',
    currentIndex: current.currentIndex,
    sequenceLength: notes.length
  }));
  setStatus({ tone: 'info', text: 'Paused' });
  pushToast('Playback paused', 'info');
}

export async function resumePlayback(): Promise<void> {
  if (!pausedPlayback || pausedPlayback.notes.length === 0) {
    await startPlayback();
    return;
  }

  await ensureAudioReady();
  const { notes, tempo } = pausedPlayback;
  pausedPlayback = null;

  audioEngine.playSequence(notes, tempo);
  playbackStore.update((state) => ({
    ...state,
    status: 'playing',
    sequenceLength: notes.length
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
