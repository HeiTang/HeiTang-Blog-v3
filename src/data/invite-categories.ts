import type { InviteCode } from '../types/invite';

/** Display taxonomy only; the source group in Google Sheets stays unchanged. */
export const inviteCategories: Record<string, readonly string[]> = {
  '銀行與信用卡': ['銀行開戶', '信用卡'],
  '支付與投資': ['電子支付', '證券 & 投資', '其他金融'],
  '旅遊與交通': ['旅遊', '交通'],
  '飲食與購物': ['飲食', '購物'],
  '生活與工具': ['電信', '生活服務', '數位工具'],
};

export function getInviteSubcategory(code: Pick<InviteCode, 'title' | 'group'>): string {
  const group = code.group?.trim() || '其他';
  if (group === '服務') return ['Dynadot', 'Muse.ai'].includes(code.title.trim()) ? '數位工具' : '生活服務';
  return group;
}

export function getInviteCategory(code: Pick<InviteCode, 'title' | 'group'>): string {
  const subcategory = getInviteSubcategory(code);
  return Object.entries(inviteCategories).find(([, groups]) => groups.includes(subcategory))?.[0] ?? '生活與工具';
}
