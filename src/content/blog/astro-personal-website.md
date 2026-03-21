---
title: '用 Astro 建立高效能個人網站'
description: '深入探索 Astro 框架的靜態生成能力，以及如何結合 Glassmorphism 設計趨勢打造令人驚艷的個人網站。'
pubDate: 2026-01-15
author: HeiTang
tags: ['Astro', 'Web Dev', '前端']
lang: zh
---

## 為什麼選擇 Astro？

在 2026 年的今天，前端框架百花齊放，但 **Astro** 以其獨特的「零 JavaScript 預設」哲學，在追求效能的開發者心中佔有一席之地。

### Islands Architecture

Astro 的核心概念是 **Islands Architecture**（孤島架構）——頁面大部分是靜態 HTML，只有需要互動的部分才載入 JavaScript。這讓網站的初始載入極快。

```astro
---
// 這段程式碼在 build time 執行，不會進入瀏覽器
const posts = await getCollection('blog');
---

<!-- 靜態 HTML -->
<ul>
  {posts.map(post => <li>{post.data.title}</li>)}
</ul>
```

## Glassmorphism 設計趨勢

2025-2026 年最受歡迎的設計趨勢之一就是 **Glassmorphism**（玻璃態射）：

- 半透明背景（`rgba(255, 255, 255, 0.08)`）
- `backdrop-filter: blur()` 模糊效果
- 微妙的白色邊框
- 深色背景上的發光效果

```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.5rem;
}
```

## 結語

Astro + Glassmorphism + Bento Grid = 2026 年最潮的個人網站組合。動手試試吧！
