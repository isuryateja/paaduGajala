<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import AppFooter from '../../components/layout/AppFooter.svelte';
  import AppHeader from '../../components/layout/AppHeader.svelte';
  import PianoCard from '../../components/piano/PianoCard.svelte';
  import { createPianoPageController } from '../../app/services/piano-page';

  const controller = createPianoPageController();
  let activeKeys = new Set<string>();
  let teardown = () => {};

  onMount(() => {
    const unsubscribe = controller.activeKeys.subscribe((value) => {
      activeKeys = value;
    });
    teardown = controller.mount();
    return unsubscribe;
  });

  onDestroy(() => {
    teardown();
  });
</script>

<div class="page-shell">
  <AppHeader />
  <PianoCard
    title="Standalone Virtual Piano"
    subtitle="Click, tap, or use the keyboard map: A W S E D F T G Y H U J for octave 1 and K O L P ; ' ] \\ for octave 2."
    {activeKeys}
  />
  <AppFooter />
</div>
