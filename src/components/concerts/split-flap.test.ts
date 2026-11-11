import assert from 'node:assert/strict';
import test from 'node:test';
import { splitFlapStops, splitFlapFrame, SPLIT_FLAP_DURATION } from './split-flap.ts';

test('settles from the highest place to the units while every unfinished digit keeps cycling', () => {
  for (const value of ['0', '10000', '123456', '90909']) {
    const stops = splitFlapStops(value);
    assert.ok(stops[0] >= 10);
    assert.equal(stops.map(step => step % 10).join(''), value);
    for (let index = 1; index < stops.length; index += 1) {
      assert.ok(stops[index] >= stops[index - 1] + 3);
    }
    for (let step = 1; step <= stops.at(-1)!; step += 1) {
      const previous = stops.map(stop => Math.min(step - 1, stop) % 10);
      const current = stops.map(stop => Math.min(step, stop) % 10);
      stops.forEach((stop, index) => {
        assert.equal(current[index] !== previous[index], step <= stop);
      });
    }
  }
  assert.throws(() => splitFlapStops('1,234'));
});

test('one shared timeline finishes every digit within two seconds, including long amounts', () => {
  assert.ok(SPLIT_FLAP_DURATION < 2000);
  for (const value of ['0', '9970', '123456', '100000000000']) {
    const stops = splitFlapStops(value);
    const last = stops.at(-1)!;
    assert.deepEqual(splitFlapFrame(stops, 0).map(frame => frame.value), [...value].map(() => 0));
    for (let index = 0; index < stops.length; index += 1) {
      const time = stops[index] / last * SPLIT_FLAP_DURATION + 0.001;
      const frames = splitFlapFrame(stops, time);
      assert.equal(frames[index].value, Number(value[index]));
      assert.equal(frames[index].phase, 1);
      if (index < stops.length - 1) assert.ok(frames[index + 1].phase < 1);
    }
    for (const time of [SPLIT_FLAP_DURATION, 2000, 3000]) {
      assert.equal(splitFlapFrame(stops, time).map(frame => frame.value).join(''), value);
      assert.ok(splitFlapFrame(stops, time).every(frame => frame.phase === 1));
    }
  }
});
