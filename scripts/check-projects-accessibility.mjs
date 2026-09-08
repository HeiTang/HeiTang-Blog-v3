// Run against `npm run preview`: node scripts/check-projects-accessibility.mjs
// Requires an existing Playwright installation and Chrome. PLAYWRIGHT_MODULE can
// point to a shared playwright/index.mjs; no project dependency is required.
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';

try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: width < 640,
      isMobile: width < 640,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const ax = await context.newCDPSession(page);
    const accessibleNodes = async () => (await ax.send('Accessibility.getFullAXTree')).nodes
      .filter(node => !node.ignored);
    const focused = locator => locator.evaluate(el => el === document.activeElement);
    const dialog = page.locator('#pm-overlay');
    const lightbox = page.locator('#pm-lightbox');
    const waitClosed = () => page.waitForFunction(() => !document.querySelector('#pm-overlay').open);

    await page.goto(`${baseURL}/projects/`, { waitUntil: 'load' });
    const cards = page.locator('[data-project]');
    const first = cards.first();
    const count = await cards.count();
    assert.ok(count > 0);
    assert.equal(await page.getByRole('heading', { level: 2 }).count(), count);
    assert.equal(await page.getByRole('heading', { level: 3 }).count(), 0);
    assert.equal(await page.getByRole('link', { name: 'HEITANG，回到首頁', exact: true }).count(), 1);
    for (const card of await cards.all()) {
      const name = JSON.parse(await card.getAttribute('data-project')).name;
      assert.equal(await page.getByRole('button', { name: `${name} ，查看專案詳情`, exact: true }).count(), 1);
    }

    const checkModal = async (selector) => {
      await page.waitForFunction(sel => document.querySelector(sel).open, selector);
      assert.equal(await page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), selector), true);
      const controls = page.locator(selector).locator('button:visible, a[href]:visible');
      await controls.last().focus();
      await page.keyboard.press('Tab');
      assert.equal(await focused(controls.first()), true, 'Tab wraps within the active dialog');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await focused(controls.last()), true, 'Shift+Tab wraps within the active dialog');
      const nodes = await accessibleNodes();
      const dialogs = nodes.filter(node => node.role?.value === 'dialog');
      assert.equal(dialogs.length, 1);
      assert.ok(dialogs[0].name?.value.trim(), 'The active dialog has an accessible name');
      assert.equal(nodes.some(node => node.role?.value === 'button' && node.name?.value?.includes('查看專案詳情')), false,
        'Background cards are absent from the accessibility tree');
    };

    for (const key of ['Enter', 'Space']) {
      await first.focus();
      await page.keyboard.press(key);
      await checkModal('#pm-overlay');
      await page.keyboard.press('Escape');
      await waitClosed();
      assert.equal(await focused(first), true);
    }

    // Clicking the cover exercises the stretched button hit area.
    await page.locator('.project-card').first().click({ position: { x: 20, y: 20 } });
    await dialog.locator('.pm-close-trigger:visible').click();
    await waitClosed();
    assert.equal(await focused(first), true);

    // Open a real screenshot, then exercise the nested dialog and restore chain.
    const shotIndex = await cards.evaluateAll(elements => elements.findIndex(el => JSON.parse(el.dataset.project).screenshots.length));
    assert.ok(shotIndex >= 0, 'At least one project has a screenshot');
    const shotCard = cards.nth(shotIndex);
    await shotCard.focus();
    await page.keyboard.press('Enter');
    const image = dialog.locator('.pm-image-trigger:visible').first();
    await image.focus();
    await page.keyboard.press('Enter');
    await checkModal('#pm-lightbox');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Escape');
    assert.equal(await lightbox.evaluate(el => el.open), false);
    assert.equal(await dialog.evaluate(el => el.open), true);
    assert.equal(await focused(image), true);
    await page.keyboard.press('Enter');
    await lightbox.locator('.pm-lb-close').click();
    assert.equal(await focused(image), true);
    await page.keyboard.press('Enter');
    await lightbox.locator('.pm-lb-backdrop').click({ position: { x: 3, y: 3 } });
    assert.equal(await focused(image), true);
    await page.keyboard.press('Escape');
    await waitClosed();
    assert.equal(await focused(shotCard), true);

    await first.focus();
    await page.keyboard.press('Enter');
    await page.locator('#pm-backdrop').click({ position: { x: 3, y: 3 } });
    await waitClosed();
    assert.equal(await focused(first), true);

    if (width < 640) {
      await first.focus();
      await page.keyboard.press('Enter');
      await page.locator('#pm-sheet').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
      const handle = await page.locator('#pm-sheet-drag').boundingBox();
      const x = handle.x + handle.width / 2;
      const y = handle.y + handle.height / 2;
      await ax.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await ax.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 100 }] });
      await ax.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await waitClosed();
      assert.equal(await focused(first), true, 'Swipe dismissal restores the project trigger');
    }

    // Closing must clean up the panel that opened, even after crossing 640px.
    await first.focus();
    await page.keyboard.press('Enter');
    await page.setViewportSize({ width: width < 640 ? 1280 : 390, height: 900 });
    await page.keyboard.press('Escape');
    await waitClosed();
    assert.equal(await focused(first), true);
    assert.equal(await page.locator('#pm-title').count(), 0);
    await first.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#pm-title').count(), 1);
    await page.keyboard.press('Escape');
    await waitClosed();
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');

    // A delayed close must not erase a later opening or unlock the body early.
    await first.focus();
    await page.keyboard.press('Enter');
    await dialog.locator('.pm-close-trigger:visible').evaluate(el => { el.click(); el.click(); });
    await waitClosed();
    await first.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
    assert.equal(await dialog.evaluate(el => el.open), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await page.keyboard.press('Escape');
    await waitClosed();

    await page.locator('.tag-tab').nth(1).click();
    const visibleCards = await page.locator('.proj-card:not(.hidden-card)').count();
    assert.ok(visibleCards > 0 && visibleCards < count);
    assert.equal(await page.getByRole('heading', { level: 2 }).count(), visibleCards);

    await page.goto(baseURL, { waitUntil: 'load' });
    const nodes = await accessibleNodes();
    for (const link of await page.locator('.project-tile, .project-shelf a').all()) {
      const title = (await link.locator('h3, strong').innerText()).trim();
      assert.ok(nodes.some(node => node.role?.value === 'link' && node.name?.value.includes(title)
        && node.name.value.includes('到作品庫查看專案詳情')), title);
    }
    assert.deepEqual(errors, []);
    console.log(`Projects accessibility passed: ${width}px, ${count} cards, focus/keyboard/lightbox/resize/filter/names.`);
    await context.close();
  }
} finally {
  await browser.close();
}
