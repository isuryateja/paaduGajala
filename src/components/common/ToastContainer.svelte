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
    gap: 0.65rem;
    z-index: 1100;
  }

  .toast {
    min-width: min(22rem, calc(100vw - 2rem));
    padding: 0.95rem 1rem;
    border-radius: 1rem;
    color: var(--text-inverse);
    box-shadow: 0 14px 28px rgba(31, 42, 48, 0.18);
    font-weight: 700;
  }

  .success { background: var(--success); }
  .error { background: var(--error); }
  .warning { background: var(--warning); }
  .info { background: var(--info); }
</style>
