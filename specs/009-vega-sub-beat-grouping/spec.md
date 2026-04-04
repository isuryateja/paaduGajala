# Story 4: Support Vega / sub-beat svara grouping using `[ ... ]`

## 1. Summary
- Problem: The notation system currently treats each parsed svara as a beat-level event, so fast phrases that should fit inside a single akshara cannot be authored or played correctly.
- Goal: Support bracketed Vega groups such as `[R2 G2 R2 S]` as a single-beat rhythmic unit whose enclosed svaras are played sequentially with equal subdivision.
- Outcome: Parsing, validation, preview, timed-sequence building, and playback all preserve Vega grouping semantics while keeping tala alignment unchanged.

## 2. Scope
- In scope: bracket syntax recognition for `[ ... ]`; validation of legal group contents; parsed `vega_group` node support; grouped preview rendering; timed-sequence expansion into fractional-duration svaras; playback scheduling at active tempo; stats updates for grouped beats; tests for parser, sequence, playback, and preview behavior.
- Out of scope: nested groups; rests, sustain units, or rhythm markers inside a Vega group; variable-duration groups such as `[R2 G2]:2`; non-uniform subdivision; gamakas inside a group; tala correctness validation; lyric UI or lyric data model changes; multi-line groups.

## 3. Actors and Context
- Primary actors/users: notation authors entering fast phrases in the main player; playback engine and notation preview consuming parsed notation.
- Systems/services involved: `notation_parser.js`, `src/domain/notation/*`, `src/domain/audio/*`, `src/app/actions/playback.actions.ts`, parsed preview/highlighter components, notation tests.
- Roles and permissions: no role differences; all users can author Vega groups in notation text.

## 4. Functional Requirements
- FR-1: The tokenizer MUST recognize `[` and `]` as first-class Vega delimiters and MUST NOT treat them as unknown characters when they form valid group syntax.
- FR-2: The parser MUST collapse each valid bracketed group into a single `vega_group` parsed node that preserves the enclosed svaras in source order.
- FR-3: A `vega_group` MUST occupy exactly `1` beat in aggregate, regardless of how many svaras it contains.
- FR-4: The parser MUST allow only svaras inside a Vega group in v1; `,`, `_`, `|`, `||`, newline, nested `[`/`]`, or empty content inside a group MUST fail validation.
- FR-5: For a Vega group containing `n` svaras, each inner svara MUST receive duration `1 / n` beats, and the sum of all inner durations MUST equal exactly `1`.
- FR-6: Playback preparation MUST expand each `vega_group` into `n` sequential playable svara events or an equivalent scheduler representation without changing svara order, pitch, or octave.
- FR-7: `sequenceLength`, note highlighting, and `noteIndex` events MUST remain svara-based, so each inner svara of a Vega group is counted and highlighted as its own playable note.
- FR-8: A Vega group MUST advance tala/beat count by exactly one beat, identical to a normal svara or `,`.
- FR-9: Preview rendering MUST preserve visible grouping so the user can distinguish a compressed beat from ordinary beat-separated svaras.
- FR-10: Existing notation with no Vega groups MUST parse, preview, and play exactly as before.
- FR-11: A `vega_group` MUST terminate active beat-level extension context; a following `_` MUST be treated as post-group silence rather than extending only the last inner svara.
- FR-12: `parseSvarasOnly()` and any other svara-only derived views MUST flatten Vega-group contents in source order so downstream consumers continue to see a linear svara list.

## 5. Data and Interfaces
- Inputs: raw notation text containing svaras, `,`, `_`, `|`, `||`, whitespace, and optional Vega groups written as `[ <svara sequence> ]`; active tempo BPM.
- Outputs: parsed notation includes `vega_group`; preview output includes an explicitly grouped visual representation; timed playback sequence contains fractional-duration svara items derived from the group.
- Data model/entities:
  - `NotationToken.type` adds `vega_group_start` and `vega_group_end`.
  - `ParsedNotationNode` adds `VegaGroupNode { type: 'vega_group'; notes: ParsedSvara[]; subdivisions: number; totalDuration: 1; line: number; position: number; endPosition: number }`.
  - Each inner `ParsedSvara` inside a `VegaGroupNode` uses the normal svara shape but with fractional `duration`.
  - `PreviewNotationToken` adds `PreviewVegaGroupToken { type: 'vega_group'; notes: PreviewSvaraToken[]; position: number; endPosition: number }`, or an equivalent grouped preview contract that preserves per-note `noteIndex`.
- API or event contracts:
  - `tokenize()` returns Vega delimiter tokens for valid bracket syntax.
  - `parseNotation()` emits `vega_group` nodes in source order.
  - `parseNotationByLines()` keeps each Vega group on a single line and rejects any group spanning a newline.
  - `parseSvarasOnly()` flattens inner group notes into the returned svara list with their resolved fractional durations.
  - `buildPreviewNotationTokens()` preserves group boundaries and inner note indexes.
  - `buildTimedNotationSequence()` expands each group into ordinary `SequenceNote` items with fractional durations, so `SequenceItem` does not require a new runtime union in v1.
- Validation rules: `[]`, unmatched `[` or `]`, nested brackets, rests inside a group, sustain units inside a group, rhythm markers inside a group, and newline before closing `]` are invalid syntax.

## 6. Flow and Logic
- Main flow: tokenize Vega delimiters -> parse enclosed svaras -> validate group contents -> emit `vega_group` node -> build grouped preview -> expand to fractional-duration sequence items -> audio engine schedules the inner svaras sequentially within one beat.
- Alternate flows:
  - `[R2 G2 R2 S]` resolves to four svaras of duration `0.25`.
  - `S [R2 G2] P` resolves to `S(1)`, `R2(0.5)`, `G2(0.5)`, `P(1)`.
  - `[R2 G2] , S` resolves to one compressed beat, then one beat rest, then `S`.
  - `S || [R2 G2 R2 S]` applies the phrase pause first, then the one-beat Vega group.
- State transitions: playback state remains `ready -> playing -> paused -> ready`; Vega grouping MUST NOT introduce a new playback mode.
- Business rules:
  - Group subdivision is always equal in v1.
  - Group duration is always one beat in v1.
  - Highlighting remains note-based, not beat-based.
  - A Vega group closes active-note extension context before later `_` or `,` processing.

## 7. Edge Cases and Failure Handling
- Edge cases: leading Vega group; trailing Vega group; adjacent Vega groups; group after `|`; group after `||`; octave-marked svaras inside a group; mixed ordinary svaras and groups on the same line.
- Error conditions: empty group `[]`; unmatched brackets; nested group `[R2 [G2 R2] S]`; rest inside group `[R2 , G2]`; sustain inside group `[R2 _ G2]`; rhythm marker inside group `[R2 | G2]`; newline before closing bracket.
- Retries/timeouts/fallbacks: none required; parser and scheduler remain deterministic local operations.

## 8. Non-Functional Requirements
- Performance: tokenization, parsing, preview-token building, and sequence expansion must remain linear in input length.
- Reliability: the same notation and tempo must always produce the same fractional timings and note order.
- Security/privacy/compliance: no new concerns; no external I/O or data exposure.
- Accessibility: grouped preview must remain readable and preserve existing live-notation behavior; highlighting must still visibly identify the active inner svara.
- Observability (logs/metrics/traces/alerts): no new production telemetry required; fake-timer and parser tests must cover fractional timing and invalid-group behavior.

## 9. Dependencies and Constraints
- External dependencies: none beyond existing SvelteKit, Vitest, and browser audio APIs.
- Technical constraints:
  - Implementation must fit the current parser wrapper in `src/domain/notation/notation.parser.ts` and legacy parser core in `notation_parser.js`.
  - The current audio engine already accepts numeric `duration`, so Vega playback should reuse existing timing math rather than introducing a separate scheduler.
  - Svara highlighting is currently driven by `originalIndex` and `noteIndex`, so group expansion must preserve linear playable-note indexing.
- Operational constraints: release must remain backward compatible with Stories 1 through 3 for separators, sustain, and beat rests.

## 10. Rollout and Migration
- Release strategy: ship as a backward-compatible notation and playback enhancement.
- Backward compatibility: notation without `[ ... ]` must behave exactly as before; invalid bracket syntax should fail validation rather than being silently ignored.
- Data migration: none.
- Rollback plan: revert Vega delimiter parsing, `vega_group` node emission, preview grouping, and sequence expansion if regressions are found.

## 11. Acceptance Criteria
- AC-1: Given `[R2 G2 R2 S]`, when parsing succeeds, then the parsed output contains one `vega_group` node with four inner svaras in that exact order.
- AC-2: Given `[R2 G2 R2 S]` at `120 BPM`, when playback runs, then each inner svara lasts `0.125` seconds and the full group lasts `0.5` seconds.
- AC-3: Given `S [R2 G2] P`, when playback runs, then `S` lasts one beat, `R2` and `G2` each last half a beat, and `P` starts exactly two beats after `S` starts.
- AC-4: Given `[R2 G2] , S`, when playback runs, then the group consumes one beat, the comma adds one beat of silence, and `S` starts after two total beats.
- AC-5: Given `S || [R2 G2 R2 S]`, when playback runs, then the phrase pause occurs before the grouped beat and the group still occupies exactly one beat.
- AC-6: Given `[]`, when validation runs, then the input is rejected with a Vega-group syntax error.
- AC-7: Given `[R2 [G2 R2] S]`, when validation runs, then the input is rejected because nested groups are unsupported.
- AC-8: Given `[R2 , G2]` or `[R2 _ G2]`, when validation runs, then the input is rejected because only svaras are allowed inside a group.
- AC-9: Given notation containing a Vega group, when live notation is displayed during playback, then the group remains visually grouped while the active inner svara is highlighted.
- AC-10: Given legacy notation with no Vega group syntax, when parsed and played, then output remains unchanged from pre-feature behavior.

## 12. Implementation Plan
- Task breakdown:
  - Add Vega delimiter token support and group parsing logic in `notation_parser.js`.
  - Extend TypeScript notation types with `VegaGroupNode` and preview-group support.
  - Update validation to reject empty, nested, mixed-token, or multiline groups.
  - Update `buildPreviewNotationTokens()` and `PlaybackNotationHighlighter.svelte` to render grouped notes with per-note highlighting.
  - Update `buildTimedNotationSequence()` to expand groups into fractional `SequenceNote` items and preserve `originalIndex`.
  - Update stats helpers so total beats count a Vega group as `1`.
  - Add parser, validation, sequence, playback, stats, and preview tests.
- Suggested order:
  1. Parser/token and type contracts
  2. Validation behavior
  3. Sequence expansion and stats
  4. Preview/highlighter rendering
  5. Playback and regression tests
- Risks and mitigations:
  - Risk: grouping breaks note highlighting because preview and playback no longer share note indexes. Mitigation: keep sequence expansion and preview tokens aligned on a single linear svara index.
  - Risk: floating-point subdivision causes off-by-small-epsilon timing assertions. Mitigation: assert within tolerances and keep `totalDuration` canonical at `1`.
  - Risk: `_` after a group is interpreted inconsistently. Mitigation: codify FR-11 and add explicit mixed-symbol tests.

## 13. Testing Plan
- Unit tests: tokenizer/parser tests for valid groups, octave-marked inner notes, invalid empty groups, nested groups, mixed-token groups, unmatched brackets, and multiline rejection.
- Integration tests: sequence-builder tests confirming fractional durations, preserved svara order, correct `sequenceLength`, and correct interaction with `,`, `|`, `||`, and trailing groups.
- End-to-end tests: playback action and audio engine tests using fake timers to confirm per-note scheduling inside one beat at multiple tempos and correct live-highlighting progression.
- Negative/failure tests: invalid groups fail validation; unmatched brackets remain errors; legacy notation without groups is unaffected.

## 14. Assumptions and Open Questions
- Assumptions:
  - `_` immediately after a Vega group adds silence instead of extending the last inner svara because the group is a closed beat-level unit. Risk: medium.
  - Vega groups are single-line constructs; newline before `]` is invalid in v1. Risk: low.
  - Lyric alignment is not implemented in the current product, so this delivery only preserves the invariant that a Vega group remains one beat-level unit for any future lyric layer. Risk: low.
- Open questions: none blocking if the above assumptions are accepted.
- Decision owners: notation/playback maintainer.

## 15. Definition of Done
- Completion checklist:
- `[ ... ]` is recognized and validated as Vega-group syntax.
- Parser emits deterministic `vega_group` nodes with ordered inner svaras.
- Invalid empty, nested, mixed-token, unmatched, and multiline groups fail validation.
- Preview renders groups visibly while preserving per-note highlighting.
- Timed sequence expansion plays grouped svaras sequentially within one beat.
- Total beat counting treats each Vega group as exactly one beat.
- Existing notation without groups remains backward compatible.
- Automated tests cover parser behavior, timing, UI grouping, and regression cases.
