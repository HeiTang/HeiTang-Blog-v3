import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('single-column home renders the greeting statically', async () => {
  const source = await readFile(new URL('./pages/HomeContent.astro', import.meta.url), 'utf8');

  assert.match(source, /reduceMotion \|\| window\.matchMedia\('\(max-width: 1100px\)'\)\.matches/);
});
