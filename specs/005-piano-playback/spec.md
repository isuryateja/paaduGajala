# Feature Specification: Piano Playback Corrections

## 1. Summary
- Problem: The piano experience is currently inconsistent and partially incorrect. On the standalone `/piano` route, black keys visually move in the wrong direction when pressed, black-key interaction is reported as silent, and the visual key positions and note-to-sound mapping are not reliable. The main route also maintains a separate manual piano definition, which increases the chance of the same mapping drift appearing in two places.
- Goal: Restore a believable piano interaction model where white and black keys are positioned like a real keyboard, pressed keys depress downward, and every manual key consistently triggers the intended svara and octave.
- Outcome: A single authoritative piano-key model drives rendering, interaction, and audio mapping for in-scope piano surfaces, with regression coverage for black-key behavior, key placement, and note-to-sound accuracy.

## 2. Scope
- In scope:
  - Fix the standalone piano route at [src/routes/piano/+page.svelte](/Users/surya/Documents/code/projects/paaduGajala/src/routes/piano/+page.svelte).
  - Replace the current separate white-row and black-row layout used by the piano components with an overlaid keyboard layout that reflects real white/black key positioning.
  - Correct pressed-state visuals so keys move downward and appear physically depressed instead of shifting sideways or upward.
  - Normalize the mapping between piano UI key ids, displayed labels, and canonical svara names used by the audio engine.
  - Ensure all clickable and tappable piano keys, including black keys, trigger audible sound and stop correctly on release.
  - Reuse the same piano-key definition model for the standalone piano and the main route’s manual piano where practical.
  - Add tests that validate layout metadata, note mapping, black-key audio triggering, and release cleanup.
- Out of scope:
  - MIDI input/output.
  - New notation semantics or tuning-system redesign.
  - Adding more octaves than the app already exposes visually.
  - Pedal/sustain feature changes beyond preserving the current hold-to-sustain behavior.
  - A full visual redesign unrelated to piano correctness.

## 3. Actors and Context
- Primary actors/users:
  - Learners or musicians using the standalone virtual piano for direct practice.
  - Users of the main page who trigger notes manually from the embedded piano.
  - Maintainers who need a single understandable mapping between UI keys and audio notes.
- Systems/services involved:
  - Piano route/controller in [src/app/services/piano-page.ts](/Users/surya/Documents/code/projects/paaduGajala/src/app/services/piano-page.ts).
  - Piano UI components in [src/components/piano/PianoKey.svelte](/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKey.svelte), [src/components/piano/PianoOctave.svelte](/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoOctave.svelte), and [src/components/piano/PianoKeyboard.svelte](/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKeyboard.svelte).
  - Manual piano rendering on [src/routes/+page.svelte](/Users/surya/Documents/code/projects/paaduGajala/src/routes/+page.svelte).
  - Piano action layer in [src/app/actions/piano.actions.ts](/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/piano.actions.ts).
  - Audio normalization and playback in [src/domain/pitch/svara-normalization.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-normalization.ts) and [src/domain/audio/audio-engine.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/audio/audio-engine.ts).
- Roles and permissions:
  - End users can press, hold, and release piano keys with mouse, touch, or keyboard.
  - Maintainers can update one centralized piano definition to change rendering and audio behavior safely.

## 4. Functional Requirements
List each item as `FR-<id>` with clear behavior.
- FR-1: The system MUST render black keys as overlaid keys aligned to defined positions relative to white keys, rather than as a detached evenly spaced row.
- FR-2: The system MUST apply pressed-state motion that visually depresses keys downward on press for both white and black keys.
- FR-3: The system MUST make every rendered piano key, including black keys, trigger `startPianoNote` on press and `stopPianoNote` on release across mouse and touch input.
- FR-4: The system MUST keep keyboard-triggered piano notes synchronized with the same visual active state and release behavior used for pointer-triggered notes.
- FR-5: The system MUST use a single canonical piano-key definition source that includes octave, display label, key color, physical slot/position metadata, UI key id, and canonical svara mapping for audio playback.
- FR-6: The system MUST map each manual piano key to the intended canonical svara and octave before calling the audio engine, instead of relying on ambiguous UI ids alone.
- FR-7: The system MUST preserve the existing hold-to-sustain behavior so a pressed key sounds until release or global cleanup.
- FR-8: The system MUST release all active piano notes and visual key states on visibility loss, window blur, or component teardown to prevent stuck notes.
- FR-9: The system MUST keep the standalone piano and the main route manual piano consistent with the same in-scope note-to-sound mapping rules.
- FR-10: The system MUST document or encode black-key placement explicitly so the physical order per octave is stable and testable.

## 5. Data and Interfaces
- Inputs:
  - Pointer press/release events from piano buttons.
  - Touch start/end/cancel events from piano buttons.
  - Keyboard events handled by the piano page controller.
  - Piano key metadata consumed by the standalone and main-route piano renderers.
- Outputs:
  - Audible sustained notes via `audioEngine.startSvara(...)`.
  - Note stop events via `audioEngine.stopVoice(...)`.
  - Visual pressed/active key state in the rendered piano.
  - User-facing status updates from the piano action layer.
- Canonical overlap rules:
  - `R2` and `G1` are the same pitch position.
  - `R3` and `G2` are the same pitch position.
  - `D2` and `N1` are the same pitch position.
  - `D3` and `N2` are the same pitch position.
- Canonical per-octave piano map:
  - White 1: UI id `s`, display `S`, canonical svara `S`, western slot `C`
  - Black 1: UI id `r1`, display `R1`, canonical svara `R1`, western slot `C# / Db`
  - White 2: UI id `r`, display `R2 / G1`, canonical svara `R2`, equivalent `G1`, western slot `D`
  - Black 2: current UI id `r2`, recommended canonical display `G2 / R3`, canonical svara `G2`, equivalent `R3`, western slot `D# / Eb`
  - White 3: UI id `g`, display `G3`, canonical svara `G3`, western slot `E`
  - White 4: UI id `m`, display `M1`, canonical svara `M1`, western slot `F`
  - Black 3: current UI id `m1`, recommended canonical display `M2`, canonical svara `M2`, western slot `F# / Gb`
  - White 5: UI id `p`, display `P`, canonical svara `P`, western slot `G`
  - Black 4: UI id `d1`, display `D1`, canonical svara `D1`, western slot `G# / Ab`
  - White 6: UI id `d`, display `D2 / N1`, canonical svara `D2`, equivalent `N1`, western slot `A`
  - Black 5: current UI id `d2`, recommended canonical display `N2 / D3`, canonical svara `N2`, equivalent `D3`, western slot `A# / Bb`
  - White 7: UI id `n`, display `N3`, canonical svara `N3`, western slot `B`
- Data model/entities:
  - `PianoKeyDefinition`: expanded to represent canonical audio svara and physical placement metadata, not only `note`, `label`, `octave`, and `isBlack`.
  - `PianoKeyboardMapping`: keyboard shortcut mapping that references canonical key ids or canonical note definitions.
  - `PianoKeyId`: stable UI identifier for a rendered key, separate from display label and canonical svara when they differ.
- API or event contracts:
  - `pressMappedKey(note, octave)` and `releaseMappedKey(note, octave)` may continue to exist, but the implementation MUST resolve those inputs through the canonical piano definition before audio playback.
  - Manual key press handlers on the main route SHOULD delegate to the same mapping utility used by the standalone piano.
  - Audio calls MUST reach `startPianoNote`/`stopPianoNote` with values that normalize to the intended canonical svara and octave.
- Validation rules:
  - Each rendered piano key must have exactly one canonical svara target.
  - Each black key must have exactly one defined slot position within its octave layout.
  - No duplicate keyboard shortcut may point to two different canonical keys.
  - No rendered key may be missing a release path.
  - Black slot 2 MUST NOT normalize to the same pitch as white slot 2; it represents `G2 / R3`, not `R2 / G1`.
  - Black slot 5 MUST NOT normalize to the same pitch as white slot 6; it represents `N2 / D3`, not `D2 / N1`.

## 6. Flow and Logic
- Main flow:
  - User presses a piano key.
  - The renderer resolves the key’s canonical definition from shared piano metadata.
  - The key is marked active visually with a downward pressed state.
  - The action layer starts the canonical svara for the key’s octave and tracks the held voice.
  - On release, blur, or teardown, the held voice is stopped and the key returns to its resting visual state.
- Alternate flows:
  - User uses the physical keyboard shortcut map: the controller resolves the shortcut to the same canonical key definition, activates the visual state, and starts the same audio mapping.
  - Playback/highlighting code needs a piano-key target: it resolves through the same canonical mapping utility instead of maintaining a separate hard-coded note alias map.
- State transitions:
  - `idle -> active` on pointer/key press after canonical mapping succeeds.
  - `active -> idle` on release, touch cancel, blur, visibility change, or teardown.
  - `idle -> idle` when an unmapped shortcut is pressed.
  - `active -> active` must not start duplicate voices for the same held key id.
- Business rules:
  - Black keys must visually sit above the white-key bed and between their adjacent white-key anchors.
  - Press animation direction must reinforce depression, not lift.
  - Canonical svara mapping is the source of truth for audio; UI shorthand ids are implementation details only.
  - Same-pitch Carnatic overlaps must resolve to one shared pitch position per octave: `R2=G1`, `R3=G2`, `D2=N1`, and `D3=N2`.
  - Shared piano metadata must be reusable across routes so the app cannot drift into separate note maps again.

## 7. Edge Cases and Failure Handling
- Edge cases:
  - User drags pointer off a held key before release.
  - User taps black keys rapidly or repeatedly.
  - User holds multiple keys at once.
  - User presses a keyboard shortcut for a mapped key while that same key is already held by pointer input.
  - The standalone piano shows three octaves while keyboard shortcuts cover only a subset of keys.
- Error conditions:
  - Missing canonical mapping for a rendered key.
  - Duplicate canonical mapping or duplicate layout slot assignment.
  - Audio initialization succeeds but `startSvara` returns no voice.
- Retries/timeouts/fallbacks:
  - Audio initialization should continue using the existing `ensureAudioReady()` path.
  - If a note fails to start, the UI must avoid leaving the key permanently active.
  - Global cleanup on blur/visibility change remains the fallback for preventing stuck voices.

## 8. Non-Functional Requirements
- Performance:
  - Piano presses should continue to feel immediate; the layout and mapping refactor must not add perceptible press lag.
- Reliability:
  - Repeated press/release cycles must not leak held voices or leave keys active after release.
  - Canonical mapping must be deterministic and shared.
- Security/privacy/compliance:
  - No additional privacy or security requirements beyond the existing frontend-only Web Audio usage.
- Accessibility:
  - Pressed-state styling must preserve visible focus and not depend only on color.
  - Keyboard-triggered interaction must remain supported on the standalone piano.
- Observability (logs/metrics/traces/alerts):
  - Development-time warnings are acceptable for missing mappings, but the happy path should not rely on ad hoc console debugging.

## 9. Dependencies and Constraints
- External dependencies:
  - Web Audio API behavior in the browser.
- Technical constraints:
  - The current app uses Svelte 5, SvelteKit, and Vitest.
  - Existing `startPianoNote` normalization currently maps shorthand values like `r`, `m`, and `d` to canonical svaras; that behavior must either be preserved intentionally or replaced with clearer canonical inputs.
  - The legacy reference implementations in `virtual_piano.html` and `paadugajaala/index.html` provide the intended black-key overlay and downward press behavior, but they should inform rather than be copied verbatim.
- Operational constraints:
  - The repo currently has source-based tests but no dedicated browser E2E suite for piano interactions; the implementation should strengthen automated coverage within the existing test stack.

## 10. Rollout and Migration
- Release strategy:
  - Ship as a focused bug-fix/refactor on branch `005-piano-playback` with shared mapping utilities updated first, then route/component adoption, then tests.
- Backward compatibility:
  - Existing keyboard shortcuts should remain unchanged unless a specific shortcut is proven to map to the wrong note.
  - Existing route URLs and basic piano usage patterns should remain unchanged.
- Data migration:
  - No persisted data migration is required.
- Rollback plan:
  - Revert the piano-layout and shared-mapping changes as one unit if the new shared definition causes regressions in either route.

## 11. Acceptance Criteria
Use testable `Given/When/Then` style or equivalent measurable criteria.
- AC-1: Given the standalone piano is open, when a user presses a black key, then the key visually moves downward while remaining aligned above the white keys instead of shifting sideways or upward.
- AC-2: Given the standalone piano is open, when a user presses any black key with mouse or touch, then an audible note starts and continues until the corresponding release event or global cleanup.
- AC-3: Given a rendered piano key in any in-scope route, when it is pressed, then the audio engine receives the intended canonical svara and octave for that exact key.
- AC-4: Given the user releases a held piano key, when the release handler runs, then the corresponding held voice stops and the visual active state clears.
- AC-5: Given the browser loses focus or visibility while notes are held, when the cleanup handlers run, then all held piano notes stop and all active key states clear.
- AC-6: Given the standalone piano and main-route manual piano render overlapping note sets, when the same note is triggered in both surfaces, then they resolve to the same canonical svara and octave.
- AC-7: Given the shared piano metadata is inspected in tests, when each black key definition is validated, then its color, slot position, label, and canonical svara mapping are present and non-conflicting.

## 12. Implementation Plan
- Task breakdown:
  - Introduce or expand shared piano metadata in the domain layer so each key has canonical audio mapping and layout position data.
  - Refactor standalone piano rendering to overlay black keys within each octave or keyboard strip using shared layout data.
  - Update pressed-state styles for white and black keys to depress downward.
  - Route all manual piano presses through shared canonical mapping utilities before calling piano actions.
  - Align main-route piano definitions with the same shared source or adapter.
  - Add tests for canonical mapping, audio triggering, keyboard/controller behavior, and layout metadata.
- Suggested order:
  - First centralize the piano model and mapping utilities.
  - Next update the standalone route/components to consume the shared model.
  - Then align the main-route manual piano with the same model.
  - Finally add or update tests and run targeted validation.
- Risks and mitigations:
  - Risk: Renaming or redefining current `note` values could break existing callers.
  - Mitigation: Introduce canonical fields alongside legacy ids first, then migrate call sites.
  - Risk: Main-route and standalone piano layouts may diverge again if only one route is updated.
  - Mitigation: Make both routes depend on one shared metadata source.
  - Risk: Visual layout fixes could inadvertently reduce touch hit targets for black keys.
  - Mitigation: Keep explicit z-index and hit-area checks in manual validation and component logic.

## 13. Testing Plan
- Unit tests:
  - Validate canonical piano-key definitions, including black-key slot positions and canonical svara mappings.
  - Validate shorthand-to-canonical mapping helpers for white and black keys.
  - Validate piano action behavior when black keys are started, held, and stopped.
- Integration tests:
  - Test the piano page controller for keyboard shortcut press/release against shared canonical key definitions.
  - Test that release-all cleanup clears active keys and held voices on blur/visibility transitions.
- End-to-end tests:
  - Manual browser verification on `/piano` for white-key and black-key click/touch behavior, pressed-state direction, and audio start/stop.
  - Manual verification on the main route piano for overlapping note mappings shared with the standalone route.
- Negative/failure tests:
  - Missing or invalid key definition should fail fast in tests rather than silently defaulting to the wrong note.
  - Repeated presses on the same key must not create duplicate tracked voices for a single held key.
  - Unmapped keyboard shortcuts must not alter active key state.

## 14. Assumptions and Open Questions
- Assumptions:
  - The legacy keyboard overlay in [virtual_piano.html](/Users/surya/Documents/code/projects/paaduGajala/virtual_piano.html) and [paadugajaala/index.html](/Users/surya/Documents/code/projects/paaduGajala/paadugajaala/index.html) reflects the intended visual press direction and black-key placement better than the current Svelte implementation.
  - The current canonical audio intent should remain Carnatic-first, with UI shorthand such as `r`, `m`, and `d` resolving to their existing default canonical svaras unless a mapping is demonstrably wrong.
  - The main-route manual piano is in scope for shared mapping consistency even though the reported bug was raised against the piano experience generally.
- Open questions:
  - Should the piano metadata continue to store shorthand ids like `m1` for the black key that currently normalizes to `M2`, or should the UI ids be renamed to canonical musical names for clarity?
  - Should keyboard shortcuts remain limited to the currently advertised subset of keys, or should this feature also complete missing shortcut coverage for the second/third octave as a follow-up?
  - Should equivalent svaras such as `R2`/`G1` and `D2`/`N1` eventually be surfaced explicitly in labels, or is canonical single-label rendering sufficient for this fix?
- Decision owners:
  - Product/maintainer decision: whether to preserve shorthand UI ids or rename to canonical musical ids.
  - Engineering decision: the exact shared metadata shape and whether the main-route piano fully consumes the shared component or only the shared mapping model.

## 15. Definition of Done
- Completion checklist:
  - Shared piano metadata exists for in-scope keys and includes canonical audio mapping plus layout position data.
  - Standalone piano black keys are overlaid correctly and depress downward on press.
  - Black keys produce and stop sound correctly on mouse, touch, and keyboard-supported flows.
  - Main-route manual piano no longer relies on a conflicting note map for overlapping keys.
  - Automated tests cover canonical mapping, cleanup behavior, and black-key interaction gaps that were previously untested.
  - Manual verification confirms the reported black-key issues are resolved on the target routes.
