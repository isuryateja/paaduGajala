<script lang="ts">
  export let visible = false;
</script>

{#if visible}
  <div class="overlay">
    <div class="spinner"></div>
    <div>Paadu Gajaala</div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    gap: 0.75rem;
    background: rgba(10, 4, 0, 0.8);
    z-index: 1000;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--pg-gold);
    border-radius: 999px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
