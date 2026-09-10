/**
 * ProjectMeta — per-project metadata for the portfolio Modal
 * Extends what GitHub API provides with hand-crafted resume content.
 *
 * Single Responsibility: this type owns only the "extra info beyond GitHub API".
 */
import type { ImageMetadata } from 'astro:assets';

export type ProjectAsset = string | ImageMetadata;
export type ProjectScreenshot = string | { src: ProjectAsset; caption?: string };

export interface ProjectMeta {
  /** Must match the GitHub repository name exactly */
  name: string;

  /** Visitor-facing title. Falls back to the repository name. */
  title?: string;

  /** Custom local asset or remote cover URL. Falls back to GitHub Social Preview. */
  image?: ProjectAsset;

  /** Role label shown on card and Modal header (e.g. 「個人作品」「開源貢獻」「團隊專案」) */
  role?: string;

  /** Development period shown in Modal (e.g. 「2023.06」「2024.01 – 2024.06」) */
  period?: string;

  /** Tech stack badges — shown on card (max 4) and fully in Modal */
  techStack?: string[];

  /** Achievement bullet points shown in Modal (✦ prefix) */
  highlights?: string[];

  /**
   * Additional screenshots for Modal carousel. Each entry can be:
   *  - a string (path / URL), or
   *  - `{ src, caption }` to attach a caption shown on the slide & lightbox.
   */
  screenshots?: ProjectScreenshot[];

  /** Overrides the GitHub API description in Modal (use for richer narrative) */
  customDescription?: string;

  /** Custom filter tags shown in the projects page tag bar (e.g. ['CLI', 'Tool', 'Open Source']) */
  tags?: string[];

  /** Link to a related blog post — renders as「閱讀文章 →」button in Modal */
  blogPost?: string;

  /** When true, hides the GitHub link button in Modal (e.g. private repos) */
  hideGithubLink?: boolean;
}
