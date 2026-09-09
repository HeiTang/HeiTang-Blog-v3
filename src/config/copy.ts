interface SkillGroup {
  label: string;
  skills: readonly string[];
}

interface SiteCopy {
  blog: { title: string; description: string; allTags: string; articleCount: string; emptyState: string; readingTime: string; publishedOn: string; updatedOn: string };
  projects: { title: string; description: string; noRepos: string; noMatchingProjects: string; allFilter: string };
  inviteCodes: { title: string; description: string; noData: string; lastUpdated: string; allFilter: string; loadError: string; noApiUrl: string };
  about: { title: string; description: string; heading: string; name: string; tagline: string; bio1: string; bio2: string; bio3: string; skillsTitle: string; skillGroups: SkillGroup[] };
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
    title: 'GitHub 專案',
    description: '瀏覽黑糖的 GitHub 專案與個人作品，包含網站、資料查詢與自動化工具，了解使用技術、功能與開發成果。',
    noRepos: '暫無公開專案',
    noMatchingProjects: '沒有符合的專案',
    allFilter: '全部',
  },
  inviteCodes: {
    title: '邀請碼',
    description: '分享我使用並推薦的各類服務邀請碼',
    noData: '目前暫無邀請碼',
    lastUpdated: '最後更新',
    allFilter: '全部',
    loadError: '無法載入邀請碼，請稍後再試。',
    noApiUrl: '尚未設定 INVITE_CODES_API_URL 環境變數。',
  },
  about: {
    title: '關於我',
    description: '認識黑糖，一位喜歡用程式解決生活瑣事的軟體工程師，了解我的前後端開發、自動化與 DevOps 技能。',
    heading: '關於黑糖',
    name: '黑糖不是炭',
    tagline: '程式通靈師',
    bio1: '橘貓不胖，只是蓬鬆了點！ヽ(=^･ω･^=)丿',
    bio2: '這裡記錄著我的技術學習、專案開發、以及各種實用資源分享。',
    bio3: '#勿毛色歧視',
    skillsTitle: '技能', // 繁體中文用「技術棧」或「技術堆疊」都可以，這裡選擇了「技術棧」
    skillGroups: [
      { label: '前端', skills: ['TypeScript', 'JavaScript', 'Astro', 'Tailwind CSS', 'HTML / CSS'] },
      { label: '後端', skills: ['Python', 'Flask', 'Django', 'PHP', 'Laravel'] },
      { label: '資料庫', skills: ['MySQL', 'PostgreSQL', 'SQL Server', 'InfluxDB', 'SQLite', 'Redis'] },
      { label: 'DevOps & 雲端', skills: ['Docker', 'Docker Swarm', 'GitHub Actions', 'Jenkins', 'Linux', 'Nginx', 'Cloudflare', 'AWS', 'Google Cloud', 'Prometheus', 'Grafana'] },
      { label: 'APIs & 自動化', skills: ['REST API', 'Swagger', 'OpenAPI', 'Selenium', 'Requests', 'Apache Airflow', 'Google Apps Script'] },
      { label: '開發工具', skills: ['Git', 'Git flow', 'GitHub', 'Postman', 'Notion', 'Jira', 'Gemini', 'Copilot', 'Codex'] },
    ],
  },
  error: {
    notFound: '頁面不存在',
    desc: '橘貓找不到你要的頁面，也許它在睡覺？',
    goHome: '回到首頁',
  },
};
