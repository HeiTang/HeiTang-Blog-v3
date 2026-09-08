import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { copy } from './config/copy';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default(copy.about.name),
    tags: z.array(z.string()).default([]),
    relatedPosts: z.array(z.string().min(1)).optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
