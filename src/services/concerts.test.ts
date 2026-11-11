import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import sharp from 'sharp';

import { writeConcertPosters } from '../../scripts/sync-concert-posters.ts';
import { concertPosterBaseName, decodeConcertPage, fetchConcerts, getAnnualSpending } from './concerts.ts';

const text = (type: 'title' | 'rich_text', value: string) => ({
  type,
  [type]: [{ plain_text: value }],
});

test('decodes only the approved public concert fields', () => {
  const concert = decodeConcertPage({
    id: 'notion-page-id',
    properties: {
      Name: text('title', '宇多田光 SCIENCE FICTION TOUR'),
      演出日期: { type: 'date', date: { start: '2026-08-15', end: '2026-08-16' } },
      演出地點: text('rich_text', '台北小巨蛋'),
      網址: { type: 'url', url: 'https://example.com/event' },
      購票階段: { type: 'status', status: { name: '購票成功' } },
      海報: {
        type: 'files',
        files: [{ name: 'poster.jpg', type: 'file', file: { url: 'https://notion.example/poster.jpg' } }],
      },
      付款者: text('rich_text', 'PRIVATE PERSON'),
      付款方式: { type: 'select', select: { name: 'PRIVATE CARD' } },
      座位: text('rich_text', 'PRIVATE SEAT'),
    },
  });

  assert.deepEqual(concert, {
    id: 'notion-page-id',
    name: '宇多田光 SCIENCE FICTION TOUR',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    venue: '台北小巨蛋',
    url: 'https://example.com/event',
    imageUrl: '/images/concert-posters/concert-poster-notionpageid-960.webp',
    imageSrcSet:
      '/images/concert-posters/concert-poster-notionpageid-480.webp 480w, /images/concert-posters/concert-poster-notionpageid-960.webp 960w',
  });
  assert.doesNotMatch(JSON.stringify(concert), /PRIVATE/);
});

test('rejects rows that are incomplete or not marked 購票成功', () => {
  const baseProperties = {
    Name: text('title', 'Example Live'),
    演出日期: { type: 'date', date: { start: '2026-09-01' } },
    演出地點: text('rich_text', 'Zepp New Taipei'),
  };

  assert.equal(
    decodeConcertPage({
      id: 'planning',
      properties: {
        ...baseProperties,
        購票階段: { type: 'status', status: { name: '考慮中' } },
      },
    }),
    null,
  );

  assert.equal(
    decodeConcertPage({
      id: 'missing-venue',
      properties: {
        ...baseProperties,
        演出地點: text('rich_text', ''),
        購票階段: { type: 'status', status: { name: '購票成功' } },
      },
    }),
    null,
  );
});

test('allows only http and https links', () => {
  const concert = decodeConcertPage({
    id: 'unsafe-link',
    properties: {
      Name: text('title', 'Example Live'),
      演出日期: { type: 'date', date: { start: '2026-09-01' } },
      演出地點: text('rich_text', 'Zepp New Taipei'),
      購票階段: { type: 'select', select: { name: '購票成功' } },
      網址: { type: 'url', url: 'javascript:alert(1)' },
    },
  });

  assert.ok(concert);
  assert.equal(concert.url, undefined);
  assert.equal(concert.imageUrl, undefined);
});

test('downloads the first Notion poster and creates fixed WebP variants', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'concert-posters-'));
  const outputDir = pathToFileURL(`${directory}/`);
  const source = await sharp({
    create: { width: 300, height: 500, channels: 4, background: '#ff8c61' },
  })
    .png()
    .toBuffer();
  const page = {
    id: 'poster-page-id',
    properties: {
      海報: {
        type: 'files',
        files: [
          { name: 'poster.png', type: 'file', file: { url: 'https://notion.example/poster.png' } },
          { name: 'ignored.png', type: 'external', external: { url: 'https://example.com/ignored.png' } },
        ],
      },
    },
  };

  try {
    const count = await writeConcertPosters([page], {
      outputDir,
      fetchImpl: async () => new Response(source, { status: 200, headers: { 'Content-Type': 'image/png' } }),
    });
    const baseName = concertPosterBaseName(page.id);
    const small = await sharp(await readFile(new URL(`${baseName}-480.webp`, outputDir))).metadata();
    const large = await sharp(await readFile(new URL(`${baseName}-960.webp`, outputDir))).metadata();

    assert.equal(count, 1);
    assert.deepEqual([small.format, small.width, small.height], ['webp', 480, 640]);
    assert.deepEqual([large.format, large.width, large.height], ['webp', 960, 1280]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('uses an empty local state when Notion settings are missing', async () => {
  const originalToken = process.env.NOTION_TOKEN;
  const originalDatabaseId = process.env.NOTION_DATABASE_ID;
  const originalCI = process.env.CI;

  delete process.env.NOTION_TOKEN;
  delete process.env.NOTION_DATABASE_ID;
  delete process.env.CI;

  try {
    const concerts = await fetchConcerts();
    assert.deepEqual(concerts, []);
  } finally {
    if (originalToken === undefined) delete process.env.NOTION_TOKEN;
    else process.env.NOTION_TOKEN = originalToken;
    if (originalDatabaseId === undefined) delete process.env.NOTION_DATABASE_ID;
    else process.env.NOTION_DATABASE_ID = originalDatabaseId;
    if (originalCI === undefined) delete process.env.CI;
    else process.env.CI = originalCI;
  }
});

test('concert entries always render a poster and the page title stays on one line', async () => {
  const [cardSource, pageSource] = await Promise.all([
    readFile(new URL('../components/concerts/ConcertCard.astro', import.meta.url), 'utf8'),
    readFile(new URL('../pages/concerts/index.astro', import.meta.url), 'utf8'),
  ]);

  assert.match(cardSource, /concert-poster-fallback/);
  assert.match(cardSource, /srcset=\{concert\.imageSrcSet\}/);
  assert.match(cardSource, /width="960"/);
  assert.match(cardSource, /height="1280"/);
  assert.match(pageSource, /class="page-title"/);
  assert.match(pageSource, /white-space:\s*nowrap/);
  assert.doesNotMatch(pageSource, /timeline-motion|IntersectionObserver/);

  const posterAnimation = pageSource.slice(
    pageSource.indexOf('@keyframes poster-wall-entry'),
    pageSource.indexOf('@media (max-width', pageSource.indexOf('@keyframes poster-wall-entry')),
  );
  assert.doesNotMatch(posterAnimation, /clip-path/);
});

test('Notion query requests only allowlisted property IDs', async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NOTION_TOKEN;
  const originalDatabaseId = process.env.NOTION_DATABASE_ID;
  const requests: Array<{ url: string; init?: RequestInit }> = [];

  process.env.NOTION_TOKEN = 'test-token';
  process.env.NOTION_DATABASE_ID = 'database-id';

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });

    if (new URL(url).pathname.includes('/v1/databases/')) {
      return Response.json({
        data_sources: [{ id: 'data-source-id', name: '演唱會管理' }],
      });
    }

    if (!new URL(url).pathname.endsWith('/query')) {
      return Response.json({
        properties: {
          Name: { id: 'public-name', type: 'title' },
          演出日期: { id: 'public-date', type: 'date' },
          演出地點: { id: 'public-venue', type: 'rich_text' },
          網址: { id: 'public-url', type: 'url' },
          購票階段: { id: 'public-stage', type: 'status' },
          海報: { id: 'public-poster', type: 'files' },
          單位票價: { id: 'public-price', type: 'number' },
          幣別: { id: 'public-currency', type: 'select' },
          付款者: { id: 'private-payer', type: 'people' },
          付款方式: { id: 'private-payment', type: 'select' },
          座位: { id: 'private-seat', type: 'rich_text' },
        },
      });
    }

    return Response.json({
      results: [
        {
          id: 'published-row',
          properties: {
            Name: text('title', 'Example Live'),
            演出日期: { type: 'date', date: { start: '2026-09-01' } },
            演出地點: text('rich_text', 'Zepp New Taipei'),
            購票階段: { type: 'status', status: { name: '購票成功' } },
          },
        },
      ],
      has_more: false,
      next_cursor: null,
    });
  };

  try {
    const concerts = await fetchConcerts();
    assert.equal(concerts.length, 1);
    assert.equal(requests.length, 3);
    assert.match(requests[1].url, /\/v1\/data_sources\/data-source-id$/);

    const queryUrl = new URL(requests[2].url);
    const requestedIds = queryUrl.searchParams.getAll('filter_properties[]');
    assert.deepEqual(requestedIds.sort(), [
      'public-currency',
      'public-date',
      'public-name',
      'public-poster',
      'public-price',
      'public-stage',
      'public-url',
      'public-venue',
    ]);
    assert.doesNotMatch(requests[2].url, /private-/);

    const queryBody = JSON.parse(String(requests[2].init?.body));
    assert.deepEqual(queryBody.filter, {
      property: '購票階段',
      status: { equals: '購票成功' },
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NOTION_TOKEN;
    else process.env.NOTION_TOKEN = originalToken;
    if (originalDatabaseId === undefined) delete process.env.NOTION_DATABASE_ID;
    else process.env.NOTION_DATABASE_ID = originalDatabaseId;
  }
});

test('annual spending includes only that performance year and reports unfilled costs', () => {
  const base = { id: 'row', name: 'Live', venue: 'Venue', currency: 'TWD' };
  const concerts = [
    { ...base, startDate: '2025-12-31', cost: 9999 },
    { ...base, startDate: '2026-01-01', cost: 1200 },
    { ...base, startDate: '2026-12-31', cost: 3400 },
    { ...base, startDate: '2027-01-01', cost: 8888 },
    { ...base, startDate: '2026-08-01', cost: 0 },
    { ...base, startDate: '2026-08-02' },
    { ...base, startDate: '2026-08-03', cost: 0.1 },
    { ...base, startDate: '2026-08-04', cost: 0.2 },
  ];
  assert.deepEqual(getAnnualSpending(concerts, '2026'), { total: 4600, missingCount: 1, unconvertedCount: 0 });
  assert.deepEqual(getAnnualSpending([
    { ...base, startDate: '2026-01-01', cost: 1000, currency: 'JPY' },
    { ...base, startDate: '2026-01-02', cost: 1000, currency: undefined },
  ], '2026'), { total: 0, missingCount: 0, unconvertedCount: 2 });
  assert.deepEqual(getAnnualSpending([], '2026'), { total: 0, missingCount: 0, unconvertedCount: 0 });
});

test('decodes unit ticket prices and currencies without multiplying ticket quantities', () => {
  const properties = {
    Name: text('title', 'Live'),
    演出日期: { type: 'date', date: { start: '2026-09-01' } },
    演出地點: text('rich_text', 'Venue'),
    購票階段: { type: 'status', status: { name: '購票成功' } },
    幣別: { type: 'select', select: { name: 'NTD' } },
    張數: { type: 'number', number: 4 },
  };
  for (const price of [0, 3600, 1200.5]) {
    const concert = decodeConcertPage({ id: 'row', properties: {
      ...properties, 單位票價: { type: 'number', number: price },
    } });
    assert.equal(concert?.cost, price);
    assert.equal(concert?.currency, 'TWD');
  }
  for (const price of [null, -1, Infinity, '3600']) {
    assert.equal(decodeConcertPage({ id: 'row', properties: {
      ...properties, 單位票價: { type: 'number', number: price },
    } })?.cost, undefined);
  }
});


test('converts foreign unit prices to TWD and rounds only the final total', () => {
  const base = { id: 'row', name: 'Live', venue: 'Venue', startDate: '2026-09-01' };
  assert.deepEqual(getAnnualSpending([
    { ...base, cost: 3600, currency: 'TWD' },
    { ...base, cost: 15000, currency: 'JPY' },
    { ...base, cost: 100, currency: 'USD' },
  ], '2026', { '2026-09-01': { JPY: 0.21, USD: 32.5 } }), { total: 10000, missingCount: 0, unconvertedCount: 0 });
  assert.equal(getAnnualSpending([
    { ...base, cost: 1, currency: 'USD' },
    { ...base, cost: 1, currency: 'USD' },
  ], '2026', { '2026-09-01': { USD: 0.4 } }).total, 1);
  for (const rate of [0, -1, Infinity, NaN]) {
    assert.equal(getAnnualSpending([{ ...base, cost: 1, currency: 'USD' }], '2026', { '2026-09-01': { USD: rate } }).unconvertedCount, 1);
  }
});

test('uses different performance-day rates for the same currency', () => {
  const base = { id: 'row', name: 'Live', venue: 'Venue', cost: 1000, currency: 'JPY' };
  assert.equal(getAnnualSpending([
    { ...base, startDate: '2026-06-01' },
    { ...base, startDate: '2026-06-02' },
  ], '2026', {
    '2026-06-01': { JPY: 0.2 },
    '2026-06-02': { JPY: 0.25 },
  }).total, 450);
});
