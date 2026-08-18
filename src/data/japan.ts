import {
  getJapanStats,
  levelLabels,
  prefectures,
  type PrefectureLevel,
  type PrefectureLevels,
} from 'japan-prefecture-map/data';

export type { PrefectureLevel } from 'japan-prefecture-map/data';

/** 只需填寫非零等級；未列出的都道府縣會自動視為 0。 */
export const japanPrefectureLevels = {
  '01': 4,
  '11': 3,
  '13': 4,
  '14': 3,
  '19': 4,
  '20': 4,
  '21': 1,
  '22': 1,
  '23': 1,
  '25': 2,
  '26': 4,
  '27': 5,
  '28': 4,
  '29': 3,
  '30': 3,
  '33': 4,
  '34': 3,
  '36': 4,
  '37': 4,
  '40': 4,
  '41': 3,
  '42': 3,
  '43': 4,
  '44': 3,
  '47': 4,
} satisfies PrefectureLevels;

export const japanLevelLabels = levelLabels['zh-TW'].map((item, level) => ({
  level: level as PrefectureLevel,
  ...item,
}));

export const japanPrefectures = prefectures.map(prefecture => ({
  id: prefecture.code,
  name: prefecture.names['zh-TW'],
  level: japanPrefectureLevels[prefecture.code] ?? 0,
}));

export const japanStats = getJapanStats(japanPrefectureLevels);

export const japanScore = japanStats.score;
