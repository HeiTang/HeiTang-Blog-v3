/** 開獎節奏：每一步翻一張，個位先開，往左每隔 GAP 步再開一位。 */
export const SPLIT_FLAP_STEP_MS = 110;
const FIRST_REVEAL = 12;
const REVEAL_GAP = 6;

export interface SplitFlapPlan {
  targets: number[];
  stops: number[];
  duration: number;
}

export function splitFlapPlan(value: string): SplitFlapPlan {
  if (!/^\d+$/.test(value)) throw new Error('Split-flap value must contain only digits');
  const targets = [...value].map(Number);
  const stops = targets.map((_, index) => FIRST_REVEAL + REVEAL_GAP * (targets.length - 1 - index));
  return { targets, stops, duration: stops[0] * SPLIT_FLAP_STEP_MS };
}

const mod10 = (value: number) => ((value % 10) + 10) % 10;

/** 每一位倒數到自己的目標值，所以滾動時各位顯示不同數字，且剛好在 stop 那一步落定。 */
export function splitFlapFrame({ targets, stops }: SplitFlapPlan, elapsed: number): Array<{
  value: number;
  next: number;
  phase: number;
  settled: boolean;
}> {
  const position = Math.max(elapsed, 0) / SPLIT_FLAP_STEP_MS;
  return stops.map((stop, index) => {
    const step = Math.min(Math.floor(position), stop);
    const value = mod10(targets[index] - (stop - step));
    const settled = position >= stop;
    return {
      value,
      next: settled ? value : mod10(value + 1),
      phase: settled ? 1 : position - step,
      settled,
    };
  });
}
