# paaduGajala Constitution

## Core Principles

### I. Svelte 5 Runes-First Reactivity

Svelte 5 is NOT Svelte 4. Legacy reactive patterns (`$:`, `let` reassignment) are unreliable in Svelte 5's default runes mode. Follow these rules:

- **Never use `Set`, `Map`, or other collection types for reactive template state.** Svelte 5 cannot track `.has()`, `.get()`, or `.size` calls in templates. Use plain objects (`Record<string, T>`) or arrays instead.
- **Prefer `$state()` runes** for any variable that drives template rendering. Bare `let` reassignment may not trigger re-renders.
- **Do not hide reactive reads behind function calls** in templates. `{myFunction(arg)}` prevents Svelte from detecting dependencies. Inline the expression directly: `{myObject[key]}`.
- **When `$:` legacy syntax is used**, the entire component runs in legacy mode — but legacy mode reactivity is weaker than Svelte 4. Avoid mixing `$:` with imperative state updates in helper functions.

### II. CSS Scoping Awareness

Svelte's compiler scopes all CSS to the component and **strips selectors it considers unused**:

- **Never use `classList.add()` / `classList.remove()`** to toggle classes that have scoped CSS rules. Svelte will strip those rules because no template element references the class.
- If you must use runtime DOM class manipulation, either:
  - Wrap selectors with `:global()` (e.g., `.white-key:global(.pressed)`), OR
  - Use **inline styles** via `el.style` (preferred — highest specificity, immune to scoping).
- **Use `class:name={expression}` directive** instead of manual classList manipulation when possible — Svelte tracks these and preserves their CSS.

### III. Direct DOM Manipulation for Transient Visual States

For high-frequency, transient visual states (piano key presses, button flashes, drag indicators):

- Use `event.currentTarget` to directly apply/remove inline styles in event handlers.
- This bypasses Svelte's reactivity and CSS scoping entirely — both of which have proven unreliable for sub-200ms visual feedback.
- Reserve Svelte's reactive system for persistent UI state (navigation, settings, modals).

### IV. Event Handling

- Use `on:pointerdown` / `on:pointerup` / `on:pointerleave` / `on:pointercancel` for press interactions — covers mouse and touch.
- Always pass the event object to handlers when DOM manipulation is needed: `on:pointerdown={(e) => handler(e, ...args)}`.

### V. Technology Stack

- **Runtime**: TypeScript 5.x, Svelte 5, SvelteKit
- **Build**: Vite, Vitest, ESLint, Prettier
- **Audio**: Web Audio API
- **Styling**: Vanilla CSS (component-scoped via Svelte `<style>`)
- **No external CSS frameworks** (no Tailwind, no Bootstrap)

## Development Guardrails

1. Before implementing any reactive UI state, verify which Svelte mode the component compiles in (runes vs legacy). If a file contains `$:`, it's legacy — consider migrating to `$state`/`$derived`.
2. When a visual change "works in JS but not in DOM", check:
   - Is the CSS selector being stripped? (Look for "Unused CSS selector" warnings)
   - Is the reactive variable actually tracked? (Add `console.log` — if the log fires but DOM doesn't update, it's a reactivity tracking failure)
3. Test all interactive UI in a real browser — automated DOM snapshots may miss timing-sensitive class/style changes.

## Governance

- This constitution supersedes ad-hoc coding patterns.
- Amendments require documenting the failure case that motivated the change.

**Version**: 1.0.0 | **Ratified**: 2026-03-29 | **Last Amended**: 2026-03-29
