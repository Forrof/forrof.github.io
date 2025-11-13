# ⚡ Quick Reference - Adding CTF Writeups

## 3-Step Process

### 1️⃣ Create Writeup File
```bash
# Create new file
nano public/writeups/my-challenge.md
```

### 2️⃣ Write in Markdown
```markdown
# Challenge Name

**Platform:** HackTheBox
**Difficulty:** Medium  
**Category:** Web

## Description
...

## Exploitation
```bash
exploit command
```

**Flag:** `CTF{flag}`
```

### 3️⃣ Add to App.jsx
```javascript
// In src/App.jsx, add to ctfChallenges array:
{
  id: 5,
  title: "My Challenge",
  platform: "HackTheBox",
  difficulty: "Medium",
  category: "Web",
  description: "Brief description",
  writeupPath: "/writeups/my-challenge.md"
}
```

## Common Markdown

```markdown
# H1 Header
## H2 Section  
### H3 Subsection

**Bold text**

`inline code`

```language
code block
```

- Bullet list
1. Numbered list

---
Horizontal line
```

## File Locations

- **Writeups:** `public/writeups/*.md`
- **Challenges:** `src/App.jsx` (ctfChallenges array)
- **Viewer:** `src/WriteupViewer.jsx`

## Deploy

```bash
git add .
git commit -m "Add writeup: Challenge Name"
git push origin main
npm run deploy
```

## Quick Test

```bash
npm start
# Click challenge card
# Should see writeup modal
```

---

**Need help?** See `WRITEUP_SETUP.md` or `WRITEUPS_GUIDE.md`
