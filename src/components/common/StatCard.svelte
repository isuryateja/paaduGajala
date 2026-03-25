<script lang="ts">
  export let label = '';
  export let value = '0';
</script>

<div class="card stat-card">
  <div class="value">{value}</div>
  <div class="label">{label}</div>
</div>

<style>
  .stat-card {
    padding: 1rem;
    text-align: center;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
  }
</style>
