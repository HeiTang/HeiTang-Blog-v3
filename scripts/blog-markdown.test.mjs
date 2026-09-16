import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

test('Japan tax article renders emphasis and resolves all internal links', async () => {
  const source = await readFile(new URL('../src/content/blog/japan-tax-refund-2026.md', import.meta.url), 'utf8');
  const processor = await createMarkdownProcessor();
  const { code, metadata } = await processor.render(source.replace(/^---\n[\s\S]*?\n---\n/, ''));
  assert.match(code, /<strong>2026 年 11 月 1 日/);
  assert.ok(!code.includes('**'), 'Unparsed emphasis remains');
  const ids = new Set([...code.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, target] of code.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(target), `Missing citation target: ${target}`);
  }
  for (let number = 1; number <= 4; number++) {
    assert.ok(ids.has(`source-${number}`));
    assert.ok(code.includes(`href="#source-${number}"`));
  }
  const chapters = metadata.headings.filter(heading => heading.depth === 2 || heading.depth === 3);
  assert.ok(chapters.length > 0);
  for (const heading of chapters) assert.ok(ids.has(heading.slug));
});
