# Story 10: Support sustain `_` inside Vega / sub-beat svara grouping

## 1. Summary
- Problem: Vega groups currently accept only svaras, so notation authors cannot hold a note across multiple sub-slots within a single beat.
- Goal: Support `_` inside bracketed Vega groups such as `[R2 _ G2 _]`, where `_` extends the previously started note within that same group.
- Outcome: Parsing, validation, preview rendering, timed-sequence building, and playback preserve one-beat Vega grouping while allowing intra-beat sustain.

## 2. Scope
- In scope: bracket syntax with mixed grouped svara and `_` tokens; validation of grouped sustain rules; parsed `vega_group` support for mixed tokens; grouped preview rendering with visible `_`; timed-sequence expansion into fractional-duration svaras; playback scheduling at active tempo; regression tests for parser, validation, sequence, playback, and preview behavior.
- Out of scope: rests inside a Vega group; nested groups; rhythm markers inside a group; variable-duration groups such as `[R2 G2]:2`; non-uniform subdivision; gamakas inside a group; tala correctness validation; lyric UI or lyric data model changes; multi-line groups.

## 3. Actors and Context
- Primary actors/users: notation authors entering rhythmic phrases in the main player; playback engine and notation preview consuming parsed notation.
- Systems/services involved: `notation_parser.js`, `src/domain/notation/*`, `src/domain/audio/*`, `src/app/actions/playback.actions.ts`, parsed preview/highlighter components, notation tests.
- Roles and permissions: no role differences; all users can author grouped sustain syntax in notation text.

## 4. Functional Requirements
- FR-1: The tokenizer MUST continue to recognize `[` and `]` as first-class Vega delimiters and `_` as a first-class `sustain_unit`.
- FR-2: The parser MUST collapse each valid bracketed group into a single `vega_group` parsed node that preserves grouped svara and sustain tokens in source order.
- FR-3: A `vega_group` MUST occupy exactly `1` beat in aggregate regardless of how many grouped tokens it contains.
- FR-4: In v2, a Vega group MAY contain only svaras and `_`; `,`, `|`, `||`, newline, unknown tokens, nested `[` or `]`, and empty content MUST fail validation.
- FR-5: `_` is valid inside a Vega group only if a grouped svara has already appeared earlier within that same group.
- FR-6: For a Vega group containing `n` grouped tokens, each grouped token MUST occupy duration `1 / n` beats, and the sum of the resolved playable-note durations MUST equal exactly `1`.
- FR-7: On a grouped svara token, playback preparation MUST close any currently active grouped note and start a new grouped note at the current sub-slot.
- FR-8: On a grouped `_`, playback preparation MUST extend the currently active grouped note by one sub-slot and MUST NOT create a new playable note.
- FR-9: At the end of a Vega group, any active grouped note MUST be closed and emitted exactly once.
- FR-10: `sequenceLength`, note highlighting, and `noteIndex` events MUST remain svara-based, so grouped `_` is visible but not playable.
- FR-11: A `vega_group` MUST terminate active beat-level extension context; a following top-level `_` MUST keep existing post-group behavior and MUST NOT extend the last grouped note.
- FR-12: `parseSvarasOnly()` and any other svara-only derived views MUST flatten grouped sustain into resolved svaras in source order while dropping grouped `_` tokens.
- FR-13: Existing notation with no Vega groups and existing Vega groups containing only svaras MUST parse, preview, and play exactly as before.

## 5. Data and Interfaces
- Inputs: raw notation text containing svaras, `,`, `_`, `|`, `||`, whitespace, and optional Vega groups written as `[ <grouped tokens> ]`; active tempo BPM.
- Outputs: parsed notation includes `vega_group` with mixed grouped tokens; preview output includes an explicitly grouped visual representation with visible `_`; timed playback sequence contains fractional-duration svara items derived from grouped sustain resolution.
- Data model/entities:
  - `NotationToken.type` continues to include `sustain_unit`, `vega_group_start`, and `vega_group_end`.
  - `VegaGroupNode` adds `tokens: Array<ParsedSvara | SustainUnitNode>` while preserving aggregate metadata such as `subdivisions`, `totalDuration`, `line`, `position`, and `endPosition`.
  - `VegaGroupNode.notes` remains a resolved array of playable svaras produced from grouped-token resolution for sequence, preview indexing, and compatibility with existing consumers.
  - `PreviewVegaGroupToken` preserves grouped source content through `tokens: Array<PreviewSvaraToken | PreviewSustainToken>`.
- API or event contracts:
  - `tokenize()` returns Vega delimiter and sustain tokens in source order.
  - `parseNotation()` emits `vega_group` nodes containing both grouped source tokens and resolved grouped notes.
  - `parseNotationByLines()` keeps each Vega group on a single line and rejects any group spanning a newline.
  - `parseSvarasOnly()` flattens resolved grouped notes into the returned svara list with resolved fractional durations.
  - `buildPreviewNotationTokens()` preserves group boundaries and inner token visibility while assigning `noteIndex` only to grouped svaras.
  - `buildTimedNotationSequence()` expands resolved grouped notes into ordinary `SequenceNote` items with fractional durations, so runtime audio types do not require a new union.
- Validation rules: `[]`, unmatched `[` or `]`, nested brackets, rests inside a group, rhythm markers inside a group, leading grouped `_`, grouped `_` with no prior grouped svara, and newline before closing `]` are invalid syntax.

## 6. Flow and Logic
- Main flow: tokenize Vega delimiters and sustain tokens -> parse enclosed grouped tokens -> validate group-local sustain usage -> emit `vega_group` node -> build grouped preview -> expand resolved grouped notes into fractional-duration sequence items -> audio engine schedules the grouped svaras sequentially within one beat.
- Alternate flows:
  - `[R2 _]` resolves to one grouped note `R2` with duration `1`.
  - `[R2 G2 _ _]` resolves to `R2(0.25)` then `G2(0.75)`.
  - `[R2 _ G2]` resolves to `R2(2/3)` then `G2(1/3)`.
  - `S [R2 _ G2 _] P` resolves to `S(1)`, `R2(0.5)`, `G2(0.5)`, `P(1)`.
- State transitions: playback state remains `ready -> playing -> paused -> ready`; grouped sustain MUST NOT introduce a new playback mode.
- Business rules:
  - Group subdivision is always equal in v2.
  - Group duration is always one beat in v2.
  - Highlighting remains note-based, not beat-based.
  - Group-local sustain scope ends at the closing `]`.

## 7. Edge Cases and Failure Handling
- Edge cases: single-token group `[R2]`; fully sustained group `[R2 _ _ _]`; mid-switch sustain `[R2 _ G2 _]`; leading Vega group; trailing Vega group; adjacent Vega groups; group after `|`; group after `||`; octave-marked svaras inside a group; mixed ordinary svaras and groups on the same line.
- Error conditions: empty group `[]`; unmatched brackets; nested group `[R2 [G2] S]`; rest inside group `[R2 , G2]`; grouped sustain with no prior grouped svara `[_ R2]`; grouped sustain-only `[_]`; rhythm marker inside group `[R2 | G2]`; newline before closing bracket.
- Retries/timeouts/fallbacks: none required; parser and scheduler remain deterministic local operations.

## 8. Non-Functional Requirements
- Performance: tokenization, parsing, preview-token building, grouped-note resolution, and sequence expansion must remain linear in input length.
- Reliability: the same notation and tempo must always produce the same grouped note order and fractional timings.
- Security/privacy/compliance: no new concerns; no external I/O or data exposure.
- Accessibility: grouped preview must remain readable and preserve existing live-notation behavior; highlighting must visibly identify the active grouped svara while leaving grouped `_` non-highlightable.
- Observability (logs/metrics/traces/alerts): no new production telemetry required; fake-timer and parser tests must cover grouped sustain timing and invalid-group behavior.

## 9. Dependencies and Constraints
- External dependencies: none beyond existing SvelteKit, Vitest, and browser audio APIs.
- Technical constraints:
  - Implementation must fit the current parser wrapper in `src/domain/notation/notation.parser.ts` and legacy parser core in `notation_parser.js`.
  - The current audio engine already accepts numeric `duration`, so grouped sustain playback should reuse existing timing math rather than introducing a separate scheduler.
  - Svara highlighting is currently driven by `originalIndex` and `noteIndex`, so grouped sustain expansion must preserve linear playable-note indexing while keeping grouped `_` index-free.
- Operational constraints: release must remain backward compatible with existing separators, sustain, beat rests, and v1 Vega grouping.

## 10. Rollout and Migration
- Release strategy: ship as a backward-compatible notation and playback enhancement.
- Backward compatibility: notation without grouped sustain must behave exactly as before; invalid grouped sustain syntax should fail validation rather than being silently ignored.
- Data migration: none.
- Rollback plan: revert grouped sustain parsing, `vega_group` token preservation, preview rendering, and grouped-note resolution if regressions are found.

## 11. Acceptance Criteria
- AC-1: Given `[R2 _]`, when parsing succeeds, then the parsed output contains one `vega_group` node whose grouped tokens are `R2`, `_` and whose resolved grouped notes contain exactly `R2(1)`.
- AC-2: Given `[R2 _ _ _]`, when playback runs at any tempo, then the group lasts exactly one beat and emits exactly one playable note `R2`.
- AC-3: Given `[R2 G2 _ _]`, when playback runs, then `R2` lasts `0.25` beat and `G2` lasts `0.75` beat.
- AC-4: Given `[R2 _ G2]`, when playback runs, then `R2` lasts `2/3` beat and `G2` lasts `1/3` beat.
- AC-5: Given `[R2 _ G2 _]`, when playback runs, then `R2` and `G2` each last `0.5` beat.
- AC-6: Given `[_]`, `[_ R2]`, or `[_ _ R2]`, when validation runs, then the input is rejected because grouped sustain cannot appear before a grouped svara.
- AC-7: Given `S [R2 _ G2] _ P`, when playback runs, then the grouped `_` extends only `R2` and the top-level `_` after the group behaves as post-group silence under existing rules.
- AC-8: Given notation containing grouped sustain, when live notation is displayed during playback, then the Vega group remains visually grouped, grouped `_` remains visible, and only grouped svaras receive active-note highlighting.
- AC-9: Given legacy notation with no grouped sustain syntax, when parsed and played, then output remains unchanged from pre-feature behavior.

## 12. Implementation Plan
- Task breakdown:
  - Extend Vega-group parsing in `notation_parser.js` so grouped tokens may include svaras and `_`, while resolving grouped playable notes from those tokens.
  - Extend TypeScript notation types with grouped-token support in `VegaGroupNode` and preview-group support for grouped `_`.
  - Update validation to reject grouped leading `_`, grouped sustain-only content, nested groups, mixed invalid tokens, and multiline groups.
  - Add a shared grouped-note resolver used by `parseSvarasOnly()` and `buildTimedNotationSequence()` to keep grouped timing canonical.
  - Update `buildPreviewNotationTokens()` and the preview/highlighter components to render grouped `_` visibly with no `noteIndex`.
  - Add parser, validation, sequence, playback, and preview tests.
- Suggested order:
  1. Parser/token and type contracts
  2. Validation behavior
  3. Grouped-note resolution and sequence expansion
  4. Preview/highlighter rendering
  5. Playback and regression tests
- Risks and mitigations:
  - Risk: grouped source tokens and resolved grouped notes diverge. Mitigation: compute resolved grouped notes from one shared resolver and store both forms on the node.
  - Risk: floating-point subdivision causes assertion noise for thirds. Mitigation: assert with tolerances where needed and keep `totalDuration` canonical at `1`.
  - Risk: preview or highlight logic treats grouped `_` as playable. Mitigation: preserve separate preview token types and assign `noteIndex` only to grouped svaras.

## 13. Testing Plan
- Unit tests: tokenizer/parser tests for valid grouped sustain, octave-marked grouped notes, invalid leading grouped `_`, invalid grouped sustain-only input, nested groups, mixed-token groups, unmatched brackets, and multiline rejection.
- Integration tests: sequence-builder tests confirming fractional durations, preserved svara order, correct `sequenceLength`, and correct interaction with top-level `_`, `,`, `|`, and `||`.
- End-to-end tests: playback action and audio engine tests using fake timers to confirm per-note scheduling inside one beat at multiple tempos and correct live-highlighting progression.
- Negative/failure tests: invalid grouped sustain fails validation; unmatched brackets remain errors; legacy notation without grouped sustain is unaffected.

## 14. Assumptions and Open Questions
- Assumptions:
  - Top-level `_` after a Vega group continues current behavior and does not extend the last grouped note. Risk: low.
  - Whitespace inside a Vega group is ignored for subdivision counting. Risk: low.
  - Storing both grouped source tokens and resolved grouped notes on `vega_group` is acceptable for compatibility and clarity. Risk: medium.
- Open questions: none blocking if the above assumptions are accepted.
- Decision owners: notation/playback maintainer.

## 15. Definition of Done
- Completion checklist:
- Vega groups accept grouped `_` only after a grouped svara.
- Parser emits deterministic `vega_group` nodes with grouped source tokens and resolved grouped notes.
- Invalid grouped leading `_`, grouped sustain-only input, nested groups, mixed invalid-token groups, unmatched groups, and multiline groups fail validation.
- Preview renders grouped `_` visibly while preserving per-note highlighting for grouped svaras only.
- Timed sequence expansion plays grouped svaras sequentially within one beat using grouped sustain duration resolution.
- Total beat counting still treats each Vega group as exactly one beat.
- Existing notation without grouped sustain remains backward compatible.
- Automated tests cover parser behavior, timing, UI grouping, and regression cases.
