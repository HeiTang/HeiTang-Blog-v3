# purr.tw — HeiTang's Den

[![Deploy to GitHub Pages](https://github.com/HeiTang/HeiTang-Blog-v3/actions/workflows/deploy.yml/badge.svg)](https://github.com/HeiTang/HeiTang-Blog-v3/actions/workflows/deploy.yml)

橘貓工程師的個人網站，基於 Astro v6 建立，部署至 [purr.tw](https://purr.tw)。

## ✨ 功能

- **文章系統** — Markdown 文章、標籤篩選、Pagefind 全文搜尋
- **GitHub 專案展示** — 置頂 repo + 白名單篩選，每天自動 rebuild 更新
- **邀請碼頁面** — 整合 Google Sheets + GAS JSON API
- **日本制縣圖** — 以 0～5 級呈現 47 都道府縣旅行紀錄
- **演唱會足跡** — 建置期同步 Notion，僅公開購票成功紀錄
- **雙語支援** — 繁體中文（`/`）+ English（`/en/`）
- **RSS Feed** — `/rss.xml`
- **Glassmorphism + Bento Grid** 設計風格（2025-2026 主流）

## 🛠 技術棧

| 項目 | 技術 |
|------|------|
| 框架 | Astro v6 (SSG) |
| 樣式 | Tailwind CSS v3 + CSS Variables |
| 語言 | TypeScript (strict) |
| 搜尋 | Pagefind |
| 部署 | GitHub Pages |
| CI/CD | GitHub Actions |

## 🚀 快速開始

```bash
npm install
npm run dev
```

## 🚀 GitHub 專案展示設定

專案頁面只顯示兩類 repo，不會列出全部公開 repo：

| 來源 | 說明 | 需要 |
|------|------|------|
| **GitHub Pinned** | 你在 GitHub 個人頁面設定的置頂 repo（最多 6 個） | `GITHUB_TOKEN`（GraphQL） |
| **白名單** | 手動指定要顯示的 repo 名稱 | 無 |

### 設定白名單

編輯 `src/config/site.ts`：

```ts
projectsWhitelist: [
  'my-project-name',
  'another-repo',
],
```

名稱需與 GitHub repo 名稱完全一致（區分大小寫）。置頂 repo 不需要加入白名單，會自動顯示。

### 資料更新機制

- 每次推送到 `main` branch 時自動 rebuild
- **每天 UTC 02:00（台灣時間 10:00）** 定時自動 rebuild，確保新專案最多隔一天就會出現
- 也可在 GitHub Actions 頁面手動觸發（`workflow_dispatch`）



```bash
npm run build
npx pagefind --site dist   # 建立搜尋索引
```

## 🔑 環境變數 / GitHub Secrets

| 變數 | 說明 | 必填 |
|------|------|------|
| `GITHUB_TOKEN` | GitHub API Token（提高 rate limit，GraphQL pinned repos 需要） | 建議 |
| `INVITE_CODES_API_URL` | Google Apps Script JSON API 端點 | 邀請碼頁面需要 |
| `NOTION_TOKEN` | Notion internal integration token，設為 Actions Secret | 演唱會頁面需要 |
| `NOTION_DATABASE_ID` | Notion Database 網址中的 32 字元 ID，設為 Actions Variable | 演唱會頁面需要 |
| `PUBLIC_GA_MEASUREMENT_ID` | GA4 評估 ID（`G-XXXXXXXXXX`），設為 Actions Variable | 選填 |

在 GitHub Repository → **Settings → Secrets and variables → Actions** 中設定。

GA4 僅在正式建置且瀏覽網址符合 `siteConfig.url` 的主機名稱時載入；未設定 ID、開發模式及本機預覽均不送出資料。使用 `BaseLayout` 的頁面會記錄瀏覽，獨立的 `/sm/` 文字顯示工具不載入追蹤。修改 Actions Variable 後需重新建置部署才會生效。

## 🗾 日本制縣圖設定

編輯 `src/data/japan.ts` 的 `japanPrefectureLevels`；未列出的都道府縣預設為 Level 0：

```ts
export const japanPrefectureLevels = {
  東京: 3,
  北海道: 4,
} satisfies Partial<Record<PrefectureId, PrefectureLevel>>;
```

Level 定義固定為：0 未踏、1 通過、2 接地、3 到訪、4 住宿、5 居住。

## 🎵 Notion 演唱會同步設定

1. 建立 Notion internal integration，將「演唱會管理」database 分享給該 integration。
    - Connection name：`Blog Concert Sync`
    - Authentication method：`Access token`
2. 將 token 寫入 GitHub Actions Secret `NOTION_TOKEN`。
3. 複製 Database 網址中問號前的 32 字元 ID，寫入 GitHub Actions Variable `NOTION_DATABASE_ID`：

    ```text
    https://app.notion.com/p/{workspace}/{database_id}?v={view_id}
    ```

    建置時會自動取得 Database 底下的第一個 Data Source，不需要手動設定 Data Source ID。
4. 必要欄位為 `Name`、`演出日期`、`演出地點`、`購票階段`；`購票階段` 必須是 Status 或 Select。
5. 建立選填的 `海報` 欄位，類型必須是 Files & media；有多張檔案時只使用第一張。

建置只查詢 `購票階段 = 購票成功`，且只要求以下公開欄位：

```text
Name, 演出日期, 演出地點, 網址, 購票階段, 海報
```

建置前會下載 `海報`、轉成 480×640 與 960×1280 WebP，並以 `/images/concert-posters/` 的同網域網址部署。Notion 的一小時臨時下載網址不會寫入 HTML。生成圖片不提交至 Git；CI 缺少 Notion 設定或海報同步失敗時會停止建置。

本機驗證時複製 `.env.example` 為 `.env`，填入：

```text
NOTION_TOKEN=ntn_...
NOTION_DATABASE_ID=1ae95d00bd038062af32deacd90ceaa5
```

執行 `npm run dev` 會先同步海報再啟動 Astro；`.env` 已被 Git 忽略，不要提交 token。

## 🎫 邀請碼 GAS 設定

1. 建立 Google Sheet，欄位：`code, service, description, descriptionEn, url, status, expiry, notes`
2. Extensions → Apps Script，部署 doGet Web App（Anyone 可存取）
3. 將 URL 加入 `INVITE_CODES_API_URL` secret
4. GAS 回傳格式：`{ codes: [...], updatedAt: "ISO string" }`

## 📁 目錄結構

```
src/
├── components/          # UI 元件（blog / projects / invite-codes / common）
├── content/blog/        # Markdown 文章
├── content.config.ts    # Astro Content Layer 設定
├── i18n/                # zh / en 翻譯
├── layouts/             # BaseLayout / BlogLayout
├── pages/               # 路由頁面（含 /en/ i18n 路由）
├── services/            # GitHub API / GAS API 服務層
├── styles/global.css    # 全域樣式 + Bento Grid tokens
├── types/               # TypeScript 型別定義
└── utils/               # 工具函式
```

## 📝 新增文章

在 `src/content/blog/` 新增 `.md` 檔案：

```markdown
---
title: '文章標題'
description: '文章描述'
pubDate: 2026-01-01
tags: ['Tag1', 'Tag2']
---

文章內容...
```

省略 `author` 時，作者預設為「黑糖不是炭」（取自 `copy.about.name`）；客座文章可自行填寫 `author`。頁面署名與 BlogPosting 作者會使用同一個值。

### 延伸閱讀：手動優先，未指定時依標籤推薦

在 frontmatter 選填 `relatedPosts`，使用文章檔名（slug），不含 `.md`、`/blog/` 前綴或尾斜線：

```yaml
relatedPosts:
  - github-actions-deploy
  - google-sheets-json-api
```

| 設定 | 行為 |
|------|------|
| 指定 `relatedPosts` | 依填寫順序顯示，只顯示指定文章；指定一篇就只顯示一篇，不自動補滿 |
| 省略 `relatedPosts` | 依共同 tag 數量排序，同分優先較新的發布日期，再同分按 slug 排序；最多 2 篇 |
| `relatedPosts: []` | 關閉這篇的延伸閱讀 |

- tags 採完整字串比對，區分大小寫；同一主題請沿用相同標籤。沒有共同 tag 就不顯示，不推薦不相關文章。
- 自動推薦排除自己與草稿；重複 tag 不會增加分數。
- 已發布文章手動指定不存在的 slug、草稿、自己或重複 slug，build 會報錯。文章改名或改成草稿時，也要更新引用它的清單。
- 標題與 URL 從文章資料取得，由 `BlogLayout` 在正文下方產生靜態 HTML，不需在 Markdown 底部再維護一份清單。正文中的情境連結仍可自行加入。
- 目前三篇文章已手動指定延伸閱讀，可作為範例；新文章省略此欄位即可使用自動推薦。

### 文章搜尋資料

文章會從 frontmatter 自動產生 `BlogPosting` JSON-LD。`updatedDate` 只在內容真的更新時填寫，不使用部署日期；`cover` 只有在圖片確實代表文章時才設定，未設定不會把全站預設 OG 圖宣告成文章主圖。

修改後執行 `npm test`、`npm run build`、`npm run check:seo` 與 `npm run check:font-subsets`。

## 📄 授權

MIT © HeiTang
