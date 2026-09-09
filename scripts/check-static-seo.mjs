import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dist = new URL('../dist/', import.meta.url);
const site = new URL('https://purr.tw/');
const outputFiles = new Set((await readdir(dist, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => relative(fileURLToPath(dist), join(entry.parentPath, entry.name))));
const htmlFiles = [...outputFiles].filter(file => file.endsWith('.html'));
const decodeAttribute = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code[0] === '#') {
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd';
  }
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()];
});
const attributes = tag => Object.fromEntries(
  [...tag.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map(([, name, double, single, unquoted]) => [name.toLowerCase(), decodeAttribute(double ?? single ?? unquoted)])
);

let internalLinks = 0;
function checkPageLink(href, base, source) {
  const url = new URL(href, base);
  if (url.origin !== site.origin) return;
  const file = decodeURIComponent(url.pathname.slice(1));
  // Files such as RSS, licenses and downloads keep their actual names.
  if (outputFiles.has(file) && file !== 'index.html' && !file.endsWith('/index.html')) return;
  assert.ok(url.pathname.endsWith('/'), `${source}: ${href} must link directly to a trailing-slash page URL`);
  internalLinks++;
}

for (const file of htmlFiles) {
  const base = new URL(file.replace(/index\.html$/, ''), site);
  const html = (await readFile(new URL(file, dist), 'utf8'))
    .replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const tags = [...html.matchAll(/<[a-z][\w:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
  for (const [tag] of tags) {
    const attrs = attributes(tag);
    if (/^<(a|area)\b/i.test(tag) && attrs.href !== undefined && !attrs.href.startsWith('#')) {
      checkPageLink(attrs.href, base, file);
    }
    // Modal links are serialized in HTML before client-side rendering.
    if (attrs['data-project']) {
      const project = JSON.parse(attrs['data-project']);
      for (const key of ['url', 'homepageUrl', 'blogPost']) {
        if (project[key]) checkPageLink(project[key], base, `${file} project ${project.name}.${key}`);
      }
    }
  }
  const activeRoute = base.pathname.startsWith('/blog/') ? '/blog/' : base.pathname;
  if (['/about/', '/blog/', '/projects/', '/invite-codes/', '/japan/', '/concerts/'].includes(activeRoute)) {
    const currentLinks = tags.filter(([tag]) => /^<a\b/i.test(tag))
      .map(([tag]) => attributes(tag)).filter(attrs => attrs['aria-current'] === 'page');
    assert.equal(currentLinks.filter(attrs => attrs.href === activeRoute).length, 2,
      `${file}: desktop and mobile navigation must retain the active page`);
  }
}
console.log(`Trailing-slash checks passed: ${internalLinks} links across ${htmlFiles.length} HTML files.`);

const legacyEnglishRedirects = [
  ['en/index.html', '/'],
  ['en/about/index.html', '/about/'],
  ['en/blog/index.html', '/blog/'],
  ['en/projects/index.html', '/projects/'],
  ['en/invite-codes/index.html', '/invite-codes/'],
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
  const socialImage = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  assert.ok(socialImage?.startsWith(`https://purr.tw/_astro/${route}.`), `${route}: missing imported OG image`);
  assert.ok(html.includes(`<meta name="twitter:image" content="${socialImage}">`));

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

  for (const href of ['/about/', '/japan/', '/concerts/']) {
    assert.ok(html.includes(`href="${href}"`), `/${route}/ header must link to ${href}`);
  }

  const png = await readFile(new URL(new URL(socialImage).pathname.slice(1), dist));
  assert.deepEqual(png, await readFile(new URL(`../src/assets/og/${image}`, import.meta.url)));
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
const defaultSocialImage = homeHtml.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
assert.ok(defaultSocialImage?.startsWith('https://purr.tw/_astro/default.'), 'home must use the imported default OG image');
assert.ok(homeHtml.includes(`<meta name="twitter:image" content="${defaultSocialImage}">`));
assert.deepEqual(await readFile(new URL(new URL(defaultSocialImage).pathname.slice(1), dist)),
  await readFile(new URL('../src/assets/og/default.png', import.meta.url)));
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

// G7: the five priority pages must keep distinct, publicly available share images.
for (const route of [
  'blog/astro-personal-website',
  'blog/github-actions-deploy',
  'blog/google-sheets-json-api',
  'projects',
  'invite-codes',
]) {
  const html = await readFile(new URL(`${route}/index.html`, dist), 'utf8');
  const url = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  assert.ok(url, `${route}: missing OG image`);
  const asset = new URL(url);
  assert.equal(asset.origin, site.origin);
  const path = asset.pathname.slice(1);
  assert.ok(path.startsWith(`_astro/${route.split('/').at(-1)}.`), `${route}: wrong imported OG image`);
  assert.ok(html.includes(`<meta name="twitter:image" content="${url}">`), `${route}: wrong Twitter image`);
  if (route.startsWith('blog/')) assert.ok(html.includes(`"image":"${url}"`), `${route}: missing schema image`);
  const image = await readFile(new URL(path, dist));
  const metadata = await sharp(image).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.ok(image.length < 200_000, `${path}: exceeds 200 KB budget`);
}

const faviconPath = homeHtml.match(/<link rel="icon"[^>]*href="([^"]+)"/)?.[1];
const logoPath = homeHtml.match(/<img src="([^" ]*\/logo-72\.[^" ]+\.webp)"/)?.[1];
const stillPath = homeHtml.match(/media="\(prefers-reduced-motion: reduce\)" srcset="([^"]+)"/)?.[1];
for (const [path, name, size, budget] of [
  [faviconPath, 'favicon-32', 32, 3_000],
  [logoPath, 'logo-72', 72, 32_000],
  [stillPath, 'logo-72-still', 72, 8_000],
]) {
  assert.ok(path?.startsWith(`/_astro/${name}.`), `${name}: missing imported icon`);
  const image = await readFile(new URL(path.slice(1), dist));
  const metadata = await sharp(image).metadata();
  assert.equal(metadata.format, path.endsWith('.webp') ? 'webp' : 'png');
  assert.equal(metadata.width, size);
  assert.equal(metadata.height, size);
  assert.ok(image.length < budget, `${path}: exceeds icon size budget`);
}
const animatedIcon = await sharp(await readFile(new URL(logoPath.slice(1), dist)), { animated: true }).metadata();
assert.equal(animatedIcon.pages, 20, 'Header logo must retain its animation');
assert.equal(animatedIcon.loop, 0, 'Header logo must keep looping');
assert.deepEqual(animatedIcon.delay, Array(20).fill(50), 'Header logo must retain its frame timings');
for (const file of htmlFiles) {
  const html = await readFile(new URL(file, dist), 'utf8');
  if (!html.includes('class="site-header ')) continue;
  assert.ok(html.includes(`sizes="32x32" href="${faviconPath}"`), `${file}: wrong favicon`);
  assert.ok(html.includes(`src="${logoPath}"`), `${file}: wrong Header logo`);
  assert.ok(html.includes(`media="(prefers-reduced-motion: reduce)" srcset="${stillPath}"`));
  assert.doesNotMatch(html, /(?:href|src|content)="(?:https:\/\/purr\.tw)?(?:\/favicon\.(?:svg|ico)|\/images\/icon\.png|\/images\/og\/(?:concerts|default|japan)\.(?:png|svg))"/);
}

console.log('Static SEO and public-output checks passed.');
