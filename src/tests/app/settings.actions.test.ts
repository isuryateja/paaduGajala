import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  applyPreset,
  updateReverbMix,
  updateReverbPreset,
  updateTempo,
  updateWaveform
} from '../../app/actions/settings.actions';
import { audioEngine } from '../../app/actions/playback.actions';
import { settingsStore } from '../../app/stores/settings.store';
import { AudioEngine } from '../../domain/audio/audio-engine';
import type { ReverbPreset } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';
import { DEFAULT_REVERB_MIX, DEFAULT_REVERB_PRESET } from '../../domain/shared/constants';

describe('settings actions', () => {
  beforeEach(() => {
    settingsStore.set({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: DEFAULT_REVERB_MIX,
      reverbPreset: DEFAULT_REVERB_PRESET
    });
    // Reset engine config surface used by these tests.
    audioEngine.setVoiceType('pure');
    audioEngine.setWaveform('triangle');
    audioEngine.setReverbMix(DEFAULT_REVERB_MIX);
    audioEngine.setReverbPreset(DEFAULT_REVERB_PRESET);
  });

  it('clamps tempo updates to the supported range', () => {
    const setTempoSpy = vi.spyOn(audioEngine, 'setTempo').mockImplementation(() => {});

    updateTempo(500);

    expect(get(settingsStore).tempo).toBe(300);
    expect(setTempoSpy).toHaveBeenCalledWith(300);
    setTempoSpy.mockRestore();
  });

  it('applyPreset sets engine voiceType from the instrument map (P1B-06)', () => {
    applyPreset('violin');

    expect(get(settingsStore).preset).toBe('violin');
    expect(get(settingsStore).waveform).toBe('sawtooth');
    expect(get(settingsStore).volume).toBe(0.6);
    expect(audioEngine.config.waveform).toBe('sawtooth');
    expect(audioEngine.config.voiceType).toBe('bow');
    expect(audioEngine.config.envelope.attack).toBe(0.1);
  });

  it('applyPreset with preserveUserLevels keeps volume/waveform (PGF-013)', () => {
    settingsStore.set({
      tempo: 120,
      volume: 0.4,
      waveform: 'sine',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: DEFAULT_REVERB_MIX,
      reverbPreset: DEFAULT_REVERB_PRESET
    });
    audioEngine.setVolume(0.4);
    audioEngine.setWaveform('sine');

    applyPreset('violin', { preserveUserLevels: true });

    expect(get(settingsStore).preset).toBe('violin');
    expect(get(settingsStore).volume).toBe(0.4);
    expect(get(settingsStore).waveform).toBe('sine');
    expect(audioEngine.config.masterVolume).toBe(0.4);
    expect(audioEngine.config.waveform).toBe('sine');
    expect(audioEngine.config.voiceType).toBe('bow');
    expect(audioEngine.config.envelope.attack).toBe(0.1);
  });

  it('applyPreset maps every live instrument preset to its voiceType', () => {
    const expected: Record<string, string> = {
      flute: 'flute',
      veena: 'plucked',
      violin: 'bow',
      harmonium: 'reed'
    };

    for (const [presetName, voiceType] of Object.entries(expected)) {
      applyPreset(presetName);
      expect(audioEngine.config.voiceType).toBe(voiceType);
      expect(get(settingsStore).preset).toBe(presetName);
    }
  });

  it('updateWaveform forces engine voiceType to pure (P1B-06)', () => {
    applyPreset('harmonium');
    expect(audioEngine.config.voiceType).toBe('reed');

    updateWaveform('sine');

    expect(get(settingsStore).waveform).toBe('sine');
    expect(audioEngine.config.waveform).toBe('sine');
    expect(audioEngine.config.voiceType).toBe('pure');
  });

  it('ship default reverbMix is 0.25 and reverbPreset room (P2B-03)', () => {
    expect(DEFAULT_REVERB_MIX).toBe(0.25);
    expect(DEFAULT_REVERB_PRESET).toBe('room');
    expect(get(settingsStore).reverbMix).toBe(0.25);
    expect(get(settingsStore).reverbPreset).toBe('room');
    expect(new AudioEngine().config.reverbMix).toBe(0.25);
    expect(new AudioEngine().config.reverbPreset).toBe('room');
  });

  it('updateReverbMix clamps, updates store, and calls engine (P2B-01)', () => {
    const spy = vi.spyOn(audioEngine, 'setReverbMix');

    updateReverbMix(0.35);
    expect(get(settingsStore).reverbMix).toBe(0.35);
    expect(audioEngine.config.reverbMix).toBe(0.35);
    expect(spy).toHaveBeenCalledWith(0.35);

    updateReverbMix(2);
    expect(get(settingsStore).reverbMix).toBe(1);
    expect(audioEngine.config.reverbMix).toBe(1);

    updateReverbMix(-0.5);
    expect(get(settingsStore).reverbMix).toBe(0);
    expect(audioEngine.config.reverbMix).toBe(0);

    spy.mockRestore();
  });

  it('updateReverbPreset updates store and engine; ignores unknown (P2B-01)', () => {
    const spy = vi.spyOn(audioEngine, 'setReverbPreset');

    for (const preset of REVERB_PRESETS) {
      updateReverbPreset(preset);
      expect(get(settingsStore).reverbPreset).toBe(preset);
      expect(audioEngine.config.reverbPreset).toBe(preset);
      expect(spy).toHaveBeenCalledWith(preset);
    }

    updateReverbPreset('hall');
    updateReverbPreset('not-a-room' as ReverbPreset);
    expect(get(settingsStore).reverbPreset).toBe('hall');
    expect(audioEngine.config.reverbPreset).toBe('hall');

    spy.mockRestore();
  });
});
