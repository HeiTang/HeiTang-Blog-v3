/** Places settle left to right; each lower place keeps cycling until the place to its left has settled. */
export function splitFlapStops(value: string): number[] {
  if (!/^\d+$/.test(value)) throw new Error('Split-flap value must contain only digits');
  const stops = Array<number>(value.length);
  let minimum = 10;
  for (let index = 0; index < value.length; index += 1) {
    stops[index] = minimum + ((Number(value[index]) - minimum % 10 + 10) % 10);
    minimum = stops[index] + 3;
  }
  return stops;
}

export const SPLIT_FLAP_DURATION = 1800;

export function splitFlapFrame(stops: number[], elapsed: number): Array<{
  value: number;
  next: number;
  phase: number;
}> {
  const position = Math.min(Math.max(elapsed / SPLIT_FLAP_DURATION, 0), 1) * stops.at(-1)!;
  return stops.map(stop => {
    const step = Math.min(Math.floor(position), stop);
    return {
      value: step % 10,
      next: Math.min(step + 1, stop) % 10,
      phase: position >= stop ? 1 : position - step,
    };
  });
}
