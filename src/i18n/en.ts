import type { Translations, SkillGroup } from './zh';

export const en: Translations = {
  home: {
    greeting: "Hi, I'm",
    typewriterTexts: ['a fluffy orange cat 🐱', 'a developer & blogger ✨', 'not fat, just big-boned 🍊'],
    name: 'HeiTang',
    handle: '@HeiTang',
  },
  blog: {
    title: 'Blog',
    allTags: 'All',
    articleCount: 'articles',
    emptyState: '✍️ Articles coming soon…',
    readingTime: 'min read',
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
  },
  projects: {
    title: 'GitHub Projects',
    subtitle: "'s GitHub Projects — Click a card to view details",
    noRepos: 'No public repositories',
    noMatchingProjects: 'No matching projects',
    allFilter: 'All',
  },
  inviteCodes: {
    title: 'Invite Codes',
    description: 'Invite codes for services I use and recommend',
    noData: 'No invite codes available',
    lastUpdated: 'Last updated',
    allFilter: 'All',
    loadError: 'Failed to load invite codes, please try again later.',
    noApiUrl: 'INVITE_CODES_API_URL environment variable is not set.',
  },
  about: {
    title: 'About',
    heading: 'About HeiTang',
    name: 'HeiTang',
    tagline: 'Orange Cat Engineer',
    bio1: 'Not fat, just fluffy! ヽ(=^･ω･^=)丿',
    bio2: 'Here I document my tech learning, project development, and useful resource sharing.',
    bio3: '#EndFurColorDiscrimination',
    skillsTitle: 'Tech Stack',
    skillGroups: [
      { label: 'Frontend', skills: ['TypeScript', 'JavaScript', 'React', 'Vue', 'Astro', 'Tailwind CSS', 'HTML / CSS'] },
      { label: 'Backend', skills: ['Node.js', 'Python', 'Go', 'REST API', 'GraphQL', 'PostgreSQL', 'Redis'] },
      { label: 'Tools & DevOps', skills: ['Git', 'GitHub Actions', 'Docker', 'Linux', 'Nginx', 'Cloudflare', 'Google Apps Script'] },
    ] as SkillGroup[],
  },
  error: {
    notFound: 'Page Not Found',
    desc: "The orange cat couldn't find the page. Maybe it's napping?",
    goHome: 'Go Home',
  },
};
