import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchExchangeRates } from './exchange-rates.ts';

const date = new Date().toISOString().slice(0, 10);

test('fetches and inverts one TWD feed only when foreign currencies are needed', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ date, twd: { jpy: 5, usd: 0.03125 } });
  };
  try {
    assert.deepEqual(await fetchExchangeRates(['TWD']), { rates: { TWD: 1 } });
    assert.equal(calls, 0);
    assert.deepEqual(await fetchExchangeRates(['TWD', 'JPY', 'USD', 'JPY']), {
      rates: { TWD: 1, JPY: 0.2, USD: 32 }, date,
    });
    assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('uses the backup source when the primary request fails', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    urls.push(String(input));
    if (urls.length === 1) return new Response(null, { status: 503 });
    return Response.json({ date, twd: { jpy: 5 } });
  };
  try {
    assert.equal((await fetchExchangeRates(['JPY'])).rates.JPY, 0.2);
    assert.match(urls[0], /cdn\.jsdelivr\.net/);
    assert.match(urls[1], /currency-api\.pages\.dev/);
  } finally { globalThis.fetch = originalFetch; }
});

test('rejects absent, invalid and stale rates rather than publishing a wrong total', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const body of [null, { date: 'invalid' }, { date: '2000-01-01', twd: { jpy: 5 } },
      { date, twd: {} }, { date, twd: { jpy: 0 } }, { date, twd: { jpy: -1 } },
      { date, twd: { jpy: '5' } }]) {
      globalThis.fetch = async () => Response.json(body);
      await assert.rejects(fetchExchangeRates(['JPY']), /either source/);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('historical rates must match the requested performance date', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ date: '2025-06-01', twd: { jpy: 5 } });
    assert.equal((await fetchExchangeRates(['JPY'], '2025-06-01')).rates.JPY, 0.2);
    await assert.rejects(fetchExchangeRates(['JPY'], '2025-06-02'), /either source/);
  } finally { globalThis.fetch = originalFetch; }
});

test('groups requests by performance date and shares latest rates for future concerts', async () => {
  const { fetchConcertExchangeRates } = await import('./exchange-rates.ts');
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input);
    urls.push(url);
    const requestedDate = url.includes('@2025-06-01') ? '2025-06-01'
      : url.includes('@2025-06-02') ? '2025-06-02' : date;
    return Response.json({ date: requestedDate, twd: { jpy: requestedDate === '2025-06-01' ? 5 : 4, usd: 0.03125 } });
  };
  const base = { id: 'row', name: 'Live', venue: 'Venue', cost: 1000, currency: 'JPY' };
  try {
    const rates = await fetchConcertExchangeRates([
      { ...base, startDate: '2025-06-01' },
      { ...base, startDate: '2025-06-01', currency: 'USD' },
      { ...base, startDate: '2025-06-02' },
      { ...base, startDate: '2099-06-01' },
      { ...base, startDate: '2099-06-02' },
      { ...base, startDate: '2025-01-01', currency: 'TWD' },
      { ...base, startDate: '2025-01-02', cost: undefined },
    ], date);
    assert.equal(urls.length, 3);
    assert.equal(rates['2025-06-01'].JPY, 0.2);
    assert.equal(rates['2025-06-02'].JPY, 0.25);
    assert.equal(rates['2099-06-01'].JPY, 0.25);
    assert.deepEqual(rates['2099-06-01'], rates['2099-06-02']);
    assert.deepEqual(rates['2025-01-01'], { TWD: 1 });
  } finally { globalThis.fetch = originalFetch; }
});
