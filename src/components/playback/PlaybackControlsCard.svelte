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

  $: stateLabel = playing ? 'Playing' : paused ? 'Paused' : 'Ready';
</script>

<section class="card section">
  <header class="header">
    <div>
      <p class="section-label">Playback desk</p>
      <h2>Control the pace without losing the phrase.</h2>
    </div>
    <span class="pill">{stateLabel}</span>
  </header>

  <div class="actions">
    <button class="accent" on:click={onPlay} disabled={playing}>Play</button>
    <button class="secondary" on:click={onPause} disabled={!playing}>Pause</button>
    <button class="ghost" on:click={onStop} disabled={!playing && !paused}>Stop</button>
  </div>

  <div class="grid">
    <RangeControl label="Tempo" min={60} max={200} value={tempo} suffix=" BPM" onInput={onTempo} />
    <RangeControl label="Volume" min={0} max={100} value={volume} suffix="%" onInput={onVolume} />
  </div>
</section>

<style>
  .section {
    display: grid;
    gap: 1rem;
    padding: 1.35rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
    flex-wrap: wrap;
  }

  h2 {
    font-size: 1.3rem;
  }

  .actions,
  .grid {
    display: grid;
    gap: 0.75rem;
  }

  .actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
</style>
