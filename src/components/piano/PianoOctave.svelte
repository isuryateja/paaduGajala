<script lang="ts">
  import PianoKey from './PianoKey.svelte';
  import type { PianoKeyDefinition } from '../../domain/piano/piano.types';

  export let keys: PianoKeyDefinition[] = [];
  export let activeKeys = new Set<string>();
</script>

<div class="piano-octave">
  {#each keys as key}
    <PianoKey {...key} pressed={activeKeys.has(`${key.note}:${key.octave}`)} />
  {/each}
</div>
