/**
 * Invite Codes Service (Single Responsibility Principle)
 * Fetches invite codes from Google Apps Script JSON API at build time.
 */
import type { InviteCode, InviteCodesResponse } from '../types/invite';

/** Fetch invite codes from GAS JSON API (build-time SSG) */
export async function fetchInviteCodes(): Promise<InviteCodesResponse> {
  const apiUrl = import.meta.env.INVITE_CODES_API_URL;

  if (!apiUrl) {
    console.warn('[invite-codes service] INVITE_CODES_API_URL not set — returning empty list');
    return { codes: [], updatedAt: new Date().toISOString() };
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

/** Filter invite codes by status */
export function filterActiveInviteCodes(codes: InviteCode[]): InviteCode[] {
  return codes.filter((c) => c.status === 'active');
}
