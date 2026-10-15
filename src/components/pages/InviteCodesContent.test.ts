import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { getInviteBrand } from '../../data/invite-brands.ts';
import { getInviteSlug } from '../../data/invite-share.ts';

test('invite filters keep counts, category selection and empty feedback consistent', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.split('<script>')[1].split('// Extend the header shade')[0];
  const card = (status: string, subcategory: string) => ({ dataset: { status, subcategory }, style: { display: '' } });
  const cards = [card('active', '自由行'), card('expired', '住宿'), card('disabled', '其他')];
  const counts = [{ textContent: '' }, { textContent: '' }, { textContent: '' }];
  const clicks: Array<() => void> = [];
  const pressed: string[] = [];
  const tabs = ['__all__', '旅遊', '歷史'].map((tag, index) => ({
    dataset: { tag },
    classList: { remove() {}, add() {} },
    setAttribute(_name: string, value: string) { pressed[index] = value; },
    querySelector: () => counts[index],
    addEventListener(_name: string, listener: () => void) { clicks[index] = listener; },
  }));
  const hidden = [false, false];
  const sectionCounts = [{ textContent: '' }, { textContent: '' }];
  const edgeStyles: Array<Record<string, string>> = [{}, {}];
  const scrollEvents: Array<() => void> = [];
  const grids = [65, 0].map((scrollLeft, index) => ({
    scrollLeft, scrollWidth: 650, clientWidth: 350,
    style: { setProperty(name: string, value: string) { edgeStyles[index][name] = value; } },
    addEventListener(_name: string, listener: () => void) { scrollEvents[index] = listener; },
  }));
  const collapsed = [false, false];
  const expandClicks: Array<() => void> = [];
  const expandButtons = [0, 1].map(index => ({
    hidden: true, textContent: '', expanded: '', title: '', label: '',
    setAttribute(name: string, value: string) {
      if (name === 'aria-expanded') this.expanded = value;
      if (name === 'title') this.title = value;
      if (name === 'aria-label') this.label = value;
    },
    addEventListener(_name: string, listener: () => void) { expandClicks[index] = listener; },
  }));
  const sections = ['旅遊', '歷史'].map((section, index) => ({
    dataset: { section, expanded: 'false' },
    querySelectorAll: () => index === 0 ? cards.slice(0, 2) : cards.slice(2),
    querySelector: (selector: string) => selector === '.section-expand' ? expandButtons[index] : selector === '.invite-grid' ? grids[index] : sectionCounts[index],
    classList: { toggle(name: string, value: boolean) { (name === 'hidden' ? hidden : collapsed)[index] = value; } },
  }));
  const subClicks: Array<Array<() => void>> = [[], []];
  const subCounts = [[{ textContent: '' }, { textContent: '' }], [{ textContent: '' }]];
  const subButtons = [['__all__', '自由行', '住宿'], ['__all__', '其他']].map((names, panel) => names.map((subcategory, index) => ({
    dataset: { subcategory }, pressed: '',
    classList: { toggle() {} },
    setAttribute(_name: string, value: string) { this.pressed = value; },
    querySelector: () => index === 0 ? null : subCounts[panel][index - 1],
    addEventListener(_name: string, listener: () => void) { subClicks[panel][index] = listener; },
  })));
  const subPanels = ['旅遊', '歷史'].map((parentCategory, index) => ({
    dataset: { parentCategory }, hidden: true, querySelectorAll: () => subButtons[index],
  }));
  let toggle = () => {};
  const filter = {
    dataset: { active: 'true' },
    click() { toggle(); },
    setAttribute() {},
    addEventListener(_name: string, listener: () => void) { toggle = listener; },
  };
  const status = { textContent: '', removeAttribute() {} };
  const empty = { hidden: true };
  let showPast = () => {};
  const pastButton = { addEventListener(_name: string, listener: () => void) { showPast = listener; } };
  let mobile = true;
  runInNewContext(stripTypeScriptTypes(script), {
    matchMedia: () => ({ matches: mobile }),
    window: { addEventListener() {} },
    document: {
      querySelectorAll: (selector: string) => selector === '.tag-tab' ? tabs : selector === '.tag-section' ? sections : selector === '.subcategory-tabs' ? subPanels : selector === '.subcategory-tab' ? subButtons.flat() : cards,
      querySelector: () => ({ removeAttribute() {} }),
      getElementById: (id: string) => id === 'hide-expired-toggle' ? filter : id === 'filter-status' ? status : id === 'show-past-codes' ? pastButton : empty,
    },
  });
  assert.deepEqual(edgeStyles[0], { '--fade-left': '40px', '--fade-right': '40px' });
  grids[0].scrollLeft = 0;
  scrollEvents[0]();
  assert.equal(edgeStyles[0]['--fade-left'], '0px');
  grids[0].scrollLeft = 290;
  scrollEvents[0]();
  assert.equal(edgeStyles[0]['--fade-right'], '10px');
  grids[0].scrollLeft = 300;
  scrollEvents[0]();
  assert.equal(edgeStyles[0]['--fade-right'], '0px');
  grids[0].scrollLeft = 65;
  assert.deepEqual(counts.map(count => count.textContent), ['1', '1', '0']);
  assert.deepEqual(hidden, [false, true]);
  assert.deepEqual(subPanels.map(panel => panel.hidden), [true, true]);
  assert.equal(cards[1].style.display, 'none');
  assert.match(status.textContent, /顯示 1 個有效服務/);
  clicks[2]();
  assert.deepEqual(pressed, ['false', 'false', 'true']);
  assert.equal(empty.hidden, false);
  showPast();
  assert.equal(filter.dataset.active, 'false');
  assert.equal(empty.hidden, true);
  assert.deepEqual(hidden, [true, false]);
  assert.deepEqual(counts.map(count => count.textContent), ['3', '2', '1']);
  assert.match(status.textContent, /顯示 1 個服務/);
  clicks[0]();
  assert.deepEqual(hidden, [false, false]);
  assert.match(status.textContent, /顯示 3 個服務/);
  assert.deepEqual(collapsed, [true, true]);
  assert.equal(expandButtons[0].hidden, false);
  assert.equal(expandButtons[1].hidden, true);
  expandClicks[0]();
  assert.equal(collapsed[0], false);
  assert.equal(expandButtons[0].expanded, 'true');
  assert.equal(expandButtons[0].title, '收合');
  assert.equal(expandButtons[0].label, '收合「旅遊」的全部邀請碼');
  assert.equal(expandButtons[0].textContent, '');
  grids[0].scrollLeft = 0;
  expandClicks[0]();
  assert.equal(grids[0].scrollLeft, 65);
  assert.equal(collapsed[0], true);
  assert.equal(expandButtons[0].title, '展開全部');
  assert.equal(expandButtons[0].label, '展開「旅遊」的全部邀請碼');
  clicks[1]();
  assert.equal(collapsed[0], true);
  assert.equal(expandButtons[0].expanded, 'false');
  expandClicks[0]();
  assert.equal(collapsed[0], false);
  mobile = false;
  clicks[1]();
  assert.equal(collapsed[0], false);
  assert.equal(expandButtons[0].expanded, 'true');
  assert.deepEqual(subPanels.map(panel => panel.hidden), [false, true]);
  toggle();
  subClicks[0][2]();
  assert.equal(empty.hidden, false);
  assert.equal(subCounts[0][1].textContent, '0');
  assert.equal(counts[1].textContent, '1');
  assert.equal(subButtons[0][2].pressed, 'true');
  assert.equal(subPanels[0].hidden, false);
  showPast();
  assert.equal(empty.hidden, true);
  assert.equal(cards[0].style.display, 'none');
  assert.equal(cards[1].style.display, '');
  assert.equal(sectionCounts[0].textContent, '1');
  assert.equal(counts[1].textContent, '2');
  clicks[0]();
  assert.deepEqual(subPanels.map(panel => panel.hidden), [true, true]);
  assert.deepEqual(hidden, [false, false]);
});

test('invite detail preserves optional fields, brand artwork and escaped content', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const renderer = source.slice(source.indexOf('  function esc('), source.indexOf('  function bindCopyBtns('));
  const render = (input: Record<string, unknown>) => runInNewContext(
    stripTypeScriptTypes(renderer) + '\nrenderDetail(input)', { input, getInviteBrand },
  ) as string;
  const html = render({
    title: '遠東銀行 Bankee', group: '銀行開戶', status: 'expired',
    user_benefit: '新戶禮 <100>', my_benefit: 'NT$100',
    invite_code: 'A"<B', invite_link: 'https://example.com/?a=1&b=2',
    official_link: 'https://example.com/event', start_date: '2026-01-01', end_date: '2026-12-31',
    description: '- 第一項\n- <script>第二項</script>', tags: ['<標籤>'],
  });
  assert.match(html, /invite-brands\/bankee\.png/);
  assert.match(html, /--brand-color: 170 122 224/);
  assert.match(html, /data-status="expired">已到期/);
  assert.match(html, /新戶禮 &lt;100&gt;/);
  assert.match(html, /data-copy="A&quot;&lt;B"/);
  assert.match(html, /<ul><li>第一項<\/li><li>&lt;script&gt;第二項&lt;\/script&gt;<\/li><\/ul>/);
  assert.match(html, /貓貓獲得/);
  assert.match(html, /2026-01-01 → 2026-12-31/);
  assert.match(html, /https:\/\/example.com\/event/);
  assert.match(html, /&lt;標籤&gt;/);
  assert.ok(html.indexOf('新戶禮') < html.indexOf('ic-actions'));
  assert.ok(html.indexOf('貓貓獲得') < html.indexOf('ic-actions'));
  assert.match(html, /class="ic-rewards" aria-label="邀請回饋"/);
  assert.match(html, /class="ic-benefit ic-benefit--owner"/);
  const linkOnly = render({ title: '服務', invite_link: 'https://example.com/invite' });
  assert.match(linkOnly, /class="ic-actions"/);
  assert.match(linkOnly, /class="ic-code-caption">[\s\S]*?<\/svg>邀請連結<\/span>/);
  assert.match(linkOnly, /ic-link-symbol/);
  assert.match(linkOnly, /class="ic-link-content">領取回饋<\/span>/);
  assert.doesNotMatch(linkOnly, /class="ic-code-value"|class="ic-copy-btn"|data-copy=|開啟連結|INVITE \/ LINK/);
  const codeOnly = render({ title: '服務', invite_code: 'ABC' });
  assert.match(codeOnly, /data-copy="ABC"/);
  assert.doesNotMatch(codeOnly, /class="ic-link-btn"/);
  const ownerOnly = render({ title: '服務', my_benefit: 'NT$100' });
  assert.match(ownerOnly, /ic-benefit--owner/);
  assert.doesNotMatch(ownerOnly, /ic-benefit--user/);
  const minimal = render({ title: '<新服務>', status: 'disabled', description: '說明' });
  assert.match(minimal, /&lt;新服務&gt;/);
  assert.match(minimal, /已停用/);
  assert.doesNotMatch(minimal, /ic-rewards|ic-actions|ic-detail-footer|<img|undefined/);
});

test('header shade extends only while the filter bar is stuck and follows its height', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.split('// Extend the header shade only while the filter bar is stuck.')[1]
    .split('// ── Invite Code Overlay')[0];
  let rect = { top: 500, bottom: 568, height: 68 };
  let extension = '';
  let stuck = false;
  let writes = 0;
  const bar = { getBoundingClientRect: () => rect };
  const header = {
    getBoundingClientRect: () => ({ bottom: 76 }),
    classList: { toggle(_name: string, value: boolean) { stuck = value; } },
    style: { setProperty(_name: string, value: string) { extension = value; writes++; } },
  };
  const events: Record<string, () => void> = {};
  const frames: Array<() => void> = [];
  runInNewContext(stripTypeScriptTypes(script), {
    document: { querySelector: (selector: string) => selector === '.tag-tabs-wrapper' ? bar : header, documentElement: {} },
    getComputedStyle: () => ({ top: '80px', fontSize: '16px' }),
    requestAnimationFrame: (callback: () => void) => frames.push(callback),
    window: { addEventListener(name: string, listener: () => void) { events[name] = listener; } },
  });
  assert.equal(extension, '0px');
  assert.equal(stuck, false);
  rect = { top: 80, bottom: 148, height: 68 };
  events.scroll();
  events.scroll();
  assert.equal(frames.length, 1);
  frames.shift()!();
  assert.equal(extension, '88px');
  assert.equal(stuck, true);
  events.scroll();
  frames.shift()!();
  assert.equal(writes, 2);
  rect = { top: 80, bottom: 180, height: 100 };
  events.resize();
  frames.shift()!();
  assert.equal(extension, '120px');
  rect = { top: 500, bottom: 568, height: 68 };
  events.scroll();
  frames.shift()!();
  assert.equal(extension, '0px');
  assert.equal(stuck, false);
  rect = { top: -20, bottom: 48, height: 68 };
  events.scroll();
  frames.shift()!();
  assert.equal(extension, '0px');
});

test('closing keeps the animation on the open dialog after the viewport changes', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.slice(source.indexOf('  function closeOverlay()'), source.indexOf("  document.querySelectorAll<HTMLButtonElement>('.card-detail')"));
  for (const mobileDialog of [false, true]) {
    const modal = { style: {} as Record<string, string> };
    const sheet = { style: {} as Record<string, string> };
    runInNewContext(stripTypeScriptTypes(script) + '\ncloseOverlay()', {
      modal, sheet, activeDialog: mobileDialog ? sheet : modal,
      isMobile: () => !mobileDialog,
      backdrop: { style: {} }, setTimeout() {},
      clearSharedService() {},
    });
    assert.equal(mobileDialog ? sheet.style.transform : modal.style.opacity, mobileDialog ? 'translateY(100%)' : '0');
    assert.equal(mobileDialog ? modal.style.opacity : sheet.style.transform, undefined);
  }
});

test('service sharing encodes titles, uses native share and falls back to copying', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.slice(source.indexOf('  function getShareUrl('), source.indexOf('  function bindShareBtn('));
  const title = 'ChargeSPOT 共享 / A&B + 日本';
  const copied: string[] = [];
  const feedback = { hidden: true, textContent: '' };
  const navigator: { share?: (data: { title: string; url: string }) => Promise<void>; clipboard: { writeText: (url: string) => Promise<void> } } = {
    clipboard: { async writeText(url) { copied.push(url); } },
  };
  const events: unknown[][] = [];
  const context = { trackInviteEvent: (...args: unknown[]) => events.push(args), analyticsService: (data: unknown) => data, data: { title, group: '交通' }, URL, Error, getInviteSlug, window: { location: { href: 'https://purr.tw/invite-codes/?old=1#section' } }, navigator, title, feedback };
  await runInNewContext(stripTypeScriptTypes(script) + '\nshareService(title, feedback, data, \'directory\')', context);
  assert.equal(decodeURIComponent(new URL(copied[0]).pathname), `/invite-codes/${getInviteSlug(title)}/`);
  assert.equal(new URL(copied[0]).searchParams.size, 0);
  assert.equal(new URL(copied[0]).hash, '');
  assert.equal(feedback.textContent, '分享連結已複製');
  assert.equal(feedback.hidden, false);
  assert.deepEqual(events.map(event => [event[0], event[2], event[3]]), [['invite_share', 'directory', 'copy_link']]);
  let sharedTitle = '';
  navigator.share = async data => { sharedTitle = data.title; };
  await runInNewContext(stripTypeScriptTypes(script) + '\nshareService(title, feedback, data, \'directory\')', context);
  assert.equal(sharedTitle, `${title} 邀請碼與回饋`);
  assert.equal(events[1][3], 'native');
  assert.equal(copied.length, 1);
  navigator.share = async () => { throw Object.assign(new Error(), { name: 'AbortError' }); };
  await runInNewContext(stripTypeScriptTypes(script) + '\nshareService(title, feedback, data, \'directory\')', context);
  assert.equal(copied.length, 1);
  navigator.share = async () => { throw new Error('Unavailable'); };
  navigator.clipboard.writeText = async () => { throw new Error('Denied'); };
  await runInNewContext(stripTypeScriptTypes(script) + '\nshareService(title, feedback, data, \'directory\')', context);
  assert.match(feedback.textContent, /^請複製分享連結：https:/);
  assert.equal(events.length, 2);
});

test('shared services open even when expired cards are hidden, and unknown titles are cleared', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.slice(source.indexOf('  function openSharedService('), source.indexOf('  openSharedService();'));
  const cards = [{ dataset: { invite: JSON.stringify({ title: '第一銀行 iLEO', status: 'expired' }) }, style: { display: 'none' } }];
  let opened = '';
  let cleared = false;
  const context = {
    URL, window: { location: { href: 'https://purr.tw/invite-codes/?service=' + encodeURIComponent('第一銀行 iLEO') } },
    document: { querySelectorAll: () => cards, querySelector: () => null },
    openOverlay(data: { title: string }) { opened = data.title; },
    clearSharedService() { cleared = true; },
  };
  runInNewContext(stripTypeScriptTypes(script) + '\nopenSharedService()', context);
  assert.equal(opened, '第一銀行 iLEO');
  assert.equal(cleared, false);
  context.window.location.href = 'https://purr.tw/invite-codes/?service=missing';
  runInNewContext(stripTypeScriptTypes(script) + '\nopenSharedService()', context);
  assert.equal(cleared, true);
});

test('copy events require clipboard success and detail links keep their service and entry point', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const copyScript = source.slice(source.indexOf('  function bindCopyBtns('), source.indexOf('  // ── Open / Close'));
  const linksScript = source.slice(source.indexOf('  function analyticsService('), source.indexOf('  observeInviteImpressions('));
  const events: unknown[][] = [];
  let copy = async (_event: unknown) => {};
  let denied = false;
  const btn = { dataset: { copy: 'PRIVATE-CODE' }, textContent: '', classList: { add() {}, remove() {} }, addEventListener(_name: string, listener: typeof copy) { copy = listener; } };
  const links: Record<string, () => void> = {};
  const context = {
    trackInviteEvent: (...args: unknown[]) => events.push(args),
    data: { title: 'Bankee', group: '銀行開戶' },
    root: {
      querySelectorAll: () => [btn],
      querySelector: (selector: string) => ({ addEventListener(_name: string, listener: () => void) { links[selector] = listener; } }),
    },
    navigator: { clipboard: { async writeText() { if (denied) throw new Error('Denied'); } } },
    setTimeout() {},
  };
  runInNewContext(stripTypeScriptTypes(linksScript + copyScript) + "\nbindCopyBtns(root, data, 'shared_page'); bindDetailLinks(root, data, 'shared_page');", context);
  await copy({ stopPropagation() {} });
  denied = true;
  await copy({ stopPropagation() {} });
  links['.ic-link-btn']();
  links['.ic-event-link']();
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [
    ['invite_copy', { title: 'Bankee', group: '銀行開戶' }, 'shared_page'],
    ['invite_click', { title: 'Bankee', group: '銀行開戶' }, 'shared_page'],
    ['invite_official_click', { title: 'Bankee', group: '銀行開戶' }, 'shared_page'],
  ]);
});

test('desktop and mobile detail views emit one event with the opening entry point', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.slice(source.indexOf('  function openOverlay('), source.indexOf('  function closeOverlay('));
  for (const mobile of [false, true]) {
    const events: unknown[][] = [];
    const element = () => ({ style: { setProperty() {} }, setAttribute() {}, focus() {}, classList: { add() {} } });
    const context = {
      data: { title: 'Bankee', group: '銀行開戶' }, document: { activeElement: null, body: { style: {} } },
      overlay: element(), modal: element(), sheet: element(), backdrop: element(),
      detailM: {}, detailS: {}, sheetScroll: {}, isMobile: () => mobile,
      requestAnimationFrame() {}, renderDetail: () => '', bindCopyBtns() {}, bindShareBtn() {}, bindDetailLinks() {},
      getInviteBrand, analyticsService: (data: unknown) => data,
      trackInviteEvent: (...args: unknown[]) => events.push(args),
    };
    runInNewContext(stripTypeScriptTypes(script) + "\nopenOverlay(data); openOverlay(data, 'shared_page');", context);
    assert.deepEqual(events.map(event => [event[0], event[2]]), [['invite_view', 'directory'], ['invite_view', 'shared_page']]);
  }
});
