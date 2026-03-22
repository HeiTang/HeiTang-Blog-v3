/**
 * Invite Codes Service (Single Responsibility Principle)
 * Fetches invite codes from Google Apps Script JSON API at build time.
 */
import type { InviteCode, InviteCodesResponse } from '../types/invite';
import mockData from '../data/invite-codes.mock.json';

/** Fetch invite codes from GAS JSON API (build-time SSG) */
export async function fetchInviteCodes(): Promise<InviteCodesResponse> {
  const apiUrl = import.meta.env.INVITE_CODES_API_URL;

  if (!apiUrl) {
    console.warn('[invite-codes service] INVITE_CODES_API_URL not set — using mock data');
    return mockData as InviteCodesResponse;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`GAS API error: ${res.status}`);
    const data: InviteCodesResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('[invite-codes service] fetchInviteCodes failed:', err);
    return { codes: [], updatedAt: new Date().toISOString() };
  }
}

/** Extract all unique tags from codes, preserving first-seen order */
export function extractTags(codes: InviteCode[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const code of codes) {
    for (const tag of code.tags) {
      const t = tag.trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        tags.push(t);
      }
    }
  }
  return tags;
}

/** Group codes by tag; codes with no tags appear under '其他' */
export function groupByTag(codes: InviteCode[], tags: string[]): Record<string, InviteCode[]> {
  const groups: Record<string, InviteCode[]> = {};
  for (const tag of tags) {
    groups[tag] = codes.filter(c => c.tags.includes(tag));
  }
  const untagged = codes.filter(c => c.tags.length === 0);
  if (untagged.length > 0) groups['其他'] = untagged;
  return groups;
}
