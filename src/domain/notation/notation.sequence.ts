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

  function addSvara(noteNode: { svara: string; octave: SequenceNote['octave']; duration: number }): void {
    const note: SequenceNote = {
      type: 'svara' as const,
      svara: noteNode.svara,
      octave: noteNode.octave,
      duration: noteNode.duration,
      originalIndex: noteIndex
    };

    items.push(note);
    activeNote = note;
    noteIndex += 1;
    totalUnits += noteNode.duration;
  }

  for (const node of nodes) {
    if (node.type === 'svara') {
      addSvara(node);
      continue;
    }

    if (node.type === 'vega_group') {
      for (const groupedNote of node.notes) {
        addSvara(groupedNote);
      }
      activeNote = null;
      continue;
    }

    if (node.type === 'sustain_unit') {
      const durationUnits = node.units ?? 1;

      if (activeNote) {
        const currentActiveNote = activeNote as SequenceNote;
        const updatedNote: SequenceNote = {
          type: 'svara' as const,
          svara: currentActiveNote.svara,
          octave: currentActiveNote.octave,
          duration: (currentActiveNote.duration ?? 1) + durationUnits,
          originalIndex: currentActiveNote.originalIndex
        };

        activeNote = updatedNote;
        items[items.length - 1] = updatedNote;
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
