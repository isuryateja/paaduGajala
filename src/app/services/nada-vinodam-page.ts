import { writable, type Writable } from 'svelte/store';
import { clamp } from '../../lib/utils/clamp';
import { mapFrequencyToClosestSvara, type FrequencySvaraMatch } from '../../domain/pitch/frequency-to-svara';
import { createNadaVinodamSynth } from '../../domain/audio/nada-vinodam-synth';
import { onVisibilityChange, onWindowBlur } from '../../infra/browser/visibility-events';
import type { NadaAnalyserFrame, NadaVinodamState, NadaVinodamSynth, NadaVinodamSynthConfig } from '../../domain/audio/nada-vinodam.types';
import type { WaveformType, Teardown } from '../../domain/shared/types';

const DEFAULT_FREQUENCY = 261.63;
const DEFAULT_GAIN = 0.42;
const DEFAULT_ATTACK = 0.08;
const DEFAULT_RELEASE = 0.4;
const DEFAULT_WAVEFORM: WaveformType = 'square';
const DEFAULT_SUSTAIN = true;
const DEFAULT_ONE_SHOT_DURATION_MS = 1000;
const SCOPE_SAMPLE_POINTS = 48;
const METER_SEGMENTS = 6;

/**
 * Environment-safe timer handle (DOM `number` or Node `Timeout`).
 * Prefer global `setTimeout`/`clearTimeout` so ReturnType stays consistent (PGF-003).
 */
export type TimerHandle = ReturnType<typeof setTimeout>;

export interface NadaVinodamPageController {
  state: Writable<NadaVinodamState>;
  oscilloscopePath: Writable<string>;
  meterLevels: Writable<number[]>;
  setFrequency: (frequencyHz: number) => void;
  setGain: (gain: number) => void;
  setAttack: (attackSeconds: number) => void;
  setRelease: (releaseSeconds: number) => void;
  setWaveform: (waveform: WaveformType) => void;
  setSustainEnabled: (enabled: boolean) => void;
  togglePlayback: () => Promise<void>;
  stopPlayback: () => void;
  mount: () => Teardown;
}

export interface NadaVinodamPageDependencies {
  createSynth: (config: NadaVinodamSynthConfig) => NadaVinodamSynth;
  mapFrequency: (frequencyHz: number) => FrequencySvaraMatch;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  scheduleTimeout: (callback: () => void, delayMs: number) => TimerHandle;
  clearScheduledTimeout: (handle: TimerHandle) => void;
  onVisibilityChange: typeof onVisibilityChange;
  onWindowBlur: typeof onWindowBlur;
}

function getInitialMatch(): FrequencySvaraMatch {
  return mapFrequencyToClosestSvara(DEFAULT_FREQUENCY);
}

export function createIdleOscilloscopePath(): string {
  const points = Array.from({ length: SCOPE_SAMPLE_POINTS }, (_, index) => {
    const x = (index / (SCOPE_SAMPLE_POINTS - 1)) * 100;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} 50.00`;
  });

  return points.join(' ');
}

export function createIdleMeterLevels(): number[] {
  return Array.from({ length: METER_SEGMENTS }, (_, index) => 0.16 + index * 0.06);
}

function createInitialState(): NadaVinodamState {
  const match = getInitialMatch();

  return {
    frequencyHz: DEFAULT_FREQUENCY,
    gain: DEFAULT_GAIN,
    attackSeconds: DEFAULT_ATTACK,
    releaseSeconds: DEFAULT_RELEASE,
    waveform: DEFAULT_WAVEFORM,
    sustainEnabled: DEFAULT_SUSTAIN,
    isPlaying: false,
    mappedSvara: match.svara,
    mappedOctave: match.octave,
    signalPeak: 0,
    audioReady: false,
    audioError: null
  };
}

function buildOscilloscopePath(frame: NadaAnalyserFrame): string {
  const step = Math.max(1, Math.floor(frame.timeDomain.length / SCOPE_SAMPLE_POINTS));
  const points: string[] = [];

  for (let index = 0; index < SCOPE_SAMPLE_POINTS; index += 1) {
    const sample = frame.timeDomain[Math.min(frame.timeDomain.length - 1, index * step)] ?? 0;
    const x = (index / (SCOPE_SAMPLE_POINTS - 1)) * 100;
    const y = 50 - clamp(sample, -1, 1) * 34;
    points.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(' ');
}

function buildMeterLevels(frame: NadaAnalyserFrame): number[] {
  const samplesPerSegment = Math.max(1, Math.floor(frame.timeDomain.length / METER_SEGMENTS));

  return Array.from({ length: METER_SEGMENTS }, (_, segmentIndex) => {
    let segmentPeak = 0;
    const start = segmentIndex * samplesPerSegment;
    const end = Math.min(frame.timeDomain.length, start + samplesPerSegment);

    for (let index = start; index < end; index += 1) {
      segmentPeak = Math.max(segmentPeak, Math.abs(frame.timeDomain[index] ?? 0));
    }

    return clamp(segmentPeak, 0.12, 1);
  });
}

export function createNadaVinodamPageController(
  dependencies: NadaVinodamPageDependencies = {
    createSynth: createNadaVinodamSynth,
    mapFrequency: mapFrequencyToClosestSvara,
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    scheduleTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
    clearScheduledTimeout: (handle) => clearTimeout(handle),
    onVisibilityChange,
    onWindowBlur
  }
): NadaVinodamPageController {
  let currentState = createInitialState();
  let animationFrame: number | null = null;
  let autoStopTimer: TimerHandle | null = null;
  let isStarting = false;

  const state = writable<NadaVinodamState>(currentState);
  const oscilloscopePath = writable<string>(createIdleOscilloscopePath());
  const meterLevels = writable<number[]>(createIdleMeterLevels());
  const synth = dependencies.createSynth({
    frequencyHz: currentState.frequencyHz,
    gain: currentState.gain,
    attackSeconds: currentState.attackSeconds,
    releaseSeconds: currentState.releaseSeconds,
    waveform: currentState.waveform,
    sustainEnabled: currentState.sustainEnabled,
    oneShotDurationMs: DEFAULT_ONE_SHOT_DURATION_MS
  });

  function patchState(patch: Partial<NadaVinodamState>): void {
    currentState = { ...currentState, ...patch };
    state.set(currentState);
  }

  function updateMappedSvara(frequencyHz: number): void {
    const match = dependencies.mapFrequency(frequencyHz);
    patchState({
      frequencyHz,
      mappedSvara: match.svara,
      mappedOctave: match.octave
    });
  }

  function resetVisuals(): void {
    oscilloscopePath.set(createIdleOscilloscopePath());
    meterLevels.set(createIdleMeterLevels());
    patchState({ signalPeak: 0 });
  }

  function stopVisualLoop(): void {
    if (animationFrame !== null) {
      dependencies.cancelFrame(animationFrame);
      animationFrame = null;
    }
  }

  function clearAutoStopTimer(): void {
    if (autoStopTimer !== null) {
      dependencies.clearScheduledTimeout(autoStopTimer);
      autoStopTimer = null;
    }
  }

  function scheduleAutoStop(): void {
    clearAutoStopTimer();

    if (currentState.sustainEnabled) {
      return;
    }

    const releaseTailMs = Math.round(currentState.releaseSeconds * 1000);
    autoStopTimer = dependencies.scheduleTimeout(() => {
      stopPlayback();
    }, DEFAULT_ONE_SHOT_DURATION_MS + releaseTailMs);
  }

  function startVisualLoop(): void {
    stopVisualLoop();

    const draw = () => {
      if (!currentState.isPlaying) {
        animationFrame = null;
        return;
      }

      const frame = synth.readAnalyserFrame();
      if (frame) {
        oscilloscopePath.set(buildOscilloscopePath(frame));
        meterLevels.set(buildMeterLevels(frame));
        patchState({ signalPeak: frame.peak });
      } else {
        resetVisuals();
      }

      animationFrame = dependencies.requestFrame(draw);
    };

    animationFrame = dependencies.requestFrame(draw);
  }

  function setFrequency(frequencyHz: number): void {
    const next = clamp(frequencyHz, 80, 880);
    synth.setFrequency(next);
    updateMappedSvara(next);
  }

  function setGain(gain: number): void {
    const next = clamp(gain, 0, 1);
    synth.setGain(next);
    patchState({ gain: next });
  }

  function setAttack(attackSeconds: number): void {
    const next = clamp(attackSeconds, 0.005, 2);
    synth.setEnvelope({ attackSeconds: next, releaseSeconds: currentState.releaseSeconds });
    patchState({ attackSeconds: next });
  }

  function setRelease(releaseSeconds: number): void {
    const next = clamp(releaseSeconds, 0.01, 3);
    synth.setEnvelope({ attackSeconds: currentState.attackSeconds, releaseSeconds: next });
    patchState({ releaseSeconds: next });

    if (currentState.isPlaying && !currentState.sustainEnabled) {
      scheduleAutoStop();
    }
  }

  function setWaveform(waveform: WaveformType): void {
    synth.setWaveform(waveform);
    patchState({ waveform });
  }

  function setSustainEnabled(enabled: boolean): void {
    synth.setSustainEnabled(enabled);
    patchState({ sustainEnabled: enabled });

    if (!currentState.isPlaying) {
      clearAutoStopTimer();
      return;
    }

    if (enabled) {
      clearAutoStopTimer();
    } else {
      scheduleAutoStop();
    }
  }

  function stopPlayback(): void {
    clearAutoStopTimer();
    synth.stop();
    stopVisualLoop();
    patchState({
      isPlaying: false,
      signalPeak: 0
    });
    resetVisuals();
  }

  async function togglePlayback(): Promise<void> {
    if (isStarting) {
      return;
    }

    if (currentState.isPlaying) {
      stopPlayback();
      return;
    }

    isStarting = true;
    patchState({ audioError: null });

    try {
      await synth.init();
      await synth.start();
      patchState({
        audioReady: true,
        audioError: null,
        isPlaying: true
      });
      scheduleAutoStop();
      startVisualLoop();
    } catch (error) {
      stopVisualLoop();
      resetVisuals();
      patchState({
        isPlaying: false,
        audioReady: false,
        audioError: error instanceof Error ? error.message : 'Unable to start audio.'
      });
    } finally {
      isStarting = false;
    }
  }

  function mount(): Teardown {
    const removeVisibilityListener = dependencies.onVisibilityChange((hidden) => {
      if (hidden) {
        stopPlayback();
      }
    });
    const removeWindowBlurListener = dependencies.onWindowBlur(stopPlayback);

    return () => {
      stopPlayback();
      stopVisualLoop();
      clearAutoStopTimer();
      removeVisibilityListener();
      removeWindowBlurListener();
      synth.destroy();
    };
  }

  return {
    state,
    oscilloscopePath,
    meterLevels,
    setFrequency,
    setGain,
    setAttack,
    setRelease,
    setWaveform,
    setSustainEnabled,
    togglePlayback,
    stopPlayback,
    mount
  };
}
