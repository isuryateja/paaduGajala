export type OctaveName = 'mandra' | 'mandara' | 'madhya' | 'taara';
export type TuningMode = 'equal' | 'just';
export type WaveformType = 'sine' | 'triangle' | 'sawtooth' | 'square';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type PlaybackStatus = 'ready' | 'parsed' | 'playing' | 'paused';
export type Teardown = () => void;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface StatusState {
  tone: ToastType | 'ready';
  text: string;
}
