import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startPianoNote, stopPianoNote, releaseAllPianoNotes, getHeldPianoNoteCount } from '../../app/actions/piano.actions';
import { audioEngine } from '../../app/actions/playback.actions';

describe('piano actions', () => {
  beforeEach(() => {
    releaseAllPianoNotes();
    vi.restoreAllMocks();
  });

  it('starts and tracks a held piano note', async () => {
    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    vi.spyOn(audioEngine, 'startSvara').mockReturnValue({ id: 'voice-1' } as ReturnType<typeof audioEngine.startSvara>);

    await startPianoNote('s', '2');

    expect(audioEngine.startSvara).toHaveBeenCalledWith('S', 'madhya');
    expect(getHeldPianoNoteCount()).toBe(1);
  });

  it('releases tracked piano notes individually and in bulk', async () => {
    vi.spyOn(audioEngine, 'init').mockResolvedValue(true);
    vi.spyOn(audioEngine, 'startSvara').mockReturnValue({ id: 'voice-2' } as ReturnType<typeof audioEngine.startSvara>);
    vi.spyOn(audioEngine, 'stopVoice').mockReturnValue(true);

    await startPianoNote('g', '1');
    stopPianoNote('g', '1');
    expect(audioEngine.stopVoice).toHaveBeenCalledWith('voice-2');
    expect(getHeldPianoNoteCount()).toBe(0);

    await startPianoNote('p', '3');
    releaseAllPianoNotes();
    expect(getHeldPianoNoteCount()).toBe(0);
  });
});
