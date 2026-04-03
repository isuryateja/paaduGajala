# Story 3: Support beat rest using `,`

## 1. Summary
- Problem: `,` is currently ignored or treated as invalid, so users cannot author an explicit one-beat rest in notation.
- Goal: Support `,` as a tempo-scaled one-beat silence that works anywhere in notation and remains distinct from `_`.
- Outcome: Parsing, validation, preview, timed-sequence building, and playback all preserve `,` as an explicit beat rest.

## 2. Scope
- In scope: tokenizer/parser support for `,`; validation acceptance; parsed node support; preview token support; timed sequence conversion to silence; playback timing at active tempo; tests for rest placement and interaction with `_`, `|`, and `||`.
- Out of scope: `,,` as a special multi-beat syntax beyond repeated single rests; fractional rests; tala correctness; gamaka semantics; UI redesign.

## 3. Actors and Context
- Primary actors/users: notation authors using the main player; playback engine consuming parsed notation.
- Systems/services involved: `notation_parser.js`, `src/domain/notation/*`, `buildTimedNotationSequence()`, `AudioEngine.playSequence()`, notation validation/tests.
- Roles and permissions: no role differences; all users can enter `,` in notation text.

## 4. Functional Requirements
- FR-1: `,` MUST tokenize and parse as a distinct rest symbol, not as whitespace, unknown input, or sustain.
- FR-2: The parser MUST emit a parsed node for each comma occurrence in source order.
- FR-3: Each parsed `beat_rest` MUST contribute exactly one beat of silence to playback timing.
- FR-4: Beat-rest duration MUST scale with tempo using `oneBeatDurationMs = 60000 / tempoBpm` and equivalently `oneBeatDurationSeconds = 60 / tempoBpm`.
- FR-5: `beat_rest` MUST remain semantically independent from `_`; it MUST NOT extend a preceding note and MUST NOT be converted into `sustain_unit`.
- FR-6: `,` MUST be valid between notes, at the start, after `|`, after `||`, and in consecutive runs.
- FR-7: Consecutive commas MUST accumulate additively; `, ,` yields two beats of silence.
- FR-8: Existing `|` behavior MUST remain zero added delay; existing `||` behavior MUST remain one phrase-pause beat, with any following `,` adding an additional beat.

## 5. Data and Interfaces
- Inputs: raw notation text containing svaras, `_`, `|`, `||`, Unicode dandas, whitespace/newlines, and `,`; current `tempoBpm`.
- Outputs: parsed notation includes `beat_rest`; preview tokens include `beat_rest`; timed playback sequence includes `silence` entries derived from `beat_rest`.
- Data model/entities: `NotationToken.type` adds `'beat_rest'`; add `BeatRestNode { type: 'beat_rest'; beats: 1; line: number; position: number }`; add `PreviewBeatRestToken { type: 'beat_rest'; text: ','; position: number }`; extend `ParsedNotationNode` and `PreviewNotationToken` unions accordingly.
- API or event contracts: `tokenize()` returns `beat_rest` tokens; `parseNotation()` preserves `beat_rest` nodes; `buildPreviewNotationTokens()` emits visible comma tokens without changing note indexes; `buildTimedNotationSequence()` converts each `beat_rest` into `silence` duration `1`.
- Validation rules: `,` is valid syntax; repeated commas are valid; `,` must not populate `beatMarker`; `parseSvarasOnly()` ignores `beat_rest` for svara extraction and note-duration folding.

## 6. Flow and Logic
- Main flow: tokenize `,` -> parse to `beat_rest` node -> preview renders comma -> timed-sequence builder adds `silence(1)` -> audio engine schedules silence using current beat duration.
- Alternate flows: leading `,` delays first note; `| ,` inserts beat boundary then one beat rest; `|| ,` inserts phrase pause then one beat rest; `, ,` yields two beats total silence.
- State transitions: encountering `beat_rest` MUST clear any active note-extension context so later `_` units, if any, become silence rather than extending the note before the comma.
- Business rules: parser preserves each comma as its own source node; sequence builder MAY coalesce adjacent silence items internally only if total timing and ordering remain identical.

## 7. Edge Cases and Failure Handling
- Edge cases: leading rest; trailing rest before sequence end; consecutive rests; rest after newline; rest adjacent to separators; `S _ , G3`; `S || , G3`; `, S`; `S , , R1`.
- Error conditions: `,` must no longer trigger unknown-character validation errors; unrelated malformed symbols still behave as they do today.
- Retries/timeouts/fallbacks: none required; this is deterministic local parsing/playback.

## 8. Non-Functional Requirements
- Performance: parsing and sequence-building complexity must remain linear in input length.
- Reliability: same notation and tempo must always yield the same silence timing and note order.
- Security/privacy/compliance: no new concerns; no external I/O or user data expansion.
- Accessibility: no new accessibility behavior required beyond preserving visible notation order if preview displays parsed tokens.
- Observability: existing test coverage is sufficient; no runtime logging requirement.

## 9. Dependencies and Constraints
- External dependencies: none.
- Technical constraints: current parser is wrapped through `src/domain/notation/notation.parser.ts` but behavior originates in `notation_parser.js`; playback sequence uses `SequenceSilence`.
- Operational constraints: must not regress Story 1 phrase-pause behavior or existing sustain handling.

## 10. Rollout and Migration
- Release strategy: ship as a normal backward-compatible parser/playback enhancement.
- Backward compatibility: all existing notation without commas must behave exactly as before.
- Data migration: none.
- Rollback plan: revert `beat_rest` parsing and sequence conversion if regressions appear.

## 11. Acceptance Criteria
- AC-1: Given `S , R1`, when playback starts at 120 BPM, then `R1` starts 500 ms after `S` ends.
- AC-2: Given the same notation at 60 BPM and 120 BPM, when playback runs, then the rest lasts 1000 ms and 500 ms respectively.
- AC-3: Given `, S`, when playback starts, then `S` begins after one beat of silence.
- AC-4: Given `S | , G3`, when playback starts, then `|` adds no delay and `,` adds exactly one beat before `G3`.
- AC-5: Given `S , , R1`, when playback starts, then `R1` begins after two beats of silence.
- AC-6: Given `S _ , G3`, when playback starts, then `S` is extended by `_`, then one beat rest occurs, then `G3` plays.
- AC-7: Given `S || , G3`, when playback starts, then one phrase-pause beat occurs, then one rest beat occurs, then `G3` plays.
- AC-8: Given notation containing commas, when validation runs, then commas are accepted as valid syntax and not reported as unknown characters.

## 12. Implementation Plan
- Task breakdown: add `beat_rest` token/node types; update parser/tokenizer; update preview token builder; update timed-sequence builder to convert `beat_rest` to `silence(1)`; keep `_` logic separate; add parser, validation, sequence, and playback tests.
- Suggested order: types/contracts first; parser/tokenizer second; validation/preview third; sequence builder fourth; playback tests last.
- Risks and mitigations: main risk is accidental coupling with `_` or phrase-boundary logic; mitigate with focused tests for mixed-symbol scenarios.

## 13. Testing Plan
- Unit tests: parser emits `beat_rest`; preview preserves comma order; validation accepts comma; sequence builder creates silence for leading, trailing, consecutive, and mixed rests.
- Integration tests: playback action converts parsed `beat_rest` nodes into correct `SequenceItem[]`; duration/sequence-length behavior stays correct.
- End-to-end tests: parse and play `S R1 , G3 ||` and confirm note timing relative to tempo.
- Negative/failure tests: rest-only input remains non-playable unless product explicitly changes that rule; unknown non-comma symbols still fail validation.

## 14. Assumptions and Open Questions
- Assumptions: rest-only input such as `, ,` remains invalid for playback because the current system requires at least one svara. Risk: low.
- Assumptions: parsed-notation preview should render `,` visibly so the UI matches parser/playback order. Risk: low.
- Assumptions: adjacent comma-derived silences may be coalesced in the sequence layer as an internal optimization. Risk: low.
- Open questions: none blocking.
- Decision owners: product/notation semantics owner plus implementing engineer.

## 15. Definition of Done
- Completion checklist:
- `,` parses as `beat_rest`.
- Validation accepts it.
- Preview preserves it.
- Sequence building converts it to one-beat silence.
- Playback timing scales with tempo.
- `_`, `|`, and `||` interactions are covered by tests.
- Existing notation without commas remains backward compatible.
