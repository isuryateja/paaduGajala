import { clearNotation, loadExampleNotation, loadNotationFile, parseCurrentNotation, setNotationText } from '../actions/notation.actions';
import { audioEngine, pausePlayback, resumePlayback, startPlayback, stopPlayback } from '../actions/playback.actions';
import {
  applyPreset,
  updateReverbMix,
  updateReverbPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform
} from '../actions/settings.actions';
import type { NotationState } from '../stores/notation.store';
import type { SettingsState } from '../stores/settings.store';
import { formatDuration } from '../../lib/utils/format-duration';
import { getNotationPreviewStats } from '../../domain/notation/notation.stats';
import { normalizeOctaveName, normalizeSvaraName } from '../../domain/pitch/svara-normalization';
import type { ActivePianoKeys } from '../../domain/piano/piano.types';
import type { OctaveName, Teardown } from '../../domain/shared/types';

export interface MainPlayerViewModel {
  noteCount: string;
  lineCount: string;
  octaveCount: string;
  duration: string;
  parsedInfo: string;
}

const PLAYBACK_KEY_MAP_BY_OCTAVE: Record<OctaveName, Record<string, string>> = {
  mandra: {
    D2: 'n1',
    N1: 'n1',
    D3: 'n2',
    N2: 'n2',
    N3: 'n3'
  },
  mandara: {
    D2: 'n1',
    N1: 'n1',
    D3: 'n2',
    N2: 'n2',
    N3: 'n3'
  },
  madhya: {
    S: 's',
    R1: 'r1',
    R2: 'r2',
    G1: 'r2',
    R3: 'g2',
    G2: 'g2',
    G3: 'g3',
    M1: 'm1',
    M2: 'm2',
    P: 'p',
    D1: 'd1',
    D2: 'd2',
    N1: 'd2',
    D3: 'n2',
    N2: 'n2',
    N3: 'n3'
  },
  taara: {
    S: 's',
    R1: 'r1',
    R2: 'r2',
    G1: 'r2'
  }
};

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

export function resolvePlaybackPianoKeyId(svara: string, octave: string): string | null {
  const normalizedOctave = normalizeOctaveName(octave);
  const pianoNote = PLAYBACK_KEY_MAP_BY_OCTAVE[normalizedOctave][normalizeSvaraName(svara)];
  if (!pianoNote) {
    return null;
  }

  const pianoOctave = normalizedOctave === 'mandra' || normalizedOctave === 'mandara' ? '1' : normalizedOctave === 'madhya' ? '2' : '3';
  return pianoOctave ? `${pianoNote}:${pianoOctave}` : null;
}

export function createPlaybackPianoVisualizer(onChange: (activeKeys: ActivePianoKeys) => void): Teardown {
  let activeKeys: ActivePianoKeys = {};

  function emitChange(): void {
    onChange(activeKeys);
  }

  function setKeyState(keyId: string | null, pressed: boolean): void {
    if (!keyId) {
      return;
    }

    if (pressed) {
      if (activeKeys[keyId]) {
        return;
      }

      activeKeys = {
        ...activeKeys,
        [keyId]: true
      };
      emitChange();
      return;
    }

    if (!activeKeys[keyId]) {
      return;
    }

    const remainingKeys = { ...activeKeys };
    delete remainingKeys[keyId];
    activeKeys = remainingKeys;
    emitChange();
  }

  function clearKeys(): void {
    if (Object.keys(activeKeys).length === 0) {
      return;
    }

    activeKeys = {};
    emitChange();
  }

  const removeNoteOn = audioEngine.on('noteOn', (event) => {
    const data = event as { svara?: string; octave?: string };
    setKeyState(resolvePlaybackPianoKeyId(data.svara ?? '', data.octave ?? ''), true);
  });

  const removeNoteOff = audioEngine.on('noteOff', (event) => {
    const data = event as { svara?: string; octave?: string };
    setKeyState(resolvePlaybackPianoKeyId(data.svara ?? '', data.octave ?? ''), false);
  });

  const removeSequenceEnd = audioEngine.on('sequenceEnd', clearKeys);
  const removeSequenceStart = audioEngine.on('sequenceStart', clearKeys);

  return () => {
    removeNoteOn();
    removeNoteOff();
    removeSequenceEnd();
    removeSequenceStart();
    clearKeys();
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
  resumePlayback,
  startPlayback,
  stopPlayback,
  setNotationText,
  applyPreset,
  updateTempo,
  updateTuning,
  updateVolume,
  updateWaveform,
  updateReverbMix,
  updateReverbPreset,
  handleNotationFileSelection
};
