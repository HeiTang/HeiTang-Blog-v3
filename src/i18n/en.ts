import type { Translations } from './zh';

export const en: Translations = {
  nav: {
    home: 'Home',
    blog: 'Blog',
    projects: 'Projects',
    inviteCodes: 'Invite Codes',
    about: 'About',
  },
  home: {
    greeting: "Hi, I'm",
    bio: 'Orange Cat Engineer · Tech Blogger · Open Source Enthusiast',
    blogCta: 'Read Articles',
    projectsCta: 'View Projects',
  },
  blog: {
    title: 'Blog',
    searchPlaceholder: 'Search articles...',
    allTags: 'All',
    readMore: 'Read More',
    readingTime: 'min read',
    noResults: 'No articles found',
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
  },
  projects: {
    title: 'GitHub Projects',
    pinned: 'Pinned',
    all: 'All Repositories',
    stars: 'Stars',
    forks: 'Forks',
    viewOnGitHub: 'View on GitHub',
    noRepos: 'No public repositories',
  },
  inviteCodes: {
    title: 'Invite Codes',
    description: 'Invite codes for services I use and recommend',
    service: 'Service',
    code: 'Code',
    copy: 'Copy',
    copied: 'Copied!',
    visit: 'Visit',
    expiry: 'Expiry',
    status: {
      active: 'Active',
      expired: 'Expired',
      limited: 'Limited',
    },
    noData: 'No invite codes available',
    lastUpdated: 'Last updated',
  },
  about: {
    title: 'About',
  },
  footer: {
    builtWith: 'Built with Astro',
    rights: 'All rights reserved',
  },
  error: {
    notFound: 'Page Not Found',
    goHome: 'Go Home',
  },
};
