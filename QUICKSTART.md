# ⚡ Quick Start Checklist

## What You Have
✅ Complete React portfolio website with ASCII background effect
✅ CTF Writeups section with tags
✅ Projects showcase section  
✅ Clean black/white/gray aesthetic
✅ Fully configured for GitHub Pages deployment

## Before You Start - Install These:

1. **Node.js** - Download from https://nodejs.org/ (get LTS version)
2. **Git** - Download from https://git-scm.com/downloads
3. **A code editor** - VS Code recommended: https://code.visualstudio.com/

## 5-Minute Deployment Steps

### 1️⃣ Extract & Setup (2 min)
```bash
# Extract the forrof-portfolio folder
# Open terminal in the forrof-portfolio folder
npm install
```

### 2️⃣ Test Locally (1 min)
```bash
npm start
# Site opens at http://localhost:3000
# Press Ctrl+C to stop when done
```

### 3️⃣ Create GitHub Repo (1 min)
- Go to github.com
- Click "New Repository"
- Name: `forrof.github.io` (exact name!)
- Keep it Public
- Don't initialize with anything
- Click "Create"

### 4️⃣ Deploy (1 min)
```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/forrof/forrof.github.io.git
git branch -M main
git push -u origin main
npm run deploy
```

### 5️⃣ Enable GitHub Pages (30 sec)
- Go to your repo Settings → Pages
- Source: `gh-pages` branch
- Click Save
- Wait 1-2 minutes
- Visit: https://forrof.github.io

## ✏️ Customize Your Content

Open `src/App.jsx` and edit:

**CTF Challenges** (line ~7):
```javascript
const ctfChallenges = [
  {
    id: 1,
    title: "Your CTF Name",
    platform: "HackTheBox",
    difficulty: "Medium",
    category: "Web",
    description: "What you did",
    writeupUrl: "link-to-writeup"
  }
];
```

**Projects** (line ~30):
```javascript
const projects = [
  {
    id: 1,
    name: "Your Project",
    description: "What it does",
    tech: ["Python", "etc"],
    githubUrl: "github.com/forrof/repo"
  }
];
```

## 🔄 Update Site After Changes

```bash
git add .
git commit -m "Updated content"
git push origin main
npm run deploy
```

Wait 1-2 minutes, refresh your site!

## 📱 Files Included

```
forrof-portfolio/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── App.jsx              # Main app (EDIT THIS for content)
│   ├── AsciiNoiseEffect.jsx # Background effect
│   ├── index.jsx            # Entry point
│   └── index.css            # Styles
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind setup
├── postcss.config.js        # PostCSS setup
├── .gitignore              # Git ignore rules
├── README.md               # Documentation
└── DEPLOYMENT_GUIDE.md     # Detailed guide
```

## ❓ Problems?

**Site shows 404?**
- Wait 2-3 minutes after deploying
- Check Settings → Pages is set to `gh-pages` branch

**No background animation?**
- Update your browser
- Try Chrome or Firefox
- Check if WebGL is enabled

**Can't push to GitHub?**
- Set up GitHub authentication
- Or use GitHub Desktop app

## 📚 More Help

- Read `DEPLOYMENT_GUIDE.md` for detailed instructions
- Read `README.md` for customization options
- Check GitHub docs: https://docs.github.com/pages

## 🎉 That's It!

Your site will be live at: **https://forrof.github.io**

Good luck with your cybersecurity portfolio! 🔐
