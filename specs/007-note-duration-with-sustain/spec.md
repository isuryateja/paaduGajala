# Story 2: Support note sustain using `_`

## 1. Summary
- Problem: `_` is currently treated as non-meaningful notation, so all svaras still play as a single unit and leading/aligned silence cannot be represented.
- Goal: Support `_` as a one-unit sustain marker that either extends the current svara or adds silence when no svara is active in the current region.
- Outcome: Parsed notation preserves sustain intent, playback timing becomes duration-aware, and Story 1 separator behavior remains intact.

## 2. Scope
- In scope: tokenizer/parser recognition of `_`; explicit parsed sustain nodes; duration-aware playback sequence generation; leading `_`; `_` after `|` and `||`; accumulated sustain units; stats/preview duration consistency; tests.
- Out of scope: tala math validation, fractional durations, explicit rest notation as user syntax, gamakas, lyric sync, pitch changes, UI redesign.

## 3. Actors and Context
- Primary actors/users: learners using notation input, parsed preview, and playback.
- Systems/services involved: `notation_parser.js`, `src/domain/notation/*`, `src/app/actions/playback.actions.ts`, `src/domain/audio/*`, parsed preview/highlighter components, stats/view-model helpers.
- Roles and permissions: no auth or permission changes.

## 4. Functional Requirements
- FR-1: The tokenizer MUST recognize `_` as a first-class `sustain_unit` token and MUST NOT report `_` as an unknown character.
- FR-2: The parser MUST preserve `sustain_unit` nodes in source order alongside `svara`, `rhythm_marker`, `newline`, and other existing node types.
- FR-3: Each svara MUST continue to have a base duration of `1` unit unless additional sustain units are resolved onto it by a downstream derived view.
- FR-4: A `sustain_unit` immediately following a svara in the same region MUST extend that svara by `+1` unit; consecutive `_` markers MUST accumulate.
- FR-5: A `sustain_unit` at the start of input, after `newline`, after `|`, or after `||` MUST contribute `+1` silent unit instead of extending a prior svara.
- FR-6: `|` MUST remain structural-only and MUST add no time.
- FR-7: `||` MUST preserve Story 1 behavior by adding one tempo-scaled phrase pause, and any following `_` silence MUST occur after that phrase pause.
- FR-8: Playback/event generation MUST resolve parsed notation into timed items that preserve exact svara order from source text.
- FR-9: Playback MUST support explicit silence timing produced by sustain resolution, including leading silence and terminal silence before sequence end.
- FR-10: Note highlighting and `noteIndex` events MUST remain svara-only; sustain units, silence items, and boundaries MUST NOT emit playable-note indexes.
- FR-11: Parsed preview output MUST preserve visible `_` markers so the displayed sequence matches playback timing semantics.
- FR-12: Duration-related preview stats MUST include sustain-added time, including silent units, while note count remains svara-only.
- FR-13: Inputs containing recognized notation but no svara MUST remain non-playable under existing gating; `_` must be valid syntax but not sufficient playable content by itself.

## 5. Data and Interfaces
- Inputs: raw notation text; tempo BPM from settings.
- Outputs: parsed notation with explicit sustain nodes; preview tokens that include `_`; playback sequence containing notes, boundaries, and silence; updated duration stats.
- Data model/entities:
  - `NotationToken.type` adds `sustain_unit`.
  - `ParsedNotationNode` adds `SustainUnitNode { type: 'sustain_unit'; units: 1; line; position }`.
  - `PreviewNotationToken` adds a non-playable sustain token for `_`.
  - `SequenceItem` widens to include `SequenceSilence { type: 'silence'; duration: number }`, or an equivalent explicit silent-timing item.
- API or event contracts:
  - `parseNotation()` preserves `_` nodes in order.
  - `parseSvarasOnly()` becomes a derived svara-only projection that folds note-following sustain into note duration but drops silent-only timing.
  - Playback scheduling consumes the full parsed sequence or an equivalent fully resolved sequence, not a svara-only list.
- Validation rules: `_` is valid notation; danda normalization from Story 1 remains unchanged; no new tala validation is introduced.

## 6. Flow and Logic
- Main flow: raw text -> tokenize -> parse ordered nodes -> build preview tokens -> resolve timed playback sequence -> schedule audio/events in order.
- Alternate flows:
  - `S _ _` resolves to one note with duration `3`.
  - `_ _ S` resolves to silence `2`, then note `S`.
  - `S | _ G3` resolves to note `S`, beat boundary, silence `1`, note `G3`.
  - `S || _ G3` resolves to note `S`, phrase pause, silence `1`, note `G3`.
- State transitions: playback state remains `ready -> playing -> paused -> ready`; no new UI state is required.
- Business rules:
  - Sustain binding region resets at input start and after `newline`, `|`, or `||`.
  - If `_` appears before a boundary in source order, its silent time occurs before that boundary’s effect.
  - If `_` appears after a boundary in source order, its silent time occurs after that boundary’s effect.
  - Sequence end occurs only after all resolved note duration, phrase pause, and terminal silence have elapsed.

## 7. Edge Cases and Failure Handling
- Edge cases: leading `_`; multiple `_`; `_` after `|`; `_` after `||`; terminal `_`; terminal `|| _`; multiline input where a new line begins with `_`.
- Error conditions: `_` must not generate unknown-character warnings; malformed non-notation characters continue using existing validation behavior.
- Retries/timeouts/fallbacks: none required; scheduling remains deterministic and timer-based.

## 8. Non-Functional Requirements
- Performance: parsing and sequence resolution must remain linear in notation length.
- Reliability: the same notation and tempo must always produce identical note order and identical elapsed timing.
- Security/privacy/compliance: no new data handling or external services.
- Accessibility: existing playback controls and highlighting remain unchanged.
- Observability (logs/metrics/traces/alerts): no new telemetry required; fake-timer tests must cover timing behavior.

## 9. Dependencies and Constraints
- External dependencies: none beyond existing SvelteKit, Vitest, and Web Audio APIs.
- Technical constraints: implementation must stay compatible with Story 1 separator semantics and current modules in `notation_parser.js`, `src/domain/notation/notation.types.ts`, `src/domain/notation/notation.parser.ts`, `src/domain/notation/notation.stats.ts`, `src/app/actions/playback.actions.ts`, `src/domain/audio/audio.types.ts`, and `src/domain/audio/audio-engine.ts`.
- Operational constraints: no user-facing rest symbol is introduced; silence is an internal playback concept only.

## 10. Rollout and Migration
- Release strategy: ship as one backward-compatible notation/playback enhancement.
- Backward compatibility: notation without `_` must parse, preview, and play exactly as before.
- Data migration: none.
- Rollback plan: remove sustain token/sequence handling while preserving existing separator behavior from Story 1.

## 11. Acceptance Criteria
- AC-1: Given `S _ _`, when parsed and played, then `S` lasts `3` units.
- AC-2: Given `_ _ S`, when played, then playback waits `2` units before playing `S`.
- AC-3: Given `S | _ G3`, when played, then playback inserts `1` silent unit after the beat boundary before `G3`.
- AC-4: Given `S || _ G3`, when played, then playback applies the phrase pause, then `1` silent unit, then plays `G3`.
- AC-5: Given `G3 _ _ _`, when played, then `G3` lasts `4` units.
- AC-6: Given notation containing `_`, when played, then svara ordering remains exactly as written.
- AC-7: Given notation containing `_`, when parsed, then `_` is represented as `sustain_unit` rather than `unknown`.
- AC-8: Given `S || _ _`, when played, then playback waits for the Story 1 phrase pause plus `2` silent units before `sequenceEnd`.
- AC-9: Given `_ _ S R1` at `60 BPM`, when preview duration is computed, then total duration is `4` units / `4` seconds.

## 12. Implementation Plan
- Task breakdown:
  - Add `sustain_unit` token/node support in the legacy parser and TypeScript types.
  - Extend preview token building so `_` remains visible after parsing.
  - Add explicit silence support to playback sequence resolution.
  - Update duration/stat helpers to count sustain-added time correctly.
  - Add parser, playback action, audio engine, and stats tests.
- Suggested order:
  1. Parser/types
  2. Preview token support
  3. Playback sequence resolution
  4. Audio scheduler silence handling
  5. Stats/helpers
  6. Tests
- Risks and mitigations:
  - Risk: double-counting sustain if both parser and scheduler mutate duration. Mitigation: preserve `_` explicitly in parse output and resolve timing in one canonical derived path.
  - Risk: preview drops `_` visually. Mitigation: add explicit preview sustain tokens and component coverage.
  - Risk: duration stats ignore silent units. Mitigation: derive elapsed beats from the resolved timed sequence or equivalent full-notation timing pass.

## 13. Testing Plan
- Unit tests: tokenizer/parser tests for `_`, multiple `_`, leading `_`, `_` after `|`, `_` after `||`, terminal `_`, multiline leading `_`.
- Integration tests: playback action tests confirming resolved sequence items and preserved svara indexes.
- End-to-end tests: audio engine timer tests verifying note scheduling, phrase pause stacking, and delayed `sequenceEnd` for terminal silence.
- Negative/failure tests: `_` no longer treated as unknown; `_`-only input remains non-playable; unknown non-notation characters still warn/error as before.

## 14. Assumptions and Open Questions
- Assumptions:
  - `newline` resets sustain binding, so `_` at a new line start creates silence rather than extending a note from the previous line. Risk: low.
  - Terminal silence is meaningful playback time and must delay `sequenceEnd`. Risk: low.
  - Internal silent timing may be represented as `SequenceSilence` or an equivalent explicit rest-like item, but no new user notation for rests is introduced. Risk: low.
- Open questions: none blocking for implementation.
- Decision owners: notation/playback maintainer.

## 15. Definition of Done
- Completion checklist:
  - `_` is tokenized and parsed as `sustain_unit`.
  - Playback timing resolves `_` into either note extension or silence.
  - Leading `_`, post-`|` `_`, and post-`||` `_` all behave correctly.
  - Story 1 phrase pause behavior remains unchanged and stacks correctly with `_`.
  - Parsed preview preserves `_` visibly.
  - Duration stats reflect sustain-added elapsed time.
  - Existing notation without `_` remains backward compatible.
  - Automated tests cover parser behavior, sequence resolution, timing, and regression cases.
