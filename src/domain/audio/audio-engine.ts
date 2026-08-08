import {
  DEFAULT_REVERB_MIX,
  DEFAULT_REVERB_PRESET,
  DEFAULT_TEMPO,
  DEFAULT_TUNING,
  DEFAULT_VOLUME,
  DEFAULT_WAVEFORM,
  MAX_TEMPO,
  MIN_TEMPO
} from '../shared/constants';
import { clamp } from '../../lib/utils/clamp';
import { createId } from '../../lib/ids/create-id';
import { BASE_SA_FREQUENCY, JUST_INTONATION_RATIOS, getSvaraFrequency } from '../pitch/svara-frequencies';
import type { OctaveName, TuningMode, WaveformType } from '../shared/types';
import type {
  AudioEngineConfig,
  AudioVoice,
  ReverbPreset,
  SequenceBoundary,
  SequenceItem,
  SequenceNote,
  SequenceSilence,
  SequenceState,
  VoiceType
} from './audio.types';
import { REVERB_PRESETS } from './audio.types';
import { createReverbImpulse } from './reverb';
import { createVoiceByType } from './voices';

/**
 * Click-safe IR swap timing (PGF-012).
 * Wet is held at 0 for HOLD, then ramps back over RESTORE — never duck+restore at the same `currentTime`.
 */
export const REVERB_IR_SWAP_HOLD_SECONDS = 0.012;
export const REVERB_IR_SWAP_RESTORE_SECONDS = 0.02;

type EngineEvent = 'noteOn' | 'noteOff' | 'noteIndex' | 'sequenceStart' | 'sequenceEnd' | 'ready';

function isSequenceBoundary(item: SequenceItem): item is SequenceBoundary {
  return item.type === 'boundary';
}

function isSequenceSilence(item: SequenceItem): item is SequenceSilence {
  return item.type === 'silence';
}

export class AudioEngine {
  audioContext: AudioContext | null = null;
  isInitialized = false;
  masterGain: GainNode | null = null;
  compressor: DynamicsCompressorNode | null = null;
  /** Shared mix bus — all voices land here (P2A-04); splits dry + reverb send. */
  voiceBus: GainNode | null = null;
  /** Unity send into the convolver (mix is applied on wet/dry gains). */
  sendGain: GainNode | null = null;
  dryGain: GainNode | null = null;
  wetGain: GainNode | null = null;
  convolver: ConvolverNode | null = null;
  activeVoices = new Map<string, AudioVoice>();
  currentSequence: SequenceState | null = null;
  sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  sequenceEventTimeouts = new Set<ReturnType<typeof setTimeout>>();
  tempo = DEFAULT_TEMPO;
  beatDuration = 60 / DEFAULT_TEMPO;
  config: AudioEngineConfig;
  private eventListeners: Record<EngineEvent, Array<(data: unknown) => void>> = {
    noteOn: [],
    noteOff: [],
    noteIndex: [],
    sequenceStart: [],
    sequenceEnd: [],
    ready: []
  };

  constructor(options: Partial<AudioEngineConfig> = {}) {
    this.config = {
      waveform: options.waveform ?? DEFAULT_WAVEFORM,
      envelope: {
        attack: options.envelope?.attack ?? 0.02,
        decay: options.envelope?.decay ?? 0.05,
        sustain: options.envelope?.sustain ?? 0.7,
        release: options.envelope?.release ?? 0.15
      },
      masterVolume: options.masterVolume ?? DEFAULT_VOLUME,
      tuning: options.tuning ?? DEFAULT_TUNING,
      baseFrequency: options.baseFrequency ?? BASE_SA_FREQUENCY,
      voiceType: options.voiceType ?? 'pure',
      // P2B-03 ship default: light room wet; set mix 0 for dry-identical Phase A path.
      reverbMix: clamp(options.reverbMix ?? DEFAULT_REVERB_MIX, 0, 1),
      reverbPreset: options.reverbPreset ?? DEFAULT_REVERB_PRESET
    };
  }

  async init(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API not supported in this browser');
    }

    this.audioContext = new AudioContextClass({ latencyHint: 'interactive', sampleRate: 44100 });
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.config.masterVolume;
    this.masterGain.connect(this.audioContext.destination);
    this.buildReverbGraph();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isInitialized = true;
    this.emit('ready', { audioContext: this.audioContext });
    return true;
  }

  /**
   * Shared convolution reverb bus (P2A-03):
   *   voiceBus → compressor → dryGain → master
   *   voiceBus → sendGain → convolver → wetGain → master
   *
   * Voice routing onto `voiceBus` lands in P2A-04; graph is ready at mix 0 (silent wet).
   */
  private buildReverbGraph(): void {
    if (!this.audioContext || !this.masterGain) {
      return;
    }

    this.voiceBus = this.audioContext.createGain();
    this.voiceBus.gain.value = 1;

    this.compressor = this.audioContext.createDynamicsCompressor();
    this.dryGain = this.audioContext.createGain();

    this.sendGain = this.audioContext.createGain();
    this.sendGain.gain.value = 1;
    this.convolver = this.audioContext.createConvolver();
    this.wetGain = this.audioContext.createGain();

    // Dry path
    this.voiceBus.connect(this.compressor);
    this.compressor.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    // Wet / reverb send path
    this.voiceBus.connect(this.sendGain);
    this.sendGain.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.masterGain);

    this.loadReverbImpulse();
    this.applyReverbMixGains();
  }

  private loadReverbImpulse(): void {
    if (!this.audioContext || !this.convolver) {
      return;
    }
    this.convolver.buffer = createReverbImpulse(this.audioContext, this.config.reverbPreset);
  }

  /** Linear crossfade: mix 0 = fully dry (Phase A sound-identical), mix 1 = fully wet. */
  private applyReverbMixGains(): void {
    const mix = this.config.reverbMix;
    const dry = 1 - mix;
    const now = this.audioContext?.currentTime;
    if (this.wetGain) {
      this.wetGain.gain.value = mix;
      if (now !== undefined) {
        this.wetGain.gain.setValueAtTime(mix, now);
      }
    }
    if (this.dryGain) {
      this.dryGain.gain.value = dry;
      if (now !== undefined) {
        this.dryGain.gain.setValueAtTime(dry, now);
      }
    }
  }

  on(event: EngineEvent, callback: (data: unknown) => void): () => void {
    this.eventListeners[event].push(callback);
    return () => {
      this.eventListeners[event] = this.eventListeners[event].filter((listener) => listener !== callback);
    };
  }

  getFrequency(svara: string, octave: OctaveName = 'madhya'): number {
    if (this.config.tuning === 'equal') {
      return getSvaraFrequency(svara, octave);
    }
    const normalizedOctave = octave === 'mandara' ? 'mandra' : octave;
    const ratio = JUST_INTONATION_RATIOS[svara]?.ratio ?? 1;
    const octaveMultiplier = normalizedOctave === 'mandra' ? 0.5 : normalizedOctave === 'taara' ? 2 : 1;
    return this.config.baseFrequency * ratio * octaveMultiplier;
  }

  playSvara(svara: string, octave: OctaveName = 'madhya', duration: number = 1, velocity: number = 1, when: number | null = null): AudioVoice | null {
    if (!this.isInitialized || !this.audioContext) {
      return null;
    }

    const startTime = when ?? this.audioContext.currentTime;
    const durationSeconds = duration * this.beatDuration;
    const voice = this.createVoice(this.getFrequency(svara, octave), startTime, durationSeconds, velocity, svara, octave);
    const emitTime = Math.max(0, (startTime - this.audioContext.currentTime) * 1000);
    setTimeout(() => {
      this.emit('noteOn', { svara, octave, frequency: voice.frequency, voiceId: voice.id, startTime, duration: durationSeconds });
    }, emitTime);

    setTimeout(() => {
      this.emit('noteOff', { svara, octave, voiceId: voice.id });
    }, emitTime + durationSeconds * 1000);

    return voice;
  }

  startSvara(svara: string, octave: OctaveName = 'madhya', velocity: number = 1, when: number | null = null, maxDurationSeconds: number = 120): AudioVoice | null {
    if (!this.isInitialized || !this.audioContext) {
      return null;
    }
    const startTime = when ?? this.audioContext.currentTime;
    const voice = this.createVoice(this.getFrequency(svara, octave), startTime, maxDurationSeconds, velocity, svara, octave);
    this.emit('noteOn', { svara, octave, frequency: voice.frequency, voiceId: voice.id, startTime, duration: maxDurationSeconds, sustained: true });
    return voice;
  }

  stopVoice(voiceOrId: string | AudioVoice | null, when: number | null = null): boolean {
    if (!voiceOrId) {
      return false;
    }

    const voice = typeof voiceOrId === 'string' ? this.activeVoices.get(voiceOrId) : voiceOrId;
    if (!voice) {
      return false;
    }

    voice.stop(when ?? this.audioContext?.currentTime);
    this.emit('noteOff', { svara: voice.svara, octave: voice.octave, voiceId: voice.id });
    return true;
  }

  playSequence(notes: SequenceItem[], tempo: number = DEFAULT_TEMPO, options: { loop?: boolean; loopCount?: number } = {}): SequenceState | null {
    if (!this.isInitialized || !this.audioContext) {
      return null;
    }

    this.stopSequence();
    this.setTempo(tempo);

    const { loop = false, loopCount = Infinity } = options;
    let currentLoop = 0;
    let cancelled = false;

    const sequence: SequenceState = {
      notes,
      tempo,
      loop,
      loopCount,
      currentIndex: 0,
      isPlaying: true,
      cancel: () => {
        cancelled = true;
      }
    };

    const schedule = () => {
      if (!this.audioContext || cancelled) {
        return;
      }

      let cursor = this.audioContext.currentTime;
      let hasScheduledPlayableContent = false;

      for (let index = 0; index < notes.length; index += 1) {
        const note = notes[index];
        if (isSequenceBoundary(note)) {
          if (note.boundaryKind === 'phrase' && hasScheduledPlayableContent) {
            cursor += this.beatDuration;
          }
          continue;
        }

        if (isSequenceSilence(note)) {
          cursor += note.duration * this.beatDuration;
          continue;
        }

        if (note.rest) {
          hasScheduledPlayableContent = true;
          cursor += (note.duration ?? 1) * this.beatDuration;
          continue;
        }

        this.scheduleSequenceNoteIndex(note, cursor, index);
        this.playSvara(note.svara, note.octave ?? 'madhya', note.duration ?? 1, note.velocity ?? 1, cursor);
        hasScheduledPlayableContent = true;
        cursor += (note.duration ?? 1) * this.beatDuration;
      }

      const durationMs = Math.max(0, (cursor - this.audioContext.currentTime) * 1000);
      if (loop && currentLoop < loopCount - 1 && !cancelled) {
        currentLoop += 1;
        this.sequenceTimeout = setTimeout(schedule, durationMs);
      } else {
        this.sequenceTimeout = setTimeout(() => {
          sequence.isPlaying = false;
          this.currentSequence = null;
          this.emit('sequenceEnd', { notes, tempo, cancelled });
        }, durationMs);
      }
    };

    this.currentSequence = sequence;
    this.emit('sequenceStart', { notes, tempo });
    schedule();
    return sequence;
  }

  stopSequence(): void {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
    this.clearSequenceEventTimeouts();
    if (this.currentSequence) {
      this.currentSequence.cancel();
      this.currentSequence.isPlaying = false;
      this.emit('sequenceEnd', { cancelled: true });
      this.currentSequence = null;
    }
  }

  stopAll(): void {
    this.stopSequence();
    this.activeVoices.forEach((voice) => this.stopVoice(voice, this.audioContext?.currentTime ?? null));
    this.activeVoices.clear();
  }

  setTempo(bpm: number): void {
    this.tempo = clamp(bpm, MIN_TEMPO, MAX_TEMPO);
    this.beatDuration = 60 / this.tempo;
  }

  setVolume(volume: number): void {
    this.config.masterVolume = clamp(volume, 0, 1);
    if (this.masterGain) {
      this.masterGain.gain.value = this.config.masterVolume;
    }
  }

  setEnvelope(envelope: Partial<AudioEngineConfig['envelope']>): void {
    this.config.envelope = { ...this.config.envelope, ...envelope };
  }

  /**
   * Manual waveform picker path: set waveform and force pure single-osc voice.
   * Instrument presets re-apply `voiceType` after calling this (see applyPreset).
   */
  setWaveform(waveform: WaveformType): void {
    this.config.waveform = waveform;
    this.config.voiceType = 'pure';
  }

  setVoiceType(voiceType: VoiceType): void {
    this.config.voiceType = voiceType;
  }

  /**
   * Wet reverb send (0..1). Clamped. Updates wet/dry gains when the graph exists.
   */
  setReverbMix(mix: number): void {
    this.config.reverbMix = clamp(mix, 0, 1);
    this.applyReverbMixGains();
  }

  /**
   * Select IR preset and reload the convolver buffer when initialized.
   * Same-preset is a no-op (avoids buffer thrash / clicks).
   *
   * Click-safe swap (PGF-012): duck wet immediately, hold muted while `convolver.buffer`
   * is replaced, then ramp wet back to the current mix over a short restore window.
   * Dry gain is left alone so the dry path stays continuous through the swap.
   */
  setReverbPreset(preset: ReverbPreset): void {
    if (!REVERB_PRESETS.includes(preset)) {
      return;
    }
    if (preset === this.config.reverbPreset) {
      return;
    }
    this.config.reverbPreset = preset;
    if (!this.audioContext || !this.convolver) {
      return;
    }

    const now = this.audioContext.currentTime;
    const mix = this.config.reverbMix;
    const restoreStart = now + REVERB_IR_SWAP_HOLD_SECONDS;
    const restoreEnd = restoreStart + REVERB_IR_SWAP_RESTORE_SECONDS;

    if (this.wetGain) {
      const wetParam = this.wetGain.gain;
      wetParam.cancelScheduledValues(now);
      // Instant duck + explicit hold so restore cannot land at the same automation time.
      wetParam.setValueAtTime(0, now);
      wetParam.value = 0;
      wetParam.setValueAtTime(0, restoreStart);
      wetParam.linearRampToValueAtTime(mix, restoreEnd);
    }

    this.loadReverbImpulse();
    // Do not call applyReverbMixGains() — that would re-raise wet at `now` and cancel the hold.
  }

  setTuning(tuning: TuningMode): void {
    this.config.tuning = tuning;
  }

  private scheduleSequenceNoteIndex(note: SequenceNote, when: number, index: number): void {
    if (!this.audioContext) {
      return;
    }

    const emitDelay = Math.max(0, (when - this.audioContext.currentTime) * 1000);
    const timeout = setTimeout(() => {
      this.sequenceEventTimeouts.delete(timeout);
      this.emit('noteIndex', {
        index: note.originalIndex ?? index,
        svara: note.svara,
        octave: note.octave ?? 'madhya'
      });
    }, emitDelay);

    this.sequenceEventTimeouts.add(timeout);
  }

  private clearSequenceEventTimeouts(): void {
    this.sequenceEventTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.sequenceEventTimeouts.clear();
  }

  private createVoice(
    frequency: number,
    startTime: number,
    durationSeconds: number,
    velocity: number,
    svara: string,
    octave: OctaveName
  ): AudioVoice {
    // All voices land on voiceBus so they feed dry + reverb send (P2A-04).
    if (!this.audioContext || !this.voiceBus) {
      throw new Error('Audio engine is not initialized');
    }

    const id = createId('voice');
    // Unimplemented instrument types fall back to pure inside the dispatcher (Phase B).
    const voice = createVoiceByType(
      this.config.voiceType,
      {
        audioContext: this.audioContext,
        destination: this.voiceBus,
        envelope: this.config.envelope,
        waveform: this.config.waveform,
        onEnded: (voiceId) => {
          this.activeVoices.delete(voiceId);
        }
      },
      {
        id,
        frequency,
        startTime,
        durationSeconds,
        velocity,
        svara,
        octave
      }
    );

    this.activeVoices.set(id, voice);
    return voice;
  }

  private emit(event: EngineEvent, data: unknown): void {
    this.eventListeners[event].forEach((listener) => listener(data));
  }
}
