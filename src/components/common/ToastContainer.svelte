<script lang="ts">
  import { dismissToast } from '../../app/stores/ui.store';
  import type { ToastMessage } from '../../domain/shared/types';

  export let toasts: ToastMessage[] = [];

  const scheduled = new Set<string>();

  $: {
    for (const toast of toasts) {
      if (!scheduled.has(toast.id)) {
        scheduled.add(toast.id);
        setTimeout(() => {
          dismissToast(toast.id);
          scheduled.delete(toast.id);
        }, 3000);
      }
    }
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class={`toast ${toast.type}`}>{toast.message}</div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: grid;
    gap: 0.5rem;
    z-index: 1100;
  }

  .toast {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    color: #fff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  }

  .success { background: var(--pg-success); }
  .error { background: var(--pg-error); }
  .warning { background: var(--pg-warning); color: #1f1400; }
  .info { background: var(--pg-info); }
</style>
