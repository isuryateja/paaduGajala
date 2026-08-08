import { describe, expect, it, vi } from 'vitest';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import { AudioEngine } from '../../domain/audio/audio-engine';
import type { AudioPreset } from '../../domain/audio/audio.presets';
import type { AudioVoice, ReverbPreset, VoiceType } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';

/** Minimal typed AudioVoice fixture for engine map tests (PGF-004). */
function createTestVoice(overrides: Partial<AudioVoice> & Pick<AudioVoice, 'id' | 'stop'>): AudioVoice {
  return {
    envelopeGain: {} as GainNode,
    voiceGain: {} as GainNode,
    frequency: 261.63,
    svara: 'S',
    octave: 'madhya',
    startTime: 0,
    duration: 1,
    ...overrides
  };
}

describe('audio configuration', () => {
  it('exposes veena preset defaults', () => {
    expect(AudioEnginePresets.veena.waveform).toBe('triangle');
  });

  it('defaults voiceType to pure on construct', () => {
    const engine = new AudioEngine();
    expect(engine.config.voiceType).toBe('pure');
  });

  it('defaults reverbMix to 0.25 and reverbPreset to room (P2B-03)', () => {
    const engine = new AudioEngine();
    expect(engine.config.reverbMix).toBe(0.25);
    expect(engine.config.reverbPreset).toBe('room');
  });

  it('accepts reverb options via constructor and clamps mix', () => {
    const engine = new AudioEngine({ reverbMix: 1.5, reverbPreset: 'hall' });
    expect(engine.config.reverbMix).toBe(1);
    expect(engine.config.reverbPreset).toBe('hall');

    const dry = new AudioEngine({ reverbMix: -0.2 });
    expect(dry.config.reverbMix).toBe(0);
  });

  it('setReverbMix clamps to 0..1', () => {
    const engine = new AudioEngine();
    engine.setReverbMix(0.35);
    expect(engine.config.reverbMix).toBe(0.35);
    engine.setReverbMix(2);
    expect(engine.config.reverbMix).toBe(1);
    engine.setReverbMix(-1);
    expect(engine.config.reverbMix).toBe(0);
  });

  it('setReverbPreset accepts known presets and ignores unknown', () => {
    const engine = new AudioEngine();
    for (const preset of REVERB_PRESETS) {
      engine.setReverbPreset(preset);
      expect(engine.config.reverbPreset).toBe(preset);
    }
    engine.setReverbPreset('hall');
    engine.setReverbPreset('not-a-room' as ReverbPreset);
    expect(engine.config.reverbPreset).toBe('hall');
  });

  it('accepts voiceType via constructor options', () => {
    const engine = new AudioEngine({ voiceType: 'flute' });
    expect(engine.config.voiceType).toBe('flute');
  });

  it('setVoiceType updates config without forcing pure fallback at config layer', () => {
    const engine = new AudioEngine();
    engine.setVoiceType('plucked');
    expect(engine.config.voiceType).toBe('plucked');
    engine.setVoiceType('pure');
    expect(engine.config.voiceType).toBe('pure');
  });

  it('setWaveform forces voiceType to pure so the waveform picker stays meaningful (P1B-06)', () => {
    const engine = new AudioEngine({ voiceType: 'bow', waveform: 'sawtooth' });
    expect(engine.config.voiceType).toBe('bow');

    engine.setWaveform('triangle');

    expect(engine.config.waveform).toBe('triangle');
    expect(engine.config.voiceType).toBe('pure');
  });

  it('maps each instrument preset to its additive voiceType (P1B-05)', () => {
    expect(AudioEnginePresets.flute.voiceType).toBe('flute');
    expect(AudioEnginePresets.veena.voiceType).toBe('plucked');
    expect(AudioEnginePresets.violin.voiceType).toBe('bow');
    expect(AudioEnginePresets.harmonium.voiceType).toBe('reed');

    // Waveform / envelope fallbacks still present for pure path and settings.
    expect(AudioEnginePresets.flute.waveform).toBe('sine');
    expect(AudioEnginePresets.veena.waveform).toBe('triangle');
    expect(AudioEnginePresets.violin.waveform).toBe('sawtooth');
    expect(AudioEnginePresets.harmonium.waveform).toBe('square');

    for (const name of Object.keys(AudioEnginePresets)) {
      expect(AudioEnginePresets[name].voiceType).toBeDefined();
      expect(AudioEnginePresets[name].envelope).toBeDefined();
    }

    // Type-level check: every VoiceType is assignable on a preset fragment.
    const allTypes: VoiceType[] = ['pure', 'plucked', 'flute', 'bow', 'reed'];
    for (const voiceType of allTypes) {
      const fragment: AudioPreset = { voiceType };
      expect(fragment.voiceType).toBe(voiceType);
    }
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
    engine.activeVoices.set(
      'voice-1',
      createTestVoice({ id: 'voice-1', stop: stopFirst })
    );
    engine.activeVoices.set(
      'voice-2',
      createTestVoice({ id: 'voice-2', stop: stopSecond })
    );

    engine.stopAll();

    expect(stopFirst).toHaveBeenCalledWith(12);
    expect(stopSecond).toHaveBeenCalledWith(12);
    expect(engine.activeVoices.size).toBe(0);
  });
});
