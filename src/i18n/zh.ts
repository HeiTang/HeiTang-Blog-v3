export const zh = {
  nav: {
    home: '首頁',
    blog: '文章',
    projects: '專案',
    inviteCodes: '邀請碼',
    about: '關於',
  },
  home: {
    greeting: '嗨，我是',
    bio: '橘貓工程師 · 技術部落客 · 開源愛好者',
    blogCta: '閱讀文章',
    projectsCta: '查看專案',
  },
  blog: {
    title: '文章',
    searchPlaceholder: '搜尋文章...',
    allTags: '全部',
    readMore: '繼續閱讀',
    readingTime: '分鐘閱讀',
    noResults: '找不到相關文章',
    publishedOn: '發布於',
    updatedOn: '更新於',
  },
  projects: {
    title: 'GitHub 專案',
    pinned: '精選置頂',
    all: '所有專案',
    stars: '星星',
    forks: 'Fork',
    viewOnGitHub: '在 GitHub 上查看',
    noRepos: '暫無公開專案',
  },
  inviteCodes: {
    title: '邀請碼',
    description: '分享我使用並推薦的各類服務邀請碼',
    service: '服務',
    code: '邀請碼',
    copy: '複製',
    copied: '已複製！',
    visit: '前往',
    expiry: '到期日',
    status: {
      active: '有效',
      expired: '已到期',
      limited: '名額有限',
    },
    noData: '目前暫無邀請碼',
    lastUpdated: '最後更新',
  },
  about: {
    title: '關於我',
  },
  footer: {
    builtWith: '用 Astro 建立',
    rights: '版權所有',
  },
  error: {
    notFound: '頁面不存在',
    goHome: '回到首頁',
  },
} as const;

export type Translations = typeof zh;
