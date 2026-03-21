/** GitHub REST API — minimal interface (Interface Segregation Principle) */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  fork: boolean;
  archived: boolean;
  visibility: 'public' | 'private';
}

/** GitHub GraphQL API — pinned repositories */
export interface GitHubPinnedRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  primaryLanguage: { name: string; color: string } | null;
  stargazerCount: number;
  forkCount: number;
  repositoryTopics: {
    nodes: Array<{ topic: { name: string } }>;
  };
  updatedAt: string;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
}
