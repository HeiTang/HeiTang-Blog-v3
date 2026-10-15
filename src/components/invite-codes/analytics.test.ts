import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { getInviteCategory } from '../../data/invite-categories.ts';
import { getInviteSlug } from '../../data/invite-share.ts';

const source = await readFile(new URL('./analytics.ts', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(source.replace(/^import .*;\n/gm, '').replace(/^export /gm, ''));

test('invite events send only service metadata and tolerate missing or broken GA4', () => {
  const calls: unknown[][] = [];
  const window: { gtag?: (...args: unknown[]) => void } = {};
  const context = { window, getInviteCategory, getInviteSlug, service: { title: 'Bankee', group: '銀行開戶', invite_code: 'secret', invite_link: 'https://example.com/private' } };
  const send = () => runInNewContext(script + "\ntrackInviteEvent('invite_share', service, 'shared_page', 'native')", context);
  send();
  window.gtag = (...args) => { calls.push(args); };
  send();
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['event', 'invite_share', {
    service_id: 'bankee', service_name: 'Bankee', category: '銀行與信用卡', entry_point: 'shared_page', share_method: 'native',
  }]]);
  window.gtag = () => { throw new Error('Blocked'); };
  assert.doesNotThrow(send);
});

test('impressions require continuous half visibility, pause behind dialogs/background, and deduplicate services', () => {
  let intersect: (entries: unknown[]) => void = () => {};
  let changed: () => void = () => {};
  let visibilityChanged: () => void = () => {};
  const timers = new Map<number, () => void>();
  const delays: number[] = [];
  const calls: unknown[][] = [];
  let nextId = 0;
  let hidden = 'true';
  const cards = ['甲', '甲', '乙'].map(title => ({ dataset: { invite: JSON.stringify({ title, group: '交通' }) } }));
  const document = { visibilityState: 'visible', addEventListener(_event: string, callback: () => void) { visibilityChanged = callback; } };
  class IntersectionObserver {
    constructor(callback: typeof intersect, options: { threshold: number[] }) {
      intersect = callback;
      assert.equal(JSON.stringify(options.threshold), '[0,0.5]');
    }
    observe() {}
  }
  const context = {
    window: { IntersectionObserver, gtag: (...args: unknown[]) => calls.push(args) }, IntersectionObserver,
    MutationObserver: class { constructor(callback: () => void) { changed = callback; } observe() {} },
    document, cards, overlay: { getAttribute: () => hidden }, getInviteCategory, getInviteSlug,
    setTimeout(callback: () => void, delay: number) { delays.push(delay); timers.set(++nextId, callback); return nextId; },
    clearTimeout(id: number) { timers.delete(id); },
  };
  const entry = (index: number, ratio: number) => ({ target: cards[index], isIntersecting: ratio > 0, intersectionRatio: ratio });
  const elapse = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); };
  runInNewContext(script + '\nobserveInviteImpressions(cards, overlay)', context);
  intersect([entry(0, 0.49)]);
  assert.equal(timers.size, 0);
  intersect([entry(0, 0.5)]);
  assert.equal(timers.size, 1);
  intersect([entry(0, 0.1)]);
  assert.equal(timers.size, 0);
  intersect([entry(0, 0.8)]);
  document.visibilityState = 'hidden';
  visibilityChanged();
  assert.equal(timers.size, 0);
  document.visibilityState = 'visible';
  visibilityChanged();
  hidden = 'false';
  changed();
  assert.equal(timers.size, 0);
  hidden = 'true';
  changed();
  intersect([entry(1, 1), entry(2, 1)]);
  elapse();
  assert.equal(calls.length, 2);
  assert.ok(delays.every(delay => delay === 1000));
  intersect([entry(0, 0), entry(1, 0), entry(2, 0)]);
  intersect([entry(0, 1), entry(1, 1), entry(2, 1)]);
  assert.equal(timers.size, 0);
  assert.ok(calls.every(call => call[1] === 'invite_impression'));
  assert.doesNotThrow(() => runInNewContext(script + '\nobserveInviteImpressions(cards, overlay)', { ...context, window: {} }));
});
