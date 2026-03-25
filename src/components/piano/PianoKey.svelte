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
  {label}
</button>

<style>
  .piano-key {
    min-width: 3rem;
    min-height: 8rem;
    cursor: pointer;
  }

  .black {
    min-height: 6rem;
    background: #1f1f1f;
    color: #fff;
  }

  .active {
    outline: 2px solid var(--pg-gold);
  }
</style>
