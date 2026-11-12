import assert from 'node:assert/strict';
import test from 'node:test';
import { splitFlapPlan, splitFlapFrame, SPLIT_FLAP_STEP_MS } from './split-flap.ts';

test('reveals from the units place leftward, one digit at a time', () => {
  for (const value of ['0', '38800', '123456', '90909']) {
    const plan = splitFlapPlan(value);
    assert.equal(plan.duration, plan.stops[0] * SPLIT_FLAP_STEP_MS);
    for (let index = 0; index < plan.stops.length - 1; index += 1) {
      assert.ok(plan.stops[index] > plan.stops[index + 1]);
    }
    for (let index = plan.stops.length - 1; index >= 0; index -= 1) {
      const frames = splitFlapFrame(plan, plan.stops[index] * SPLIT_FLAP_STEP_MS);
      assert.equal(frames[index].value, Number(value[index]));
      assert.ok(frames[index].settled);
      if (index > 0) assert.ok(!frames[index - 1].settled);
      const before = splitFlapFrame(plan, plan.stops[index] * SPLIT_FLAP_STEP_MS - 1);
      assert.ok(!before[index].settled);
    }
  }
  assert.throws(() => splitFlapPlan('1,234'));
});

test('unsettled digits keep flipping every step and land on the exact target', () => {
  const plan = splitFlapPlan('38800');
  for (let step = 0; step < plan.stops[0]; step += 1) {
    const frames = splitFlapFrame(plan, step * SPLIT_FLAP_STEP_MS);
    const later = splitFlapFrame(plan, (step + 1) * SPLIT_FLAP_STEP_MS);
    frames.forEach((frame, index) => {
      if (frame.settled) assert.equal(later[index].value, frame.value);
      else assert.equal(later[index].value, frame.next);
    });
  }
  assert.equal(splitFlapFrame(plan, plan.duration).map(frame => frame.value).join(''), '38800');
  assert.equal(splitFlapFrame(plan, plan.duration * 3).map(frame => frame.value).join(''), '38800');
});
