# Contract: Piano Event Interface

**Date**: 2026-03-19  
**Feature**: Sustain Sound for All Piano Keys

---

## Custom Events

The piano dispatches custom events for key press and release actions. These events bubble up through the DOM.

---

### Event: pianoKeyDown

Dispatched when a piano key is pressed (mouse down, touch start, or keyboard key down).

**Type**: `CustomEvent`  
**Bubbles**: Yes  
**Target**: The piano key DOM element

**Detail Payload**:
```javascript
{
    note: string,      // Note identifier (e.g., 's', 'r1', 'g3', 'p')
    octave: string,    // Octave identifier (e.g., 'low', 'middle', 'high')
    isBlack: boolean   // true if black key, false if white key
}
```

**Example Usage**:
```javascript
document.addEventListener('pianoKeyDown', (e) => {
    console.log('Key pressed:', e.detail.note, e.detail.octave);
    // Start sustained note
    appController.startHeldPianoNote(e.target, e.detail.note, e.detail.octave);
});
```

---

### Event: pianoKeyUp

Dispatched when a piano key is released (mouse up, mouse leave, touch end, or keyboard key up).

**Type**: `CustomEvent`  
**Bubbles**: Yes  
**Target**: The piano key DOM element

**Detail Payload**:
```javascript
{
    note: string,    // Note identifier (e.g., 's', 'r1', 'g3', 'p')
    octave: string   // Octave identifier (e.g., 'low', 'middle', 'high')
}
```

**Example Usage**:
```javascript
document.addEventListener('pianoKeyUp', (e) => {
    console.log('Key released:', e.detail.note, e.detail.octave);
    // Stop sustained note
    appController.stopHeldPianoNote(e.target);
});
```

---

## Key Element Structure

### Attributes

All piano key elements MUST have these attributes:

| Attribute | Type | Values | Description |
|-----------|------|--------|-------------|
| data-note | string | 's', 'r', 'r1', 'r2', 'g1', 'g2', 'g3', 'm', 'm1', 'm2', 'p', 'd', 'd1', 'd2', 'n1', 'n2', 'n3' | Note identifier |
| data-octave | string | 'low', 'middle', 'high' | Octave identifier |

### CSS Classes

| Class | Description |
|-------|-------------|
| key | Base class for all keys |
| white | White piano key |
| black | Black piano key |
| active | Applied while key is pressed |

### Example HTML

```html
<!-- White key -->
<div class="key white" data-note="s" data-octave="middle">S</div>

<!-- Black key -->
<div class="key black" data-note="r1" data-octave="middle">R1</div>
```

---

## Input Methods

The piano responds to three input methods, all producing the same events:

### Mouse Input

| Event | Action | pianoKeyDown | pianoKeyUp |
|-------|--------|--------------|------------|
| mousedown | Press key | ✓ | |
| mouseup | Release key | | ✓ |
| mouseleave | Release key (if pressed) | | ✓ |

### Touch Input

| Event | Action | pianoKeyDown | pianoKeyUp |
|-------|--------|--------------|------------|
| touchstart | Press key | ✓ | |
| touchend | Release key | | ✓ |
| touchcancel | Release key | | ✓ |

### Keyboard Input

| Event | Action | pianoKeyDown | pianoKeyUp |
|-------|--------|--------------|------------|
| keydown | Press mapped key | ✓ | |
| keyup | Release mapped key | | ✓ |

**Note**: `e.repeat` is ignored for keydown events (prevents re-triggering while holding).

---

## Mapping: Keyboard to Piano

Computer keyboard keys map to piano keys as defined in `PianoController.keyboardMap`.

Example mapping structure:
```javascript
{
    'a': { note: 's', octave: 'low' },
    'w': { note: 'r1', octave: 'low' },
    // ... etc
}
```

The actual mapping covers approximately 3 octaves of piano keys.

---

## Event Flow

```
User Action (mouse/touch/keyboard)
    ↓
PianoController handler
    ↓
key.classList.add('active')
    ↓
CustomEvent dispatched (pianoKeyDown/pianoKeyUp)
    ↓
Bubbles to document
    ↓
AppController event listener
    ↓
AudioEngine method called
```

---

## Integration Points

To integrate with the piano sustain feature:

1. **Listen for events**:
   ```javascript
   document.addEventListener('pianoKeyDown', handleKeyDown);
   document.addEventListener('pianoKeyUp', handleKeyUp);
   ```

2. **Start sustain on press**:
   ```javascript
   function handleKeyDown(e) {
       const { note, octave } = e.detail;
       const voice = audioEngine.startSvara(
           mapToSvara(note),
           mapToOctave(octave)
       );
       heldVoices.set(e.target, voice);
   }
   ```

3. **Stop sustain on release**:
   ```javascript
   function handleKeyUp(e) {
       const voice = heldVoices.get(e.target);
       if (voice) {
           audioEngine.stopVoice(voice);
           heldVoices.delete(e.target);
       }
   }
   ```

---

## Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Key pressed again while already active | Ignored (prevents duplicate triggers) |
| Key released when not active | Ignored silently |
| Invalid data-note attribute | May result in undefined svara mapping |
| Invalid data-octave attribute | Falls back to 'madhya' octave |
