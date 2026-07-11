import assert from 'node:assert/strict';
import test from 'node:test';

import { japanLevelLabels, japanPrefectures } from './japan.ts';

test('Japan dataset stays complete and levels stay within 0–5', () => {
  assert.equal(japanPrefectures.length, 47);
  assert.equal(new Set(japanPrefectures.map(prefecture => prefecture.id)).size, 47);
  assert.equal(japanLevelLabels.length, 6);
  assert.ok(
    japanPrefectures.every(
      prefecture => Number.isInteger(prefecture.level) && prefecture.level >= 0 && prefecture.level <= 5,
    ),
  );
});
