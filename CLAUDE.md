# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite + SvelteKit)
npm run build        # svelte-kit sync && vite build
npm run check        # Type-check with svelte-check
npm run lint         # ESLint on src/ (TS files)
npm run test         # Vitest run (all tests)
npm run validate     # check + lint + test (full pipeline)
```

Run a single test file:
```bash
npx vitest run src/tests/path/to/file.test.ts
```

## Architecture

**paaduGajala** is a browser-only Carnatic music notation player and interactive virtual piano — no backend, no database. Stack: SvelteKit 2, Svelte 5 (runes mode), TypeScript strict, Web Audio API, Vitest.

### Execution pipeline

Notation text → Tokenizer → Parser → AST → Frequency resolver → AudioEngine → Web Audio API → sound

### Layer structure

```
src/domain/     Pure TS — no Svelte, no DOM. Testable in Node.
  notation/     Tokenizer, parser, AST types
  pitch/        Svara-to-frequency resolution (equal/just tuning)
  audio/        AudioEngine class, voice management, presets
  piano/        Keyboard layout and key mapping
  raga/         Raga reference data
  svara-grantham/ Svara name/meaning lookup

src/app/        Application orchestration
  stores/       Svelte writable stores (notation, playback, settings, ui)
  actions/      Stateful handlers that mutate stores — components call these, not stores directly
  services/     Page-level view models

src/components/ Svelte UI components (feature-organized)
src/infra/      Browser wrappers (sessionStorage, DOM helpers)
src/routes/     SvelteKit file-based pages
src/tests/      Vitest tests mirroring src/ structure
```

### Key patterns

**Action-based mutation**: Components never call `store.set()` directly. They call exported action functions from `src/app/actions/`, which `get(store)` and update state. This keeps mutation centralized.

**Legacy JS facades**: The original `notation_parser.js` and `svara_frequencies.js` (root dir) are preserved as-is. TypeScript facades in `src/domain/` re-export them with types — don't rewrite them.

**AudioEngine singleton**: Created once in `playback.actions.ts`. Emits `noteOn`, `noteOff`, `noteIndex`, `sequenceStart`, `sequenceEnd` events. Actions subscribe to events and update `playbackStore` for reactive UI sync (notation highlighting uses `noteIndex`).

**Additive voices**: Notes are created via `createVoiceByType` (`src/domain/audio/voices/`). `pure` is a single oscillator; instrument banks (`plucked`, `flute`, `bow`, `reed`) use multiple partial oscillators and may add noise/LFO sources. Each note is one `AudioVoice` with a `sources[]` list — stop/disconnect every source when the note ends. Instrument presets set `voiceType`; the manual waveform picker forces `voiceType: pure`.

**Shared reverb bus**: All voices feed `voiceBus`, which splits dry (compressor → dryGain) and wet (send → convolver IR → wetGain). Live IR preset changes duck wet, swap `convolver.buffer`, then ramp wet back (do not restore mix at the same `currentTime` as the duck).

**Audio scheduling**: All notes scheduled ahead-of-time using `audioContext.currentTime` as a timeline cursor — avoids setInterval jitter.

**Direct DOM for transient animation**: Key press animations use direct `element.style` writes, not store updates, to avoid Svelte re-renders for sub-200ms visual feedback.

**Tuning modes**: `AudioEngine.getFrequency(svara, octave)` handles both equal temperament (lookup table, Sa = C4 = 261.63 Hz) and just intonation (pure ratios) at runtime.

### Routes

| Path | Purpose |
|------|---------|
| `/` | Main notation player |
| `/piano` | Standalone interactive piano |
| `/sruti-to-swara` | Frequency → svara lookup |
| `/nada-vinodam` | Audio visualization |
| `/svara-grantham` | Svara reference text with local editing |
| `/raga-nirmana` | Raga builder (stub) |
| `/dodo/*` | Internal docs (arch, theory, plans) — custom dark layout |

### Core types

- `SvaraName`: `'S' | 'R1' | 'R2' | 'R3' | 'G1' | 'G2' | 'G3' | 'M1' | 'M2' | 'P' | 'D1' | 'D2' | 'D3' | 'N1' | 'N2' | 'N3'`
- `OctaveName`: `'mandra' | 'mandara' | 'madhya' | 'taara'`
- `TuningMode`: `'equal' | 'just'`
- `WaveformType`: `'sine' | 'triangle' | 'sawtooth' | 'square'`
- `PlaybackStatus`: `'ready' | 'parsed' | 'playing' | 'paused'`
- `SequenceItem`: union of `SequenceNote | SequenceBoundary | SequenceSilence`
- `VegaGroupNode`: grouped svaras with subdivision for fast passages

### Deployment

Deployed to Vercel. `vercel.json` includes legacy redirects (`/paadugajaala` → `/`, `/virtual_piano.html` → `/piano`).

### Constraints

- `AudioContext` requires a user gesture — never initialize on module load.
- No voice stealing: unlimited polyphony — one `AudioVoice` per note (not one oscillator; multi-partial banks use 3–8+ sources each).
- Instrument presets apply `voiceType` + envelope; session restore must preserve user volume/waveform (`applyPreset(..., { preserveUserLevels: true })`).
- No gamakam (ornaments) or held notes yet (notation/design work may be in progress under `specs/012-gamaka-notation-support/`).
- Settings persist in `sessionStorage`; no other persistence.

For comprehensive technical detail, see `ARCHITECTURE.md`.
