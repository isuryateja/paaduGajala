<script lang="ts">
  export let statusText = 'Ready';
  export let statusTone = 'ready';
  export let parsedInfo = '';
</script>

<div class="status-bar">
  <div class={`indicator ${statusTone}`}>
    <span class="dot"></span>
    <span>{statusText}</span>
  </div>

  {#if parsedInfo}
    <span class="info">{parsedInfo}</span>
  {/if}
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .indicator,
  .info {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 2rem;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    background: var(--surface-overlay);
    color: var(--text-body);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .dot {
    width: 0.68rem;
    height: 0.68rem;
    border-radius: 999px;
    background: var(--text-muted);
  }

  .indicator.success .dot { background: var(--success); }
  .indicator.warning .dot { background: var(--warning); }
  .indicator.error .dot { background: var(--error); }
  .indicator.info .dot { background: var(--info); }
  .indicator.ready .dot { background: var(--accent-secondary); }
</style>
