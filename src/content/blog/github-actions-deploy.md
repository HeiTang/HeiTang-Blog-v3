---
title: 'GitHub Actions 自動部署完整指南'
description: '從零開始設定 GitHub Actions 自動部署 Astro 靜態網站到 GitHub Pages，並綁定自訂網域。'
pubDate: 2026-02-10
author: HeiTang
tags: ['GitHub', 'DevOps', 'CI/CD']
lang: zh
---

## 前置準備

在開始設定 GitHub Actions 之前，確認你已有：

1. 一個 GitHub Repository（Public 或 Private 均可）
2. Astro 專案已設定好 `site` 配置
3. 一個自訂網域（選擇性）

## 設定 GitHub Pages

前往你的 Repository → **Settings** → **Pages**：

- Source: **GitHub Actions**（不要選 Deploy from branch）

## 建立 Workflow 檔案

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

## 綁定自訂網域

在 `public/CNAME` 加入你的網域：

```
purr.tw
```

然後到你的 DNS 提供商設定：
- `CNAME purr.tw → your-username.github.io`
- 或使用 A record 指向 GitHub 的 IP

## 加入 Secrets

如果有需要保護的 API URL（例如邀請碼 API）：

**Settings → Secrets and variables → Actions → New repository secret**

```
INVITE_CODES_API_URL = https://script.google.com/macros/s/your-script-id/exec
```

## 結語

設定完成後，每次 push 到 main branch 就會自動觸發部署。完全免費，無限期使用！
