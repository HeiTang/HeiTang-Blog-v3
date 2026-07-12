import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import sharp from 'sharp';

import {
  concertPosterBaseName,
  getConcertPosterSource,
  queryConcertPages,
  resolveDatabaseDataSourceId,
} from '../src/services/concerts.ts';

const outputDirectory = new URL('../public/images/concert-posters/', import.meta.url);
const supportedFormats = new Set(['avif', 'jpeg', 'png', 'webp']);
const sizes = [
  { width: 480, height: 640 },
  { width: 960, height: 1280 },
] as const;

interface SyncOptions {
  fetchImpl?: typeof fetch;
  outputDir?: URL;
}

export async function writeConcertPosters(pages: unknown[], options: SyncOptions = {}): Promise<number> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const outputDir = options.outputDir ?? outputDirectory;

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  let synced = 0;

  for (const page of pages) {
    const source = getConcertPosterSource(page);
    if (!source) continue;

    const pageId = typeof page === 'object' && page !== null && 'id' in page ? page.id : undefined;
    if (typeof pageId !== 'string') throw new Error('Notion concert poster is missing its page ID');

    const response = await fetchImpl(source.url);
    if (!response.ok) {
      throw new Error(`Concert poster download failed for ${pageId}: ${response.status}`);
    }

    const input = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(input).metadata();
    if (!metadata.format || !supportedFormats.has(metadata.format)) {
      throw new Error(`Concert poster ${source.name} uses unsupported format ${metadata.format ?? 'unknown'}`);
    }

    const baseName = concertPosterBaseName(pageId);
    await Promise.all(
      sizes.map(({ width, height }) =>
        sharp(input)
          .rotate()
          .resize(width, height, {
            fit: 'contain',
            background: { r: 15, g: 20, b: 25, alpha: 1 },
          })
          .webp({ quality: 82 })
          .toFile(fileURLToPath(new URL(`${baseName}-${width}.webp`, outputDir))),
      ),
    );
    synced += 1;
  }

  return synced;
}

async function main(): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    const message = '[concerts] skipping poster sync because Notion settings are missing';
    if (process.env.CI === 'true') throw new Error(message);
    console.warn(message);
    return;
  }

  const dataSourceId = await resolveDatabaseDataSourceId(databaseId, token);
  const pages = await queryConcertPages(dataSourceId, token);
  const count = await writeConcertPosters(pages);
  console.log(`[concerts] synced ${count} poster(s)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
