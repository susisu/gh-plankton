export function clip(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function cycle(value, min, max) {
  const c = max - min;
  return ((value - min) % c + c) % c + min;
}
