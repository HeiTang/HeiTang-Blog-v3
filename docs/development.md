# 開發與部署

## 本機開發

需要 Node.js `>=22.12.0`。在 repo 根目錄執行：

```bash
npm ci
cp .env.example .env
npm run dev
```

`.env` 的值依需求填寫；環境變數用途與 GitHub Actions 設定方式見[外部 API 與環境變數](integrations.md)。沒有 Notion 設定時，本機開發會略過海報同步，演唱會頁面顯示空資料。

`npm run dev` 會先執行 `predev`，同步 Notion 海報，再啟動 Astro。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 同步海報並啟動本機開發伺服器 |
| `npm test` | 執行 Node.js 內建測試 |
| `npm run build` | 同步海報並產生 `dist/` 靜態網站 |
| `npm run check:font-subsets` | 檢查頁面可見字元是否涵蓋於子集字型 |
| `npm run check:seo` | 檢查靜態 SEO 與公開輸出 |
| `npm run check:font-cmap` | 驗證 WOFF2 cmap 與可變字重軸 |
| `npm run preview` | 本機預覽最近一次建置結果 |

本機若要產生 Pagefind 索引，建置後執行：

```bash
npx pagefind --site dist
```

## 驗證與部署

`.github/workflows/pr-validation.yml` 會驗證目標為 `dev` 或 `main` 的 PR。合併至 `main` 後，`.github/workflows/deploy.yml` 會依序安裝依賴、執行測試（排程建置略過）、建置、檢查字型與 SEO、產生 Pagefind 索引，再部署到 GitHub Pages。

部署 workflow 也會在每天 UTC 02:00（台灣時間 10:00）排程執行，或由 GitHub Actions 手動觸發。網站是靜態輸出；建置時讀取的外部資料要等下一次成功部署才會反映到線上頁面。

## 分支流程

- `main` 是正式部署分支，`dev` 是整合分支。
- 一般工作從 `dev` 建立 `feature/*`、`bugfix/*`、`perf/*` 或 `chore/*`，PR 目標為 `dev`。
- 正式發版以 `dev` → `main` PR 合併；合併後同步 `main` 回 `dev`。
- 不直接 push、rebase 或 force-push 共用的 `main`、`dev`。
