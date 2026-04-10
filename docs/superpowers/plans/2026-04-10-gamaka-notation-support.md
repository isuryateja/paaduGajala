# Gamaka Notation Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four gamaka notation forms (`S/R`, `S / R`, `S _ / R`, `S ~R1`) to the parser, sequencer, and audio engine with continuous pitch automation.

**Architecture:** Extend `notation_parser.js` directly with motion tokenization and `MotionNode` construction. The TypeScript layer adds types and handles `MotionNode` in sequencing, preview tokens, and audio scheduling — the same pattern already used for `VegaGroupNode`. No new files, routes, stores, or action files.

**Tech Stack:** JavaScript (notation_parser.js), TypeScript (strict), SvelteKit 2 / Svelte 5, Web Audio API (`linearRampToValueAtTime`), Vitest.

---

## File Map

| File | Change |
|---|---|
| `src/domain/notation/notation.types.ts` | Add `MotionNode`, `PreviewMotionToken`; update union types |
| `src/domain/audio/audio.types.ts` | Add `SequenceMotion`; update `SequenceItem` |
| `notation_parser.js` | Tokenizer: add `/` and `~` tokens; Parser: motion detection pass; `parseSvarasOnly`: flatten motion; `validateNotation`: motion validation |
| `src/domain/notation/notation.sequence.ts` | Handle `MotionNode` in `buildTimedNotationSequence` |
| `src/domain/notation/notation.parser.ts` | Handle `MotionNode` in `buildPreviewNotationTokens` |
| `src/domain/audio/audio-engine.ts` | Add `scheduleMotion()`; branch in `playSequence()` |
| `src/components/notation/ParsedNotationCard.svelte` | Render motion pills |
| `src/components/notation/PlaybackNotationHighlighter.svelte` | Highlight motion tokens |

**Tests modified:**
- `src/tests/notation/notation.parser.test.ts`
- `src/tests/notation/notation.validation.test.ts`
- `src/tests/notation/notation.sequence.test.ts`
- `src/tests/audio/audio-sequence.test.ts`

---

## Task 1: Add type definitions

**Files:**
- Modify: `src/domain/notation/notation.types.ts`
- Modify: `src/domain/audio/audio.types.ts`

No Vitest tests for this task — TypeScript compilation is the check.

- [ ] **Step 1: Add MotionNode and PreviewMotionToken to notation.types.ts**

Open `src/domain/notation/notation.types.ts`. Add after the `VegaGroupNode` interface (around line 67):

```ts
export interface MotionNode {
  type: 'motion';
  motionType: 'direct_glide' | 'hold_then_glide' | 'ornamented_settle';
  syntax: 'compact_glide' | 'spaced_glide' | 'hold_glide' | 'ornamented_settle';
  start: ParsedSvara;
  target: ParsedSvara;
  holdBeats: number;
  glideBeats: number;
  totalDuration: number;
  contour?: {
    intermediate: ParsedSvara;
    ascentRatio: number;
    descentRatio: number;
  };
  sourceText: string;
  line: number;
  position: number;
  endPosition: number;
}
```

Add after the `PreviewVegaGroupToken` interface (around line 114):

```ts
export interface PreviewMotionToken {
  type: 'motion';
  text: string;
  syntax: MotionNode['syntax'];
  noteIndex: number;
  position: number;
  endPosition: number;
}
```

Update the `PreviewNotationToken` union (around line 126):

```ts
export type PreviewNotationToken =
  | PreviewSvaraToken
  | PreviewRhythmToken
  | PreviewSustainToken
  | PreviewBeatRestToken
  | PreviewVegaGroupToken
  | PreviewNewlineToken
  | PreviewMotionToken;
```

Update the `ParsedNotationNode` union (around line 134):

```ts
export type ParsedNotationNode =
  | ParsedSvara
  | RhythmMarkerNode
  | SustainUnitNode
  | BeatRestNode
  | VegaGroupNode
  | MotionNode
  | NewlineNode
  | WhitespaceNode
  | UnknownNode;
```

- [ ] **Step 2: Add SequenceMotion to audio.types.ts**

Open `src/domain/audio/audio.types.ts`. Add after the `SequenceSilence` interface:

```ts
export interface SequenceMotion {
  type: 'motion';
  motionType: 'direct_glide' | 'hold_then_glide' | 'ornamented_settle';
  start: { svara: string; octave: OctaveName };
  target: { svara: string; octave: OctaveName };
  holdBeats: number;
  glideBeats: number;
  duration: number;
  contour?: {
    intermediate: { svara: string; octave: OctaveName };
  };
  originalIndex: number;
}
```

Update the `SequenceItem` union:

```ts
export type SequenceItem = SequenceNote | SequenceBoundary | SequenceSilence | SequenceMotion;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run check
```

Expected: no type errors. Fix any that appear before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/domain/notation/notation.types.ts src/domain/audio/audio.types.ts
git commit -m "feat(types): add MotionNode, SequenceMotion, PreviewMotionToken types"
```

---

## Task 2: Extend the tokenizer with motion and contour operator tokens

**Files:**
- Modify: `notation_parser.js`
- Modify: `src/tests/notation/notation.parser.test.ts`

The tokenizer currently treats `/` and `~` as `UNKNOWN`. This task makes them first-class token types.

- [ ] **Step 1: Write the failing tokenizer tests**

Add to `src/tests/notation/notation.parser.test.ts`:

```ts
import { tokenize } from '../../domain/notation/notation.parser';

// ... add inside the describe block:

describe('tokenizer: motion and contour operators', () => {
  it('emits motion_operator for forward slash', () => {
    const tokens = tokenize('S/R');
    const slashToken = tokens.find((t) => t.value === '/');
    expect(slashToken).toBeDefined();
    expect(slashToken?.type).toBe('motion_operator');
  });

  it('emits contour_operator for tilde', () => {
    const tokens = tokenize('S ~R1');
    const tildeToken = tokens.find((t) => t.value === '~');
    expect(tildeToken).toBeDefined();
    expect(tildeToken?.type).toBe('contour_operator');
  });

  it('preserves whitespace tokens adjacent to motion operators', () => {
    const tokens = tokenize('S / R');
    const types = tokens.map((t) => t.type);
    expect(types).toContain('whitespace');
    expect(types).toContain('motion_operator');
  });

  it('does not emit unknown tokens for / or ~ in motion context', () => {
    const tokens1 = tokenize('S/R');
    const tokens2 = tokenize('S ~R1');
    expect(tokens1.some((t) => t.type === 'unknown')).toBe(false);
    expect(tokens2.some((t) => t.type === 'unknown')).toBe(false);
  });
});
```

Also add `tokenize` to the import at the top of the test file:

```ts
import { buildPreviewNotationTokens, parseNotation, parseSvarasOnly, tokenize } from '../../domain/notation/notation.parser';
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: 4 new tests fail — `motion_operator` and `contour_operator` are not recognized yet.

- [ ] **Step 3: Add token types to notation_parser.js**

In `notation_parser.js`, find the `TOKEN_TYPES` constant (around line 240) and add two new entries:

```js
const TOKEN_TYPES = {
    SVARA: 'svara',
    RHYTHM_MARKER: 'rhythm_marker',
    SUSTAIN_UNIT: 'sustain_unit',
    BEAT_REST: 'beat_rest',
    VEGA_GROUP_START: 'vega_group_start',
    VEGA_GROUP_END: 'vega_group_end',
    NEWLINE: 'newline',
    WHITESPACE: 'whitespace',
    MOTION_OPERATOR: 'motion_operator',    // '/'
    CONTOUR_OPERATOR: 'contour_operator',  // '~'
    UNKNOWN: 'unknown'
};
```

- [ ] **Step 4: Add token detection to the tokenize() function**

In the `tokenize()` function, find the block that checks for `VEGA_GROUP_END` (around line 322). Add the two new checks **before** the `NEWLINE` check, in this position:

```js
        if (char === VEGA_GROUP_MARKERS.END) {
            tokens.push({
                type: TOKEN_TYPES.VEGA_GROUP_END,
                value: VEGA_GROUP_MARKERS.END,
                position: i
            });
            i++;
            continue;
        }

        // NEW: motion operator '/'
        if (char === '/') {
            tokens.push({
                type: TOKEN_TYPES.MOTION_OPERATOR,
                value: '/',
                position: i
            });
            i++;
            continue;
        }

        // NEW: contour operator '~'
        if (char === '~') {
            tokens.push({
                type: TOKEN_TYPES.CONTOUR_OPERATOR,
                value: '~',
                position: i
            });
            i++;
            continue;
        }

        // Check for newline
        if (char === '\n') {
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: all tokenizer tests pass.

- [ ] **Step 6: Commit**

```bash
git add notation_parser.js src/tests/notation/notation.parser.test.ts
git commit -m "feat(tokenizer): emit motion_operator and contour_operator tokens"
```

---

## Task 3: Parser — direct glide (compact and spaced)

**Files:**
- Modify: `notation_parser.js`
- Modify: `src/tests/notation/notation.parser.test.ts`

Parses `S/R` (1 beat, compact) and `S / R` (2 beats, spaced) into `MotionNode`.

- [ ] **Step 1: Write the failing parser tests**

Add to the test file inside the main `describe` block:

```ts
describe('motion nodes: direct glide', () => {
  it('parses compact glide S/R1 into one MotionNode', () => {
    const nodes = parseNotation('S/R1');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      motionType: 'direct_glide',
      syntax: 'compact_glide',
      holdBeats: 0,
      glideBeats: 1,
      totalDuration: 1,
      start: expect.objectContaining({ svara: 'S', octave: 'madhya' }),
      target: expect.objectContaining({ svara: 'R1', octave: 'madhya' })
    });
  });

  it('parses spaced glide S / R1 into one MotionNode with 2 beats', () => {
    const nodes = parseNotation('S / R1');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      motionType: 'direct_glide',
      syntax: 'spaced_glide',
      holdBeats: 0,
      glideBeats: 2,
      totalDuration: 2
    });
  });

  it('distinguishes compact from spaced — they are not timing equivalent', () => {
    const compact = parseNotation('S/R1');
    const spaced = parseNotation('S / R1');
    expect((compact[0] as any).totalDuration).toBe(1);
    expect((spaced[0] as any).totalDuration).toBe(2);
  });

  it('preserves source positions on compact glide', () => {
    const nodes = parseNotation('S/R');
    const motion = nodes[0] as any;
    expect(motion.position).toBe(0);
    expect(motion.endPosition).toBeGreaterThan(0);
  });

  it('parses descending glide N2/D2 correctly', () => {
    const nodes = parseNotation('N2/D2');
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      start: expect.objectContaining({ svara: 'N2' }),
      target: expect.objectContaining({ svara: 'D2' })
    });
  });

  it('parses octave-marked motion S\'/N2 correctly', () => {
    const nodes = parseNotation("S'/N2");
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      start: expect.objectContaining({ svara: 'S', octave: 'taara' }),
      target: expect.objectContaining({ svara: 'N2', octave: 'madhya' })
    });
  });

  it('preserves plain svaras before and after a motion expression', () => {
    const nodes = parseNotation('G1 S/R1 M1');
    expect(nodes.filter((n) => n.type === 'svara')).toHaveLength(2);
    expect(nodes.filter((n) => n.type === 'motion')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: motion tests fail — `parseNotation('S/R')` returns unknown tokens, not a MotionNode.

- [ ] **Step 3: Add helper constants and tryParseMotion to notation_parser.js**

Add this block **before** the `parseNotation` function (around line 491, before the JSDoc comment):

```js
// ============================================================================
// MOTION PARSING HELPERS
// ============================================================================

/**
 * Canonical svara names for each distinct pitch tier, ordered by semitone.
 * Carnatic enharmonics (R2=G1, R3=G2, D2=N1, D3=N2) use the first canonical name.
 */
const DISTINCT_PITCH_ORDER = ['S', 'R1', 'R2', 'R3', 'G3', 'M1', 'M2', 'P', 'D1', 'D2', 'D3', 'N3'];

/**
 * Maps each svara name to its pitch tier index in DISTINCT_PITCH_ORDER.
 */
const SVARA_PITCH_TIER = {
    'S': 0,
    'R1': 1,
    'R2': 2, 'G1': 2,
    'R3': 3, 'G2': 3,
    'G3': 4,
    'M1': 5,
    'M2': 6,
    'P': 7,
    'D1': 8,
    'D2': 9, 'N1': 9,
    'D3': 10, 'N2': 10,
    'N3': 11
};

const OCTAVE_ORDER = ['mandra', 'madhya', 'taara'];

/**
 * Resolve the next higher distinct pitch above targetSvara in targetOctave.
 * If targetSvara is the highest in its octave, borrows Sa from the next octave.
 * Returns { svara, octave } or null if resolution is impossible.
 */
function resolveOvershotSvara(targetSvara, targetOctave) {
    const tier = SVARA_PITCH_TIER[targetSvara];
    if (tier === undefined) return null;

    if (tier < DISTINCT_PITCH_ORDER.length - 1) {
        return { svara: DISTINCT_PITCH_ORDER[tier + 1], octave: targetOctave };
    }

    // Target is N3 — borrow Sa from next octave
    const octaveIdx = OCTAVE_ORDER.indexOf(targetOctave);
    if (octaveIdx >= 0 && octaveIdx < OCTAVE_ORDER.length - 1) {
        return { svara: 'S', octave: OCTAVE_ORDER[octaveIdx + 1] };
    }

    return null; // taara N3 — no higher pitch
}

/**
 * Build a MotionNode from resolved components.
 */
function createMotionNode(motionType, syntax, startToken, targetToken, opts, currentLine) {
    const targetRawLen = targetToken.raw ? targetToken.raw.length : targetToken.svara.length;
    const sourceText = opts.sourceText;

    const startSvara = {
        type: 'svara',
        svara: startToken.svara,
        svaraName: SVARA_NOTATION[startToken.svara],
        octave: startToken.octave,
        duration: 0,
        beatMarker: null,
        line: currentLine,
        position: startToken.position
    };

    const targetSvara = {
        type: 'svara',
        svara: targetToken.svara,
        svaraName: SVARA_NOTATION[targetToken.svara],
        octave: targetToken.octave,
        duration: 0,
        beatMarker: null,
        line: currentLine,
        position: targetToken.position
    };

    const node = {
        type: 'motion',
        motionType,
        syntax,
        start: startSvara,
        target: targetSvara,
        holdBeats: opts.holdBeats,
        glideBeats: opts.glideBeats,
        totalDuration: opts.holdBeats + opts.glideBeats,
        sourceText,
        line: currentLine,
        position: startToken.position,
        endPosition: targetToken.position + targetRawLen
    };

    if (opts.contour) {
        const intermediateSvara = {
            type: 'svara',
            svara: opts.contour.intermediate.svara,
            svaraName: SVARA_NOTATION[opts.contour.intermediate.svara],
            octave: opts.contour.intermediate.octave,
            duration: 0,
            beatMarker: null,
            line: currentLine,
            position: startToken.position
        };
        node.contour = {
            intermediate: intermediateSvara,
            ascentRatio: opts.contour.ascentRatio,
            descentRatio: opts.contour.descentRatio
        };
    }

    return node;
}

/**
 * Try to parse a motion expression starting at svaraIndex.
 * Returns { node, nextIndex } if a motion pattern is found, or null.
 *
 * Supported patterns:
 *   compact_glide:      svara "/" svara           (no whitespace before /)
 *   spaced_glide:       svara ws+ "/" ws+ svara
 *   hold_glide:         svara (ws+ "_")+ ws+ "/" ws+ svara
 *   ornamented_settle:  svara ws* "~" ws* svara
 */
function tryParseMotion(tokens, svaraIndex, currentLine) {
    const startToken = tokens[svaraIndex];
    let i = svaraIndex + 1;

    if (i >= tokens.length) return null;

    // Case 1: Compact glide — next token is immediately "/"
    if (tokens[i].type === TOKEN_TYPES.MOTION_OPERATOR) {
        const slashIdx = i;
        i++;
        if (i < tokens.length && tokens[i].type === TOKEN_TYPES.SVARA) {
            const targetToken = tokens[i];
            const sourceText = (startToken.raw || startToken.svara) + '/' + (targetToken.raw || targetToken.svara);
            return {
                node: createMotionNode('direct_glide', 'compact_glide', startToken, targetToken, {
                    holdBeats: 0, glideBeats: 1, sourceText
                }, currentLine),
                nextIndex: i
            };
        }
        return null; // "/" with no valid target — let validation catch it
    }

    // Must have whitespace to proceed with other patterns
    if (tokens[i].type !== TOKEN_TYPES.WHITESPACE) return null;

    // Skip leading whitespace
    while (i < tokens.length && tokens[i].type === TOKEN_TYPES.WHITESPACE) i++;
    if (i >= tokens.length) return null;

    // Case 2: Ornamented settle — "~" after whitespace
    if (tokens[i].type === TOKEN_TYPES.CONTOUR_OPERATOR) {
        i++; // skip ~
        while (i < tokens.length && tokens[i].type === TOKEN_TYPES.WHITESPACE) i++;
        if (i < tokens.length && tokens[i].type === TOKEN_TYPES.SVARA) {
            const targetToken = tokens[i];
            const overshoot = resolveOvershotSvara(targetToken.svara, targetToken.octave);
            if (!overshoot) return null; // no higher pitch — validation error
            const sourceText = (startToken.raw || startToken.svara) + ' ~' + (targetToken.raw || targetToken.svara);
            return {
                node: createMotionNode('ornamented_settle', 'ornamented_settle', startToken, targetToken, {
                    holdBeats: 0,
                    glideBeats: 1,
                    sourceText,
                    contour: { intermediate: overshoot, ascentRatio: 0.75, descentRatio: 0.25 }
                }, currentLine),
                nextIndex: i
            };
        }
        return null;
    }

    // Count underscore (sustain) tokens for hold glide
    let holdCount = 0;
    while (i < tokens.length && tokens[i].type === TOKEN_TYPES.SUSTAIN_UNIT) {
        holdCount++;
        i++;
        while (i < tokens.length && tokens[i].type === TOKEN_TYPES.WHITESPACE) i++;
    }

    // After optional underscores, need a "/" 
    if (i >= tokens.length || tokens[i].type !== TOKEN_TYPES.MOTION_OPERATOR) return null;

    i++; // skip "/"
    while (i < tokens.length && tokens[i].type === TOKEN_TYPES.WHITESPACE) i++;
    if (i >= tokens.length || tokens[i].type !== TOKEN_TYPES.SVARA) return null;

    const targetToken = tokens[i];
    const startRaw = startToken.raw || startToken.svara;
    const targetRaw = targetToken.raw || targetToken.svara;

    if (holdCount === 0) {
        // Spaced glide: ws+ "/" ws+ svara
        const sourceText = startRaw + ' / ' + targetRaw;
        return {
            node: createMotionNode('direct_glide', 'spaced_glide', startToken, targetToken, {
                holdBeats: 0, glideBeats: 2, sourceText
            }, currentLine),
            nextIndex: i
        };
    } else {
        // Hold glide: (ws+ "_")+ ws+ "/" ws+ svara
        const underscores = Array(holdCount).fill('_').join(' _ ');
        const sourceText = startRaw + ' ' + underscores + ' / ' + targetRaw;
        return {
            node: createMotionNode('hold_then_glide', 'hold_glide', startToken, targetToken, {
                holdBeats: holdCount, glideBeats: 1, sourceText
            }, currentLine),
            nextIndex: i
        };
    }
}
```

- [ ] **Step 4: Wire tryParseMotion into the parseNotation() switch statement**

In `parseNotation()`, find the `TOKEN_TYPES.SVARA` case (around line 566):

```js
            case TOKEN_TYPES.SVARA:
                const note = createParsedSvara(token);
                notes.push(note);
                lastSvaraIndex = notes.length - 1;
                break;
```

Replace it with:

```js
            case TOKEN_TYPES.SVARA: {
                const motionResult = tryParseMotion(tokens, i, currentLine);
                if (motionResult) {
                    notes.push(motionResult.node);
                    i = motionResult.nextIndex;
                    lastSvaraIndex = -1;
                    break;
                }
                const note = createParsedSvara(token);
                notes.push(note);
                lastSvaraIndex = notes.length - 1;
                break;
            }
```

- [ ] **Step 5: Run tests to confirm direct glide tests pass**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: all direct glide tests pass. Hold glide and ornamented settle tests do not exist yet — skip.

- [ ] **Step 6: Commit**

```bash
git add notation_parser.js src/tests/notation/notation.parser.test.ts
git commit -m "feat(parser): parse compact and spaced direct glide into MotionNode"
```

---

## Task 4: Parser — hold glide and ornamented settle

**Files:**
- Modify: `src/tests/notation/notation.parser.test.ts`

The `tryParseMotion` function already handles all four forms. This task adds tests for hold glide and ornamented settle to verify them.

- [ ] **Step 1: Write the failing hold glide tests**

Add to the test file:

```ts
describe('motion nodes: hold glide', () => {
  it('parses S _ / R into hold_then_glide with holdBeats=1, duration=2', () => {
    const nodes = parseNotation('S _ / R');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      motionType: 'hold_then_glide',
      syntax: 'hold_glide',
      holdBeats: 1,
      glideBeats: 1,
      totalDuration: 2
    });
  });

  it('parses S _ _ / R into hold_then_glide with holdBeats=2, duration=3', () => {
    const nodes = parseNotation('S _ _ / R');
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      motionType: 'hold_then_glide',
      holdBeats: 2,
      glideBeats: 1,
      totalDuration: 3
    });
  });

  it('parses S _ _ _ / R into hold_then_glide with holdBeats=3, duration=4', () => {
    const nodes = parseNotation('S _ _ _ / R');
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      holdBeats: 3,
      totalDuration: 4
    });
  });
});

describe('motion nodes: ornamented settle', () => {
  it('parses S ~R1 into ornamented_settle with resolved overshoot', () => {
    const nodes = parseNotation('S ~R1');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'motion',
      motionType: 'ornamented_settle',
      syntax: 'ornamented_settle',
      holdBeats: 0,
      glideBeats: 1,
      totalDuration: 1,
      start: expect.objectContaining({ svara: 'S' }),
      target: expect.objectContaining({ svara: 'R1' })
    });
    const motion = nodes[0] as any;
    expect(motion.contour).toBeDefined();
    expect(motion.contour.ascentRatio).toBe(0.75);
    expect(motion.contour.descentRatio).toBe(0.25);
    // Overshoot must be a higher pitch than R1 (tier 1) — R2 (tier 2)
    expect(motion.contour.intermediate.svara).toBe('R2');
  });

  it('resolves overshoot for S ~G3 to M1 (next distinct pitch above tier 4)', () => {
    const nodes = parseNotation('S ~G3');
    const motion = nodes[0] as any;
    expect(motion.contour.intermediate.svara).toBe('M1');
  });

  it('cross-octave overshoot: S ~N3 in madhya borrows taara S', () => {
    const nodes = parseNotation('S ~N3');
    const motion = nodes[0] as any;
    expect(motion.contour.intermediate.svara).toBe('S');
    expect(motion.contour.intermediate.octave).toBe('taara');
  });

  it('resolves overshoot using canonical name for enharmonic targets (S ~R2)', () => {
    // R2 is tier 2, next distinct pitch is R3 (tier 3) not G2 (also tier 3)
    const nodes = parseNotation('S ~R2');
    const motion = nodes[0] as any;
    expect(motion.contour.intermediate.svara).toBe('R3');
  });
});
```

- [ ] **Step 2: Run to confirm they pass (the implementation is already in place)**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: all hold glide and ornamented settle tests pass — `tryParseMotion` already handles these forms.

- [ ] **Step 3: Commit**

```bash
git add src/tests/notation/notation.parser.test.ts
git commit -m "test(parser): add hold glide and ornamented settle coverage"
```

---

## Task 5: Validation — reject invalid motion syntax

**Files:**
- Modify: `notation_parser.js`
- Modify: `src/tests/notation/notation.validation.test.ts`

Invalid motion forms must surface as errors and block playback.

- [ ] **Step 1: Write the failing validation tests**

Add to `src/tests/notation/notation.validation.test.ts`:

```ts
describe('gamaka validation', () => {
  it('rejects bare motion operator with no target: "S /"', () => {
    const result = validateNotation('S /');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('motion'))).toBe(true);
  });

  it('rejects compact slash with no target: "S/"', () => {
    const result = validateNotation('S/');
    expect(result.valid).toBe(false);
  });

  it('rejects leading motion operator with no start: "/ R"', () => {
    const result = validateNotation('/ R');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('motion'))).toBe(true);
  });

  it('rejects bare contour operator with no target: "S ~"', () => {
    const result = validateNotation('S ~');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('motion'))).toBe(true);
  });

  it('rejects chained contour and glide: "S / ~R"', () => {
    const result = validateNotation('S / ~R');
    expect(result.valid).toBe(false);
  });

  it('rejects motion inside a Vega group', () => {
    const result = validateNotation('[S/R G3]');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('Vega'))).toBe(true);
  });

  it('accepts valid gamaka syntax as valid', () => {
    expect(validateNotation('S/R').valid).toBe(true);
    expect(validateNotation('S / R').valid).toBe(true);
    expect(validateNotation('S _ / R').valid).toBe(true);
    expect(validateNotation('S ~R1').valid).toBe(true);
  });

  it('accepts multiple underscores in hold glide', () => {
    expect(validateNotation('S _ _ / R').valid).toBe(true);
    expect(validateNotation('S _ _ _ / R').valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/notation/notation.validation.test.ts
```

Expected: validation tests for gamaka fail — `validateNotation` currently treats `/` and `~` as unknown tokens and emits warnings, not targeted gamaka errors.

- [ ] **Step 3: Add motion validation to validateNotation() in notation_parser.js**

In `notation_parser.js`, find `validateNotation()` (around line 918). Add motion-aware token handling inside the `for (const token of tokens)` loop. Add after the `UNKNOWN` case:

```js
        } else if (token.type === TOKEN_TYPES.MOTION_OPERATOR) {
            // '/' is only valid immediately after a svara (compact) or after ws+_*ws (spaced/hold)
            // Validated structurally by checking surrounding tokens during parsing.
            // Here we detect bare '/' with no preceding svara context.
            if (activeVegaGroup) {
                if (!activeVegaGroup.invalidReason) {
                    activeVegaGroup.invalidReason = 'Motion operators are not allowed inside a Vega group';
                }
            }
        } else if (token.type === TOKEN_TYPES.CONTOUR_OPERATOR) {
            if (activeVegaGroup) {
                if (!activeVegaGroup.invalidReason) {
                    activeVegaGroup.invalidReason = 'Motion operators are not allowed inside a Vega group';
                }
            }
        }
```

Then, **after** the token loop (before the `if (!hasSvara)` check), add structural motion validation that scans the token stream for invalid patterns:

```js
    // Validate motion operator usage
    for (let idx = 0; idx < tokens.length; idx++) {
        const tok = tokens[idx];

        if (tok.type === TOKEN_TYPES.MOTION_OPERATOR) {
            // Check: must have a svara before it (allowing whitespace and underscores between)
            let hasPrecedingSvara = false;
            for (let back = idx - 1; back >= 0; back--) {
                const prev = tokens[back];
                if (prev.type === TOKEN_TYPES.SVARA) { hasPrecedingSvara = true; break; }
                if (prev.type === TOKEN_TYPES.SUSTAIN_UNIT || prev.type === TOKEN_TYPES.WHITESPACE) continue;
                break;
            }
            if (!hasPrecedingSvara) {
                issues.push({
                    type: 'error',
                    message: `Invalid motion operator at position ${tok.position}: '/' requires a svara before it`,
                    position: tok.position
                });
                continue;
            }

            // Check: must have a svara after it (allowing whitespace between)
            let hasFollowingSvara = false;
            for (let fwd = idx + 1; fwd < tokens.length; fwd++) {
                const next = tokens[fwd];
                if (next.type === TOKEN_TYPES.SVARA) { hasFollowingSvara = true; break; }
                if (next.type === TOKEN_TYPES.WHITESPACE) continue;
                // Chained contour: '/ ~' is invalid
                if (next.type === TOKEN_TYPES.CONTOUR_OPERATOR) {
                    issues.push({
                        type: 'error',
                        message: `Invalid motion syntax at position ${tok.position}: chained '/ ~' is not supported`,
                        position: tok.position
                    });
                    hasFollowingSvara = true; // suppress the missing-target error
                    break;
                }
                break;
            }
            if (!hasFollowingSvara) {
                issues.push({
                    type: 'error',
                    message: `Invalid motion operator at position ${tok.position}: '/' requires a svara after it`,
                    position: tok.position
                });
            }
        }

        if (tok.type === TOKEN_TYPES.CONTOUR_OPERATOR) {
            // Must have a svara before it
            let hasPrecedingSvara = false;
            for (let back = idx - 1; back >= 0; back--) {
                const prev = tokens[back];
                if (prev.type === TOKEN_TYPES.SVARA) { hasPrecedingSvara = true; break; }
                if (prev.type === TOKEN_TYPES.WHITESPACE) continue;
                break;
            }
            if (!hasPrecedingSvara) {
                issues.push({
                    type: 'error',
                    message: `Invalid contour operator at position ${tok.position}: '~' requires a svara before it`,
                    position: tok.position
                });
                continue;
            }

            // Must have a svara after it
            let hasFollowingSvara = false;
            for (let fwd = idx + 1; fwd < tokens.length; fwd++) {
                const next = tokens[fwd];
                if (next.type === TOKEN_TYPES.SVARA) { hasFollowingSvara = true; break; }
                if (next.type === TOKEN_TYPES.WHITESPACE) continue;
                break;
            }
            if (!hasFollowingSvara) {
                issues.push({
                    type: 'error',
                    message: `Invalid contour operator at position ${tok.position}: '~' requires a svara after it`,
                    position: tok.position
                });
            }
        }
    }
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/tests/notation/notation.validation.test.ts
```

Expected: all gamaka validation tests pass. Existing tests remain green.

- [ ] **Step 5: Commit**

```bash
git add notation_parser.js src/tests/notation/notation.validation.test.ts
git commit -m "feat(validation): reject invalid motion operator usage"
```

---

## Task 6: parseSvarasOnly — flatten MotionNode to settled svara

**Files:**
- Modify: `notation_parser.js`
- Modify: `src/tests/notation/notation.parser.test.ts`

Stats consumers call `parseSvarasOnly()`. Motion nodes must appear as their settled target svara with `totalDuration`.

- [ ] **Step 1: Write the failing tests**

Add to `src/tests/notation/notation.parser.test.ts`:

```ts
describe('parseSvarasOnly with motion nodes', () => {
  it('flattens compact glide to settled target svara with duration 1', () => {
    const svaras = parseSvarasOnly('S/R');
    expect(svaras).toHaveLength(1);
    expect(svaras[0]).toMatchObject({ svara: 'R', octave: 'madhya', duration: 1 });
  });

  it('flattens spaced glide to target with duration 2', () => {
    const svaras = parseSvarasOnly('S / R');
    expect(svaras[0]).toMatchObject({ svara: 'R', duration: 2 });
  });

  it('flattens hold glide S _ _ / R to target with duration 3', () => {
    const svaras = parseSvarasOnly('S _ _ / R');
    expect(svaras[0]).toMatchObject({ svara: 'R', duration: 3 });
  });

  it('flattens ornamented settle to settled target, not the overshoot', () => {
    const svaras = parseSvarasOnly('S ~R1');
    expect(svaras[0]).toMatchObject({ svara: 'R1', duration: 1 });
  });

  it('counts flattened motion svaras alongside plain svaras', () => {
    const svaras = parseSvarasOnly('G1 S/R M1');
    expect(svaras).toHaveLength(3);
    expect(svaras[0].svara).toBe('G1');
    expect(svaras[1].svara).toBe('R');
    expect(svaras[2].svara).toBe('M1');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: parseSvarasOnly tests fail — motion nodes are currently skipped.

- [ ] **Step 3: Add motion handling to parseSvarasOnly() in notation_parser.js**

In `parseSvarasOnly()` (around line 735), find the `for (const note of notes)` loop and add a `motion` branch after the `vega_group` branch:

```js
        if (note.type === 'vega_group') {
            for (const groupedNote of note.notes) {
                svaras.push({ ...groupedNote });
            }
            activeSvara = null;
            continue;
        }

        // NEW: flatten motion node to settled target svara
        if (note.type === 'motion') {
            const svara = {
                type: 'svara',
                svara: note.target.svara,
                svaraName: SVARA_NOTATION[note.target.svara],
                octave: note.target.octave,
                duration: note.totalDuration,
                beatMarker: null,
                line: note.line,
                position: note.position
            };
            svaras.push(svara);
            activeSvara = null; // motion does not extend with _
            continue;
        }
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: all parseSvarasOnly motion tests pass.

- [ ] **Step 5: Commit**

```bash
git add notation_parser.js src/tests/notation/notation.parser.test.ts
git commit -m "feat(parser): flatten MotionNode to settled svara in parseSvarasOnly"
```

---

## Task 7: Sequence builder — MotionNode → SequenceMotion

**Files:**
- Modify: `src/domain/notation/notation.sequence.ts`
- Modify: `src/tests/notation/notation.sequence.test.ts`

- [ ] **Step 1: Write the failing sequence tests**

Add to `src/tests/notation/notation.sequence.test.ts`:

```ts
import type { SequenceMotion } from '../../domain/audio/audio.types';

describe('sequence builder with motion nodes', () => {
  it('maps compact glide to one SequenceMotion with duration 1', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S/R1'));
    expect(sequence.items).toHaveLength(1);
    expect(sequence.items[0]).toMatchObject({
      type: 'motion',
      motionType: 'direct_glide',
      start: { svara: 'S', octave: 'madhya' },
      target: { svara: 'R1', octave: 'madhya' },
      holdBeats: 0,
      glideBeats: 1,
      duration: 1,
      originalIndex: 0
    });
    expect(sequence.sequenceLength).toBe(1);
    expect(sequence.totalUnits).toBe(1);
  });

  it('maps spaced glide to SequenceMotion with duration 2', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S / R1'));
    expect(sequence.items[0]).toMatchObject({ type: 'motion', duration: 2 });
    expect(sequence.totalUnits).toBe(2);
  });

  it('maps hold glide S _ _ / R1 to SequenceMotion with holdBeats=2 duration=3', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S _ _ / R1'));
    expect(sequence.items[0]).toMatchObject({
      type: 'motion',
      motionType: 'hold_then_glide',
      holdBeats: 2,
      glideBeats: 1,
      duration: 3
    });
    expect(sequence.totalUnits).toBe(3);
  });

  it('maps ornamented settle to SequenceMotion with contour', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S ~R1'));
    const item = sequence.items[0] as SequenceMotion;
    expect(item.type).toBe('motion');
    expect(item.motionType).toBe('ornamented_settle');
    expect(item.contour).toBeDefined();
    expect(item.contour!.intermediate.svara).toBe('R2');
  });

  it('assigns sequential originalIndex alongside plain svaras', () => {
    const sequence = buildTimedNotationSequence(parseNotation('G1 S/R1 M1'));
    expect(sequence.items[0]).toMatchObject({ type: 'svara', originalIndex: 0 });
    expect(sequence.items[1]).toMatchObject({ type: 'motion', originalIndex: 1 });
    expect(sequence.items[2]).toMatchObject({ type: 'svara', originalIndex: 2 });
    expect(sequence.sequenceLength).toBe(3);
  });

  it('motion item does not absorb a following _ as sustain', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S/R1 _ M1'));
    // _ after motion becomes silence (activeNote is null after motion)
    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'motion', duration: 1 }),
      expect.objectContaining({ type: 'silence', duration: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'M1' })
    ]);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/notation/notation.sequence.test.ts
```

Expected: motion sequence tests fail — `buildTimedNotationSequence` skips motion nodes.

- [ ] **Step 3: Add MotionNode handling to buildTimedNotationSequence**

Open `src/domain/notation/notation.sequence.ts`. Add the import for `SequenceMotion`:

```ts
import type { SequenceBoundary, SequenceItem, SequenceMotion, SequenceNote, SequenceSilence } from '../audio/audio.types';
```

Add a type guard near the top of the file (after the existing `isSequenceSilence`):

```ts
function isMotionNode(node: ParsedNotationNode): node is import('../notation/notation.types').MotionNode {
  return node.type === 'motion';
}
```

Actually, to avoid the inline import, add the MotionNode import at the top:

```ts
import type { MotionNode, ParsedNotationNode } from './notation.types';
```

And the type guard:

```ts
function isMotionNode(node: ParsedNotationNode): node is MotionNode {
  return node.type === 'motion';
}
```

In `buildTimedNotationSequence`, add a motion branch in the `for (const node of nodes)` loop, **before** the svara check:

```ts
  for (const node of nodes) {
    if (isMotionNode(node)) {
      const item: SequenceMotion = {
        type: 'motion',
        motionType: node.motionType,
        start: { svara: node.start.svara, octave: node.start.octave },
        target: { svara: node.target.svara, octave: node.target.octave },
        holdBeats: node.holdBeats,
        glideBeats: node.glideBeats,
        duration: node.totalDuration,
        contour: node.contour
          ? { intermediate: { svara: node.contour.intermediate.svara, octave: node.contour.intermediate.octave } }
          : undefined,
        originalIndex: noteIndex
      };
      items.push(item);
      noteIndex += 1;
      totalUnits += node.totalDuration;
      activeNote = null;
      continue;
    }

    if (node.type === 'svara') {
      // ... existing svara handling
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/tests/notation/notation.sequence.test.ts
```

Expected: all motion sequence tests pass. Existing tests remain green.

- [ ] **Step 5: Commit**

```bash
git add src/domain/notation/notation.sequence.ts src/tests/notation/notation.sequence.test.ts
git commit -m "feat(sequence): map MotionNode to SequenceMotion in buildTimedNotationSequence"
```

---

## Task 8: Preview tokens — MotionNode → PreviewMotionToken

**Files:**
- Modify: `src/domain/notation/notation.parser.ts`
- Modify: `src/tests/notation/notation.parser.test.ts`

- [ ] **Step 1: Write the failing preview token tests**

Add to `src/tests/notation/notation.parser.test.ts`:

```ts
describe('preview tokens with motion nodes', () => {
  it('emits one PreviewMotionToken per motion expression', () => {
    const preview = buildPreviewNotationTokens(parseNotation('S/R1'));
    expect(preview).toHaveLength(1);
    expect(preview[0]).toMatchObject({
      type: 'motion',
      text: 'S/R1',
      syntax: 'compact_glide',
      noteIndex: 0
    });
  });

  it('preserves authored text exactly for spaced glide', () => {
    const preview = buildPreviewNotationTokens(parseNotation('S / R1'));
    expect((preview[0] as any).text).toBe('S / R1');
    expect((preview[0] as any).syntax).toBe('spaced_glide');
  });

  it('preserves authored text for hold glide with multiple underscores', () => {
    const preview = buildPreviewNotationTokens(parseNotation('S _ _ / R1'));
    expect((preview[0] as any).text).toBe('S _ _ / R1');
    expect((preview[0] as any).syntax).toBe('hold_glide');
  });

  it('assigns sequential noteIndex across mixed svaras and motion', () => {
    const preview = buildPreviewNotationTokens(parseNotation('G1 S/R1 M1'));
    const indexed = preview.filter((t) => 'noteIndex' in t) as any[];
    expect(indexed[0].noteIndex).toBe(0); // G1
    expect(indexed[1].noteIndex).toBe(1); // S/R motion
    expect(indexed[2].noteIndex).toBe(2); // M1
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: preview token tests fail — `buildPreviewNotationTokens` skips motion nodes.

- [ ] **Step 3: Add MotionNode handling to buildPreviewNotationTokens**

Open `src/domain/notation/notation.parser.ts`. Add the `MotionNode` import:

```ts
import type {
  MotionNode,
  NotationToken,
  ParsedNotationNode,
  ParsedSvara,
  PreviewMotionToken,
  PreviewNotationToken,
  PreviewSustainToken,
  PreviewSvaraToken
} from './notation.types';
```

In `buildPreviewNotationTokens`, add a motion branch in the `for (const node of nodes)` loop, **before** the svara check:

```ts
  for (const node of nodes) {
    if (node.type === 'motion') {
      const motionNode = node as MotionNode;
      const token: PreviewMotionToken = {
        type: 'motion',
        text: motionNode.sourceText,
        syntax: motionNode.syntax,
        noteIndex,
        position: motionNode.position,
        endPosition: motionNode.endPosition
      };
      previewTokens.push(token);
      noteIndex += 1;
      continue;
    }

    if (node.type === 'svara') {
      // ... existing svara handling
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/tests/notation/notation.parser.test.ts
```

Expected: all preview token motion tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/notation/notation.parser.ts src/tests/notation/notation.parser.test.ts
git commit -m "feat(parser): emit PreviewMotionToken from buildPreviewNotationTokens"
```

---

## Task 9: Audio engine — continuous pitch automation

**Files:**
- Modify: `src/domain/audio/audio-engine.ts`
- Modify: `src/tests/audio/audio-sequence.test.ts`

- [ ] **Step 1: Write the failing audio tests**

Add to `src/tests/audio/audio-sequence.test.ts`:

```ts
describe('motion playback: frequency automation', () => {
  function makeEngine() {
    const engine = new AudioEngine();
    engine.isInitialized = true;

    const mockFreq = {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn()
    };
    const mockGain = {
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn()
    };
    const mockOsc = {
      type: '',
      frequency: mockFreq,
      connect: vi.fn(),
      onended: null as unknown,
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn()
    };

    engine.audioContext = {
      currentTime: 0,
      createOscillator: vi.fn().mockReturnValue(mockOsc),
      createGain: vi.fn().mockReturnValue(mockGain)
    } as unknown as AudioContext;
    engine.masterGain = mockGain as unknown as GainNode;
    engine.compressor = mockGain as unknown as DynamicsCompressorNode;

    return { engine, mockFreq, mockOsc };
  }

  it('schedules direct glide with linearRamp from start to target over full duration', () => {
    const { engine, mockFreq } = makeEngine();
    engine.setTempo(60); // beatDuration = 1s

    engine.playSequence([
      {
        type: 'motion',
        motionType: 'direct_glide',
        start: { svara: 'S', octave: 'madhya' },
        target: { svara: 'R1', octave: 'madhya' },
        holdBeats: 0,
        glideBeats: 1,
        duration: 1,
        originalIndex: 0
      }
    ], 60);

    // setValueAtTime at t=0 with S frequency
    expect(mockFreq.setValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(261.63, 0), // Sa madhya
      0
    );
    // linearRamp to R1 at t=1s
    expect(mockFreq.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(277.18, 0), // R1 madhya
      1
    );
  });

  it('schedules hold-then-glide: flat hold then ramp to target', () => {
    const { engine, mockFreq } = makeEngine();
    engine.setTempo(60);

    engine.playSequence([
      {
        type: 'motion',
        motionType: 'hold_then_glide',
        start: { svara: 'S', octave: 'madhya' },
        target: { svara: 'R1', octave: 'madhya' },
        holdBeats: 1,
        glideBeats: 1,
        duration: 2,
        originalIndex: 0
      }
    ], 60);

    // Hold: setValueAtTime at glide start (t=1s) to maintain start freq
    expect(mockFreq.setValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(261.63, 0),
      1
    );
    // Glide: ramp to target at t=2s
    expect(mockFreq.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(277.18, 0),
      2
    );
  });

  it('schedules ornamented settle: ramp to overshoot then descend to target', () => {
    const { engine, mockFreq } = makeEngine();
    engine.setTempo(60);

    engine.playSequence([
      {
        type: 'motion',
        motionType: 'ornamented_settle',
        start: { svara: 'S', octave: 'madhya' },
        target: { svara: 'R1', octave: 'madhya' },
        holdBeats: 0,
        glideBeats: 1,
        duration: 1,
        contour: { intermediate: { svara: 'R2', octave: 'madhya' } },
        originalIndex: 0
      }
    ], 60);

    // Ramp to overshoot (R2) at 75% of 1 beat = t=0.75
    expect(mockFreq.linearRampToValueAtTime).toHaveBeenNthCalledWith(
      1,
      expect.closeTo(293.66, 0), // R2 madhya
      0.75
    );
    // Ramp to target (R1) at end of beat = t=1
    expect(mockFreq.linearRampToValueAtTime).toHaveBeenNthCalledWith(
      2,
      expect.closeTo(277.18, 0), // R1 madhya
      1
    );
  });

  it('emits noteIndex event for motion item at its scheduled start time', () => {
    vi.useFakeTimers();
    const { engine } = makeEngine();
    engine.setTempo(60);
    const emittedIndexes: number[] = [];
    engine.on('noteIndex', (e) => emittedIndexes.push((e as { index: number }).index));

    engine.playSequence([
      {
        type: 'motion',
        motionType: 'direct_glide',
        start: { svara: 'S', octave: 'madhya' },
        target: { svara: 'R1', octave: 'madhya' },
        holdBeats: 0,
        glideBeats: 1,
        duration: 1,
        originalIndex: 5
      }
    ], 60);

    vi.runAllTimers();
    expect(emittedIndexes).toContain(5);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run src/tests/audio/audio-sequence.test.ts
```

Expected: motion audio tests fail — `playSequence` ignores `SequenceMotion` items.

- [ ] **Step 3: Add scheduleMotion() to audio-engine.ts**

Open `src/domain/audio/audio-engine.ts`. Add the import for `SequenceMotion`:

```ts
import type { AudioEngineConfig, AudioVoice, SequenceBoundary, SequenceItem, SequenceMotion, SequenceNote, SequenceSilence, SequenceState } from './audio.types';
```

Add type guards near the top of the file (after existing guards):

```ts
function isSequenceMotion(item: SequenceItem): item is SequenceMotion {
  return item.type === 'motion';
}
```

Add the `scheduleMotion` private method to the `AudioEngine` class, before `scheduleSequenceNoteIndex`:

```ts
  private scheduleMotion(item: SequenceMotion, startTime: number): void {
    if (!this.audioContext) return;

    const startFreq = this.getFrequency(item.start.svara, item.start.octave);
    const targetFreq = this.getFrequency(item.target.svara, item.target.octave);
    const totalSeconds = item.duration * this.beatDuration;
    const glideStartTime = startTime + item.holdBeats * this.beatDuration;
    const glideEndTime = startTime + totalSeconds;

    // createVoice sets oscillator.frequency.value = startFreq.
    // The scheduled automation below takes precedence once the automation timeline is active.
    const voice = this.createVoice(startFreq, startTime, totalSeconds, 1, item.start.svara, item.start.octave);

    voice.oscillator.frequency.setValueAtTime(startFreq, startTime);

    if (item.motionType === 'direct_glide') {
      voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEndTime);
    } else if (item.motionType === 'hold_then_glide') {
      // Hold flat at startFreq until glide begins
      voice.oscillator.frequency.setValueAtTime(startFreq, glideStartTime);
      voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEndTime);
    } else if (item.motionType === 'ornamented_settle' && item.contour) {
      const overshootFreq = this.getFrequency(item.contour.intermediate.svara, item.contour.intermediate.octave);
      const overshootTime = startTime + 0.75 * this.beatDuration;
      voice.oscillator.frequency.linearRampToValueAtTime(overshootFreq, overshootTime);
      voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEndTime);
    }

    this.scheduleSequenceNoteIndex(
      { svara: item.start.svara, octave: item.start.octave, originalIndex: item.originalIndex },
      startTime,
      item.originalIndex
    );
  }
```

- [ ] **Step 4: Branch on SequenceMotion in playSequence()**

In `playSequence()`, find the `for (let index = 0; ...)` loop inside `schedule()`. Add a motion branch **before** the silence check:

```ts
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

          // NEW: motion item
          if (isSequenceMotion(note)) {
            this.scheduleMotion(note, cursor);
            hasScheduledPlayableContent = true;
            cursor += note.duration * this.beatDuration;
            continue;
          }

          if (note.rest) {
            // ... existing rest handling
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run src/tests/audio/audio-sequence.test.ts
```

Expected: all motion audio tests pass. Existing tests remain green.

- [ ] **Step 6: Commit**

```bash
git add src/domain/audio/audio-engine.ts src/tests/audio/audio-sequence.test.ts
git commit -m "feat(audio): schedule continuous pitch automation for motion sequence items"
```

---

## Task 10: UI — render motion pills in ParsedNotationCard and PlaybackNotationHighlighter

**Files:**
- Modify: `src/components/notation/ParsedNotationCard.svelte`
- Modify: `src/components/notation/PlaybackNotationHighlighter.svelte`

No automated tests for Svelte components — verify visually by running the dev server.

- [ ] **Step 1: Add motion token rendering to ParsedNotationCard.svelte**

Open `src/components/notation/ParsedNotationCard.svelte`. In the `{#each previewTokens as token}` block, add a motion branch after the `vega_group` branch:

```svelte
      {:else if token.type === 'motion'}
        <span
          class:active={highlightedIndex === token.noteIndex}
          class="token token--motion token--motion-{token.syntax}"
        >
          {token.text}
        </span>
```

Add motion styles at the bottom of the `<style>` block:

```css
  .token--motion {
    font-style: italic;
    background: color-mix(in srgb, var(--accent) 12%, var(--accent-secondary-soft));
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .token--motion-spaced_glide {
    letter-spacing: 0.04em;
  }

  .token--motion-hold_glide {
    border-radius: 6px;
  }

  .token--motion-ornamented_settle {
    font-style: normal;
    background: color-mix(in srgb, var(--accent-strong) 15%, var(--accent-secondary-soft));
  }
```

- [ ] **Step 2: Add motion token rendering to PlaybackNotationHighlighter.svelte**

Open `src/components/notation/PlaybackNotationHighlighter.svelte`. In the `{#each previewTokens as token}` block, add after the `vega_group` branch:

```svelte
          {:else if token.type === 'motion'}
            <span
              data-note-index={token.noteIndex}
              class:active={highlightedIndex === token.noteIndex}
              class="token token--motion token--motion-{token.syntax}"
            >
              {token.text}
            </span>
```

Add matching styles at the bottom of the `<style>` block:

```css
  .token--motion {
    font-style: italic;
    background: rgba(170, 218, 254, 0.45);
    box-shadow: inset 0 0 0 1.5px rgba(47, 101, 120, 0.25);
  }

  .token--motion.active {
    background: linear-gradient(135deg, #2f6578 0%, #6fa3b8 100%);
    color: #fcf9f2;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(47, 101, 120, 0.18);
    font-style: italic;
  }

  .token--motion-hold_glide {
    border-radius: 6px;
  }

  .token--motion-ornamented_settle {
    font-style: normal;
  }
```

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```

Open the app in a browser. Enter `S/R1 G1 S / R1 M1 S _ / R1 P S ~N3` in the notation input. Parse it. Verify:
- Motion tokens appear as styled pills with their authored text
- Compact, spaced, hold, and ornamented forms look visually distinct
- Playback highlights each motion pill as one unit

- [ ] **Step 4: Commit**

```bash
git add src/components/notation/ParsedNotationCard.svelte src/components/notation/PlaybackNotationHighlighter.svelte
git commit -m "feat(ui): render motion expression pills in notation preview and live highlighter"
```

---

## Task 11: Regression — verify existing notation is unchanged

**Files:**
- Modify: `src/tests/notation/notation.parser.test.ts`
- Modify: `src/tests/notation/notation.sequence.test.ts`

- [ ] **Step 1: Add regression assertions for existing notation**

Add to `src/tests/notation/notation.parser.test.ts`:

```ts
describe('regression: existing notation unaffected by gamaka changes', () => {
  it('plain svaras parse identically to pre-feature output', () => {
    const nodes = parseNotation('S R1 G1 M1 | P D1 N1 ||');
    expect(nodes.filter((n) => n.type === 'svara')).toHaveLength(7);
    expect(nodes.filter((n) => (n as any).type === 'motion')).toHaveLength(0);
  });

  it('sustain units still extend the preceding svara', () => {
    const svaras = parseSvarasOnly('S _ _ R1');
    expect(svaras[0]).toMatchObject({ svara: 'S', duration: 3 });
    expect(svaras[1]).toMatchObject({ svara: 'R1', duration: 1 });
  });

  it('Vega groups parse and sequence identically', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S [R2 G2] P'));
    expect(sequence.items[0]).toMatchObject({ type: 'svara', svara: 'S' });
    expect(sequence.items[1]).toMatchObject({ type: 'svara', svara: 'R2', duration: 0.5 });
    expect(sequence.items[2]).toMatchObject({ type: 'svara', svara: 'G2', duration: 0.5 });
    expect(sequence.items[3]).toMatchObject({ type: 'svara', svara: 'P' });
  });

  it('beat and phrase markers produce boundary items as before', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S | R1 ||'));
    const boundaries = sequence.items.filter((i) => i.type === 'boundary');
    expect(boundaries).toHaveLength(2);
  });

  it('preview tokens for plain notation have unchanged noteIndex and octaveDisplay', () => {
    const preview = buildPreviewNotationTokens(parseNotation("S R1 G1\nS' ||"));
    const svaraTokens = preview.filter((t) => t.type === 'svara') as any[];
    expect(svaraTokens[0]).toMatchObject({ text: 'S', noteIndex: 0, octaveDisplay: null });
    expect(svaraTokens[3]).toMatchObject({ text: 'S', noteIndex: 3, octaveDisplay: 'sup' });
  });
});
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test
```

Expected: all tests pass — zero regressions.

- [ ] **Step 3: Run the full validation pipeline**

```bash
npm run validate
```

Expected: `check` (TypeScript) + `lint` + `test` all pass.

- [ ] **Step 4: Commit**

```bash
git add src/tests/notation/notation.parser.test.ts src/tests/notation/notation.sequence.test.ts
git commit -m "test(regression): verify existing notation unchanged after gamaka feature"
```

---

## Definition of Done

- [ ] All four v1 gamaka syntaxes (`S/R`, `S / R`, `S _ / R`, `S ~R1`) parse into deterministic `MotionNode` entries
- [ ] Multiple underscores in hold glide (`S _ _ / R`) work correctly
- [ ] Invalid gamaka syntax is rejected with clear validation errors
- [ ] Playback schedules continuous pitch automation using `linearRampToValueAtTime`
- [ ] Preview/highlighter surfaces preserve authored motion syntax and highlight atomically
- [ ] Legacy notation remains backward compatible
- [ ] `npm run validate` passes clean
