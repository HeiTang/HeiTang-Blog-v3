---
title: 'Google Apps Script 打造個人 JSON API'
description: '利用 Google Sheets + GAS 建立一個免費的 JSON API，用於管理邀請碼或任何表格資料，並整合到靜態網站中。'
pubDate: 2026-03-01
author: HeiTang
tags: ['Google Apps Script', 'API', 'Google Sheets']
lang: zh
---

## 為什麼用 Google Sheets 當資料庫？

對於小型個人網站，Google Sheets 是一個絕佳的「無後端資料庫」：

- ✅ 完全免費
- ✅ 可用熟悉的試算表介面管理資料
- ✅ 透過 GAS 轉換成 API
- ✅ 支援協作編輯

## 建立 Google Sheet

建立一個試算表，第一列為標題：

| code | service | description | url | status | expiry |
|------|---------|-------------|-----|--------|--------|
| PURR2026 | SomeService | 橘貓推薦 | https://example.com | active | 2027-01-01 |

## 撰寫 Apps Script

在試算表中點選 **Extensions → Apps Script**，貼入以下程式碼：

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Sheet1');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  
  const codes = rows.slice(1)
    .filter(row => row[0]) // 過濾空列
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });

  const response = {
    codes,
    updatedAt: new Date().toISOString(),
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 部署為 Web App

1. 點選 **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** ← 這讓靜態網站可以在 build time 存取
5. 複製 URL，加入專案的 `INVITE_CODES_API_URL` 環境變數

## 在 Astro 中消費 API

```typescript
// src/services/inviteCodes.ts
export async function fetchInviteCodes() {
  const apiUrl = import.meta.env.INVITE_CODES_API_URL;
  const res = await fetch(apiUrl);
  return await res.json();
}
```

## 結語

Google Sheets + GAS 是個人網站的 CRUD 神器。完全免費，無需伺服器，適合邀請碼、連結清單、工具推薦等各種場景！
