/** Format a Date or ISO string to localized date string */
export function formatDate(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}
