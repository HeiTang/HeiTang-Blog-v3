/** Invite code record from Google Sheets via GAS JSON API */
export interface InviteCode {
  code: string;
  service: string;
  description: string;
  descriptionEn?: string;
  url?: string;
  expiry?: string;
  status: 'active' | 'expired' | 'limited';
  notes?: string;
}

export interface InviteCodesResponse {
  codes: InviteCode[];
  updatedAt: string;
}
