import { describe, expect, it } from 'vitest';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import { AudioEngine } from '../../domain/audio/audio-engine';

describe('audio configuration', () => {
  it('exposes veena preset defaults', () => {
    expect(AudioEnginePresets.veena.waveform).toBe('triangle');
  });

  it('clamps tempo changes', () => {
    const engine = new AudioEngine();
    engine.setTempo(500);
    expect(engine.tempo).toBe(300);
  });
});
