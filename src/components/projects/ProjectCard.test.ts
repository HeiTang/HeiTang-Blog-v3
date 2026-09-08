import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('project cards optimize local assets without serializing image metadata', async () => {
  const [source, types, site] = await Promise.all([
    readFile(new URL('./ProjectCard.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../types/projects.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../config/site.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /import \{ Picture \} from 'astro:assets';/);
  assert.match(source, /typeof cover === 'string'/);
  assert.match(source, /cover: coverUrl/);
  assert.match(source, /screenshots,/);
  assert.match(source, /widths=\{\[320, 640, 960\]\}/);
  assert.match(source, /sizes="\(max-width: 640px\) calc\(100vw - 3rem\), \(max-width: 1024px\) 45vw, 30vw"/);
  assert.match(types, /export type ProjectAsset = string \| ImageMetadata;/);
  assert.match(site, /import fxPulseHome from '\.\.\/assets\/projects\/fx-pulse\/home\.png';/);
  assert.doesNotMatch(site, /'\/images\/projects\//);
});
