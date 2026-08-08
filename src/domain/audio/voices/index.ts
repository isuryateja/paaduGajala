import type { AudioVoice, VoiceType } from '../audio.types';
import { createBowVoice } from './bow';
import { createFluteVoice } from './flute';
import { createPluckedStringVoice } from './plucked-string';
import { createPureVoice } from './pure';
import { createReedVoice } from './reed';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

export type {
  VoiceCreateContext,
  VoiceCreateParams,
  VoiceFactory,
  VoiceType
} from './types';
export { VOICE_TYPES } from './types';
export { createPureVoice } from './pure';
export {
  createPluckedStringVoice,
  PLUCKED_PARTIAL_COUNT,
  PLUCKED_INHARMONICITY,
  PLUCKED_PARTIAL_WEIGHTS
} from './plucked-string';
export {
  createFluteVoice,
  FLUTE_PARTIAL_COUNT,
  FLUTE_PARTIAL_WEIGHTS,
  FLUTE_BREATH_GAIN,
  FLUTE_MIN_ATTACK
} from './flute';
export {
  createBowVoice,
  BOW_PARTIAL_COUNT,
  BOW_PARTIAL_WEIGHTS,
  BOW_MIN_ATTACK,
  BOW_LFO_RATE,
  BOW_LFO_DEPTH
} from './bow';
export {
  createReedVoice,
  REED_PARTIAL_COUNT,
  REED_PARTIAL_WEIGHTS,
  REED_MIN_ATTACK
} from './reed';

/**
 * Factories registered for dispatch.
 * All Phase B instrument types are registered; unknown types fall back to pure.
 */
const voiceFactories: Partial<Record<VoiceType, VoiceFactory>> = {
  pure: createPureVoice,
  plucked: createPluckedStringVoice,
  flute: createFluteVoice,
  bow: createBowVoice,
  reed: createReedVoice
};

/** Voice types that currently have a real factory (not a pure fallback). */
export function getImplementedVoiceTypes(): VoiceType[] {
  return (Object.keys(voiceFactories) as VoiceType[]).filter((type) => voiceFactories[type]);
}

function resolveFactory(voiceType: VoiceType): VoiceFactory {
  return voiceFactories[voiceType] ?? createPureVoice;
}

/**
 * Dispatch to the factory for `voiceType`.
 * Unimplemented instrument types fall back to `pure` until Phase B registers them.
 */
export function createVoiceByType(
  voiceType: VoiceType,
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice {
  const factory = resolveFactory(voiceType);
  return factory(context, params);
}
