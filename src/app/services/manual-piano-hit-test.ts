export interface ManualPianoRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ManualPianoKey {
  note: string;
  octave: string;
}

export interface ManualPianoBlackKey extends ManualPianoKey {
  left: number;
}

export interface ResolveManualPianoPointerKeyOptions {
  clientX: number;
  clientY: number;
  keybedRect: ManualPianoRect;
  whiteKeys: ManualPianoKey[];
  blackKeys: ManualPianoBlackKey[];
  blackKeyWidthPercent: number;
  blackKeyHeightPercent: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveManualPianoPointerKey({
  clientX,
  clientY,
  keybedRect,
  whiteKeys,
  blackKeys,
  blackKeyWidthPercent,
  blackKeyHeightPercent
}: ResolveManualPianoPointerKeyOptions): ManualPianoKey | null {
  if (!keybedRect.width || !keybedRect.height || whiteKeys.length === 0) {
    return null;
  }

  const relativeX = clamp(clientX - keybedRect.left, 0, Math.max(keybedRect.width - 1, 0));
  const relativeY = clamp(clientY - keybedRect.top, 0, Math.max(keybedRect.height - 1, 0));
  const xRatio = relativeX / keybedRect.width;
  const yRatio = relativeY / keybedRect.height;
  const blackKeyHalfWidthRatio = blackKeyWidthPercent / 200;
  const blackKeyHeightRatio = blackKeyHeightPercent / 100;

  if (yRatio <= blackKeyHeightRatio) {
    const hitBlackKey = blackKeys.find((key) => Math.abs(xRatio - key.left / 100) <= blackKeyHalfWidthRatio);
    if (hitBlackKey) {
      return hitBlackKey;
    }
  }

  const whiteIndex = clamp(Math.floor(xRatio * whiteKeys.length), 0, whiteKeys.length - 1);
  return whiteKeys[whiteIndex];
}
