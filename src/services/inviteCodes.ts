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

/** Extract all unique groups from codes, preserving first-seen order */
export function extractGroups(codes: InviteCode[]): string[] {
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const code of codes) {
    const g = (code.group ?? '其他').trim();
    if (g && !seen.has(g)) {
      seen.add(g);
      groups.push(g);
    }
  }
  return groups;
}

/** Group codes by group field */
export function groupByGroup(codes: InviteCode[], groups: string[]): Record<string, InviteCode[]> {
  const result: Record<string, InviteCode[]> = {};
  for (const g of groups) {
    result[g] = codes.filter(c => (c.group ?? '其他') === g);
  }
  return result;
}
