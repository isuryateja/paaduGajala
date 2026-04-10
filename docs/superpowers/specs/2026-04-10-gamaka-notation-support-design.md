# Gamaka Notation Support — Design

**Date:** 2026-04-10  
**Spec ref:** specs/012-gamaka-notation-support/spec.md  
**Status:** Approved

---

## Summary

Add four gamaka-like notation forms to the parser, sequencer, and audio engine. Authors write pitch-motion expressions directly in notation text. The parser collapses each expression into a single `MotionNode`. The audio engine renders continuous pitch curves using Web Audio frequency automation. The UI displays motion tokens as styled pills in the existing parsed-preview and live-highlighter surfaces.

Motion-curve visualization (SVG/canvas curve per node) is **deferred** to a follow-up story.

---

## Decisions made during brainstorming

### 1. Cross-octave overshoot for `~`
When `S ~N3` is parsed and N3 is the highest distinct pitch in the active octave, the contour resolver **borrows the Sa of the next higher octave** as the overshoot point rather than failing. If even cross-octave resolution fails (no next octave), parsing errors with a validation message.

### 2. Contour preview labels
The authored syntax is preserved exactly as written (`S ~R1`). The resolved overshoot svara is stored on the `MotionNode` for audio use but **not surfaced in the preview text**. No intermediate label is shown.

### 3. Visualization deferred
FR-27, FR-28, and AC-6 from the original spec are **out of scope for v1**. Motion tokens render as distinctly styled pills — no SVG curve in this story.

### 4. Double-underscore hold-glide is valid
`S _ _ / R` and longer forms are valid. The `_` semantics are **consistent with existing notation**: each `_` before `/` contributes one full beat of hold. The `/` always contributes exactly one beat of glide.

```
S _ / R     → 2 beats total: 1 hold + 1 glide
S _ _ / R   → 3 beats total: 2 hold + 1 glide
S _ _ _ / R → 4 beats total: 3 hold + 1 glide
```

The `holdRatio` field from the original spec is replaced by explicit `holdBeats` and `glideBeats` integer fields.

### 5. Implementation approach
Extend `notation_parser.js` directly (Approach 1). All motion tokenization and `MotionNode` construction live in the legacy JS parser. The TypeScript layer adds types and handles `MotionNode` in sequencing, preview tokens, and audio scheduling — exactly as it already handles `VegaGroupNode`.

---

## Supported notation forms

```
compact_glide:      S/R          → direct_glide,     1 beat
spaced_glide:       S / R        → direct_glide,     2 beats
hold_glide:         S _ / R      → hold_then_glide,  N+1 beats (N underscores)
ornamented_settle:  S ~R1        → ornamented_settle, 1 beat
```

All four forms are parsed into one `MotionNode` each. Each counts as one `originalIndex` in the sequence.

---

## Architecture

| Layer | Changes |
|---|---|
| `notation_parser.js` | Tokenizer emits `motion_operator` (`/`) and `contour_operator` (`~`); parser assembles `MotionNode`; `parseSvarasOnly()` flattens motion to settled svara |
| `notation.types.ts` | Adds `MotionNode`, `SequenceMotion`, `PreviewMotionToken` types |
| `notation.parser.ts` | `buildPreviewNotationTokens()` handles `MotionNode` → one `PreviewMotionToken` |
| `notation.sequence.ts` | `buildTimedNotationSequence()` handles `MotionNode` → one `SequenceMotion` |
| `audio-engine.ts` | New `scheduleMotion()` private method; `playSequence()` branches on `SequenceMotion` |
| `ParsedNotationCard.svelte` | Renders motion pills with distinct style per syntax type |
| `PlaybackNotationHighlighter.svelte` | Highlights motion token as one atomic unit |

No new routes, stores, action files, or pages.

---

## Data model

### `MotionNode`

```ts
type MotionNode = {
  type: 'motion';
  motionType: 'direct_glide' | 'hold_then_glide' | 'ornamented_settle';
  syntax: 'compact_glide' | 'spaced_glide' | 'hold_glide' | 'ornamented_settle';
  start: ParsedSvara;
  target: ParsedSvara;
  holdBeats: number;     // 0 for glides, N for hold_then_glide
  glideBeats: number;    // 1 for hold_glide/ornamented_settle; 1 or 2 for direct_glide
  totalDuration: number; // holdBeats + glideBeats
  contour?: {
    intermediate: ParsedSvara;  // resolved overshoot svara (may be cross-octave)
    ascentRatio: number;        // 0.75
    descentRatio: number;       // 0.25
  };
  sourceText: string;    // exactly as authored, for preview token text
  line: number;
  position: number;
  endPosition: number;
};
```

### `SequenceMotion`

```ts
type SequenceMotion = {
  type: 'motion';
  motionType: MotionNode['motionType'];
  start: { svara: string; octave: OctaveName };
  target: { svara: string; octave: OctaveName };
  holdBeats: number;
  glideBeats: number;
  duration: number;
  contour?: {
    intermediate: { svara: string; octave: OctaveName };
  };
  originalIndex: number;
};
```

### `PreviewMotionToken`

```ts
type PreviewMotionToken = {
  type: 'motion';
  text: string;           // exactly as authored
  syntax: MotionNode['syntax'];
  noteIndex: number;
  position: number;
  endPosition: number;
};
```

---

## Tokenizer changes

New token types added to `TOKEN_TYPES` in `notation_parser.js`:

```js
MOTION_OPERATOR: 'motion_operator',   // '/'
CONTOUR_OPERATOR: 'contour_operator', // '~'
```

Whitespace tokens are preserved (already emitted) until motion pattern detection completes. The tokenizer scan order puts `//` and `~` detection before the existing `unknown` fallthrough.

---

## Parser: motion pattern detection

Runs as a post-tokenization pass inside `parseNotation()`. Scans the flat token stream left-to-right for motion patterns. When a pattern is matched, the constituent tokens are consumed and replaced with one `MotionNode`.

**Pattern matching rules (in priority order):**

1. `svara (ws+ "_")+ ws+ "/" ws+ svara` → `hold_then_glide`
2. `svara ws+ "/" ws+ svara` → `spaced_glide` (direct_glide, 2 beats)
3. `svara "/" svara` → `compact_glide` (direct_glide, 1 beat)
4. `svara ws* "~" ws* svara` → `ornamented_settle`

**Overshoot resolution for `~`:**
1. Get the target svara's frequency in the active tuning
2. Walk the svara-frequency ladder upward in the same octave for the next distinct higher frequency
3. If none found, try the Sa of the next higher octave
4. If still none, fail with a validation error
5. Store the resolved svara + octave on `contour.intermediate`

**Validation errors emitted for:**
- Missing start svara: `/ R`, `~R1` at line start
- Missing target svara: `S /`, `S ~`
- Motion inside Vega group
- Motion spanning a newline
- Unsupported chaining: `S / ~R`

---

## `parseSvarasOnly()` flattening

Each `MotionNode` maps to one `ParsedSvara` using:
- `svara` and `octave` from `target` (the settled pitch)
- `duration` = `totalDuration`

Intermediate control points are not exposed.

---

## Sequence builder

`buildTimedNotationSequence()` in `notation.sequence.ts` adds a `MotionNode` branch:

```ts
if (node.type === 'motion') {
  const item: SequenceMotion = {
    type: 'motion',
    motionType: node.motionType,
    start: { svara: node.start.svara, octave: node.start.octave },
    target: { svara: node.target.svara, octave: node.target.octave },
    holdBeats: node.holdBeats,
    glideBeats: node.glideBeats,
    duration: node.totalDuration,
    contour: node.contour ? { intermediate: { svara: node.contour.intermediate.svara, octave: node.contour.intermediate.octave } } : undefined,
    originalIndex: noteIndex
  };
  items.push(item);
  noteIndex += 1;
  totalUnits += node.totalDuration;
  activeNote = null;  // motion does not extend with _
  continue;
}
```

---

## Preview token builder

`buildPreviewNotationTokens()` in `notation.parser.ts` adds a `MotionNode` branch:

```ts
if (node.type === 'motion') {
  previewTokens.push({
    type: 'motion',
    text: node.sourceText,  // exactly as authored
    syntax: node.syntax,
    noteIndex,
    position: node.position,
    endPosition: node.endPosition
  });
  noteIndex += 1;
  continue;
}
```

---

## Audio automation

`playSequence()` in `audio-engine.ts` adds a branch for `SequenceMotion` items, calling a new private method:

```ts
private scheduleMotion(item: SequenceMotion, startTime: number): void {
  const startFreq = this.getFrequency(item.start.svara, item.start.octave);
  const targetFreq = this.getFrequency(item.target.svara, item.target.octave);
  const totalSeconds = item.duration * this.beatDuration;
  const glideStart = startTime + item.holdBeats * this.beatDuration;
  const glideEnd = startTime + totalSeconds;

  // Create one voice for the full duration at startFreq.
  // createVoice() sets oscillator.frequency.value = startFreq.
  // The subsequent setValueAtTime/linearRampToValueAtTime calls below take
  // precedence over the static .value once the automation timeline is active.
  const voice = this.createVoice(startFreq, startTime, totalSeconds, 1, item.start.svara, item.start.octave);

  // Automate frequency
  voice.oscillator.frequency.setValueAtTime(startFreq, startTime);

  if (item.motionType === 'direct_glide') {
    voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEnd);

  } else if (item.motionType === 'hold_then_glide') {
    voice.oscillator.frequency.setValueAtTime(startFreq, glideStart);  // hold flat
    voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEnd);

  } else if (item.motionType === 'ornamented_settle' && item.contour) {
    const overshootFreq = this.getFrequency(item.contour.intermediate.svara, item.contour.intermediate.octave);
    const overshootTime = startTime + 0.75 * this.beatDuration;
    voice.oscillator.frequency.linearRampToValueAtTime(overshootFreq, overshootTime);
    voice.oscillator.frequency.linearRampToValueAtTime(targetFreq, glideEnd);
  }

  this.scheduleSequenceNoteIndex({ svara: item.start.svara, octave: item.start.octave, originalIndex: item.originalIndex }, startTime, item.originalIndex);
}
```

---

## UI: motion token rendering

`ParsedNotationCard.svelte` adds a `motion` branch in the token loop. Each syntax type gets a distinct visual style:

- `compact_glide` — tight pill with slash glyph
- `spaced_glide` — wider pill with spaced slash glyph  
- `hold_glide` — pill with underscore-slash glyph
- `ornamented_settle` — pill with tilde glyph

All four highlight with the same `.active` class used by plain svara tokens.

---

## Testing plan

### Parser tests (`notation.parser.test.ts`)
- All four forms parse to correct `MotionNode` shape
- Hold-glide with 1, 2, 3 underscores produces correct `holdBeats` / `totalDuration`
- Descending glides (`N2/D2`)
- Octave-marked motion (`S'/N2`)
- Cross-octave overshoot for `S ~N3` in madhya
- All invalid forms produce validation errors

### Sequence tests (`notation.sequence.test.ts`)
- Each motion node produces one `SequenceMotion` with correct `originalIndex`
- `totalUnits` accumulates correctly alongside plain svaras
- Motion adjacent to `|`, `||`, `,`, `_` (after the motion) behaves correctly

### Preview token tests (`notation.parser.test.ts`)
- One `PreviewMotionToken` per motion node
- `noteIndex` matches sequence `originalIndex`
- Authored text preserved exactly

### Audio tests (`audio-sequence.test.ts`)
- `scheduleMotion` schedules correct number of `setValueAtTime` / `linearRampToValueAtTime` calls
- Hold-then-glide holds flat then ramps
- Ornamented-settle ramps to overshoot then descends to target

### Regression tests
- All existing notation parses, sequences, and previews identically to pre-feature output

---

## Out of scope (v1)

- Motion-curve SVG/canvas visualization
- Motion inside Vega groups
- Raga-aware or bani-specific gamaka shaping
- Repeated oscillation families
- Contour chaining (`S / ~R`)
- Learned or audio-derived curves
