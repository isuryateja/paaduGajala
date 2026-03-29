import { audioEngine, ensureAudioReady } from './playback.actions';
import { normalizeOctaveName, normalizeSvaraName } from '../../domain/pitch/svara-normalization';
import { setStatus } from '../stores/ui.store';

const heldVoices = new Map<string, string>();

export async function startPianoNote(note: string, octave: string): Promise<void> {
  await ensureAudioReady();
  const normalizedSvara = normalizeSvaraName(note);
  const normalizedOctave = normalizeOctaveName(octave);
  const voice = audioEngine.startSvara(normalizedSvara, normalizedOctave);
  if (voice) {
    heldVoices.set(`${note}:${octave}`, voice.id);
    setStatus({ tone: 'info', text: `Playing ${normalizedSvara} (${normalizedOctave})` });
  }
}

export function stopPianoNote(note: string, octave: string): void {
  const key = `${note}:${octave}`;
  const voiceId = heldVoices.get(key);
  if (!voiceId) {
    return;
  }
  audioEngine.stopVoice(voiceId);
  heldVoices.delete(key);
  if (heldVoices.size === 0) {
    setStatus({ tone: 'ready', text: 'Ready' });
  }
}

export function releaseAllPianoNotes(): void {
  heldVoices.forEach((voiceId) => audioEngine.stopVoice(voiceId));
  heldVoices.clear();
  setStatus({ tone: 'ready', text: 'Ready' });
}

export function getHeldPianoNoteCount(): number {
  return heldVoices.size;
}
