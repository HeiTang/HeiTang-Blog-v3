import type { Concert } from './concerts.ts';

const ENDPOINTS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/twd.json',
  'https://latest.currency-api.pages.dev/v1/currencies/twd.json',
];

export async function fetchExchangeRates(currencies: string[], requestedDate = 'latest'): Promise<{
  rates: Record<string, number>;
  date?: string;
}> {
  const foreign = [...new Set(currencies.filter(currency => currency !== 'TWD'))];
  if (foreign.length === 0) return { rates: { TWD: 1 } };

  for (const template of ENDPOINTS) {
    const endpoint = template.replace('latest', requestedDate);
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body: unknown = await response.json();
      if (typeof body !== 'object' || body === null) throw new Error('Invalid rate payload');
      const { date, twd } = body as { date?: unknown; twd?: unknown };
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
        || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Invalid rate date');
      if (requestedDate === 'latest') {
        const age = Date.now() - Date.parse(date);
        if (age < -86400000 || age > 7 * 86400000) throw new Error('Rate date is outside the accepted range');
      } else if (date !== requestedDate) throw new Error('Historical rate date does not match performance date');
      if (typeof twd !== 'object' || twd === null) throw new Error('Missing TWD rates');
      const rates: Record<string, number> = { TWD: 1 };
      for (const currency of foreign) {
        const rate = (twd as Record<string, unknown>)[currency.toLowerCase()];
        if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
          throw new Error(`Missing or invalid rate for ${currency}`);
        }
        // The feed gives foreign units per TWD; invert it for ticket conversion.
        rates[currency] = 1 / rate;
      }
      return { rates, date };
    } catch (error) {
      console.warn(`[concerts] exchange-rate source failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
  throw new Error('Unable to fetch valid concert exchange rates from either source');
}


export async function fetchConcertExchangeRates(
  concerts: Concert[],
  today: string,
): Promise<Record<string, Record<string, number>>> {
  const dates = new Map<string, string[]>();
  for (const concert of concerts) {
    if (concert.cost === undefined || !concert.currency || concert.currency === 'TWD') continue;
    const date = concert.startDate.slice(0, 10);
    const requestedDate = date < today ? date : 'latest';
    dates.set(requestedDate, [...(dates.get(requestedDate) ?? []), concert.currency]);
  }
  const fetched = new Map(await Promise.all([...dates].map(async ([date, currencies]) =>
    [date, (await fetchExchangeRates(currencies, date)).rates] as const)));
  return Object.fromEntries(concerts.map(concert => {
    const date = concert.startDate.slice(0, 10);
    return [date, fetched.get(date < today ? date : 'latest') ?? { TWD: 1 }];
  }));
}
