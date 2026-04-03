# Feature Specification: Nāda Vinōdam

## 1. Summary
- Problem: The repository has a capable notation player and piano, but it does not yet provide a focused Carnatic sound-lab surface for exploring raw frequency, envelope response, waveform character, and live signal feedback in a single intentional interface.
- Goal: Build a new dedicated Nāda Vinōdam page that matches the Stitch design for `Nāda Vinōdam - Console Refined`, lets users sculpt and audition a single oscillator tone, and exposes real-time visual diagnostics for frequency, svara mapping, waveform shape, and signal level.
- Outcome: A desktop-first SvelteKit route backed by a dedicated Web Audio single-oscillator synth module, with a retro console UI, responsive live controls, analyser-driven visuals, and test coverage for audio behavior, state transitions, and control wiring.

## 2. Scope
- In scope:
  - Add a new dedicated route for Nāda Vinōdam at `/nada-vinodam`.
  - Implement the desktop console shown in [output/stitch-nada-vinodam-console-refined.png](/Users/surya/Documents/code/projects/paaduGajala/output/stitch-nada-vinodam-console-refined.png) using the exported reference in [output/stitch-nada-vinodam-console-refined.html](/Users/surya/Documents/code/projects/paaduGajala/output/stitch-nada-vinodam-console-refined.html) as a visual guide, not a copy-paste source.
  - Provide a single-oscillator synth with controls for frequency, gain, attack, release, waveform selection, play/stop, and infinite sustain.
  - Show a digital readout with current frequency in Hz and nearest mapped svara.
  - Show a real-time oscilloscope panel and signal peak meter driven by analyser data.
  - Reuse shared pitch utilities and shared waveform types where practical.
  - Support pointer and keyboard accessibility for all primary controls.
  - Preserve the project’s design-language direction and Svelte 5 constraints from [AGENTS.md](/Users/surya/Documents/code/projects/paaduGajala/AGENTS.md).
- Out of scope:
  - Polyphonic synthesis.
  - MIDI input/output.
  - Saved presets, session persistence, or backend storage.
  - Gamaka motion, svara snapping, or tala sequencing.
  - Mobile-specific redesign beyond making the page readable and operable on narrow screens.
  - Replacing the existing notation player or standalone piano architecture.

## 3. Actors and Context
- Primary actors/users:
  - Learners exploring Carnatic pitch relationships by ear.
  - Maintainers using the tool as a foundation for future sound-synthesis work.
  - Designers and developers validating the new analog-console visual language inside the app.
- Systems/services involved:
  - SvelteKit route layer under `src/routes/`.
  - Shared pitch utilities in [src/domain/pitch/svara-frequencies.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-frequencies.ts) and [src/domain/pitch/svara-normalization.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-normalization.ts).
  - Shared waveform typing in [src/domain/shared/types.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/shared/types.ts).
  - Web Audio API in the browser.
  - Stitch reference assets from project `3639063962417811364`, screen `5c9289dc7bd2494fafb0e3712e37f94d`.
- Roles and permissions:
  - Anonymous end users can view and interact with the page.
  - No auth gates or role-based differences apply in v1.

## 4. Functional Requirements
List each item as `FR-<id>` with clear behavior.
- FR-1: The system MUST render a dedicated Nāda Vinōdam route whose layout matches the console composition in the Stitch design: page title block, left control cluster, right diagnostic cluster, console footer detail, and three descriptive value blocks below the console.
- FR-2: The system MUST provide one large frequency knob that updates the synth’s target frequency continuously during drag interaction.
- FR-3: The system MUST provide one gain control that updates output amplitude continuously during interaction.
- FR-4: The system MUST provide attack and release sliders that update the synth envelope for subsequent note starts and note stops.
- FR-5: The system MUST provide a waveform selector with exactly four options: `sine`, `square`, `sawtooth`, and `triangle`.
- FR-6: The system MUST provide a primary play control that starts playback when idle and stops playback when already active.
- FR-7: The system MUST provide an infinite sustain toggle. When enabled, playback continues until explicit stop or teardown. When disabled, playback auto-releases after a fixed one-shot duration.
- FR-8: The system MUST display the current numeric frequency in Hz in the digital readout and update it immediately when frequency changes.
- FR-9: The system MUST display the nearest Carnatic svara mapping for the current frequency using the shared pitch reference table across mandra, madhya, and taara octaves.
- FR-10: The system MUST render a real-time oscilloscope from analyser time-domain data while playback is active.
- FR-11: The system MUST render a signal peak meter from analyser amplitude data while playback is active.
- FR-12: The system MUST clean up oscillator, gain, analyser, animation frame, and timer resources on stop, page teardown, and browser visibility loss so stuck audio cannot persist.
- FR-13: The system MUST expose a stable page state model that can be unit-tested without requiring DOM rendering.
- FR-14: The system MUST keep implementation styling custom and lightweight; it MUST NOT introduce a heavy component library for this page.
- FR-15: The system MUST support keyboard activation for play/stop, waveform selection, sliders, and sustain toggle using semantic controls.
- FR-16: The system MUST present a graceful unsupported-browser or audio-init-failure state instead of failing silently.

## 5. Data and Interfaces
- Inputs:
  - Pointer drag events for the frequency knob.
  - Pointer or keyboard interaction for the gain knob or equivalent compact gain control.
  - Range input changes for attack and release.
  - Radio-group selection for waveform.
  - Button activation for play/stop.
  - Switch activation for infinite sustain.
  - Browser visibility and teardown lifecycle events.
- Outputs:
  - Audible oscillator output.
  - Digital readout values for frequency and mapped svara.
  - Oscilloscope sample data for rendering.
  - Signal meter levels for rendering.
  - User-facing status or fallback message if audio cannot initialize.
- Data model/entities:
  - `NadaVinodamState`
    - `frequencyHz: number`
    - `gain: number`
    - `attackSeconds: number`
    - `releaseSeconds: number`
    - `waveform: WaveformType`
    - `sustainEnabled: boolean`
    - `isPlaying: boolean`
    - `mappedSvara: string`
    - `mappedOctave: 'mandra' | 'madhya' | 'taara'`
    - `signalPeak: number`
    - `audioReady: boolean`
    - `audioError: string | null`
  - `NadaVinodamSynthConfig`
    - `frequencyHz: number`
    - `gain: number`
    - `attackSeconds: number`
    - `releaseSeconds: number`
    - `waveform: WaveformType`
    - `sustainEnabled: boolean`
    - `oneShotDurationMs: number`
  - `NadaAnalyserFrame`
    - `timeDomain: Float32Array | Uint8Array`
    - `peak: number`
    - `timestampMs: number`
- API or event contracts:
  - `createNadaVinodamSynth(config)` returns an object with:
    - `init(): Promise<void>`
    - `start(): Promise<void>`
    - `stop(): void`
    - `setFrequency(frequencyHz: number): void`
    - `setGain(gain: number): void`
    - `setEnvelope({ attackSeconds, releaseSeconds }): void`
    - `setWaveform(waveform: WaveformType): void`
    - `setSustainEnabled(enabled: boolean): void`
    - `readAnalyserFrame(): NadaAnalyserFrame | null`
    - `destroy(): void`
  - `mapFrequencyToClosestSvara(frequencyHz: number)` returns:
    - `svara: string`
    - `octave: 'mandra' | 'madhya' | 'taara'`
    - `referenceFrequencyHz: number`
    - `deltaHz: number`
  - Page-level controller functions SHOULD isolate business logic from Svelte components so UI tests do not need to instantiate `AudioContext`.
- Validation rules:
  - Frequency must stay within `80 Hz` to `880 Hz`.
  - Gain must stay within `0` to `1`.
  - Attack must stay within `0.005 s` to `2 s`.
  - Release must stay within `0.01 s` to `3 s`.
  - Waveform must be one of the four allowed values.
  - One-shot duration for sustain-off playback must be `1000 ms`.
  - If analyser data is unavailable, the UI must render an idle baseline rather than stale active data.

## 6. Flow and Logic
- Main flow:
  - User opens `/nada-vinodam`.
  - The page initializes local state from defaults and lazily prepares the synth on first interaction.
  - User changes controls; state updates immediately and the synth updates live where applicable.
  - User presses Play.
  - The synth resumes or creates an `AudioContext`, starts a single oscillator signal path, and begins analyser sampling.
  - The digital readout updates frequency and nearest svara mapping.
  - The oscilloscope and signal meter animate while playback is active.
  - User presses Play again, toggles sustain off after playback, navigates away, or the page loses visibility.
  - The synth releases and destroys active resources, resets diagnostic activity to idle, and leaves control values intact.
- Alternate flows:
  - If the user changes frequency while audio is playing, the oscillator frequency updates live without restarting playback.
  - If the user changes waveform while audio is playing, the oscillator type updates live on the active oscillator.
  - If sustain is disabled, Play starts a one-shot note that auto-stops after the fixed duration plus release tail.
  - If the browser blocks autoplay, the first explicit user gesture triggers `init()` and resumes the audio context before playback begins.
  - If audio support is missing, the page keeps the console visible but disables playback and shows an explanatory message.
- State transitions:
  - `idle -> ready` after successful synth initialization.
  - `ready -> playing` when play starts successfully.
  - `playing -> playing` when the user changes frequency, gain, attack, release, or waveform during playback.
  - `playing -> ready` on explicit stop or one-shot completion.
  - `ready -> error` or `playing -> error` if audio initialization or runtime setup fails irrecoverably.
- Business rules:
  - Svara mapping is diagnostic only in v1; changing mapped svara does not quantize or snap the oscillator frequency.
  - The page uses a dedicated synth path instead of reusing the existing sequence-oriented audio engine.
  - The knob’s visual rotation and press feedback should be driven through direct DOM style updates during drag for smooth sub-200ms feedback, consistent with project guidance.
  - Template-bound state must avoid `Map` and `Set` usage per the project’s Svelte 5 guidance.

## 7. Edge Cases and Failure Handling
- Edge cases:
  - User drags the frequency knob outside the knob hit area before releasing.
  - User toggles Play repeatedly in quick succession.
  - User changes waveform while the oscillator is already sounding.
  - User enables sustain while a one-shot note is already active.
  - User leaves the tab while playback is active.
  - User loads the page on a small viewport where the full two-column console cannot fit side-by-side.
- Error conditions:
  - `AudioContext` is unsupported.
  - `AudioContext` exists but resume fails.
  - Oscillator creation or analyser creation throws.
  - Analyser sampling loop continues after stop because cleanup is incomplete.
- Retries/timeouts/fallbacks:
  - Audio initialization may be retried on the next explicit Play interaction after a recoverable failure.
  - On any stop path, the system should cancel animation frames and pending one-shot timers immediately.
  - If analyser sampling fails, playback may continue but the oscilloscope and VU meter must fall back to idle display and log a development warning only.

## 8. Non-Functional Requirements
- Performance:
  - Frequency and gain changes while playing should feel immediate with no perceptible UI lag.
  - Oscilloscope rendering must use `requestAnimationFrame` and avoid store churn on every analyser sample.
  - The page must avoid unnecessary re-renders from high-frequency visual updates.
- Reliability:
  - Repeated play/stop cycles must not leak audio nodes.
  - Browser visibility changes and route teardown must always silence playback.
  - One-shot playback must stop deterministically when sustain is disabled.
- Security/privacy/compliance:
  - No data leaves the browser.
  - No new privacy, auth, or compliance requirements apply in v1.
- Accessibility:
  - All primary controls must have labels or accessible names.
  - Keyboard navigation must reach play, waveform selection, sustain toggle, and sliders.
  - The page must preserve contrast and not rely solely on color for state changes.
  - Motion in the oscilloscope and button feedback must not block basic usability.
- Observability (logs/metrics/traces/alerts):
  - Development-only warnings for audio initialization or analyser fallback are acceptable.
  - No analytics or external telemetry is required in v1.

## 9. Dependencies and Constraints
- External dependencies:
  - Browser Web Audio API.
  - Existing shared pitch data from `svara_frequencies.js` surfaced through [src/domain/pitch/svara-frequencies.ts](/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-frequencies.ts).
  - Stitch design assets stored locally in [output/stitch-nada-vinodam-console-refined.png](/Users/surya/Documents/code/projects/paaduGajala/output/stitch-nada-vinodam-console-refined.png) and [output/stitch-nada-vinodam-console-refined.html](/Users/surya/Documents/code/projects/paaduGajala/output/stitch-nada-vinodam-console-refined.html).
- Technical constraints:
  - Svelte 5 runes/pattern constraints from [AGENTS.md](/Users/surya/Documents/code/projects/paaduGajala/AGENTS.md) apply.
  - Styling should stay custom, CSS-driven, and design-token-oriented rather than introducing a component framework.
  - Existing shared `WaveformType` should be reused instead of redefining waveform strings.
  - The current shared `AudioEngine` is optimized for note/sequence playback and is not the source of truth for this page’s live oscillator diagnostics.
- Operational constraints:
  - The repository currently relies on Vitest and route/component tests rather than a browser E2E stack.
  - Validation should fit within the project’s standard `npm test && npm run lint` flow from [AGENTS.md](/Users/surya/Documents/code/projects/paaduGajala/AGENTS.md).

## 10. Rollout and Migration
- Release strategy:
  - Ship as a new isolated route with its own synth module and components.
  - Keep existing routes unchanged until the new page is verified.
- Backward compatibility:
  - No existing public route behavior should regress.
  - Shared pitch utilities must remain backward-compatible with current player and piano consumers.
- Data migration:
  - None required.
- Rollback plan:
  - Remove the new route and its dedicated synth module if the feature causes unexpected regressions.
  - Because the architecture is additive, rollback should not require data cleanup.

## 11. Acceptance Criteria
Use testable `Given/When/Then` style or equivalent measurable criteria.
- AC-1: Given the user opens `/nada-vinodam`, when the page renders on desktop, then the layout shows the same major console regions as the Stitch design: title block, left control cluster, right diagnostics cluster, footer rail, and three descriptive tiles.
- AC-2: Given the user drags the frequency control, when the drag changes value, then the frequency readout updates immediately and the mapped svara recomputes without waiting for playback.
- AC-3: Given playback is active, when the user changes frequency, gain, attack, release, or waveform, then the live sound and diagnostics update without requiring a full page reload.
- AC-4: Given sustain is enabled, when the user presses Play, then playback continues until the user presses Play again or the page tears down.
- AC-5: Given sustain is disabled, when the user presses Play, then playback starts, follows the configured attack/release envelope, and auto-stops after the one-shot duration.
- AC-6: Given playback is active, when the oscilloscope panel renders, then it shows analyser-driven waveform motion instead of a static placeholder.
- AC-7: Given playback is active, when the signal meter renders, then at least one level responds to analyser amplitude instead of remaining static.
- AC-8: Given the browser loses visibility or the route unmounts during playback, when cleanup runs, then all active audio stops and no analyser loop continues.
- AC-9: Given the current frequency is `261.63 Hz`, when the digital readout renders, then the displayed svara mapping resolves to `S` in `madhya`.
- AC-10: Given the browser does not support Web Audio or initialization fails, when the user attempts playback, then the UI presents a clear failure state and does not leave the page in a falsely playing state.

## 12. Implementation Plan
- Task breakdown:
  - Create a dedicated Nāda Vinōdam synth module in `src/domain/audio/` that owns oscillator, gain, analyser, and cleanup logic.
  - Add a frequency-to-nearest-svara utility in `src/domain/pitch/` based on existing frequency references.
  - Add a page controller or service to coordinate state updates, playback lifecycle, analyser polling, and fallback handling.
  - Build route-level UI components for knobs, envelope controls, waveform selector, play control, digital readout, oscilloscope, and signal meter.
  - Implement custom CSS tokens and console styling that match the Stitch reference while staying maintainable in Svelte.
  - Add unit and route-level tests for control state, mapping logic, play/stop behavior, and teardown.
- Suggested order:
  - First define synth and mapping contracts.
  - Next implement controller/state logic and tests.
  - Then build the route UI and wire controls to the controller.
  - Finally tune styling and responsive behavior against the Stitch reference.
- Risks and mitigations:
  - Risk: Extending the existing `AudioEngine` to support this page could create regressions in notation playback.
  - Mitigation: Keep Nāda Vinōdam on a dedicated synth path and reuse only shared utilities.
  - Risk: High-frequency analyser updates could cause UI churn.
  - Mitigation: Keep analyser data in local mutable buffers and publish only presentation-safe derived values.
  - Risk: Knob interactions could feel laggy if implemented entirely through reactive redraws.
  - Mitigation: Use direct DOM style updates for transient rotation/press feedback and commit normalized values into state separately.
  - Risk: The analog design could drift into generic cards if implemented too literally from Tailwind export.
  - Mitigation: Treat the Stitch HTML as composition reference only and translate it into project-native Svelte/CSS with explicit tokens.

## 13. Testing Plan
- Unit tests:
  - Test `mapFrequencyToClosestSvara()` across representative frequencies, including `261.63 Hz -> S/madhya`.
  - Test synth config validation and state transitions for play, stop, sustain on, sustain off, and cleanup.
  - Test analyser-derived peak normalization with mocked frames.
- Integration tests:
  - Test the page controller with mocked synth dependencies to verify live updates, failure handling, and teardown.
  - Test route/component wiring so the displayed frequency, mapped svara, and play state reflect controller state.
  - Test that visibility-change cleanup triggers synth stop.
- End-to-end tests:
  - Manual browser verification against the Stitch screenshot for layout hierarchy, desktop spacing, and control grouping.
  - Manual audio verification for waveform switching, attack/release feel, sustain behavior, and analyser motion.
- Negative/failure tests:
  - Unsupported browser should surface a usable error state.
  - Failed `init()` should not leave `isPlaying` true.
  - Rapid repeated play presses should not create orphaned oscillators.
  - Stopping during one-shot playback should cancel the pending auto-stop timer cleanly.

## 14. Assumptions and Open Questions
- Assumptions:
  - Assumption: v1 is a frontend-only feature with no persistence or export workflow. Risk: low.
  - Assumption: the route slug should be `/nada-vinodam` because no existing route or naming convention overrides it. Risk: low.
  - Assumption: the digital readout uses nearest Carnatic svara mapping diagnostically and does not snap the oscillator frequency. Risk: low.
  - Assumption: sustain-off mode uses a fixed `1000 ms` one-shot duration because the design shows a binary sustain toggle but no explicit duration control. Risk: medium.
  - Assumption: the default visible frequency should be `261.63 Hz` and the default mapped svara should therefore be `S`, matching the Stitch design. Risk: low.
  - Assumption: the default waveform for this page should be `square`, matching the active state in the Stitch design even though the broader app default waveform is currently `triangle`. Risk: medium.
- Open questions:
  - Open Question: should the route be added to the global top navigation in the same delivery, or should discoverability be deferred until after the feature stabilizes?
  - Open Question: should gain remain a small rotary knob like the design, or may implementation switch it to a slider if the rotary interaction becomes disproportionately expensive?
  - Open Question: should the digital readout eventually include octave and equivalent svara alias in secondary text, or is the primary svara label alone sufficient for v1?
- Decision owners:
  - Product/maintainer decision: route discoverability and exact default waveform.
  - Engineering decision: final implementation shape of the gain control if the small knob proves too brittle.

## 15. Definition of Done
- Completion checklist:
  - A new `/nada-vinodam` route exists and is visually aligned with the Stitch console reference.
  - The page plays a single oscillator tone with live control over frequency, gain, attack, release, waveform, and sustain mode.
  - The digital readout, oscilloscope, and signal meter all reflect live or idle state correctly.
  - Cleanup prevents stuck audio on stop, visibility change, and teardown.
  - Automated tests cover frequency mapping, playback state changes, and cleanup behavior.
  - `npm test && npm run lint` passes after the implementation lands.
