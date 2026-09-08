import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('screen message keeps its accessibility and indexing contract', async () => {
  const source = await readFile(new URL('../../pages/sm/index.astro', import.meta.url), 'utf8');

  assert.match(source, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/);
  assert.doesNotMatch(source, /user-scalable|maximum-scale/);
  assert.match(source, /<meta name="robots" content="noindex, follow" \/>/);
  assert.match(source, /<label for="textarea" class="sm-visually-hidden">畫面訊息內容<\/label>/);
  assert.match(source, /\.sm-visually-hidden\s*\{/);
  assert.match(source, /html,\s*body\s*\{[\s\S]*?overflow: hidden;/);
  assert.match(source, /#textarea\s*\{[\s\S]*?box-sizing: border-box;/);
  assert.match(source, /<script is:inline>/);
  assert.match(source, /<textarea id="textarea" onkeyup="adjust\(\)" onpaste="adjust\(\)" oninput="adjust\(\)">ฅ•ω•ฅ<\/textarea>/);
  assert.match(source, /test\.textContent = ta\.value;/);
  assert.match(source, /if \(params\.t\) ta\.value = params\.t;/);
  assert.match(source, /if \(params\.f\) ta\.style\.color = params\.f;/);
  assert.match(source, /if \(params\.b\) ta\.style\.backgroundColor = params\.b;/);
  assert.match(source, /window\.location\.hash = href;/);
  assert.match(source, /window\.addEventListener\('resize', adjust\);/);
  assert.match(source, /window\.addEventListener\('hashchange', parseHash\);/);
});
