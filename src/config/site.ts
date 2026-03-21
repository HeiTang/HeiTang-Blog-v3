/**
 * Site Configuration
 * Following SOLID principles: Single Responsibility
 */

export const siteConfig = {
  title: '黑糖ㄉ窩',
  titleEn: "HeiTang's Den",
  description: '橘貓工程師的技術日誌',
  descriptionEn: 'Orange Cat Engineer Tech Blog',
  author: 'HeiTang',
  url: 'https://purr.tw',
  domain: 'purr.tw',
  
  // Social links
  social: {
    github: 'https://github.com/HeiTang',
    email: 'contact@purr.tw',
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
  // image: optional custom cover (place files in public/images/projects/)
  // if image omitted → falls back to GitHub Social Preview automatically
  projectsWhitelist: [
    { name: 'MailCat' },
    // { name: 'repo-name', image: '/images/projects/repo-name.png' },
  ] as Array<{ name: string; image?: string }>,

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
