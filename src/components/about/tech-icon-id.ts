export const techIconId = (name: string): string =>
  `tech-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
