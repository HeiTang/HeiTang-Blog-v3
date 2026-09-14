/**
 * Curated metadata shared by the portfolio index and project detail pages.
 */
import type { ImageMetadata } from 'astro:assets';

export type ProjectAsset = string | ImageMetadata;
export type ProjectScreenshot = string | { src: ProjectAsset; caption?: string };

export interface ProjectMeta {
  /** Must match the GitHub repository name exactly */
  name: string;

  /** Visitor-facing title. Falls back to the repository name. */
  title?: string;
  summary?: string;
  category?: '網站服務' | '自動化工具' | '資料與訂閱';
  homepage?: string;

  /** Custom local asset or remote cover URL. Falls back to GitHub Social Preview. */
  image?: ProjectAsset;

  /** Project role (e.g. 「個人作品」「開源貢獻」「團隊專案」) */
  role?: string;

  /** Development period (e.g. 「2023.06」「2024.01 – 2024.06」) */
  period?: string;

  /** Tech stack shown on the detail page */
  techStack?: string[];

  /** Project highlights */
  highlights?: string[];

  /**
   * Screenshots for the project gallery. Each entry can be:
   *  - a string (path / URL), or
   *  - `{ src, caption }` to attach a caption shown in the gallery and lightbox.
   */
  screenshots?: ProjectScreenshot[];

  /** Full project description */
  customDescription?: string;

  /** Project topic tags */
  tags?: string[];

  /** Link to a related blog post — renders as「閱讀文章 →」button on the detail page */
  blogPost?: string;

  /** When true, hides the GitHub link button on the detail page (e.g. private repos) */
  hideGithubLink?: boolean;
}
