<script lang="ts">
  import PianoKey from './PianoKey.svelte';
  import type { PianoKeyDefinition } from '../../domain/piano/piano.types';

  export let keys: PianoKeyDefinition[] = [];
  export let activeKeys = new Set<string>();

  $: whiteKeys = keys.filter((key) => !key.isBlack);
  $: blackKeys = keys.filter((key) => key.isBlack);
</script>

<div class="piano-octave">
  <div class="octave-label">Octave {keys[0]?.octave ?? ''}</div>
  <div class="row white-row">
    {#each whiteKeys as key}
      <PianoKey {...key} pressed={activeKeys.has(`${key.note}:${key.octave}`)} />
    {/each}
  </div>
  <div class="row black-row">
    {#each blackKeys as key}
      <PianoKey {...key} pressed={activeKeys.has(`${key.note}:${key.octave}`)} />
    {/each}
  </div>
</div>

<style>
  .piano-octave {
    display: grid;
    gap: 0.45rem;
  }

  .octave-label {
    color: var(--text-muted);
    font-size: 0.74rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .row {
    display: grid;
    gap: 0.5rem;
  }

  .white-row {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .black-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    max-width: 78%;
  }
</style>
