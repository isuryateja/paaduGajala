# Feature Specification: Sustain Sound for All Piano Keys

**Feature Branch**: `002-sustain-all-keys`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "The piano keys when pressed long the sound should come until the key is pressed. Currently only few madhya sthayi keys have this feature. Implement this to all the keys in the piano"

---

## Overview

This feature extends the existing sustain functionality from a limited set of madhya sthayi (middle octave) keys to all keys across all octaves (sthayi) in the virtual piano. When a user presses and holds any piano key, the sound should continue playing until the key is released, providing a natural and consistent playing experience across the entire keyboard.

---

## User Scenarios & Testing

### User Story 1 - Sustain on All Octaves (Priority: P1)

As a musician practicing or performing on the virtual piano, I want all keys to sustain their sound when I hold them pressed, so that I can play notes of any pitch with the same expressive control.

**Why this priority**: This is the core functionality requested. Without consistent sustain behavior, the piano playing experience is fragmented and frustrating, especially when transitioning between octaves.

**Independent Test**: Can be fully tested by pressing and holding any key in any octave and verifying that the sound continues until release.

**Acceptance Scenarios**:

1. **Given** the virtual piano is loaded and ready, **When** I press and hold any key in the lower octave (mandra sthayi), **Then** the sound continues playing until I release the key.
2. **Given** the virtual piano is loaded and ready, **When** I press and hold any key in the middle octave (madhya sthayi), **Then** the sound continues playing until I release the key (maintaining existing behavior).
3. **Given** the virtual piano is loaded and ready, **When** I press and hold any key in the upper octave (tara sthayi), **Then** the sound continues playing until I release the key.

---

### User Story 2 - Consistent Release Behavior (Priority: P2)

As a musician, I want the sound to stop immediately when I release any key, so that I have precise control over note duration across all octaves.

**Why this priority**: While important for playability, this is secondary to having sustain work at all. Once sustain is enabled, proper release behavior ensures the feature feels natural.

**Independent Test**: Can be tested by pressing a key, holding it briefly, then releasing and verifying the sound stops within a reasonable time.

**Acceptance Scenarios**:

1. **Given** I am holding any piano key, **When** I release the key, **Then** the sound stops within 100 milliseconds.
2. **Given** I have pressed a key briefly and released it, **When** I press the same key again, **Then** a new sound plays without interference from the previous note.

---

### User Story 3 - Simultaneous Key Sustain (Priority: P3)

As a musician playing chords or multiple notes, I want to be able to sustain several keys simultaneously, so that I can play polyphonic passages naturally.

**Why this priority**: This enhances the realism of the piano but is not critical for basic single-note functionality. It provides value for more advanced users.

**Independent Test**: Can be tested by pressing multiple keys at once and verifying each sustains independently until its respective key is released.

**Acceptance Scenarios**:

1. **Given** the piano is ready, **When** I press and hold three different keys simultaneously, **Then** all three sounds sustain independently until each respective key is released.
2. **Given** I am holding multiple keys, **When** I release one key while holding others, **Then** only the released key's sound stops while the others continue.

---

### Edge Cases

- What happens when a user rapidly presses and releases the same key multiple times? Each press should trigger a new sound instance without cutting off the previous one prematurely.
- How does the system handle very long key presses (e.g., holding a key for 30+ seconds)? The sound should continue to sustain without automatic cutoff or degradation.
- What happens when the browser tab loses focus while keys are held? Sound should stop gracefully to prevent "stuck notes."
- How does the system handle touch devices where the user might slide their finger off the key? The sound should stop when touch ends or finger leaves the key area.
- What happens during octave transitions when playing glissando? Each key in the glissando should sustain briefly while the finger passes over it.

---

## Requirements

### Functional Requirements

- **FR-001**: All keys in the mandra sthayi (lower octave) MUST sustain sound while the key is pressed and held.
- **FR-002**: All keys in the madhya sthayi (middle octave) MUST sustain sound while the key is pressed and held (maintaining existing functionality).
- **FR-003**: All keys in the tara sthayi (upper octave) MUST sustain sound while the key is pressed and held.
- **FR-004**: When any key is released, its corresponding sound MUST stop within 100 milliseconds.
- **FR-005**: Multiple keys pressed simultaneously MUST each sustain independently until their respective keys are released.
- **FR-006**: The sustain behavior MUST be consistent across mouse/touch and keyboard input methods.
- **FR-007**: If the browser loses focus or visibility, all active sounds MUST stop to prevent stuck notes.

### Key Entities

- **Piano Key**: A clickable/touchable element representing a musical note. Each key has attributes including pitch, octave, and visual state.
- **Audio Instance**: The sound playback associated with a key press. Multiple instances may exist simultaneously for polyphonic playing.
- **Input Event**: User interaction (mouse down/up, touch start/end, key down/up) that triggers or stops sound playback.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can sustain any key across all three octaves for an indefinite duration while holding the key.
- **SC-002**: Sound release latency after key release is under 100 milliseconds for all keys.
- **SC-003**: Users can sustain at least 6 keys simultaneously without audio dropouts or interference.
- **SC-004**: 100% of keys in the piano interface demonstrate consistent sustain behavior (no keys lacking the feature).
- **SC-005**: No "stuck notes" occur when the browser tab loses focus or during rapid key presses.

---

## Assumptions

1. The existing madhya sthayi sustain implementation serves as the reference behavior to replicate.
2. The audio engine supports multiple simultaneous voices (polyphony) without performance degradation.
3. The current key event handling infrastructure can be extended to cover all keys without architectural changes.
4. Users expect natural piano-like sustain behavior (sound continues while key is held, stops on release).

---

## Dependencies

- The existing audio engine implementation must support per-note audio control.
- The current key event binding system must be extensible to all piano keys.
- Browser Web Audio API or equivalent audio playback mechanism must support dynamic start/stop control.

---

## Out of Scope

- Pedal-based sustain (sostenuto) functionality
- Adjustable sustain time or decay parameters
- Record and playback of sustained notes
- Visual feedback indicating which keys are currently sustaining
- Velocity-sensitive volume control based on press speed
