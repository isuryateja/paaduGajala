export function formatDuration(totalBeats: number, tempo: number): string {
  const totalSeconds = totalBeats * (60 / tempo);
  return `${totalSeconds.toFixed(2)}s`;
}
