/**
 * GitHub API Service (Single Responsibility Principle)
 * All GitHub API interactions are encapsulated here.
 * Pages depend on this abstraction, not on raw fetch calls.
 */
import type { GitHubRepo, GitHubPinnedRepo, GitHubUser } from '../types/github';

const GITHUB_USERNAME = 'HeiTang';
const GITHUB_API = 'https://api.github.com';
const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

const authHeaders = (): HeadersInit => {
  const token = import.meta.env.GITHUB_TOKEN;
  return {
    'Accept': 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Fetch all public, non-forked repositories sorted by stars */
export async function fetchPublicRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?type=public&sort=updated&per_page=100`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos: GitHubRepo[] = await res.json();
    return repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  } catch (err) {
    console.warn('[github service] fetchPublicRepos failed:', err);
    return [];
  }
}

/** Fetch pinned repositories via GraphQL API */
export async function fetchPinnedRepos(): Promise<GitHubPinnedRepo[]> {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('[github service] GITHUB_TOKEN not set — skipping pinned repos');
    return [];
  }

  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              homepageUrl
              primaryLanguage { name color }
              stargazerCount
              forkCount
              repositoryTopics(first: 10) {
                nodes { topic { name } }
              }
              updatedAt
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`);
    const { data } = await res.json();
    return (data?.user?.pinnedItems?.nodes ?? []) as GitHubPinnedRepo[];
  } catch (err) {
    console.warn('[github service] fetchPinnedRepos failed:', err);
    return [];
  }
}

export async function fetchGitHubUser(): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[github service] fetchGitHubUser failed:', err);
    return null;
  }
}
