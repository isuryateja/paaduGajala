# Contract: Audio Engine

**Module**: `audio_engine.js`  
**Purpose**: Generate audio for Carnatic svaras using English notation

## Interface

### AudioEngine Class

```javascript
const engine = new AudioEngine(options);
await engine.init();
```

**Constructor Options**:
- `waveform` (string): 'sine', 'triangle', 'sawtooth', 'square' (default: 'triangle')
- `envelope` (object): { attack, decay, sustain, release }
- `masterVolume` (number): 0.0 to 1.0 (default: 0.7)
- `tuning` (string): 'equal' or 'just' (default: 'equal')
- `baseFrequency` (number): Sa frequency in Hz (default: 261.6255653005986)

### Main Methods

#### `playSvara(notation, octave, duration, velocity, when)`

Play a single svara.

**Parameters**:
- `notation` (string): English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3)
- `octave` (string): 'mandra', 'madhya', 'taara' (default: 'madhya')
- `duration` (number): Duration in beats (default: 1.0)
- `velocity` (number): Volume 0.0-1.0 (default: 1.0)
- `when` (number): AudioContext time to play (default: now)

**Returns**: Voice object or null

**Example**:
```javascript
engine.playSvara("S", "madhya", 1.0);   // Play Sa for 1 beat
engine.playSvara("R1", "madhya", 0.5);  // Play R1 for 0.5 beats
engine.playSvara("S", "taara", 2.0);    // Play high Sa for 2 beats
```

#### `startSvara(notation, octave, velocity, when, maxDuration)`

Start a sustained note (until stopped).

**Parameters**:
- Same as playSvara except no duration
- `maxDuration` (number): Safety timeout (default: 120 seconds)

**Returns**: Voice object

**Example**:
```javascript
const voice = engine.startSvara("S", "madhya");
// ... later ...
engine.stopVoice(voice);
```

#### `stopVoice(voiceOrId, when)`

Stop a playing voice.

**Parameters**:
- `voiceOrId` (string|object): Voice ID or voice object
- `when` (number): When to stop (AudioContext time)

**Returns**: boolean (success)

#### `playSequence(notes, tempo, options)`

Play a sequence of notes.

**Parameters**:
- `notes` (array): Array of note objects
- `tempo` (number): BPM (default: 120)
- `options` (object): { loop, loopCount }

**Note Object Format**:
```javascript
{
  svara: "R1",           // English notation
  octave: "madhya",      // Octave
  duration: 1.0,         // In beats
  velocity: 1.0,         // Optional
  rest: false            // Optional: true for silence
}
```

**Returns**: Sequence controller object

**Example**:
```javascript
engine.playSequence([
  { svara: "S", octave: "madhya", duration: 1 },
  { svara: "R1", octave: "madhya", duration: 1 },
  { svara: "G1", octave: "madhya", duration: 1 },
  { svara: "M1", octave: "madhya", duration: 1 },
  { svara: "P", octave: "madhya", duration: 1 },
  { svara: "D1", octave: "madhya", duration: 1 },
  { svara: "N1", octave: "madhya", duration: 1 },
  { svara: "S", octave: "taara", duration: 2 }
], 100);
```

#### `stopSequence()`

Stop the current sequence.

### Frequency Lookup

#### `getFrequency(notation, octave)`

Get frequency for a svara.

**Parameters**:
- `notation` (string): English notation
- `octave` (string): 'mandra', 'madhya', 'taara'

**Returns**: Frequency in Hz

**Example**:
```javascript
engine.getFrequency("S", "madhya");   // 261.63
engine.getFrequency("R1", "madhya");  // 277.18
engine.getFrequency("S", "taara");    // 523.25
```

### Events

Subscribe to events using `on(event, callback)`.

**Events**:
- `noteOn`: { svara, octave, frequency, voiceId, startTime, duration }
- `noteOff`: { svara, octave, voiceId }
- `sequenceStart`: { notes, tempo }
- `sequenceEnd`: { notes, tempo, cancelled }
- `ready`: { audioContext }

**Example**:
```javascript
engine.on('noteOn', (data) => {
  console.log(`Playing ${data.svara} at ${data.frequency} Hz`);
  highlightKey(data.svara, data.octave);
});

engine.on('noteOff', (data) => {
  unhighlightKey(data.svara, data.octave);
});
```

## Presets

### AudioEnginePresets

Pre-configured settings for different instruments:

```javascript
// Flute-like
AudioEnginePresets.flute = {
  waveform: 'sine',
  envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
  masterVolume: 0.8
};

// Veena-like
AudioEnginePresets.veena = {
  waveform: 'triangle',
  envelope: { attack: 0.02, decay: 0.05, sustain: 0.75, release: 0.15 },
  masterVolume: 0.75
};

// Violin-like
AudioEnginePresets.violin = {
  waveform: 'sawtooth',
  envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 },
  masterVolume: 0.6
};

// Harmonium-like
AudioEnginePresets.harmonium = {
  waveform: 'square',
  envelope: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.2 },
  masterVolume: 0.5
};
```

**Usage**:
```javascript
const flute = new AudioEngine(AudioEnginePresets.flute);
await flute.init();
flute.playSvara("S", "madhya", 1.0);
```

## Frequency Mappings

The engine uses English notation keys for frequency lookup:

```javascript
S:   261.63 Hz (C4)  - Shadjam
R1:  277.18 Hz (C#4) - Shuddha Rishabham
R2:  293.66 Hz (D4)  - Chatusruti Rishabham
G1:  293.66 Hz (D4)  - Shuddha Gandharam (same as R2)
R3:  311.13 Hz (D#4) - Shatshruti Rishabham
G2:  311.13 Hz (D#4) - Sadharana Gandharam (same as R3)
G3:  329.63 Hz (E4)  - Antara Gandharam
M1:  349.23 Hz (F4)  - Shuddha Madhyamam
M2:  369.99 Hz (F#4) - Prati Madhyamam
P:   392.00 Hz (G4)  - Panchamam
D1:  415.30 Hz (G#4) - Shuddha Dhaivatam
D2:  440.00 Hz (A4)  - Chatusruti Dhaivatam
N1:  440.00 Hz (A4)  - Shuddha Nishadham (same as D2)
D3:  466.16 Hz (A#4) - Shatshruti Dhaivatam
N2:  466.16 Hz (A#4) - Kaisiki Nishadham (same as D3)
N3:  493.88 Hz (B4)  - Kakali Nishadham
```

Octave multipliers:
- Mandra (lower): × 0.5
- Madhya (middle): × 1.0
- Taara (higher): × 2.0
