# HeiTang-Blog-v3

Astro 靜態部落格，輸出到 GitHub Pages（https://purr.tw/）。沒有 SSR runtime，所有頁面都是 build 時產生的 HTML。

## Git Flow

本 repo 採用不含 release branch 的簡化 Git Flow。`main` 是正式部署分支，`dev` 是整合分支。

| 分支 | 從哪裡建立 | PR 目標 | 用途 |
| --- | --- | --- | --- |
| `main` | — | — | GitHub Pages 正式環境 |
| `dev` | `main`（僅初始化時） | — | 整合一般開發工作 |
| `feature/<topic>` | `dev` | `dev` | 新功能 |
| `bugfix/<topic>` | `dev` | `dev` | 一般 bug 修正 |
| `perf/<topic>` | `dev` | `dev` | 效能改善 |
| `chore/<topic>` | `dev` | `dev` | 建構、依賴與維護工作 |
| `hotfix/<topic>` | `main` | `main` | 正式環境緊急修正 |

- 新分支名稱使用小寫 kebab-case；新工作不使用 `feat/` 或 `fix/`，既有的歷史分支不需要為此改名。
- 不直接 push、rebase 或 force-push 共用的 `main` / `dev`；所有變更經 PR 合入正確目標分支。
- 建立或重建整合基線時，順序固定為：先確認 `main` 已同步並推送，再將本地 `dev` fast-forward 到 `main`，最後建立或推送 `origin/dev`；不可反過來。
- 一般開發從 `dev` 建立 `feature/*`、`bugfix/*`、`perf/*` 或 `chore/*`，PR 一律指向 `dev`。
- 緊急正式修正從 `main` 建立 `hotfix/*`，PR 指向 `main`。
- 不建立、不使用 `release/<version>`。正式發版直接建立 `dev` → `main` 的 PR；合入後立即把 `main` 同步回 `dev`。
- 將 `main` 同步回 `dev` 時，若 `dev` 是 `main` 的祖先，使用 fast-forward；若兩者分歧，建立 `main` → `dev` 的同步 PR。
- `hotfix/*` 合入 `main` 後，同樣立即同步 `main` 回 `dev`。
- PR 的 base branch 必須是 `dev` 或 `main`，不要再使用已淘汰的 `master`。
- 分支合併且沒有其他 PR 或工作依賴後，清除對應的本地與遠端 branch；未合併、目前使用中或明確標為 backup 的 branch 不得自行刪除。

## 部署鏈（`.github/workflows/deploy.yml`）

push `main` 或每日 UTC 02:00 觸發：

```
npm ci → npm test → npm run build → npm run check:font-subsets → npm run check:seo → npx pagefind --site dist → deploy
```

任何一步失敗就不會 deploy，線上站停在上一版。

## 硬規則

- **`dependencies` 不得使用 `file:` 或 `link:` 協定。** CI 只 checkout 這個 repo，相對路徑的套件不存在，`npm ci` 會直接失敗。要在本機試鄰近套件請用 `npm link`，不要寫進 `package.json`。
- **要能被搜尋到的內容必須出現在靜態 HTML 裡。** Pagefind 解析 `dist/*.html`、不執行 JS，所以 client-side 才渲染的東西一律索引不到。加 client 元件前先想清楚哪些文字會消失。
- **注入 CSS 字串用 `<style is:inline set:html={css}></style>`。** 換成 `is:global` 的話 Astro 不會處理該標籤，`is:global` 屬性會原封不動出現在輸出的 HTML 裡。
- **曾經對外的路徑不要隨手刪**（例如 `public/licenses/*`），刪掉就是 404。
- 主要頁面都有 `structuredData` 與 `data-pagefind-body`，改版面時一起確認還在。

## 驗證

```sh
npm test            # node --test + --experimental-strip-types 跑 src/**/*.test.ts，沒有測試框架
npm run build
npm run check:seo   # 靜態 SEO 與公開輸出檢查
```

`npm run build` 前會跑 `sync:concert-posters`，缺 Notion 環境變數時會退回空資料，不算錯誤。

## `/japan/` 版面契約

改這頁前先看 https://purr.tw/japan/，版面要維持：h1 的制縣等級翻牌數字、統計列（已踏足 / 住宿以上 / 居住）、滿版漂浮地圖、右下角的「0–5 分級」膠囊。

- 地圖來自 npm 套件 `japan-prefecture-map`（同工作區 `~/0rangeLab/japan-prefecture-map`）
- 這個 repo 只維護 `src/data/japan.ts` 裡的 `japanPrefectureLevels`，其餘（47 縣資料、等級文案、分數統計）都由套件提供
- 分數與統計一律取自 `japanStats`，不要自己再 filter 一次
