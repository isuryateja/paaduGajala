import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { notationStore } from '../../app/stores/notation.store';
import { playbackStore } from '../../app/stores/playback.store';
import { settingsStore } from '../../app/stores/settings.store';
import { uiStore } from '../../app/stores/ui.store';
import { audioEngine, pausePlayback, resumePlayback, startPlayback, stopPlayback } from '../../app/actions/playback.actions';

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
      preset: 'veena',
      reverbMix: 0,
      reverbPreset: 'room'
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

  it('preserves phrase separators when starting playback', async () => {
    notationStore.set({
      source: 'manual',
      rawText: 'S R1 || G1',
      parsed: [
        { type: 'svara', svara: 'S', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 0 },
        { type: 'svara', svara: 'R1', octave: 'madhya', duration: 1, beatMarker: '||', line: 1, position: 2 },
        { type: 'rhythm_marker', marker: '||', subtype: 'double', boundaryKind: 'phrase', line: 1, position: 5 },
        { type: 'svara', svara: 'G1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 8 }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

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

    await startPlayback();

    expect(initSpy).toHaveBeenCalled();
    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ type: 'svara', svara: 'S', originalIndex: 0 }),
        expect.objectContaining({ type: 'svara', svara: 'R1', originalIndex: 1 }),
        expect.objectContaining({ type: 'boundary', boundaryKind: 'phrase', marker: '||' }),
        expect.objectContaining({ type: 'svara', svara: 'G1', originalIndex: 2 })
      ],
      120
    );
    expect(get(playbackStore)).toMatchObject({ status: 'playing', sequenceLength: 3 });
  });

  it('resolves sustain markers into note duration and silence when starting playback', async () => {
    notationStore.set({
      source: 'manual',
      rawText: 'S _ _ | _ G1 || _',
      parsed: [
        { type: 'svara', svara: 'S', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 0 },
        { type: 'sustain_unit', units: 1, line: 1, position: 2 },
        { type: 'sustain_unit', units: 1, line: 1, position: 4 },
        { type: 'rhythm_marker', marker: '|', subtype: 'single', boundaryKind: 'beat', line: 1, position: 6 },
        { type: 'sustain_unit', units: 1, line: 1, position: 8 },
        { type: 'svara', svara: 'G1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 10 },
        { type: 'rhythm_marker', marker: '||', subtype: 'double', boundaryKind: 'phrase', line: 1, position: 13 },
        { type: 'sustain_unit', units: 1, line: 1, position: 16 }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    const playSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });

    await startPlayback();

    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ type: 'svara', svara: 'S', duration: 3, originalIndex: 0 }),
        expect.objectContaining({ type: 'boundary', boundaryKind: 'beat', marker: '|' }),
        expect.objectContaining({ type: 'silence', duration: 1 }),
        expect.objectContaining({ type: 'svara', svara: 'G1', duration: 1, originalIndex: 1 }),
        expect.objectContaining({ type: 'boundary', boundaryKind: 'phrase', marker: '||' }),
        expect.objectContaining({ type: 'silence', duration: 1 })
      ],
      120
    );
    expect(get(playbackStore)).toMatchObject({ status: 'playing', sequenceLength: 2 });
  });

  it('resolves beat rests into one-beat silence items when starting playback', async () => {
    notationStore.set({
      source: 'manual',
      rawText: 'S , , R1 || , G1',
      parsed: [
        { type: 'svara', svara: 'S', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 0 },
        { type: 'beat_rest', beats: 1, line: 1, position: 2 },
        { type: 'beat_rest', beats: 1, line: 1, position: 4 },
        { type: 'svara', svara: 'R1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 6 },
        { type: 'rhythm_marker', marker: '||', subtype: 'double', boundaryKind: 'phrase', line: 1, position: 9 },
        { type: 'beat_rest', beats: 1, line: 1, position: 12 },
        { type: 'svara', svara: 'G1', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 14 }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    const playSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });

    await startPlayback();

    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ type: 'svara', svara: 'S', originalIndex: 0 }),
        expect.objectContaining({ type: 'silence', duration: 2 }),
        expect.objectContaining({ type: 'svara', svara: 'R1', originalIndex: 1 }),
        expect.objectContaining({ type: 'boundary', boundaryKind: 'phrase', marker: '||' }),
        expect.objectContaining({ type: 'silence', duration: 1 }),
        expect.objectContaining({ type: 'svara', svara: 'G1', originalIndex: 2 })
      ],
      120
    );
    expect(get(playbackStore)).toMatchObject({ status: 'playing', sequenceLength: 3 });
  });

  it('expands Vega groups into fractional playback notes when starting playback', async () => {
    notationStore.set({
      source: 'manual',
      rawText: 'S [R2 G2] _ P',
      parsed: [
        { type: 'svara', svara: 'S', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 0 },
        {
          type: 'vega_group',
          tokens: [
            { type: 'svara', svara: 'R2', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 3 },
            { type: 'svara', svara: 'G2', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 6 }
          ],
          notes: [
            { type: 'svara', svara: 'R2', octave: 'madhya', duration: 0.5, beatMarker: null, line: 1, position: 3 },
            { type: 'svara', svara: 'G2', octave: 'madhya', duration: 0.5, beatMarker: null, line: 1, position: 6 }
          ],
          subdivisions: 2,
          totalDuration: 1,
          line: 1,
          position: 2,
          endPosition: 8
        },
        { type: 'sustain_unit', units: 1, line: 1, position: 10 },
        { type: 'svara', svara: 'P', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 12 }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    const playSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });

    await startPlayback();

    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ type: 'svara', svara: 'S', duration: 1, originalIndex: 0 }),
        expect.objectContaining({ type: 'svara', svara: 'R2', duration: 0.5, originalIndex: 1 }),
        expect.objectContaining({ type: 'svara', svara: 'G2', duration: 0.5, originalIndex: 2 }),
        expect.objectContaining({ type: 'silence', duration: 1 }),
        expect.objectContaining({ type: 'svara', svara: 'P', duration: 1, originalIndex: 3 })
      ],
      120
    );
    expect(get(playbackStore)).toMatchObject({ status: 'playing', sequenceLength: 4 });
  });

  it('uses resolved grouped sustain durations when starting playback', async () => {
    notationStore.set({
      source: 'manual',
      rawText: '[R2 _ G2 _]',
      parsed: [
        {
          type: 'vega_group',
          tokens: [
            { type: 'svara', svara: 'R2', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 1 },
            { type: 'sustain_unit', units: 1, line: 1, position: 4 },
            { type: 'svara', svara: 'G2', octave: 'madhya', duration: 1, beatMarker: null, line: 1, position: 6 },
            { type: 'sustain_unit', units: 1, line: 1, position: 9 }
          ],
          notes: [
            { type: 'svara', svara: 'R2', octave: 'madhya', duration: 0.5, beatMarker: null, line: 1, position: 1 },
            { type: 'svara', svara: 'G2', octave: 'madhya', duration: 0.5, beatMarker: null, line: 1, position: 6 }
          ],
          subdivisions: 4,
          totalDuration: 1,
          line: 1,
          position: 0,
          endPosition: 10
        }
      ],
      validation: { valid: true, issues: [] },
      stats: null
    });

    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    const playSequenceSpy = vi.spyOn(audioEngine, 'playSequence').mockReturnValue({
      notes: [],
      tempo: 120,
      loop: false,
      loopCount: 1,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {}
    });

    await startPlayback();

    expect(playSequenceSpy).toHaveBeenCalledWith(
      [
        expect.objectContaining({ type: 'svara', svara: 'R2', duration: 0.5, originalIndex: 0 }),
        expect.objectContaining({ type: 'svara', svara: 'G2', duration: 0.5, originalIndex: 1 })
      ],
      120
    );
    expect(get(playbackStore)).toMatchObject({ status: 'playing', sequenceLength: 2 });
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
