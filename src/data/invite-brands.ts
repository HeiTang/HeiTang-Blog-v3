/** Local brand artwork; unlisted services use their title as a fallback. */
import type { InviteCode } from '../types/invite';

export const inviteBrands: Partial<Record<string, { icon: string; color: string }>> = {
  '第一銀行 iLEO': { icon: 'ileo', color: '255 190 56' },
  '華南銀行 SnY': { icon: 'sny', color: '237 75 85' },
  '台北富邦 myMoney': { icon: 'fubon', color: '55 174 220' },
  '國泰世華': { icon: 'cube', color: '88 183 93' },
  '聯邦銀行 New New Bank': { icon: 'newnewbank', color: '255 160 91' },
  '遠東銀行 Bankee': { icon: 'bankee', color: '170 122 224' },
  '永豐銀行 DAWHO': { icon: 'dawho', color: '229 74 76' },
  '玉山銀行 e.Fingo': { icon: 'esun', color: '53 179 160' },
  '台新銀行 Richart': { icon: 'richart', color: '238 82 92' },
  '將來銀行 Next Bank': { icon: 'nextbank', color: '255 210 67' },
  '連線銀行 LINE BanK': { icon: 'linebank', color: '68 205 111' },
  '富邦 J 卡': { icon: 'fubon', color: '55 174 220' },
  '國泰 CUBE 卡': { icon: 'cube', color: '88 183 93' },
  '匯豐信用卡': { icon: 'hsbc', color: '235 68 75' },
  '聯邦賴點卡': { icon: 'unionbank', color: '237 82 88' },
  '聯邦吉鶴卡悠遊晶緻卡': { icon: 'unionbank', color: '237 82 88' },
  '永豐信用卡': { icon: 'dacard', color: '229 74 76' },
  '玉山熊本熊卡': { icon: 'esunwallet', color: '53 179 160' },
  '全盈+PAY': { icon: 'allwinpay', color: '255 171 67' },
  '全支付': { icon: 'pxpay', color: '72 154 229' },
  'icash Pay': { icon: 'icashpay', color: '243 143 63' },
  '街口支付': { icon: 'jkopay', color: '238 78 86' },
  '國泰證券': { icon: 'cathaysecurities', color: '88 183 93' },
  '永豐大戶投': { icon: 'dawhotou', color: '229 74 76' },
  Wise: { icon: 'wise', color: '163 211 85' },
  'Binance 幣安': { icon: 'binance', color: '240 185 11' },
  KAST: { icon: 'kast', color: '169 168 255' },
  'Telegram Wallet': { icon: 'telegram', color: '71 173 226' },
  Klook: { icon: 'klook', color: '255 112 79' },
  KKday: { icon: 'kkday', color: '79 202 204' },
  'Trip.com': { icon: 'trip', color: '104 164 255' },
  Uber: { icon: 'uber', color: '225 231 236' },
  GoShare: { icon: 'goshare', color: '92 203 234' },
  WeMo: { icon: 'wemo', color: '134 210 63' },
  'ChargeSPOT  共享行動電源': { icon: 'chargespot', color: '77 166 244' },
  'Uber Eats': { icon: 'ubereats', color: '90 204 128' },
  Foodpanda: { icon: 'foodpanda', color: '255 105 166' },
  Foodomo: { icon: 'foodomo', color: '255 156 82' },
  '王品瘋美食': { icon: 'wowprime', color: '237 79 87' },
  'PK 雙饗卡': { icon: 'pkcard', color: '237 79 87' },
  'ShopBack 導購': { icon: 'shopback', color: '242 83 96' },
  Dynadot: { icon: 'dynadot', color: '117 166 255' },
  HanaCell: { icon: 'hanacell', color: '240 149 70' },
  'Muse.ai': { icon: 'muse', color: '255 151 190' },
};

const fallbackColors = ['255 156 112', '133 197 255', '122 214 173', '199 163 255', '255 151 190', '231 199 111'];

/** Stable title-based color; new services need no design entry. */
export function getInviteBrand(title: string): { icon?: string; color: string } {
  const index = Array.from(title).reduce((hash, character) => (hash * 31 + character.codePointAt(0)!) % fallbackColors.length, 0);
  return inviteBrands[title] ?? { color: fallbackColors[index] };
}

/** Logos first, then one group; avoid the previous selection when equivalent choices exist. */
export function selectHeroCodes(codes: InviteCode[], random = Math.random, previousTitles: string[] = []): InviteCode[] {
  const active = codes.filter(code => code.status === 'active');
  for (let i = active.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [active[i], active[j]] = [active[j], active[i]];
  }

  const hasLogo = (code: InviteCode) => Boolean(getInviteBrand(code.title).icon);
  const logos = active.filter(hasLogo);
  const counts = new Map<string, number>();
  for (const code of logos.length ? logos : active) {
    counts.set(code.group, (counts.get(code.group) ?? 0) + 1);
  }
  const groups = [...counts].sort((a, b) => Math.min(3, b[1]) - Math.min(3, a[1]));
  const previousGroup = active.find(code => previousTitles.includes(code.title))?.group;
  const primaryGroup = groups.find(([group, count]) =>
    group !== previousGroup && Math.min(3, count) === Math.min(3, groups[0][1]),
  )?.[0] ?? groups[0]?.[0];

  active.sort((a, b) =>
    Number(hasLogo(b)) - Number(hasLogo(a)) ||
    Number(b.group === primaryGroup) - Number(a.group === primaryGroup),
  );
  const selected = active.slice(0, 3);
  if (selected.length && selected.length === previousTitles.length && selected.every(code => previousTitles.includes(code.title))) {
    const last = selected[selected.length - 1];
    const alternative = active.slice(3).find(code => code.group === last.group && hasLogo(code) === hasLogo(last));
    if (alternative) selected[selected.length - 1] = alternative;
  }
  return selected;
}
