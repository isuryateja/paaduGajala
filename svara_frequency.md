# Svara → Frequency (and How Sound Is Produced Today)

This document describes **the current, in-repo implementation** of:

- How svara text is parsed into notes
- How each note is mapped to a frequency (Hz)
- How the actual sound is synthesized in the browser

The **deployed/main app** is a single-file web app: `paadugajaala/index.html`. It contains inlined copies of the parsing, frequency, and audio-engine logic (even though similar standalone modules also exist in `notation_parser.js`, `svara_frequencies.js`, and `audio_engine.js`).

## Where The Logic Lives (Source of Truth)

- Main app (inlined logic): `paadugajaala/index.html`
- Standalone modules (similar / reusable, not wired into the main app HTML):
  - Parser: `notation_parser.js`
  - Audio engine: `audio_engine.js`
  - Frequency tables/helpers (English notation variant): `svara_frequencies.js`

When you want to change “what happens in the app right now”, update `paadugajaala/index.html`.

## 1) From Text Input → Parsed Notes

### User input format

The main app (`paadugajaala/index.html`) takes **English Carnatic notation** tokens such as:

- `S`, `R1`, `R2`, `R3`, `G1`, `G2`, `G3`, `M1`, `M2`, `P`, `D1`, `D2`, `D3`, `N1`, `N2`, `N3`

Octaves are written using simple ASCII markers:

- **Dot suffix** for *mandra* (lower): `S.`
- **No suffix** for *madhya* (middle): `S`
- **Apostrophe suffix** for *taara* (higher): `S'`

Examples:

- `S.` → mandra
- `S` → madhya
- `S'` → taara

### Parsing step (tokenize + extract svaras)

The parser walks the input string and emits tokens. For svaras it:

1. Extracts an English svara token (like `R1`, `M2`, `S'`)
2. Splits out the octave marker (`.` or `'`) into an `octave` field
3. Produces a note object:

```js
{ type: 'svara', svara: 'R1', octave: 'mandra' | 'madhya' | 'taara', ... }
```

In `paadugajaala/index.html`, this logic is implemented by `extractSvara(...)`, `tokenize(...)`, and `parseNotation(...)`.

## 2) Normalization (Important!)

Before mapping a note to a frequency, the app normalizes:

### Octave name normalization

The parser emits `mandra`, but the frequency lookup table uses `mandara`.

So the app runs:

- `normalizeOctaveName('mandra')` → `'mandara'`

### Svara name normalization (defaults for un-numbered svaras)

If the parsed svara is a **bare** English svara (like `R` with no `1/2/3` suffix), the app chooses a default variant:

```js
{
  'S': 'S',
  'R': 'R2',
  'G': 'G3',
  'M': 'M1',
  'P': 'P',
  'D': 'D2',
  'N': 'N3'
}
```

This happens in `normalizeSvaraName(...)` in `paadugajaala/index.html`.

Practical effect:

- Input `R` is treated as `R2`
- Input `G` is treated as `G3`
- Input `N` is treated as `N3`

If the input already includes a variant (like `R1`, `R2`, `R3`), it is used as-is.

## 3) Frequency Mapping (Hz)

The main app supports two tuning modes in the audio engine:

- `equal` (default): **equal temperament** (12-TET)
- `just`: **just intonation ratios** (relative to Sa)

The entry point is `AudioEngine.getFrequency(svara, octave)`.

### Shared constants

In `paadugajaala/index.html`:

- `BASE_SA_FREQUENCY = 261.6255653005986` (Sa in madhya sthaayi, ≈ C4)
- `SEMITONE_RATIO = 2^(1/12) = 1.0594630943592953`

The engine also has a configurable `config.baseFrequency` (defaults to `BASE_SA_FREQUENCY`) that acts as “Sa”.

### 3.1 Equal temperament path (table lookup first)

1. Build a lookup key using:

```js
octaveSuffix = { mandara: '.', madhya: '', taara: "'" }
key = normalizedSvara + octaveSuffix[normalizedOctave]
```

2. Look up `SVARA_FREQUENCIES[key].frequency`.

Notes about the suffixes:

- `mandara` uses a literal `.` in the lookup key (example: `S.`)
- `taara` uses a literal apostrophe in the lookup key (example: `S'`)
- When editing `SVARA_FREQUENCIES` inside `paadugajaala/index.html`, make sure taara keys are quoted correctly in JavaScript (e.g. `"S'"`, not `"S':`), otherwise the entire app script will fail to load.

The table `SVARA_FREQUENCIES` in `paadugajaala/index.html` contains entries like:

- `S`, `S.`, `S'`
- `R1`, `R2`, `R3` (and their octaves)
- ...

### 3.2 Equal temperament fallback path (computed)

If the table key is missing, the engine computes:

```txt
frequency = baseFrequency * (SEMITONE_RATIO ^ semitonesFromSa) * octaveMultiplier
```

Where:

- `semitonesFromSa` comes from a hardcoded `semitoneMap` in the audio engine
- `octaveMultiplier` is `{ mandara: 0.5, madhya: 1.0, taara: 2.0 }`

### 3.3 Just intonation path (ratios)

In `just` mode, the engine:

1. Maps svara strings to ratio keys:

```js
{
  'S': 'sa',
  'R1': 'ri1', 'G1': 'ri2',
  'R2': 'ri2', 'G2': 'ri3',
  'R3': 'ri3', 'G3': 'ga3',
  'M1': 'ma1', 'M2': 'ma2',
  'P': 'pa',
  'D1': 'da1', 'N1': 'da2',
  'D2': 'da2', 'N2': 'da3',
  'D3': 'da3', 'N3': 'ni3'
}
```

2. Looks up a ratio in `JUST_INTONATION_RATIOS[ratioKey].ratio`
3. Computes:

```txt
frequency = baseFrequency * ratio * octaveMultiplier
```

If the ratio key is missing (or the ratios table is missing), it falls back to the equal-temperament path.

## 4) How The Sound Is Actually Produced

Sound is synthesized in the browser using the **Web Audio API**.

### Audio graph (signal chain)

In `AudioEngine.init()`:

- Creates an `AudioContext` (or `webkitAudioContext`)
  - Uses `latencyHint: 'interactive'`
  - Uses `sampleRate: 44100`
- Creates a `DynamicsCompressorNode` (to reduce clipping and smooth dynamics)
- Creates a master `GainNode` (master volume)
- Connects:

```txt
(voices) → compressor → masterGain → audioContext.destination
```

### Voice synthesis (one note)

For each note, `_createVoice(...)` builds:

- `OscillatorNode` (tone source)
  - `oscillator.type` is configurable (defaults to `'triangle'` in the app preset)
  - `oscillator.frequency.value = <computed frequency>`
- `GainNode` for ADSR envelope (starts at gain 0)
- `GainNode` for velocity (note volume scaling)

And connects:

```txt
oscillator → envelopeGain → voiceGain → compressor
```

### Envelope scheduling (ADSR)

The envelope is scheduled with `AudioParam` time automation calls:

- `setValueAtTime(...)`
- `linearRampToValueAtTime(...)`
- `exponentialRampToValueAtTime(...)`

The default envelope in the app is approximately:

- Attack: `0.02s`
- Decay: `0.05s`
- Sustain: `0.7` (level)
- Release: `0.15s`

The oscillator is started/stopped using:

- `oscillator.start(startTime)`
- `oscillator.stop(releaseEnd + smallPadding)`

## 5) End-to-End Summary (Data Flow)

1. User enters English notation in the UI (e.g. `S R1 G1 ...`)
2. Parser (`parseNotation`) emits notes like `{svara: 'R1', octave: 'mandra'}` based on `.` / `'` markers
3. Audio engine normalizes:
   - `normalizeSvaraName('R') → 'R2'`
   - `normalizeOctaveName('mandra') → 'mandara'`
4. Audio engine maps note → `frequency` (equal temperament table → fallback computation, or just-intonation ratios)
5. Web Audio creates an oscillator + envelope, schedules ADSR, and outputs to speakers via `audioContext.destination`

## Appendix: Why `svara_frequencies.js` Looks Different

`svara_frequencies.js` defines frequency tables using **English notation keys** (`S`, `R1`, …) and uses `'` for taara.

That module is useful for reuse, but the current main app (`paadugajaala/index.html`) does not import it; instead it inlines its own `SVARA_FREQUENCIES` and `JUST_INTONATION_RATIOS`.
