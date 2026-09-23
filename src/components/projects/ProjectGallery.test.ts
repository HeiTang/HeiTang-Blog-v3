import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

test('gallery keeps captions and URL assets, caps local images without upscaling', async () => {
  const source = await readFile(new URL('./ProjectGallery.astro', import.meta.url), 'utf8');
  const expression = source.slice(source.indexOf('const images ='), source.indexOf('\n---', 4));
  const calls: { width: number; format: string }[] = [];
  const images = await runInNewContext(`(async () => { ${expression}; return images; })()`, {
    title: '作品',
    screenshots: ['https://example.com/image.png', { src: { width: 2784 }, caption: '首頁' }, { src: { width: 800 } }],
    getImage: async (options: { width: number; format: string }) => {
      calls.push(options);
      return { src: '/optimized.webp', attributes: { width: options.width, height: 500 } };
    },
  });
  assert.equal(images[0].src, 'https://example.com/image.png');
  assert.equal(images[0].caption, '作品');
  assert.equal(images[1].caption, '首頁');
  assert.equal(images[2].caption, '作品');
  assert.deepEqual(calls.map(call => call.width), [1600, 800]);
  assert.ok(calls.every(call => call.format === 'webp'));
});
