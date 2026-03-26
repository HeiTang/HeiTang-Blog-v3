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
      customDescription: 'Google Apps Script 打造的 Gmail 自動化規則管理器。自動替銀行、電子支付信件加上標籤、定時刪除登入通知、封存已讀信件、備份電子帳單附件至 Google Drive。',
      techStack: ['Google Apps Script', 'JavaScript', 'Gmail API', 'Google Drive API'],
      highlights: [
        '支援 20+ 家台灣銀行與電子支付的信件自動標記',
        '將銀行信件分類為登入通知、交易通知、電子帳單三類',
        '定時刪除登入通知，封存已讀交易信件',
        '自動備份電子帳單附件至 Google Drive 指定資料夾',
        '⭐ 26 顆星，台灣 GAS 社群熱門工具',
      ],
      screenshots: [],
      tags: ['GAS', 'Gmail', 'Automation', 'Open Source'],
      blogPost: '/blog/mailcat',
    },
    {
      name: 'AniCat-v2',
      role: '個人作品',
      period: '2023',
      image: 'https://opengraph.githubassets.com/1/HeiTang/AniCat-v2',
      customDescription: 'Anime1.me 動畫下載器，透過互動式 CLI 輸入動畫連結後自動下載，支援單集、整季批量下載與即時進度顯示。',
      techStack: ['Python', 'requests', 'InquirerPy', 'tqdm'],
      highlights: [
        '支援單集連結與整季 category 連結兩種格式',
        '支援多連結同時輸入，以逗號分隔批量處理',
        '互動式 CLI 介面，搭配即時下載進度條',
        '⭐ 18 顆星，動畫社群實用工具',
      ],
      screenshots: [],
      tags: ['Python', 'CLI', 'Scraper', 'Open Source'],
    },
    {
      name: 'ShortYou',
      role: '個人作品',
      period: '2022',
      image: 'https://opengraph.githubassets.com/1/HeiTang/ShortYou',
      customDescription: '完全免費的短網址服務，以 GitHub Pages 作為前端、Google Apps Script 作為後端 API，零伺服器成本即可自架部署。目前運行於 t.purr.tw。',
      techStack: ['GitHub Pages', 'Google Apps Script', 'JavaScript', 'HTML', 'CSS'],
      highlights: [
        '前端部署於 GitHub Pages，完全 Serverless 架構',
        '以 Google Apps Script 處理縮址邏輯與儲存',
        '支援自訂短網址 slug，產出格式如 t.purr.tw/#slug',
        '整合 reCAPTCHA 防止濫用，並記錄請求 IP',
        '⭐ 9 顆星，零成本可自架的短網址方案',
      ],
      screenshots: [],
      tags: ['GAS', 'Serverless', 'Web', 'Open Source'],
    },
    {
      name: 'Gmail-Archiver',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Gmail-Archiver',
      customDescription: '以 Google Apps Script（TypeScript + clasp）開發的 Gmail 郵件歸檔工具，可將指定標籤的信件匯出為 PDF 或 EML，並整理成清晰的資料夾結構存至 Google Drive。',
      techStack: ['Google Apps Script', 'TypeScript', 'clasp', 'Gmail API', 'Google Drive API'],
      highlights: [
        '將 Gmail 信件轉為 PDF，自動嵌入 CID 內嵌圖片',
        '支援匯出原始 .eml 格式，可匯入其他郵件客戶端',
        '自動抽取附件並與信件對應分資料夾存放',
        '依 Gmail 標籤自動建立層級式資料夾結構於 Google Drive',
      ],
      screenshots: [],
      tags: ['GAS', 'Gmail', 'Tool', 'TypeScript'],
    },
    {
      name: 'Zrss',
      role: '個人作品',
      period: '2023',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Zrss',
      customDescription: '將 HITCON ZeroDay 漏洞揭露清單轉為 RSS Feed，讓資安研究者能透過任何 RSS 閱讀器訂閱最新漏洞資訊，無需頻繁手動查看網站。',
      techStack: ['Python', 'feedgen', 'requests', 'BeautifulSoup', 'GitHub Actions'],
      highlights: [
        '爬取 HITCON ZeroDay 全部與進行中漏洞清單',
        '產出標準 RSS 2.0 XML，託管於 GitHub raw 連結',
        '透過 GitHub Actions 定期自動更新，免自架伺服器',
        '可直接貼入 Inoreader、Feedly 等 RSS 閱讀器使用',
      ],
      screenshots: [],
      tags: ['Python', 'Security', 'RSS', 'Open Source'],
    },
    {
      name: 'Travel-Advisory',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Travel-Advisory',
      customDescription: 'RiskRadar — 全球旅遊警示監控系統。追蹤美國國務院 200+ 個國家旅遊警示等級，透過 Telegram Bot 提供即時查詢、訂閱監控與警示變動推播。',
      techStack: ['Python', 'FastAPI', 'PostgreSQL', 'python-telegram-bot', 'Docker', 'Google Cloud Run'],
      highlights: [
        '追蹤美國國務院 200+ 國家旅遊警示，每日自動爬取比對',
        'Telegram Bot 支援即時查詢、Inline Mode 分享、Watchlist 訂閱',
        '警示等級變動時主動推播通知訂閱用戶',
        '支援英文 / 繁體中文依 Telegram 語系自動切換',
        '部署於 Google Cloud Run，搭配 GitHub Actions CI/CD',
      ],
      screenshots: [],
      tags: ['Python', 'Telegram', 'FastAPI', 'Monitor'],
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
