# M1 / M2 Piano Key Hit-Area Bug — Engineering Details

**File:** `src/routes/+page.svelte`
**Section:** Virtual Swara Piano (`piano-keybed`)

---

## Measured Geometry (live browser, 1136 px keybed)

| Element | left px | right px | width px |
|---------|---------|----------|----------|
| M1 white key (index 5 of 11) | 547.9 | 651.1 | 103.2 |
| M2 black key | 621.9 | 681.5 | 59.6 |
| **Overlap zone** | **621.9** | **651.1** | **~29 px** |

- **11 white keys**, each `flex: 1` → each ~103 px at typical viewport.
- M2 `left: 54.55%` = `6/11 × 100%` = the **exact boundary** between M1 and P.
- CSS `transform: translateX(-50%)` centres the element at its `left` point, so M2's centre is at 54.55 % of keybed width — right on the M1/P seam.
- M2 visual half-width = `5.25% / 2 = 2.625%` ≈ 29.8 px → it bleeds **~29 px left into M1** and **~30 px right into P**.

---

## Why the Bug Happens

### The DOM structure
```html
<div class="piano-keybed">          <!-- position: relative -->
  <!-- white keys (11 buttons, flex: 1, position: relative) -->
  <button class="white-key">M1</button>
  ...
  <!-- black keys (7 buttons, position: absolute, z-index: 10) -->
  <button class="black-key" style="left:54.55%">M2</button>
  ...
</div>
```

### Event dispatch
Each button has its **own** `on:pointerdown/up/leave/cancel` handler:
```svelte
<button on:pointerdown={(e) => handleKeyDown(e, key.note, key.octave)}>
```
`handleKeyDown` uses `event.currentTarget` (the button itself) to determine which key fired.

### The hit-test chain
The browser dispatches a `pointerdown` to the topmost element whose **bounding box** contains the cursor:

- M2 `z-index: 10`, `position: absolute` → renders above white keys.
- In the 29 px overlap zone (x ≈ 621–651) **the bounding box of M2 covers that area**. The browser sends the event to M2, not M1.
- Outcome: user taps what they perceive as M1 (right third of the white key), but **only M2 fires**.

> Confirmed via `document.elementFromPoint()`: cursor in the overlap zone at the top 54 % of keybed height → returns `.black-key`, not `.white-key`.

### Why "M1 also fires" appears
Users see M2 light up while intending to press M1. Because M2 steals the event, M1 never triggers — the perception is "M2 fired incorrectly" which reads as both keys being wrong.

---

## What Does NOT Cause the Bug

- No event bubbling between sibling buttons (siblings don't receive each other's bubbled events).
- `activeManualKeys` (a `Set`) is correct — no double-fire of the same key.
- The `pointerleave` release path is not involved in the wrong-key-fires scenario.

---

## Fix Strategy

### Option A — Keybed container handles all events (recommended)

Remove `on:pointer*` from individual key buttons. Add a **single `on:pointerdown`** on `.piano-keybed` and resolve the hit key via coordinate math:

```
xRatio = (clientX - keybedRect.left) / keybedRect.width
yRatio = (clientY - keybedRect.top)  / keybedRect.height

if yRatio < 0.54:          // upper zone where black keys live
  for each blackKey:
    center = blackKey.left / 100    // e.g. 0.5455 for M2
    if |xRatio - center| <= 0.02625:   // within visual half-width
      → fire blackKey
      break

// fall through → white key
whiteIndex = floor(xRatio * 11)    // 11 white keys
→ fire whiteKeys[whiteIndex]
```

Track releases per pointer with a `Map<pointerId, 'note:octave'>`. Call `keybedEl.setPointerCapture(event.pointerId)` on down so the up/cancel event always returns to the keybed even if the finger drifts.

Add `pointer-events: none` to `.white-key` and `.black-key` so they never intercept events themselves; apply visual feedback by querying `[data-note][data-octave]` attributes on the buttons.

**Pros:** Correct for all overlap pairs (not just M1/M2). Works identically for touch and mouse.

---

### Option B — CSS only (simpler, partial fix)

Keep individual button handlers. Block M2 from stealing events in the white-key region by making `.black-key` respond only to direct hits via `clip-path`:

```css
.black-key {
  clip-path: inset(0 0 0 0);   /* adjust to trim left/right bleed */
}
```

`clip-path` **clips both painting and pointer-event hit area** in modern browsers. Trimming the left 29 px of M2 would make clicks there fall through to M1.

**Cons:** Fragile — pixel values depend on viewport/keyboard width. Does not scale with the flexible layout.

---

## Key Constants (current code)

| Constant | Value | Location |
|----------|-------|----------|
| Black key width | `5.25%` | `.black-key { width: 5.25% }` |
| Black key height | `54%` | `.black-key { height: 54% }` |
| M2 `left` | `54.55%` | `blackKeys` array, index 3 |
| White key count | `11` | `whiteKeys` array length |
| Black key count | `7` | `blackKeys` array length |

---

## Files to Change

| File | What changes |
|------|-------------|
| `src/routes/+page.svelte` | Replace per-button handlers with keybed handler + `resolveHitKey()`. Add `data-note`/`data-octave` attrs to key buttons. Add `pointer-events: none` + `touch-action: none` to CSS. |
