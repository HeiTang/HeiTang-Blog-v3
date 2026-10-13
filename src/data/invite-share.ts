import type { InviteCode } from '../types/invite';

export function getInviteSlug(title: string): string {
  // shortcut: URLs follow titles; add persistent source IDs before renaming published services.
  return title.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}

export function getInviteShareEntries(codes: InviteCode[]) {
  const seen = new Set<string>();
  return codes.map(code => {
    const slug = getInviteSlug(code.title);
    if (!slug || seen.has(slug)) throw new Error(`Duplicate or empty invite share URL: ${code.title}`);
    seen.add(slug);
    return { slug, code };
  });
}

export function getInviteShareDescription(code: InviteCode): string {
  const status = { active: '有效', expired: '已到期', disabled: '已停用' }[code.status];
  return `${status} · ${code.user_benefit ? `你能獲得：${code.user_benefit}` : code.description.replace(/\s+/g, ' ').trim()}${code.end_date ? ` · 至 ${code.end_date}` : ''}`;
}
