# Paadu Gajaala

Paadu Gajaala is a migrated SvelteKit version of the original Carnatic notation player and standalone virtual piano. The app keeps the legacy paste, parse, play, preview, and keyboard-piano workflows while separating domain logic, browser adapters, and route orchestration into maintainable modules.

## Application Surfaces

- Main player route: `/`
- Standalone piano route: `/piano`
- Legacy parity references kept in-repo: `paadugajaala/index.html`, `virtual_piano.html`, `notation_parser.js`, `audio_engine.js`, `svara_frequencies.js`

## Tech Stack

- SvelteKit 2
- Svelte 5
- TypeScript
- Vite
- Vitest
- ESLint + Prettier

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Run validation:

```bash
npm run validate
```

## Important Scripts

- `npm run dev` starts the migrated app
- `npm run build` builds the SvelteKit app
- `npm run preview` serves the production build locally
- `npm run check` runs `svelte-check`
- `npm run lint` runs ESLint
- `npm run test` runs Vitest
- `npm run validate` runs check, lint, and tests together

## Project Layout

```text
src/
  app/
    actions/
    services/
    stores/
  components/
  domain/
  infra/
  routes/
  tests/
static/
specs/003-lift-shift-refactor/
```

## Behavior Covered In The Migrated App

- Paste, parse, clear, load-example, and file-upload notation flows
- Validation and user-visible error feedback for malformed notation
- Parsed preview with legacy-style octave display and playback highlighting
- Tempo, volume, waveform, tuning, and preset controls
- Embedded piano on the main route
- Standalone piano with mouse, touch, keyboard input, and hidden-tab cleanup

## Deployment

The repository is configured for Vercel through [vercel.json](/Users/surya/Documents/code/projects/paaduGajala/vercel.json).

- `/paadugajaala` and `/paadugajaala/index.html` redirect to `/`
- `/virtual_piano.html` redirects to `/piano`

Expected deploy flow:

```bash
npm install
npm run build
```

## Notes

- The migrated app still uses the legacy parser/frequency reference modules as parity baselines where appropriate.
- The spec, plan, tasks, and quickstart artifacts for this migration are under `specs/003-lift-shift-refactor/`.
