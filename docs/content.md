# 文章與頁面內容

## 新增文章

**新增文章：** 在 `src/content/blog/` 新增 Markdown 檔案。

**Front Matter 設定：** 

```markdown
---
title: '文章標題'
description: '文章描述'
pubDate: 2026-01-01
tags: ['日本旅行', '東京']
---

文章內容...
```

支援參數：

| 欄位 | 必填 | 說明 | 預設值／省略行為 |
| --- | --- | --- | --- |
| `title` | 是 | 文章標題。 | 無 |
| `description` | 是 | 文章摘要。 | 無 |
| `pubDate` | 是 | 發布日期，格式為 `YYYY-MM-DD`。 | 無 |
| `updatedDate` | 否 | 最後更新日期，輸出至頁面與 BlogPosting JSON-LD。 | 無 |
| `author` | 否 | 作者署名，也用於 BlogPosting JSON-LD。 | `src/config/copy.ts` 的 `copy.about.name` |
| `tags` | 否 | 文章標籤，用於標籤篩選與自動推薦。 | `[]` |
| `relatedPosts` | 否 | 手動指定相關文章 ID。 | 未設定時自動推薦 |
| `cover` | 否 | 封面圖片，用於 Open Graph 圖片與 BlogPosting JSON-LD。 | 無 |
| `coverAlt` | 否 | 封面替代文字欄位，目前未輸出至頁面。 | 無 |
| `draft` | 否 | 設為 `true` 時，正式建置不輸出文章，RSS 也不收錄。 | `false` |

- 文章頁在建置時輸出為靜態 HTML。署名與 BlogPosting JSON-LD 使用相同的 `author` 值。

- 只在內容實際更新時設定 `updatedDate`；只在圖片能代表文章內容時設定 `cover`。


### 延伸閱讀

```yaml
relatedPosts:
  - github-actions-deploy
  - google-sheets-json-api
```

- **手動指定 `relatedPosts`：** 依 ID 順序顯示，不自動補足。
  - 檔名不含 `.md` 或 `/blog/` 前綴。
  - 設為 `[]` 可關閉延伸閱讀。

- **省略 `relatedPosts`：** 自動推薦最多 2 篇已發布文章，排除本文，且至少共用一個 tag。

  - 依共同 tag 數量由多到少、`pubDate` 由新到舊、文章 ID 升冪排序。

  - tag 以完整字串比對且區分大小寫；重複 tag 只計算一次。


- **資料檢查：** 手動指定的 ID 若不存在、指向草稿或本文，或重複指定，建置會失敗。

- 文章改名或改成草稿時，更新所有引用該文章的 `relatedPosts`。

- **輸出位置：** `BlogLayout` 在文章正文後產生延伸閱讀標題與連結；不需在 Markdown 正文重複維護。

## 作品集 Projects

- **資料來源：** 在 `src/config/site.ts` 編輯 `projectsWhitelist` (頁與作品集頁共用這份清單)。

- **名稱與網址：** `name` 必須與 GitHub repository 名稱完全相同。作品網址會將名稱轉成小寫，例如 `FX-Pulse` → `/projects/fx-pulse/`。

- **精選作品：** 在 `src/components/pages/ProjectsContent.astro` 的 `featuredNames` 指定。每個名稱都必須存在於 `projectsWhitelist`；其餘作品顯示在清單區。

- **欄位型別：** 定義於 `src/types/projects.ts`。

## 日本制縣圖

- **維護位置：**在 `src/data/japan.ts` 編輯 `japanPrefectureLevels`。
- **資料格式：**key 使用 `japan-prefecture-map` 提供的兩位數都道府縣代碼；value 為 `0`～`5`。只列非零等級，未列出的縣視為 `0`。
- **套件資料：**47 縣資料與等級文案由 `japan-prefecture-map` 提供，不要在本站複製維護。
- **分數與統計：**使用 `japanScore`、`japanStats`；不要在頁面重新計算或篩選。

```ts
import type { PrefectureLevels } from 'japan-prefecture-map/data';

export const japanPrefectureLevels = {
  '13': 4,
  '01': 3,
} satisfies PrefectureLevels;
```

## 其他頁面

- 以下英文路徑保留為靜態轉址：
  - `/en/` → `/`
  - `/en/about/` → `/about/`
  - `/en/blog/` → `/blog/`
  - `/en/projects/` → `/projects/`
  - `/en/invite-codes/` → `/invite-codes/`
- RSS feed 位於 `/rss.xml`，由 `src/pages/rss.xml.ts` 產生。
- RSS 只包含已發布文章，並依 `pubDate` 由新到舊排序。

## 搜尋與靜態輸出

- Pagefind 從 `dist/` 中的 HTML 建立索引，不會執行頁面 JavaScript。
- 要納入搜尋的文字必須存在於建置輸出的 HTML；只在瀏覽器端渲染的文字不會被索引。
