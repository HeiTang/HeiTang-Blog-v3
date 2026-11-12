const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2026-03-11';
const SUCCESS_STAGE = '購票成功';

const PUBLIC_PROPERTIES = [
  'Name',
  '演出日期',
  '演出地點',
  '網址',
  '購票階段',
  '海報',
  '單位票價',
  '幣別',
] as const;

const REQUIRED_PROPERTIES = ['Name', '演出日期', '演出地點', '購票階段'] as const;

type PublicPropertyName = (typeof PUBLIC_PROPERTIES)[number];

interface NotionRichText {
  plain_text?: unknown;
}

interface NotionProperty {
  type?: unknown;
  title?: unknown;
  rich_text?: unknown;
  select?: unknown;
  multi_select?: unknown;
  status?: unknown;
  url?: unknown;
  date?: unknown;
  files?: unknown;
  number?: unknown;
}

interface NotionPage {
  id?: unknown;
  properties?: unknown;
}

interface NotionSchemaProperty {
  id?: unknown;
  type?: unknown;
}

export interface Concert {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  venue: string;
  url?: string;
  imageUrl?: string;
  imageSrcSet?: string;
  cost?: number;
  currency?: string;
}

export function getAnnualSpending(concerts: Concert[], year: string, rates: Record<string, Record<string, number>> = {}): {
  total: number;
  missingCount: number;
  unconvertedCount: number;
} {
  let total = 0;
  let missingCount = 0;
  let unconvertedCount = 0;
  for (const concert of concerts) {
    if (concert.startDate.slice(0, 4) !== year) continue;
    if (concert.cost === undefined) missingCount += 1;
    else {
      const rate = concert.currency === 'TWD' ? 1 : rates[concert.startDate.slice(0, 10)]?.[concert.currency ?? ''];
      if (!Number.isFinite(rate) || rate <= 0) unconvertedCount += 1;
      else total += concert.cost * rate;
    }
  }
  return { total: Math.round(total), missingCount, unconvertedCount };
}

/** 平均每場與年增率；資料不完整（幣別未填、去年票價缺漏）時不給，避免印出錯的數字。 */
export function getSpendingInsights(
  concerts: Concert[],
  year: string,
  rates: Record<string, Record<string, number>> = {},
): { average?: number; change?: number; previousYear: string } {
  const previousYear = String(Number(year) - 1);
  const current = getAnnualSpending(concerts, year, rates);
  const previous = getAnnualSpending(concerts, previousYear, rates);
  const priced = concerts.filter(concert => concert.startDate.startsWith(year) && concert.cost !== undefined).length;
  if (current.unconvertedCount > 0) return { previousYear };
  return {
    previousYear,
    ...(priced > 0 ? { average: Math.round(current.total / priced) } : {}),
    ...(previous.total > 0 && previous.missingCount === 0 && previous.unconvertedCount === 0
      ? { change: Math.round((current.total / previous.total - 1) * 100) }
      : {}),
  };
}

/** 今年還沒有任何場次（例如剛跨年）時，改顯示去年，避免出現「0 場花了 NT$0」。 */
export function getSpendingYear(concerts: Concert[], currentYear: string): string {
  return concerts.some(concert => concert.startDate.startsWith(currentYear))
    ? currentYear
    : String(Number(currentYear) - 1);
}

export interface ConcertPosterSource {
  name: string;
  url: string;
}

const nodeEnv = typeof process === 'undefined' ? undefined : process.env;

function notionHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function richTextValue(value: unknown): string {
  if (!Array.isArray(value)) return '';

  return value
    .map(item => (isRecord(item) && typeof item.plain_text === 'string' ? item.plain_text : ''))
    .join('')
    .trim();
}

function textValue(property: NotionProperty | undefined): string {
  if (!property || typeof property.type !== 'string') return '';

  if (property.type === 'title') return richTextValue(property.title as NotionRichText[]);
  if (property.type === 'rich_text') return richTextValue(property.rich_text as NotionRichText[]);

  if ((property.type === 'select' || property.type === 'status') && isRecord(property[property.type])) {
    const name = property[property.type].name;
    return typeof name === 'string' ? name.trim() : '';
  }

  if (property.type === 'multi_select' && Array.isArray(property.multi_select)) {
    return property.multi_select
      .map(item => (isRecord(item) && typeof item.name === 'string' ? item.name.trim() : ''))
      .filter(Boolean)
      .join('、');
  }

  return '';
}

function dateValue(property: NotionProperty | undefined): { start: string; end?: string } | null {
  if (!property || property.type !== 'date' || !isRecord(property.date)) return null;

  const start = property.date.start;
  const end = property.date.end;
  if (typeof start !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(start)) return null;

  return {
    start,
    ...(typeof end === 'string' && /^\d{4}-\d{2}-\d{2}/.test(end) ? { end } : {}),
  };
}

function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function urlValue(property: NotionProperty | undefined): string | undefined {
  if (!property || property.type !== 'url') return undefined;
  return safeHttpUrl(property.url);
}

export function concertPosterBaseName(pageId: string): string {
  const normalized = pageId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!normalized) throw new Error('Notion concert page ID cannot form a poster filename');
  return `concert-poster-${normalized}`;
}

export function getConcertPosterSource(page: unknown): ConcertPosterSource | undefined {
  if (!isRecord(page) || !isRecord(page.properties)) return undefined;

  const property = page.properties['海報'] as NotionProperty | undefined;
  if (!property || property.type !== 'files' || !Array.isArray(property.files) || property.files.length === 0) {
    return undefined;
  }

  const file = property.files[0];
  if (!isRecord(file) || typeof file.type !== 'string') {
    throw new Error('Notion 海報 first file is invalid');
  }

  const value = file.type === 'file' ? file.file : file.type === 'external' ? file.external : undefined;
  if (!isRecord(value)) {
    throw new Error(`Notion 海報 file type ${file.type} cannot be downloaded`);
  }

  const url = safeHttpUrl(value.url);
  if (!url) throw new Error('Notion 海報 must use an HTTP or HTTPS image');

  return {
    name: typeof file.name === 'string' && file.name.trim() ? file.name.trim() : 'poster',
    url,
  };
}

/** Decode only fields intentionally approved for public output. */
export function decodeConcertPage(page: unknown): Concert | null {
  if (!isRecord(page) || typeof page.id !== 'string' || !isRecord(page.properties)) return null;

  const properties = page.properties as Record<string, NotionProperty>;
  const name = textValue(properties.Name);
  const date = dateValue(properties['演出日期']);
  const venue = textValue(properties['演出地點']);
  const stage = textValue(properties['購票階段']);

  if (!name || !date || !venue || stage !== SUCCESS_STAGE) return null;

  const poster = getConcertPosterSource(page);
  const posterBase = poster ? `/images/concert-posters/${concertPosterBaseName(page.id)}` : undefined;
  const url = urlValue(properties['網址']);
  const price = properties['單位票價'];
  const cost = price?.type === 'number'
    && typeof price.number === 'number'
    && Number.isFinite(price.number)
    && price.number >= 0 ? price.number : undefined;
  const rawCurrency = textValue(properties['幣別']).toUpperCase();
  const currency = rawCurrency === 'NTD' || rawCurrency === 'NT$' ? 'TWD' : rawCurrency;

  return {
    id: page.id,
    name,
    startDate: date.start,
    ...(date.end ? { endDate: date.end } : {}),
    venue,
    ...(cost !== undefined ? { cost } : {}),
    ...(currency ? { currency } : {}),
    ...(url ? { url } : {}),
    ...(posterBase
      ? {
          imageUrl: `${posterBase}-960.webp`,
          imageSrcSet: `${posterBase}-480.webp 480w, ${posterBase}-960.webp 960w`,
        }
      : {}),
  };
}

async function fetchPublicPropertyIds(
  dataSourceId: string,
  token: string,
): Promise<{ ids: Partial<Record<PublicPropertyName, string>>; stageType: string }> {
  const response = await fetch(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}`, {
    headers: notionHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Notion data source schema failed: ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || !isRecord(body.properties)) {
    throw new Error('Notion data source schema is missing properties');
  }

  const ids: Partial<Record<PublicPropertyName, string>> = {};
  let stageType = '';
  let posterType = '';
  let priceType = '';
  let currencyType = '';

  for (const name of PUBLIC_PROPERTIES) {
    const property = body.properties[name] as NotionSchemaProperty | undefined;
    if (!isRecord(property) || typeof property.id !== 'string') continue;
    ids[name] = property.id;
    if (name === '購票階段' && typeof property.type === 'string') stageType = property.type;
    if (name === '單位票價' && typeof property.type === 'string') priceType = property.type;
    if (name === '幣別' && typeof property.type === 'string') currencyType = property.type;
    if (name === '海報' && typeof property.type === 'string') posterType = property.type;
  }

  const missing = REQUIRED_PROPERTIES.filter(name => !ids[name]);
  if (missing.length > 0) {
    throw new Error(`Notion public schema is missing: ${missing.join(', ')}`);
  }

  if (stageType !== 'status' && stageType !== 'select') {
    throw new Error(`Notion 購票階段 must be status or select, got ${stageType || 'unknown'}`);
  }

  if (ids['海報'] && posterType !== 'files') {
    throw new Error(`Notion 海報 must be files, got ${posterType || 'unknown'}`);
  }

  if (ids['單位票價'] && priceType !== 'number') {
    throw new Error(`Notion 單位票價 must be number, got ${priceType || 'unknown'}`);
  }
  if (ids['幣別'] && !['select', 'rich_text'].includes(currencyType)) {
    throw new Error(`Notion 幣別 must be select or rich_text, got ${currencyType || 'unknown'}`);
  }

  return { ids, stageType };
}

export async function queryConcertPages(dataSourceId: string, token: string): Promise<unknown[]> {
  const { ids, stageType } = await fetchPublicPropertyIds(dataSourceId, token);
  const endpoint = new URL(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}/query`);
  Object.values(ids).forEach(id => endpoint.searchParams.append('filter_properties[]', id));

  const pages: unknown[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({
        page_size: 100,
        filter: {
          property: '購票階段',
          [stageType]: { equals: SUCCESS_STAGE },
        },
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion concert query failed: ${response.status}`);
    }

    const body: unknown = await response.json();
    if (!isRecord(body) || !Array.isArray(body.results)) {
      throw new Error('Notion concert query returned an invalid payload');
    }

    pages.push(...body.results);
    cursor = body.has_more === true && typeof body.next_cursor === 'string' ? body.next_cursor : undefined;
  } while (cursor);

  return pages;
}

export async function resolveDatabaseDataSourceId(databaseId: string, token: string): Promise<string> {
  const response = await fetch(`${NOTION_API}/databases/${encodeURIComponent(databaseId)}`, {
    headers: notionHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Notion database lookup failed: ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.data_sources) || body.data_sources.length === 0) {
    throw new Error('Notion database has no data source');
  }

  const first = body.data_sources[0];
  if (!isRecord(first) || typeof first.id !== 'string') {
    throw new Error('Notion database returned an invalid data source');
  }

  if (body.data_sources.length > 1) {
    console.warn(`[concerts] database has ${body.data_sources.length} data sources; using the first one`);
  }

  return first.id;
}

export async function fetchConcerts(): Promise<Concert[]> {
  const token = import.meta.env?.NOTION_TOKEN ?? nodeEnv?.NOTION_TOKEN;
  const databaseId = import.meta.env?.NOTION_DATABASE_ID ?? nodeEnv?.NOTION_DATABASE_ID;
  const isCI = import.meta.env?.CI === 'true' || nodeEnv?.CI === 'true';

  if (!token || !databaseId) {
    const message = '[concerts] NOTION_TOKEN and NOTION_DATABASE_ID are required for public builds';
    if (isCI) throw new Error(message);
    console.warn(`${message}; rendering an empty local state`);
    return [];
  }

  const dataSourceId = await resolveDatabaseDataSourceId(databaseId, token);
  const pages = await queryConcertPages(dataSourceId, token);

  const concerts: Concert[] = [];
  for (const page of pages) {
    const concert = decodeConcertPage(page as NotionPage);
    if (concert) concerts.push(concert);
    else console.warn('[concerts] skipped one incomplete or non-public row');
  }

  return concerts;
}
