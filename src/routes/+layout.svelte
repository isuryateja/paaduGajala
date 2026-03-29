<script lang="ts">
  import LoadingOverlay from '../components/layout/LoadingOverlay.svelte';
  import ToastContainer from '../components/common/ToastContainer.svelte';
  import { uiStore } from '../app/stores/ui.store';
  import '../styles/global.css';
</script>

<LoadingOverlay visible={$uiStore.loading} />
<ToastContainer toasts={$uiStore.toasts} />
<slot />
