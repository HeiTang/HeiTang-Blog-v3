import { getInviteCategory } from '../../data/invite-categories.ts';
import { getInviteSlug } from '../../data/invite-share.ts';

export type InviteEntryPoint = 'directory' | 'shared_page' | 'shared_query';
type InviteEvent = 'invite_impression' | 'invite_view' | 'invite_copy' | 'invite_click' | 'invite_official_click' | 'invite_share';
type InviteService = { title: string; group: string };

export function trackInviteEvent(event: InviteEvent, service: InviteService, entryPoint: InviteEntryPoint, method?: 'native' | 'copy_link') {
  const gtag = (window as Window & { gtag?: (command: string, event: string, parameters: Record<string, string>) => void }).gtag;
  if (!gtag) return;
  try {
    gtag('event', event, {
      service_id: getInviteSlug(service.title),
      service_name: service.title,
      category: getInviteCategory(service),
      entry_point: entryPoint,
      ...(method ? { share_method: method } : {}),
    });
  } catch { /* Analytics must not interrupt copying, sharing or navigation. */ }
}

export function observeInviteImpressions(cards: NodeListOf<HTMLElement>, overlay: HTMLElement) {
  if (!('IntersectionObserver' in window)) return;
  const seen = new Set<string>();
  const visible = new Set<HTMLElement>();
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const blocked = () => document.visibilityState !== 'visible' || overlay.getAttribute('aria-hidden') === 'false';
  const update = () => {
    for (const [card, timer] of timers) {
      if (blocked() || !visible.has(card)) {
        clearTimeout(timer);
        timers.delete(card);
      }
    }
    if (blocked()) return;
    for (const card of visible) {
      const service: InviteService = JSON.parse(card.dataset.invite!);
      const id = getInviteSlug(service.title);
      if (seen.has(id) || timers.has(card)) continue;
      timers.set(card, setTimeout(() => {
        timers.delete(card);
        if (blocked() || !visible.has(card) || seen.has(id)) return;
        seen.add(id);
        trackInviteEvent('invite_impression', service, 'directory');
      }, 1000));
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const card = entry.target as HTMLElement;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) visible.add(card);
      else visible.delete(card);
    }
    update();
  }, { threshold: [0, 0.5] });
  cards.forEach(card => observer.observe(card));
  document.addEventListener('visibilitychange', update);
  new MutationObserver(update).observe(overlay, { attributes: true, attributeFilter: ['aria-hidden'] });
}
