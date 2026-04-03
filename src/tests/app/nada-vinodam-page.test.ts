import { describe, expect, it, vi } from 'vitest';
import { createNadaVinodamPageController } from '../../app/services/nada-vinodam-page';
import type { NadaAnalyserFrame, NadaVinodamState, NadaVinodamSynth } from '../../domain/audio/nada-vinodam.types';

function createMockSynth(frame: NadaAnalyserFrame | null = null): NadaVinodamSynth {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    setFrequency: vi.fn(),
    setGain: vi.fn(),
    setEnvelope: vi.fn(),
    setWaveform: vi.fn(),
    setSustainEnabled: vi.fn(),
    readAnalyserFrame: vi.fn().mockReturnValue(frame),
    destroy: vi.fn()
  };
}

describe('nada vinodam page controller', () => {
  it('recomputes svara mapping when the frequency changes', () => {
    const synth = createMockSynth();
    const controller = createNadaVinodamPageController({
      createSynth: () => synth,
      mapFrequency: (frequencyHz) => ({
        svara: frequencyHz > 500 ? 'S' : 'R2',
        octave: frequencyHz > 500 ? 'taara' : 'madhya',
        referenceFrequencyHz: frequencyHz,
        deltaHz: 0
      }),
      requestFrame: vi.fn().mockReturnValue(1),
      cancelFrame: vi.fn(),
      scheduleTimeout: vi.fn().mockReturnValue(1),
      clearScheduledTimeout: vi.fn(),
      onVisibilityChange: () => () => {},
      onWindowBlur: () => () => {}
    });

    let latestState: NadaVinodamState | undefined;
    const unsubscribe = controller.state.subscribe((value) => {
      latestState = value;
    });

    controller.setFrequency(523.25);

    expect(synth.setFrequency).toHaveBeenCalledWith(523.25);
    expect(latestState).toMatchObject({
      frequencyHz: 523.25,
      mappedSvara: 'S',
      mappedOctave: 'taara'
    });

    unsubscribe();
  });

  it('starts playback and marks audio ready on success', async () => {
    const synth = createMockSynth();
    const requestFrame = vi.fn().mockReturnValue(1);
    const controller = createNadaVinodamPageController({
      createSynth: () => synth,
      mapFrequency: () => ({
        svara: 'S',
        octave: 'madhya',
        referenceFrequencyHz: 261.63,
        deltaHz: 0
      }),
      requestFrame,
      cancelFrame: vi.fn(),
      scheduleTimeout: vi.fn().mockReturnValue(1),
      clearScheduledTimeout: vi.fn(),
      onVisibilityChange: () => () => {},
      onWindowBlur: () => () => {}
    });

    let latestState: NadaVinodamState | undefined;
    const unsubscribe = controller.state.subscribe((value) => {
      latestState = value;
    });

    await controller.togglePlayback();

    expect(synth.init).toHaveBeenCalledTimes(1);
    expect(synth.start).toHaveBeenCalledTimes(1);
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(latestState).toMatchObject({
      isPlaying: true,
      audioReady: true,
      audioError: null
    });

    unsubscribe();
  });

  it('stops playback on visibility loss and destroys the synth on teardown', async () => {
    const synth = createMockSynth();
    const cancelFrame = vi.fn();
    const clearScheduledTimeout = vi.fn();
    let handleVisibilityChange = (_hidden: boolean) => {};
    const controller = createNadaVinodamPageController({
      createSynth: () => synth,
      mapFrequency: () => ({
        svara: 'S',
        octave: 'madhya',
        referenceFrequencyHz: 261.63,
        deltaHz: 0
      }),
      requestFrame: vi.fn().mockReturnValue(7),
      cancelFrame,
      scheduleTimeout: vi.fn().mockReturnValue(12),
      clearScheduledTimeout,
      onVisibilityChange: (callback) => {
        handleVisibilityChange = callback;
        return () => {};
      },
      onWindowBlur: () => () => {}
    });

    let latestState: NadaVinodamState | undefined;
    const unsubscribe = controller.state.subscribe((value) => {
      latestState = value;
    });
    const teardown = controller.mount();

    await controller.togglePlayback();
    handleVisibilityChange(true);

    expect(synth.stop).toHaveBeenCalled();
    expect(cancelFrame).toHaveBeenCalledWith(7);
    expect(clearScheduledTimeout).toHaveBeenCalledWith(12);
    expect(latestState).toMatchObject({
      isPlaying: false,
      signalPeak: 0
    });

    teardown();

    expect(synth.destroy).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
