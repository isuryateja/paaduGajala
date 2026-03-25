import { get } from 'svelte/store';
import { AudioEngine } from '../../domain/audio/audio-engine';
import { playbackStore } from '../stores/playback.store';
import { notationStore } from '../stores/notation.store';
import { settingsStore } from '../stores/settings.store';
import { pushToast, setStatus } from '../stores/ui.store';

export const audioEngine = new AudioEngine();
let playbackBindingsInitialized = false;

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
  const { parsed } = get(notationStore);
  if (parsed.length === 0) {
    setStatus({ tone: 'warning', text: 'Parse notation before playback' });
    pushToast('Please parse notation first', 'warning');
    return;
  }

  await ensureAudioReady();
  const { tempo } = get(settingsStore);
  const notes = parsed
    .filter((node) => node.type === 'svara')
    .map((node, index) => ({
      svara: node.svara,
      octave: node.octave,
      duration: node.duration,
      originalIndex: index
    }));

  audioEngine.playSequence(notes, tempo);
  playbackStore.set({
    status: 'playing',
    currentIndex: -1,
    sequenceLength: notes.length
  });
  setStatus({ tone: 'info', text: 'Playing' });
}

export function pausePlayback(): void {
  audioEngine.stopSequence();
  playbackStore.update((state) => ({ ...state, status: 'paused' }));
  setStatus({ tone: 'info', text: 'Paused' });
  pushToast('Playback paused', 'info');
}

export function stopPlayback(): void {
  audioEngine.stopAll();
  playbackStore.update((state) => ({ ...state, status: 'ready', currentIndex: -1, sequenceLength: 0 }));
  setStatus({ tone: 'ready', text: 'Ready' });
}
