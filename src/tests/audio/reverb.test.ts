import { describe, expect, it, vi } from 'vitest';
import {
  createReverbImpulse,
  fillNoiseDecayChannel,
  getReverbDurationSeconds,
  REVERB_IR_CHANNELS,
  REVERB_IR_DURATIONS
} from '../../domain/audio/reverb';
import type { ReverbPreset } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';

function createMockAudioBuffer(
  channelCount: number,
  length: number,
  rate: number,
  channels: Float32Array[]
): AudioBuffer {
  return {
    numberOfChannels: channelCount,
    length,
    sampleRate: rate,
    duration: length / rate,
    getChannelData: (ch: number) => channels[ch] ?? new Float32Array(length),
    copyFromChannel: () => undefined,
    copyToChannel: () => undefined
  } as AudioBuffer;
}

/** Typed ReverbAudioContext mock with full AudioBuffer methods (PGF-004). */
function createMockAudioContext(sampleRate = 44100) {
  const channels: Float32Array[] = [];
  const createBuffer = vi.fn((channelCount: number, length: number, rate: number): AudioBuffer => {
    channels.length = 0;
    for (let c = 0; c < channelCount; c += 1) {
      channels.push(new Float32Array(length));
    }
    return createMockAudioBuffer(channelCount, length, rate, channels);
  });

  return {
    audioContext: { sampleRate, createBuffer },
    channels,
    createBuffer
  };
}

function maxAbs(data: Float32Array): number {
  let max = 0;
  for (let i = 0; i < data.length; i += 1) {
    const a = Math.abs(data[i]);
    if (a > max) max = a;
  }
  return max;
}

describe('reverb IR helper (P2A-02)', () => {
  it('maps presets to planned IR durations', () => {
    expect(getReverbDurationSeconds('room')).toBe(0.8);
    expect(getReverbDurationSeconds('hall')).toBe(2.5);
    expect(getReverbDurationSeconds('concert')).toBe(4);
    expect(REVERB_IR_DURATIONS.room).toBeLessThan(REVERB_IR_DURATIONS.hall);
    expect(REVERB_IR_DURATIONS.hall).toBeLessThan(REVERB_IR_DURATIONS.concert);
  });

  it('fillNoiseDecayChannel writes non-silent decaying noise', () => {
    const data = new Float32Array(2048);
    fillNoiseDecayChannel(data, 'room');

    expect(maxAbs(data)).toBeGreaterThan(0);
    // Head of IR should be louder on average than the tail.
    let head = 0;
    let tail = 0;
    const n = 64;
    for (let i = 0; i < n; i += 1) {
      head += Math.abs(data[i]);
      tail += Math.abs(data[data.length - 1 - i]);
    }
    expect(head).toBeGreaterThan(tail);
  });

  it.each(REVERB_PRESETS as unknown as ReverbPreset[])(
    'createReverbImpulse(%s) builds stereo buffer of expected length',
    (preset) => {
      const sampleRate = 44100;
      const { audioContext, createBuffer, channels } = createMockAudioContext(sampleRate);

      const buffer = createReverbImpulse(audioContext, preset);

      const expectedLength = Math.floor(sampleRate * getReverbDurationSeconds(preset));
      expect(createBuffer).toHaveBeenCalledWith(REVERB_IR_CHANNELS, expectedLength, sampleRate);
      expect(buffer.numberOfChannels).toBe(REVERB_IR_CHANNELS);
      expect(buffer.length).toBe(expectedLength);
      expect(buffer.sampleRate).toBe(sampleRate);
      expect(channels).toHaveLength(REVERB_IR_CHANNELS);

      for (const ch of channels) {
        expect(ch.length).toBe(expectedLength);
        expect(maxAbs(ch)).toBeGreaterThan(0);
      }
    }
  );

  it('uses longer buffers for longer presets', () => {
    const sampleRate = 22050;
    const lengths: number[] = [];

    for (const preset of REVERB_PRESETS) {
      const { audioContext } = createMockAudioContext(sampleRate);
      const buffer = createReverbImpulse(audioContext, preset);
      lengths.push(buffer.length);
    }

    expect(lengths[0]).toBeLessThan(lengths[1]); // room < hall
    expect(lengths[1]).toBeLessThan(lengths[2]); // hall < concert
  });
});
