# Implementation handoff — updated 15 September 2026

Implemented the approved design on `codex/redesign`. Public release to `forrof.github.io` was authorized on 14 September 2026. The **Validate and publish** workflow records deployment status for the release commit.

## Included

- Static entry index and individual article URLs, separate CVE archive/detail template, projects, 404, sitemap, and canonical metadata. The entry index contains only entries and writeups; advisories remain exclusively in the CVE archive.
- Original rotating iris/knot and margin artwork, server-rendered fallbacks, remembered pause, reduced-motion handling, and offscreen/background suspension.
- A monospace disclosure counter sits between the two masthead artworks on wide layouts and beneath them on narrow layouts. Counts are derived from public records, exclude drafts, and remain readable without JavaScript; decorative art stays hidden from assistive technology while the counts are accessible.
- Locally bundled IBM Plex Mono, IBM Plex Sans, and Literata, with their font licenses.
- CVE articles use IBM Plex Mono for titles, descriptions, tables, and references, with real bold/italic faces, responsive titles, and 17px body text at the default browser size with generous line spacing. Regular blog posts retain Literata; artwork and archive typography are unchanged.
- Both original writeups, all ten original PNGs, and the legacy raw Markdown URLs. Body text and code preserved; article metadata moved into frontmatter and Geometry Dash headings moved from H1 to H2.
- Validated content schemas, writing guide/templates, source-qualified CVE fields, and no public editing endpoint.
- Advisory pages include selected verbatim passages from the public GitHub Description, with linked attribution and an explicit omission notice. Non-operational source explanations and remediation snippets retain their wording; generated summaries and illustrative examples have been removed. Section headings use blue and subheadings violet, with tested text contrast and print colors.
- GitHub Actions validation and deployment configuration restricted to `main`, with pinned action revisions. Existing `gh-pages` remains the rollback copy.

## Validation

`npm run validate` checks types, builds the site, and runs the test suite. Coverage includes the real animation controller, reduced motion, saved pause, internal links/assets/anchors, original image bytes and article code, schemas, and public output boundaries. A separate temporary build verifies draft exclusion and complete advisories using clearly synthetic fixtures, including a GHSA transitioning from unassigned to an assigned CVE without changing its URL. Caches are project-local, release builds force a fresh content sync, and a regression check confirms that temporary builds cannot alter the production content cache. Removing the last advisory is also checked across successive builds.

The site now includes seven public GHSA records, bringing the total to thirteen generated HTML pages. On 15 September 2026, all seven repository advisory API endpoints returned HTTP 200 without authentication, with published state, reporter credit for forrof, and no assigned CVE. Each record uses the published advisory's title and includes a verification date, linked source, reported affected/fixed versions, source-qualified severity, and selected original Description passages. Every retained passage was compared with the public source before publication, and offline snapshot checks protect the approved wording. The conflicting versions and severity assessments in the goshs advisory are explicitly distinguished. OAuth default-state limitations and documented workarounds are retained. No private advisories or exploit reproductions were added.

Browser-based responsive/keyboard QA was not performed in this implementation turn. The inline design was reviewed previously; the production page uses its responsive layout rules. Visual review of the actual build is still useful before publication.

## Publication

Publication uses GitHub Actions from `main`, preserving the legacy `gh-pages` branch for rollback. The README documents future publication and rollback. Public GHSAs without CVEs display “Confirmed, published, waiting for CVE”; later assignments can be added without changing their descriptive titles or public URLs. Identifiers remain in the detail facts. Status is verified at editing time, not updated automatically.

The old React application, modal renderer, shader background, and Tailwind/CRA configuration were removed from the active branch. They remain recoverable from Git history; original writeup assets were not removed.
