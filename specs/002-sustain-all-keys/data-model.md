# Data Model: Sustain Sound for All Piano Keys

**Date**: 2026-03-19  
**Feature**: Sustain Sound for All Piano Keys

---

## Entities

### PianoKey (DOM Element)

Represents a visual piano key that users interact with.

**Attributes**:
- `data-note` (string): Svara notation in lowercase (e.g., 's', 'r1', 'g3', 'm2', 'p', 'd2', 'n3')
- `data-octave` (string): Octave identifier (e.g., 'low', 'middle', 'high')
- `class` (string): CSS classes including 'key', 'white' or 'black', 'active' when pressed

**Example**:
```html
<div class="key white" data-note="s" data-octave="middle">S</div>
<div class="key black" data-note="r1" data-octave="middle">R1</div>
```

---

### Voice (AudioEngine Object)

Represents an active audio voice (oscillator + envelope) for a sustained note.

**Attributes**:
- `id` (string): Unique identifier for the voice
- `oscillator` (OscillatorNode): Web Audio API oscillator
- `envelopeGain` (GainNode): ADSR envelope gain node
- `voiceGain` (GainNode): Velocity/volume gain node
- `frequency` (number): Playing frequency in Hz
- `svara` (string): Svara name (e.g., 'S', 'R1', 'G3')
- `octave` (string): Octave name (e.g., 'mandara', 'madhya', 'taara')
- `stop(when)` (function): Stops the voice with release envelope

**Lifecycle**:
1. Created by `AudioEngine.startSvara()`
2. Stored in `heldPianoVoices` Map
3. Stopped by `AudioEngine.stopVoice()` or auto-cleanup

---

### KeyMapping

Maps keyboard keys to piano notes for computer keyboard play.

**Structure**:
```javascript
{
    'a': { note: 's', octave: 'middle' },
    'w': { note: 'r1', octave: 'middle' },
    // ... etc
}
```

**Note**: Key mappings are defined in `PianoController.keyboardMap`.

---

### SvaraMap

Maps DOM note values to AudioEngine svara names.

**Structure**:
```javascript
{
    's': 'S',
    'r': 'R2',
    'r1': 'R1',
    'r2': 'R2',
    'g1': 'G1',
    'g2': 'G2',
    'g3': 'G3',
    'm': 'M1',
    'm1': 'M1',
    'm2': 'M2',
    'p': 'P',
    'd': 'D2',
    'd1': 'D1',
    'd2': 'D2',
    'n1': 'N1',
    'n2': 'N2',
    'n3': 'N3'
}
```

---

### OctaveMap

Maps DOM octave values to AudioEngine octave names.

**Structure**:
```javascript
{
    'low': 'mandara',
    'middle': 'madhya',
    'high': 'taara'
}
```

---

## State Management

### heldPianoVoices (Map)

Tracks currently sustained notes.

**Key**: PianoKey DOM element (HTMLElement)  
**Value**: Voice object from AudioEngine

**Operations**:
- `set(keyEl, voice)` - When note starts
- `get(keyEl)` - To retrieve voice for stopping
- `delete(keyEl)` - When note stops
- `forEach()` - For cleanup operations (e.g., visibility change)

---

### activeKeys (Set)

Tracks visually active keys in PianoController.

**Value**: PianoKey DOM element

**Purpose**: Prevents duplicate triggers and manages visual state.

---

## Relationships

```
┌─────────────┐     press/release     ┌─────────────────┐
│  PianoKey   │◄─────────────────────►│ PianoController │
│  (DOM)      │   pianoKeyDown/Up     │                 │
└──────┬──────┘                       └────────┬────────┘
       │                                       │
       │ data-note/data-octave                 │ startHeldPianoNote
       │                                       │ stopHeldPianoNote
       ▼                                       ▼
┌─────────────┐                       ┌─────────────────┐
│  SvaraMap   │                       │  AppController  │
│  OctaveMap  │                       │                 │
└─────────────┘                       └────────┬────────┘
                                               │
                                               │ startSvara/stopVoice
                                               ▼
                                       ┌─────────────────┐
                                       │  AudioEngine    │
                                       │                 │
                                       │ heldPianoVoices │
                                       └─────────────────┘
```

---

## Validation Rules

1. **Key Attribute Validation**: All piano keys MUST have `data-note` and `data-octave` attributes
2. **Svara Mapping**: `data-note` value MUST exist in `svaraMap` or be loggable as unmapped
3. **Octave Mapping**: `data-octave` value MUST exist in `octaveMap`
4. **Voice Uniqueness**: A key can only have one active voice at a time (enforced by `heldPianoVoices.has(keyEl)` check)
5. **Cleanup Guarantee**: All voices MUST be stopped via `stopHeldPianoNote()` or visibility change handler
