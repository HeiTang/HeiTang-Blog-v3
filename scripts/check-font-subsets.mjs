import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDirectory = path.join(projectRoot, 'dist');
const coverageFile = path.join(projectRoot, 'scripts/noto-sans-tc-site.coverage.txt');

const trackedRanges = [
  [0x3000, 0x30ff],
  [0x3100, 0x312f],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xf900, 0xfaff],
  [0x20000, 0x2fa1f],
];

const isTrackedCodePoint = (codePoint) =>
  trackedRanges.some(([start, end]) => codePoint >= start && codePoint <= end);

const decodeHtmlEntities = (value) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&apos;/gi, "'");

const extractVisibleText = (html) => decodeHtmlEntities(
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ''),
);

const collectHtmlFiles = (directory) => {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(file));
    else if (entry.name.endsWith('.html')) files.push(file);
  }

  return files;
};

const formatCodePoint = (codePoint) =>
  'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');

if (!fs.existsSync(distDirectory)) {
  console.error('Font subset check failed: dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

if (!fs.existsSync(coverageFile)) {
  console.error(
    'Font subset check failed: ' +
      path.relative(projectRoot, coverageFile) +
      ' does not exist.',
  );
  process.exit(1);
}

const coverage = new Set(
  [...fs.readFileSync(coverageFile, 'utf8')]
    .map((character) => character.codePointAt(0))
    .filter(isTrackedCodePoint),
);
const missingByCodePoint = new Map();
const htmlFiles = collectHtmlFiles(distDirectory);

for (const file of htmlFiles) {
  const text = extractVisibleText(fs.readFileSync(file, 'utf8'));
  const relativeFile = path.relative(distDirectory, file).split(path.sep).join('/');

  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (!isTrackedCodePoint(codePoint) || coverage.has(codePoint)) continue;

    const files = missingByCodePoint.get(codePoint) ?? [];
    if (!files.includes(relativeFile)) files.push(relativeFile);
    missingByCodePoint.set(codePoint, files);
  }
}

if (missingByCodePoint.size > 0) {
  console.error(
    'Font subset check failed: visible CJK characters are outside the committed Noto coverage.',
  );
  for (const [codePoint, files] of [...missingByCodePoint.entries()].sort(([a], [b]) => a - b)) {
    console.error(
      '- ' +
        formatCodePoint(codePoint) +
        ' ' +
        String.fromCodePoint(codePoint) +
        ': ' +
        files.join(', '),
    );
  }
  console.error(
    'Regenerate public/fonts/noto-sans-tc-site.woff2 and update ' +
      'scripts/noto-sans-tc-site.coverage.txt.',
  );
  process.exit(1);
}

console.log(
  'Noto Sans TC subset coverage OK: ' +
    coverage.size +
    ' tracked code points across ' +
    htmlFiles.length +
    ' HTML files.',
);
