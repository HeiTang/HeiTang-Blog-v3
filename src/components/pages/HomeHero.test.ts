import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('homepage hero keeps contact and a motion-safe typewriter', async () => {
  const [source, home, layout, site, global] = await Promise.all([
    readFile(new URL('./HomeHero.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../layouts/BaseLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../config/site.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../styles/global.css', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /const homeTitle = '黑糖不是炭';/);
  assert.match(source, /import \{ Picture \} from 'astro:assets';/);
  assert.match(source, /import profileImage from '\.\.\/\.\.\/assets\/profile\.jpeg';/);
  assert.match(source, /widths=\{\[140, 280, 420\]\}/);
  assert.match(source, /sizes="\(min-width: 768px\) 15vw, 140px"/);
  assert.match(source, /formats=\{\['avif', 'webp'\]\}/);
  assert.match(source, /fallbackFormat="jpeg"/);
  assert.match(source, /loading="eager"/);
  assert.doesNotMatch(source, /\/images\/profile\.jpeg/);
  assert.doesNotMatch(source, /fonts\.googleapis\.com\/css2/);
  assert.match(global, /font-family: 'Nasalization Rg';/);
  assert.match(global, /nasalization-brand\.woff/);
  assert.match(global, /--font-heitang-brand: 'Nasalization Rg', 'Inter', 'Noto Sans TC'/);
  assert.match(source, /font-family: 'DotGothic16', sans-serif;/);
  assert.match(source, /const typewriterText = \[/);
  assert.match(source, /const typewriterText = \[\s+'[^']+',/);
  assert.match(source, /const typewriterCompactText = \[\s+'橘貓不胖只是蓬鬆了點！'/);
  assert.match(source, /data-typewriter-compact=\{JSON\.stringify\(typewriterCompactText\)\}/);
  assert.match(source, /max-width: 360px/);
  assert.match(source, /data-typewriter=\{JSON\.stringify\(typewriterText\)\}/);
  assert.match(source, /textIndex = \(textIndex \+ 1\) % texts\.length;/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /block-size: 3\.3rem;/);
  assert.match(source, /white-space: nowrap;/);
  assert.match(source, /position: absolute;/);
  assert.match(source, /document\.fonts\.load/);
  assert.doesNotMatch(source, /typewriter\.textContent = ''/);
  assert.doesNotMatch(source, /class="eyebrow"/);
  assert.match(source, /margin-top: 4\.25rem;/);
  assert.match(source, /min-height: calc\(100svh - 4\.25rem\)/);
  assert.match(source, /--hero-accent: #e78242;/);
  assert.match(source, /font-size: clamp\(2\.15rem, 6vw, 4\.6rem\);/);
  assert.match(source, /font-family: 'DotGothic16', sans-serif;/);
  assert.match(source, /font-size: clamp\(1\.05rem, 2\.4vw, 1\.35rem\);/);
  assert.match(source, /font-size: 0\.83rem;/);
  assert.match(source, /font-family: 'JetBrains Mono', ui-monospace, monospace;/);
  assert.match(source, /<section class="hero" aria-labelledby="hero-title">/);
  assert.match(source, /<h1 id="hero-title">\{homeTitle\}<\/h1>/);
  assert.match(source, /aria-label="聯絡方式"/);
  assert.match(source, /<ul class="contact-list" aria-label="聯絡方式">/);
  assert.match(site, /telegram: 'https:\/\/t\.me\/HeiTang'/);
  assert.match(site, /discord: 'https:\/\/discord\.com\/users\/463332148968030208'/);
  assert.match(source, /href=\{`mailto:\$\{siteConfig\.social\.email\}`\}/);
  assert.match(source, /href=\{siteConfig\.social\.telegram\}/);
  assert.match(source, /href=\{siteConfig\.social\.github\}/);
  assert.match(source, /href=\{siteConfig\.social\.discord\}/);
  assert.match(source, /aria-label="寄送電子郵件至 heitang@purr\.tw"/);
  assert.match(source, /aria-label="Telegram（開新分頁）"/);
  assert.match(source, /aria-label="GitHub（開新分頁）"/);
  assert.match(source, /aria-label="Discord（開新分頁）"/);
  assert.doesNotMatch(source, /contact-channel--placeholder/);
  assert.doesNotMatch(source, /<span>(?:Mail|IG|X|Telegram|Discord)<\/span>/);
  assert.match(source, /aria-label="前往精選作品"/);
  assert.doesNotMatch(source, />\s*看精選作品\s*</);
  assert.match(source, /const projectStories = \[/);
  assert.match(source, /name: 'yannick-stock-checker',\s+title: '亞尼克 YTM 庫存查詢'/);
  assert.match(source, /const featuredProjects = projectStories\.flatMap/);
  assert.match(source, /const shelfProjects = siteConfig\.projectsWhitelist/);
  assert.match(source, /<section id="work" class="work" aria-labelledby="work-title">/);
  assert.match(source, /<h2 id="work-title">或許你會喜歡<\/h2>/);
  assert.doesNotMatch(source, /work-heading|挑三個近期工具/);
  assert.match(source, /<div class="project-wall">/);
  assert.match(source, /featuredProjects\.map\(\(project, index\)/);
  assert.match(source, /<h3>\{project\.title\}<\/h3>/);
  assert.match(source, /widths=\{\[480, 768, 1280\]\}/);
  assert.match(source, /sizes=\{project\.imageSizes\}/);
  assert.match(source, /fallbackFormat="png"/);
  assert.doesNotMatch(source, /\/images\/projects\//);
  assert.match(source, /<ul class="project-shelf" aria-label="更多作品">/);
  assert.match(source, /shelfProjects\.map\(\(project, index\)/);
  assert.match(source, /loading="lazy"/);
  assert.doesNotMatch(source, /work-list|work-entry/);
  assert.match(source, /hasPointerGlow=\{false\}/);
  assert.match(source, /data-pagefind-body="true"/);
  assert.match(source, /'@type': 'WebSite'/);
  assert.doesNotMatch(source, /isDemo/);
  assert.match(home, /import HomeHero from '\.\.\/components\/pages\/HomeHero\.astro';/);
  assert.match(home, /<HomeHero \/>/);
  assert.match(layout, /data-pointer-glow=\{hasPointerGlow \? undefined : 'off'\}/);
  assert.match(layout, /const pointerGlowEnabled = document\.body\.dataset\.pointerGlow !== 'off';/);
});
