# Tasks: Lift-and-Shift Application Refactor

**Input**: Design documents from `/specs/003-lift-shift-refactor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because parity verification is an explicit success criterion and the design documents call for Vitest coverage plus manual parity checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the SvelteKit and TypeScript project shell at the repository root.

- [X] T001 Create root project and toolchain configuration in `/Users/surya/Documents/code/projects/paaduGajala/package.json`, `/Users/surya/Documents/code/projects/paaduGajala/tsconfig.json`, `/Users/surya/Documents/code/projects/paaduGajala/vite.config.ts`, `/Users/surya/Documents/code/projects/paaduGajala/svelte.config.js`, `/Users/surya/Documents/code/projects/paaduGajala/eslint.config.js`, and `/Users/surya/Documents/code/projects/paaduGajala/.prettierrc`
- [X] T002 Create SvelteKit entry shell and route directories in `/Users/surya/Documents/code/projects/paaduGajala/src/app.html`, `/Users/surya/Documents/code/projects/paaduGajala/src/app.d.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/routes/+layout.svelte`
- [X] T003 [P] Configure migrated static assets and routing support in `/Users/surya/Documents/code/projects/paaduGajala/static/example.txt`, `/Users/surya/Documents/code/projects/paaduGajala/static/favicon.png`, and `/Users/surya/Documents/code/projects/paaduGajala/vercel.json`
- [X] T004 [P] Create shared visual theme files in `/Users/surya/Documents/code/projects/paaduGajala/src/styles/tokens.css`, `/Users/surya/Documents/code/projects/paaduGajala/src/styles/global.css`, and `/Users/surya/Documents/code/projects/paaduGajala/src/styles/app-theme.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Port core logic and shared building blocks that all user stories depend on.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [X] T005 Create shared domain types and constants in `/Users/surya/Documents/code/projects/paaduGajala/src/domain/shared/types.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/shared/constants.ts`
- [X] T006 [P] Port pitch normalization and frequency lookup into `/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara.types.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara.constants.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-frequencies.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/pitch/svara-normalization.ts`
- [X] T007 [P] Port notation constants, parser, validation, and stats into `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.types.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.constants.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.parser.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.validation.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.stats.ts`
- [X] T008 [P] Port audio presets and playback engine into `/Users/surya/Documents/code/projects/paaduGajala/src/domain/audio/audio.types.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/audio/audio.presets.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/audio/audio-engine.ts`
- [X] T009 [P] Port piano note definitions and keyboard mapping into `/Users/surya/Documents/code/projects/paaduGajala/src/domain/piano/piano.types.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/piano/piano.constants.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/piano/piano-keyboard-map.ts`
- [X] T010 [P] Create browser and storage adapters in `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/file-reader.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/visibility-events.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/dom-helpers.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/infra/storage/session-state.ts`
- [X] T011 [P] Add shared utility helpers in `/Users/surya/Documents/code/projects/paaduGajala/src/lib/utils/assert.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/lib/utils/clamp.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/lib/utils/noop.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/lib/utils/format-duration.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/lib/ids/create-id.ts`
- [X] T012 Create reactive state stores in `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/ui.store.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/playback.store.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/notation.store.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/settings.store.ts`
- [X] T013 Create orchestration skeletons in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/notation.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/playback.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/piano.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/settings.actions.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/services/app-bootstrap.ts`
- [X] T014 [P] Create reusable piano UI primitives in `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoCard.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKeyboard.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoOctave.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKey.svelte`
- [X] T015 [P] Add foundational domain tests in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/pitch/svara-frequencies.test.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.parser.test.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.validation.test.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.stats.test.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/audio/audio-config.test.ts`

**Checkpoint**: Foundation ready. User story work can begin.

---

## Phase 3: User Story 1 - Keep the Main Player Familiar (Priority: P1) 🎯 MVP

**Goal**: Rebuild the main notation-player route so existing users can keep the current paste, parse, play, and settings workflow without relearning the app.

**Independent Test**: Open `/`, verify all current controls are present, load or enter notation, parse it, adjust settings, and complete play, pause, and stop flows with the same user-visible feedback as the current app.

### Implementation for User Story 1

- [X] T016 [P] [US1] Create layout shell components in `/Users/surya/Documents/code/projects/paaduGajala/src/components/layout/AppHeader.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/layout/AppFooter.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/layout/LoadingOverlay.svelte`
- [X] T017 [P] [US1] Create shared control and feedback components in `/Users/surya/Documents/code/projects/paaduGajala/src/components/common/ToastContainer.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/common/StatusBar.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/common/RangeControl.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/common/SelectControl.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/common/StatCard.svelte`
- [X] T018 [P] [US1] Create notation presentation components in `/Users/surya/Documents/code/projects/paaduGajala/src/components/notation/NotationInputCard.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/notation/ParsedNotationCard.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/notation/StatisticsCard.svelte`
- [X] T019 [P] [US1] Create playback settings components in `/Users/surya/Documents/code/projects/paaduGajala/src/components/playback/PlaybackControlsCard.svelte` and `/Users/surya/Documents/code/projects/paaduGajala/src/components/playback/SettingsCard.svelte`
- [X] T020 [US1] Compose the main player route in `/Users/surya/Documents/code/projects/paaduGajala/src/routes/+page.svelte`
- [X] T021 [US1] Implement parse, example-load, file-upload, and clear flows in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/notation.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/notation.store.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/file-reader.ts`
- [X] T022 [US1] Implement play, pause, stop, tempo, volume, tuning, waveform, and preset flows in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/playback.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/settings.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/playback.store.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/settings.store.ts`
- [X] T023 [US1] Connect embedded piano, status feedback, loading, and toasts in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/piano.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/ui.store.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoCard.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/routes/+layout.svelte`
- [X] T024 [P] [US1] Add main-player route checks in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/routes/main-player.route.test.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/routes/main-player.workflow.test.ts`

**Checkpoint**: The main player route is fully functional and testable on its own.

---

## Phase 4: User Story 2 - Preserve Existing Music Interpretation (Priority: P1)

**Goal**: Preserve parser, validation, statistics, preview, and playback-sequence behavior for existing notation inputs and examples.

**Independent Test**: Compare the bundled example and representative valid and invalid notation inputs between the legacy app and the migrated app, confirming equivalent parse results, validation feedback, statistics, and playback order.

### Implementation for User Story 2

- [X] T025 [P] [US2] Add notation parity fixtures in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/fixtures/example-input.txt`, `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/fixtures/invalid-input.txt`, and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/fixtures/multiline-input.txt`
- [X] T026 [P] [US2] Add parser and validation parity coverage in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.parser.test.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.validation.test.ts`
- [X] T027 [P] [US2] Add statistics and sequence parity coverage in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/notation/notation.stats.test.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/audio/audio-sequence.test.ts`
- [X] T028 [US2] Align parsed-node output and preview-ready structures with legacy behavior in `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.parser.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.types.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.stats.ts`
- [X] T029 [US2] Align validation messaging and malformed-input handling with legacy behavior in `/Users/surya/Documents/code/projects/paaduGajala/src/domain/notation/notation.validation.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/notation.actions.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/ui.store.ts`
- [X] T030 [US2] Preserve example-content and imported-text parity in `/Users/surya/Documents/code/projects/paaduGajala/static/example.txt`, `/Users/surya/Documents/code/projects/paaduGajala/src/routes/+page.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/notation.store.ts`
- [X] T031 [US2] Preserve playback note-follow sequencing from parsed content in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/playback.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/playback.store.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/notation/ParsedNotationCard.svelte`

**Checkpoint**: Existing notation behavior is preserved and verifiable independently of later stories.

---

## Phase 5: User Story 3 - Keep the Standalone Piano Available (Priority: P2)

**Goal**: Preserve the standalone virtual piano as a dedicated route with direct note interaction and safe cleanup behavior.

**Independent Test**: Open `/piano`, trigger notes with mouse, touch, and keyboard input, and confirm the standalone piano remains reachable, responsive, and behaviorally equivalent to the current piano experience.

### Implementation for User Story 3

- [X] T032 [P] [US3] Add standalone piano route and interaction coverage in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/routes/piano.route.test.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/piano/piano.actions.test.ts`
- [X] T033 [US3] Implement the standalone piano route in `/Users/surya/Documents/code/projects/paaduGajala/src/routes/piano/+page.svelte`
- [X] T034 [US3] Connect standalone direct-play orchestration in `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/piano.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/stores/ui.store.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/routes/piano/+page.svelte`
- [X] T035 [US3] Preserve mouse, touch, and keyboard mapping parity in `/Users/surya/Documents/code/projects/paaduGajala/src/domain/piano/piano-keyboard-map.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKeyboard.svelte`, and `/Users/surya/Documents/code/projects/paaduGajala/src/components/piano/PianoKey.svelte`
- [X] T036 [US3] Add held-note cleanup for visibility changes and route teardown in `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/visibility-events.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/audio/audio-engine.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/routes/piano/+page.svelte`

**Checkpoint**: The standalone piano route is available and testable independently.

---

## Phase 6: User Story 4 - Create a Safer Base for Later Work (Priority: P3)

**Goal**: Finish the structural separation so future features can build on the migrated app without reintroducing the current coupling.

**Independent Test**: Review the migrated code layout and confirm that route components, orchestration, domain behavior, and browser-only adapters can be changed independently while prior user-story checks still pass.

### Implementation for User Story 4

- [X] T037 [P] [US4] Formalize shared module boundaries and exported contracts in `/Users/surya/Documents/code/projects/paaduGajala/src/domain/shared/types.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/domain/shared/constants.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/services/app-bootstrap.ts`
- [X] T038 [US4] Remove remaining route-level business logic by consolidating orchestration in `/Users/surya/Documents/code/projects/paaduGajala/src/routes/+page.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/routes/piano/+page.svelte`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/notation.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/playback.actions.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/piano.actions.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/app/actions/settings.actions.ts`
- [X] T039 [US4] Isolate browser-only side effects behind adapters in `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/dom-helpers.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/file-reader.ts`, `/Users/surya/Documents/code/projects/paaduGajala/src/infra/browser/visibility-events.ts`, and `/Users/surya/Documents/code/projects/paaduGajala/src/infra/storage/session-state.ts`
- [X] T040 [US4] Add maintainability boundary checks in `/Users/surya/Documents/code/projects/paaduGajala/src/tests/app/app-bootstrap.test.ts` and `/Users/surya/Documents/code/projects/paaduGajala/src/tests/app/store-action-boundaries.test.ts`

**Checkpoint**: The migrated app exposes maintainable boundaries without changing user-visible behavior.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish release-facing cleanup, documentation, and final parity validation.

- [X] T041 [P] Update developer and user documentation for the migrated app in `/Users/surya/Documents/code/projects/paaduGajala/README.md`
- [X] T042 [P] Finalize runtime and deployment configuration for the migrated app in `/Users/surya/Documents/code/projects/paaduGajala/package.json` and `/Users/surya/Documents/code/projects/paaduGajala/vercel.json`
- [X] T043 Validate the migrated app against the parity checklist in `/Users/surya/Documents/code/projects/paaduGajala/specs/003-lift-shift-refactor/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies.
- **Phase 2: Foundational** depends on Phase 1 and blocks all story work.
- **Phase 3: US1** depends on Phase 2.
- **Phase 4: US2** depends on Phase 2.
- **Phase 5: US3** depends on Phase 2.
- **Phase 6: US4** depends on completion of the parity-preserving user-story work in Phases 3, 4, and 5.
- **Phase 7: Polish** depends on the desired user stories being complete.

### User Story Dependencies

- **US1** is the suggested MVP and can start as soon as Phase 2 completes.
- **US2** can start after Phase 2 and focuses on parity verification and behavior alignment for notation and playback.
- **US3** can start after Phase 2, but it should be merged carefully with US1 because both touch shared piano orchestration files.
- **US4** should follow the user-facing parity work so structural cleanup does not obscure regressions.

### Within Each User Story

- Test and fixture tasks should be created before the related implementation refinements.
- Shared state and action changes should land before route-level wiring that depends on them.
- Route composition should complete before final story-level smoke checks are closed.

### Parallel Opportunities

- `T003` and `T004` can run in parallel after `T001` and `T002`.
- `T006` through `T011` can run in parallel once `T005` is complete.
- `T016` through `T019` and `T024` can run in parallel within US1.
- `T025` through `T027` can run in parallel within US2.
- `T032` can run in parallel with `T033` setup work in US3 once foundational piano modules are available.
- `T041` and `T042` can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Create layout shell components in src/components/layout/AppHeader.svelte, src/components/layout/AppFooter.svelte, and src/components/layout/LoadingOverlay.svelte"
Task: "Create shared control and feedback components in src/components/common/ToastContainer.svelte, src/components/common/StatusBar.svelte, src/components/common/RangeControl.svelte, src/components/common/SelectControl.svelte, and src/components/common/StatCard.svelte"
Task: "Create notation presentation components in src/components/notation/NotationInputCard.svelte, src/components/notation/ParsedNotationCard.svelte, and src/components/notation/StatisticsCard.svelte"
Task: "Create playback settings components in src/components/playback/PlaybackControlsCard.svelte and src/components/playback/SettingsCard.svelte"
Task: "Add main-player route checks in src/tests/routes/main-player.route.test.ts and src/tests/routes/main-player.workflow.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add notation parity fixtures in src/tests/notation/fixtures/example-input.txt, src/tests/notation/fixtures/invalid-input.txt, and src/tests/notation/fixtures/multiline-input.txt"
Task: "Add parser and validation parity coverage in src/tests/notation/notation.parser.test.ts and src/tests/notation/notation.validation.test.ts"
Task: "Add statistics and sequence parity coverage in src/tests/notation/notation.stats.test.ts and src/tests/audio/audio-sequence.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add standalone piano route and interaction coverage in src/tests/routes/piano.route.test.ts and src/tests/piano/piano.actions.test.ts"
Task: "Implement the standalone piano route in src/routes/piano/+page.svelte"
```

## Parallel Example: User Story 4

```bash
Task: "Formalize shared module boundaries and exported contracts in src/domain/shared/types.ts, src/domain/shared/constants.ts, and src/app/services/app-bootstrap.ts"
Task: "Add maintainability boundary checks in src/tests/app/app-bootstrap.test.ts and src/tests/app/store-action-boundaries.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational prerequisites.
3. Complete Phase 3: User Story 1.
4. Validate the main route independently before expanding scope.

### Incremental Delivery

1. Finish Setup + Foundational to establish the migrated app skeleton.
2. Deliver US1 for the familiar main-player workflow.
3. Deliver US2 for notation and playback parity hardening.
4. Deliver US3 for standalone piano parity.
5. Deliver US4 for long-term maintainability and boundary cleanup.
6. Finish with polish and parity validation.

### Parallel Team Strategy

1. One track handles Setup and Foundational domain ports.
2. After Phase 2, one developer can focus on US1 UI composition, another on US2 parity fixtures and tests, and another on US3 route-specific piano work.
3. Sequence merges carefully around shared files in `src/app/actions/` and `src/app/stores/`.

---

## Notes

- All tasks follow the required checklist format.
- The suggested MVP scope is **User Story 1** after Setup and Foundational phases.
- The highest-risk work is parity drift in notation, playback, and piano interaction, so tests and fixtures are front-loaded around those areas.
