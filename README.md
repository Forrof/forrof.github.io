# forrof

Static technical archive for [forrof.github.io](https://forrof.github.io). Astro, TypeScript, Markdown, and original animated character art. No visitor accounts, public editor, write API, or analytics.

## Work locally

Use Node 24 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

Open the local address printed by Astro. To check the complete release:

```sh
npm run validate
npm run preview
```

Astro 7 starts its development server in the background. Use `npx astro dev stop` when finished.

## Write

- Entries: `src/content/entries/*.md`.
- CVEs: `src/content/cves/*.md`; empty until verified records are supplied.
- Selected projects: `src/content/projects/*.json`.
- Images: `public/writeups/<entry>/` or `public/images/<entry>/`.

See [the writing guide](docs/WRITING.md) and its templates. Content is rendered at build time, so articles work without JavaScript. Fonts are bundled locally. JavaScript only enhances the artwork; its pause preference is stored in the reader’s browser.

## Publish

Push approved content changes to `main`. **Validate and publish** checks the content and site, then deploys to [forrof.github.io](https://forrof.github.io). You can also run the workflow manually on `main` from the Actions tab. The repository’s Pages source must be **GitHub Actions**.

Pull requests run validation only. Deployments can run only from `main`. The workflow uploads only `dist/`, never repository source. Do not restore the old `npm run deploy` flow: it would overwrite `gh-pages` directly.

The old source is preserved in Git history, and the old deployed `gh-pages` branch is untouched. Its pre-redesign revision is `0fae2695351f4ae55fff33277a40baec893ab677`. To roll back to the legacy site, change Pages back to the `gh-pages` branch, root directory. For later releases, revert the relevant source change and let the workflow deploy it.

Only give repository write permission to forrof, and keep Actions approvals and branch settings under that account’s control. The static site itself cannot accept reader edits.
