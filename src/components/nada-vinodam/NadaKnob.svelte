<script lang="ts">
  import { onDestroy } from 'svelte';

  export let label = '';
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step = 0.01;
  export let size: 'compact' | 'large' = 'compact';
  export let accent = '#2f6578';
  export let valueText = '';
  export let onChange: (value: number) => void = () => {};

  let knobElement: HTMLDivElement | null = null;
  let removePointerListeners = () => {};

  function clampValue(next: number): number {
    return Math.min(max, Math.max(min, next));
  }

  function valueToAngle(next: number): number {
    const ratio = (next - min) / (max - min || 1);
    return -140 + ratio * 280;
  }

  function syncVisual(next: number): void {
    if (!knobElement) {
      return;
    }

    knobElement.style.setProperty('--knob-angle', `${valueToAngle(next)}deg`);
  }

  function updateValue(next: number): void {
    const normalized = clampValue(Number(next.toFixed(3)));
    syncVisual(normalized);
    onChange(normalized);
  }

  function handlePointerDown(event: PointerEvent): void {
    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    const dragOriginY = event.clientY;
    const dragOriginValue = value;
    const range = max - min;
    const pixelsForFullTravel = size === 'large' ? 220 : 180;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();

    event.currentTarget.style.transform = size === 'large' ? 'translateY(2px)' : 'translateY(1px)';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = dragOriginY - moveEvent.clientY;
      const next = dragOriginValue + (delta / pixelsForFullTravel) * range;
      updateValue(next);
    };

    const releasePointer = () => {
      if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.style.transform = '';
      }
      removePointerListeners();
      syncVisual(value);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', releasePointer, { once: true });
    window.addEventListener('pointercancel', releasePointer, { once: true });

    removePointerListeners = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      removePointerListeners = () => {};
    };
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      updateValue(value + step);
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      updateValue(value - step);
      event.preventDefault();
      return;
    }

    if (event.key === 'Home') {
      updateValue(min);
      event.preventDefault();
      return;
    }

    if (event.key === 'End') {
      updateValue(max);
      event.preventDefault();
    }
  }

  $: syncVisual(value);

  onDestroy(() => {
    removePointerListeners();
  });
</script>

<div class={`knob-shell ${size}`}>
  <div
    bind:this={knobElement}
    class="knob"
    role="slider"
    tabindex="0"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-valuetext={valueText}
    onpointerdown={handlePointerDown}
    onkeydown={handleKeydown}
    style={`--accent:${accent};`}
  >
    <div class="knob-face">
      <span class="indicator" aria-hidden="true"></span>
      <span class="cap-shine" aria-hidden="true"></span>
    </div>
  </div>

  <span class="knob-label">{label}</span>
  <span class="knob-value">{valueText}</span>
</div>

<style>
  .knob-shell {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
  }

  .knob {
    --knob-angle: 0deg;

    position: relative;
    display: grid;
    place-items: center;
    border-radius: 999px;
    cursor: ns-resize;
    background: linear-gradient(180deg, rgba(236, 237, 238, 0.95), rgba(125, 130, 134, 0.98));
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.58),
      0 10px 24px rgba(31, 42, 48, 0.22);
    user-select: none;
    touch-action: none;
  }

  .large .knob {
    width: 8.3rem;
    height: 8.3rem;
    padding: 0.65rem;
  }

  .compact .knob {
    width: 4.85rem;
    height: 4.85rem;
    padding: 0.35rem;
  }

  .knob-face {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.85), transparent 36%),
      linear-gradient(180deg, rgba(212, 214, 216, 0.98), rgba(157, 161, 164, 0.94));
    box-shadow:
      inset 0 -5px 8px rgba(44, 48, 52, 0.22),
      inset 0 2px 2px rgba(255, 255, 255, 0.4);
  }

  .indicator {
    position: absolute;
    top: 10%;
    left: 50%;
    width: 0.34rem;
    height: 1.25rem;
    border-radius: 999px;
    background: var(--accent);
    transform: translateX(-50%) rotate(var(--knob-angle)) translateY(0.2rem);
    transform-origin: center 2.95rem;
    box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 55%, transparent);
  }

  .compact .indicator {
    height: 0.9rem;
    transform-origin: center 1.72rem;
  }

  .cap-shine {
    position: absolute;
    inset: 18%;
    border-radius: 999px;
    border-top: 1px solid rgba(255, 255, 255, 0.55);
    opacity: 0.65;
  }

  .knob-label,
  .knob-value {
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .knob-label {
    color: rgba(68, 71, 74, 0.88);
    font-size: 0.62rem;
    font-weight: 900;
  }

  .knob-value {
    color: rgba(68, 71, 74, 0.64);
    font-size: 0.56rem;
    font-weight: 800;
  }
</style>
