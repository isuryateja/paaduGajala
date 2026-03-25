# Paadu Gajaala — Lift-and-Shift Refactor Specification (No New Functionality)

## 1. Objective

This phase is **not** the tala phase.

The goal is to **move the current app into the new production-ready architecture without changing behavior**.

That means:

- no new features
- no removed features
- no tala engine yet
- no new notation semantics
- no backend
- no UX redesign beyond what is required to preserve the current UI in the new stack

This is a **lift-and-shift refactor**:
same app, same user-visible behavior, better internal structure.

---

## 2. What Exists Today

The current repository contains:

- a README describing the app as a browser-based Carnatic notation player and visualizer
- a main app at `paadugajaala/index.html`
- standalone reusable modules such as `audio_engine.js`, `notation_parser.js`, and `svara_frequencies.js`
- a separate `virtual_piano.html` demo

The README also states that the current main app supports:

- notation input
- parse and validate
- browser playback
- visual note following
- tempo and volume adjustment
- load example
- txt import
- virtual piano support

However, the current `paadugajaala/index.html` is still a **single large page** with:

- HTML
- CSS
- svara frequency logic
- notation parsing logic
- audio engine logic
- piano controller logic
- application controller logic

all embedded inline in the same file.

So the immediate problem is not missing features.
The problem is **structural coupling**.

---

## 3. Refactor Goal

After this phase, the app should:

- run in **SvelteKit + TypeScript**
- preserve the current UI and behavior
- preserve the current routes/pages conceptually:
  - main notation player
  - standalone virtual piano page
- move inline logic into typed modules
- separate UI from logic
- make later tala work possible without another architectural rewrite

This phase should produce a stable base on which tala can be added later.

---

## 4. Strict Scope Boundary

## Included in this phase

- move current UI into Svelte components
- move current JS logic into TypeScript modules
- keep current parsing behavior
- keep current audio behavior
- keep current piano behavior
- keep current controls and settings behavior
- keep current example-loading behavior
- keep current file upload behavior
- keep current visual highlighting behavior
- keep current preset behavior
- keep current tuning selector behavior
- preserve existing default values and interactions

## Explicitly excluded from this phase

- tala engine
- akshara/matra timeline
- notation-duration redesign
- scheduler redesign for tala
- gamaka support
- backend
- user accounts
- cloud persistence
- MIDI
- new import formats
- deep parser redesign
- UI redesign for aesthetics alone

---

## 5. Refactor Principles

### 5.1 Behavior preservation first
Do not “improve” behavior during migration unless required to preserve correctness.

### 5.2 Structure before enhancement
This phase is about module boundaries, not new musical intelligence.

### 5.3 Type safety without logic drift
Port logic to TypeScript carefully. Do not reinterpret old behavior unless a bug prevents parity.

### 5.4 Incremental parity
At every milestone, the new app should stay runnable and comparable to the old app.

### 5.5 One source of truth per concern
- parsing logic lives in notation modules
- frequency logic lives in pitch/frequency modules
- audio logic lives in audio modules
- UI components do not contain music rules

---

## 6. Target Stack

- **SvelteKit**
- **TypeScript**
- **Vite**
- **Vitest**
- **ESLint**
- **Prettier**

No backend for this phase.

---

## 7. Target Folder Structure

```text
paadugajala/
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ svelte.config.js
├─ eslint.config.js
├─ .prettierrc
├─ static/
│  ├─ example.txt
│  └─ favicon.png
│
├─ src/
│  ├─ app.html
│  ├─ app.d.ts
│  │
│  ├─ routes/
│  │  ├─ +layout.svelte
│  │  ├─ +page.svelte                 # main player route
│  │  └─ piano/
│  │     └─ +page.svelte             # standalone piano route
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppHeader.svelte
│  │  │  ├─ AppFooter.svelte
│  │  │  └─ LoadingOverlay.svelte
│  │  │
│  │  ├─ common/
│  │  │  ├─ ToastContainer.svelte
│  │  │  ├─ StatusBar.svelte
│  │  │  ├─ RangeControl.svelte
│  │  │  ├─ SelectControl.svelte
│  │  │  └─ StatCard.svelte
│  │  │
│  │  ├─ notation/
│  │  │  ├─ NotationInputCard.svelte
│  │  │  ├─ ParsedNotationCard.svelte
│  │  │  └─ StatisticsCard.svelte
│  │  │
│  │  ├─ playback/
│  │  │  ├─ PlaybackControlsCard.svelte
│  │  │  └─ SettingsCard.svelte
│  │  │
│  │  └─ piano/
│  │     ├─ PianoCard.svelte
│  │     ├─ PianoKeyboard.svelte
│  │     ├─ PianoOctave.svelte
│  │     └─ PianoKey.svelte
│  │
│  ├─ app/
│  │  ├─ stores/
│  │  │  ├─ ui.store.ts
│  │  │  ├─ playback.store.ts
│  │  │  ├─ notation.store.ts
│  │  │  └─ settings.store.ts
│  │  │
│  │  ├─ actions/
│  │  │  ├─ notation.actions.ts
│  │  │  ├─ playback.actions.ts
│  │  │  ├─ piano.actions.ts
│  │  │  └─ settings.actions.ts
│  │  │
│  │  └─ services/
│  │     └─ app-bootstrap.ts
│  │
│  ├─ domain/
│  │  ├─ shared/
│  │  │  ├─ types.ts
│  │  │  └─ constants.ts
│  │  │
│  │  ├─ notation/
│  │  │  ├─ notation.types.ts
│  │  │  ├─ notation.constants.ts
│  │  │  ├─ notation.parser.ts
│  │  │  ├─ notation.validation.ts
│  │  │  └─ notation.stats.ts
│  │  │
│  │  ├─ pitch/
│  │  │  ├─ svara.types.ts
│  │  │  ├─ svara.constants.ts
│  │  │  ├─ svara-frequencies.ts
│  │  │  └─ svara-normalization.ts
│  │  │
│  │  ├─ audio/
│  │  │  ├─ audio.types.ts
│  │  │  ├─ audio.presets.ts
│  │  │  └─ audio-engine.ts
│  │  │
│  │  └─ piano/
│  │     ├─ piano.types.ts
│  │     ├─ piano.constants.ts
│  │     └─ piano-keyboard-map.ts
│  │
│  ├─ infra/
│  │  ├─ browser/
│  │  │  ├─ file-reader.ts
│  │  │  ├─ visibility-events.ts
│  │  │  └─ dom-helpers.ts
│  │  │
│  │  └─ storage/
│  │     └─ session-state.ts
│  │
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ global.css
│  │  └─ app-theme.css
│  │
│  ├─ lib/
│  │  ├─ utils/
│  │  │  ├─ assert.ts
│  │  │  ├─ clamp.ts
│  │  │  ├─ noop.ts
│  │  │  └─ format-duration.ts
│  │  └─ ids/
│  │     └─ create-id.ts
│  │
│  └─ tests/
│     ├─ notation/
│     │  ├─ notation.parser.test.ts
│     │  ├─ notation.validation.test.ts
│     │  └─ notation.stats.test.ts
│     ├─ pitch/
│     │  └─ svara-frequencies.test.ts
│     └─ audio/
│        └─ audio-config.test.ts
│
└─ README.md
```

---

## 8. Architecture Shape For This Phase

This is the intended dependency direction:

```text
Svelte Routes / Components
          ↓
App Stores + Actions
          ↓
Domain Modules
          ↓
Browser / Infra Adapters
```

For this phase:

- **components** render UI
- **stores** hold reactive page state
- **actions** orchestrate user intent
- **domain modules** contain current logic ported from old JS
- **infra modules** wrap browser APIs like file loading and visibility handling

No tala engine yet.
No composition engine yet.
No future abstractions unless they directly help this migration.

---

## 9. Functional Parity Requirements

The migrated app must preserve all current user-visible capabilities.

## 9.1 Main player page
Must preserve:

- header and footer presence
- notation textarea
- Parse button
- Load Example button
- Upload File button
- Clear button
- status text and status dot
- parsed note count info
- play / pause / stop controls
- tempo slider
- volume slider
- waveform selector
- tuning selector
- instrument preset buttons
- virtual piano section on main page
- parsed notation preview
- statistics panel
- toast notifications
- loading overlay

## 9.2 Standalone piano route
Must preserve the existence of a standalone piano page equivalent to current `virtual_piano.html`.

## 9.3 Parsing behavior
Must preserve current accepted notation behavior, including:

- English svara parsing
- octave markers
- rhythm markers
- line handling
- same validation style
- same parse result expectations for current examples

## 9.4 Playback behavior
Must preserve:

- current note-sequence playback model
- current pause/resume style
- current highlighting behavior
- current instrument presets
- current tuning modes
- current direct piano note press behavior

---

## 10. Non-Goals For This Phase

Do not do these yet:

- replace sequence playback with a new transport model
- redesign parser into a future tala-ready schema
- rewrite note durations semantically
- add more octaves
- add pitch bend
- add gamaka
- add advanced persistence
- optimize prematurely for future composition systems

That will come later.

---

## 11. Module Mapping From Old Code To New Structure

## 11.1 From current inline code to new modules

### Svara frequency logic
Current inline logic:
- `REFERENCE_A4`
- `BASE_SA_FREQUENCY`
- `SEMITONE_RATIO`
- `JUST_INTONATION_RATIOS`
- `SVARA_FREQUENCIES`
- `normalizeOctaveName`
- `normalizeSvaraName`
- `getSvaraFrequency`

Move to:
- `src/domain/pitch/svara.constants.ts`
- `src/domain/pitch/svara-frequencies.ts`
- `src/domain/pitch/svara-normalization.ts`

### Notation parser logic
Current inline logic:
- token constants
- `tokenize`
- `extractSvara`
- `parseNotation`
- `parseNotationByLines`
- `parseSvarasOnly`
- `getNotationStats`
- `validateNotation`

Move to:
- `src/domain/notation/notation.constants.ts`
- `src/domain/notation/notation.parser.ts`
- `src/domain/notation/notation.validation.ts`
- `src/domain/notation/notation.stats.ts`

### Audio engine logic
Current inline logic:
- `AudioEnginePresets`
- `AudioEngine`

Move to:
- `src/domain/audio/audio.presets.ts`
- `src/domain/audio/audio-engine.ts`

### Piano controller logic
The current `PianoController` is strongly DOM-coupled.
In the new app, do **not** carry over the controller class unchanged.

Split it into:
- pure keyboard/piano constants in `domain/piano`
- Svelte component interaction inside `components/piano`
- orchestration in `app/actions/piano.actions.ts`

### Main app controller logic
The current `PaaduGajaalaApp` becomes too large for the new architecture.
Split it into:
- stores
- actions
- route-level page components
- small browser helpers

This is the main architectural win of this phase.

---

## 12. Recommended TypeScript Interfaces

## 12.1 Shared

```ts
export type OctaveName = 'mandra' | 'mandara' | 'madhya' | 'taara';
export type TuningMode = 'equal' | 'just';
export type WaveformType = 'sine' | 'triangle' | 'sawtooth' | 'square';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type PlaybackStatus = 'ready' | 'parsed' | 'playing' | 'paused';
```

## 12.2 Notation

```ts
export interface NotationToken {
  type: 'svara' | 'rhythm_marker' | 'newline' | 'whitespace' | 'unknown';
  value?: string;
  svara?: string;
  octave?: OctaveName;
  raw?: string;
  subtype?: 'single' | 'double';
  position: number;
}

export interface ParsedSvara {
  type: 'svara';
  svara: string;
  svaraLatin: string;
  octave: OctaveName;
  duration: number;
  beatMarker: string | null;
  line: number;
  position: number;
}

export interface RhythmMarkerNode {
  type: 'rhythm_marker';
  marker: string;
  subtype: 'single' | 'double';
  line: number;
  position: number;
}

export interface NewlineNode {
  type: 'newline';
  line: number;
  position: number;
}

export interface WhitespaceNode {
  type: 'whitespace';
  line: number;
  position: number;
}

export interface UnknownNode {
  type: 'unknown';
  value: string;
  line: number;
  position: number;
}

export type ParsedNotationNode =
  | ParsedSvara
  | RhythmMarkerNode
  | NewlineNode
  | WhitespaceNode
  | UnknownNode;

export interface NotationValidationIssue {
  type: 'warning' | 'error';
  message: string;
  position?: number;
}

export interface NotationValidationResult {
  valid: boolean;
  issues: NotationValidationIssue[];
  hasSvara: boolean;
  hasRhythmMarker: boolean;
}

export interface NotationStats {
  totalNotes: number;
  totalRhythmMarkers: number;
  svaraCounts: Record<string, number>;
  octaveDistribution: {
    mandra: number;
    madhya: number;
    taara: number;
  };
  lines: number;
}
```

## 12.3 Audio

```ts
export interface AudioEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface AudioPreset {
  waveform: WaveformType;
  envelope: AudioEnvelope;
  masterVolume: number;
}

export interface AudioEngineConfig {
  waveform: WaveformType;
  envelope: AudioEnvelope;
  masterVolume: number;
  tuning: TuningMode;
  baseFrequency: number;
}

export interface SequenceNote {
  svara: string;
  octave: OctaveName;
  duration: number;
  velocity?: number;
  rest?: boolean;
  originalIndex?: number;
}

export interface AudioNoteEvent {
  svara: string;
  octave: OctaveName;
  frequency: number;
  voiceId: string;
  startTime: number;
  duration: number;
  sustained?: boolean;
}
```

## 12.4 Stores

```ts
export interface UiState {
  isLoading: boolean;
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
  }>;
}

export interface NotationState {
  inputText: string;
  parsedNotes: ParsedSvara[];
  parsedTokens: NotationToken[];
  parsedNotationNodeCount: number;
}

export interface PlaybackState {
  status: PlaybackStatus;
  isPlaying: boolean;
  isPaused: boolean;
  currentNoteIndex: number;
  pausedNoteIndex: number;
  tempo: number;
  volume: number;
}

export interface SettingsState {
  waveform: WaveformType;
  tuning: TuningMode;
  activePreset: 'veena' | 'flute' | 'violin' | 'harmonium';
}

export interface StatisticsState {
  totalNotes: number;
  totalLines: number;
  estimatedDurationSeconds: number;
  octaveCount: number;
}
```

---

## 13. Route-Level Specification

## 13.1 `/` main route
The default route becomes the main notation player.

It must render:

- AppHeader
- NotationInputCard
- PlaybackControlsCard
- SettingsCard
- PianoCard
- ParsedNotationCard
- StatisticsCard
- AppFooter
- ToastContainer
- LoadingOverlay

The page should assemble these pieces but not contain parser or audio logic directly.

## 13.2 `/piano` route
This route should render only the standalone piano experience.

It should reuse:
- `PianoKeyboard.svelte`
- the same audio engine
- the same key mapping logic

No duplication.

---

## 14. Component Specification

## 14.1 `NotationInputCard.svelte`
Responsibilities:

- bind the notation textarea
- expose Parse / Load Example / Upload File / Clear actions
- display status bar
- show parsed info text

Must not:
- parse notation directly
- manipulate audio directly

## 14.2 `PlaybackControlsCard.svelte`
Responsibilities:

- Play / Pause / Stop buttons
- tempo control
- volume control

Must not:
- know parser internals
- know DOM highlighting internals

## 14.3 `SettingsCard.svelte`
Responsibilities:

- waveform selection
- tuning selection
- preset buttons

Must not:
- know audio engine internal implementation details beyond action calls

## 14.4 `ParsedNotationCard.svelte`
Responsibilities:

- render parsed tokens
- visually highlight active note
- scroll active token into view

Must not:
- compute parsing itself

## 14.5 `StatisticsCard.svelte`
Responsibilities:

- display the current stats only

## 14.6 `PianoCard.svelte`
Responsibilities:

- render the piano in the main page
- handle key press / release interaction
- talk to piano actions

Must not:
- embed parser logic

---

## 15. State and Action Design

## 15.1 Actions

### `notation.actions.ts`
Must expose actions for:

- parse current text
- clear notation
- load example text
- load uploaded text
- update parsed display model
- update statistics

### `playback.actions.ts`
Must expose actions for:

- initialize audio if needed
- play
- pause
- stop
- resume from paused index
- respond to note index event
- sync highlighting status

### `piano.actions.ts`
Must expose actions for:

- piano key down
- piano key up
- release all held notes
- map piano UI note+octave to svara+octave

### `settings.actions.ts`
Must expose actions for:

- set waveform
- set tuning
- apply preset
- set tempo
- set volume

---

## 16. Migration Strategy

## Milestone 1 — Project Skeleton

### Goal
Create the SvelteKit + TypeScript project and folder structure.

### Deliverables
- working app shell
- global styles loaded
- empty routes created
- empty stores and actions created

### Done when
- `/` loads
- `/piano` loads
- build and lint work

---

## Milestone 2 — Move Styles First

### Goal
Extract the current inline CSS into the new style system.

### Deliverables
- `tokens.css`
- `global.css`
- `app-theme.css`

### Rules
- keep current class names where practical
- do not redesign styles yet
- preserve current visual appearance as much as possible

### Done when
- the page can visually match the existing app skeleton

---

## Milestone 3 — Static UI Port

### Goal
Port the current HTML structure into Svelte components without wiring behavior.

### Deliverables
- page composed from Svelte components
- no inline script in route files
- all current sections rendered

### Done when
- the new app visually resembles current app
- buttons and inputs exist
- no music logic is wired yet

---

## Milestone 4 — Port Pitch/Frequency Modules

### Goal
Move svara constants and frequency helpers into TypeScript modules.

### Deliverables
- `svara.constants.ts`
- `svara-frequencies.ts`
- `svara-normalization.ts`

### Done when
- the frequency lookup behavior matches the current app
- equal and just tuning still work
- normalization still works for the current svara set

---

## Milestone 5 — Port Notation Modules

### Goal
Move parser and validation logic into TypeScript modules.

### Deliverables
- `notation.constants.ts`
- `notation.parser.ts`
- `notation.validation.ts`
- `notation.stats.ts`

### Rules
- preserve current parser behavior exactly
- do not “upgrade” the parser yet

### Done when
- current example text produces the same parse result and stats as before
- existing warnings/errors behave the same

---

## Milestone 6 — Port Audio Engine

### Goal
Move `AudioEngine` and presets into TypeScript.

### Deliverables
- `audio.presets.ts`
- `audio-engine.ts`

### Rules
- preserve current init pattern
- preserve current event model
- preserve current sequence playback style
- preserve sustained piano note behavior

### Done when
- single note playback works
- sequence playback works
- preset switching works
- waveform/tuning/volume updates work

---

## Milestone 7 — Rebuild Piano Interaction

### Goal
Replace the old DOM-heavy `PianoController` with Svelte component + action wiring.

### Deliverables
- piano components
- keyboard mapping module
- piano actions
- held-note tracking

### Rules
- preserve mouse, touch, and keyboard behavior
- preserve release-all on blur/visibility change

### Done when
- piano behaves the same as current app
- sustained notes still work
- stuck-note prevention still works

---

## Milestone 8 — Wire Main Page Behavior

### Goal
Recreate all main-page behavior in the new architecture.

### Deliverables
- parse button works
- play/pause/stop works
- upload works
- load example works
- clear works
- status updates work
- toasts work
- notation highlighting works
- stats update works

### Done when
- the user can use the new app exactly like the current app

---

## Milestone 9 — Standalone Piano Route

### Goal
Create the dedicated piano page from shared pieces.

### Deliverables
- `/piano` route
- reusing shared piano/audio logic

### Done when
- standalone piano route works
- no duplicated piano logic is needed

---

## Milestone 10 — Parity Verification

### Goal
Compare old and new app behavior before any tala work starts.

### Verification checklist
- parse current sample correctly
- play parsed notation correctly
- pause/resume works
- stop works
- note highlighting works
- piano mouse input works
- piano touch input works
- piano keyboard input works
- tuning changes still affect playback
- preset changes still affect playback
- stats still display correctly
- file upload still works
- example loading still works

### Done when
- parity is good enough that tala work can start on top of the new base

---

## 17. Specification Constraints For The Coding Phase

These rules must be followed by the implementation.

### Rule 1
Do not add tala-related types or placeholder engines yet.

### Rule 2
Do not rewrite current note timing semantics.

### Rule 3
Do not introduce a future composition schema in this phase.

### Rule 4
Do not keep giant controller classes if Svelte store/action separation can replace them cleanly.

### Rule 5
Do not leave parser, audio, and piano logic inside `.svelte` files.

### Rule 6
Do not duplicate the piano implementation between `/` and `/piano`.

### Rule 7
Do not change the current notation grammar.

### Rule 8
Do not remove current console-usable app functionality unless it has no clean equivalent.

---

## 18. Acceptance Criteria

This phase is complete when:

- the app is running in SvelteKit + TypeScript
- the current user-facing behavior is preserved
- the code is modular
- there is no giant inline-script page anymore
- the piano route exists
- parser/audio/frequency logic are separated into modules
- the app is ready for tala work without another structural rewrite

---

## 19. Recommended Immediate Build Order

Do this in exactly this order:

```text
1. Create SvelteKit project skeleton
2. Move CSS out of index.html
3. Rebuild static UI in components
4. Port svara frequency logic
5. Port notation parser/validation/stats
6. Port audio engine
7. Rebuild piano interactions
8. Wire page actions/stores
9. Add standalone /piano route
10. Verify parity against current master
```

That order keeps the migration controlled.

---

## 20. Strong Recommendation

Treat this as a **pure architecture migration**.

Do not mix this phase with tala ideas.
Do not opportunistically improve notation semantics.
Do not redesign playback timing yet.

The cleanest path is:

**first preserve the current app in a better architecture**
→ **then add tala on top of that stable base**
