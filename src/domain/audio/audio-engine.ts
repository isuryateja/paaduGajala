import { DEFAULT_TEMPO, DEFAULT_TUNING, DEFAULT_VOLUME, DEFAULT_WAVEFORM } from '../shared/constants';
import { clamp } from '../../lib/utils/clamp';
import { createId } from '../../lib/ids/create-id';
import { BASE_SA_FREQUENCY, JUST_INTONATION_RATIOS, getSvaraFrequency } from '../pitch/svara-frequencies';
import type { OctaveName, TuningMode, WaveformType } from '../shared/types';
import type { AudioEngineConfig, AudioVoice, SequenceNote, SequenceState } from './audio.types';

type EngineEvent = 'noteOn' | 'noteOff' | 'noteIndex' | 'sequenceStart' | 'sequenceEnd' | 'ready';

export class AudioEngine {
  audioContext: AudioContext | null = null;
  isInitialized = false;
  masterGain: GainNode | null = null;
  compressor: DynamicsCompressorNode | null = null;
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
      baseFrequency: options.baseFrequency ?? BASE_SA_FREQUENCY
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
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isInitialized = true;
    this.emit('ready', { audioContext: this.audioContext });
    return true;
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

  playSequence(notes: SequenceNote[], tempo: number = DEFAULT_TEMPO, options: { loop?: boolean; loopCount?: number } = {}): SequenceState | null {
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
      for (let index = 0; index < notes.length; index += 1) {
        const note = notes[index];
        if (note.rest) {
          cursor += (note.duration ?? 1) * this.beatDuration;
          continue;
        }

        this.scheduleSequenceNoteIndex(note, cursor, index);
        this.playSvara(note.svara, note.octave ?? 'madhya', note.duration ?? 1, note.velocity ?? 1, cursor);
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
    this.tempo = clamp(bpm, 30, 300);
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

  setWaveform(waveform: WaveformType): void {
    this.config.waveform = waveform;
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
    if (!this.audioContext || !this.compressor) {
      throw new Error('Audio engine is not initialized');
    }

    const oscillator = this.audioContext.createOscillator();
    const envelopeGain = this.audioContext.createGain();
    const voiceGain = this.audioContext.createGain();
    const id = createId('voice');

    oscillator.type = this.config.waveform;
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = clamp(velocity, 0, 1);

    const attackEnd = startTime + this.config.envelope.attack;
    const decayEnd = attackEnd + this.config.envelope.decay;
    envelopeGain.gain.setValueAtTime(0.0001, startTime);
    envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
    envelopeGain.gain.linearRampToValueAtTime(this.config.envelope.sustain, decayEnd);

    oscillator.connect(envelopeGain);
    envelopeGain.connect(voiceGain);
    voiceGain.connect(this.compressor);

    const stop = (when: number = startTime + durationSeconds) => {
      const currentTime = this.audioContext?.currentTime ?? when;
      const releaseStart = Math.max(when, currentTime);

      if (releaseStart <= startTime) {
        envelopeGain.gain.cancelScheduledValues(startTime);
        envelopeGain.gain.setValueAtTime(0.0001, startTime);
        oscillator.stop(startTime);
        return;
      }

      envelopeGain.gain.cancelScheduledValues(releaseStart);
      envelopeGain.gain.setValueAtTime(envelopeGain.gain.value || this.config.envelope.sustain, releaseStart);
      envelopeGain.gain.linearRampToValueAtTime(0.0001, releaseStart + this.config.envelope.release);
      oscillator.stop(releaseStart + this.config.envelope.release);
    };

    const voice: AudioVoice = {
      id,
      oscillator,
      envelopeGain,
      voiceGain,
      frequency,
      svara,
      octave,
      startTime,
      duration: durationSeconds,
      stop
    };

    oscillator.onended = () => {
      this.activeVoices.delete(id);
      oscillator.disconnect();
      envelopeGain.disconnect();
      voiceGain.disconnect();
    };

    oscillator.start(startTime);
    stop(startTime + durationSeconds);
    this.activeVoices.set(id, voice);
    return voice;
  }

  private emit(event: EngineEvent, data: unknown): void {
    this.eventListeners[event].forEach((listener) => listener(data));
  }
}
