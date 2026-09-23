import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const index = await readFile(new URL('projects/index.html', root), 'utf8');
const schemas = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const collection = schemas.find(schema => schema['@type'] === 'CollectionPage');
assert.ok(collection, 'Index must have CollectionPage metadata');
const entries = collection.mainEntity.itemListElement;
assert.ok(entries.length > 0);
assert.equal(new Set(entries.map(entry => entry.url)).size, entries.length, 'Project slugs must be unique');
assert.doesNotMatch(index, /data-project="|pm-overlay/, 'Project cards must link to pages instead of modals');
const sitemap = await readFile(new URL('sitemap-0.xml', root), 'utf8');
for (const entry of entries) {
  const path = new URL(entry.url).pathname;
  assert.match(path, /^\/projects\/[a-z0-9-]+\/$/);
  assert.ok(index.includes(`href="${path}"`), `Missing index link: ${path}`);
  const html = await readFile(new URL(`${path.slice(1)}index.html`, root), 'utf8');
  assert.ok(html.includes(`href="${entry.url}"`), `Missing canonical: ${path}`);
  assert.ok(sitemap.includes(`<loc>${entry.url}</loc>`), `Missing sitemap entry: ${path}`);
  assert.match(html, /data-pagefind-body/);
  assert.match(html, /"@type":"CreativeWork"/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.ok(html.includes(entry.name), `Missing visible title: ${path}`);
  for (const match of html.matchAll(/data-image="([^"]+)"/g)) {
    if (match[1].startsWith('/_astro/')) {
      assert.ok(match[1].endsWith('.webp'), `Gallery must use WebP: ${path}`);
      await access(new URL(match[1].slice(1), root));
    }
  }
}
console.log(`Project pages passed: ${entries.length} unique routes, index links, metadata, sitemap and gallery assets.`);
