# 🚀 Complete Deployment Guide for forrof.github.io

## 📋 Prerequisites Checklist

Before you begin, ensure you have:
- [ ] A GitHub account (username: forrof)
- [ ] Git installed on your computer
- [ ] Node.js (v14+) and npm installed
- [ ] A text editor or IDE (VS Code, Sublime, etc.)

## 🔧 Step-by-Step Deployment Process

### Step 1: Create GitHub Repository

1. **Go to GitHub** (github.com) and log in
2. **Click the "+" icon** in the top right → "New repository"
3. **Repository name:** `forrof.github.io` (MUST be exactly this)
4. **Settings:**
   - ✅ Public repository
   - ✅ Do NOT initialize with README
   - ✅ Do NOT add .gitignore or license yet
5. **Click "Create repository"**

### Step 2: Set Up Local Project

1. **Create a project folder:**
   ```bash
   mkdir forrof.github.io
   cd forrof.github.io
   ```

2. **Create the project structure:**
   ```bash
   mkdir public src
   ```

3. **Copy all the files I created into your project:**
   
   **Root directory files:**
   - `package.json`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `.gitignore`
   - `README.md`

   **In the `public/` folder:**
   - `index.html`

   **In the `src/` folder:**
   - `App.jsx`
   - `AsciiNoiseEffect.jsx`
   - `index.jsx`
   - `index.css`

### Step 3: Install Dependencies

1. **Open terminal in your project folder**

2. **Install all required packages:**
   ```bash
   npm install
   ```
   
   This will install:
   - React
   - React DOM
   - Tailwind CSS
   - gh-pages (for deployment)
   - All other dependencies

3. **Wait for installation to complete** (may take 1-3 minutes)

### Step 4: Test Locally

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Your browser should automatically open** to `http://localhost:3000`

3. **Verify:**
   - ✅ Background ASCII effect is visible and animating
   - ✅ Navigation tabs work (CTF Writeups / Projects)
   - ✅ Sample content displays correctly
   - ✅ No console errors (press F12 to check)

4. **Stop the server** when done testing (Ctrl+C in terminal)

### Step 5: Customize Your Content

1. **Open `src/App.jsx` in your text editor**

2. **Update CTF challenges** (around line 7):
   ```javascript
   const ctfChallenges = [
     {
       id: 1,
       title: "Your actual CTF challenge name",
       platform: "HackTheBox", // or TryHackMe, PicoCTF, etc.
       difficulty: "Medium",    // Easy, Medium, or Hard
       category: "Web",         // Web, Binary, Crypto, Forensics, etc.
       description: "Brief description of what you did",
       writeupUrl: "#"          // Link to your writeup (can be GitHub, blog, etc.)
     },
     // Add more challenges...
   ];
   ```

3. **Update projects** (around line 30):
   ```javascript
   const projects = [
     {
       id: 1,
       name: "Your Project Name",
       description: "What this project does",
       tech: ["Python", "Nmap", "etc"],
       githubUrl: "https://github.com/forrof/your-repo-name"
     },
     // Add more projects...
   ];
   ```

4. **Save the file**

5. **Test again:**
   ```bash
   npm start
   ```

### Step 6: Initialize Git and Push to GitHub

1. **Initialize Git repository:**
   ```bash
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Create first commit:**
   ```bash
   git commit -m "Initial commit: Portfolio with CTF writeups and projects"
   ```

4. **Connect to your GitHub repository:**
   ```bash
   git remote add origin https://github.com/forrof/forrof.github.io.git
   ```

5. **Rename branch to main** (if needed):
   ```bash
   git branch -M main
   ```

6. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

### Step 7: Deploy to GitHub Pages

1. **Build and deploy:**
   ```bash
   npm run deploy
   ```

2. **What happens:**
   - Creates an optimized production build
   - Creates/updates the `gh-pages` branch
   - Pushes build files to GitHub
   - Takes about 1-2 minutes

3. **Wait for completion** - you'll see messages like:
   ```
   Published
   ```

### Step 8: Configure GitHub Pages

1. **Go to your repository** on GitHub: `https://github.com/forrof/forrof.github.io`

2. **Click "Settings"** (top menu)

3. **Click "Pages"** (left sidebar)

4. **Under "Source":**
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Click **Save**

5. **Wait 1-2 minutes** for GitHub to build your site

### Step 9: Verify Deployment

1. **Visit your site:** `https://forrof.github.io`

2. **Check that:**
   - ✅ Site loads properly
   - ✅ Background animation works
   - ✅ Your content appears correctly
   - ✅ Links work
   - ✅ Mobile responsive (resize browser or check on phone)

## 🔄 How to Update Your Site

After making changes to your content:

1. **Edit files** (usually `src/App.jsx` for content)

2. **Test locally:**
   ```bash
   npm start
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Update: Added new CTF writeup"
   ```

4. **Push to GitHub:**
   ```bash
   git push origin main
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

6. **Wait 1-2 minutes**, then refresh your site

## ⚙️ Customization Options

### Change Background Effect

In `src/App.jsx`, modify the `<AsciiNoiseEffect>` component props:

```javascript
<AsciiNoiseEffect
  noiseStrength={0.02}    // More = more distortion (0-0.1)
  speed={0.1}             // Animation speed (0-1)
  cell={8}                // Cell size: smaller = more detailed (4-20)
  bw={true}               // true = black/white, false = color
  charset={1}             // 0=full, 1=minimal, 2=medium ASCII chars
  brightness={0.8}        // Overall brightness (0-2)
  contrast={1.2}          // Contrast (0-2)
  vignette={0.3}          // Edge darkening (0-1)
/>
```

### Change Colors

The site uses Tailwind CSS classes. Common ones in `src/App.jsx`:

- `bg-black` → background color
- `text-white` → text color
- `border-gray-700` → border color
- `hover:bg-gray-700` → hover effects

You can change these to other Tailwind colors or add custom CSS.

## 🐛 Common Issues & Solutions

### Issue: "npm: command not found"
**Solution:** Install Node.js from nodejs.org

### Issue: Site shows 404
**Solutions:**
- Ensure repository name is exactly `forrof.github.io`
- Check GitHub Pages settings (Step 8)
- Wait 2-5 minutes after deployment
- Clear browser cache

### Issue: Background is black screen (no animation)
**Solutions:**
- Check browser console (F12) for WebGL errors
- Try different browser (Chrome, Firefox, Edge)
- Update graphics drivers
- Reduce `cell` size in AsciiNoiseEffect props

### Issue: "Permission denied" when pushing to GitHub
**Solutions:**
- Set up GitHub authentication: https://docs.github.com/en/authentication
- Use GitHub Desktop app instead
- Use personal access token instead of password

### Issue: Deploy fails with "gh-pages branch not found"
**Solution:** The first deploy creates it automatically. If it fails:
```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "Initial gh-pages commit"
git push origin gh-pages
git checkout main
npm run deploy
```

## 📝 Quick Reference Commands

```bash
# Start development server
npm start

# Build for production (test build)
npm run build

# Deploy to GitHub Pages
npm run deploy

# Git workflow
git add .
git commit -m "Your message"
git push origin main

# Full update and deploy
git add . && git commit -m "Update content" && git push && npm run deploy
```

## 📞 Next Steps

1. ✅ Add your actual CTF writeups to the site
2. ✅ Link to your real GitHub repositories
3. ✅ Create actual writeup pages (can be separate .md files or links to Medium, GitHub, etc.)
4. ✅ Consider adding:
   - Contact information
   - Social media links (Twitter, LinkedIn, etc.)
   - Blog section
   - Skills section
   - Resume/CV download

## 🎉 You're Done!

Your cybersecurity portfolio is now live at: **https://forrof.github.io**

Share it with potential employers, on your resume, and in CTF communities!

---

**Need help?** Check the README.md file or create an issue on GitHub.
