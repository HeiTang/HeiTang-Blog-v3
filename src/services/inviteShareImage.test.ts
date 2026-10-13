import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { getShareCodeSize, renderShareText, wrapShareText } from './inviteShareImage.ts';

test('share image text wraps CJK and truncates long rewards without extra lines', () => {
  assert.equal(wrapShareText('回饋'.repeat(100), 4, 2), '回饋回饋\n回饋回饋…');
  assert.equal(wrapShareText('10 億 Muse Token', 23, 3), '10 億 Muse Token');
  assert.equal(wrapShareText('第一行\n第二行', 23, 3), '第一行 第二行');
  assert.equal(wrapShareText('抽 500 元優惠券 & 完成指定條件', 11, 3), '抽 500 元優惠券 &\n完成指定條件');
  assert.equal(wrapShareText('美元，獲得 5 美元 DynaDollars', 15, 3), '美元，獲得 5 美元\nDynaDollars');
});

test('invite codes fit the stub without truncation or unreadably small text', () => {
  assert.equal(getShareCodeSize('A1BHWW'), 36);
  assert.equal(getShareCodeSize('8L8r8C7eK8Q6F7E'), 24);
  assert.equal(getShareCodeSize('A'.repeat(16)), 22);
  assert.equal(getShareCodeSize('A'.repeat(17)), null);
  assert.equal(getShareCodeSize('邀請碼'), null);
  assert.equal(getShareCodeSize(''), null);
});

test('share codes render from the bundled monospace font rather than a system fallback', async () => {
  const narrow = await sharp(await renderShareText('iiiiiiiiiiii', 30, '#fff', true, true)).metadata();
  const wide = await sharp(await renderShareText('WWWWWWWWWWWW', 30, '#fff', true, true)).metadata();
  assert.ok(Math.abs(narrow.width! - wide.width!) <= 5);
  assert.ok(narrow.width! <= 220);
  assert.equal(narrow.format, 'png');
  await assert.rejects(renderShareText('😀', 30, '#fff'), /Share image font lacks/);
});
