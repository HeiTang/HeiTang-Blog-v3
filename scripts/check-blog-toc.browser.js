// Run this async function in the browser console on a blog article, at desktop and mobile widths.
(async () => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const article = document.querySelector('article');
  const toc = document.querySelector('#blog-toc');
  const toggle = document.querySelector('.toc-toggle');
  check(article && toc && toggle, 'Missing article or chapter navigation');
  const rect = article.getBoundingClientRect();
  check(Math.abs(rect.x + rect.width / 2 - document.documentElement.clientWidth / 2) < 1, 'Article is not centered');
  check(document.documentElement.scrollWidth <= innerWidth, 'Horizontal overflow');
  const links = [...toc.querySelectorAll('a')];
  check(links.length > 0, 'Missing chapters');
  for (const link of links) check(document.getElementById(decodeURIComponent(link.hash.slice(1))), 'Broken chapter link');
  window.scrollTo({ top: 0, behavior: 'instant' });
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  check([...toc.querySelectorAll('.toc-subheading')].every(item => item.hidden), 'Subchapters should be collapsed at the opening');
  const childIndex = links.findIndex(link => link.parentElement.classList.contains('toc-subheading'));
  if (childIndex >= 0) {
    const section = document.getElementById(decodeURIComponent(links[childIndex].hash.slice(1)));
    window.scrollTo({ top: scrollY + section.getBoundingClientRect().top - 96, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    check(!links[childIndex].parentElement.hidden, 'Active subchapter must expand');
    const activeParent = links.slice(0, childIndex).findLastIndex(link => !link.parentElement.classList.contains('toc-subheading'));
    let parent = -1;
    links.forEach((link, index) => {
      if (!link.parentElement.classList.contains('toc-subheading')) parent = index;
      else check(link.parentElement.hidden === (parent !== activeParent), 'Only the current chapter should expand');
    });
  }
  if (matchMedia('(min-width: 1440px)').matches) {
    const sidebar = toc.getBoundingClientRect();
    check(sidebar.x - rect.right >= 48 && sidebar.right <= innerWidth, 'Sidebar needs 48px clearance without overflowing');
    check(!toc.hasAttribute('popover'), 'Desktop navigation must stay visible');
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    check(links.at(-1).getAttribute('aria-current') === 'location', 'Page bottom must activate the final chapter');
    const last = links.at(-1).getBoundingClientRect();
    const panel = toc.getBoundingClientRect();
    check(last.top >= panel.top && last.bottom <= panel.bottom + 1, 'Active chapter is clipped inside the desktop navigation');
  } else {
    if (toc.matches(':popover-open')) toc.hidePopover();
    toggle.click();
    check(toc.matches(':popover-open'), 'Mobile button did not open navigation');
    const panel = toc.getBoundingClientRect();
    check(panel.top >= 0 && panel.bottom <= innerHeight, 'Mobile panel is outside viewport');
    links[0].click();
    check(!toc.matches(':popover-open'), 'Selecting a chapter must close the panel');
    check(location.hash === links[0].hash, 'Chapter navigation failed');
  }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  check(toc.querySelectorAll('[aria-current="location"]').length === 1, 'Expected one active chapter');
  return 'PASS: centered article, chapter links, responsive navigation and active chapter';
})
