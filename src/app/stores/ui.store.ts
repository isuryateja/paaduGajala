import { writable } from 'svelte/store';
import { DEFAULT_STATUS_STATE } from '../../domain/shared/constants';
import type { StatusState, ToastMessage } from '../../domain/shared/types';
import { createId } from '../../lib/ids/create-id';

export interface UiState {
  loading: boolean;
  status: StatusState;
  toasts: ToastMessage[];
}

const initialState: UiState = {
  loading: false,
  status: DEFAULT_STATUS_STATE,
  toasts: []
};

export const uiStore = writable<UiState>(initialState);

export function setLoading(loading: boolean): void {
  uiStore.update((state) => ({ ...state, loading }));
}

export function setStatus(status: StatusState): void {
  uiStore.update((state) => ({ ...state, status }));
}

export function pushToast(message: string, type: ToastMessage['type'] = 'info'): void {
  uiStore.update((state) => ({
    ...state,
    toasts: [...state.toasts, { id: createId('toast'), message, type }]
  }));
}

export function dismissToast(id: string): void {
  uiStore.update((state) => ({
    ...state,
    toasts: state.toasts.filter((toast) => toast.id !== id)
  }));
}
