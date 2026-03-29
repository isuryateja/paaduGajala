import { afterEach, describe, expect, it } from 'vitest';
import { audioEngine } from '../../app/actions/playback.actions';
import { createPlaybackPianoVisualizer, resolvePlaybackPianoKeyId } from '../../app/services/main-player-page';
import type { ActivePianoKeys } from '../../domain/piano/piano.types';

type EngineEmitter = {
  emit: (event: 'noteOn' | 'noteOff' | 'sequenceEnd', data?: unknown) => void;
};

describe('main player piano playback sync', () => {
  afterEach(() => {
    (audioEngine as unknown as EngineEmitter).emit('sequenceEnd');
  });

  it('maps equivalent svaras onto the rendered piano keys', () => {
    expect(resolvePlaybackPianoKeyId('G1', 'madhya')).toBe('r2:2');
    expect(resolvePlaybackPianoKeyId('R1', 'taara')).toBe('r1:3');
    expect(resolvePlaybackPianoKeyId('D2', 'mandra')).toBe('n1:1');
  });

  it('activates and releases piano keys from audio engine note events', () => {
    const snapshots: ActivePianoKeys[] = [];
    const teardown = createPlaybackPianoVisualizer((activeKeys) => {
      snapshots.push(activeKeys);
    });

    (audioEngine as unknown as EngineEmitter).emit('noteOn', { svara: 'G1', octave: 'madhya' });
    (audioEngine as unknown as EngineEmitter).emit('noteOff', { svara: 'G1', octave: 'madhya' });

    teardown();

    expect(snapshots).toEqual([{ 'r2:2': true }, {}]);
  });
});
