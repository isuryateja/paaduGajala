import type { StatusState, PlaybackStatus } from '../../domain/shared/types';

export interface VisualizerMedia {
  src: string;
  alt: string;
}

const ONLOAD_MEDIA: VisualizerMedia = {
  src: '/gifs/onload.gif',
  alt: 'Rhythmic Sync idle visualizer'
};

const PLAYING_MEDIA: VisualizerMedia = {
  src: '/gifs/playing.gif',
  alt: 'Rhythmic Sync playback visualizer'
};

const PAUSED_MEDIA: VisualizerMedia = {
  src: '/gifs/on_pause.gif',
  alt: 'Rhythmic Sync paused visualizer'
};

const PARSE_ERROR_MEDIA: VisualizerMedia = {
  src: '/gifs/parse_error.gif',
  alt: 'Rhythmic Sync parse error visualizer'
};

const parseErrorStatusTexts = new Set([
  'parse notation before playback',
  'invalid notation',
  'please enter notation first',
  'no valid svaras found'
]);

export function getVisualizerMedia(playbackStatus: PlaybackStatus, status: StatusState | null | undefined): VisualizerMedia {
  if (playbackStatus === 'playing') {
    return PLAYING_MEDIA;
  }

  if (playbackStatus === 'paused') {
    return PAUSED_MEDIA;
  }

  const normalizedStatusText = status?.text.trim().toLowerCase() ?? '';
  if (status?.tone === 'error' || parseErrorStatusTexts.has(normalizedStatusText)) {
    return PARSE_ERROR_MEDIA;
  }

  return ONLOAD_MEDIA;
}
