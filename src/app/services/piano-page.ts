import { writable, type Writable } from 'svelte/store';
import { PIANO_KEYBOARD_MAP } from '../../domain/piano/piano-keyboard-map';
import { addWindowListener } from '../../infra/browser/dom-helpers';
import { onVisibilityChange, onWindowBlur } from '../../infra/browser/visibility-events';
import { releaseAllPianoNotes, startPianoNote, stopPianoNote } from '../actions/piano.actions';
import type { PianoKeyboardMapping } from '../../domain/piano/piano.types';
import type { Teardown } from '../../domain/shared/types';

export interface PianoPageController {
  activeKeys: Writable<Set<string>>;
  pressMappedKey: (note: string, octave: string) => void;
  releaseMappedKey: (note: string, octave: string) => void;
  releaseEverything: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  handleKeyup: (event: KeyboardEvent) => void;
  mount: () => Teardown;
}

function createKeyId(note: string, octave: string): string {
  return `${note}:${octave}`;
}

function updateActiveKeys(store: Writable<Set<string>>, updater: (current: Set<string>) => Set<string>): void {
  store.update((current) => updater(current));
}

export function createPianoPageController(
  keyboardMap: Record<string, PianoKeyboardMapping> = PIANO_KEYBOARD_MAP
): PianoPageController {
  const activeKeys = writable<Set<string>>(new Set());

  function pressMappedKey(note: string, octave: string): void {
    let shouldStart = false;
    updateActiveKeys(activeKeys, (current) => {
      const keyId = createKeyId(note, octave);
      if (current.has(keyId)) {
        return current;
      }

      shouldStart = true;
      return new Set([...current, keyId]);
    });

    if (shouldStart) {
      void startPianoNote(note, octave);
    }
  }

  function releaseMappedKey(note: string, octave: string): void {
    let shouldStop = false;
    updateActiveKeys(activeKeys, (current) => {
      const keyId = createKeyId(note, octave);
      if (!current.has(keyId)) {
        return current;
      }

      shouldStop = true;
      return new Set([...current].filter((entry) => entry !== keyId));
    });

    if (shouldStop) {
      stopPianoNote(note, octave);
    }
  }

  function releaseEverything(): void {
    activeKeys.set(new Set());
    releaseAllPianoNotes();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }

    const mapping = keyboardMap[event.key.toLowerCase()];
    if (!mapping) {
      return;
    }

    event.preventDefault();
    pressMappedKey(mapping.note, mapping.octave);
  }

  function handleKeyup(event: KeyboardEvent): void {
    const mapping = keyboardMap[event.key.toLowerCase()];
    if (!mapping) {
      return;
    }

    event.preventDefault();
    releaseMappedKey(mapping.note, mapping.octave);
  }

  function mount(): Teardown {
    const removeKeydown = addWindowListener('keydown', handleKeydown);
    const removeKeyup = addWindowListener('keyup', handleKeyup);
    const removeVisibilityListener = onVisibilityChange((hidden) => {
      if (hidden) {
        releaseEverything();
      }
    });
    const removeWindowBlurListener = onWindowBlur(releaseEverything);

    return () => {
      removeKeydown();
      removeKeyup();
      removeVisibilityListener();
      removeWindowBlurListener();
      releaseEverything();
    };
  }

  return {
    activeKeys,
    pressMappedKey,
    releaseMappedKey,
    releaseEverything,
    handleKeydown,
    handleKeyup,
    mount
  };
}
