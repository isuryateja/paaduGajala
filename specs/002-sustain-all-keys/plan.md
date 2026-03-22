# Implementation Plan: Sustain Sound for All Piano Keys

**Branch**: `002-sustain-all-keys` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-sustain-all-keys/spec.md`

---

## Summary

Extend the existing piano key sustain functionality from a limited set of madhya sthayi keys to all keys across all three octaves (mandra, madhya, tara). The audio engine already supports sustained notes via `startSvara()` and `stopVoice()` methods. The implementation primarily involves ensuring all piano keys properly trigger and release sustained audio voices on user interaction.

---

## Technical Context

**Language/Version**: JavaScript (ES2020+), HTML5, CSS3
**Primary Dependencies**: Web Audio API (native browser API)
**Storage**: N/A (client-side only, no persistence)
**Testing**: Manual browser testing
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application - Single-page HTML with embedded JavaScript
**Performance Goals**: <100ms audio release latency, support 6+ simultaneous sustained notes
**Constraints**: Browser autoplay policies require user interaction before AudioContext initialization
**Scale/Scope**: Single HTML file (~3000 lines) with embedded AudioEngine class

### Current Architecture

The application consists of:
1. **AudioEngine** (`audio_engine.js` / embedded in `paadugajaala/index.html`): Web Audio API-based synthesizer with ADSR envelope, supports sustained notes via `startSvara()`/`stopVoice()`
2. **PianoController**: Manages piano key UI, handles input events (mouse, touch, keyboard), dispatches custom events
3. **AppController**: Orchestrates audio engine and piano, manages `heldPianoVoices` Map to track active sustained notes

### Existing Sustain Implementation

The sustain feature is partially implemented:
- `startHeldPianoNote(keyEl, note, octave)` - Starts a sustained note using `audioEngine.startSvara()`
- `stopHeldPianoNote(keyEl)` - Stops the sustained note using `audioEngine.stopVoice()`
- `heldPianoVoices` Map tracks active voices by key element
- Events `pianoKeyDown` and `pianoKeyUp` trigger start/stop

The issue appears to be in key mapping completeness - the svara mapping in `startHeldPianoNote()` may not cover all possible notes/octaves.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution template is not yet fully defined for this project. Based on the skill template structure, we will follow standard web development practices:

- ✅ **Simplicity**: Reuse existing `startSvara()`/`stopVoice()` infrastructure
- ✅ **Testability**: Each key sustain can be tested independently
- ✅ **Modularity**: Changes isolated to event handling and mapping logic

---

## Project Structure

### Documentation (this feature)

```text
specs/002-sustain-all-keys/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
paadugajaala/
└── index.html           # Main application with AudioEngine and PianoController

virtual_piano.html       # Standalone virtual piano (may need similar updates)

audio_engine.js          # Source AudioEngine class (used as reference)
```

**Structure Decision**: This is a single-file web application. The implementation will focus on `paadugajaala/index.html` which contains the full application logic. The `virtual_piano.html` may need similar updates but is secondary.

---

## Phase 0: Research

### Research Questions

1. **Note Coverage Analysis**: Which specific keys currently lack sustain functionality?
   - Investigation: Review `startHeldPianoNote()` svara mapping completeness
   - Findings: The mapping covers basic notes but may miss variations

2. **Octave Support Verification**: Does the AudioEngine support all three octaves?
   - Investigation: Check `getFrequency()` and octave mapping in `audio_engine.js`
   - Findings: Supports 'mandara', 'madhya', 'taara' octaves with proper multipliers

3. **Edge Case Handling**: How are stuck notes prevented?
   - Investigation: Review visibility change handling and cleanup logic
   - Findings: Basic cleanup exists but may need enhancement for all keys

### Research Findings

See [research.md](./research.md) for detailed findings.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for entity definitions.

Key entities:
- **PianoKey**: DOM element with `data-note` and `data-octave` attributes
- **Voice**: AudioEngine voice object with `id`, `stop()` method
- **KeyMapping**: Maps keyboard keys to `{note, octave}` pairs

### Contracts

See `/contracts/` directory for interface specifications.

Primary contracts:
- **Audio Engine Interface**: `startSvara(svara, octave, velocity, when, maxDuration)` → Voice
- **Piano Event Interface**: `pianoKeyDown`/`pianoKeyUp` custom events with `{note, octave, isBlack}` detail

### Implementation Approach

Based on code analysis, the implementation requires:

1. **Complete the svara mapping** in `startHeldPianoNote()` to handle all note variations
2. **Verify octave mapping** covers mandra, madhya, and tara sthayi correctly
3. **Add visibility change handler** to prevent stuck notes when tab loses focus
4. **Test all keys** across all octaves for consistent sustain behavior

### Quick Start

See [quickstart.md](./quickstart.md) for developer setup instructions.

---

## Complexity Tracking

No constitution violations identified. Implementation reuses existing patterns without adding complexity.

| Aspect | Assessment |
|--------|------------|
| Code Changes | Minimal - extending existing pattern to all keys |
| Risk | Low - existing AudioEngine API is stable |
| Testing | Manual verification of all keys required |

---

## Next Steps

1. ✅ **Phase 0 Complete**: Research findings documented
2. ✅ **Phase 1 Complete**: Design and contracts created
3. ⏳ **Phase 2 Pending**: Run `/speckit.tasks` to generate implementation tasks

Run `/speckit.tasks` to proceed to task generation.
