import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRelatedPosts } from './related-posts.ts';
import type { PostMeta } from '../types/blog.ts';

const post = (id: string, data: Partial<PostMeta> = {}) => ({
  id,
  data: { title: id, description: id, author: 'HeiTang', pubDate: new Date('2026-01-01'), tags: ['Astro'], draft: false, ...data },
});

test('related posts: manual order, opt-out, validation and tag fallback', () => {
  const current = post('current', { tags: ['Astro', 'API'] });
  const older = post('older', { tags: ['Astro', 'API', 'API'] });
  const newer = post('newer', { pubDate: new Date('2026-02-01') });
  const other = post('other', { tags: ['CSS'] });
  const draft = post('draft', { draft: true });
  const posts = [current, newer, older, other, draft, post('third')];
  assert.deepEqual(getRelatedPosts(current, posts).map(p => p.id), ['older', 'newer']);
  assert.deepEqual(getRelatedPosts(post('current', { relatedPosts: ['other', 'older'] }), posts), [other, older]);
  assert.deepEqual(getRelatedPosts(post('current', { relatedPosts: ['other'] }), posts), [other]);
  assert.deepEqual(getRelatedPosts(post('current', { relatedPosts: [] }), posts), []);
  assert.deepEqual(getRelatedPosts(post('current', { tags: [] }), posts), []);
  for (const relatedPosts of [['missing'], ['draft'], ['current'], ['older', 'older']]) {
    assert.throws(() => getRelatedPosts(post('current', { relatedPosts }), posts), /invalid relatedPosts/);
  }
});
