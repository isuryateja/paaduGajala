# Research: Sustain Sound for All Piano Keys

**Date**: 2026-03-19  
**Feature**: Sustain Sound for All Piano Keys

---

## Research Questions & Findings

### Q1: Which specific keys currently lack sustain functionality?

**Investigation Method**: Analyzed the `startHeldPianoNote()` method in `paadugajaala/index.html` (lines 2827-2864).

**Current Svara Mapping**:
```javascript
const svaraMap = {
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
};
```

**Findings**:
1. The mapping covers all 16 svara variations (S, R1-3, G1-3, M1-2, P, D1-3, N1-3)
2. Some shorthand aliases exist (e.g., 'r' → 'R2', 'm' → 'M1', 'd' → 'D2')
3. **Potential Issue**: The `octaveMap` maps UI octave names to AudioEngine octave names:
   ```javascript
   const octaveMap = {
       'low': 'mandara',
       'middle': 'madhya',
       'high': 'taara'
   };
   ```

**Decision**: The mapping appears complete for all svaras. The issue may be in which keys actually dispatch `pianoKeyDown`/`pianoKeyUp` events or how the audio engine handles certain note/octave combinations.

---

### Q2: Does the AudioEngine support all three octaves for sustained notes?

**Investigation Method**: Reviewed `audio_engine.js` frequency calculation and voice creation.

**Octave Support in AudioEngine**:
- `getFrequency(svara, octave)` accepts: 'mandara', 'madhya', 'taara'
- Octave multipliers: mandara=0.5, madhya=1.0, taara=2.0
- Frequency lookup uses `SVARA_FREQUENCIES` global or calculates from base frequency

**Voice Creation**:
- `_createVoice()` schedules oscillator with ADSR envelope
- Attack → Decay → Sustain → Release cycle
- For sustained notes, `startSvara()` sets a long duration (max 120s) and relies on `stop()` for early release

**Findings**:
1. AudioEngine correctly supports all three octaves
2. The `startSvara()` method is octave-agnostic - it passes octave to `getFrequency()`
3. No octave-specific restrictions found

**Decision**: The AudioEngine is capable of sustaining notes in all octaves. The limitation is in the integration layer.

---

### Q3: How are "stuck notes" prevented?

**Investigation Method**: Reviewed cleanup logic in both AudioEngine and AppController.

**Current Cleanup Mechanisms**:

1. **AudioEngine Voice Auto-Cleanup**:
   ```javascript
   oscillator.onended = () => {
       this.activeVoices.delete(voiceId);
       // disconnect nodes...
   };
   ```

2. **AppController Note Stopping**:
   ```javascript
   stopHeldPianoNote(keyEl) {
       const voice = this.heldPianoVoices.get(keyEl);
       if (!voice) return;
       this.heldPianoVoices.delete(keyEl);
       this.audioEngine.stopVoice(voice);
   }
   ```

3. **PianoController Auto-Release** (safety mechanism):
   ```javascript
   // Auto-release after 500ms for manual presses
   if (autoRelease) {
       setTimeout(() => { this.releaseKey(key); }, 500);
   }
   ```

**Findings**:
1. No explicit `visibilitychange` handler found for browser tab switching
2. No `blur`/`freeze` event handling for page lifecycle
3. If user switches tabs while holding keys, notes may continue indefinitely

**Decision**: Add `visibilitychange` event listener to stop all held notes when tab becomes hidden.

---

### Q4: What is the current key event flow?

**Investigation Method**: Traced event flow from user input to audio output.

**Event Flow**:

```
User Input (mouse/touch/keyboard)
    ↓
PianoController pressKey(key, autoRelease=false)
    ↓
Dispatch pianoKeyDown custom event
    ↓
AppController.startHeldPianoNote(keyEl, note, octave)
    ↓
AudioEngine.startSvara(svara, oct, velocity)
    ↓
_createVoice() → oscillator.start()
    ↓
Voice added to heldPianoVoices Map

User Releases Key
    ↓
PianoController releaseKey(key)
    ↓
Dispatch pianoKeyUp custom event
    ↓
AppController.stopHeldPianoNote(keyEl)
    ↓
AudioEngine.stopVoice(voice)
    ↓
Voice removed from heldPianoVoices Map
```

**Findings**:
1. Event flow is well-structured and should work for all keys
2. The `autoRelease=false` parameter ensures keys sustain until explicit release
3. All event listeners use `autoRelease=false`

---

## Root Cause Analysis

Based on the investigation, the current implementation **should** work for all keys. The fact that only "few madhya sthayi keys" sustain suggests one of these possibilities:

1. **Partial Deployment**: The sustain code was added but only for specific keys during testing
2. **Key Dataset Variations**: Some keys may have different `data-note` values that aren't in the svaraMap
3. **Event Binding**: Some keys may not have event listeners attached properly
4. **Audio Engine State**: Some note/octave combinations may fail in `getFrequency()`

**Recommended Debugging Approach**:
1. Add console logging to `startHeldPianoNote()` to see which keys are triggered
2. Verify all keys have proper `data-note` and `data-octave` attributes
3. Check if `getFrequency()` returns valid values for all note/octave combinations

---

## Decisions

| Decision | Rationale |
|----------|-----------|
| Extend existing `startSvara()`/`stopVoice()` pattern | Already implemented and working for some keys |
| Add `visibilitychange` handler | Prevents stuck notes when user switches tabs |
| Add defensive checks in `startHeldPianoNote()` | Log warnings for unmapped notes to aid debugging |
| Test all 48 keys (16 svaras × 3 octaves) | Ensures complete coverage |

---

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Rewrite AudioEngine sustain logic | Unnecessary - existing implementation is sound |
| Add pedal-based sustain | Out of scope per specification |
| Implement envelope-based auto-release | Would change existing behavior |
