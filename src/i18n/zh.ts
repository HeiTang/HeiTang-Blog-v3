export interface SkillGroup {
  label: string;
  skills: readonly string[];
}

export interface Translations {
  home: {
    greeting: string;
    typewriterTexts: string[];
    name: string;
    handle: string;
    subheadline: string;
    heroModeLabel: string;
    statusMessage: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    contactLabel: string;
    marqueeLead: string;
    scrollHint: string;
    deckTitle: string;
    deckSubtitle: string;
    deckCta: string;
    labTitle: string;
    labSubtitle: string;
    labLines: string[];
    journeyTitle: string;
    journeySubtitle: string;
    journeySteps: { title: string; desc: string }[];
    postsKicker: string;
    recentPostsTitle: string;
    recentPostsSubtitle: string;
    viewAllPosts: string;
    emptyRecentPosts: string;
    quickLinks: {
      blog: { title: string; desc: string };
      projects: { title: string; desc: string };
      about: { title: string; desc: string };
    };
    stats: {
      title: string;
      subtitle: string;
      latestPosts: string;
      projects: string;
      languages: string;
    };
    liveLabel: string;
    focusLabel: string;
  };
  blog: { title: string; allTags: string; articleCount: string; emptyState: string; readingTime: string; publishedOn: string; updatedOn: string };
  projects: { title: string; subtitle: string; noRepos: string; noMatchingProjects: string; allFilter: string };
  inviteCodes: { title: string; description: string; noData: string; lastUpdated: string; allFilter: string; loadError: string; noApiUrl: string };
  about: { title: string; heading: string; name: string; tagline: string; bio1: string; bio2: string; bio3: string; skillsTitle: string; skillGroups: SkillGroup[] };
  error: { notFound: string; desc: string; goHome: string };
}

export const zh: Translations = {
  home: {
    greeting: '嗨！我是一隻',
    typewriterTexts: ['Developer /ᐠ-˕-マⳊ', '不胖只是蓬鬆的橘貓 ₍˄•༝•˄₎◞✩︎', ' ₍^..^₎ 𐒡'],
    name: '黑糖不是炭',
    handle: 'HEITANG',
    subheadline: 'SOFTWARE ENGINEER · PERSONAL LAB',
    heroModeLabel: 'HEITANG',
    statusMessage: '橘貓不胖，只是蓬鬆了點！ヽ(=^･ω･^=)丿',
    intro: '我把日常工程問題拆解成可落地的工具與流程，這裡主要分享實作筆記、專案拆解，以及可直接拿去用的做法。',
    primaryCta: '看最新文章',
    secondaryCta: '看專案作品',
    contactLabel: '快速聯絡',
    marqueeLead: 'SYSTEM FEED',
    scrollHint: 'SCROLL',
    deckTitle: '貓窩洞口',
    deckSubtitle: '挑一個箱子',
    deckCta: '喵一下進入 →',
    labTitle: '近期動態',
    labSubtitle: '>_ Cat ./0range.log',
    labLines: [
      '[status] routine mode: on.',
      '[focus] break complex things into smaller steps.',
      '[note] finish first, optimize later.',
      '[update] log progress when there is progress; rest when there is not.',
      '[mode] quiet work in progress.',
      '[end] moved things forward a little today.',
    ],
    journeyTitle: '沉浸旅程',
    journeySubtitle: '從第一眼到深度互動，每一段都設計成有故事張力',
    journeySteps: [
      {
        title: 'MBTI',
        desc: 'INTJ-O-C (內向、直覺、思考、判斷 + 觀察者)',
      },
      {
        title: '生存三要素',
        desc: '鮭魚 🍣 、 拉麵 🍜 、 貓貓 🐈',
      },
      {
        title: '常說的一句話',
        desc: '今天絕對會早點睡！',
      },
    ],
    postsKicker: '最新更新',
    recentPostsTitle: '最新文章',
    recentPostsSubtitle: '最近的技術實作與拆解',
    viewAllPosts: '看全部文章 →',
    emptyRecentPosts: '目前還沒有文章，稍後會補上。',
    quickLinks: {
      blog: {
        title: '技術文章',
        desc: '架構、部署、自動化與踩坑紀錄。',
      },
      projects: {
        title: '專案展示',
        desc: '個人作品與 side project，含實作細節。',
      },
      about: {
        title: '關於我',
        desc: '背景、技術棧與目前正在做的事。',
      },
    },
    stats: {
      title: '快速概覽',
      subtitle: '首頁即時摘要',
      latestPosts: '最新文章',
      projects: '展示專案',
      languages: '站點語言',
    },
    liveLabel: 'LIVE',
    focusLabel: '目前聚焦',
  },
  blog: {
    title: '文章',
    allTags: '全部',
    articleCount: '篇文章',
    emptyState: '✍️ 文章即將到來…',
    readingTime: '分鐘閱讀',
    publishedOn: '發布於',
    updatedOn: '更新於',
  },
  projects: {
    title: 'GitHub 專案',
    subtitle: ' 的 GitHub 專案 — 點擊卡片查看詳情',
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
