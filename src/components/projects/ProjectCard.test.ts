import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

test('project cards optimize local assets without serializing image metadata', async () => {
  const [source, types, site] = await Promise.all([
    readFile(new URL('./ProjectCard.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../types/projects.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../config/site.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /import \{ Picture, getImage \} from 'astro:assets';/);
  assert.match(source, /typeof cover === 'string'/);
  assert.match(source, /cover: coverUrl/);
  assert.match(source, /screenshots,/);
  assert.match(source, /widths=\{\[320, 640, 960\]\}/);
  assert.match(source, /sizes="\(max-width: 640px\) calc\(100vw - 3rem\), \(max-width: 1024px\) 45vw, 30vw"/);
  assert.match(types, /export type ProjectAsset = string \| ImageMetadata;/);
  assert.match(site, /import fxPulseHome from '\.\.\/assets\/projects\/fx-pulse\/home\.png';/);
  assert.doesNotMatch(site, /'\/images\/projects\//);
});


test('modal images preserve URL assets and cap local WebP width without upscaling', async () => {
  const source = await readFile(new URL('./ProjectCard.astro', import.meta.url), 'utf8');
  const resolver = source.slice(source.indexOf('const resolveAssetUrl ='), source.indexOf('const coverUrl ='));
  const calls: { width: number; format: string; quality: number }[] = [];
  const resolveAssetUrl = runInNewContext(stripTypeScriptTypes(resolver) + '\nresolveAssetUrl;', {
    getImage: async (options: { width: number; format: string; quality: number }) => {
      calls.push(options);
      return { src: '/_astro/optimized.webp' };
    },
  });
  assert.equal(await resolveAssetUrl('https://example.com/image.png'), 'https://example.com/image.png');
  assert.equal(await resolveAssetUrl('/images/legacy.png'), '/images/legacy.png');
  assert.equal(calls.length, 0);
  for (const width of [2784, 800]) {
    assert.equal(await resolveAssetUrl({ src: '/source.png', width }), '/_astro/optimized.webp');
  }
  assert.deepEqual(calls.map(({ width }) => width), [1600, 800]);
  assert.ok(calls.every(({ format, quality }) => format === 'webp' && quality === 85));
});
