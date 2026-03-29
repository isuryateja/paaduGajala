import { get } from 'svelte/store';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import { settingsStore } from '../stores/settings.store';
import { audioEngine } from './playback.actions';
import { pushToast } from '../stores/ui.store';

export function updateTempo(tempo: number): void {
  settingsStore.update((state) => ({ ...state, tempo }));
  audioEngine.setTempo(tempo);
}

export function updateVolume(volume: number): void {
  settingsStore.update((state) => ({ ...state, volume }));
  audioEngine.setVolume(volume);
}

export function updateWaveform(waveform: 'sine' | 'triangle' | 'sawtooth' | 'square'): void {
  settingsStore.update((state) => ({ ...state, waveform }));
  audioEngine.setWaveform(waveform);
}

export function updateTuning(tuning: 'equal' | 'just'): void {
  settingsStore.update((state) => ({ ...state, tuning }));
  audioEngine.setTuning(tuning);
}

export function applyPreset(presetName: string): void {
  const preset = AudioEnginePresets[presetName];
  if (!preset) {
    return;
  }

  settingsStore.update((state) => ({
    ...state,
    preset: presetName,
    waveform: preset.waveform ?? state.waveform,
    volume: preset.masterVolume ?? state.volume
  }));

  const currentSettings = get(settingsStore);
  audioEngine.setWaveform(currentSettings.waveform);
  audioEngine.setVolume(currentSettings.volume);
  if (preset.envelope) {
    audioEngine.setEnvelope(preset.envelope);
  }

  pushToast(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied`, 'success');
}
