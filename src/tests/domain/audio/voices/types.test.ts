import { describe, expect, it } from 'vitest';
import type { AudioVoice, VoiceType } from '../../../../domain/audio/audio.types';
import {
  VOICE_TYPES,
  type VoiceCreateContext,
  type VoiceCreateParams,
  type VoiceFactory
} from '../../../../domain/audio/voices/types';

describe('voice types contract (P1A-01)', () => {
  it('exposes the closed VoiceType set used by Phase 1', () => {
    expect(VOICE_TYPES).toEqual(['pure', 'plucked', 'flute', 'bow', 'reed']);
  });

  it('accepts a pure-path AudioVoice shape (single oscillator, no sources list)', () => {
    const pureVoice: AudioVoice = {
      id: 'voice-1',
      oscillator: {} as OscillatorNode,
      envelopeGain: {} as GainNode,
      voiceGain: {} as GainNode,
      frequency: 261.63,
      svara: 'S',
      octave: 'madhya',
      startTime: 0,
      duration: 1,
      stop: () => undefined,
      voiceType: 'pure'
    };

    expect(pureVoice.oscillator).toBeDefined();
    expect(pureVoice.sources).toBeUndefined();
    expect(pureVoice.setFrequency).toBeUndefined();
  });

  it('accepts a multi-source AudioVoice shape without a primary oscillator', () => {
    const multiVoice: AudioVoice = {
      id: 'voice-2',
      sources: [{} as OscillatorNode, {} as OscillatorNode],
      envelopeGain: {} as GainNode,
      voiceGain: {} as GainNode,
      frequency: 293.66,
      svara: 'R2',
      octave: 'madhya',
      startTime: 1,
      duration: 0.5,
      stop: () => undefined,
      setFrequency: () => undefined,
      voiceType: 'plucked'
    };

    expect(multiVoice.oscillator).toBeUndefined();
    expect(multiVoice.sources).toHaveLength(2);
    expect(typeof multiVoice.setFrequency).toBe('function');
  });

  it('types a VoiceFactory with shared context and params', () => {
    const factory: VoiceFactory = (context, params) => {
      const _context: VoiceCreateContext = context;
      const _params: VoiceCreateParams = params;
      const voiceType: VoiceType = 'pure';

      return {
        id: _params.id,
        envelopeGain: {} as GainNode,
        voiceGain: {} as GainNode,
        frequency: _params.frequency,
        svara: _params.svara,
        octave: _params.octave,
        startTime: _params.startTime,
        duration: _params.durationSeconds,
        stop: () => {
          void _context.destination;
        },
        voiceType
      };
    };

    const voice = factory(
      {
        audioContext: {} as AudioContext,
        destination: {} as AudioNode,
        envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.15 },
        waveform: 'sine'
      },
      {
        id: 'voice-3',
        frequency: 329.63,
        startTime: 0,
        durationSeconds: 1,
        velocity: 1,
        svara: 'G3',
        octave: 'madhya'
      }
    );

    expect(voice.id).toBe('voice-3');
    expect(voice.voiceType).toBe('pure');
  });
});
