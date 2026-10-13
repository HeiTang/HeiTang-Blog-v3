import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openSync } from 'fontkit';
import type { Font } from 'fontkit';
import { getInviteBrand } from '../data/invite-brands.ts';
import { getInviteSubcategory } from '../data/invite-categories.ts';
import type { InviteCode } from '../types/invite';

const loadFont = (name: string) => openSync(resolve(`src/assets/fonts/${name}.ttf`)) as Font;
const latinFont = loadFont('inter-latin');
const cjkFont = loadFont('noto-sans-tc-site');
const monoFont = loadFont('jetbrains-mono-latin');
const fonts = [500, 700].map(wght => ({
  latin: latinFont.getVariation({ wght }), cjk: cjkFont.getVariation({ wght }), mono: monoFont.getVariation({ wght }),
}));

export async function renderShareText(value: string, size: number, color: string, bold = false, mono = false): Promise<Buffer> {
  const family = fonts[bold ? 1 : 0];
  let width = 0;
  const paths: string[] = [];
  const lines = value.normalize('NFKC').split('\n');
  lines.forEach((line, lineIndex) => {
    const runs: Array<{ font: Font; value: string }> = [];
    for (const char of line) {
      const point = char.codePointAt(0)!;
      const font = mono ? family.mono : family.latin.hasGlyphForCodePoint(point) ? family.latin : family.cjk;
      if (!font.hasGlyphForCodePoint(point)) throw new Error(`Share image font lacks U+${point.toString(16)}`);
      if (runs.at(-1)?.font === font) runs[runs.length - 1].value += char;
      else runs.push({ font, value: char });
    }
    let x = 2;
    for (const { font, value: runValue } of runs) {
      const scale = size / font.unitsPerEm;
      const run = font.layout(runValue, mono ? { liga: false, calt: false } : undefined);
      run.glyphs.forEach((glyph, index) => {
        const position = run.positions[index];
        paths.push(`<path d="${glyph.path.toSVG()}" transform="translate(${x + position.xOffset * scale} ${2 + size * 1.3 + lineIndex * size * 1.4 - position.yOffset * scale}) scale(${scale} ${-scale})"/>`);
        x += position.xAdvance * scale;
      });
    }
    width = Math.max(width, x);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width + 2)}" height="${Math.ceil(size * (lines.length * 1.4 + .4) + 4)}"><g fill="${color}">${paths.join('')}</g></svg>`;
  return sharp(Buffer.from(svg)).trim().resize({ width: 740, withoutEnlargement: true }).png().toBuffer();
}

export function getShareCodeSize(value: string): number | null {
  if (!value || /[^\x21-\x7e]/.test(value)) return null;
  const size = Math.min(36, Math.floor(220 / (value.length * .6)));
  return size >= 22 ? size : null;
}

export function wrapShareText(text: string, width: number, maxLines: number): string {
  const chars = Array.from(text.replace(/\s+/g, ' ').trim());
  const lines = [''];
  let used = 0;
  for (const char of chars) {
    const size = /[\x00-\x7f]/.test(char) ? .6 : 1;
    if (used + size > width) {
      if (lines.length === maxLines) {
        lines[lines.length - 1] += '…';
        break;
      }
      const previous = lines[lines.length - 1];
      const space = previous.lastIndexOf(' ');
      const word = previous.match(/[A-Za-z0-9]+$/)?.[0] ?? '';
      const carry = /[A-Za-z0-9]/.test(char) && word.length < previous.length && word.length * .6 + size <= width
        ? word : space > previous.length / 2 ? previous.slice(space + 1) : '';
      if (carry) lines[lines.length - 1] = previous.slice(0, previous.length - carry.length).trimEnd();
      lines.push(carry);
      used = Array.from(carry).reduce((sum, c) => sum + (/[\x00-\x7f]/.test(c) ? .6 : 1), 0);
    }
    lines[lines.length - 1] += char;
    used += size;
  }
  return lines.join('\n');
}

export async function renderInviteShareImage(code: InviteCode): Promise<Buffer> {
  const brand = getInviteBrand(code.title);
  const color = `rgb(${brand.color.replaceAll(' ', ',')})`;
  const inviteCode = code.invite_code?.trim() ?? '';
  const background = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="paper" x2="1" y2="1"><stop stop-color="#25303c"/><stop offset="1" stop-color="#141c25"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
      <mask id="ticket"><rect x="44" y="44" width="1112" height="542" rx="32" fill="white"/><circle cx="864" cy="44" r="20"/><circle cx="864" cy="586" r="20"/></mask>
    </defs>
    <rect width="1200" height="630" fill="#0c1118"/>
    <path d="M941 16 1172 73 1123 292 892 234Z" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-opacity=".2"/>
    <rect x="44" y="57" width="1112" height="542" rx="32" fill="black" fill-opacity=".4"/>
    <g mask="url(#ticket)">
      <rect x="44" y="44" width="1112" height="542" fill="url(#paper)"/>
      <ellipse cx="120" cy="140" rx="670" ry="450" fill="url(#glow)"/>
      <rect x="864" y="44" width="292" height="542" fill="${color}" fill-opacity=".07"/>
      <circle cx="1010" cy="270" r="195" fill="none" stroke="${color}" stroke-opacity=".12"/>
      <circle cx="1010" cy="270" r="230" fill="none" stroke="${color}" stroke-opacity=".05" stroke-width="22"/>
      <path d="M864 78v474" stroke="white" stroke-opacity=".18" stroke-dasharray="5 9"/>
      <rect x="44" y="44" width="1112" height="542" rx="32" fill="none" stroke="white" stroke-opacity=".12" stroke-width="2"/>
    </g>
    <rect x="918" y="179" width="184" height="184" rx="42" fill="#101820" stroke="${color}" stroke-opacity=".45"/>
    ${inviteCode ? '' : `<path d="M1003 408h22m-9-9 9 9-9 9" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`}
    <g transform="translate(84 248)" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="6" width="26" height="6" rx="1"/><path d="M3 12v16h20V12M13 6v22M13 6H7a4 4 0 1 1 4-5l2 5Zm0 0h6a4 4 0 1 0-4-5l-2 5Z"/></g>
    <circle cx="91" cy="539" r="5" fill="${code.status === 'active' ? color : '#f3a3a3'}"/>
    <g fill="${color}" fill-opacity=".45">${[0, 8, 13, 23, 28, 38, 43, 49, 60, 65, 74, 81, 88, 98, 106, 113, 124, 129, 139, 145, 152, 160, 170, 177, 186, 193].map((x, i) => `<rect x="${910 + x}" y="490" width="${i % 3 === 0 ? 4 : 2}" height="22"/>`).join('')}</g>
  </svg>`);
  const text = renderShareText;
  const logo = brand.icon
    ? await sharp(await readFile(resolve(`public/images/invite-brands/${brand.icon}.png`))).resize(144, 144, { fit: 'contain' }).png().toBuffer()
    : await text(code.title.slice(0, 2), 56, '#f4f6f8', true);
  const logoSize = await sharp(logo).metadata();
  const status = { active: '有效', expired: '已到期', disabled: '已停用' }[code.status];
  const benefit = code.user_benefit || code.description;
  const compact = Array.from(benefit).reduce((width, char) => width + (/[\x00-\x7f]/.test(char) ? .6 : 1), 0) > 18;
  const rewardSize = compact ? 46 : 64;
  const codeSize = getShareCodeSize(inviteCode);
  const stubValue = inviteCode ? codeSize ? inviteCode : '點開複製邀請碼' : '查看詳情';
  const stubText = await text(stubValue, codeSize ?? (inviteCode ? 22 : 26), '#f4f6f8', !!codeSize, !!codeSize);
  const stubSize = await sharp(stubText).metadata();
  return sharp(background).composite([
    { input: logo, left: Math.round(1010 - (logoSize.width ?? 144) / 2), top: Math.round(271 - (logoSize.height ?? 144) / 2) },
    { input: await text('INVITE / 黑糖的邀請碼清單', 20, '#b1bdc9'), left: 84, top: 77 },
    { input: await text(wrapShareText(code.title, 15, 2), 46, '#f4f6f8', true), left: 80, top: 122 },
    { input: await text(code.user_benefit ? '你能獲得' : '服務說明', 24, '#b1bdc9'), left: 126, top: 247 },
    { input: await text(wrapShareText(benefit, compact ? 15 : 11, compact ? 3 : 2), rewardSize, '#f4f6f8', true), left: 80, top: 301 },
    { input: await text(`${status}${code.end_date ? ` · 至 ${code.end_date}` : ''}`, 23, code.status === 'active' ? '#b1bdc9' : '#f3a3a3'), left: 110, top: 523 },
    { input: await text(wrapShareText(getInviteSubcategory(code), 9, 1), 24, '#b1bdc9'), left: 910, top: 92 },
    ...(inviteCode ? [{ input: await text('邀請碼', 22, '#b1bdc9'), left: 977, top: 394 }] : []),
    { input: stubText, left: Math.round(1010 - (stubSize.width ?? 0) / 2), top: Math.round(450 - (stubSize.height ?? 0) / 2) },
    { input: await text('purr.tw', 22, '#b1bdc9'), left: 965, top: 531 },
  ]).png().toBuffer();
}
