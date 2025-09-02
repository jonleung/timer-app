# Complete Guide: Deploying a TSX File to GitHub Pages

## Overview
This guide documents the successful deployment of a React TSX application to GitHub Pages, including what worked, what failed, and best practices for future deployments.

## Prerequisites
- Node.js and npm installed
- GitHub account with gh CLI authenticated (`gh auth login`)
- Original TSX/JSX file with React component

## Step-by-Step Guide

### Step 1: Create React Project with Vite
**✅ DO:**
```bash
npm create vite@latest timer-app -- --template react
cd timer-app
npm install
```

**❌ DON'T:**
- Don't use Create React App (CRA) - it's outdated and slower
- Don't skip the initial npm install

**Why:** Vite is faster, has better HMR, and smaller bundle sizes than CRA.

---

### Step 2: Prepare Your Component
**✅ DO:**
- Convert TSX to JSX if not using TypeScript
- Remove external API dependencies (like LLM API calls)
- Replace API calls with local logic
- Import the component in App.jsx directly

**❌ DON'T:**
- Don't keep external API keys in frontend code
- Don't create unnecessary wrapper components
- Don't add complex routing for a single-page app

**What we did:**
```javascript
// App.jsx - Keep it simple
import TimerApp from './TimerApp'

function App() {
  return <TimerApp />
}

export default App
```

---

### Step 3: Install Dependencies
**✅ DO:**
```bash
# Use stable versions
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D gh-pages
```

**❌ DON'T:**
- Don't use Tailwind CSS v4 yet (as of 2025-09) - it's not stable
- Don't install @tailwindcss/postcss - use the standard tailwindcss package
- Don't forget -D flag for dev dependencies

**Why:** Tailwind v4 requires different PostCSS setup and caused build failures.

---

### Step 4: Configure Tailwind CSS
**✅ DO:**
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},  // NOT @tailwindcss/postcss
    autoprefixer: {},
  },
}
```

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**❌ DON'T:**
- Don't use `npx tailwindcss init -p` with Tailwind v3 (it might fail)
- Don't forget to import index.css in main.jsx

---

### Step 5: Test Locally First
**✅ DO:**
```bash
npm run build  # Test build works
npm run dev    # Test app runs correctly
```

**❌ DON'T:**
- Don't push to GitHub before testing the build locally
- Don't skip visual verification

---

### Step 6: Configure Vite for GitHub Pages
**✅ DO:**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/timer-app/',  // Must match your repo name
})
```

**❌ DON'T:**
- Don't forget the base path - it will break on GitHub Pages
- Don't use absolute paths without the base

---

### Step 7: Set Up Deployment Scripts
**✅ DO:**
```json
// package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

**❌ DON'T:**
- Don't deploy the src folder - always deploy dist
- Don't forget the predeploy script

---

### Step 8: Initialize Git and Create Repository
**✅ DO:**
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create timer-app --public --source=. --remote=origin --push
```

**❌ DON'T:**
- Don't use --push flag before making initial commit
- Don't create private repo if you want free GitHub Pages hosting

---

### Step 9: Enable GitHub Pages
**✅ DO:**
```bash
# First enable Pages with a branch (required)
gh api -X POST repos/USERNAME/REPO/pages \
  --field "source[branch]=main" \
  --field "source[path]=/"

# Then switch to GitHub Actions workflow
gh api -X PUT repos/USERNAME/REPO/pages --field "build_type=workflow"
```

**❌ DON'T:**
- Don't try to enable Pages directly with workflow - it needs a branch first
- Don't skip this step - the workflow will fail without Pages enabled

---

### Step 10: Create GitHub Actions Workflow
**✅ DO:**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
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
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          enablement: true  # Important!
        
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

**❌ DON'T:**
- Don't forget `enablement: true` in Setup Pages action
- Don't use `npm install` - use `npm ci` for faster, reproducible builds
- Don't upload src folder - always upload dist

---

### Step 11: Push and Monitor Deployment
**✅ DO:**
```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main

# Monitor deployment
gh run list --limit 1
gh run watch  # Watch in real-time
```

**❌ DON'T:**
- Don't panic if first deployment fails - check logs
- Don't forget to check the Pages URL after deployment

---

### Step 12: Visual Testing (Optional but Recommended)
**✅ DO:**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create test script:
```javascript
// test-screenshot.js
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/timer-app/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
```

**❌ DON'T:**
- Don't skip visual verification for UI-heavy apps
- Don't commit screenshots to repo (add to .gitignore)

---

## Common Issues and Solutions

### Issue 1: Tailwind CSS Not Working
**Problem:** Styles not applying in production
**Solution:** Downgrade to Tailwind v3, use correct PostCSS config

### Issue 2: GitHub Pages 404
**Problem:** App shows 404 on GitHub Pages
**Solution:** Check vite.config.js base path matches repo name

### Issue 3: Workflow Fails with "Pages not enabled"
**Problem:** GitHub Actions fails at Setup Pages step
**Solution:** Enable Pages via API before pushing workflow

### Issue 4: Build Works Locally but Fails in CI
**Problem:** npm run build fails in GitHub Actions
**Solution:** Check package-lock.json is committed, use npm ci not npm install

---

## Complete Working Example Flow

```bash
# 1. Create project
npm create vite@latest timer-app -- --template react
cd timer-app

# 2. Install ALL dependencies
npm install
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer gh-pages @playwright/test

# 3. Configure Tailwind
echo 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } }' > postcss.config.js
npx tailwindcss init

# 4. Update vite.config.js with base path
# Add: base: '/timer-app/'

# 5. Copy your component
# Place TimerApp.jsx in src/
# Update App.jsx to import it

# 6. Test locally
npm run build
npm run dev

# 7. Initialize git and create repo
git init
git add .
git commit -m "Initial commit"
gh repo create timer-app --public --source=. --remote=origin --push

# 8. Enable GitHub Pages
gh api -X POST repos/$(gh api user --jq .login)/timer-app/pages \
  --field "source[branch]=main" --field "source[path]=/"
gh api -X PUT repos/$(gh api user --jq .login)/timer-app/pages \
  --field "build_type=workflow"

# 9. Add workflow file
mkdir -p .github/workflows
# Create deploy.yml with content from Step 10

# 10. Deploy
git add .
git commit -m "Add deployment workflow"
git push origin main

# 11. Monitor
gh run watch
```

---

## Key Takeaways

1. **Always use stable versions** - Bleeding edge (like Tailwind v4) can cause issues
2. **Test locally first** - Never push without local build test
3. **Enable Pages before workflow** - The API requires initial branch setup
4. **Use Vite over CRA** - Faster, smaller, better DX
5. **Remove external dependencies** - Simplify for static hosting
6. **Visual testing helps** - Playwright screenshots catch styling issues
7. **Monitor deployments** - Use gh CLI to watch runs

## Time Estimate
- Initial setup to deployment: ~15-20 minutes
- Debugging common issues: +10-30 minutes
- Total typical time: 20-45 minutes

## Success Metrics
✅ App builds locally without errors
✅ GitHub Actions workflow passes
✅ App is accessible at https://[username].github.io/[repo-name]
✅ Styling matches original design
✅ All interactive features work