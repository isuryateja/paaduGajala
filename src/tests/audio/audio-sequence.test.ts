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
});
