import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

test('invite filters keep counts, category selection and empty feedback consistent', async () => {
  const source = await readFile(new URL('./InviteCodesContent.astro', import.meta.url), 'utf8');
  const script = source.split('<script>')[1].split('// Extend the header shade')[0];
  const card = (status: string) => ({ dataset: { status }, style: { display: '' } });
  const cards = [card('active'), card('expired'), card('disabled')];
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
  let toggle = () => {};
  const filter = {
    dataset: { active: 'true' },
    setAttribute() {},
    addEventListener(_name: string, listener: () => void) { toggle = listener; },
  };
  const status = { textContent: '', removeAttribute() {} };
  const empty = { hidden: true };
  runInNewContext(stripTypeScriptTypes(script), {
    matchMedia: () => ({ matches: true }),
    window: { addEventListener() {} },
    document: {
      querySelectorAll: (selector: string) => selector === '.tag-tab' ? tabs : selector === '.tag-section' ? sections : cards,
      querySelector: () => ({ removeAttribute() {} }),
      getElementById: (id: string) => id === 'hide-expired-toggle' ? filter : id === 'filter-status' ? status : empty,
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
  assert.equal(cards[1].style.display, 'none');
  assert.match(status.textContent, /顯示 1 個有效服務/);
  clicks[2]();
  assert.deepEqual(pressed, ['false', 'false', 'true']);
  assert.equal(empty.hidden, false);
  toggle();
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
  assert.equal(collapsed[0], false);
  assert.equal(expandButtons[0].expanded, 'true');
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
