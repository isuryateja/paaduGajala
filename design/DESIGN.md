# Legacy Design System Document

## Status

This document is retained as a **legacy reference** from the earlier "Rhythmic Rail" direction.

- It is **not** the active source of truth for the current 004 redesign effort.
- It may be used as historical context or inspiration only.
- New implementation decisions should follow the current design-definition artifacts documented for the redesign, not this file.

## Historical Context

The content below describes the superseded "Rhythmic Rail" direction that previously informed the product's design language.

---

## 1. Overview & Creative North Star: "The Rhythmic Rail"
This design system moves beyond digital interfaces to recreate the tactile, rhythmic experience of a classic South Indian train journey. Our Creative North Star is **"The Rhythmic Rail"**—a philosophy that blends the structural rigidity of a vintage train compartment with the fluid, organic grace of Carnatic music. 

We reject the cold "flatness" of modern SaaS. Instead, we embrace **Analog Tactility**. Layouts should feel like a series of interconnected berths and metal frames. We break the standard grid through intentional asymmetry, where "windows" into content (portraits of legends) overlap with "structural" metal-toned containers. Every interaction should feel like a physical click or a soft cushion press, grounding the ethereal nature of music in a nostalgic, grounded reality.

---

## 2. Colors
Our palette is a study in desaturated, lived-in tones. We avoid pure whites or blacks, opting instead for the "washed" quality of oxidized metal and sun-faded vinyl.

- **Primary Roles:** Use `primary` (#2f6578) and `primary_container` (#6fa3b8) for the dominant "Train Blue" experience. This is the structural foundation.
- **Surface Hierarchy & Nesting:** Do not use a single flat background.
    - **Base Layer:** `surface` (#fcf9f2) represents the interior cabin walls.
    - **Nesting:** Place `surface_container_low` (#f6f3ec) for primary content areas. Within those, use `surface_container_highest` (#e5e2db) for "inset" metal panels or controls.
- **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined by background shifts. To separate a lesson list from a player, transition from `surface_container` to `surface_container_high`.
- **Accents (The Rust & Gold):** `tertiary` (#924a2c) is used sparingly for critical actions (Start Practice), mimicking the emergency chain or rusted bolts. `secondary_fixed` (#c7e7ff) provides the muted yellow "cabin light" glow for highlights.
- **Signature Textures:** Apply a subtle noise grain overlay (3-5% opacity) across all `primary_container` surfaces to mimic the texture of Rexine train seats.

---

## 3. Typography
The typography is the "modern passenger" inside the vintage cabin. We use clean, sans-serif faces to ensure the complex terminology of Carnatic music (Ragas, Talas) remains hyper-readable.

- **The Display Scale:** `display-lg` (Work Sans, 3.5rem) should be used for Raga names. Its bold, architectural weight mimics the stamped metal lettering found on train exteriors.
- **The Body Scale:** `body-lg` (Public Sans, 1rem) is our workhorse. It provides a neutral, high-legibility contrast to the heavy, tactile UI elements.
- **Hierarchy of Identity:** Use `headline-sm` for lesson titles. The contrast between the "heavy" structural UI and the "light" modern type creates the premium, editorial feel of a high-end music journal.

---

## 4. Elevation & Depth: Tonal Layering
We do not use "shadows" in the CSS sense; we use **Ambient Occlusion**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_lowest` card sitting on a `surface_container_low` background creates a natural lift.
- **Ambient Shadows:** For floating elements like a "Now Playing" bar, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(31, 42, 48, 0.08)`. The color is a tinted version of `on_surface`, never pure black.
- **The "Ghost Border" Fallback:** If a divider is functionally required, use `outline_variant` (#c0c8cc) at 20% opacity. It should look like a faint indentation in the metal, not a drawn line.
- **The Cushion Effect:** All containers (Cards/Buttons) must use `xl` (1.5rem) or `lg` (1rem) roundedness to mimic the rounded corners of vintage train berths and seat cushions.

---

## 5. Components

### Buttons & Controls
- **Primary Action (The Lever):** Large `xl` rounded corners. Background: `tertiary` (#924a2c). Text: `on_tertiary`. It should feel like a physical pull-tab.
- **Secondary (The Panel):** Background: `secondary_container` (#aadafe). No border. Uses a subtle inner-shadow to appear "pressed" into the wall.

### The "Berth" Card
- Forbid divider lines. Use `spacing.8` (2rem) of vertical white space to separate lesson modules.
- Use a vertical strip of `primary` (#2f6578) on the left edge (4px width) to signify "Current Berth" or active selection, mimicking a metal frame.

### Portraits of Legends
- Images of Carnatic legends should be styled with a `multiply` blend mode against `surface_variant`, rendered in desaturated B&W. They should look like they are printed directly onto the "Off White" cabin walls.

### Empty States (The "Gajala" Moment)
- Use spare, hand-drawn style illustrations of Brahmanandam in his iconic "Gajala" persona. These must be monochromatic and placed within a `surface_container_highest` well to feel like a framed photograph in a cabin.

### Input Fields
- **Text Inputs:** Use `surface_container_highest` with a `sm` (0.25rem) "Ghost Border." The label (`label-md`) should always be persistent, sitting above the field like a metal plaque.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing.6` and `spacing.8` generously. High-end design requires "breathing room" to offset the "heavy" metal textures.
- **Do** use asymmetrical layouts. Place a portrait on the far right while text remains left-aligned to create a sense of looking through a train window.
- **Do** use `primary_fixed_dim` for icons to give them a "weathered metal" look.

### Don't
- **Don't** use Glassmorphism or Backdrop Blurs. This is an opaque, physical world.
- **Don't** use 1px solid borders. If you feel you need a line, use a background color change instead.
- **Don't** use "vibrant" colors. Every color must feel like it has been sitting in the Chennai sun for a decade.
- **Don't** use standard "Drop Shadows." Use tonal shifts (`surface` to `surface_dim`) to indicate hierarchy.

### Accessibility Note
While we prioritize a "faded" aesthetic, ensure that all text (`on_surface`) maintains a contrast ratio of at least 4.5:1 against its respective surface container. Use the `on_primary_container` and `on_secondary_container` tokens strictly for functional legibility.
