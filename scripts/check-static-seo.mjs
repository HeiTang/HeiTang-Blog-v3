import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const legacyEnglishRedirects = [
  ['en/index.html', '/'],
  ['en/about/index.html', '/about'],
  ['en/blog/index.html', '/blog'],
  ['en/projects/index.html', '/projects'],
  ['en/invite-codes/index.html', '/invite-codes'],
];
const pages = [
  { route: 'japan', image: 'japan.png' },
  { route: 'concerts', image: 'concerts.png' },
];

for (const [file, destination] of legacyEnglishRedirects) {
  const html = await readFile(new URL(file, dist), 'utf8');
  assert.ok(
    html.includes(`<meta http-equiv="refresh" content="0;url=${destination}">`),
    `/${file} must redirect to ${destination}`
  );
  assert.ok(html.includes('<meta name="robots" content="noindex">'), `/${file} must not be indexed`);
}

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
  assert.ok(!html.includes(`/en/${route}/`), `/${route}/ must not link to an English route`);

  for (const href of ['/about', '/japan', '/concerts']) {
    assert.ok(html.includes(`href="${href}"`), `/${route}/ header must link to ${href}`);
  }

  const png = await readFile(new URL(`images/og/${image}`, dist));
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
}

const concertsHtml = await readFile(new URL('concerts/index.html', dist), 'utf8');
assert.doesNotMatch(concertsHtml, /notion-static\.com|secure\.notion-static\.com|X-Amz-/i);
for (const [imgTag, posterUrl] of concertsHtml.matchAll(
  /<img[^>]*\ssrc="(\/images\/concert-posters\/[^"]+)"[^>]*>/g
)) {
  assert.ok(imgTag.includes('srcset="/images/concert-posters/'), `poster ${posterUrl} missing srcset`);
  await readFile(new URL(posterUrl.slice(1), dist));
}

for (const privateField of ['付款方式', '付款者', '參與者', '單位票價', '實名制', '座位']) {
  assert.ok(!concertsHtml.includes(privateField), `concert output leaked ${privateField}`);
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
assert.ok(robots.includes('Sitemap: https://purr.tw/sitemap-index.xml'));

const homeHtml = await readFile(new URL('index.html', dist), 'utf8');
assert.match(homeHtml, /<html lang="zh-Hant"/);
assert.ok(homeHtml.includes('<meta property="og:locale" content="zh_TW">'));
assert.doesNotMatch(homeHtml, /href="\/en(?:\/|")/);

const sitemap = await readFile(new URL('sitemap-0.xml', dist), 'utf8');
assert.ok(sitemap.includes('<loc>https://purr.tw/japan/</loc>'));
assert.ok(sitemap.includes('<loc>https://purr.tw/concerts/</loc>'));
assert.doesNotMatch(sitemap, /https:\/\/purr\.tw\/en(?:\/|<)/);
assert.doesNotMatch(sitemap, /<loc>https:\/\/purr\.tw\/sm\/<\/loc>/);

const screenMessage = await readFile(new URL('sm/index.html', dist), 'utf8');
assert.ok(screenMessage.includes('<meta name="robots" content="noindex, follow">'));

const descriptions = [];
for (const route of ['about', 'blog', 'projects', 'invite-codes']) {
  const html = await readFile(new URL(`${route}/index.html`, dist), 'utf8');
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
  assert.ok(description, `/${route}/ missing description`);
  descriptions.push(description);
  assert.ok(html.includes(`<meta property="og:description" content="${description}">`));
  assert.ok(html.includes(`<meta name="twitter:description" content="${description}">`));
  assert.notEqual(description, homeHtml.match(/<meta name="description" content="([^"]+)">/)?.[1]);
}
assert.equal(new Set(descriptions).size, descriptions.length, 'page descriptions must be unique');

const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const articleFiles = (await readdir(new URL('blog/', dist), { recursive: true }))
  .filter(file => file.endsWith('/index.html'));
assert.ok(articleFiles.length > 0, 'expected published articles');
for (const file of articleFiles) {
  const html = await readFile(new URL(`blog/${file}`, dist), 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap(match => JSON.parse(match[1]));
  const articles = schemas.filter(schema => schema['@type'] === 'BlogPosting');
  assert.equal(articles.length, 1, `${file} must have one BlogPosting`);
  const article = articles[0];
  assert.equal(article['@context'], 'https://schema.org');
  assert.equal(article.url, canonical);
  assert.equal(article.mainEntityOfPage['@id'], canonical);
  assert.ok(html.includes(`<meta property="og:description" content="${escapeAttribute(article.description)}">`));
  assert.ok(html.includes(`<meta property="og:title" content="${escapeAttribute(article.headline)} | `));
  assert.equal(article.author['@type'], 'Person');
  assert.ok(article.author.name);
  assert.ok(Number.isFinite(Date.parse(article.datePublished)));
  assert.ok(html.includes(`<meta property="article:published_time" content="${article.datePublished}">`));
  assert.equal(article.dateModified, html.match(/<meta property="article:modified_time" content="([^"]+)">/)?.[1]);
  if (article.image) {
    assert.match(article.image, /^https?:\/\//);
    assert.ok(html.includes(`<meta property="og:image" content="${escapeAttribute(article.image)}">`));
  }
  assert.ok(html.includes('data-pagefind-body'));
  const related = html.match(/<nav[^>]*data-related-posts[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  if (related) {
    const links = [...related.matchAll(/<a\b[^>]*\shref="(\/blog\/[^"?#]+\/)"[^>]*>([^<]+)<\/a>/g)];
    assert.ok(links.length > 0, `${file} has an empty related posts section`);
    assert.equal(new Set(links.map(link => link[1])).size, links.length);
    for (const [, href] of links) {
      assert.notEqual(new URL(href, canonical).href, canonical);
      await readFile(new URL(`${href.slice(1)}index.html`, dist));
    }
  }
}

// Existing editorial choices must remain visible in the built article body.
for (const [slug, targets] of [
  ['astro-personal-website', ['github-actions-deploy']],
  ['github-actions-deploy', ['astro-personal-website', 'google-sheets-json-api']],
  ['google-sheets-json-api', ['github-actions-deploy']],
]) {
  const html = await readFile(new URL(`blog/${slug}/index.html`, dist), 'utf8');
  const related = html.match(/<nav[^>]*data-related-posts[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  assert.deepEqual([...related.matchAll(/href="\/blog\/([^"/]+)\/"/g)].map(match => match[1]), targets);
}

console.log('Static SEO and public-output checks passed.');
