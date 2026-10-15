# 外部 API 與環境變數

先在下表找到要設定的整合。本機先執行 `cp .env.example .env`；GitHub Actions 的值設在 **Repository → Settings → Secrets and variables → Actions**。

| 要設定什麼 | 變數／Secret | 呼叫時機 | 詳細說明 |
| --- | --- | --- | --- |
| 演唱會與海報 | Secret：`NOTION_TOKEN`；Variable：`NOTION_DATABASE_ID` | Astro 建置、開發啟動前同步海報 | [Notion 設定](#演唱會與-notion) |
| 邀請碼 | Variable：`INVITE_CODES_API_URL` | Astro 建置 | [邀請碼設定](#邀請碼) |
| GA4 | Variable：`PUBLIC_GA_MEASUREMENT_ID` | 正式網站瀏覽器 | [GA4 設定](#google-analytics-4) |
| 字型修復自動化 | Secrets：`FONT_FIX_APP_ID`、`FONT_FIX_APP_PRIVATE_KEY` | 字型檢查失敗的 PR workflow | [GitHub 維護工具](#github-api-與維護工具) |

## 執行方式

- 正式環境是靜態網站，沒有 SSR API backend。
- Notion 和邀請碼資料在建置時抓取；更新後要重新部署才會反映在線上。
- GA4 在符合條件的訪客瀏覽器中執行。
- TypeScript／Node.js 使用原生 `fetch`；Python 字型工具使用 `urllib.request`。
- `GITHUB_TOKEN` 由 GitHub Actions 提供，不需要自行新增 Secret。

## 演唱會與 Notion

### 設定

1. 建立 Notion internal integration，Authentication method 使用 Access token。
2. 將演唱會 Database 分享給 integration；Database ID 是網址中 `?v=` 前的 ID，不用另外設定 Data Source ID。
3. 本機在 `.env` 設 `NOTION_TOKEN`、`NOTION_DATABASE_ID`；GitHub Actions 將 token 設為 Secret、Database ID 設為 Variable。
4. 確認 Database 有必要欄位 `Name`、`演出日期`、`演出地點`、`購票階段`；`購票階段` 類型必須是 Status 或 Select。
5. 執行 `npm run dev` 確認本機資料；海報欄位 `海報` 可選，類型需為 Files & media。

### 建置行為

`src/services/concerts.ts` 以 Bearer token 呼叫 Notion API，讀取第一個 Data Source，再依 `購票階段 = 購票成功` 分頁查詢。

- 只輸出核准欄位：`Name`、`演出日期`、`演出地點`、`網址`、`購票階段`、`海報`。
- `npm run dev` 和 `npm run build` 會先同步海報，轉成 480×640、960×1280 WebP。
- 圖片放在 `public/images/concert-posters/`，用同網域網址呈現；Notion 臨時下載網址不會寫入頁面。
- 生成的海報目錄已加入 `.gitignore`。

| 情況 | 結果 |
| --- | --- |
| 本機沒有 Notion 設定 | 略過海報同步，演唱會頁顯示空清單 |
| CI 缺少設定或 Notion API 失敗 | 建置失敗 |

## 邀請碼

設定 `INVITE_CODES_API_URL`：本機放在 `.env`，GitHub Actions 放在 Repository Variable。repo 沒有保存實際 URL；以該 Variable 的值為準，目標可能是 GAS 或代理端點。

服務使用 GET、要求 JSON。回應格式如下：

```json
{
  "codes": [
    {
      "title": "服務名稱",
      "group": "分類",
      "description": "服務說明",
      "tags": [],
      "status": "active",
      "invite_code": "PURR2026",
      "invite_link": "https://example.com/invite"
    }
  ],
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

資料需符合 [`InviteCode`](../src/types/invite.ts)：

- 必填欄位：`title`、`group`、`description`、`tags`、`status`。
- `group` 作為頁面子分類，無須在 Sheet 新增主分類或子分類欄位。`src/data/invite-categories.ts` 將它對應到「銀行與信用卡／支付與投資／旅遊與交通／飲食與購物／生活與工具」五個主分類；未知分類保留名稱並放入生活與工具。原始 `服務` 中的 Dynadot、Muse.ai 顯示為數位工具，其餘顯示為生活服務；這些規則只作用於頁面資料副本。
- 分享網址為 `/invite-codes/<服務名稱 slug>/`，建置時產生獨立 OG 標籤與 1200×630 PNG（品牌圖示、名稱、使用者回饋、狀態及期限；右側存根有邀請碼時顯示完整代碼，超過可讀寬度時顯示「點開複製邀請碼」，僅有連結則顯示「查看詳情」）。分享頁沿用清單並直接開啟指定詳情；設為 noindex、排除 sitemap 與 Pagefind，避免重複索引。舊的 `?service=` 連結仍可使用。服務改名會改變分享路徑，已公開名稱若要變更，需先保留舊路徑的轉址。
- 分享圖片以 fontkit 讀取 `src/assets/fonts/` 的 Inter、Noto Sans TC、JetBrains Mono，將字型輪廓交給 sharp 繪製，不依賴部署主機的系統字型。這些 TTF 由對應的既有 WOFF2 解壓產生；`noto-font-tool.py generate` 同時更新 Noto 的 WOFF2 與建置用 TTF，Inter／JetBrains Mono 若更新也需同步轉換。
- `invite_code`、`invite_link` 至少提供一個。
- Hero 在每次頁面載入時隨機選最多三筆有效服務：優先有本機 Logo 的服務，再優先同分類；不足三筆才跨分類，Logo 不足時使用文字圖示。沒有回饋文字則顯示描述。使用 sessionStorage 避免連續抽到相同組合（有同等候選時）；完整清單仍保留在靜態 HTML。
- 服務不會逐筆驗證 API 回應；Google Sheets 欄位可自訂，但 GAS 輸出要轉成上述格式。

| 情況 | 結果 |
| --- | --- |
| 本機沒有設定 URL | 使用 `src/data/invite-codes.mock.json` |
| API 請求或 JSON 解析失敗 | 建置可繼續，頁面輸出空清單 |

## Google Analytics 4

1. 將 GA4 Measurement ID（格式 `G-XXXXXXXXXX`）設為 `PUBLIC_GA_MEASUREMENT_ID`。
2. 本機放在 `.env`；GitHub Actions 放在 Repository Variable。
3. 重新建置部署後生效。

GA4 載入條件：

- 正式建置，且瀏覽器 hostname 符合 `siteConfig.url`。
- 頁面使用 `BaseLayout`；獨立的 `/sm/` 頁面不載入。

### 推薦碼頁面事件

列表、各服務分享頁、中英文頁共用追蹤邏輯；`page_view` 沿用 GA4 自動收集，不手動再送一次。

| 事件 | 送出時機 |
| --- | --- |
| `invite_impression` | 列表卡片至少 50% 可見且連續滿 1 秒，每次頁面載入每個服務只計一次；不計首頁裝飾票卡 |
| `invite_view` | 桌面詳情視窗／手機詳情面板開啟，包含直接進入服務分享頁 |
| `invite_copy` | 推薦碼寫入剪貼簿成功 |
| `invite_click` | 點擊「領取回饋」推薦連結 |
| `invite_official_click` | 點擊「活動頁面」官方連結 |
| `invite_share` | 原生分享 API 成功完成，或分享連結寫入剪貼簿成功；取消／失敗不計 |

曝光在頁面進入背景或詳情遮罩開啟時中斷，恢復後重新計時；橫向捲動、篩選與收合由 IntersectionObserver 判定可見範圍。曝光只表示幾何可見，不代表訪客一定閱讀。

### GA4 後台設定

以具有「編輯者」以上權限的帳號，進入 **管理 → 資料顯示 → 自訂定義 → 建立自訂維度**。下表全部選擇範圍 **事件（Event）**，事件參數填英文欄位原名：

| 維度名稱（可自訂） | 事件參數 | 值／用途 |
| --- | --- | --- |
| 推薦服務 ID | `service_id` | 沿用服務分享網址的 slug，供篩選／串接 |
| 推薦服務名稱 | `service_name` | 例如 `遠東銀行 Bankee`，供服務排名 |
| 推薦服務分類 | `category` | 例如 `銀行與信用卡`，與頁面大分類一致 |
| 推薦互動入口 | `entry_point` | `directory`：列表卡片／列表詳情操作；`shared_page`：服務分享頁自動開啟及其後續操作；`shared_query`：舊式 `?service=` 自動開啟及其後續操作 |
| 推薦分享方式 | `share_method` | 僅 `invite_share` 帶入：`native`（原生分享完成）、`copy_link`（分享連結複製成功） |

頁面路徑、來源／媒介、裝置使用 GA4 內建維度。

`service_id` 隨服務名稱產生；改名會改變 ID。自訂事件不傳推薦碼內容、推薦 URL 或剪貼簿文字；GA4 原有頁面瀏覽與增強型評估仍按其設定收集網址。

1. 建議在部署前建立自訂維度，並確認既有 `PUBLIC_GA_MEASUREMENT_ID` 指向正確資源。自訂維度不回補建立前的歷史報表資料；一般報表可能需 24–48 小時。
2. 不需要在後台逐一「建立事件」；網站會直接送出上述事件。可將 `invite_click`、`invite_copy` 標為「重要事件」，代表站內採取行動，不代表對方註冊／成交。
3. 資料串流的「增強型評估 → 外連點擊」可保留，但其自動 `click` 與 `invite_click`／`invite_official_click` 是不同事件，不要加總當成獨立操作人次。
4. 部署後以 Tag Assistant 開啟偵錯工作階段，在 GA4 DebugView 檢查事件及參數。測試查看、複製、兩種外連、分享完成／取消，以及卡片快速捲過不算曝光。一般訪客不用開啟 `debug_mode`。
5. 探索報表以「推薦服務名稱」為列、「事件名稱」為欄，查看事件數與使用者人數；來源成效使用內建「工作階段來源／媒介」。曝光→詳情、詳情→複製／點擊的轉換率用同一服務的使用者漏斗，避免直接用重複事件數相除。

原生分享成功只代表瀏覽器回報完成，不保證收件人收到／開啟；外站註冊、核卡、消費與回饋需服務商資料才能驗證。阻擋追蹤會漏計。

官方文件：[自訂維度](https://support.google.com/analytics/answer/14239696?hl=zh-Hant)、[DebugView](https://support.google.com/analytics/answer/7201382?hl=zh-Hant)、[自訂事件](https://developers.google.com/analytics/devguides/collection/ga4/events)。

## GitHub API 與維護工具

### 網站作品集

`src/services/github.ts` 有 GitHub REST／GraphQL 函式，但目前沒有頁面或元件呼叫它們。

作品頁目前讀取 `src/config/site.ts` 的 `projectsWhitelist` 手動清單；不需要為作品頁設定 `GITHUB_TOKEN`。

### 字型修復 workflow

`.github/workflows/font-repair-pr.yml` 在 PR 驗證失敗後檢查失敗原因：

- 讀取操作使用 Actions 提供的 `GITHUB_TOKEN`。
- 建立修復 PR 或留言時使用 GitHub App；需要 `FONT_FIX_APP_ID` 和 `FONT_FIX_APP_PRIVATE_KEY` 兩個 Secrets。
- `scripts/noto-font-tool.py` 用 `urllib.request` 下載固定 SHA 的 Google Fonts blob，並驗證 SHA。

這是 CI 維護流程，不是網站訪客瀏覽時的 API 請求。
