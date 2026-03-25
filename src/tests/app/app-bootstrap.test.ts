import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import { createAppBootstrapService } from '../../app/services/app-bootstrap';
import type { SettingsState } from '../../app/stores/settings.store';
import { SESSION_STORAGE_KEYS } from '../../domain/shared/constants';

describe('app bootstrap service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates settings from session state and persists subsequent updates', () => {
    const settingsStore = writable<SettingsState>({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena'
    });
    const readSessionState = vi.fn().mockReturnValue({
      tempo: 96,
      volume: 0.4,
      waveform: 'sine',
      tuning: 'just',
      preset: 'flute'
    });
    const writeSessionState = vi.fn();
    const applyPreset = vi.fn();
    const updateTempo = vi.fn();
    const updateTuning = vi.fn();
    const updateVolume = vi.fn();
    const updateWaveform = vi.fn();

    const teardown = createAppBootstrapService({
      readSessionState,
      writeSessionState,
      settingsStore,
      applyPreset,
      updateTempo,
      updateTuning,
      updateVolume,
      updateWaveform
    }).bootstrap();

    expect(readSessionState).toHaveBeenCalledWith(SESSION_STORAGE_KEYS.settings, null);
    expect(updateTempo).toHaveBeenCalledWith(96);
    expect(updateVolume).toHaveBeenCalledWith(0.4);
    expect(updateWaveform).toHaveBeenCalledWith('sine');
    expect(updateTuning).toHaveBeenCalledWith('just');
    expect(applyPreset).toHaveBeenCalledWith('flute');

    settingsStore.set({
      tempo: 132,
      volume: 0.5,
      waveform: 'square',
      tuning: 'equal',
      preset: 'veena'
    });

    expect(writeSessionState).toHaveBeenLastCalledWith(SESSION_STORAGE_KEYS.settings, {
      tempo: 132,
      volume: 0.5,
      waveform: 'square',
      tuning: 'equal',
      preset: 'veena'
    });

    teardown();
  });
});
