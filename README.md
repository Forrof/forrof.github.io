# forrof's Portfolio - CTF Writeups & Projects

A cybersecurity portfolio website featuring CTF writeups and projects with an animated ASCII noise effect background.

## Features

- 🎨 Animated ASCII noise effect background
- 📝 CTF writeups section with difficulty and category tags
- 💻 Projects showcase
- 🎯 Clean black, white, and gray aesthetic
- 📱 Responsive design

## Project Structure

```
forrof.github.io/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── AsciiNoiseEffect.jsx
│   ├── index.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation Steps

1. **Clone or create your repository:**
   ```bash
   git clone https://github.com/forrof/forrof.github.io.git
   cd forrof.github.io
   ```

2. **Copy all project files to your repository:**
   - Copy `package.json`
   - Copy `tailwind.config.js`
   - Copy `postcss.config.js`
   - Copy `.gitignore`
   - Create a `public` folder and add `index.html`
   - Create a `src` folder and add:
     - `App.jsx`
     - `AsciiNoiseEffect.jsx`
     - `index.jsx`
     - `index.css`

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm start
   ```
   The site will open at `http://localhost:3000`

## Customization

### Adding Your CTF Writeups

Edit the `ctfChallenges` array in `src/App.jsx`:

```javascript
const ctfChallenges = [
  {
    id: 1,
    title: "Your Challenge Name",
    platform: "HackTheBox/TryHackMe/etc",
    difficulty: "Easy/Medium/Hard",
    category: "Web/Binary/Crypto/Forensics/etc",
    description: "Brief description of the challenge",
    writeupUrl: "link-to-your-writeup"
  },
  // Add more challenges...
];
```

### Adding Your Projects

Edit the `projects` array in `src/App.jsx`:

```javascript
const projects = [
  {
    id: 1,
    name: "Project Name",
    description: "Project description",
    tech: ["Python", "JavaScript", "etc"],
    githubUrl: "https://github.com/forrof/your-repo"
  },
  // Add more projects...
];
```

### Adjusting the Background Effect

Modify the `AsciiNoiseEffect` component props in `src/App.jsx`:

```javascript
<AsciiNoiseEffect
  noiseStrength={0.02}  // Adjust noise intensity
  speed={0.1}           // Animation speed
  cell={8}              // ASCII cell size (smaller = more detail)
  bw={true}             // Black and white mode
  charset={1}           // 0=full, 1=minimal, 2=medium character set
  brightness={0.8}      // Overall brightness
  vignette={0.3}        // Edge darkening effect
  // ... other parameters
/>
```

## Deployment to GitHub Pages

### Step 1: Prepare Your Repository

1. **Create a GitHub repository named `forrof.github.io`** (replace `forrof` with your GitHub username)

2. **Initialize Git in your project** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to your GitHub repository:**
   ```bash
   git remote add origin https://github.com/forrof/forrof.github.io.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy

1. **Build and deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

2. **Wait 1-2 minutes** for GitHub Pages to build and publish your site.

3. **Visit your site at:** `https://forrof.github.io`

### Step 3: Enable GitHub Pages (if needed)

If your site doesn't appear:

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section
4. Under **Source**, select **gh-pages** branch
5. Click **Save**

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Update content"
git push origin main
npm run deploy
```

## Troubleshooting

### Site shows 404
- Ensure your repository is named `username.github.io` (exactly)
- Check that GitHub Pages is enabled in repository settings
- Wait a few minutes after deployment

### Background not showing
- Check browser console for WebGL errors
- Ensure your browser supports WebGL2

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run build` to see detailed errors

## Technologies Used

- React 18
- Tailwind CSS 3
- WebGL2 (for ASCII effect)
- GitHub Pages

## License

MIT License - Feel free to use this template for your own portfolio!

## Credits

ASCII noise effect based on shader code by 0xBalance (https://0xbalance.xyz)
