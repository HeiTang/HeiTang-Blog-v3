import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { renderMap } from 'japan-prefecture-map/render';

import { japanLevelLabels, japanPrefectureLevels, japanPrefectures, japanScore, japanStats } from './japan.ts';

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
  assert.deepEqual(japanStats, { score: 82, total: 47, visited: 25, stayed: 13, lived: 1 });
  assert.deepEqual(
    {
      visited: japanPrefectures.filter(prefecture => prefecture.level > 0).length,
      stayed: japanPrefectures.filter(prefecture => prefecture.level >= 4).length,
      lived: japanPrefectures.filter(prefecture => prefecture.level === 5).length,
    },
    { visited: japanStats.visited, stayed: japanStats.stayed, lived: japanStats.lived },
  );
});

test('Japan page renders the SSR SVG with the personal levels', async () => {
  const source = await readFile(new URL('../pages/japan/index.astro', import.meta.url), 'utf8');

  assert.match(source, /import \{ mapStyles, renderMap \} from 'japan-prefecture-map\/render';/);
  assert.match(source, /<style is:inline set:html=\{mapStyles\}><\/style>/);
  assert.match(source, /set:html=\{renderMap\(japanPrefectureLevels, 'zh-TW'\)\}/);
  assert.match(source, /data-japan-score=\{japanScore\}/);
  assert.match(source, /japanScoreDigits\.map/);
  assert.doesNotMatch(source, /<japan-prefecture-map/);
  assert.doesNotMatch(source, /customElements\.whenDefined/);
  assert.doesNotMatch(source, /JapanPrefectureMap\.astro/);

  assert.match(renderMap(japanPrefectureLevels, 'zh-TW'), /<svg class="japan-map"/);
});
