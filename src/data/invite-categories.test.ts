import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getInviteCategory, getInviteSubcategory, inviteCategories } from './invite-categories.ts';
import type { InviteCode } from '../types/invite';

test('display categories keep source groups unchanged and preserve unknown services', () => {
  assert.equal(Object.keys(inviteCategories).length, 5);
  for (const [category, groups] of Object.entries(inviteCategories)) {
    for (const group of groups) assert.equal(getInviteCategory({ title: '服務', group }), category);
  }
  const dynadot = { title: 'Dynadot', group: '服務' };
  assert.equal(getInviteSubcategory(dynadot), '數位工具');
  assert.equal(getInviteCategory(dynadot), '生活與工具');
  assert.equal(dynadot.group, '服務');
  assert.equal(getInviteSubcategory({ title: 'Muse.ai', group: '服務' }), '數位工具');
  assert.equal(getInviteSubcategory({ title: 'ChargeSPOT  共享行動電源', group: '服務' }), '生活服務');
  assert.equal(getInviteSubcategory({ title: '新服務', group: ' 新分類 ' }), '新分類');
  assert.equal(getInviteCategory({ title: '新服務', group: '新分類' }), '生活與工具');
  assert.equal(getInviteSubcategory({ title: '新服務', group: '' }), '其他');
});

test('local fixture uses the documented group contract and every record gets one category', async () => {
  const fixture = JSON.parse(await readFile(new URL('./invite-codes.mock.json', import.meta.url), 'utf8')) as { codes: InviteCode[] };
  for (const code of fixture.codes) {
    assert.ok(code.group, code.title);
    assert.ok(getInviteCategory(code) in inviteCategories, code.title);
  }
});
