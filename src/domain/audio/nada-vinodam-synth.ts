import { clamp } from '../../lib/utils/clamp';
import type { WaveformType } from '../shared/types';
import type { NadaAnalyserFrame, NadaVinodamSynth, NadaVinodamSynthConfig } from './nada-vinodam.types';

const MIN_GAIN = 0;
const MAX_GAIN = 1;

function resolveAudioContextClass(): typeof AudioContext {
  const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext ?? browserWindow.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  return AudioContextClass;
}

export function createNadaVinodamSynth(initialConfig: NadaVinodamSynthConfig): NadaVinodamSynth {
  let config = { ...initialConfig };
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let masterGain: GainNode | null = null;
  let oscillator: OscillatorNode | null = null;
  let voiceGain: GainNode | null = null;
  // Explicit ArrayBuffer backing so getFloatTimeDomainData accepts the buffer (PGF-002).
  let timeDomainBuffer: Float32Array<ArrayBuffer> | null = null;
  let isInitialized = false;
  let isPlaying = false;

  async function init(): Promise<void> {
    if (isInitialized) {
      return;
    }

    const AudioContextClass = resolveAudioContextClass();
    audioContext = new AudioContextClass({ latencyHint: 'interactive', sampleRate: 44100 });
    masterGain = audioContext.createGain();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    timeDomainBuffer = new Float32Array(
      new ArrayBuffer(analyser.fftSize * Float32Array.BYTES_PER_ELEMENT)
    );

    masterGain.gain.value = 1;
    analyser.connect(masterGain);
    masterGain.connect(audioContext.destination);

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    isInitialized = true;
  }

  async function ensureReady(): Promise<void> {
    await init();

    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  }

  function cleanupVoice(): void {
    if (oscillator) {
      oscillator.onended = null;
      oscillator.disconnect();
      oscillator = null;
    }

    if (voiceGain) {
      voiceGain.disconnect();
      voiceGain = null;
    }
  }

  async function start(): Promise<void> {
    await ensureReady();

    if (!audioContext || !analyser) {
      throw new Error('Audio engine failed to initialize.');
    }

    if (isPlaying) {
      return;
    }

    cleanupVoice();

    oscillator = audioContext.createOscillator();
    voiceGain = audioContext.createGain();

    oscillator.type = config.waveform;
    oscillator.frequency.setValueAtTime(config.frequencyHz, audioContext.currentTime);

    const attackEnd = audioContext.currentTime + Math.max(0.005, config.attackSeconds);
    voiceGain.gain.cancelScheduledValues(audioContext.currentTime);
    voiceGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    voiceGain.gain.linearRampToValueAtTime(clamp(config.gain, MIN_GAIN, MAX_GAIN), attackEnd);

    oscillator.connect(voiceGain);
    voiceGain.connect(analyser);
    oscillator.onended = () => {
      cleanupVoice();
    };
    oscillator.start(audioContext.currentTime);

    isPlaying = true;
  }

  function stop(): void {
    if (!audioContext || !oscillator || !voiceGain || !isPlaying) {
      isPlaying = false;
      return;
    }

    const stopOscillator = oscillator;
    const stopGain = voiceGain;
    const now = audioContext.currentTime;
    const releaseEnd = now + Math.max(0.01, config.releaseSeconds);

    stopGain.gain.cancelScheduledValues(now);
    stopGain.gain.setValueAtTime(Math.max(stopGain.gain.value, 0.0001), now);
    stopGain.gain.linearRampToValueAtTime(0.0001, releaseEnd);
    stopOscillator.stop(releaseEnd + 0.02);

    isPlaying = false;
  }

  function setFrequency(frequencyHz: number): void {
    config = { ...config, frequencyHz };

    if (oscillator && audioContext) {
      oscillator.frequency.cancelScheduledValues(audioContext.currentTime);
      oscillator.frequency.setValueAtTime(frequencyHz, audioContext.currentTime);
    }
  }

  function setGain(gain: number): void {
    config = { ...config, gain: clamp(gain, MIN_GAIN, MAX_GAIN) };

    if (voiceGain && audioContext && isPlaying) {
      voiceGain.gain.cancelScheduledValues(audioContext.currentTime);
      voiceGain.gain.setTargetAtTime(config.gain, audioContext.currentTime, 0.02);
    }
  }

  function setEnvelope(envelope: Pick<NadaVinodamSynthConfig, 'attackSeconds' | 'releaseSeconds'>): void {
    config = {
      ...config,
      attackSeconds: envelope.attackSeconds,
      releaseSeconds: envelope.releaseSeconds
    };
  }

  function setWaveform(waveform: WaveformType): void {
    config = { ...config, waveform };

    if (oscillator) {
      oscillator.type = waveform;
    }
  }

  function setSustainEnabled(enabled: boolean): void {
    config = { ...config, sustainEnabled: enabled };
  }

  function readAnalyserFrame(): NadaAnalyserFrame | null {
    if (!analyser || !timeDomainBuffer) {
      return null;
    }

    analyser.getFloatTimeDomainData(timeDomainBuffer);

    let peak = 0;
    for (let index = 0; index < timeDomainBuffer.length; index += 1) {
      const magnitude = Math.abs(timeDomainBuffer[index]);
      if (magnitude > peak) {
        peak = magnitude;
      }
    }

    return {
      timeDomain: Float32Array.from(timeDomainBuffer),
      peak,
      timestampMs: performance.now()
    };
  }

  function destroy(): void {
    stop();
    cleanupVoice();

    if (analyser) {
      analyser.disconnect();
      analyser = null;
    }

    if (masterGain) {
      masterGain.disconnect();
      masterGain = null;
    }

    if (audioContext) {
      void audioContext.close();
      audioContext = null;
    }

    isInitialized = false;
    isPlaying = false;
    timeDomainBuffer = null;
  }

  return {
    init,
    start,
    stop,
    setFrequency,
    setGain,
    setEnvelope,
    setWaveform,
    setSustainEnabled,
    readAnalyserFrame,
    destroy
  };
}
