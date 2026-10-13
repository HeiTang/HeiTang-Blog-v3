import assert from 'node:assert/strict';
import test from 'node:test';
import { getInviteSlug, getInviteShareEntries, getInviteShareDescription } from './invite-share.ts';
import type { InviteCode } from '../types/invite';

const code: InviteCode = { title: 'Muse.ai', group: '服務', description: 'AI 代理', tags: [], status: 'active', user_benefit: '10 億 Muse Token' };

test('invite sharing has safe deterministic paths and rejects collisions', () => {
  assert.equal(getInviteSlug('Muse.ai'), 'muse-ai');
  assert.equal(getInviteSlug(' 全盈+PAY / 日本 '), '全盈-pay-日本');
  assert.equal(getInviteShareEntries([code])[0].slug, 'muse-ai');
  assert.throws(() => getInviteShareEntries([code, { ...code, title: 'Muse AI' }]), /Duplicate/);
  assert.throws(() => getInviteShareEntries([{ ...code, title: ' / ' }]), /empty/);
});

test('share descriptions preserve rewards and expired status without inventing benefits', () => {
  assert.equal(getInviteShareDescription(code), '有效 · 你能獲得：10 億 Muse Token');
  assert.equal(getInviteShareDescription({ ...code, status: 'expired', end_date: '2024-06-30' }), '已到期 · 你能獲得：10 億 Muse Token · 至 2024-06-30');
  assert.equal(getInviteShareDescription({ ...code, user_benefit: undefined }), '有效 · AI 代理');
});
