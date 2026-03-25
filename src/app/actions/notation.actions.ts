import { get } from 'svelte/store';
import { getNotationStats } from '../../domain/notation/notation.stats';
import { parseNotation, parseSvarasOnly } from '../../domain/notation/notation.parser';
import { validateNotation } from '../../domain/notation/notation.validation';
import { notationStore } from '../stores/notation.store';
import { pushToast, setStatus } from '../stores/ui.store';
import { readTextFile } from '../../infra/browser/file-reader';

const FALLBACK_EXAMPLE = `S     S     R1    R1    |     G1    G1    |     M1    M1    ||
R1    R1    G1    G1    |     M1    M1    |     P     P     ||
G     G     M1    M1    |     P     P     |     D1    D1    ||`;

export function setNotationText(rawText: string, source: 'manual' | 'example' | 'file' = 'manual'): void {
  notationStore.update((state) => ({ ...state, rawText, source }));
}

export function clearNotation(): void {
  notationStore.set({
    source: 'manual',
    rawText: '',
    parsed: [],
    validation: null,
    stats: null
  });
  setStatus({ tone: 'ready', text: 'Ready' });
  pushToast('All cleared', 'info');
}

export function parseCurrentNotation(): void {
  const { rawText } = get(notationStore);
  if (!rawText.trim()) {
    setStatus({ tone: 'warning', text: 'Please enter notation first' });
    pushToast('Please enter notation first', 'warning');
    return;
  }

  const validation = validateNotation(rawText);
  if (!validation.valid) {
    notationStore.update((state) => ({
      ...state,
      parsed: [],
      validation,
      stats: null
    }));
    setStatus({ tone: 'error', text: 'Invalid notation' });
    pushToast(`Invalid notation: ${validation.issues[0]?.message ?? 'Unknown validation issue'}`, 'error');
    return;
  }

  const svaras = parseSvarasOnly(rawText);
  if (svaras.length === 0) {
    notationStore.update((state) => ({
      ...state,
      parsed: [],
      validation,
      stats: null
    }));
    setStatus({ tone: 'warning', text: 'No valid svaras found' });
    pushToast('No valid svaras found in notation', 'warning');
    return;
  }

  const parsed = parseNotation(rawText);
  const stats = getNotationStats(rawText);

  notationStore.update((state) => ({ ...state, parsed, validation, stats }));
  setStatus({ tone: 'success', text: 'Parsed' });
  pushToast(`Parsed ${stats.totalNotes} notes successfully`, 'success');
}

export async function loadNotationFile(file: File): Promise<void> {
  const rawText = await readTextFile(file);
  setNotationText(rawText, 'file');
  pushToast(`Loaded "${file.name}"`, 'success');
  parseCurrentNotation();
}

export async function loadExampleNotation(): Promise<void> {
  try {
    const response = await fetch('/example.txt', { cache: 'no-store' });
    const exampleText = response.ok ? (await response.text()).trim() : FALLBACK_EXAMPLE;
    setNotationText(exampleText || FALLBACK_EXAMPLE, 'example');
  } catch {
    setNotationText(FALLBACK_EXAMPLE, 'example');
  }

  pushToast('Example notation loaded', 'success');
  parseCurrentNotation();
}
