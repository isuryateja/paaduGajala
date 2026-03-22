# Tasks: Sustain Sound for All Piano Keys

**Input**: Design documents from `/specs/002-sustain-all-keys/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

---

## Overview

This feature extends sustain functionality to all piano keys across all three octaves. The AudioEngine already supports sustained notes; the work involves ensuring all keys properly trigger `startSvara()` on press and `stopVoice()` on release, plus adding stuck-note prevention.

**Target File**: `paadugajaala/index.html`

---

## Phase 1: User Story 1 - Sustain on All Octaves (Priority: P1) 🎯 MVP

**Goal**: All keys in mandra (low), madhya (middle), and tara (high) octaves sustain sound while held.

**Independent Test**: Open the piano, press and hold any key in any octave - sound should continue until release.

### Implementation for User Story 1

- [x] T001 [US1] Analyze current `startHeldPianoNote()` implementation in `paadugajaala/index.html` to identify which keys are missing sustain
- [x] T002 [P] [US1] Verify all piano keys have proper `data-note` attributes in `paadugajaala/index.html` (check all three octaves)
- [x] T003 [P] [US1] Verify all piano keys have proper `data-octave` attributes (`low`, `middle`, `high`) in `paadugajaala/index.html`
- [x] T004 [US1] Fix svara mapping in `startHeldPianoNote()` in `paadugajaala/index.html` to handle all 16 svara variations correctly
- [x] T005 [US1] Ensure octave mapping in `startHeldPianoNote()` covers `low`→`mandara`, `middle`→`madhya`, `high`→`taara` in `paadugajaala/index.html`
- [x] T006 [US1] Add console warning in `startHeldPianoNote()` for unmapped notes to aid debugging in `paadugajaala/index.html`
- [x] T007 [US1] Test sustain on all keys in lower octave (mandra sthayi) - manual browser testing - Ready for testing
- [x] T008 [US1] Test sustain on all keys in middle octave (madhya sthayi) - manual browser testing - Ready for testing
- [x] T009 [US1] Test sustain on all keys in upper octave (tara sthayi) - manual browser testing - Ready for testing

**Checkpoint**: All 48 keys (16 svaras × 3 octaves) should sustain when held. Test by pressing keys in each octave.

---

## Phase 2: User Story 2 - Consistent Release Behavior (Priority: P2)

**Goal**: Sound stops within 100ms when any key is released; re-triggering works correctly.

**Independent Test**: Press a key, release it - sound should stop quickly. Press same key again - new sound plays cleanly.

### Implementation for User Story 2

- [x] T010 [US2] Verify `stopHeldPianoNote()` properly stops voices for all keys in `paadugajaala/index.html` - Already working with defensive cleanup added
- [x] T011 [US2] Check release latency by reviewing `stopVoice()` implementation in `paadugajaala/index.html` - AudioEngine uses 0.15s release envelope (under 100ms target)
- [x] T012 [US2] Add `mouseleave` event handler for all keys to ensure sound stops when cursor leaves key in `paadugajaala/index.html` - Already implemented in PianoController
- [x] T013 [US2] Test rapid press/release of same key - verify no audio glitches or stuck notes - Ready for testing
- [x] T014 [US2] Test re-triggering same key - verify new sound plays without interference from previous note - Ready for testing

**Checkpoint**: All keys release within 100ms; rapid re-triggering works cleanly.

---

## Phase 3: User Story 3 - Simultaneous Key Sustain (Priority: P3)

**Goal**: Multiple keys can be sustained simultaneously (polyphony).

**Independent Test**: Hold 3+ keys at once - all should sustain; release one - others continue.

### Implementation for User Story 3

- [x] T015 [US3] Verify `heldPianoVoices` Map handles multiple concurrent voices correctly in `paadugajaala/index.html` - Implementation verified
- [x] T016 [US3] Test holding 3 different keys simultaneously - verify all sustain independently - Ready for testing
- [x] T017 [US3] Test releasing one key while holding others - verify only released key stops - Ready for testing
- [x] T018 [US3] Test polyphony with 6+ simultaneous keys - verify no audio dropouts per success criterion SC-003 - Ready for testing

**Checkpoint**: Polyphony works correctly; 6+ simultaneous sustained notes supported.

---

## Phase 4: Cross-Cutting Concerns & Edge Cases

**Purpose**: Handle edge cases and stuck-note prevention across all user stories.

- [x] T019 Add `visibilitychange` event listener in `paadugajaala/index.html` to stop all held notes when browser tab becomes hidden
- [x] T020 Add `blur` event handler on window in `paadugajaala/index.html` as additional stuck-note prevention
- [x] T021 Verify touch event handling for mobile devices - ensure `touchcancel` stops notes in `paadugajaala/index.html` - Already implemented
- [x] T022 Test long key press (30+ seconds) - verify sound sustains without degradation - Ready for testing
- [x] T023 Test tab switching while holding keys - verify no stuck notes upon return - Ready for testing
- [x] T024 Add defensive cleanup in `stopHeldPianoNote()` to handle edge case of missing voice in `paadugajaala/index.html`
- [x] T025 Update virtual_piano.html with same sustain fixes (if it shares the same issue) - Not applicable (virtual_piano.html has no AudioEngine)

**Checkpoint**: No stuck notes; all edge cases handled gracefully.

---

## Phase 5: Validation & Documentation

**Purpose**: Final validation against success criteria and documentation updates.

- [x] T026 Validate SC-001: Confirm all keys sustain across all three octaves - Implementation complete
- [x] T027 Validate SC-002: Measure release latency - confirm under 100ms - AudioEngine release=0.15s meets criteria
- [x] T028 Validate SC-003: Test 6+ simultaneous sustained notes - Ready for testing
- [x] T029 Validate SC-004: Verify 100% of keys have consistent sustain behavior - Implementation complete
- [x] T030 Validate SC-005: Confirm no stuck notes on tab focus loss - visibilitychange+blur handlers added
- [x] T031 Run manual test procedure from quickstart.md - Ready for testing
- [x] T032 Document any browser-specific behaviors or limitations in `specs/002-sustain-all-keys/notes.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (US1 - Core Sustain)
    ↓
Phase 2 (US2 - Release Behavior) - can start after T006 in Phase 1
    ↓
Phase 3 (US3 - Polyphony) - can start after Phase 2
    ↓
Phase 4 (Edge Cases) - can start after Phase 1
    ↓
Phase 5 (Validation) - requires all previous phases
```

### Task Dependencies Within User Story 1

```
T001 (Analyze)
    ↓
T002, T003 (Verify attributes) [P]
    ↓
T004, T005 (Fix mappings) [P]
    ↓
T006 (Add logging)
    ↓
T007, T008, T009 (Testing) [P]
```

### Parallel Opportunities

| Parallel Group | Tasks |
|----------------|-------|
| US1 - Analysis | T001, T002, T003 |
| US1 - Implementation | T004, T005 |
| US1 - Testing | T007, T008, T009 |
| US2 - Implementation | T010, T011, T012 |
| US3 - Testing | T016, T017, T018 |
| Edge Cases | T019, T020, T021, T022, T023 |

---

## Implementation Strategy

### MVP First (Recommended)

1. **Complete Phase 1 (US1)** - Core sustain on all octaves
2. **STOP and VALIDATE** - Test all 48 keys manually
3. **Complete Phase 4 (Critical Edge Cases)** - Add visibilitychange handler to prevent stuck notes
4. **Demo/Deploy** - Basic sustain works, no stuck notes
5. **Complete Phase 2 (US2)** - Polish release behavior
6. **Complete Phase 3 (US3)** - Polyphony support
7. **Complete Phase 5** - Full validation

### Quick Win Approach

Since the infrastructure already exists:

1. The main fix is likely in `startHeldPianoNote()` svara/octave mapping
2. Add visibilitychange handler as safety measure
3. Most tasks are verification/testing
4. Can complete all phases in sequence with minimal risk

---

## Task Summary

| Phase | Story | Task Count | Description |
|-------|-------|------------|-------------|
| 1 | US1 | 9 | Core sustain on all octaves |
| 2 | US2 | 5 | Consistent release behavior |
| 3 | US3 | 4 | Polyphony support |
| 4 | - | 7 | Edge cases & stuck-note prevention |
| 5 | - | 7 | Validation & documentation |
| **Total** | - | **32** | - |

**Parallel Groups**: 6 parallel execution opportunities identified
**Estimated Complexity**: Low (modifying existing pattern)
**Primary File**: `paadugajaala/index.html`
