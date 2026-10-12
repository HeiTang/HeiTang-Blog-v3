import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { inviteBrands, getInviteBrand, selectHeroCodes } from './invite-brands.ts';
import type { InviteCode } from '../types/invite';

test('every configured invite brand has a local PNG icon', () => {
  for (const [title, brand] of Object.entries(inviteBrands)) {
    assert.ok(brand, title);
    assert.ok(existsSync(new URL(`../../public/images/invite-brands/${brand.icon}.png`, import.meta.url)), title);
  }
});

test('new invite services get a stable color without a manual brand entry', () => {
  const brand = getInviteBrand('新服務 A');
  assert.deepEqual(getInviteBrand('新服務 A'), brand);
  assert.match(brand.color, /^\d+ \d+ \d+$/);
  assert.equal(brand.icon, undefined);
  assert.notEqual(getInviteBrand('新服務 B').color, brand.color);
  assert.equal(getInviteBrand('Klook').icon, 'klook');
});

test('Hero prefers logos and one group, fills remaining cards, and varies its selection', () => {
  const code = (title: string, group: string, status: InviteCode['status'] = 'active'): InviteCode => ({
    title, group, status, description: title, tags: [],
  });
  const travel = ['Klook', 'KKday', 'Trip.com'].map(title => code(title, '旅遊'));
  const transport = ['Uber', 'GoShare', 'WeMo'].map(title => code(title, '交通'));
  const mixed = [...travel, ...transport, code('新服務', '旅遊'), code('Wise', '金融', 'expired'), code('KAST', '金融', 'disabled')];
  const chosen = selectHeroCodes(mixed, () => 0.99);
  assert.equal(chosen.length, 3);
  assert.equal(new Set(chosen.map(item => item.group)).size, 1);
  assert.ok(chosen.every(item => getInviteBrand(item.title).icon && item.status === 'active'));
  assert.notDeepEqual(selectHeroCodes(mixed, () => 0), chosen);
  const previousTitles = chosen.map(item => item.title);
  assert.notDeepEqual(selectHeroCodes(mixed, () => 0.99, previousTitles).map(item => item.title), previousTitles);
  const finance = ['Wise', 'Binance 幣安', 'KAST', 'Telegram Wallet'].map(title => code(title, '金融'));
  assert.notDeepEqual(selectHeroCodes(finance, () => 0.99, finance.slice(0, 3).map(item => item.title)), finance.slice(0, 3));
  assert.deepEqual(mixed.slice(0, 3), travel);

  const filled = selectHeroCodes([travel[0], travel[1], transport[0], code('新服務', '旅遊')], () => 0.99);
  assert.equal(filled.filter(item => item.group === '旅遊').length, 2);
  assert.ok(filled.every(item => getInviteBrand(item.title).icon));
  const fallback = selectHeroCodes([travel[0], code('無圖示 A', '旅遊'), code('無圖示 B', '旅遊'), code('無圖示 C', '其他')], () => 0.99);
  assert.equal(fallback.length, 3);
  assert.ok(fallback.every(item => item.group === '旅遊'));
  const withoutLogos = selectHeroCodes([
    code('無圖示 A', '旅遊'), code('無圖示 B', '旅遊'), code('無圖示 C', '旅遊'), code('無圖示 D', '其他'),
  ], () => 0.99);
  assert.ok(withoutLogos.every(item => item.group === '旅遊'));
  assert.equal(selectHeroCodes([code('Wise', '金融', 'expired'), code('KAST', '金融', 'disabled')]).length, 0);
  assert.equal(selectHeroCodes([travel[0]]).length, 1);
});
