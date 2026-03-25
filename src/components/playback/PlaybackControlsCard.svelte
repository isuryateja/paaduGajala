<script lang="ts">
  import RangeControl from '../common/RangeControl.svelte';

  export let playing = false;
  export let paused = false;
  export let tempo = 120;
  export let volume = 70;
  export let onPlay: () => void = () => {};
  export let onPause: () => void = () => {};
  export let onStop: () => void = () => {};
  export let onTempo: (value: number) => void = () => {};
  export let onVolume: (value: number) => void = () => {};
</script>

<section class="card section">
  <h2>Playback Controls</h2>
  <div class="actions">
    <button on:click={onPlay} disabled={playing}>Play</button>
    <button on:click={onPause} disabled={!playing}>Pause</button>
    <button on:click={onStop} disabled={!playing && !paused}>Stop</button>
  </div>
  <div class="grid">
    <RangeControl label="Tempo" min={60} max={200} value={tempo} suffix=" BPM" onInput={onTempo} />
    <RangeControl label="Volume" min={0} max={100} value={volume} suffix="%" onInput={onVolume} />
  </div>
</section>

<style>
  .section {
    padding: 1rem;
  }

  .actions,
  .grid {
    display: grid;
    gap: 0.75rem;
  }

  .actions {
    grid-auto-flow: column;
    justify-content: start;
    margin-bottom: 1rem;
  }
</style>
