import { describe, expect, it, vi } from 'vitest';
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

  it('stops active voices immediately when stopping all audio', () => {
    const engine = new AudioEngine();
    const stopFirst = vi.fn();
    const stopSecond = vi.fn();

    engine.audioContext = { currentTime: 12 } as AudioContext;
    engine.activeVoices.set('voice-1', { id: 'voice-1', stop: stopFirst } as ReturnType<typeof engine.startSvara>);
    engine.activeVoices.set('voice-2', { id: 'voice-2', stop: stopSecond } as ReturnType<typeof engine.startSvara>);

    engine.stopAll();

    expect(stopFirst).toHaveBeenCalledWith(12);
    expect(stopSecond).toHaveBeenCalledWith(12);
    expect(engine.activeVoices.size).toBe(0);
  });
});
