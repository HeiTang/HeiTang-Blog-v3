import type { TechName } from '../data/tech-icons';

interface SkillGroup {
  label: string;
  skills: readonly TechName[];
}

interface SiteCopy {
  blog: { title: string; description: string; allTags: string; articleCount: string; emptyState: string; readingTime: string; publishedOn: string; updatedOn: string };
  projects: { title: string; description: string; noRepos: string; noMatchingProjects: string; allFilter: string };
  inviteCodes: { title: string; description: string; noData: string; lastUpdated: string; allFilter: string; loadError: string; noApiUrl: string };
  about: { title: string; heading: string; name: string; bio1: string; skillGroups: SkillGroup[] };
  error: { notFound: string; desc: string; goHome: string };
}

export const copy: SiteCopy = {
  blog: {
    title: '文章',
    description: '黑糖的技術筆記，記錄程式開發、專案實作與自動化經驗，分享解決問題的過程與心得。',
    allTags: '全部',
    articleCount: '篇文章',
    emptyState: '✍️ 文章即將到來…',
    readingTime: '分鐘閱讀',
    publishedOn: '發布於',
    updatedOn: '更新於',
  },
  projects: {
    title: '作品',
    description: '瀏覽黑糖的 GitHub 專案與個人作品，包含網站、資料查詢與自動化工具，了解使用技術、功能與開發成果。',
    noRepos: '暫無公開專案',
    noMatchingProjects: '沒有符合的專案',
    allFilter: '全部',
  },
  inviteCodes: {
    title: '邀請碼',
    description: '整理我持有的各類服務邀請碼與回饋資訊',
    noData: '目前暫無邀請碼',
    lastUpdated: '最後更新',
    allFilter: '全部',
    loadError: '無法載入邀請碼，請稍後再試。',
    noApiUrl: '尚未設定 INVITE_CODES_API_URL 環境變數。',
  },
  about: {
    title: '關於我',
    heading: '關於黑糖',
    name: '黑糖不是炭',
    bio1: '橘貓不胖，只是蓬鬆了點！ヽ(=^･ω･^=)丿',
    skillGroups: [
      { label: '後端', skills: ['Python', 'PHP', 'Laravel', 'FastAPI', 'REST API', 'OpenAPI'] },
      { label: '資料與自動化', skills: ['Pandas', 'Apache Airflow', 'Apps Script'] },
      { label: '資料庫', skills: ['MySQL', 'PostgreSQL', 'SQL Server', 'DB2', 'SQLite', 'Redis'] },
      { label: '部署與運維', skills: ['Docker', 'AWS', 'GitHub Actions', 'Jenkins', 'Azure DevOps', 'Prometheus', 'Grafana', 'Git flow'] },
      { label: '前端與 App', skills: ['TypeScript', 'Astro', 'Tailwind CSS', 'Flutter', 'Swift'] },
    ],
  },
  error: {
    notFound: '頁面不存在',
    desc: '橘貓找不到你要的頁面，也許它在睡覺？',
    goHome: '回到首頁',
  },
};
