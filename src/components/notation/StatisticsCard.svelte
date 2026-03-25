<script lang="ts">
  import StatCard from '../common/StatCard.svelte';

  export let notes = '0';
  export let lines = '0';
  export let duration = '0s';
  export let octaves = '0';
</script>

<section class="card section">
  <h2>Statistics</h2>
  <div class="grid">
    <StatCard label="Notes" value={notes} />
    <StatCard label="Lines" value={lines} />
    <StatCard label="Duration" value={duration} />
    <StatCard label="Octaves" value={octaves} />
  </div>
</section>

<style>
  .section {
    padding: 1rem;
  }

  .grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  }
</style>
