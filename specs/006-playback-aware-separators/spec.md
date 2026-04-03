# Story 1: Interpret beat and phrase separators during playback

## 1. Summary
- Problem: The current notation pipeline accepts `|`, `||`, `।`, and `॥`, but playback flattens parsed notation into svara-only notes and ignores separator semantics.
- Goal: Preserve beat and phrase boundaries through parsing and playback so `|` remains structural-only and `||` inserts a tempo-derived silent phrase pause.
- Outcome: Parsed notation retains separator meaning, playback stays musically ordered, and phrase pauses scale automatically with tempo without changing note durations.

## 2. Scope
- In scope: tokenizer/parser recognition of `|` and `||`; unicode danda normalization (`।` -> `|`, `॥` -> `||`); parsed structure that retains beat vs phrase boundaries; playback scheduling support for phrase pauses; tests for parsing and tempo-scaled timing.
- Out of scope: tala correctness, beat validation, rests as user notation, gamakas, lyric alignment, UI redesign, changes to svara pitch or duration rules.

## 3. Actors and Context
- Primary actors/users: learners using the main player playback flow.
- Systems/services involved: notation parser, notation store, playback action layer, audio engine scheduler, preview/highlighter UI.
- Roles and permissions: no auth or role changes.

## 4. Functional Requirements
- FR-1: Tokenization MUST recognize ASCII and unicode separators and canonicalize them into explicit boundary semantics: `beat` for `|`/`।`, `phrase` for `||`/`॥`.
- FR-2: Parsing MUST preserve boundary items in sequence order alongside svara and newline items; separators MUST NOT be discarded after parsing.
- FR-3: Playback preparation MUST retain separator semantics in the sequence passed to the audio scheduler rather than filtering to svara-only notes.
- FR-4: A beat boundary MUST have zero audio effect: no sound, no inserted silence, no note-index shift.
- FR-5: A phrase boundary MUST insert a silent pause of exactly one beat at the active tempo.
- FR-6: Phrase pause duration MUST be derived from tempo only: `oneBeatDurationMs = 60000 / tempoBpm` and equivalently `oneBeatDurationSeconds = 60 / tempoBpm` inside engine scheduling.
- FR-7: Phrase pause MUST occur after the preceding musical content and before the next playable svara; if `||` is terminal, playback SHOULD still wait one beat before emitting sequence end.
- FR-8: Svara ordering, pitch, octave, and existing note durations MUST remain unchanged from current behavior.
- FR-9: Trailing `|` MUST not error and MUST not add time; trailing `||` MUST be handled consistently per FR-7.

## 5. Data and Interfaces
- Inputs: raw notation text from the notation store; tempo BPM from settings.
- Outputs: parsed notation with explicit boundary semantics; scheduled playback sequence with silent phrase pauses; unchanged UI note highlighting by svara index.
- Data model/entities: introduce a canonical parsed boundary shape such as `{ type: 'boundary', boundaryKind: 'beat' | 'phrase', marker: '|' | '||', line, position }`; `newline` remains separate; `ParsedSvara.beatMarker` may remain temporarily for compatibility but boundary nodes become the source of truth.
- API or event contracts: widen audio scheduling input from note-only items to a union such as `SequenceItem = SequenceNoteItem | SequenceBoundaryItem`; `noteIndex` events continue to fire only for svara items.
- Validation rules: unicode dandas normalize to canonical markers; separator-only input remains non-playable because it contains no svaras; no new tala or beat-count validation is added.

## 6. Flow and Logic
- Main flow: parse raw text -> emit svara/newline/boundary nodes -> build playback sequence preserving boundaries -> audio engine iterates in order -> play svaras normally -> skip beat boundaries with zero cursor change -> advance cursor by one beat on phrase boundaries -> emit `sequenceEnd` after final scheduled time.
- Alternate flows: trailing `|` is ignored for timing; mid-sequence `||` inserts pause before next note; terminal `||` inserts final pause then ends.
- State transitions: playback store statuses remain `ready -> playing -> paused -> ready`; separator handling MUST NOT require new UI state.
- Business rules: note highlighting stays mapped to svara order only; boundaries are structural timing events, not playable notes.

## 7. Edge Cases and Failure Handling
- Edge cases: `S R1 || G3 M1`; `S R1 G3 |`; `S R1 G3 ||`; unicode-only input; multiline phrases ending with `||`.
- Error conditions: invalid/unknown notation handling stays as-is; trailing separators do not throw parse or playback errors.
- Retries/timeouts/fallbacks: no retries needed; scheduler timing remains deterministic via existing timeout-based sequencing.

## 8. Non-Functional Requirements
- Performance: parse and scheduling remain linear in notation length; separator support must not introduce perceptible UI lag.
- Reliability: same input and tempo must always produce the same ordered playback and pause timings.
- Security/privacy/compliance: no new data handling or external services.
- Accessibility: no required UI changes; existing controls and highlighting remain intact.
- Observability (logs/metrics/traces/alerts): no production telemetry required; behavior must be covered by unit tests with fake timers.

## 9. Dependencies and Constraints
- External dependencies: none beyond existing SvelteKit, Vitest, and browser audio APIs.
- Technical constraints: implement against the current modules in `notation_parser.js`, `src/domain/notation/notation.types.ts`, `src/domain/audio/audio.types.ts`, `src/domain/audio/audio-engine.ts`, and `src/app/actions/playback.actions.ts`.
- Operational constraints: no visual-only workaround in playback logic; design must support future tala/duration work.

## 10. Rollout and Migration
- Release strategy: ship as a single backward-compatible playback improvement.
- Backward compatibility: existing simple notation without separators or with ignored separators must continue to parse and play.
- Data migration: none.
- Rollback plan: revert sequence-boundary scheduling changes while keeping parser acceptance unchanged if regressions appear.

## 11. Acceptance Criteria
- AC-1: Given notation containing `|`, when parsed, then a beat boundary is preserved in the internal structure.
- AC-2: Given notation containing `||`, when parsed, then a phrase boundary is preserved in the internal structure.
- AC-3: Given notation containing `।` and `॥`, when parsed, then they behave identically to `|` and `||`.
- AC-4: Given notation containing `|`, when played, then no silence is inserted because of that marker.
- AC-5: Given notation containing `||`, when played, then one silent beat is inserted after the phrase-ending content.
- AC-6: Given the same notation played at different tempos, when `||` is encountered, then the pause duration scales as `60000 / tempoBpm`.
- AC-7: Given notation containing separators, when played, then svaras are played in exactly the same order as before the change.
- AC-8: Given notation ending with `|`, when parsed and played, then no error occurs and no extra pause is added.
- AC-9: Given notation ending with `||`, when played, then the preferred behavior is a final one-beat pause before playback finishes.

## 12. Implementation Plan
- Task breakdown: add canonical boundary token/node semantics in the parser; introduce playback sequence items that preserve boundaries; update sequence scheduling to treat phrase boundaries as silent one-beat cursor advances; keep note-index emission svara-only; add parser/audio/action tests.
- Suggested order: 1. parser/token types, 2. playback sequence model, 3. audio engine scheduling, 4. playback action integration, 5. tests.
- Risks and mitigations: risk of breaking preview/highlighter assumptions about `rhythm_marker`; mitigate by keeping UI rendering marker-aware and keeping note indexing based only on svaras. Risk of timing regressions in pause/resume; mitigate with fake-timer tests around sequence end timing and resume behavior.

## 13. Testing Plan
- Unit tests: parser tests for `|`, `||`, `।`, `॥`, trailing markers, and preserved ordering.
- Integration tests: audio engine tests asserting scheduled `noteIndex` order and final elapsed timing at 60, 80, and 120 BPM.
- End-to-end tests: playback action workflow proving parsed notation with separators starts playback and preserves sequence length/highlighting behavior.
- Negative/failure tests: trailing `|` no error; terminal `||` consistent end behavior; separator-only input does not start playback.

## 14. Assumptions and Open Questions
- Assumptions: leading or consecutive separators without preceding svara do not create a pre-roll pause; boundary nodes are the canonical representation even if legacy `beatMarker` remains during transition; note durations remain `1 beat` unless already specified otherwise. Risk: low.
- Open questions: none blocking for implementation.
- Decision owners: notation and playback module maintainer.

## 15. Definition of Done
- Completion checklist:
- Parser emits deterministic beat vs phrase boundary semantics for ASCII and unicode dandas.
- Playback input retains separators instead of flattening to svaras only.
- `||` inserts a tempo-based one-beat silent pause; `|` stays silent.
- Svara order, pitch, octave, and existing durations remain unchanged.
- Automated tests cover parser behavior, unicode normalization, timing at multiple tempos, trailing separators, and terminal phrase pause behavior.
