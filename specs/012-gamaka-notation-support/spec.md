# Story 12: Basic Gamaka Support v1

## 1. Summary
- Problem:
  The notation system currently models playback as discrete svara events with optional sustain and beat rests, so it cannot express controlled pitch motion such as glides, hold-then-glide phrases, or overshoot-and-settle ornaments.
- Goal:
  Add deterministic gamaka-like motion support for four new notations: `S/R`, `S / R`, `S _ / R`, and `S ~R1`, covering parser semantics, motion-aware timing, smooth playback, validation, and a visual motion preview.
- Outcome:
  Authors can encode basic pitch movement directly in notation text, the parser preserves those constructs as semantic motion nodes, playback renders them as continuous pitch curves instead of stepped jumps, and the UI distinguishes each form clearly.

## 2. Scope
- In scope:
  tokenizer support for `/` and `~`; whitespace-sensitive parsing to distinguish `S/R` from `S / R`; semantic motion AST nodes; deterministic duration resolution; contour resolution against the active svara-frequency ladder; motion-aware playback scheduling using continuous oscillator frequency automation; live-notation preview updates for motion expressions; a lightweight pitch-curve visualization for gamaka nodes; validation and regression tests.
- Out of scope:
  raga-aware gamaka rules; bani-specific shaping; repeated oscillation families; configurable multi-underscore weighting; `S _ _ / R`; contour chaining such as `S / ~R`; learned or audio-derived gamaka curves; sampler-based realism; arbitrary control-point syntax beyond the four supported forms.

## 3. Actors and Context
- Primary actors/users:
  notation authors entering Carnatic notation in the main player; learners using playback and preview to understand the phrase shape.
- Systems/services involved:
  `notation_parser.js`; `src/domain/notation/*`; `src/domain/pitch/*`; `src/domain/audio/*`; `src/app/actions/playback.actions.ts`; `src/components/notation/ParsedNotationCard.svelte`; `src/components/notation/PlaybackNotationHighlighter.svelte`; new motion-preview rendering introduced by this story.
- Roles and permissions:
  no role differences; all users can author and play the supported gamaka syntax.

## 4. Functional Requirements
- FR-1:
  The tokenizer MUST recognize `/` as a `motion_operator` token and `~` as a `contour_operator` token without breaking existing svara, sustain, rest, Vega-group, rhythm-marker, newline, or whitespace tokenization.
- FR-2:
  The parser MUST distinguish `S/R` from `S / R` by preserving surrounding whitespace tokens until motion parsing completes.
- FR-3:
  The parser MUST collapse each valid gamaka expression into one semantic motion node rather than normalizing it into ordinary svara plus punctuation tokens.
- FR-4:
  The parser MUST support exactly these v1 forms:
  `compact_glide := svara "/" svara`
  `spaced_glide := svara ws+ "/" ws+ svara`
  `hold_glide := svara ws+ "_" ws+ "/" ws+ svara`
  `ornamented_settle := svara ws* "~" ws* svara`
- FR-5:
  `S/R` MUST resolve to a one-beat direct glide whose pitch begins at `S`, moves immediately toward `R`, and reaches `R` at the end of that same beat.
- FR-6:
  `S / R` MUST resolve to an expanded direct glide whose total duration is `2` beats in v1, so it is never timing-equivalent to `S/R`.
- FR-7:
  `S _ / R` MUST resolve to a one-beat hold-then-glide motion whose first `50%` remains flat at `S` and whose final `50%` glides continuously to `R`.
- FR-8:
  `S ~R1` MUST resolve to a one-beat ornamented-settle motion whose first `75%` ascends from `S` to the next higher distinct pitch above the target and whose final `25%` descends to settle on `R1`.
- FR-9:
  The overshoot point for `~` MUST be resolved from the active svara-frequency ladder rather than hard-coded per expression.
- FR-10:
  When multiple svara labels map to the same pitch tier, the overshoot resolver MUST choose the next higher distinct frequency, then persist the normalized svara label used by the app for that pitch.
- FR-11:
  The parser MUST reject missing-target forms such as `S /`, `S/`, `S ~`, `/ R`, and `~R1`.
- FR-12:
  The parser MUST reject unsupported combinations in v1, including `S _ _ / R`, `S _ ~R`, `S / ~R`, chained contour expressions, and motion operators inside Vega groups.
- FR-13:
  Invalid gamaka syntax MUST surface as notation validation errors and MUST block playback in the same way existing invalid notation does.
- FR-14:
  Motion nodes MUST preserve source positions so the existing preview/highlighter can keep editor alignment and note-index behavior deterministic.
- FR-15:
  `parseNotationByLines()` MUST keep each motion expression on one line and MUST reject motion syntax split by newline.
- FR-16:
  `parseSvarasOnly()` MUST remain available for lightweight stats and validation, but MUST flatten each motion node to its settled target svara with the motion node's total duration instead of exposing intermediate control points.
- FR-17:
  `buildTimedNotationSequence()` MUST support motion-aware playable items instead of reducing every playable event to a discrete fixed-pitch note.
- FR-18:
  A direct glide item MUST generate a monotonic continuous pitch curve with no leading flat hold.
- FR-19:
  A hold-then-glide item MUST generate a flat segment at the start pitch followed by a monotonic continuous glide to the target.
- FR-20:
  An ornamented-settle item MUST generate a smooth ascent to the resolved overshoot pitch followed by a smooth descent to the target, ending exactly on the target frequency.
- FR-21:
  Motion playback MUST use continuous frequency automation on the active oscillator so output is audibly smooth and avoids stepped MIDI-like jumps.
- FR-22:
  Motion playback MUST avoid clicks and zipper noise by using scheduled value curves or short-segment interpolation rather than per-frame Reactivity-driven retuning.
- FR-23:
  Sequence timing MUST remain deterministic: the same parsed notation, tempo, and tuning produce the same motion envelope every time.
- FR-24:
  The live notation preview MUST preserve the authored gamaka syntax text exactly as entered while still allowing the active motion expression to highlight during playback.
- FR-25:
  Motion expressions MUST count as one playable sequence index each, even when their visual text contains a start svara, operator, target svara, or contour peak.
- FR-26:
  The parsed-preview and live-highlighter surfaces MUST visibly distinguish:
  `S/R` as one continuous short glide,
  `S / R` as an extended glide,
  `S _ / R` as hold plus glide,
  `S ~R1` as overshoot plus settle.
- FR-27:
  The UI MUST provide a motion-curve visualization for parsed motion nodes, using SVG or canvas, so the user can see the shape difference between glide, hold-then-glide, and ornamented-settle.
- FR-28:
  If motion visualization is unavailable for a given node, the notation preview MUST still render the original syntax and playback MUST remain functional.
- FR-29:
  Existing notation that does not use the new motion syntax MUST parse, preview, validate, and play exactly as before.

## 5. Data and Interfaces
- Inputs:
  raw notation text containing existing svara syntax plus the supported motion patterns; active tempo; active tuning/base frequency.
- Outputs:
  parsed notation containing motion nodes; playback sequence containing fixed-pitch notes, motion events, silences, and boundaries; preview tokens that preserve source text and motion grouping; optional curve-render data for UI visualization.
- Data model/entities:
  - `NotationToken.type` adds `motion_operator` and `contour_operator`.
  - `MotionType` is:
    `direct_glide | hold_then_glide | ornamented_settle`.
  - `MotionNode` is:
    ```ts
    type MotionNode = {
      type: 'motion';
      motionType: 'direct_glide' | 'hold_then_glide' | 'ornamented_settle';
      syntax: 'compact_glide' | 'spaced_glide' | 'hold_glide' | 'ornamented_settle';
      start: ParsedSvara;
      target: ParsedSvara;
      totalDuration: number;
      compact?: boolean;
      holdRatio?: number;
      contour?: {
        intermediate: ParsedSvara;
        ascentRatio: number;
        descentRatio: number;
      };
      line: number;
      position: number;
      endPosition: number;
    };
    ```
  - `ParsedNotationNode` expands to include `MotionNode`.
  - `SequenceItem` expands with:
    ```ts
    type SequenceMotion = {
      type: 'motion';
      motionType: MotionNode['motionType'];
      start: { svara: string; octave: OctaveName };
      target: { svara: string; octave: OctaveName };
      duration: number;
      holdRatio?: number;
      contour?: {
        intermediate: { svara: string; octave: OctaveName };
        ascentRatio: number;
        descentRatio: number;
      };
      originalIndex: number;
    };
    ```
  - `PreviewNotationToken` adds:
    ```ts
    type PreviewMotionToken = {
      type: 'motion';
      text: string;
      syntax: MotionNode['syntax'];
      noteIndex: number;
      position: number;
      endPosition: number;
    };
    ```
  - `MotionCurvePoint` is:
    ```ts
    type MotionCurvePoint = {
      t: number;
      frequency: number;
    };
    ```
- API or event contracts:
  - `tokenize()` returns `/` and `~` tokens in source order and preserves whitespace needed to disambiguate compact versus spaced glide.
  - `parseNotation()` emits `MotionNode` entries inline with existing parsed nodes.
  - `parseSvarasOnly()` returns one flattened settled svara per motion node for stats-only consumers.
  - `buildPreviewNotationTokens()` emits one `PreviewMotionToken` per motion node and does not assign extra note indexes to internal control points.
  - `buildTimedNotationSequence()` emits `SequenceMotion` items and counts each motion node as one playable index.
  - `AudioEngine.playSequence()` accepts `SequenceMotion` and schedules continuous pitch automation over the item's duration.
  - A new `generateMotionCurvePoints(node, tuning)` helper returns normalized curve points for preview rendering and audio scheduling tests.
- Validation rules:
  - `_` is valid inside `S _ / R` only in the exact single-underscore form.
  - `/` requires a start svara before it and a target svara after it.
  - `~` requires a start svara before it and a target svara after it.
  - Gamaka operators are invalid inside Vega groups in v1.
  - Newlines cannot appear inside a motion expression.

## 6. Flow and Logic
- Main flow:
  tokenize source including whitespace-sensitive motion operators -> parse supported gamaka patterns into `MotionNode` entries -> validate motion syntax and target resolution -> build motion-aware preview tokens -> build motion-aware timed sequence -> resolve each svara/control point to frequency -> generate pitch curves -> schedule oscillator frequency automation -> render matching motion curves in the UI.
- Alternate flows:
  - `S/R` emits one `direct_glide` motion node of `1` beat.
  - `S / R` emits one `direct_glide` motion node of `2` beats.
  - `S _ / R` emits one `hold_then_glide` motion node of `1` beat with `holdRatio = 0.5`.
  - `S ~R1` emits one `ornamented_settle` motion node of `1` beat with a resolved overshoot point and `0.75 / 0.25` split.
- State transitions:
  playback state remains `ready -> playing -> paused -> ready`; gamaka support must not add a new global playback mode.
- Business rules:
  - Motion constants are fixed in v1 and live in code as named constants for future configurability.
  - The settled target svara, not the overshoot point, defines the ending pitch and the flattened stats-facing svara.
  - Motion expressions are atomic playable units for indexing and highlighting.
  - Existing top-level `_`, `,`, `|`, `||`, and Vega-group behavior remains unchanged outside the supported motion patterns.

## 7. Edge Cases and Failure Handling
- Edge cases:
  descending glides such as `N2/D2`; octave-marked motion such as `S'/N2`; `S ~N3` when the target is already the highest supported pitch tier in the current octave; motion adjacent to separators; motion at line start or line end; mixed plain notes and motion expressions in the same phrase.
- Error conditions:
  invalid svara names; missing motion target; multiple underscores in hold-glide; motion syntax spanning a newline; contour target with no resolvable higher distinct pitch in the active ladder; unsupported operator chaining.
- Retries/timeouts/fallbacks:
  if the contour resolver cannot find a valid overshoot pitch, parsing fails with a validation error rather than silently degrading to a direct glide.
  if motion-curve preview generation fails, the notation preview still renders the original syntax text and playback validation reports the underlying error during development.

## 8. Non-Functional Requirements
- Performance:
  parsing and motion-node construction must remain linear in notation length.
  motion-curve generation should be lightweight enough for live preview updates on ordinary phrase sizes without visible lag.
- Reliability:
  motion timing, overshoot resolution, and highlight indexing must be deterministic across repeated parses and playbacks.
- Security/privacy/compliance:
  no external I/O is introduced; all parsing, playback, and visualization remain local.
- Accessibility:
  motion visualization must not be the sole carrier of meaning; the authored syntax stays visible as text.
  active motion highlighting must preserve existing keyboard and screen-reader expectations for the live notation panel.
- Audio quality:
  pitch movement must sound continuous and intentional, without abrupt stepped retuning, boundary clicks, or audible zipper artifacts.
- Observability (logs/metrics/traces/alerts):
  parser and motion-resolution failures should remain visible in existing validation output and development diagnostics; no new production telemetry is required.

## 9. Dependencies and Constraints
- External dependencies:
  existing Web Audio API oscillator automation; existing svara-frequency lookup modules; existing SvelteKit/Vite/Vitest toolchain.
- Technical constraints:
  implementation must fit the legacy parser core in `notation_parser.js` and the TypeScript wrappers in `src/domain/notation/*`.
  current `AudioEngine` assumes fixed-frequency voices, so this story requires a motion-capable scheduling path without regressing plain note playback.
  current preview/highlighter components index individual svara tokens, so motion support must introduce atomic motion preview tokens rather than faking multiple discrete notes for one motion event.
  the current pitch ladder contains multiple named svaras that may share pitch positions; contour resolution must use distinct frequencies, not naive array adjacency.
- Operational constraints:
  release must remain backward compatible with all existing notation used by the app and tests.

## 10. Rollout and Migration
- Release strategy:
  ship as a backward-compatible enhancement to the main notation parser and playback engine.
- Backward compatibility:
  notation with no gamaka syntax must behave exactly as before.
  invalid gamaka syntax must fail validation instead of being ignored or approximated.
- Data migration:
  none.
- Rollback plan:
  revert motion tokenization, `MotionNode` parsing, motion sequence items, audio automation changes, and motion-preview rendering; existing notation remains valid after rollback because the syntax is additive.

## 11. Acceptance Criteria
- AC-1:
  Given `S/R`, when parsing and playback run, then the system emits one compact direct-glide motion of exactly `1` beat and the pitch reaches `R` at the end of that beat.
- AC-2:
  Given `S / R`, when parsing and playback run, then the system emits one expanded direct-glide motion of exactly `2` beats and does not treat it as timing-equivalent to `S/R`.
- AC-3:
  Given `S _ / R`, when parsing and playback run, then the system holds `S` for the first half of the beat and glides to `R` in the second half.
- AC-4:
  Given `S ~R1`, when parsing and playback run, then the system rises to the resolved higher distinct pitch above `R1`, then settles back on `R1` within `1` beat.
- AC-5:
  Given notation containing any of the four supported gamaka forms, when the parsed preview and live notation render, then the authored syntax remains visible and each motion expression highlights as one playable unit.
- AC-6:
  Given parsed motion nodes, when the motion-curve visualization renders, then compact glide, spaced glide, hold-then-glide, and ornamented-settle are visually distinct.
- AC-7:
  Given invalid gamaka syntax such as `S /`, `S ~`, `/ R`, or `S _ _ / R`, when validation runs, then the input is rejected with an error and playback does not start.
- AC-8:
  Given legacy notation with no gamaka syntax, when parsed, previewed, and played, then behavior is unchanged from pre-feature output.
- AC-9:
  Given motion playback at a supported tempo, when the user listens through headphones or speakers, then pitch transitions are smooth and free of obvious clicks or zipper noise.

## 12. Implementation Plan
- Task breakdown:
  - Extend tokenization in `notation_parser.js` to emit `/` and `~` tokens while preserving whitespace significance for motion parsing.
  - Add motion parsing and validation in `notation_parser.js`, plus TypeScript type updates in `src/domain/notation/notation.types.ts`.
  - Introduce motion-aware preview tokens in `src/domain/notation/notation.parser.ts` and adapt notation preview/highlighter components to render motion expressions atomically.
  - Extend `src/domain/notation/notation.sequence.ts` and `src/domain/audio/audio.types.ts` with `SequenceMotion`.
  - Add a motion-capable playback path in `src/domain/audio/audio-engine.ts` that automates oscillator frequency over time for direct glide, hold-then-glide, and ornamented-settle.
  - Add a dedicated motion-curve generator module for shared audio/test/UI use.
  - Add a lightweight motion-curve UI surface, likely adjacent to the parsed-preview/live-notation cards.
  - Add parser, validation, sequence, preview, and audio regression tests.
- Suggested order:
  1. Token and AST contract updates
  2. Validation rules and parser lowering
  3. Sequence-item and preview-token integration
  4. Frequency automation and audio smoothing
  5. Motion-curve visualization
  6. Regression coverage
- Risks and mitigations:
  - Risk: trying to express motion as many tiny fixed notes creates audible stepping. Mitigation: add a true motion item with oscillator automation.
  - Risk: `S / R` and `S/R` collapse together if whitespace is discarded too early. Mitigation: preserve whitespace tokens until motion parsing resolves.
  - Risk: contour overshoot picks the wrong pitch because of enharmonic-like Carnatic aliases. Mitigation: resolve by distinct frequency tier, then normalize back to the app's canonical svara label.
  - Risk: preview/highlighter indexing drifts. Mitigation: treat each motion expression as one atomic preview token with one `noteIndex`.

## 13. Testing Plan
- Unit tests:
  tokenizer tests for `/`, `~`, and whitespace-sensitive compact versus spaced glide;
  parser tests for all four supported forms;
  contour-resolution tests covering distinct-frequency overshoot selection;
  validation tests for missing targets and unsupported combinations.
- Integration tests:
  sequence-builder tests confirming total duration, sequence length, and coexistence with `_`, `,`, `|`, `||`, and plain svaras;
  preview-token tests confirming one `noteIndex` per motion expression and preserved authored text;
  motion-curve generator tests confirming expected shape families and endpoint frequencies.
- End-to-end tests:
  audio-engine tests using fake timers and mocked `AudioParam` scheduling to confirm frequency automation timing;
  route/playback tests confirming live highlighting and backward compatibility with legacy notation.
- Negative/failure tests:
  contour resolver fails cleanly when no higher distinct pitch exists;
  invalid chained operators fail validation;
  Vega-group plus motion combinations remain rejected in v1.

## 14. Assumptions and Open Questions
- Assumptions:
  - `S / R` is fixed at `2` beats in v1 because the current notation engine has no other spaced-slash duration source. Risk: medium.
  - `parseSvarasOnly()` may flatten a motion to its settled target because stats consumers do not need intermediate pitch motion detail. Risk: medium.
  - A lightweight SVG motion preview is sufficient for v1; a full continuous pitch graph editor is not required. Risk: low.
- Open questions:
  - Should contour preview labels show the normalized overshoot svara, such as `G1`, when the authored syntax only names the target?
  - Should `S ~N3` in the top supported octave be invalid, or should it borrow the next octave's `S` as the overshoot point?
  - Should motion syntax inside future Vega groups be designed as a follow-up story or remain permanently disallowed?
- Decision owners:
  notation/playback maintainer.

## 15. Definition of Done
- Completion checklist:
  - All four v1 gamaka syntaxes parse into deterministic motion nodes.
  - Invalid gamaka syntax is rejected with clear validation failures.
  - Playback supports smooth continuous pitch automation for motion events.
  - Preview/highlighter surfaces preserve authored motion syntax and atomic highlighting.
  - Motion-curve visualization distinguishes the supported forms.
  - Legacy notation remains backward compatible.
  - Automated tests cover parser, timing, preview, audio, and regression behavior.
