<script lang="ts">
  import PianoKeyboard from './PianoKeyboard.svelte';
  export let title = 'Virtual Piano';
  export let subtitle = '';
  export let activeKeys = new Set<string>();
</script>

<section class="card">
  <h2>{title}</h2>
  {#if subtitle}
    <p>{subtitle}</p>
  {/if}
  <PianoKeyboard {activeKeys} />
</section>
