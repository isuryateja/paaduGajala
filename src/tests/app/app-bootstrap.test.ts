import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import {
  applyPreset,
  updateReverbMix,
  updateReverbPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform
} from '../../app/actions/settings.actions';
import { audioEngine } from '../../app/actions/playback.actions';
import { createAppBootstrapService } from '../../app/services/app-bootstrap';
import { settingsStore, type SettingsState } from '../../app/stores/settings.store';
import { SESSION_STORAGE_KEYS } from '../../domain/shared/constants';

describe('app bootstrap service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates settings from session state and persists subsequent updates', () => {
    const localStore = writable<SettingsState>({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0,
      reverbPreset: 'room'
    });
    const readSessionState = vi.fn().mockReturnValue({
      tempo: 96,
      volume: 0.4,
      waveform: 'sine',
      tuning: 'just',
      preset: 'flute',
      reverbMix: 0.3,
      reverbPreset: 'hall'
    });
    const writeSessionState = vi.fn();
    const applyPresetFn = vi.fn();
    const updateTempoFn = vi.fn();
    const updateTuningFn = vi.fn();
    const updateVolumeFn = vi.fn();
    const updateWaveformFn = vi.fn();
    const updateReverbMixFn = vi.fn();
    const updateReverbPresetFn = vi.fn();

    const teardown = createAppBootstrapService({
      readSessionState,
      writeSessionState,
      settingsStore: localStore,
      applyPreset: applyPresetFn,
      updateTempo: updateTempoFn,
      updateTuning: updateTuningFn,
      updateVolume: updateVolumeFn,
      updateWaveform: updateWaveformFn,
      updateReverbMix: updateReverbMixFn,
      updateReverbPreset: updateReverbPresetFn
    }).bootstrap();

    expect(readSessionState).toHaveBeenCalledWith(SESSION_STORAGE_KEYS.settings, null);
    expect(updateTempoFn).toHaveBeenCalledWith(96);
    expect(updateVolumeFn).toHaveBeenCalledWith(0.4);
    expect(updateWaveformFn).toHaveBeenCalledWith('sine');
    expect(updateTuningFn).toHaveBeenCalledWith('just');
    // PGF-013: preset apply must not clobber restored volume/waveform.
    expect(applyPresetFn).toHaveBeenCalledWith('flute', { preserveUserLevels: true });
    expect(updateReverbMixFn).toHaveBeenCalledWith(0.3);
    expect(updateReverbPresetFn).toHaveBeenCalledWith('hall');

    localStore.set({
      tempo: 132,
      volume: 0.5,
      waveform: 'square',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0.25,
      reverbPreset: 'concert'
    });

    expect(writeSessionState).toHaveBeenLastCalledWith(SESSION_STORAGE_KEYS.settings, {
      tempo: 132,
      volume: 0.5,
      waveform: 'square',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0.25,
      reverbPreset: 'concert'
    });

    teardown();
  });

  it('skips reverb hydrate when older session omits reverb fields (P2B-01)', () => {
    const settingsStore = writable<SettingsState>({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0,
      reverbPreset: 'room'
    });
    const readSessionState = vi.fn().mockReturnValue({
      tempo: 100,
      volume: 0.5,
      waveform: 'sine',
      tuning: 'equal',
      preset: 'veena'
      // no reverbMix / reverbPreset
    });
    const updateReverbMix = vi.fn();
    const updateReverbPreset = vi.fn();

    createAppBootstrapService({
      readSessionState,
      writeSessionState: vi.fn(),
      settingsStore,
      applyPreset: vi.fn(),
      updateTempo: vi.fn(),
      updateTuning: vi.fn(),
      updateVolume: vi.fn(),
      updateWaveform: vi.fn(),
      updateReverbMix,
      updateReverbPreset
    }).bootstrap();

    expect(updateReverbMix).not.toHaveBeenCalled();
    expect(updateReverbPreset).not.toHaveBeenCalled();
  });

  it('applies the store default preset on a fresh session with no saved settings (PGF-001)', () => {
    const localStore = writable<SettingsState>({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0.25,
      reverbPreset: 'room'
    });
    const applyPresetFn = vi.fn();
    const updateTempoFn = vi.fn();
    const updateVolumeFn = vi.fn();
    const updateWaveformFn = vi.fn();
    const updateTuningFn = vi.fn();
    const updateReverbMixFn = vi.fn();
    const updateReverbPresetFn = vi.fn();

    createAppBootstrapService({
      readSessionState: vi.fn().mockReturnValue(null),
      writeSessionState: vi.fn(),
      settingsStore: localStore,
      applyPreset: applyPresetFn,
      updateTempo: updateTempoFn,
      updateTuning: updateTuningFn,
      updateVolume: updateVolumeFn,
      updateWaveform: updateWaveformFn,
      updateReverbMix: updateReverbMixFn,
      updateReverbPreset: updateReverbPresetFn
    }).bootstrap();

    // Engine defaults to voiceType pure; UI defaults to veena (plucked). Sync them.
    expect(applyPresetFn).toHaveBeenCalledWith('veena');
    expect(applyPresetFn).toHaveBeenCalledTimes(1);
    // Fresh session should not re-hydrate other knobs (engine already matches store defaults).
    expect(updateTempoFn).not.toHaveBeenCalled();
    expect(updateVolumeFn).not.toHaveBeenCalled();
    expect(updateWaveformFn).not.toHaveBeenCalled();
    expect(updateTuningFn).not.toHaveBeenCalled();
    expect(updateReverbMixFn).not.toHaveBeenCalled();
    expect(updateReverbPresetFn).not.toHaveBeenCalled();
  });

  it('preserves saved volume and waveform after preset restore (PGF-013 final state)', () => {
    // Integration: real actions + store. Flute preset would otherwise force volume 0.8.
    settingsStore.set({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: 0.25,
      reverbPreset: 'room'
    });
    audioEngine.setVoiceType('pure');
    audioEngine.setWaveform('triangle');
    audioEngine.setVolume(0.7);

    const teardown = createAppBootstrapService({
      readSessionState: vi.fn().mockReturnValue({
        tempo: 96,
        volume: 0.4,
        waveform: 'sine',
        tuning: 'just',
        preset: 'flute',
        reverbMix: 0.3,
        reverbPreset: 'hall'
      }),
      writeSessionState: vi.fn(),
      settingsStore,
      applyPreset,
      updateTempo,
      updateTuning,
      updateVolume,
      updateWaveform,
      updateReverbMix,
      updateReverbPreset
    }).bootstrap();

    const final = get(settingsStore);
    expect(final.volume).toBe(0.4);
    expect(final.waveform).toBe('sine');
    expect(final.preset).toBe('flute');
    expect(final.tempo).toBe(96);
    expect(final.tuning).toBe('just');
    expect(final.reverbMix).toBe(0.3);
    expect(final.reverbPreset).toBe('hall');
    // Instrument voice still initializes; volume is the saved user level, not flute's 0.8.
    expect(audioEngine.config.voiceType).toBe('flute');
    expect(audioEngine.config.masterVolume).toBe(0.4);
    expect(audioEngine.config.waveform).toBe('sine');
    expect(audioEngine.config.envelope.attack).toBe(0.05);

    teardown();
  });
});
