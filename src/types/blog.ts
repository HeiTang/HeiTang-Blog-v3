import type { ImageMetadata } from 'astro';

/** Blog post metadata (mirrors content.config.ts schema) */
export interface PostMeta {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  tags: string[];
  relatedPosts?: string[];
  cover?: ImageMetadata;
  coverAlt?: string;
  draft: boolean;
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
