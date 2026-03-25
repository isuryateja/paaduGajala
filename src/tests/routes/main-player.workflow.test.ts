import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { clearNotation, parseCurrentNotation, setNotationText } from '../../app/actions/notation.actions';
import { notationStore } from '../../app/stores/notation.store';

describe('main player workflow state', () => {
  it('parses entered notation into store state', () => {
    clearNotation();
    setNotationText('S R1 G1 M1 ||');
    parseCurrentNotation();
    expect(get(notationStore).parsed.length).toBeGreaterThan(0);
  });

  it('rejects invalid notation without building parsed preview state', () => {
    clearNotation();
    setNotationText('Hello World! 123');
    parseCurrentNotation();

    const state = get(notationStore);
    expect(state.parsed).toEqual([]);
    expect(state.stats).toBeNull();
    expect(state.validation?.valid).toBe(false);
  });

  it('clears the notation store', () => {
    clearNotation();
    expect(get(notationStore).rawText).toBe('');
  });
});
