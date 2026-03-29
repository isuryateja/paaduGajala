import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { notationStore } from '../../app/stores/notation.store';
import { playbackStore } from '../../app/stores/playback.store';
import { settingsStore } from '../../app/stores/settings.store';
import { uiStore } from '../../app/stores/ui.store';
import { audioEngine, pausePlayback, resumePlayback, stopPlayback } from '../../app/actions/playback.actions';

describe('playback actions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    notationStore.set({
      source: 'manual',
      rawText: 'S R1 G1 ||',
      parsed: [
        { type: 'svara', svara: 'S', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 0 },
        { type: 'svara', svara: 'R1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 1 },
        { type: 'svara', svara: 'G1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 2 }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

    playbackStore.set({
      status: 'ready',
      currentIndex: -1,
      sequenceLength: 0
    });

    settingsStore.set({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena'
    });

    uiStore.set({
      loading: false,
      status: { tone: 'ready', text: 'Ready' },
      toasts: []
    });

    audioEngine.currentSequence = null;
    audioEngine.sequenceTimeout = null;
    audioEngine.activeVoices.clear();
  });

  it('keeps playback paused instead of resetting back to ready', () => {
    audioEngine.currentSequence = {
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 1,
      isPlaying: true,
      cancel: () => {}
    };

    playbackStore.set({
      status: 'playing',
      currentIndex: 1,
      sequenceLength: 3
    });

    pausePlayback();

    expect(get(playbackStore)).toMatchObject({
      status: 'paused',
      currentIndex: 1,
      sequenceLength: 3
    });
    expect(get(uiStore).status.text).toBe('Paused');
  });

  it('resumes playback from the paused note list', async () => {
    const initSpy = vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    const playSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });

    audioEngine.currentSequence = {
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 1,
      isPlaying: true,
      cancel: () => {}
    };

    playbackStore.set({
      status: 'playing',
      currentIndex: 1,
      sequenceLength: 3
    });

    pausePlayback();
    await resumePlayback();

    expect(initSpy).toHaveBeenCalled();
    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ svara: 'R1', originalIndex: 1 }),
        expect.objectContaining({ svara: 'G1', originalIndex: 2 })
      ],
      120
    );
    expect(get(playbackStore).status).toBe('playing');
    expect(get(uiStore).status.text).toBe('Playing');
  });

  it('clears paused playback state when stopped', async () => {
    const startSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });
    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);

    audioEngine.currentSequence = {
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 1,
      isPlaying: true,
      cancel: () => {}
    };

    playbackStore.set({
      status: 'playing',
      currentIndex: 1,
      sequenceLength: 3
    });

    pausePlayback();
    stopPlayback();
    await resumePlayback();

    expect(startSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ svara: 'S', originalIndex: 0 }),
        expect.objectContaining({ svara: 'R1', originalIndex: 1 }),
        expect.objectContaining({ svara: 'G1', originalIndex: 2 })
      ],
      120
    );
  });
});
