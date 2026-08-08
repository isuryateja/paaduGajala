import { get, type Writable } from 'svelte/store';
import { SESSION_STORAGE_KEYS } from '../../domain/shared/constants';
import { readSessionState, writeSessionState } from '../../infra/storage/session-state';
import { settingsStore, type SettingsState } from '../stores/settings.store';
import {
  applyPreset,
  updateReverbMix,
  updateReverbPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform
} from '../actions/settings.actions';
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
  updateReverbMix: typeof updateReverbMix;
  updateReverbPreset: typeof updateReverbPreset;
}

export function createAppBootstrapService(dependencies: AppBootstrapDependencies = {
  readSessionState,
  writeSessionState,
  settingsStore,
  applyPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform,
  updateReverbMix,
  updateReverbPreset
}): { bootstrap: () => Teardown } {
  return {
    bootstrap(): Teardown {
      const saved = dependencies.readSessionState<SettingsState | null>(SESSION_STORAGE_KEYS.settings, null);
      if (saved) {
        // Order matters (PGF-013): restore user volume/waveform first, then apply
        // the instrument with preserveUserLevels so preset masterVolume/waveform
        // do not clobber session values. voiceType + envelope still initialize.
        dependencies.updateTempo(saved.tempo);
        dependencies.updateVolume(saved.volume);
        dependencies.updateWaveform(saved.waveform);
        dependencies.updateTuning(saved.tuning);
        dependencies.applyPreset(saved.preset, { preserveUserLevels: true });
        // Older sessions may omit reverb fields — only hydrate when present.
        if (typeof saved.reverbMix === 'number') {
          dependencies.updateReverbMix(saved.reverbMix);
        }
        if (saved.reverbPreset) {
          dependencies.updateReverbPreset(saved.reverbPreset);
        }
      } else {
        // PGF-001: store defaults to preset veena (plucked), but AudioEngine
        // defaults to voiceType pure. Apply the UI default so a fresh session
        // matches the instrument shown in settings.
        dependencies.applyPreset(get(dependencies.settingsStore).preset);
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
