/**
 * ProjectMeta — per-project metadata for the portfolio Modal
 * Extends what GitHub API provides with hand-crafted resume content.
 *
 * Single Responsibility: this type owns only the "extra info beyond GitHub API".
 */
export interface ProjectMeta {
  /** Must match the GitHub repository name exactly */
  name: string;

  /** Custom cover image path (public/images/projects/). Falls back to GitHub Social Preview. */
  image?: string;

  /** Role label shown on card and Modal header (e.g. 「個人作品」「開源貢獻」「團隊專案」) */
  role?: string;

  /** Development period shown in Modal (e.g. 「2023.06」「2024.01 – 2024.06」) */
  period?: string;

  /** Tech stack badges — shown on card (max 4) and fully in Modal */
  techStack?: string[];

  /** Achievement bullet points shown in Modal (✦ prefix) */
  highlights?: string[];

  /** Additional screenshots for Modal carousel (public paths or URLs) */
  screenshots?: string[];

  /** Overrides the GitHub API description in Modal (use for richer narrative) */
  customDescription?: string;

  /** Custom filter tags shown in the projects page tag bar (e.g. ['CLI', 'Tool', 'Open Source']) */
  tags?: string[];

  /** Link to a related blog post — renders as「閱讀文章 →」button in Modal */
  blogPost?: string;

  /** When true, hides the GitHub link button in Modal (e.g. private repos) */
  hideGithubLink?: boolean;
}
