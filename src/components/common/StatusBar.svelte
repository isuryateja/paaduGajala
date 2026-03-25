<script lang="ts">
  export let statusText = 'Ready';
  export let statusTone = 'ready';
  export let parsedInfo = '';
</script>

<div class="status-bar">
  <div class="indicator">
    <span class={`dot ${statusTone}`}></span>
    <span>{statusText}</span>
  </div>
  <span>{parsedInfo}</span>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .indicator {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 999px;
    background: var(--pg-cream);
  }

  .dot.success { background: var(--pg-success); }
  .dot.warning { background: var(--pg-warning); }
  .dot.error { background: var(--pg-error); }
  .dot.info { background: var(--pg-info); }
</style>
