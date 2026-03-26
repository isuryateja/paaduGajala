import { describe, expect, it } from 'vitest';
import { getVisualizerMedia } from '../../app/services/visualizer-state';

describe('visualizer state', () => {
  it('shows the onload gif when the page is idle', () => {
    expect(getVisualizerMedia('ready', { tone: 'ready', text: 'Ready' }).src).toBe('/gifs/onload.gif');
  });

  it('shows the playing gif during playback', () => {
    expect(getVisualizerMedia('playing', { tone: 'info', text: 'Playing' }).src).toBe('/gifs/playing.gif');
  });

  it('shows the pause gif while playback is paused', () => {
    expect(getVisualizerMedia('paused', { tone: 'info', text: 'Paused' }).src).toBe('/gifs/on_pause.gif');
  });

  it('shows the parse error gif when playback is requested before parsing', () => {
    expect(getVisualizerMedia('ready', { tone: 'warning', text: 'Parse notation before playback' }).src).toBe('/gifs/parse_error.gif');
  });

  it('shows the parse error gif for invalid notation', () => {
    expect(getVisualizerMedia('ready', { tone: 'error', text: 'Invalid notation' }).src).toBe('/gifs/parse_error.gif');
  });
});
