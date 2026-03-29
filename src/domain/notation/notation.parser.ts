import * as legacyNotationModule from '../../../notation_parser.js';
import type { NotationToken, ParsedNotationNode, ParsedSvara, PreviewNotationToken } from './notation.types';

type LegacyNotationModule = {
  parseNotation: (text: string, options?: Record<string, unknown>) => ParsedNotationNode[];
  parseNotationByLines: (text: string) => ParsedNotationNode[][];
  parseSvarasOnly: (text: string) => ParsedSvara[];
  createSvara: (svara: string, octave: string) => string;
  notationToString?: (nodes: ParsedNotationNode[]) => string;
  tokenize: (text: string) => NotationToken[];
};

const legacyNotation = legacyNotationModule as unknown as LegacyNotationModule;

export function parseNotation(text: string, options: Record<string, unknown> = {}): ParsedNotationNode[] {
  return legacyNotation.parseNotation(text, options);
}

export function parseNotationByLines(text: string): ParsedNotationNode[][] {
  return legacyNotation.parseNotationByLines(text);
}

export function parseSvarasOnly(text: string): ParsedSvara[] {
  return legacyNotation.parseSvarasOnly(text);
}

export function createSvara(svara: string, octave: string): string {
  return legacyNotation.createSvara(svara, octave);
}

export function tokenize(text: string): NotationToken[] {
  return legacyNotation.tokenize(text);
}

export function notationToString(nodes: ParsedNotationNode[]): string {
  return legacyNotation.notationToString ? legacyNotation.notationToString(nodes) : '';
}

export function buildPreviewNotationTokens(nodes: ParsedNotationNode[]): PreviewNotationToken[] {
  let noteIndex = 0;
  const previewTokens: PreviewNotationToken[] = [];

  for (const node of nodes) {
    if (node.type === 'svara') {
      previewTokens.push({
        type: 'svara',
        text: node.svara,
        octaveDisplay: node.octave === 'mandra' ? 'sub' : node.octave === 'taara' ? 'sup' : null,
        noteIndex,
        position: node.position
      });
      noteIndex += 1;
      continue;
    }

    if (node.type === 'rhythm_marker') {
      previewTokens.push({
        type: 'rhythm_marker',
        text: node.marker,
        position: node.position
      });
      continue;
    }

    if (node.type === 'newline') {
      previewTokens.push({
        type: 'newline',
        position: node.position
      });
    }
  }

  return previewTokens;
}
