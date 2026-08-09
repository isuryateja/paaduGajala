import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AudioEngine,
  REVERB_IR_SWAP_HOLD_SECONDS,
  REVERB_IR_SWAP_RESTORE_SECONDS
} from '../../domain/audio/audio-engine';
import { getReverbDurationSeconds } from '../../domain/audio/reverb';
import type { ReverbPreset } from '../../domain/audio/audio.types';

type Connectable = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

function createGainNodeMock(): Connectable & {
  gain: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
    linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    cancelScheduledValues: ReturnType<typeof vi.fn>;
  };
} {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn()
    },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createCompressorMock(): Connectable {
  return {
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createConvolverMock(): Connectable & {
  buffer: AudioBuffer | null;
} {
  return {
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

/**
 * Minimal AudioContext mock so AudioEngine.init can build the reverb graph in jsdom.
 */
function installMockAudioContext(sampleRate = 44100): {
  gains: ReturnType<typeof createGainNodeMock>[];
  compressors: ReturnType<typeof createCompressorMock>[];
  convolvers: ReturnType<typeof createConvolverMock>[];
  destination: Connectable;
  AudioContextMock: new (options?: AudioContextOptions) => AudioContext;
} {
  const gains: ReturnType<typeof createGainNodeMock>[] = [];
  const compressors: ReturnType<typeof createCompressorMock>[] = [];
  const convolvers: ReturnType<typeof createConvolverMock>[] = [];
  const destination = { connect: vi.fn(), disconnect: vi.fn() };

  class AudioContextMock {
    sampleRate = sampleRate;
    state: AudioContextState = 'running';
    destination = destination as unknown as AudioDestinationNode;
    currentTime = 0;

    createGain() {
      const node = createGainNodeMock();
      gains.push(node);
      return node as unknown as GainNode;
    }

    createDynamicsCompressor() {
      const node = createCompressorMock();
      compressors.push(node);
      return node as unknown as DynamicsCompressorNode;
    }

    createConvolver() {
      const node = createConvolverMock();
      convolvers.push(node);
      return node as unknown as ConvolverNode;
    }

    createBuffer(channelCount: number, length: number, rate: number): AudioBuffer {
      const channels = Array.from({ length: channelCount }, () => new Float32Array(length));
      return {
        numberOfChannels: channelCount,
        length,
        sampleRate: rate,
        duration: length / rate,
        getChannelData: (ch: number) => channels[ch]
      } as AudioBuffer;
    }

    resume = vi.fn(async () => {
      this.state = 'running';
    });
  }

  // @ts-expect-error — test double for window.AudioContext
  window.AudioContext = AudioContextMock;
  // @ts-expect-error — safari alias
  window.webkitAudioContext = undefined;

  return {
    gains,
    compressors,
    convolvers,
    destination,
    AudioContextMock: AudioContextMock as unknown as new (options?: AudioContextOptions) => AudioContext
  };
}

describe('reverb graph in engine init (P2A-03)', () => {
  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.AudioContext;
    // @ts-expect-error cleanup
    delete window.webkitAudioContext;
  });

  it('builds voiceBus dry + wet paths and loads room IR by default', async () => {
    const mock = installMockAudioContext();
    const engine = new AudioEngine();

    await engine.init();

    expect(engine.isInitialized).toBe(true);
    expect(engine.voiceBus).not.toBeNull();
    expect(engine.compressor).not.toBeNull();
    expect(engine.dryGain).not.toBeNull();
    expect(engine.sendGain).not.toBeNull();
    expect(engine.convolver).not.toBeNull();
    expect(engine.wetGain).not.toBeNull();
    expect(engine.masterGain).not.toBeNull();

    // masterGain first createGain call; then voiceBus, dry, send, wet
    expect(mock.gains.length).toBeGreaterThanOrEqual(5);
    expect(mock.compressors).toHaveLength(1);
    expect(mock.convolvers).toHaveLength(1);

    // Dry: voiceBus → compressor → dry → master
    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.compressor);
    expect(engine.compressor!.connect).toHaveBeenCalledWith(engine.dryGain);
    expect(engine.dryGain!.connect).toHaveBeenCalledWith(engine.masterGain);

    // Wet: voiceBus → send → convolver → wet → master
    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.sendGain);
    expect(engine.sendGain!.connect).toHaveBeenCalledWith(engine.convolver);
    expect(engine.convolver!.connect).toHaveBeenCalledWith(engine.wetGain);
    expect(engine.wetGain!.connect).toHaveBeenCalledWith(engine.masterGain);

    // Master out
    expect(engine.masterGain!.connect).toHaveBeenCalledWith(engine.audioContext!.destination);

    // Ship default mix 0.25 (P2B-03)
    expect(engine.config.reverbMix).toBe(0.25);
    expect(engine.wetGain!.gain.value).toBe(0.25);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.75);

    // IR loaded for default room preset
    expect(engine.convolver!.buffer).not.toBeNull();
    const expectedLength = Math.floor(44100 * getReverbDurationSeconds('room'));
    expect(engine.convolver!.buffer!.length).toBe(expectedLength);
    expect(engine.convolver!.buffer!.numberOfChannels).toBe(2);
  });

  it('setReverbMix updates wet and dry gains after init', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    engine.setReverbMix(0.4);
    expect(engine.config.reverbMix).toBe(0.4);
    expect(engine.wetGain!.gain.value).toBe(0.4);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.6);

    engine.setReverbMix(1);
    expect(engine.wetGain!.gain.value).toBe(1);
    expect(engine.dryGain!.gain.value).toBe(0);

    engine.setReverbMix(0);
    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.dryGain!.gain.value).toBe(1);
  });

  it('constructor reverbMix is applied on init gains', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0.25, reverbPreset: 'hall' });
    await engine.init();

    expect(engine.wetGain!.gain.value).toBe(0.25);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.75);
    expect(engine.config.reverbPreset).toBe('hall');

    const expectedLength = Math.floor(44100 * getReverbDurationSeconds('hall'));
    expect(engine.convolver!.buffer!.length).toBe(expectedLength);
  });

  it('setReverbPreset reloads convolver IR buffer', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    const roomLength = engine.convolver!.buffer!.length;

    engine.setReverbPreset('concert');
    expect(engine.config.reverbPreset).toBe('concert');
    const concertLength = Math.floor(44100 * getReverbDurationSeconds('concert' as ReverbPreset));
    expect(engine.convolver!.buffer!.length).toBe(concertLength);
    expect(engine.convolver!.buffer!.length).toBeGreaterThan(roomLength);

    engine.setReverbPreset('hall');
    expect(engine.convolver!.buffer!.length).toBe(Math.floor(44100 * getReverbDurationSeconds('hall')));
  });

  it('setReverbPreset same value is a no-op (P2B-03 glitch polish)', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    const bufferBefore = engine.convolver!.buffer;
    engine.setReverbPreset('room');
    expect(engine.convolver!.buffer).toBe(bufferBefore);
    expect(engine.config.reverbPreset).toBe('room');
  });

  it('setReverbPreset preserves reverbMix after IR swap (P2B-03)', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0.4 });
    await engine.init();

    engine.setReverbPreset('hall');
    expect(engine.config.reverbMix).toBe(0.4);
    // Wet is ducked immediately; restore is scheduled (see PGF-012). Dry stays continuous.
    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.6);
    expect(engine.config.reverbPreset).toBe('hall');
  });

  it('setReverbPreset ducks wet, holds, then restores mix after IR swap (PGF-012)', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0.4 });
    await engine.init();

    const wet = engine.wetGain!.gain;
    vi.clearAllMocks();
    wet.value = 0.4;

    engine.setReverbPreset('hall');

    // Buffer swapped while wet is muted.
    expect(engine.convolver!.buffer!.length).toBe(
      Math.floor(44100 * getReverbDurationSeconds('hall'))
    );
    expect(engine.config.reverbMix).toBe(0.4);
    expect(wet.value).toBe(0);

    expect(wet.cancelScheduledValues).toHaveBeenCalledWith(0);
    // Duck at t=0 and hold at restoreStart — not a same-time duck+restore.
    expect(wet.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(wet.setValueAtTime).toHaveBeenCalledWith(0, REVERB_IR_SWAP_HOLD_SECONDS);
    const restoreEnd = REVERB_IR_SWAP_HOLD_SECONDS + REVERB_IR_SWAP_RESTORE_SECONDS;
    expect(wet.linearRampToValueAtTime).toHaveBeenCalledWith(0.4, restoreEnd);
    // Restore end must be strictly after duck time (the original defect was same-time restore).
    expect(restoreEnd).toBeGreaterThan(0);
    // Dry path not touched by IR swap.
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.6);
  });

  it('setReverbMix / setReverbPreset before init only update config', () => {
    const engine = new AudioEngine();
    engine.setReverbMix(0.5);
    engine.setReverbPreset('concert');

    expect(engine.config.reverbMix).toBe(0.5);
    expect(engine.config.reverbPreset).toBe('concert');
    expect(engine.wetGain).toBeNull();
    expect(engine.convolver).toBeNull();
  });

  it('init is idempotent — second call does not rebuild graph', async () => {
    const mock = installMockAudioContext();
    const engine = new AudioEngine();

    await engine.init();
    const firstBus = engine.voiceBus;
    const firstConvolver = engine.convolver;
    const gainCount = mock.gains.length;

    await engine.init();
    expect(engine.voiceBus).toBe(firstBus);
    expect(engine.convolver).toBe(firstConvolver);
    expect(mock.gains.length).toBe(gainCount);
  });

  it('playSvara routes voiceGain to voiceBus so notes feed dry + send (P2A-04)', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    // After full init graph exists; add createOscillator for pure voice path.
    const oscillators: Array<{
      type: OscillatorType;
      frequency: { value: number; setValueAtTime: ReturnType<typeof vi.fn> };
      connect: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      onended: (() => void) | null;
    }> = [];
    engine.audioContext!.createOscillator = vi.fn(() => {
      const osc = {
        type: 'sine' as OscillatorType,
        frequency: { value: 0, setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null as (() => void) | null
      };
      oscillators.push(osc);
      return osc as unknown as OscillatorNode;
    });

    const voice = engine.playSvara('S', 'madhya', 0.5, 0.8);
    expect(voice).not.toBeNull();
    expect(voice!.voiceGain.connect).toHaveBeenCalledWith(engine.voiceBus);
    // Not connected directly to compressor — bus owns the dry/wet split.
    expect(voice!.voiceGain.connect).not.toHaveBeenCalledWith(engine.compressor);
    expect(oscillators[0].start).toHaveBeenCalled();
  });
});
