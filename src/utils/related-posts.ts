import type { PostMeta } from '../types/blog.ts';

export function getRelatedPosts<T extends { id: string; data: PostMeta }>(post: T, posts: T[]): T[] {
  if (post.data.relatedPosts !== undefined) {
    const seen = new Set<string>();
    return post.data.relatedPosts.map(id => {
      const related = posts.find(candidate => candidate.id === id && !candidate.data.draft);
      if (!related || id === post.id || seen.has(id)) {
        throw new Error(`${post.id}: invalid relatedPosts entry "${id}" (missing, draft, self or duplicate)`);
      }
      seen.add(id);
      return related;
    });
  }

  const tags = new Set(post.data.tags);
  return posts
    .filter(candidate => candidate.id !== post.id && !candidate.data.draft)
    .map(candidate => ({
      post: candidate,
      score: [...new Set(candidate.data.tags)].filter(tag => tags.has(tag)).length,
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score
      || b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime()
      || a.post.id.localeCompare(b.post.id))
    .slice(0, 2)
    .map(candidate => candidate.post);
}
