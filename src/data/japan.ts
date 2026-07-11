export type PrefectureLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const japanLevelLabels = [
  { level: 0, label: '未踏', description: '尚未到訪' },
  { level: 1, label: '通過', description: '交通路過，未下車' },
  { level: 2, label: '接地', description: '下車、轉乘或短暫休息' },
  { level: 3, label: '到訪', description: '觀光或一日活動，未過夜' },
  { level: 4, label: '住宿', description: '至少過夜一次' },
  { level: 5, label: '居住', description: '曾長期生活或工作' },
] as const;

const prefectureDefinitions = [
  { id: '北海道', name: '北海道', region: '北海道' },
  { id: '青森', name: '青森', region: '東北' },
  { id: '岩手', name: '岩手', region: '東北' },
  { id: '宮城', name: '宮城', region: '東北' },
  { id: '秋田', name: '秋田', region: '東北' },
  { id: '山形', name: '山形', region: '東北' },
  { id: '福島', name: '福島', region: '東北' },
  { id: '茨城', name: '茨城', region: '關東' },
  { id: '栃木', name: '栃木', region: '關東' },
  { id: '群馬', name: '群馬', region: '關東' },
  { id: '埼玉', name: '埼玉', region: '關東' },
  { id: '千葉', name: '千葉', region: '關東' },
  { id: '東京', name: '東京', region: '關東' },
  { id: '神奈川', name: '神奈川', region: '關東' },
  { id: '新潟', name: '新潟', region: '中部' },
  { id: '富山', name: '富山', region: '中部' },
  { id: '石川', name: '石川', region: '中部' },
  { id: '福井', name: '福井', region: '中部' },
  { id: '山梨', name: '山梨', region: '中部' },
  { id: '長野', name: '長野', region: '中部' },
  { id: '岐阜', name: '岐阜', region: '中部' },
  { id: '静岡', name: '靜岡', region: '中部' },
  { id: '愛知', name: '愛知', region: '中部' },
  { id: '三重', name: '三重', region: '近畿' },
  { id: '滋賀', name: '滋賀', region: '近畿' },
  { id: '京都', name: '京都', region: '近畿' },
  { id: '大阪', name: '大阪', region: '近畿' },
  { id: '兵庫', name: '兵庫', region: '近畿' },
  { id: '奈良', name: '奈良', region: '近畿' },
  { id: '和歌山', name: '和歌山', region: '近畿' },
  { id: '鳥取', name: '鳥取', region: '中國' },
  { id: '島根', name: '島根', region: '中國' },
  { id: '岡山', name: '岡山', region: '中國' },
  { id: '広島', name: '廣島', region: '中國' },
  { id: '山口', name: '山口', region: '中國' },
  { id: '徳島', name: '德島', region: '四國' },
  { id: '香川', name: '香川', region: '四國' },
  { id: '愛媛', name: '愛媛', region: '四國' },
  { id: '高知', name: '高知', region: '四國' },
  { id: '福岡', name: '福岡', region: '九州・沖繩' },
  { id: '佐賀', name: '佐賀', region: '九州・沖繩' },
  { id: '長崎', name: '長崎', region: '九州・沖繩' },
  { id: '熊本', name: '熊本', region: '九州・沖繩' },
  { id: '大分', name: '大分', region: '九州・沖繩' },
  { id: '宮崎', name: '宮崎', region: '九州・沖繩' },
  { id: '鹿児島', name: '鹿兒島', region: '九州・沖繩' },
  { id: '沖縄', name: '沖繩', region: '九州・沖繩' },
] as const;

export type PrefectureId = (typeof prefectureDefinitions)[number]['id'];

/** 只需填寫非零等級；未列出的都道府縣會自動視為 0。 */
export const japanPrefectureLevels: Partial<Record<PrefectureId, PrefectureLevel>> = {
  北海道: 4,
  青森: 0,
  岩手: 0,
  宮城: 0,
  秋田: 0,
  山形: 0,
  福島: 0,
  茨城: 0,
  栃木: 0,
  群馬: 0,
  埼玉: 3,
  千葉: 0,
  東京: 4,
  神奈川: 3,
  新潟: 0,
  富山: 0,
  石川: 0,
  福井: 0,
  山梨: 4,
  長野: 4,
  岐阜: 1,
  静岡: 1,
  愛知: 1,
  三重: 0,
  滋賀: 2,
  京都: 4,
  大阪: 5,
  兵庫: 4,
  奈良: 3,
  和歌山: 3,
  鳥取: 0,
  島根: 0,
  岡山: 4,
  広島: 3,
  山口: 0,
  徳島: 4,
  香川: 4,
  愛媛: 0,
  高知: 0,
  福岡: 4,
  佐賀: 3,
  長崎: 3,
  熊本: 4,
  大分: 3,
  宮崎: 0,
  鹿児島: 0,
  沖縄: 4,
};

const ids = new Set(prefectureDefinitions.map(prefecture => prefecture.id));

if (prefectureDefinitions.length !== 47 || ids.size !== 47) {
  throw new Error('[japan] prefecture definitions must contain exactly 47 unique entries');
}

for (const [id, level] of Object.entries(japanPrefectureLevels)) {
  if (!ids.has(id as PrefectureId) || !Number.isInteger(level) || level < 0 || level > 5) {
    throw new Error(`[japan] invalid prefecture level: ${id}=${level}`);
  }
}

export const japanPrefectures = prefectureDefinitions.map(prefecture => ({
  ...prefecture,
  level: japanPrefectureLevels[prefecture.id] ?? 0,
}));

export const japanPrefectureById = new Map(
  japanPrefectures.map(prefecture => [prefecture.id, prefecture]),
);
