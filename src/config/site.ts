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
      name: 'FX-Pulse',
      role: '個人作品',
      period: '2026',
      image: '/images/projects/fx-pulse/home.png',
      customDescription: 'FX Pulse — 匯率脈動。每日自動抓取 VISA、Mastercard、JCB 三大信用卡組織官方匯率並排比較，同幣別最優匯率自動標綠、最差標紅，搭配 ECharts 互動式三線歷史走勢圖。前端 Astro 6 + Tailwind v4 部署於 GitHub Pages，爬蟲透過 GitHub Actions 排程，零伺服器成本。目前運行於 fx.purr.tw。',
      techStack: [
        'Python 3.12',
        'Poetry',
        'curl-cffi',
        'Astro 6',
        'Tailwind CSS v4',
        'ECharts',
        'GitHub Actions',
      ],
      highlights: [
        '同幣別三家匯率並排比較，最優自動標綠、最差標紅，省去逐站比價。',
        'JCB 無公開 API，從 jcb.jp 抓取 USD 基準匯率，以 cross-rate 推算全 8 幣別。',
        '以 curl-cffi 模擬 Chrome TLS 指紋，成功繞過 VISA Cloudflare 與 Mastercard Akamai 防護。',
        '互動走勢圖（ECharts）三線對比、點擊幣別卡片切換、支援滑動縮放。',
        '每日抓取後自動掃描近 7 天缺漏、JCB 週末自動跳過，確保歷史資料完整。',
        '彈性 CLI：支援指定來源 / 日期 / 區間 / 月份、dry-run、整月平行批量抓取。',
      ],
      screenshots: [
        { src: '/images/projects/fx-pulse/home.png', caption: '首頁即時匯率：同幣別三家並排，最優標綠、最差標紅' },
        { src: '/images/projects/fx-pulse/full-usd.png', caption: 'USD 三線歷史走勢圖（ECharts），支援滑動縮放' },
        { src: '/images/projects/fx-pulse/jpy-chart.png', caption: '點擊幣別卡片即切換走勢圖 — JPY 為例' },
      ],
      tags: ['Python', 'Astro', 'Scraper', 'GitHub Actions', 'Serverless'],
    },
    {
      name: 'yannick-stock-checker',
      role: '個人作品',
      period: '2026',
      image: '/images/projects/yannick/demo.png',
      customDescription: '亞尼克 YTM 庫存查詢。以商品為核心建立反向索引，快速定位仍有現貨的 YTM 站點。FastAPI + Astro 同時提供網頁查詢與 REST API，內建快取、限流與重試機制，兼顧查詢速度與來源負載。目前運行於 yannick.purr.tw。',
      techStack: [
        'Python 3.11',
        'FastAPI',
        'Astro 6',
        'SQLite',
        'Docker',
        'pytest',
      ],
      highlights: [
        '商品導向反向索引：從商品查站點，省去逐站翻 YTM 庫存的時間成本。',
        '同時提供網頁查詢介面與完整 REST API，可串自建工具、通知流程或資料分析。',
        '內建快取（TTL）、併發限流、退避重試，兼顧查詢速度與對來源網站的友善度。',
        'FastAPI 對外提供同一個入口，Docker 一鍵啟動內含 Astro 靜態檔案。',
        '完整 pytest 覆蓋率與 coverage 報告，部署可靠度有保障。',
      ],
      screenshots: [
        { src: '/images/projects/yannick/demo.png', caption: '商品總覽 — 顯示有貨商品數與可購買站點數' },
        { src: '/images/projects/yannick/detail.png', caption: '點開單一商品可看所有仍有貨的 YTM 站點' },
      ],
      tags: ['Python', 'FastAPI', 'Astro', 'Scraper', 'API'],
    },
    {
      name: 'MailCat',
      role: '個人作品',
      period: '2024',
      image: '/images/projects/mailcat/inbox.png',
      customDescription: 'Google Apps Script 打造的 Gmail 自動化規則管理器。自動替銀行、電子支付信件加上標籤、定時刪除登入通知、封存已讀信件、備份電子帳單附件至 Google Drive。',
      techStack: ['Google Apps Script', 'JavaScript', 'Gmail API', 'Google Drive API'],
      highlights: [
        '支援 20+ 家台灣銀行與電子支付的信件自動標記',
        '將銀行信件分類為登入通知、交易通知、電子帳單三類',
        '定時刪除登入通知，封存已讀交易信件',
        '自動備份電子帳單附件至 Google Drive 指定資料夾',
        '⭐ 26 顆星，台灣 GAS 社群熱門工具',
      ],
      screenshots: [
        { src: '/images/projects/mailcat/inbox.png', caption: '銀行信件自動分類為「登入通知 / 交易通知 / 電子帳單」並掛上對應銀行子標籤' },
      ],
      tags: ['Google Apps Script', 'Gmail', 'Automation'],
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
      tags: ['Python', 'CLI', 'Scraper'],
    },
    {
      name: 'ShortYou',
      role: '個人作品',
      period: '2022 – 2026',
      image: '/images/projects/shortyou/home.png',
      customDescription: '輕量、可自行部署的短網址服務，採前後端分離：前端用 Astro 5 + Tailwind 部署於靜態主機，後端維持 Google Apps Script + Google Sheets 儲存。公開查詢與「受邀建立」拆開，建立流程以 capability token 控管並可串接 Cloudflare Turnstile。目前運行於 s.purr.tw。',
      techStack: [
        'Astro 5',
        'TypeScript',
        'Tailwind CSS',
        'Google Apps Script',
        'Google Sheets',
        'Cloudflare Turnstile',
        'clasp',
      ],
      highlights: [
        '前端改寫為 Astro 5 + Tailwind，hash 路由可直接部署在 GitHub Pages 等靜態主機。',
        'GAS 後端以 TypeScript + clasp 開發，分層為 controller / services / repository。',
        '受邀使用者透過 capability token 進入授權建立模式，並可加上 Cloudflare Turnstile 驗證。',
        '建置腳本自動同步 runtime config bootstrap，前後端設定獨立可維護。',
        '支援自訂與隨機 alias，產出格式如 s.purr.tw/#alias。',
        '公開首頁僅提供 playground 展示，不會真的建立短網址。',
      ],
      screenshots: [
        { src: '/images/projects/shortyou/home.png', caption: '公開首頁 — playground 展示，不會真的建立短網址' },
        { src: '/images/projects/shortyou/home-with-alias.png', caption: '輸入自訂 alias 預覽要產生的短連結格式' },
        { src: '/images/projects/shortyou/result-qr.png', caption: '建立完成的結果頁，附上可掃描的 QR Code' },
        { src: '/images/projects/shortyou/authorized-mode.png', caption: '透過 Token 進入授權建立模式' },
        { src: '/images/projects/shortyou/redirect-resolving.png', caption: '訪問短連結時的過場畫面' },
      ],
      tags: ['Astro', 'Google Apps Script', 'Serverless', 'URL Shortener', 'Capability Token'],
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
      tags: ['Google Apps Script', 'Gmail', 'TypeScript'],
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
      tags: ['Python', 'Security', 'RSS'],
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
