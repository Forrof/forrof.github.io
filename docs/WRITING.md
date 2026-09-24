# Writing for the archive

## New entry

Copy `docs/templates/entry.md` to `src/content/entries/your-entry-name.md`. The filename determines `/entries/your-entry-name/`; keep it lowercase with hyphens and avoid changing it after publication.

Fill in the metadata between the opening `---` lines, then write Markdown beneath it. Use `##` for section headings; the page supplies its own title. Headings get permanent links automatically. Fenced code blocks accept a language such as `python`, `bash`, or `powershell`.

`published` accepts a quoted `YYYY-MM-DD` date. Month-only `YYYY-MM` is supported for older posts where the exact day is unknown. Set `updated` only when an existing entry has substantively changed. `type` is `entry` or `writeup`; writeups may include `platform`, `category`, and `difficulty`.

Images live under `public/` but URLs omit that directory:

```md
![Description of the evidence](/images/your-entry-name/capture.png)
```

Keep sensitive material out of screenshots. Existing writeup images and raw Markdown keep their original `/writeups/…` addresses.

Entries appear on the homepage by default. Set `showInIndex: false` to remove an entry from that list without deleting its article, images, or stable URL. Restore it by setting the flag to `true` or removing the field. This is only a listing preference: the article remains public and stays in the sitemap. Free Boost and geometryDash remain excluded; new posts are listed normally.

Math uses `$...$` inline or `$$` on separate lines for display equations. Equations are rendered at build time with locally bundled KaTeX styles and accessible MathML. Markdown tables and footnotes are supported. Use ordinary bold labels inside blockquotes for custom callouts such as disclaimers.

## Drafts and privacy

Set `draft: true` to exclude a record from all generated pages and indexes, including the local site. Set it to `false` when ready to preview the finished page locally. Then run `npm run validate` before publishing.

**A draft flag does not make source private.** This is a public repository. Never commit private research, embargoed findings, tokens, or confidential images. Keep those in a separate private directory/repository. Everything in `public/` is copied to the public site, even if no page links to it. Underscore-prefixed content filenames are also excluded by the loader, not made private.

## Credited CVEs and public advisories

Copy `docs/templates/cve.md` into `src/content/cves/` and replace every placeholder. The route comes from `identifier`, such as `/cves/<lowercase-identifier>/`. Do not create a record without a verified public credit source. Required metadata includes affected/fixed versions and at least one named reference. Use source-qualified severity only when verified; omit it otherwise. Use `unknown` or `not published` for genuinely unavailable version details rather than guessing.

`identifier` accepts either an assigned `CVE-YYYY-NNNN` or a public `GHSA-xxxx-xxxx-xxxx`. Before committing, verify the advisory is accessible without authentication and credits forrof, then record that check's date in `verified`. Never add private or embargoed advisories, even as drafts.

For a confirmed, published GHSA without a CVE, omit `cve`; the index and detail page display **Confirmed, published, waiting for CVE**. This wording records the current absence of an assignment, not a guarantee of allocation. Once an assignment is publicly confirmed, add `cve: CVE-YYYY-NNNN` and refresh `verified`. Keep the original GHSA `identifier` unchanged: the existing URL remains stable while the detail facts and status update. Records whose original `identifier` is already a CVE do not need a separate `cve` field.

Use the advisory's descriptive `title` for page and list headings. GHSA and CVE identifiers belong in the facts panel, not the heading. Use `## Description` for passages from the public GitHub Description, retaining the original wording, lists, and safe code snippets. Keep its section names as H3 subheadings and link the source. Label excerpts and omissions explicitly; never claim an abridged description is a complete copy. Keep attribution as forrof. Do not copy runnable exploit code or step-by-step exploitation instructions.

Article H2 headings use the blue accent and H3 subheadings use the violet token. Preserve language-tagged code fences from the source for non-operational explanations and remediation. Do not insert illustrative examples or rewritten explanations into verbatim passages. Put any editorial clarification, such as conflicting version fields, outside the Description. The verified excerpt snapshots in the site test must be deliberately refreshed after rechecking source changes.

If source fields disagree, preserve the discrepancy in a clear note instead of inventing a corrected version range. Public metadata and status are checked when edited, not refreshed automatically.

The artwork's disclosure counter is calculated from published records on each build: assigned CVEs, advisories still pending a CVE, and the total published. Drafts never contribute. Adding a publicly confirmed `cve` moves that record from pending to assigned after the next publication; no counter values need manual editing.

The advisory automatically appears in the CVE archive only. The main entry index lists entries and writeups, while retaining the shared disclosure counter in its artwork. The template supplies technical-body headings; the page adds references and the optional disclosure timeline.

## GitHub projects

Add one JSON file to `src/content/projects/`, following an existing file. Set `kind` to `original`, `fork`, or `contribution` accurately. `order` controls placement. Descriptions are optional: leave them out when none is verified. Project information is intentionally committed, so the site does not depend on the GitHub API being available when a visitor arrives.

## Radio tracks

Put audio you own or have permission to publish in `public/audio/`. Prefer MP3 for broad playback support. Simple filenames are easiest, but original names with spaces or punctuation are supported: URL-encode the filename in `src` (for example, a space becomes `%20`), not the `/audio/` prefix. Filenames cannot contain slashes, backslashes, control characters, URL suffixes, or begin with a dot.

Then add its title, artist, and public path to `src/data/radio.json`, in playback order:

```json
[
  { "title": "Track title", "artist": "Artist name", "credit": "Album · Remix by Artist name", "artistUrl": "https://example.com/artist", "src": "/audio/track-name.mp3" }
]
```

The playlist contains the 13 uploaded Sevillano tracks from **VHS Mixtape**, in their embedded track-number order (2–14; track 1 was not supplied). Titles, artist, and album credit come from their ID3 metadata. Original filenames and audio bytes are unchanged. The player credits the artist beneath the selected title and in every queue row, with a separate “VHS Mixtape · Remix by Sevillano” line. No official profile URL has been supplied, so none is guessed.

`credit` and `artistUrl` are optional. Use `credit` to identify the album or remix role accurately, and `artistUrl` only for a verified HTTPS artist profile. Without custom credit, the player shows “Music by [artist]”. Credits update with the selected track. Attribution is not a substitute for permission to publish the audio.

The radio appears above the footer on entries, CVEs, and projects; an empty playlist (`[]`) omits it. Adding files alone does not list them; add their metadata too. Missing or empty files and invalid paths fail the build. Never put private audio under `public/`: it is publicly accessible even when unlisted.

The custom controls provide play/pause, seeking, volume, and a track list opened by clicking the title. Audio has no source until the visitor presses Play: no autoplay, background audio fetch, external embeds, or saved playback state. After that opt-in, playback advances through the queue and stops at the last track. Selecting another track while paused does not start it. Internal navigation between entries, CVEs, and projects (including browser Back/Forward) preserves the same radio and audio elements: the selected track, position, volume, and playing/paused state continue. A full reload, closing the tab, or leaving the site stops playback; a fresh page never resumes it automatically. Decorative bars move only during playback and respect the site's motion setting and reduced-motion preference.

## Check and publish

```sh
npm run validate
```

This checks content types, builds all pages, and tests internal links, heading anchors, image integrity, article migration, artwork, and publication metadata. Use `npm run dev` to review your writing locally. Follow the one-time Pages setup in the README before the first deployment. Afterwards, edit locally or through GitHub’s editor and push/commit to `main`; the workflow validates before publishing.
