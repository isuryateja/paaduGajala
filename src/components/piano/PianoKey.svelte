<script lang="ts">
  import { startPianoNote, stopPianoNote } from '../../app/actions/piano.actions';

  export let label = 'S';
  export let note = 's';
  export let octave: '1' | '2' | '3' = '2';
  export let isBlack = false;
  export let pressed = false;
  let active = false;

  $: active = pressed;

  async function press(): Promise<void> {
    active = true;
    await startPianoNote(note, octave);
  }

  function release(): void {
    active = false;
    stopPianoNote(note, octave);
  }
</script>

<button
  class:black={isBlack}
  class:active={active}
  class="piano-key"
  data-note={note}
  data-octave={octave}
  on:mousedown={press}
  on:mouseup={release}
  on:mouseleave={release}
  on:keydown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void press();
    }
  }}
  on:keyup={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      release();
    }
  }}
  on:touchstart|preventDefault={press}
  on:touchend|preventDefault={release}
>
  <span class="note">{label}</span>
  <span class="meta">{note.toUpperCase()}</span>
</button>

<style>
  .piano-key {
    display: grid;
    gap: 0.2rem;
    justify-items: start;
    min-height: 5.8rem;
    padding: 0.9rem 0.75rem;
    border-radius: 1rem;
    background: linear-gradient(180deg, var(--key-light-top), var(--key-light-bottom));
    color: var(--text-strong);
    box-shadow:
      inset 0 0 0 1px var(--line-soft),
      0 10px 18px rgba(31, 42, 48, 0.08);
    text-align: left;
  }

  .black {
    min-height: 4.6rem;
    background: linear-gradient(180deg, var(--key-dark-top), var(--key-dark-bottom));
    color: var(--text-inverse);
  }

  .active {
    transform: translateY(-2px);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.14),
      0 0 0 2px var(--key-active-ring),
      0 14px 24px var(--key-active-shadow);
  }

  .note {
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .meta {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    opacity: 0.75;
    text-transform: uppercase;
  }
</style>
