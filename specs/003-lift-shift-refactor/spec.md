# Feature Specification: Lift-and-Shift Application Refactor

**Feature Branch**: `003-lift-shift-refactor`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Refactor the current Paadu Gajaala application into a production-ready modular architecture without changing functionality, removing features, or redesigning the user experience."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep the Main Player Familiar (Priority: P1)

As an existing user, I want the main notation player to behave the same after the migration, so that I can continue entering notation, parsing it, and playing it without relearning the app.

**Why this priority**: Preserving the core paste, parse, and play workflow is the primary purpose of this phase. If the main player changes behavior, the migration fails its main goal.

**Independent Test**: Open the migrated main player and complete the current core workflow: enter notation, parse it, adjust settings, and play it back. The same controls and feedback should remain available and understandable.

**Acceptance Scenarios**:

1. **Given** the migrated main player is opened, **When** the user views the page, **Then** the same core controls and information areas remain available, including notation input, parse, example loading, file upload, clear, playback controls, settings, parsed preview, statistics, status feedback, and loading feedback.
2. **Given** a user enters supported notation in the migrated app, **When** they choose to parse and play it, **Then** the system preserves the current sequence of actions and user-visible outcomes for parse, preview, playback, and stop or pause behavior.
3. **Given** a user changes tempo, volume, waveform, tuning, or preset selections before playback, **When** playback starts, **Then** the selected settings influence playback in the same way they do in the current app.

---

### User Story 2 - Preserve Existing Music Interpretation (Priority: P1)

As a user who already relies on the current notation rules, I want my existing notation inputs and examples to continue working the same way after migration, so that previously valid content does not break.

**Why this priority**: Compatibility with existing notation and playback expectations is as important as keeping the UI available. A migration that changes interpretation creates silent regressions.

**Independent Test**: Use the current example content and a representative set of existing notation inputs in both the current app and the migrated app. Compare parse outcomes, validation feedback, statistics, and playback order.

**Acceptance Scenarios**:

1. **Given** notation that is currently accepted by the app, **When** it is parsed in the migrated app, **Then** the parse result, validation outcome, and note statistics remain equivalent to the current behavior.
2. **Given** notation that currently produces warnings or errors, **When** it is parsed in the migrated app, **Then** the validation style and user-facing feedback remain consistent with the current experience.
3. **Given** parsed notation is playing, **When** playback advances through the sequence, **Then** note highlighting and progress feedback remain consistent with the current app's behavior.

---

### User Story 3 - Keep the Standalone Piano Available (Priority: P2)

As a user who practices directly on the virtual piano, I want the standalone piano experience to remain available after the migration, so that I can continue using it independently of the main player.

**Why this priority**: The standalone piano is a distinct existing experience in the repository. It is secondary to the main notation workflow but must remain available to avoid feature loss.

**Independent Test**: Open the standalone piano page and confirm that key interaction, sound triggering, and direct play behavior remain equivalent to the current experience across supported input methods.

**Acceptance Scenarios**:

1. **Given** the standalone piano page is opened, **When** the user accesses it after the migration, **Then** the piano remains available as a separate experience rather than being removed or merged away.
2. **Given** a user presses or triggers piano keys directly, **When** they interact with the piano, **Then** sound playback and visual active-state feedback remain equivalent to the current behavior.
3. **Given** a user uses mouse, touch, or keyboard-based piano interaction that is currently supported, **When** they perform the same interaction after migration, **Then** the result remains consistent with the current app.

---

### User Story 4 - Create a Safer Base for Later Work (Priority: P3)

As a maintainer, I want the app's responsibilities to be cleanly separated without changing behavior, so that future enhancements can be added without another full rewrite of the existing experience.

**Why this priority**: This migration is justified by internal structure, but that value only matters after parity is protected. It is therefore important, but lower priority than direct user-facing parity.

**Independent Test**: Review the migrated application structure and verify that user interface concerns, notation behavior, playback behavior, piano interaction, and browser-specific helpers can be changed independently while the existing user journeys still pass parity checks.

**Acceptance Scenarios**:

1. **Given** the migrated application is under maintenance, **When** a team member updates notation behavior, **Then** the work can be isolated from presentation-only changes.
2. **Given** the migrated application is under maintenance, **When** a team member updates playback or piano interaction logic, **Then** the change can be made without rewriting unrelated screen structure.
3. **Given** future enhancement work begins after this phase, **When** teams build on the migrated app, **Then** they can do so from a stable baseline that already preserves current behavior.

---

### Edge Cases

- What happens when a user loads the bundled example or an uploaded text file before any manual input? The migrated app should preserve the same loading, parse, and ready-state behavior as the current app.
- What happens when a user clears the notation after parsing or playback? The migrated app should preserve current reset behavior, including default values, status messaging, and visible output state.
- What happens when unsupported or malformed notation is entered? The migrated app should preserve the current validation style and must not silently reinterpret invalid input as something else.
- What happens when playback is paused, resumed, or stopped while note-follow highlighting is active? The migrated app should preserve the current highlight and playback-state behavior without leaving stale indicators behind.
- What happens when browser visibility changes during playback or direct piano use? The migrated app should resolve active audio and feedback states consistently with the current app and avoid stuck or misleading active states.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a main notation player that preserves the current core workflow of entering notation, parsing it, previewing it, and playing it back.
- **FR-002**: The system MUST preserve the current main-player controls and information areas, including notation input, example loading, file upload, clear, playback controls, settings, parsed preview, note statistics, status feedback, toast-style messaging, and loading feedback.
- **FR-003**: The system MUST preserve the current standalone virtual piano as a separate available user experience.
- **FR-004**: The system MUST preserve currently supported notation interpretation, including English svara input, octave markers, rhythm markers, and line-based notation handling.
- **FR-005**: The system MUST preserve the current validation style for supported and unsupported notation so users receive equivalent parse success, warning, and error outcomes for the same inputs.
- **FR-006**: The system MUST preserve the current playback behavior for parsed notation, including play, pause, resume, stop, note order, and note-follow highlighting behavior.
- **FR-007**: The system MUST preserve direct note triggering and feedback behavior for piano interaction in both the main player and the standalone piano experience.
- **FR-008**: The system MUST preserve the current settings behavior and default values for tempo, volume, waveform selection, tuning selection, and instrument preset selection.
- **FR-009**: The system MUST preserve example-loading, text-file import, and clear or reset behavior so existing user content flows continue to work.
- **FR-010**: The system MUST preserve the current user-facing layout, labels, route availability, and task flow closely enough that existing users can use the migrated app without relearning the core journeys.
- **FR-011**: The system MUST separate presentation concerns, notation behavior, playback behavior, piano interaction, and browser-specific support concerns so future changes can be made without reintroducing the current level of structural coupling.
- **FR-012**: The system MUST support parity verification against the current application throughout the migration so regressions can be detected before the migrated experience replaces the current one.
- **FR-013**: The system MUST NOT introduce new end-user capabilities in this phase except changes strictly required to preserve correctness during migration.
- **FR-014**: The system MUST NOT add tala behavior, new notation semantics, backend-dependent features, new import formats, or aesthetic-only redesign as part of this phase.

### Key Entities *(include if feature involves data)*

- **Notation Input**: User-provided Carnatic notation text, whether typed directly, loaded from the bundled example, or imported from a text file.
- **Parsed Sequence**: The validated ordered music content derived from notation input, including notes, markers, and line structure used for preview, statistics, and playback.
- **Playback Settings**: User-controlled playback choices and defaults, including tempo, volume, waveform, tuning mode, and instrument preset selection.
- **Piano Interaction State**: The currently active note and visual key state produced by direct interaction with the piano on the main player or the standalone piano page.
- **Session Feedback**: User-visible readiness, status, loading, notification, and note-follow feedback that communicates what the app is doing during parse and playback flows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Existing users can complete the current paste-or-load, parse, and play workflow in the migrated app without additional required steps compared with the current app.
- **SC-002**: 100% of currently documented user-facing controls and pages remain available after migration, including the main notation player and the standalone piano experience.
- **SC-003**: A parity test set covering existing examples and representative notation inputs produces equivalent parse outcomes, validation outcomes, note counts, and playback order before and after migration.
- **SC-004**: A parity review covering playback interruption, settings changes, example loading, file import, and direct piano interaction finds no unresolved user-visible behavioral regressions at release time.
- **SC-005**: Default settings and reset behavior in the migrated app match the current app on first load and after clear or reset flows.
- **SC-006**: This phase releases with no net-new end-user feature additions beyond what is required to preserve current correctness during migration.

## Assumptions

1. The current repository behavior is the baseline for parity, especially the main notation player, standalone piano page, bundled example content, and the documented feature set in the README.
2. Minor corrective changes are acceptable only when they are necessary to preserve current intended behavior during migration, not to introduce new product behavior.
3. The current deployment model remains frontend-only for this phase, with no requirement to introduce server-managed state or user accounts.
4. Existing users value continuity more than new capabilities during this phase and will judge success primarily by lack of regression.

## Dependencies

- Access to the current app behavior for side-by-side parity comparison during migration.
- A representative set of notation inputs, including bundled examples and known invalid cases, for validating parity.
- Ability to verify both the main player experience and the standalone piano experience before release.

## Out of Scope

- Tala engine behavior
- Akshara or matra timeline work
- New notation-duration semantics
- Deep parser redesign beyond parity-preserving migration needs
- Gamaka support
- Backend services, user accounts, or cloud persistence
- MIDI support
- New import formats
- Aesthetic redesign that is not required to preserve the current user experience
