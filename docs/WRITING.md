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

## Drafts and privacy

Set `draft: true` to exclude a record from all generated pages and indexes, including the local site. Set it to `false` when ready to preview the finished page locally. Then run `npm run validate` before publishing.

**A draft flag does not make source private.** This is a public repository. Never commit private research, embargoed findings, tokens, or confidential images. Keep those in a separate private directory/repository. Everything in `public/` is copied to the public site, even if no page links to it. Underscore-prefixed content filenames are also excluded by the loader, not made private.

## Credited CVEs and public advisories

Copy `docs/templates/cve.md` into `src/content/cves/` and replace every placeholder. The route comes from `identifier`, such as `/cves/<lowercase-identifier>/`. Do not create a record without a verified public credit source. Required metadata includes affected/fixed versions and at least one named reference. Use source-qualified severity only when verified; omit it otherwise. Use `unknown` or `not published` for genuinely unavailable version details rather than guessing.

`identifier` accepts either an assigned `CVE-YYYY-NNNN` or a public `GHSA-xxxx-xxxx-xxxx`. Before committing, verify the advisory is accessible without authentication and credits forrof, then record that check's date in `verified`. Never add private or embargoed advisories, even as drafts.

For a confirmed, published GHSA without a CVE, omit `cve`; the index and detail page display **Confirmed, published, waiting for CVE**. This wording records the current absence of an assignment, not a guarantee of allocation. Once an assignment is publicly confirmed, add `cve: CVE-YYYY-NNNN` and refresh `verified`. Keep the original GHSA `identifier` unchanged: the existing URL remains stable while the detail facts and status update. Records whose original `identifier` is already a CVE do not need a separate `cve` field.

Use the advisory's descriptive `title` for page and list headings. GHSA and CVE identifiers belong in the facts panel, not the heading. Add the sourced overview, affected configuration, impact and limitations, and remediation in the Markdown body; retain the public advisory link for attribution. Do not copy runnable exploit code or step-by-step exploitation instructions into these summaries.

Put `### Technical details` beneath `## Overview` for the non-operational root-cause explanation. Article H2 headings use the blue accent and H3 subheadings use the violet token. Defensive code belongs under remediation or workarounds, with a language-tagged fence and clear attribution: distinguish a source-provided patch fragment from an illustrative hardening example, and state important limitations.

If source fields disagree, preserve the discrepancy in a clear note instead of inventing a corrected version range. Public metadata and status are checked when edited, not refreshed automatically.

The artwork's disclosure counter is calculated from published records on each build: assigned CVEs, advisories still pending a CVE, and the total published. Drafts never contribute. Adding a publicly confirmed `cve` moves that record from pending to assigned after the next publication; no counter values need manual editing.

The advisory automatically appears in both the CVE archive and the main entry index. The template supplies technical-body headings; the page adds references and the optional disclosure timeline.

## GitHub projects

Add one JSON file to `src/content/projects/`, following an existing file. Set `kind` to `original`, `fork`, or `contribution` accurately. `order` controls placement. Descriptions are optional: leave them out when none is verified. Project information is intentionally committed, so the site does not depend on the GitHub API being available when a visitor arrives.

## Check and publish

```sh
npm run validate
```

This checks content types, builds all pages, and tests internal links, heading anchors, image integrity, article migration, artwork, and publication metadata. Use `npm run dev` to review your writing locally. Follow the one-time Pages setup in the README before the first deployment. Afterwards, edit locally or through GitHub’s editor and push/commit to `main`; the workflow validates before publishing.
