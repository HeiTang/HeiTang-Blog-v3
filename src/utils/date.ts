/** Format a Date or ISO string to localized date string */
export function formatDate(date: Date | string, lang: 'zh' | 'en' = 'zh'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y} 年 ${m} 月 ${day} 日`;
}
