import type { Writable } from 'svelte/store';
import { SESSION_STORAGE_KEYS } from '../../domain/shared/constants';
import { readSessionState, writeSessionState } from '../../infra/storage/session-state';
import { settingsStore, type SettingsState } from '../stores/settings.store';
import { applyPreset, updateTempo, updateTuning, updateVolume, updateWaveform } from '../actions/settings.actions';
import type { Teardown } from '../../domain/shared/types';

export interface AppBootstrapDependencies {
  readSessionState: typeof readSessionState;
  writeSessionState: typeof writeSessionState;
  settingsStore: Writable<SettingsState>;
  applyPreset: typeof applyPreset;
  updateTempo: typeof updateTempo;
  updateTuning: typeof updateTuning;
  updateVolume: typeof updateVolume;
  updateWaveform: typeof updateWaveform;
}

export function createAppBootstrapService(dependencies: AppBootstrapDependencies = {
  readSessionState,
  writeSessionState,
  settingsStore,
  applyPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform
}): { bootstrap: () => Teardown } {
  return {
    bootstrap(): Teardown {
      const saved = dependencies.readSessionState<SettingsState | null>(SESSION_STORAGE_KEYS.settings, null);
      if (saved) {
        dependencies.updateTempo(saved.tempo);
        dependencies.updateVolume(saved.volume);
        dependencies.updateWaveform(saved.waveform);
        dependencies.updateTuning(saved.tuning);
        dependencies.applyPreset(saved.preset);
      }

      return dependencies.settingsStore.subscribe((settings) => {
        dependencies.writeSessionState(SESSION_STORAGE_KEYS.settings, settings);
      });
    }
  };
}

export function bootstrapApp(): Teardown {
  return createAppBootstrapService().bootstrap();
}
