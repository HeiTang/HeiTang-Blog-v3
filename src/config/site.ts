/**
 * Site Configuration
 * Following SOLID principles: Single Responsibility
 */
import type { ProjectMeta } from '../types/projects';
import fxPulseFullUsd from '../assets/projects/fx-pulse/full-usd.png';
import fxPulseHome from '../assets/projects/fx-pulse/home.png';
import fxPulseJpyChart from '../assets/projects/fx-pulse/jpy-chart.png';
import cardFluxActivityOverview from '../assets/projects/cardflux/activity-overview.png';
import cardFluxScheduleManagement from '../assets/projects/cardflux/schedule-management.png';
import cardFluxRegistrationIssueReview from '../assets/projects/cardflux/registration-issue-review.png';
import cardFluxExecutionHistory from '../assets/projects/cardflux/execution-history.png';
import mailcatInbox from '../assets/projects/mailcat/inbox.png';
import shortyouAuthorizedMode from '../assets/projects/shortyou/authorized-mode.png';
import shortyouHomeWithAlias from '../assets/projects/shortyou/home-with-alias.png';
import shortyouHome from '../assets/projects/shortyou/home.png';
import shortyouRedirectLaunch from '../assets/projects/shortyou/redirect-launch.png';
import shortyouResultMock from '../assets/projects/shortyou/result-mock.png';
import shortyouResultMockQr from '../assets/projects/shortyou/result-mock-qr.png';
import yannickHomeHero from '../assets/projects/yannick/home-hero.png';
import yannickHomeProductQuery from '../assets/projects/yannick/home-product-query.png';
import yannickHomeApiOverview from '../assets/projects/yannick/home-api-overview.png';
import yannickQuickQueryProductView from '../assets/projects/yannick/quick-query-product-view.png';

export const siteConfig = {
  title: '黑糖ㄉ貓窩',
  description: '你好！我是黑糖，是一位軟體工程師，出沒於資訊社群，歡迎捕捉！喜愛寫程式來解決生活中繁瑣的事。',
  author: 'HeiTang',
  url: 'https://purr.tw',
  domain: 'purr.tw',
  
  // Social links
  social: {
    github: 'https://github.com/HeiTang',
    discord: 'https://discord.com/users/463332148968030208',
    telegram: 'https://t.me/HeiTang',
    email: 'heitang@purr.tw',
  },
  
  // Features
  features: {
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
      title: 'FX-Pulse 信用卡匯率比較',
      summary: '出國刷卡前，把三家信用卡匯率放一起看。',
      category: '網站服務',
      homepage: 'https://fx.purr.tw/',
      role: '個人作品',
      period: '2026',
      image: fxPulseHome,
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
        { title: '同幣別三家匯率並排比較', description: '最優自動標綠、最差標紅，省去逐站比價。' },
        { title: 'JCB 無公開 API', description: '從 jcb.jp 抓取 USD 基準匯率，以 cross-rate 推算全 8 幣別。' },
        { title: 'curl-cffi 模擬 Chrome TLS 指紋', description: '成功繞過 VISA Cloudflare 與 Mastercard Akamai 防護。' },
        { title: '互動走勢圖（ECharts）', description: '三線對比、點擊幣別卡片切換、支援滑動縮放。' },
        { title: '每日抓取後自動掃描近 7 天缺漏', description: 'JCB 週末自動跳過，確保歷史資料完整。' },
        { title: '彈性 CLI', description: '支援指定來源 / 日期 / 區間 / 月份、dry-run、整月平行批量抓取。' },
      ],
      screenshots: [
        { src: fxPulseHome, caption: '首頁即時匯率：同幣別三家並排，最優標綠、最差標紅' },
        { src: fxPulseFullUsd, caption: 'USD 三線歷史走勢圖（ECharts），支援滑動縮放' },
        { src: fxPulseJpyChart, caption: '點擊幣別卡片即切換走勢圖 — JPY 為例' },
      ],
      tags: ['Python', 'Astro', 'Scraper', 'GitHub Actions', 'Serverless'],
    },
    {
      name: 'Remindly',
      title: 'Remindly 提醒機器人',
      summary: '用一句話設定提醒，到時間由 Telegram 通知。',
      category: '自動化工具',
      role: '個人作品',
      period: '2026',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Remindly',
      customDescription: 'Telegram 自然語言提醒機器人。支援私聊與群組建立提醒、資訊不足時互動追問、確認後寫入 SQLite、到期主動通知與一鍵延後提醒；採 long polling + Docker Compose 部署，不需要公開 webhook URL。',
      techStack: [
        'Python 3.12',
        'uv',
        'Telegram Bot API',
        'SQLite',
        'Docker Compose',
      ],
      highlights: [
        { title: '中文自然語言輸入', description: '例如「明天下午三點提醒我倒垃圾」。' },
        { title: '時間或事項不足時主動追問', description: '並提供常用時間快捷按鈕。' },
        { title: '群組文字模式', description: '可用指令、@bot 或管理員開啟的一般文字模式觸發。' },
        { title: 'DB-driven scheduler', description: '固定掃描並 claim 到期提醒，重啟後不會遺失排程。' },
        { title: '提醒送出後可一鍵延後', description: '10 分鐘、1 小時或明天同時間。' },
      ],
      screenshots: [],
      tags: ['Python', 'Telegram', 'Bot', 'SQLite', 'Docker'],
    },
    {
      name: 'GitHub-Stars-to-Obsidian',
      title: 'GitHub 收藏同步至 Obsidian',
      summary: '把收藏過的工具，整理成可搜尋的 Obsidian 筆記。',
      category: '自動化工具',
      role: '個人作品',
      period: '2026',
      image: 'https://opengraph.githubassets.com/1/HeiTang/GitHub-Stars-to-Obsidian',
      customDescription: '把 GitHub Star 同步成 Obsidian 可搜尋、可篩選的工具箱。核心以 Bash、gh CLI、jq 拉取 starred repos，輸出 Markdown notes 與 Dataview hub，讓曾經收藏的工具可以用 format、platform、topic、星數與全文搜尋重新找回來。',
      techStack: ['Bash', 'GitHub CLI', 'jq', 'Obsidian', 'Dataview'],
      highlights: [
        { title: '三維 schema', description: '將 starred repos 分類成 format、platforms、topics。' },
        { title: '互動式 Dataview hub', description: '支援 preset、chip filter、topic 搜尋、星數門檻與欄位排序。' },
        { title: '純 Bash 流程', description: '可在 macOS、Linux、WSL2 執行，不綁定特定 AI agent。' },
        { title: '日常維護工作流', description: '支援 diff-only、只更新統計、unstar 刪檔、補 topic、重新分類。' },
      ],
      screenshots: [],
      tags: ['Bash', 'Obsidian', 'GitHub', 'Automation', 'Knowledge Management'],
    },
    {
      name: 'yannick-stock-checker',
      title: '亞尼克 YTM 庫存查詢',
      summary: '想買的生乳捲，哪個站點還有貨？',
      category: '網站服務',
      homepage: 'https://yannick.purr.tw/',
      role: '個人作品',
      period: '2026',
      image: yannickHomeHero,
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
        { title: '商品導向反向索引', description: '從商品查站點，省去逐站翻 YTM 庫存的時間成本。' },
        { title: '網頁查詢介面與完整 REST API', description: '可串自建工具、通知流程或資料分析。' },
        { title: '快取（TTL）、併發限流、退避重試', description: '兼顧查詢速度與對來源網站的友善度。' },
        { title: 'FastAPI 對外提供同一個入口', description: 'Docker 一鍵啟動內含 Astro 靜態檔案。' },
        { title: '完整 pytest 覆蓋率與 coverage 報告', description: '部署可靠度有保障。' },
      ],
      screenshots: [
        { src: yannickHomeHero, caption: '首頁 — 即時庫存快照與全台庫存統計' },
        { src: yannickHomeProductQuery, caption: '商品查詢 — 從商品反查仍有現貨的 YTM 站點' },
        { src: yannickQuickQueryProductView, caption: '快速查詢 — 商品搜尋、站點篩選與定位入口' },
        { src: yannickHomeApiOverview, caption: 'API 總覽 — 商品、站點、庫存與服務狀態端點' },
      ],
      tags: ['Python', 'FastAPI', 'Astro', 'Scraper', 'API'],
    },
    {
      name: 'MailCat',
      title: 'MailCat 銀行信件自動整理',
      summary: '自動分類銀行通知，整理信箱裡的電子帳單。',
      category: '自動化工具',
      role: '個人作品',
      period: '2024 - 2026',
      image: mailcatInbox,
      customDescription: 'Google Apps Script 打造的 Gmail 自動化規則管理器。自動替銀行、電子支付信件加上標籤、定時刪除登入通知、封存已讀信件、備份電子帳單附件至 Google Drive。',
      techStack: ['Google Apps Script', 'JavaScript', 'Gmail API', 'Google Drive API'],
      highlights: [
        { title: '支援 20+ 家台灣銀行與電子支付', description: '信件自動標記。' },
        { title: '銀行信件分類', description: '登入通知、交易通知、電子帳單三類。' },
        { title: '定時刪除登入通知', description: '封存已讀交易信件。' },
        { title: '自動備份電子帳單附件', description: '至 Google Drive 指定資料夾。' },
        { title: '⭐ 26 顆星', description: '台灣 GAS 社群熱門工具。' },
      ],
      screenshots: [
        { src: mailcatInbox, caption: '銀行信件自動分類為「登入通知 / 交易通知 / 電子帳單」並掛上對應銀行子標籤' },
      ],
      tags: ['Google Apps Script', 'Gmail', 'Automation'],
      blogPost: '/blog/mailcat/',
    },
    {
      name: 'Medium-OPML-Exporter',
      title: 'Medium 追蹤清單匯出',
      summary: '把 Medium 追蹤清單帶到你喜歡的 RSS 閱讀器。',
      category: '自動化工具',
      role: '個人作品',
      period: '2025',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Medium-OPML-Exporter',
      customDescription: 'Medium Following 匯出工具。透過 userscript 在 Medium Following 頁面注入匯出按鈕，將追蹤清單轉成標準 OPML 檔，方便匯入 Feedly、Inoreader、NetNewsWire 等 RSS 閱讀器。',
      techStack: ['JavaScript', 'Userscript', 'Tampermonkey', 'OPML', 'RSS'],
      highlights: [
        { title: 'Medium OPML 匯出', description: '補足 Medium 沒有原生 follows OPML 匯出的缺口。' },
        { title: '標準 OPML', description: '可直接匯入常見 RSS reader。' },
        { title: '零後端、零依賴', description: '安裝 userscript 後在瀏覽器端完成匯出。' },
      ],
      screenshots: [],
      tags: ['JavaScript', 'Userscript', 'RSS', 'OPML'],
    },
    {
      name: 'PDF-Storm',
      title: 'PDF-Storm 批次下載工具',
      summary: '一次下載網頁上的 PDF，省下逐一點開的時間。',
      category: '自動化工具',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/PDF-Storm',
      customDescription: '批量 PDF 下載 userscript。自動偵測目前頁面上的 PDF 連結，提供一鍵批次下載與成功 / 失敗清單，適合整理課程資料、文件列表或公開資料頁面。',
      techStack: ['JavaScript', 'Userscript', 'Tampermonkey'],
      highlights: [
        { title: '自動掃描頁面 PDF 連結', description: '並集中下載。' },
        { title: '浮動面板', description: '顯示下載成功與失敗列表，方便回頭補抓。' },
        { title: 'userscript 形式安裝', description: '不需要額外後端服務。' },
      ],
      screenshots: [],
      tags: ['JavaScript', 'Userscript', 'PDF', 'Browser Tool'],
    },
    {
      name: 'AniCat-v2',
      title: 'AniCat 動畫下載器',
      summary: '從 Anime1 連結下載動畫，支援單集與整季。',
      category: '自動化工具',
      role: '個人作品',
      period: '2023 - 2026',
      image: 'https://opengraph.githubassets.com/1/HeiTang/AniCat-v2',
      customDescription: 'Anime1.me 動畫下載器，透過互動式 CLI 輸入動畫連結後自動下載，支援單集、整季批量下載與即時進度顯示。',
      techStack: ['Python', 'requests', 'InquirerPy', 'tqdm'],
      highlights: [
        { title: '單集連結與整季 category 連結', description: '支援兩種格式。' },
        { title: '多連結同時輸入', description: '以逗號分隔批量處理。' },
        { title: '互動式 CLI 介面', description: '搭配即時下載進度條。' },
        { title: '⭐ 18 顆星', description: '動畫社群實用工具。' },
      ],
      screenshots: [],
      tags: ['Python', 'CLI', 'Scraper'],
    },
    {
      name: 'FCU-CourseData',
      title: '逢甲大學課程資料集',
      summary: '整理歷年逢甲課程資訊，方便查詢與再利用。',
      category: '資料與訂閱',
      role: '個人作品',
      period: '2020 – 2026',
      image: 'https://opengraph.githubassets.com/1/HeiTang/FCU-CourseData',
      customDescription: '逢甲大學課程資料集與爬取工具。整理 101 學年度起各年度開設課程資訊，搭配 CourseAPI 查詢格式文件與 ClassID 對照資料，讓需要課程資料的人可以直接取用或自行更新。',
      techStack: ['Python', 'GitHub Actions', 'CSV', 'JSON'],
      highlights: [
        { title: '收集逢甲大學 101 學年度起的課程資訊', description: '降低重複爬取成本。' },
        { title: 'Python 更新工具', description: '提供依學年度參數更新資料。' },
        { title: 'FCU-CourseAPI', description: '記錄查詢 payload 與 response 格式。' },
        { title: 'FCU-ClassID', description: '維護學院、系所、班級 ID 對照資料。' },
      ],
      screenshots: [],
      tags: ['Python', 'Data', 'FCU', 'Crawler'],
    },
    {
      name: 'ShortYou',
      title: 'ShortYou 短網址服務',
      summary: '把長網址縮短，讓連結更容易分享。',
      category: '網站服務',
      homepage: 'https://s.purr.tw/',
      role: '個人作品',
      period: '2022 – 2026',
      image: shortyouHome,
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
        { title: 'Astro 5 + Tailwind 前端', description: 'hash 路由可直接部署在 GitHub Pages 等靜態主機。' },
        { title: 'GAS 後端以 TypeScript + clasp 開發', description: '分層為 controller / services / repository。' },
        { title: 'capability token 授權建立模式', description: '可加上 Cloudflare Turnstile 驗證。' },
        { title: 'runtime config bootstrap', description: '建置腳本自動同步，前後端設定獨立可維護。' },
        { title: '自訂與隨機 alias', description: '產出格式如 s.purr.tw/#alias。' },
        { title: '公開首頁 playground', description: '僅提供展示，不會真的建立短網址。' },
      ],
      screenshots: [
        { src: shortyouHome, caption: '公開首頁 — playground 展示，不會真的建立短網址' },
        { src: shortyouHomeWithAlias, caption: '輸入自訂 alias 預覽要產生的短連結格式' },
        { src: shortyouResultMock, caption: '示範結果 — 短連結預覽與複製操作' },
        { src: shortyouResultMockQr, caption: '示範結果 — 展開短連結的 QR Code' },
        { src: shortyouAuthorizedMode, caption: '透過 Token 進入授權建立模式' },
        { src: shortyouRedirectLaunch, caption: '訪問短連結時的過場畫面' },
      ],
      tags: ['Astro', 'Google Apps Script', 'Serverless', 'URL Shortener', 'Capability Token'],
    },
    {
      name: 'Gmail-Archiver',
      title: 'Gmail 郵件匯出與備份',
      summary: '把信件與附件匯出到 Google Drive，分類留存。',
      category: '自動化工具',
      role: '個人作品',
      period: '2024',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Gmail-Archiver',
      customDescription: '以 Google Apps Script（TypeScript + clasp）開發的 Gmail 郵件歸檔工具，可將指定標籤的信件匯出為 PDF 或 EML，並整理成清晰的資料夾結構存至 Google Drive。',
      techStack: ['Google Apps Script', 'TypeScript', 'clasp', 'Gmail API', 'Google Drive API'],
      highlights: [
        { title: 'Gmail 信件轉為 PDF', description: '自動嵌入 CID 內嵌圖片。' },
        { title: '原始 .eml 格式', description: '可匯入其他郵件客戶端。' },
        { title: '自動抽取附件', description: '並與信件對應分資料夾存放。' },
        { title: '依 Gmail 標籤建立資料夾', description: '自動建立層級式資料夾於 Google Drive。' },
      ],
      screenshots: [],
      tags: ['Google Apps Script', 'Gmail', 'TypeScript'],
    },
    {
      name: 'Zrss',
      title: 'HITCON ZeroDay 漏洞訂閱',
      summary: '用 RSS 訂閱 HITCON ZeroDay 的漏洞揭露資訊。',
      category: '資料與訂閱',
      role: '個人作品',
      period: '2023',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Zrss',
      customDescription: '將 HITCON ZeroDay 漏洞揭露清單轉為 RSS Feed，讓資安研究者能透過任何 RSS 閱讀器訂閱最新漏洞資訊，無需頻繁手動查看網站。',
      techStack: ['Python', 'feedgen', 'requests', 'BeautifulSoup', 'GitHub Actions'],
      highlights: [
        { title: 'HITCON ZeroDay 漏洞清單', description: '爬取全部與進行中漏洞清單。' },
        { title: '標準 RSS 2.0 XML', description: '託管於 GitHub raw 連結。' },
        { title: 'GitHub Actions 定期自動更新', description: '免自架伺服器。' },
        { title: 'Inoreader、Feedly 等 RSS 閱讀器', description: '可直接貼入使用。' },
      ],
      screenshots: [],
      tags: ['Python', 'Security', 'RSS'],
    },
    {
      name: 'Travel-Advisory',
      title: 'RiskRadar 旅遊警示通知',
      summary: '訂閱旅遊警示，等級變動時由 Telegram 通知。',
      category: '資料與訂閱',
      role: '個人作品',
      period: '2025 - 2026',
      image: 'https://opengraph.githubassets.com/1/HeiTang/Travel-Advisory',
      customDescription: 'RiskRadar — 全球旅遊警示監控系統。追蹤美國國務院 200+ 個國家旅遊警示等級，透過 Telegram Bot 提供即時查詢、訂閱監控與警示變動推播。',
      techStack: ['Python', 'FastAPI', 'PostgreSQL', 'python-telegram-bot', 'Docker', 'Google Cloud Run'],
      highlights: [
        { title: '美國國務院 200+ 國家旅遊警示', description: '每日自動爬取比對。' },
        { title: 'Telegram Bot', description: '支援即時查詢、Inline Mode 分享、Watchlist 訂閱。' },
        { title: '警示等級變動', description: '主動推播通知訂閱用戶。' },
        { title: '英文 / 繁體中文', description: '依 Telegram 語系自動切換。' },
        { title: 'Google Cloud Run', description: '搭配 GitHub Actions CI/CD。' },
      ],
      screenshots: [],
      tags: ['Python', 'Telegram', 'FastAPI', 'Monitor'],
      hideGithubLink: true,
    },
    {
      name: 'CardFlux',
      title: 'CardFlux 信用卡優惠工具',
      summary: '整合多家銀行優惠查詢與登錄，支援關鍵字篩選及多身份紀錄。',
      category: '自動化工具',
      role: '個人作品',
      period: '2026',
      image: cardFluxActivityOverview,
      customDescription: 'CardFlux 是本機優先的多銀行信用卡優惠活動自動化工具，提供 CLI 與 Astro 本機管理後台，可查詢、搜尋、篩選並登錄活動，並保留逐筆結果、身份紀錄與去重資料。服務支援 Docker／Compose 部署。',
      techStack: ['Python', 'FastAPI', 'Astro', 'TypeScript', 'Playwright', 'Docker Compose'],
      highlights: [
        { title: '多銀行活動查詢與登錄', description: '支援玉山、國泰、中信、台新與聯邦活動。' },
        { title: '依條件篩選優惠', description: '使用關鍵字包含或排除條件，挑選需要登錄的活動。' },
        { title: '逐筆結果與去重紀錄', description: '保留每次執行結果，避免重複處理已登錄活動。' },
        { title: 'CLI 與本機管理後台', description: '可透過終端機或 Astro 管理介面操作。' },
      ],
      screenshots: [
        { src: cardFluxActivityOverview, caption: '活動總覽：查看活動數量、可登錄與本次執行狀態，並選擇銀行查詢或登錄。' },
        { src: cardFluxScheduleManagement, caption: '排程管理：依身份與狀態篩選排程，檢視最近結果、下次執行時間與操作。' },
        { src: cardFluxRegistrationIssueReview, caption: '登錄問題處理：核對銀行實際登錄狀態與依據，避免結果不明時直接重送。' },
        { src: cardFluxExecutionHistory, caption: '執行紀錄：篩選最近 50 筆操作，查看銀行、耗時、狀態與結果，也可匯出紀錄。' },
      ],
      tags: ['Python', 'FastAPI', 'Astro', 'Playwright', 'Docker'],
      hideGithubLink: true,
    },
  ] as ProjectMeta[],

  // Navigation
  nav: [
    { label: '文章', href: '/blog/' },
    { label: '專案', href: '/projects/' },
    { label: '邀請碼', href: '/invite-codes/' },
    {
      label: '關於',
      children: [
        { label: '關於我', href: '/about/' },
        { label: '日本制縣圖', href: '/japan/' },
        { label: '演唱會足跡', href: '/concerts/' },
      ],
    },
  ],
} as const;
