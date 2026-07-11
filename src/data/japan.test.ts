import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { japanLevelLabels, japanPrefectures, japanScore } from './japan.ts';

test('Japan dataset stays complete and levels stay within 0–5', () => {
  assert.equal(japanPrefectures.length, 47);
  assert.equal(new Set(japanPrefectures.map(prefecture => prefecture.id)).size, 47);
  assert.equal(japanLevelLabels.length, 6);
  assert.equal(japanScore, japanPrefectures.reduce((total, prefecture) => total + prefecture.level, 0));
  assert.ok(
    japanPrefectures.every(
      prefecture => Number.isInteger(prefecture.level) && prefecture.level >= 0 && prefecture.level <= 5,
    ),
  );
});

test('level legend content stays inside its native details element', async () => {
  const source = await readFile(new URL('../pages/japan/index.astro', import.meta.url), 'utf8');
  const detailsStart = source.indexOf('<details class="legend-toggle">');
  const detailsEnd = source.indexOf('</details>', detailsStart);
  const content = source.indexOf('id="japan-level-legend"', detailsStart);

  assert.ok(detailsStart >= 0 && content > detailsStart && content < detailsEnd);
});

test('score uses per-digit flip tiles and stays on one line', async () => {
  const source = await readFile(new URL('../pages/japan/index.astro', import.meta.url), 'utf8');

  assert.match(source, /data-score-digit/);
  assert.match(source, /const activeDigits = digits\.slice\(index\)/);
  assert.match(source, /white-space:\s*nowrap/);
});
