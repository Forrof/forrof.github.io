# How to Add CTF Writeups

## Quick Start

1. Create a new `.md` file in `public/writeups/`
2. Write your writeup in Markdown
3. Update the challenge in `src/App.jsx` with the writeup path

## Step-by-Step Guide

### Step 1: Create Your Writeup File

Create a new Markdown file in the `public/writeups/` folder:

```bash
public/writeups/your-challenge-name.md
```

### Step 2: Write Your Writeup

Use this template structure:

```markdown
# Challenge Title

**Platform:** HackTheBox / TryHackMe / PicoCTF / etc.
**Difficulty:** Easy / Medium / Hard
**Category:** Web / Binary / Crypto / Forensics / etc.
**Date:** Month Year

---

## Challenge Description

Describe what the challenge is about.

## Reconnaissance

What you discovered during initial investigation.

## Exploitation

### Step 1: Finding the Vulnerability

Explain the first step...

```bash
# Command examples
echo "test"
```

### Step 2: Exploiting

More details...

```python
# Python exploit code
exploit = "payload"
```

## Solution

How you solved it and got the flag.

## Key Takeaways

- Learning point 1
- Learning point 2
- Learning point 3

---

**Flag:** `CTF{your_flag_here}`
```

### Step 3: Update App.jsx

Add or update your challenge in the `ctfChallenges` array in `src/App.jsx`:

```javascript
const ctfChallenges = [
  {
    id: 1, // Unique number
    title: "Your Challenge Name",
    platform: "HackTheBox",
    difficulty: "Medium", // Easy, Medium, or Hard
    category: "Web", // Web, Binary, Crypto, Forensics, etc.
    description: "Brief one-line description",
    writeupPath: "/writeups/your-challenge-name.md" // Path to your .md file
  },
  // ... other challenges
];
```

### Step 4: Test Locally

```bash
npm start
```

Click on your challenge card and verify the writeup displays correctly.

### Step 5: Deploy

```bash
git add .
git commit -m "Add writeup: Your Challenge Name"
git push origin main
npm run deploy
```

## Markdown Features Supported

### Headers
```markdown
# H1 - Main Title
## H2 - Section
### H3 - Subsection
```

### Code Blocks
````markdown
```bash
echo "Bash commands"
```

```python
print("Python code")
```

```sql
SELECT * FROM users;
```
````

### Inline Code
```markdown
Use `inline code` for commands or variables
```

### Bold Text
```markdown
**Important text** or __bold text__
```

### Lists
```markdown
- Bullet point 1
- Bullet point 2

1. Numbered item 1
2. Numbered item 2
```

### Horizontal Rules
```markdown
---
```

## File Organization

```
public/
└── writeups/
    ├── sql-injection-login.md
    ├── buffer-overflow.md
    ├── xss-stored.md
    └── your-new-writeup.md
```

## Tips

1. **Use descriptive filenames**: `buffer-overflow-exploit.md` not `challenge1.md`
2. **Keep it organized**: One writeup per file
3. **Include code snippets**: Use proper syntax highlighting
4. **Add images** (optional): Place in `public/images/writeups/` and reference with `![Alt text](/images/writeups/screenshot.png)`
5. **Be detailed**: Future you will thank present you
6. **Include flags**: Always show the flag at the end

## Example Writeup Structure

```
# Challenge Title
**Metadata**
---
## Description
## Reconnaissance  
## Vulnerability Discovery
## Exploitation
   ### Step 1
   ### Step 2
   ### Step 3
## Mitigation
## Tools Used
## Key Takeaways
---
**Flag:** ...
```

## Styling

The writeup viewer automatically styles:
- Headers (h1, h2, h3)
- Code blocks with syntax highlighting
- Inline code with green monospace
- Lists and paragraphs
- Horizontal rules

## Troubleshooting

**Writeup doesn't load?**
- Check the file path is correct in `writeupPath`
- Ensure the file is in `public/writeups/`
- File must be `.md` extension

**Formatting looks wrong?**
- Check Markdown syntax
- Ensure code blocks use triple backticks
- Test locally with `npm start`

**Want to hide a challenge?**
- Set `writeupPath: "#"` to show "Writeup coming soon..."

## Need Help?

Check the example writeups:
- `public/writeups/sql-injection-login.md`
- `public/writeups/buffer-overflow.md`

---

Happy writing! 📝🚩
