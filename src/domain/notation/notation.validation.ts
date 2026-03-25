import * as legacyNotationModule from '../../../notation_parser.js';
import type { NotationValidationResult } from './notation.types';

type LegacyNotationModule = {
  validateNotation: (text: string) => NotationValidationResult;
};

const legacyNotation = legacyNotationModule as unknown as LegacyNotationModule;

export function validateNotation(text: string): NotationValidationResult {
  return legacyNotation.validateNotation(text);
}
