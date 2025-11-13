# GitHub Pages 部署完整指南

## 問題說明

`dist` 資料夾無法推送到 GitHub 是因為 `.gitignore` 檔案中忽略了它（這是正常的做法）。

## 部署方式

有兩種方式可以部署到 GitHub Pages：

---

## 方式 1：使用 GitHub Actions 自動部署（推薦）⭐

這是最推薦的方式，每次推送程式碼時會自動建置和部署。

### 步驟：

1. **創建 GitHub Actions 工作流程檔案**

   在專案根目錄創建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # 如果你的主分支是 master，改成 master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **在 GitHub 上啟用 Pages**

   - 進入你的 GitHub 倉庫
   - 點擊 **Settings**（設定）
   - 左側選單找到 **Pages**
   - 在 **Source** 選擇 **GitHub Actions**
   - 儲存設定

3. **推送程式碼**

   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push
   ```

4. **等待部署完成**

   - 進入倉庫的 **Actions** 標籤
   - 查看工作流程執行狀態
   - 完成後，網站會自動部署到 `https://你的帳號.github.io/倉庫名稱/`

---

## 方式 2：手動部署 dist 資料夾

如果你想手動部署，需要暫時允許推送 dist 資料夾。

### 步驟：

1. **修改 .gitignore（暫時）**

   在 `.gitignore` 中註解掉 `dist` 這一行：

   ```
   # dist  # 暫時註解，用於部署
   ```

   或者創建一個 `dist/.gitkeep` 檔案來強制追蹤 dist 資料夾。

2. **建置專案**

   ```bash
   npm run build
   ```

3. **提交並推送**

   ```bash
   git add dist
   git commit -m "Add dist for deployment"
   git push
   ```

4. **在 GitHub 設定 Pages**

   - 進入倉庫的 **Settings** → **Pages**
   - **Source** 選擇 **Deploy from a branch**
   - **Branch** 選擇 `main`（或你的主分支）
   - **Folder** 選擇 `/dist`
   - 點擊 **Save**

5. **恢復 .gitignore**

   部署完成後，記得恢復 `.gitignore`，取消註解 `dist` 這一行。

---

## 方式 3：使用 docs 資料夾（簡單但需手動更新）

1. **建置專案**

   ```bash
   npm run build
   ```

2. **複製 dist 內容到 docs 資料夾**

   ```bash
   # Windows PowerShell
   Copy-Item -Path dist\* -Destination docs\ -Recurse -Force
   
   # 或手動複製 dist 資料夾內的所有檔案到 docs 資料夾
   ```

3. **提交 docs 資料夾**

   ```bash
   git add docs
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

4. **在 GitHub 設定 Pages**

   - **Settings** → **Pages**
   - **Source** 選擇 **Deploy from a branch**
   - **Branch** 選擇 `main`
   - **Folder** 選擇 `/docs`
   - 點擊 **Save**

---

## 推薦方式

**強烈推薦使用方式 1（GitHub Actions）**，因為：
- ✅ 自動化，每次推送程式碼自動部署
- ✅ 不需要手動建置和推送 dist
- ✅ 保持 .gitignore 乾淨
- ✅ 更專業和標準的做法

---

## 常見問題

### Q: 為什麼 dist 被 .gitignore 忽略？
A: 這是標準做法，因為建置產物是自動生成的，不應該提交到版本控制。使用 GitHub Actions 可以自動建置。

### Q: 部署後網站是空白的？
A: 
1. 確認 `404.html` 和 `.nojekyll` 檔案已部署
2. 檢查瀏覽器控制台是否有錯誤（F12）
3. 確認 GitHub Pages 設定正確

### Q: 如何查看部署狀態？
A: 進入倉庫的 **Actions** 標籤，查看工作流程執行狀態。

### Q: 網站網址是什麼？
A: `https://你的GitHub帳號.github.io/倉庫名稱/`

