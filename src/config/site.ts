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
      blogPost: '/blog/mailcat',
    },
    // Add more projects below:
    // {
    //   name: 'ShortYou',
    //   image: '/images/projects/shortyou.png',
    //   role: '個人作品',
    //   period: '2022',
    //   techStack: ['JavaScript', 'Node.js', 'MongoDB'],
    //   highlights: ['短網址服務，支援自訂 slug', '每日產生數百次縮址'],
    //   blogPost: '/blog/shortyou-dev-story',
    // },
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
