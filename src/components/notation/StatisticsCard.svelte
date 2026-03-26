<script lang="ts">
  import StatCard from '../common/StatCard.svelte';

  export let notes = '0';
  export let lines = '0';
  export let duration = '0s';
  export let octaves = '0';
</script>

<section class="card section">
  <header class="header">
    <p class="section-label">Run metrics</p>
    <h2>Keep the scale of the current passage in sight.</h2>
  </header>

  <div class="grid">
    <StatCard label="Notes" value={notes} />
    <StatCard label="Lines" value={lines} />
    <StatCard label="Duration" value={duration} />
    <StatCard label="Octaves" value={octaves} />
  </div>
</section>

<style>
  .section {
    display: grid;
    gap: 1rem;
    padding: 1.35rem;
  }

  .header {
    display: grid;
    gap: 0.4rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .grid {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  }
</style>
