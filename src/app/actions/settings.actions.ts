import { get } from 'svelte/store';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import type { ReverbPreset } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';
import { MAX_TEMPO, MIN_TEMPO } from '../../domain/shared/constants';
import { clamp } from '../../lib/utils/clamp';
import { settingsStore } from '../stores/settings.store';
import { audioEngine } from './playback.actions';
import { pushToast } from '../stores/ui.store';

export function updateTempo(tempo: number): void {
  const nextTempo = clamp(tempo, MIN_TEMPO, MAX_TEMPO);
  settingsStore.update((state) => ({ ...state, tempo: nextTempo }));
  audioEngine.setTempo(nextTempo);
}

export function updateVolume(volume: number): void {
  settingsStore.update((state) => ({ ...state, volume }));
  audioEngine.setVolume(volume);
}

/**
 * Manual waveform change keeps the picker meaningful: engine voice becomes pure.
 * (AudioEngine.setWaveform also forces voiceType = pure.)
 */
export function updateWaveform(waveform: 'sine' | 'triangle' | 'sawtooth' | 'square'): void {
  settingsStore.update((state) => ({ ...state, waveform }));
  audioEngine.setWaveform(waveform);
}

export function updateTuning(tuning: 'equal' | 'just'): void {
  settingsStore.update((state) => ({ ...state, tuning }));
  audioEngine.setTuning(tuning);
}

/**
 * Wet reverb send (0..1). Clamps, updates store, and drives engine dry/wet gains.
 */
export function updateReverbMix(mix: number): void {
  const nextMix = clamp(mix, 0, 1);
  settingsStore.update((state) => ({ ...state, reverbMix: nextMix }));
  audioEngine.setReverbMix(nextMix);
}

/**
 * Select convolution IR preset and reload the engine convolver buffer when ready.
 */
export function updateReverbPreset(preset: ReverbPreset): void {
  if (!REVERB_PRESETS.includes(preset)) {
    return;
  }
  settingsStore.update((state) => ({ ...state, reverbPreset: preset }));
  audioEngine.setReverbPreset(preset);
}

export interface ApplyPresetOptions {
  /**
   * Bootstrap path (PGF-013): keep session volume/waveform already applied to store/engine.
   * Still initializes the preset's voiceType + envelope. Suppresses the interactive toast.
   */
  preserveUserLevels?: boolean;
}

/**
 * Apply an instrument preset: envelope/volume/waveform fallbacks, then additive voiceType.
 * setWaveform forces pure first; setVoiceType restores the instrument bank when mapped.
 *
 * Pass `{ preserveUserLevels: true }` during session restore so saved volume/waveform
 * are not overwritten by the preset's masterVolume/waveform defaults.
 */
export function applyPreset(presetName: string, options: ApplyPresetOptions = {}): void {
  const preset = AudioEnginePresets[presetName];
  if (!preset) {
    return;
  }

  const preserveUserLevels = options.preserveUserLevels === true;

  settingsStore.update((state) => ({
    ...state,
    preset: presetName,
    ...(preserveUserLevels
      ? {}
      : {
          waveform: preset.waveform ?? state.waveform,
          volume: preset.masterVolume ?? state.volume
        })
  }));

  const currentSettings = get(settingsStore);
  if (!preserveUserLevels) {
    // Interactive path: adopt preset volume/waveform. setWaveform forces pure —
    // call setVoiceType after so instrument banks win.
    audioEngine.setWaveform(currentSettings.waveform);
    audioEngine.setVolume(currentSettings.volume);
  } else {
    // Bootstrap: volume/waveform already restored; only re-sync volume in case
    // engine lagged, without forcing pure via setWaveform.
    audioEngine.setVolume(currentSettings.volume);
  }
  if (preset.envelope) {
    audioEngine.setEnvelope(preset.envelope);
  }
  if (preset.voiceType) {
    audioEngine.setVoiceType(preset.voiceType);
  }

  if (!preserveUserLevels) {
    pushToast(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied`, 'success');
  }
}
