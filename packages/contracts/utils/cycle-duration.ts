export function getCycleDuration(duration: number): number {
  if (duration === 0) {
    return 60 * 60 * 24;
  }

  if (duration === 1) {
    return 7 * 60 * 60 * 24;
  }

  if (duration === 2) {
    return 30 * 60 * 60 * 24;
  }

  if (duration === 3) {
    return 90 * 60 * 60 * 24;
  }

  return 365 * 60 * 60 * 24;
}
