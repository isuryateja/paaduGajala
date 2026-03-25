<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import AppFooter from '../components/layout/AppFooter.svelte';
  import AppHeader from '../components/layout/AppHeader.svelte';
  import NotationInputCard from '../components/notation/NotationInputCard.svelte';
  import ParsedNotationCard from '../components/notation/ParsedNotationCard.svelte';
  import StatisticsCard from '../components/notation/StatisticsCard.svelte';
  import PlaybackControlsCard from '../components/playback/PlaybackControlsCard.svelte';
  import SettingsCard from '../components/playback/SettingsCard.svelte';
  import { bootstrapApp } from '../app/services/app-bootstrap';
  import { createMainPlayerViewModel, mainPlayerHandlers } from '../app/services/main-player-page';
  import { notationStore } from '../app/stores/notation.store';
  import { playbackStore } from '../app/stores/playback.store';
  import { settingsStore } from '../app/stores/settings.store';
  import { uiStore } from '../app/stores/ui.store';
  import PianoCard from '../components/piano/PianoCard.svelte';

  let teardown = () => {};

  onMount(() => {
    teardown = bootstrapApp();
  });

  onDestroy(() => {
    teardown();
  });

  $: viewModel = createMainPlayerViewModel($notationStore, $settingsStore);
</script>

<div class="page-shell">
  <AppHeader />

  <div class="grid">
    <div class="primary">
      <NotationInputCard
        value={$notationStore.rawText}
        statusText={$uiStore.status.text}
        statusTone={$uiStore.status.tone}
        parsedInfo={viewModel.parsedInfo}
        onInput={(value) => mainPlayerHandlers.setNotationText(value)}
        onParse={mainPlayerHandlers.parseCurrentNotation}
        onLoadExample={() => void mainPlayerHandlers.loadExampleNotation()}
        onFileChange={(event) => void mainPlayerHandlers.handleNotationFileSelection(event)}
        onClear={mainPlayerHandlers.clearNotation}
      />
      <PianoCard />
      <ParsedNotationCard nodes={$notationStore.parsed} highlightedIndex={$playbackStore.currentIndex} />
    </div>

    <div class="secondary">
      <PlaybackControlsCard
        playing={$playbackStore.status === 'playing'}
        paused={$playbackStore.status === 'paused'}
        tempo={$settingsStore.tempo}
        volume={Math.round($settingsStore.volume * 100)}
        onPlay={() => void mainPlayerHandlers.startPlayback()}
        onPause={mainPlayerHandlers.pausePlayback}
        onStop={mainPlayerHandlers.stopPlayback}
        onTempo={mainPlayerHandlers.updateTempo}
        onVolume={(value) => mainPlayerHandlers.updateVolume(value / 100)}
      />
      <SettingsCard
        waveform={$settingsStore.waveform}
        tuning={$settingsStore.tuning}
        preset={$settingsStore.preset}
        onWaveform={(value) => mainPlayerHandlers.updateWaveform(value as typeof $settingsStore.waveform)}
        onTuning={(value) => mainPlayerHandlers.updateTuning(value as typeof $settingsStore.tuning)}
        onPreset={mainPlayerHandlers.applyPreset}
      />
      <StatisticsCard notes={viewModel.noteCount} lines={viewModel.lineCount} duration={viewModel.duration} octaves={viewModel.octaveCount} />
    </div>
  </div>

  <AppFooter />
</div>

<style>
  .grid {
    display: grid;
    gap: 1rem;
  }

  .primary,
  .secondary {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 960px) {
    .grid {
      grid-template-columns: 1.6fr 1fr;
      align-items: start;
    }
  }
</style>
