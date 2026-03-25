import { clearNotation, loadExampleNotation, loadNotationFile, parseCurrentNotation, setNotationText } from '../actions/notation.actions';
import { pausePlayback, startPlayback, stopPlayback } from '../actions/playback.actions';
import { applyPreset, updateTempo, updateTuning, updateVolume, updateWaveform } from '../actions/settings.actions';
import type { NotationState } from '../stores/notation.store';
import type { SettingsState } from '../stores/settings.store';
import { formatDuration } from '../../lib/utils/format-duration';
import { getNotationPreviewStats } from '../../domain/notation/notation.stats';

export interface MainPlayerViewModel {
  noteCount: string;
  lineCount: string;
  octaveCount: string;
  duration: string;
  parsedInfo: string;
}

export function createMainPlayerViewModel(notationState: NotationState, settingsState: SettingsState): MainPlayerViewModel {
  const stats = notationState.stats ?? {
    totalNotes: 0,
    lines: 0,
    octaveDistribution: {}
  };
  const previewStats = getNotationPreviewStats(notationState.rawText, settingsState.tempo);

  return {
    noteCount: String(stats.totalNotes ?? 0),
    lineCount: String(stats.lines ?? 0),
    octaveCount: String(previewStats.octavesUsed),
    duration: formatDuration(previewStats.totalBeats, settingsState.tempo),
    parsedInfo: stats.totalNotes ? `${stats.totalNotes} notes parsed` : ''
  };
}

export async function handleNotationFileSelection(event: Event): Promise<void> {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (file) {
    await loadNotationFile(file);
  }
}

export const mainPlayerHandlers = {
  clearNotation,
  loadExampleNotation,
  parseCurrentNotation,
  pausePlayback,
  startPlayback,
  stopPlayback,
  setNotationText,
  applyPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform,
  handleNotationFileSelection
};
