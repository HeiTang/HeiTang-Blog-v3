import type { Translations, SkillGroup } from './zh';

export const en: Translations = {
  home: {
    greeting: "Hi, I'm a",
    typewriterTexts: ['Developer /ᐠ-˕-マⳊ', 'meow ₍˄•༝•˄₎◞✩︎', 'Cat. Remember to feed me, human! ₍^..^₎ 𐒡'],
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
    tagline: 'Code Whisperer',
    bio1: 'Not fat, just fluffy! ヽ(=^･ω･^=)丿',
    bio2: 'Here I document my tech learning, project development, and useful resource sharing.',
    bio3: '#EndFurColorDiscrimination',
    skillsTitle: 'Skills',
    skillGroups: [
      { label: 'Frontend', skills: ['TypeScript', 'JavaScript', 'Astro', 'Tailwind CSS', 'HTML / CSS'] },
      { label: 'Backend', skills: ['Python', 'Flask', 'Django', 'PHP', 'Laravel'] },
      { label: 'Databases', skills: ['MySQL', 'PostgreSQL', 'SQL Server', 'InfluxDB', 'SQLite', 'Redis'] },
      { label: 'DevOps & Cloud', skills: ['Docker', 'Docker Swarm', 'GitHub Actions', 'Jenkins', 'Linux', 'Nginx', 'Cloudflare', 'AWS', 'Google Cloud', 'Prometheus', 'Grafana'] },
      { label: 'APIs & Automation', skills: ['REST API', 'Swagger', 'OpenAPI', 'Selenium', 'Requests', 'Apache Airflow', 'Google Apps Script'] },
      { label: 'Developer Tools', skills: ['Git', 'Git flow', 'GitHub', 'Postman', 'Notion', 'Jira', 'Gemini', 'Copilot', 'Codex'] },
    ] as SkillGroup[],
  },
  error: {
    notFound: 'Page Not Found',
    desc: "The orange cat couldn't find the page. Maybe it's napping?",
    goHome: 'Go Home',
  },
};
