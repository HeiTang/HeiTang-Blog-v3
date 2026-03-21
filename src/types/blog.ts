/** Blog post metadata (mirrors content/config.ts schema) */
export interface PostMeta {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  draft: boolean;
  lang: 'zh' | 'en';
}

export interface Post {
  slug: string;
  body: string;
  data: PostMeta;
  readingTime: number;
}

export interface Tag {
  name: string;
  count: number;
}
