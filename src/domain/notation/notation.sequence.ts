import type { SequenceItem, SequenceNote, SequenceSilence } from '../audio/audio.types';
import type { ParsedNotationNode } from './notation.types';

export interface TimedNotationSequence {
  items: SequenceItem[];
  sequenceLength: number;
  totalUnits: number;
}

function isSequenceSilence(item: SequenceItem | undefined): item is SequenceSilence {
  return item?.type === 'silence';
}

export function buildTimedNotationSequence(nodes: ParsedNotationNode[]): TimedNotationSequence {
  const items: SequenceItem[] = [];
  let noteIndex = 0;
  let totalUnits = 0;
  let activeNote: SequenceNote | null = null;

  function addSilence(duration: number): void {
    const lastItem = items.at(-1);

    if (isSequenceSilence(lastItem)) {
      lastItem.duration += duration;
    } else {
      items.push({ type: 'silence', duration });
    }

    totalUnits += duration;
  }

  for (const node of nodes) {
    if (node.type === 'svara') {
      const note: SequenceNote = {
        type: 'svara',
        svara: node.svara,
        octave: node.octave,
        duration: node.duration,
        originalIndex: noteIndex
      };

      items.push(note);
      activeNote = note;
      noteIndex += 1;
      totalUnits += node.duration;
      continue;
    }

    if (node.type === 'sustain_unit') {
      const durationUnits = node.units ?? 1;

      if (activeNote) {
        activeNote.duration = (activeNote.duration ?? 1) + durationUnits;
        totalUnits += durationUnits;
      } else {
        addSilence(durationUnits);
      }
      continue;
    }

    if (node.type === 'beat_rest') {
      addSilence(node.beats ?? 1);
      activeNote = null;
      continue;
    }

    if (node.type === 'rhythm_marker') {
      items.push({
        type: 'boundary',
        boundaryKind: node.boundaryKind ?? (node.subtype === 'double' ? 'phrase' : 'beat'),
        marker: node.marker === '||' ? '||' : '|'
      });
      activeNote = null;
      continue;
    }

    if (node.type === 'newline') {
      activeNote = null;
    }
  }

  return {
    items,
    sequenceLength: noteIndex,
    totalUnits
  };
}
