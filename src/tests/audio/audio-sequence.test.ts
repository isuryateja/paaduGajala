import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioEngine } from '../../domain/audio/audio-engine';

describe('audio sequence events', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('emits note indexes in sequence order for preview sync', () => {
    const engine = new AudioEngine();
    const indexes: number[] = [];

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    vi.spyOn(engine, 'playSvara').mockReturnValue(null);
    engine.on('noteIndex', (event) => {
      indexes.push((event as { index: number }).index);
    });

    engine.playSequence(
      [
        { svara: 'S', duration: 1, originalIndex: 0 },
        { svara: 'R1', duration: 1, originalIndex: 1 },
        { svara: 'G1', duration: 1, originalIndex: 2 }
      ],
      120
    );

    vi.runAllTimers();

    expect(indexes).toEqual([0, 1, 2]);
  });

  it('does not add scheduling delay for beat boundaries', () => {
    const engine = new AudioEngine();

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    const playSvaraSpy = vi.spyOn(engine, 'playSvara').mockReturnValue(null);

    engine.playSequence(
      [
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 },
        { type: 'boundary', boundaryKind: 'beat', marker: '|' },
        { type: 'svara', svara: 'R1', duration: 1, originalIndex: 1 }
      ],
      60
    );

    expect(playSvaraSpy).toHaveBeenNthCalledWith(1, 'S', 'madhya', 1, 1, 0);
    expect(playSvaraSpy).toHaveBeenNthCalledWith(2, 'R1', 'madhya', 1, 1, 1);
  });

  it('adds a tempo-scaled beat of silence for phrase boundaries', () => {
    const slowEngine = new AudioEngine();
    slowEngine.isInitialized = true;
    slowEngine.audioContext = { currentTime: 0 } as AudioContext;
    const slowPlaySvaraSpy = vi.spyOn(slowEngine, 'playSvara').mockReturnValue(null);

    slowEngine.playSequence(
      [
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 },
        { type: 'boundary', boundaryKind: 'phrase', marker: '||' },
        { type: 'svara', svara: 'R1', duration: 1, originalIndex: 1 }
      ],
      60
    );

    expect(slowPlaySvaraSpy).toHaveBeenNthCalledWith(2, 'R1', 'madhya', 1, 1, 2);

    const fastEngine = new AudioEngine();
    fastEngine.isInitialized = true;
    fastEngine.audioContext = { currentTime: 0 } as AudioContext;
    const fastPlaySvaraSpy = vi.spyOn(fastEngine, 'playSvara').mockReturnValue(null);

    fastEngine.playSequence(
      [
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 },
        { type: 'boundary', boundaryKind: 'phrase', marker: '||' },
        { type: 'svara', svara: 'R1', duration: 1, originalIndex: 1 }
      ],
      120
    );

    expect(fastPlaySvaraSpy).toHaveBeenNthCalledWith(2, 'R1', 'madhya', 1, 1, 1);
  });

  it('applies a terminal phrase pause before ending the sequence', () => {
    const engine = new AudioEngine();
    const sequenceEnd = vi.fn();

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    vi.spyOn(engine, 'playSvara').mockReturnValue(null);
    engine.on('sequenceEnd', sequenceEnd);

    engine.playSequence(
      [
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 },
        { type: 'boundary', boundaryKind: 'phrase', marker: '||' }
      ],
      120
    );

    vi.advanceTimersByTime(999);
    expect(sequenceEnd).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(sequenceEnd).toHaveBeenCalledTimes(1);
  });

  it('delays the first note for leading silence items', () => {
    const engine = new AudioEngine();

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    const playSvaraSpy = vi.spyOn(engine, 'playSvara').mockReturnValue(null);

    engine.playSequence(
      [
        { type: 'silence', duration: 2 },
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 }
      ],
      60
    );

    expect(playSvaraSpy).toHaveBeenCalledWith('S', 'madhya', 1, 1, 2);
  });

  it('stacks post-phrase sustain silence after the phrase pause', () => {
    const engine = new AudioEngine();

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    const playSvaraSpy = vi.spyOn(engine, 'playSvara').mockReturnValue(null);

    engine.playSequence(
      [
        { type: 'svara', svara: 'S', duration: 1, originalIndex: 0 },
        { type: 'boundary', boundaryKind: 'phrase', marker: '||' },
        { type: 'silence', duration: 2 },
        { type: 'svara', svara: 'R1', duration: 1, originalIndex: 1 }
      ],
      60
    );

    expect(playSvaraSpy).toHaveBeenNthCalledWith(2, 'R1', 'madhya', 1, 1, 4);
  });

  it('schedules fractional-duration sequence notes inside a single beat window', () => {
    const engine = new AudioEngine();

    engine.isInitialized = true;
    engine.audioContext = { currentTime: 0 } as AudioContext;
    const playSvaraSpy = vi.spyOn(engine, 'playSvara').mockReturnValue(null);

    engine.playSequence(
      [
        { type: 'svara', svara: 'R2', duration: 0.25, originalIndex: 0 },
        { type: 'svara', svara: 'G2', duration: 0.25, originalIndex: 1 },
        { type: 'svara', svara: 'R2', duration: 0.25, originalIndex: 2 },
        { type: 'svara', svara: 'S', duration: 0.25, originalIndex: 3 }
      ],
      120
    );

    expect(playSvaraSpy).toHaveBeenNthCalledWith(1, 'R2', 'madhya', 0.25, 1, 0);
    expect(playSvaraSpy).toHaveBeenNthCalledWith(2, 'G2', 'madhya', 0.25, 1, 0.125);
    expect(playSvaraSpy).toHaveBeenNthCalledWith(3, 'R2', 'madhya', 0.25, 1, 0.25);
    expect(playSvaraSpy).toHaveBeenNthCalledWith(4, 'S', 'madhya', 0.25, 1, 0.375);
  });
});
