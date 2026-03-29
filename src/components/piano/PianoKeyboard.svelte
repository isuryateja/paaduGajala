<script lang="ts">
  import PianoOctave from './PianoOctave.svelte';
  import { PIANO_KEYS } from '../../domain/piano/piano.constants';
  import type { ActivePianoKeys } from '../../domain/piano/piano.types';

  const octaves = ['1', '2', '3'] as const;
  export let activeKeys: ActivePianoKeys = {};
</script>

<div class="piano-keyboard">
  {#each octaves as octave}
    <PianoOctave keys={PIANO_KEYS.filter((key) => key.octave === octave)} {activeKeys} />
  {/each}
</div>

<style>
  .piano-keyboard {
    display: grid;
    gap: 0.85rem;
  }
</style>
