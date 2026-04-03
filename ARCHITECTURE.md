# paaduGajala — Architecture

A complete technical map of paaduGajala — how notation becomes sound.

---

## Overview

paaduGajala is a browser-only Carnatic music notation player. There is no backend, no server, no database. Everything lives in the browser. The user types (or loads) notation in English svara shorthand, the app parses it into a structured AST, resolves each svara to a frequency, and drives the Web Audio API to produce sound.

The stack: **SvelteKit + Vite** for the app shell, **Svelte 5** (runes mode) for the UI, **TypeScript 5** everywhere, and the **Web Audio API** for sound synthesis. There are no external audio libraries.

```
notation text → tokenizer → parser → ParsedNotationNode[]
ParsedNotationNode[] → frequency resolver → AudioEngine → 🔊 sound
```

---

## Directory Layout

The source is split into four clean layers inside `src/`:

```
src/
├── domain/           ← pure domain logic (no Svelte, no DOM)
│   ├── notation/     ← parser types, validation, stats
│   ├── pitch/        ← svara → frequency resolution
│   ├── audio/        ← AudioEngine class, voice types, presets
│   ├── piano/        ← keyboard layout and key-id mapping
│   └── shared/       ← shared types (OctaveName, WaveformType, …)
│
├── app/              ← application layer (orchestrates domain + stores)
│   ├── stores/       ← Svelte writable stores (notation, playback, settings, ui)
│   ├── actions/      ← stateful handlers that mutate stores
│   └── services/     ← view-model builders, complex page logic
│
├── components/       ← Svelte UI components
│   ├── notation/     ← editor, preview, token rendering
│   ├── piano/        ← piano keyboard visualizer
│   ├── playback/     ← controls, tempo, waveform pickers
│   ├── layout/       ← chrome, header, overlay
│   └── common/       ← toasts, loading, utility components
│
├── infra/            ← browser-specific wrappers (file reader, storage)
├── routes/           ← SvelteKit file-based routing
├── styles/           ← global CSS
└── lib/              ← tiny pure utilities (clamp, createId, formatDuration…)
```

The key architectural boundary: **domain knows nothing about Svelte**. The domain layer is pure TypeScript — classes, functions, interfaces. The app layer bridges domain → stores → UI.

The legacy JS files (`notation_parser.js`, `svara_frequencies.js`) live at the root. They are the original pre-migration parser and frequency table. The TypeScript domain layer wraps them with typed facades — it doesn't duplicate logic, it re-exports with types. This is intentional: the JS files are the ground truth for parsing and pitch maths; the TS wrappers add type safety on top.

---

## Notation Syntax

paaduGajala uses **English svara shorthand**, not Devanagari or solfège. Each svara is one or two characters:

| token | svara | full name | semitones from Sa |
|-------|-------|-----------|-------------------|
| `S` | Shadjam | Sa | 0 |
| `R1` | Shuddha Rishabham | Ri₁ | 1 |
| `R2` | Chatusruti Rishabham | Ri₂ | 2 |
| `R3` | Shatshruti Rishabham | Ri₃ | 3 |
| `G1` | Shuddha Gandharam | Ga₁ | 2 ≡ R2 |
| `G2` | Sadharana Gandharam | Ga₂ | 3 ≡ R3 |
| `G3` | Antara Gandharam | Ga₃ | 4 |
| `M1` | Shuddha Madhyamam | Ma₁ | 5 |
| `M2` | Prati Madhyamam | Ma₂ | 6 |
| `P` | Panchamam | Pa | 7 |
| `D1` | Shuddha Dhaivatam | Da₁ | 8 |
| `D2` | Chatusruti Dhaivatam | Da₂ | 9 ≡ N1 |
| `D3` | Shatshruti Dhaivatam | Da₃ | 10 ≡ N2 |
| `N1` | Shuddha Nishadham | Ni₁ | 9 ≡ D2 |
| `N2` | Kaisiki Nishadham | Ni₂ | 10 ≡ D3 |
| `N3` | Kakali Nishadham | Ni₃ | 11 |

Octave is indicated by a suffix on the svara token:

| suffix | octave (sthaayi) | example |
|--------|------------------|---------|
| `.` (period / combining dot-below U+0323) | Mandra (lower) | `S.` `R1.` |
| (none) | Madhya (middle) | `S` `G3` |
| `'` (apostrophe / combining dot-above U+0307) | Taara (higher) | `S'` `N3'` |

Rhythm is marked with `|` (single danda — beat separator) and `||` (double danda — end of phrase/line). Unicode dandas (`।` `॥`) are also accepted. Whitespace and tabs between svaras is ignored. Each newline starts a new line-group.

Example notation:

```
S     S     R1    R1    |     G3    G3    |     M1    M1    ||
R1    R1    G3    G3    |     M1    M1    |     P     P     ||
G3    G3    M1    M1 |   P     P    |    D1    D1    ||
```

---

## Svara Sthanas (Note Positions)

Carnatic music divides an octave into **16 svara positions** (sthanas), mapped onto 12 semitones. Some positions share the same semitone — this is the core of the *suddha / vikrita* system and why Carnatic notation has more symbol-names than Western pitch-classes:

| semitone | western (C-based) | svara names | note |
|----------|-------------------|-------------|------|
| 0 | C | S | Shadjam — fixed (prakruti svara) |
| 1 | C♯ / D♭ | R1 | Shuddha Rishabham |
| 2 | D | R2, G1 | Chatusruti Ri = Shuddha Ga — same pitch |
| 3 | D♯ / E♭ | R3, G2 | Shatshruti Ri = Sadharana Ga — same pitch |
| 4 | E | G3 | Antara Gandharam |
| 5 | F | M1 | Shuddha Madhyamam |
| 6 | F♯ / G♭ | M2 | Prati Madhyamam |
| 7 | G | P | Panchamam — fixed (prakruti svara) |
| 8 | G♯ / A♭ | D1 | Shuddha Dhaivatam |
| 9 | A | D2, N1 | Chatusruti Da = Shuddha Ni — same pitch (A4 = 440 Hz) |
| 10 | A♯ / B♭ | D3, N2 | Shatshruti Da = Kaisiki Ni — same pitch |
| 11 | B | N3 | Kakali Nishadham |

Important implications: **S and P never change** in any raga (they are *prakruti svaras* — nature-fixed). The other five (R, G, M, D, N) each have multiple varieties (*vikrita svaras*). A raga picks exactly one variety of each svara, giving it a characteristic scale.

The shared-pitch pairs (R2↔G1, R3↔G2, D2↔N1, D3↔N2) mean the app resolves them to the same frequency; the distinction is semantic/grammatical (which raga they belong to), not acoustic.

---

## Parsing Pipeline

Parsing is a two-phase **tokenize → parse** pipeline implemented in `notation_parser.js` and imported via typed facades in `src/domain/notation/notation.parser.ts`.

### Phase 1 — Tokenizer

The tokenizer walks the input character-by-character and emits a flat token stream. Order of precedence at each position:

1. Double rhythm marker (`||` or `॥`) — consumes 2 chars
2. Single rhythm marker (`|` or `।`)
3. Newline `\n`
4. Whitespace
5. `extractSvara()` — tries to build a svara token:
   - First char must be a svara base (`S R G M P D N`)
   - Optionally followed by `1`, `2`, or `3` for the variety
   - Then zero or more octave modifiers (`.` / U+0323 for mandra, `'` / U+0307 for taara)
   - Result validated against the known svara table
6. Unknown char — emitted as-is for validation warnings

Token types emitted: `svara | rhythm_marker | newline | whitespace | unknown`

### Phase 2 — Parser

The parser walks the token stream and produces `ParsedNotationNode[]`. Each svara token becomes a `ParsedSvara` node. Rhythm markers are attached to the *preceding svara* as `beatMarker` and also emitted as standalone `RhythmMarkerNode` entries (for visualisation). Newlines emit a `NewlineNode` and reset the line counter.

```ts
// ParsedSvara shape
{
  type: 'svara',
  svara: 'G3',             // canonical token (e.g. G3)
  svaraName: 'ga3',        // full name key
  octave: 'madhya',        // 'mandra' | 'madhya' | 'taara'
  duration: 1,             // default; 1 = one akshara (beat)
  beatMarker: '|' | null,  // rhythm marker attached to this note
  line: 1,
  position: 42
}
```

### Additional Parser Entry Points

| function | returns | used for |
|----------|---------|----------|
| `parseNotation(text)` | `ParsedNotationNode[]` | full AST — playback + visualisation |
| `parseSvarasOnly(text)` | `ParsedSvara[]` | quick svara count, validation check |
| `parseNotationByLines(text)` | `ParsedSvara[][]` | line-by-line stats |
| `tokenize(text)` | `NotationToken[]` | raw token stream for debugging |
| `buildPreviewNotationTokens(nodes)` | `PreviewNotationToken[]` | renders the styled notation preview in the UI |

### Validation

`validateNotation(text)` runs the tokenizer and checks: (a) at least one valid svara exists, (b) any unknown tokens get surfaced as warnings. It returns a `NotationValidationResult` with a `valid` boolean and an `issues[]` array. Validation runs before any parse in `parseCurrentNotation()`.

---

## Svara → Frequency Resolution

Once parsed, each `ParsedSvara` needs a frequency in Hz. This is handled by `src/domain/pitch/svara-frequencies.ts` which wraps `svara_frequencies.js`.

### Tuning Modes

The engine supports two tuning models, switchable at runtime:

| mode | how it works | sounds like |
|------|--------------|-------------|
| **Equal temperament** (default) | Lookup from the pre-computed `SVARA_FREQUENCIES` table. Tonic Sa = C4 = 261.63 Hz (derived from A4 = 440 Hz). Each semitone = previous × 2¹/¹² ≈ 1.05946. | Familiar / Western compatible |
| **Just intonation** | Frequency = baseFrequency × `JUST_INTONATION_RATIOS[svara].ratio`. Ratios are pure harmonic fractions (S=1/1, M1=4/3, P=3/2, …). Octave shift: mandra×0.5, madhya×1, taara×2. | Richer consonance, slight "shimmer" on sustained notes |

### Reference Pitches

```
REFERENCE_A4      = 440.0 Hz   (international concert pitch)
BASE_SA_FREQUENCY = 261.63 Hz  (C4 — tonic Sa in madhya sthaayi)

// Equal temperament table samples:
S   (madhya) = 261.63 Hz  ← C4
R1  (madhya) = 277.18 Hz  ← C#4
G3  (madhya) = 329.63 Hz  ← E4
M1  (madhya) = 349.23 Hz  ← F4
P   (madhya) = 392.00 Hz  ← G4
D2  (madhya) = 440.00 Hz  ← A4  (= N1, the reference A)
N3  (madhya) = 493.88 Hz  ← B4
S'  (taara)  = 523.25 Hz  ← C5
```

### Key Lookup Flow

`getSvaraFrequency(svara, octave)` normalises the svara name (via `normalizeSvaraName`) and octave alias (via `normalizeOctaveName`), then builds a key like `"G3"`, `"G3."`, or `"G3'"` and looks it up in `SVARA_FREQUENCIES`.

`normalizeOctaveName` accepts strings like `'low'`, `'1'`, `'mandra'`, `'mandara'` — all resolve to `'mandra'`. `normalizeSvaraName` lower-cases and strips whitespace, then maps aliases (e.g. bare `'r'` → `'R2'`, `'g'` → `'G3'`).

---

## Audio Engine

`AudioEngine` in `src/domain/audio/audio-engine.ts` is a class that owns the Web Audio API graph. One singleton instance is created in `src/app/actions/playback.actions.ts` and shared across the entire app.

### Audio Graph

```
OscillatorNode → envelopeGain (ADSR) → voiceGain (velocity) → DynamicsCompressor → masterGain → AudioDestination
```

Each played note spawns an independent **voice** (oscillator + gain chain). Voices are tracked in `activeVoices: Map<string, AudioVoice>`. They clean themselves up via `oscillator.onended`.

### ADSR Envelope

Every voice has an ADSR envelope applied to `envelopeGain` using the Web Audio scheduled parameter API (`setValueAtTime` / `linearRampToValueAtTime`):

```
defaults:
  attack  = 0.02s   // ramp from 0 → 1
  decay   = 0.05s   // ramp from 1 → sustain
  sustain = 0.70    // hold level (0–1)
  release = 0.15s   // ramp from sustain → 0 on noteOff
```

### Waveform Presets

The oscillator type maps to an instrument preset. Defaults apply to the envelope too:

| preset | waveform | attack | decay | sustain | release |
|--------|----------|--------|-------|---------|---------|
| flute (default-ish) | sine | 0.05 | 0.10 | 0.80 | 0.20 |
| veena (app default) | triangle | 0.02 | 0.05 | 0.75 | 0.15 |
| violin | sawtooth | 0.10 | 0.20 | 0.70 | 0.30 |
| harmonium | square | 0.03 | 0.10 | 0.80 | 0.20 |

### Sequence Playback

`playSequence(notes, tempo)` schedules all notes ahead-of-time using `audioContext.currentTime` as a cursor. This avoids setInterval jitter — audio scheduling is sample-accurate. For each note:

1. A `scheduleSequenceNoteIndex` call plants a `setTimeout` timed to emit a `noteIndex` event when the note starts playing (used to light up the correct svara in the notation preview)
2. `playSvara(…, when: cursor)` creates the voice at the scheduled audio time
3. The cursor advances by `duration × beatDuration`

`beatDuration = 60 / tempo` (seconds per beat). Default tempo is 120 BPM. Tempo is clamped to 30–300 BPM.

### Pause / Resume

Pause is implemented by capturing remaining notes from the current position into `pausedPlayback`, calling `stopAll()`, and snapshotting state. Resume re-schedules from that snapshot. Stop clears everything.

### Engine Events

| event | when | payload |
|-------|------|---------|
| `ready` | AudioContext initialized | audioContext ref |
| `noteOn` | voice starts | svara, octave, frequency, voiceId |
| `noteOff` | voice ends | svara, octave, voiceId |
| `noteIndex` | UI beat sync | index (into parsed svaras array) |
| `sequenceStart` | playback begins | notes, tempo |
| `sequenceEnd` | playback finishes or stops | cancelled bool |

---

## State Management

State is held in four Svelte `writable` stores. They are plain JS objects — there is no Zustand, Redux, or custom atom system.

| store | owns |
|-------|------|
| `notationStore` | raw input text, parsed AST, validation result, note statistics, input source (manual \| example \| file) |
| `playbackStore` | status (ready / playing / paused), currentIndex (which note is highlighted), sequenceLength |
| `settingsStore` | tempo (BPM), volume (0–1), waveform, tuning mode, active preset name |
| `uiStore` | loading flag, toast queue, status bar (tone + text) |

Stores are mutated exclusively through **action functions** in `src/app/actions/`. Components never call `store.set()` directly. This keeps mutation logic testable and co-located with domain calls.

---

## Piano Keyboard Visualizer

The keyboard visualizer maps each playing svara to a physical key on a rendered piano. The mapping is defined in `PLAYBACK_KEY_MAP_BY_OCTAVE`:

```
madhya octave:
  S  → key 's:2'   (C4)
  R1 → key 'r1:2'
  G3 → key 'g:2'   (E4)
  M1 → key 'm:2'
  P  → key 'p:2'
  D2 / N1 → key 'd2:2'   (A4)
  N3 → key 'n:2'

key-id format:  "{shortName}:{octaveIndex}"
                octaveIndex = 1 (mandra), 2 (madhya), 3 (taara)
```

`createPlaybackPianoVisualizer()` subscribes to `noteOn` / `noteOff` engine events, resolves the svara to a key ID, and calls `onChange(activeKeys)` with an updated `Record<string, boolean>`. The piano component renders this as visual key-press state.

Per the Svelte 5 guidelines for this project: key-press *visual feedback* uses direct DOM manipulation via `element.style` writes rather than reactive store updates — this avoids the Svelte re-render cycle for sub-200ms animations.

---

## Routing

SvelteKit file-based routing. Current routes:

| path | what |
|------|------|
| `/` | main player (notation editor + piano + playback controls) |
| `/piano` | standalone interactive piano keyboard |
| `/sruti-to-swara` | frequency → svara lookup tool |
| `/theory` | placeholder (theory content pending) |
| `/dodo/*` | secret section (arch, theory, plans) |

The root layout (`+layout.svelte`) mounts the loading overlay and toast container globally. The `/dodo` section has its own nested layout with its own dark shell — it does not inherit any navigation from the main app.

---

## End-to-End Data Flow

Tracing what happens from "user types `S G3 M1 P` and clicks play":

1. Keystrokes → `notationStore.rawText` updated via `setNotationText()`
2. "Parse" button → `parseCurrentNotation()`:
   - runs `validateNotation(rawText)`
   - calls `parseSvarasOnly()` to confirm svaras exist
   - calls `parseNotation()` → full AST stored in `notationStore.parsed`
   - calls `getNotationStats()` → stats stored in `notationStore.stats`
   - `uiStore` gets "Parsed" status + success toast
3. "Play" button → `startPlayback()`:
   - `createSequenceNotes()` — filters `parsed` for type=svara → `SequenceNote[]`
   - `audioEngine.init()` — creates AudioContext on first play (browser policy)
   - `audioEngine.playSequence(notes, tempo)` — schedules all notes
   - `playbackStore` set to status=playing
4. AudioEngine fires `noteIndex` events → `playbackStore.currentIndex` updated → notation preview highlights the current svara
5. AudioEngine fires `noteOn` / `noteOff` → piano visualizer lights keys
6. Sequence ends → `sequenceEnd` event → stores reset to ready state

---

## Known Constraints & Design Decisions

- **AudioContext user-gesture requirement** — browsers require a user action before creating an AudioContext. `audioEngine.init()` is called inside the Play handler, never at module load time.

- **One oscillator per note** — polyphony is unlimited; every `playSvara` call spawns a new oscillator. Oscillators are cheap in the Web Audio API and clean themselves up via `onended`. There is no voice-stealing system.

- **Duration is always 1 akshara** — the parser sets `duration: 1` for every svara. The notation syntax does not yet express held notes (e.g. a svara worth 2 beats). This is a planned extension.

- **No gamakam** — ornaments (gamakam, meend, kan svaras) are not modelled. Every note is a plain sustained tone at its fundamental frequency.

- **Svelte 5 reactivity rules** — reactive state for template rendering uses `$state()` runes and `Record<string, T>` for key-maps (not `Set`/`Map` which are untracked). Transient visual states (key press animations) use direct DOM `element.style` writes.

- **Legacy JS files** — `notation_parser.js` and `svara_frequencies.js` predate the TypeScript migration. They are intentionally kept as-is and imported via typed ESM facades. Rewriting them in TS is a future task.

- **No persistence** — notation text is not saved across sessions. The only persistence is `sessionStorage` for settings (key: `paadugajala-settings`).
