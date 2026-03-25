/**
 * Site Configuration
 * Following SOLID principles: Single Responsibility
 */
import type { ProjectMeta } from '../types/projects';

export const siteConfig = {
  title: '黑糖ㄉ貓窩',
  titleEn: "HeiTang's Den",
  description: '你好！我是黑糖，是一位軟體工程師，出沒於資訊社群，歡迎捕捉！喜愛寫程式來解決生活中繁瑣的事。',
  descriptionEn: 'Hello! I am HeiTang, a software engineer who loves to write code to solve everyday problems. You can often find me in tech communities, so feel free to catch me there!',
  author: 'HeiTang',
  url: 'https://purr.tw',
  domain: 'purr.tw',
  
  // Social links
  social: {
    github: 'https://github.com/HeiTang',
    email: 'heitang@purr.tw',
  },
  
  // Features
  features: {
    i18n: true,
    darkMode: true,
    search: true,
    rss: true,
    analytics: true,
  },
  
  // Google Analytics
  googleAnalyticsId: '', // TODO: Add GA4 ID
  
  // Projects: repos shown in addition to GitHub Pinned repos
  // Fill in meta for each project to power the portfolio Modal.
  projectsWhitelist: [
    {
      name: 'MailCat',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/MailCat',
      customDescription: '一款輕量級 CLI 工具，讓開發者能在終端機直接寄送 Email，無需打開任何介面。設計用於自動化工作流程、CI/CD 通知推送，以及各種需要程式化發信的情境。',
      techStack: ['Node.js', 'TypeScript', 'SMTP', 'Commander.js', 'Nodemailer'],
      highlights: [
        '以 CLI 方式快速寄送 HTML / 純文字 Email',
        '支援 SMTP 自訂設定與 .env 環境變數管理',
        '可作為 CI/CD pipeline 中的通知工具',
        '支援附件、多收件人、CC / BCC 等完整 Email 欄位',
        '零依賴部署，npm install 即可使用',
        '提供互動式設定精靈，降低初次使用門檻',
      ],
      screenshots: [],
      tags: ['CLI', 'Tool', 'TypeScript', 'Open Source'],
      blogPost: '/blog/mailcat',
    },
    {
      name: 'AniCat-v2',
      role: '個人作品',
      period: '2023',
      image: 'https://opengraph.githubassets.com/1/HeiTang/AniCat-v2',
      customDescription: 'Anime1.me 動畫下載器，透過解析頁面自動抓取影片連結，支援批量下載與進度追蹤，讓追番更省力。',
      techStack: ['Python', 'requests', 'BeautifulSoup', 'ffmpeg'],
      highlights: [
        '自動解析 Anime1.me 影片串流連結並下載',
        '支援整季批量下載，自動依集數命名',
        '以 ffmpeg 合併分段串流（m3u8 → mp4）',
        '友善的 CLI 進度列與錯誤重試機制',
        '⭐ 18 顆星，動畫社群熱門工具',
      ],
      screenshots: [],
      tags: ['Python', 'CLI', 'Scraper', 'Open Source'],
    },
    {
      name: 'ShortYou',
      role: '個人作品',
      period: '2022',
      image: 'https://opengraph.githubassets.com/1/HeiTang/ShortYou',
      customDescription: '輕量短網址服務，支援自訂 slug 與點擊數統計，提供簡潔的管理介面，可自架部署於個人伺服器。',
      techStack: ['Node.js', 'Express', 'MongoDB', 'HTML', 'CSS'],
      highlights: [
        '自訂 slug 短網址，避免冗長的原始連結',
        '後台管理介面，一覽所有縮址與點擊統計',
        'MongoDB 持久化儲存，支援多使用者',
        '⭐ 9 顆星，可自架的 URL Shortener 方案',
      ],
      screenshots: [],
      tags: ['Node.js', 'Web', 'Tool', 'Open Source'],
    },
    {
      name: 'Gmail-Archiver',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Gmail-Archiver',
      customDescription: '將 Gmail 郵件與附件匯出為 PDF 或 EML 格式的歸檔工具，適合需要長期保存重要信件的使用者。',
      techStack: ['TypeScript', 'Node.js', 'Gmail API', 'Google OAuth2'],
      highlights: [
        '透過 Gmail API 授權存取，安全無需密碼',
        '支援匯出為 PDF（含排版）或標準 EML 格式',
        '可批量處理指定標籤或搜尋條件的郵件',
        '附件自動下載並與信件對應歸類',
      ],
      screenshots: [],
      tags: ['TypeScript', 'CLI', 'Tool', 'Google API'],
    },
    {
      name: 'Zrss',
      role: '個人作品',
      period: '2023',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Zrss',
      customDescription: '將 HITCON ZeroDay 漏洞揭露清單轉為 RSS Feed，讓資安研究者能透過任何 RSS 閱讀器訂閱最新漏洞資訊。',
      techStack: ['Python', 'feedgen', 'requests', 'BeautifulSoup'],
      highlights: [
        '爬取 HITCON ZeroDay 漏洞清單並轉為標準 RSS',
        '支援 Atom / RSS 2.0 格式輸出',
        '可搭配 RSS 閱讀器（如 Inoreader、Feedly）訂閱',
        '資安社群實用小工具，Read-Only 資料來源',
      ],
      screenshots: [],
      tags: ['Python', 'Security', 'RSS', 'Open Source'],
    },
    {
      name: 'Travel-Advisory',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Travel-Advisory',
      customDescription: '全球旅遊警示監控系統，自動彙整各國外交部旅遊警示資訊，提供統一格式查詢與定期推播通知。',
      techStack: ['Python', 'FastAPI', 'schedule', 'Line Notify'],
      highlights: [
        '彙整台灣外交部等多來源旅遊安全警示',
        '定期爬取並比對異動，偵測警示等級變化',
        '支援 Line Notify / Email 推播異動通知',
        '統一 API 介面，方便整合至其他應用',
      ],
      screenshots: [],
      tags: ['Python', 'API', 'Monitor', 'Travel'],
      hideGithubLink: true,
    },
  ] as ProjectMeta[],

  // Navigation
  nav: {
    zh: [
      { label: '首頁', href: '/' },
      { label: '文章', href: '/blog' },
      { label: '專案', href: '/projects' },
      { label: '邀請碼', href: '/invite-codes' },
      { label: '關於', href: '/about' },
    ],
    en: [
      { label: 'Home', href: '/en' },
      { label: 'Blog', href: '/en/blog' },
      { label: 'Projects', href: '/en/projects' },
      { label: 'Invite Codes', href: '/en/invite-codes' },
      { label: 'About', href: '/en/about' },
    ],
  },
  
  // Default language
  defaultLang: 'zh' as const,
  
  // Supported languages
  supportedLangs: ['zh', 'en'] as const,
} as const;

export type SupportedLang = typeof siteConfig.supportedLangs[number];
