<script lang="ts">
  export let visible = false;
</script>

{#if visible}
  <div class="overlay">
    <div class="panel">
      <div class="spinner"></div>
      <p class="label">Preparing audio engine</p>
      <p class="brand">Paadu Gajala</p>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: var(--overlay-scrim);
    backdrop-filter: blur(12px);
    z-index: 1000;
  }

  .panel {
    display: grid;
    justify-items: center;
    gap: 0.85rem;
    min-width: min(24rem, 100%);
    padding: 2rem 1.5rem;
    border-radius: var(--radius-lg);
    background: var(--surface-overlay-strong);
    box-shadow: var(--shadow-soft);
  }

  .spinner {
    width: 2.4rem;
    height: 2.4rem;
    border: 3px solid var(--accent-secondary-soft);
    border-top-color: var(--accent);
    border-radius: 999px;
    animation: spin 0.9s linear infinite;
  }

  .label {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .brand {
    color: var(--text-strong);
    font-family: 'Sora', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
