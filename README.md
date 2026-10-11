<h1 align="center">黑糖ㄉ貓窩</h1>

<p align="center"><a href="https://github.com/HeiTang/HeiTang-Blog-v3/actions/workflows/deploy.yml"><img alt="Deploy to GitHub Pages" src="https://github.com/HeiTang/HeiTang-Blog-v3/actions/workflows/deploy.yml/badge.svg"></a></p>

<p align="center">這裡是 HeiTang 的個人網站，分享技術文章與開發作品，也記錄旅行、演唱會和日常生活。</p>

## 網站內容

| 區域 | 路徑 | 說明 | 詳細資訊 |
| --- | --- | --- | --- |
| 文章與搜尋 | `/blog/`<br>`/blog/{slug}/` | Markdown 文章、標籤篩選、Pagefind 全文搜尋 | [文章與頁面內容](docs/content.md) |
| 作品集 | `/projects/`<br>`/projects/{slug}/` | 手動整理的作品清單與專案介紹 | [編輯作品資料](docs/content.md#作品集) |
| 邀請碼 | `/invite-codes/` | 建置時讀取外部 JSON API | [邀請碼設定](docs/integrations.md#邀請碼) |
| 日本制縣圖 | `/japan/` | 以 0～5 級記錄 47 個都道府縣 | [編輯制縣資料](docs/content.md#日本制縣圖) |
| 演唱會足跡 | `/concerts/` | 建置時從 Notion 讀取購票成功紀錄及海報 | [Notion 串接設定](docs/integrations.md#演唱會與-notion) |
| 關於我 | `/about/` | 個人介紹與技術技能 | — |
| RSS | `/rss.xml` | 文章訂閱 | [其他頁面](docs/content.md#其他頁面) |
| GA4 | 全站 | 正式網站的瀏覽器端分析 | [分析設定](docs/integrations.md#google-analytics-4) |

## 快速開始

需要 Node.js `>=22.12.0`。

```bash
npm ci
cp .env.example .env # 要在本機使用 Notion 或邀請碼資料時才需要
npm run dev
```

## 文件導覽

| 想了解或修改 | 看這裡 |
| --- | --- |
| 本機開發、驗證指令、CI 與部署流程 | [開發與部署](docs/development.md) |
| 外部 API、環境變數、GitHub Actions 整合 | [外部 API 與環境變數](docs/integrations.md) |
| 新增文章、修改作品或旅行資料 | [文章與頁面內容](docs/content.md) |

## 技術摘要

| 項目 | 技術 |
| --- | --- |
| 網站 | Astro 6、TypeScript、Tailwind CSS 3 |
| 輸出 | 靜態 HTML，沒有正式環境 SSR runtime |
| 搜尋 | Pagefind |
| 部署 | GitHub Pages、GitHub Actions |

## 目錄

```text
docs/                 維護與設定說明
src/content/blog/     Markdown 文章
src/config/site.ts    網站與作品集資料
src/data/             日本制縣等結構化資料
src/pages/            Astro 路由頁面
src/services/         外部資料服務
```

## 授權

MIT © HeiTang
