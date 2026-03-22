# Contract: Audio Engine Interface

**Date**: 2026-03-19  
**Feature**: Sustain Sound for All Piano Keys

---

## Interface: AudioEngine

### Method: startSvara

Starts a sustained note that continues until explicitly stopped.

**Signature**:
```javascript
startSvara(svara, octave, velocity, when, maxDurationSeconds) -> Voice|null
```

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| svara | string | Yes | - | Svara name (e.g., 'S', 'R1', 'G3', 'M2', 'P', 'D2', 'N3') |
| octave | string | No | 'madhya' | Octave ('mandara', 'madhya', 'taara') |
| velocity | number | No | 1.0 | Note volume (0.0 to 1.0) |
| when | number | No | null | AudioContext time to start (null = now) |
| maxDurationSeconds | number | No | 120 | Safety cap - auto-stop after this duration |

**Returns**: Voice object or null if engine not initialized

**Voice Object Structure**:
```javascript
{
    id: string,           // Unique voice identifier
    oscillator: OscillatorNode,
    envelopeGain: GainNode,
    voiceGain: GainNode,
    frequency: number,    // Hz
    svara: string,
    octave: string,
    startTime: number,    // AudioContext time
    duration: number,     // Scheduled duration
    stop: Function(when)  // Early stop method
}
```

**Example**:
```javascript
const voice = audioEngine.startSvara('S', 'madhya', 1.0);
// ... later ...
audioEngine.stopVoice(voice);
```

---

### Method: stopVoice

Stops a currently playing voice with release envelope.

**Signature**:
```javascript
stopVoice(voiceOrId, when) -> boolean
```

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| voiceOrId | Voice\|string | Yes | - | Voice object or voice ID string |
| when | number | No | null | AudioContext time to stop (null = now) |

**Returns**: `true` if voice was found and stopped, `false` otherwise

**Example**:
```javascript
const stopped = audioEngine.stopVoice(voice);
```

---

### Method: stopAll

Stops all playing sounds immediately.

**Signature**:
```javascript
stopAll() -> void
```

**Example**:
```javascript
audioEngine.stopAll();
```

---

## Events

### noteOn

Emitted when a note starts playing.

**Payload**:
```javascript
{
    svara: string,        // e.g., 'S'
    octave: string,       // e.g., 'madhya'
    frequency: number,    // e.g., 261.63
    voiceId: string,      // Voice identifier
    startTime: number,    // AudioContext time
    duration: number,     // Scheduled duration
    sustained: boolean    // true if from startSvara()
}
```

**Subscription**:
```javascript
audioEngine.on('noteOn', (data) => {
    console.log('Note started:', data.svara);
});
```

---

### noteOff

Emitted when a note stops playing.

**Payload**:
```javascript
{
    svara: string,    // e.g., 'S'
    octave: string,   // e.g., 'madhya'
    voiceId: string   // Voice identifier
}
```

**Subscription**:
```javascript
audioEngine.on('noteOff', (data) => {
    console.log('Note stopped:', data.svara);
});
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Engine not initialized | Returns null, logs warning to console |
| Invalid svara | May throw error or return undefined frequency |
| Invalid octave | Falls back to 'madhya' |
| Voice not found in stopVoice | Returns false silently |
| AudioContext suspended | Auto-resumes before playing |

---

## Supported Svaras

| Svara | Description |
|-------|-------------|
| S | Shadja (Sa) |
| R1 | Shuddha Rishabha |
| R2 | Chatusruti Rishabha |
| R3 | Shatsruti Rishabha |
| G1 | Shuddha Gandhara |
| G2 | Sadharana Gandhara |
| G3 | Antara Gandhara |
| M1 | Shuddha Madhyama |
| M2 | Prati Madhyama |
| P | Panchama |
| D1 | Shuddha Dhaivata |
| D2 | Chatusruti Dhaivata |
| D3 | Shatsruti Dhaivata |
| N1 | Shuddha Nishada |
| N2 | Kaisiki Nishada |
| N3 | Kakali Nishada |

---

## Supported Octaves

| Octave | Frequency Range | Description |
|--------|-----------------|-------------|
| mandara | ~130-247 Hz | Lower octave (1st) |
| madhya | ~261-494 Hz | Middle octave (2nd) |
| taara | ~523-988 Hz | Upper octave (3rd) |
