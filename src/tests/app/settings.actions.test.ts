import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { updateTempo } from '../../app/actions/settings.actions';
import { audioEngine } from '../../app/actions/playback.actions';
import { settingsStore } from '../../app/stores/settings.store';

describe('settings actions', () => {
  beforeEach(() => {
    settingsStore.set({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena'
    });
  });

  it('clamps tempo updates to the supported range', () => {
    const setTempoSpy = vi.spyOn(audioEngine, 'setTempo').mockImplementation(() => {});

    updateTempo(700);

    expect(get(settingsStore).tempo).toBe(600);
    expect(setTempoSpy).toHaveBeenCalledWith(600);
  });
});
