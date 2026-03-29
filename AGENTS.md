# paaduGajala Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-26

## Active Technologies
- TypeScript 5.x, Svelte 5, HTML5, CSS3 + SvelteKit, Vite, Vitest, ESLint, Prettier, native browser APIs (004-design-language-store)
- Repository files in `design/` as the source of truth for design-language data; generated or imported theme artifacts in frontend styling files; no backend datastore (004-design-language-store)

- TypeScript 5.x, Svelte 5, HTML5, CSS3 + SvelteKit, Vite, Vitest, ESLint, Prettier, Web Audio API, native browser APIs (003-lift-shift-refactor)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, Svelte 5, HTML5, CSS3: Follow standard conventions

## Svelte 5 Pitfalls & Mandatory Patterns

> **CRITICAL**: This project runs Svelte 5 (runes mode by default). Many Svelte 4 patterns silently fail.

### Reactivity
- **Do NOT use `Set` or `Map` for template-bound state.** `.has()` / `.get()` calls in templates are not tracked by Svelte 5. Use `Record<string, T>` or `$state()` objects.
- **Do NOT wrap reactive reads in helper functions** like `{isActive(key)}`. Svelte can't trace dependencies through function calls. Inline the expression: `{activeKeys[key]}`.
- **Prefer `$state()` runes** over bare `let` for any variable that drives template rendering.
- If a file uses `$:` (legacy mode), note that `let` reassignment reactivity is weaker than Svelte 4 — especially for collections and inside `{#each}` blocks.

### CSS Scoping
- Svelte **strips CSS selectors it considers unused**. If you add classes at runtime via `classList.add()`, Svelte won't see them and will remove the CSS rules.
- Either use `class:name={expr}` directive (Svelte-tracked) or wrap runtime-added class selectors with `:global()`.
- **Safest for transient visual states**: use inline styles (`el.style.x = '...'`) — immune to Svelte's CSS scoping and has highest specificity.

### Interactive Visual Feedback
- For press/hover/drag animations, use **direct DOM manipulation** via `event.currentTarget.style` rather than reactive state. Svelte's re-render cycle is unreliable for sub-200ms visual feedback.
- Always pass the event to handlers: `on:pointerdown={(e) => handler(e, ...args)}`.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
