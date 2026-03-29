<script lang="ts">
  export let label = '';
  export let value = '0';
</script>

<div class="stat-card">
  <div class="value">{value}</div>
  <div class="label">{label}</div>
</div>

<style>
  .stat-card {
    display: grid;
    gap: 0.35rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: var(--surface-overlay);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    text-align: left;
  }

  .value {
    color: var(--text-strong);
    font-family: 'Sora', sans-serif;
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.05em;
  }

  .label {
    color: var(--text-muted);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
</style>
