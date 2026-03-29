/** Invite code record from Google Sheets via GAS JSON API */
export interface InviteCode {
  /** 服務名稱（必填）*/
  title: string;
  /** 分組名稱（必填），用於頁面 section 與 tab 導覽 */
  group: string;
  /** 邀請碼（文字，複製用）— invite_code 與 invite_link 至少一個必填 */
  invite_code?: string;
  /** 邀請連結（有追蹤碼 URL）*/
  invite_link?: string;
  /** 官方/活動頁面（乾淨連結）*/
  official_link?: string;
  /** 活動開始日（ISO date string，僅顯示用）*/
  start_date?: string;
  /** 到期日（ISO date string，自動判斷 status）*/
  end_date?: string;
  /** 服務說明（必填）*/
  description: string;
  /** 細節標籤陣列（選填），顯示在卡片上；與 group 語意不同 */
  tags: string[];
  /** 使用者獲得什麼（利益揭露）*/
  user_benefit?: string;
  /** 站長獲得什麼（有值即顯示利益揭露）*/
  my_benefit?: string;
  /** 自動計算的狀態（GAS 計算後注入）*/
  status: 'active' | 'expired' | 'disabled';
}

export interface InviteCodesResponse {
  codes: InviteCode[];
  updatedAt: string;
}
