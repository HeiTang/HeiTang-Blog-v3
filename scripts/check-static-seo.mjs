import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const pages = [
  { route: 'japan', image: 'japan.png' },
];

for (const { route, image } of pages) {
  const html = await readFile(new URL(`${route}/index.html`, dist), 'utf8');
  const canonical = `https://purr.tw/${route}/`;
  const socialImage = `https://purr.tw/images/og/${image}`;

  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `/${route}/ must have one h1`);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${canonical}">`));
  assert.ok(html.includes(`<meta property="og:image" content="${socialImage}">`));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  assert.ok(html.includes('<script type="application/ld+json">'));
  assert.ok(html.includes('"@type":"CollectionPage"'));
  assert.ok(html.includes('"@type":"BreadcrumbList"'));
  assert.ok(!html.includes(`/en/${route}/`), `/${route}/ must not link to a missing translation`);

  for (const href of ['/about', '/japan']) {
    assert.ok(html.includes(`href="${href}"`), `/${route}/ header must link to ${href}`);
  }

  const png = await readFile(new URL(`images/og/${image}`, dist));
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
assert.ok(robots.includes('Sitemap: https://purr.tw/sitemap-index.xml'));

const sitemap = await readFile(new URL('sitemap-0.xml', dist), 'utf8');
assert.ok(sitemap.includes('<loc>https://purr.tw/japan/</loc>'));

console.log('Static SEO and public-output checks passed.');
