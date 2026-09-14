# Implementation handoff — 14 September 2026

Implemented the approved design on `codex/redesign`. Public release to `forrof.github.io` was authorized on 14 September 2026. The **Validate and publish** workflow records deployment status for the release commit.

## Included

- Static entry index and individual article URLs, CVE archive/detail template, projects, 404, sitemap, and canonical metadata.
- Original rotating iris/knot and margin artwork, server-rendered fallbacks, remembered pause, reduced-motion handling, and offscreen/background suspension.
- Locally bundled IBM Plex Mono, IBM Plex Sans, and Literata, with their font licenses.
- Both original writeups, all ten original PNGs, and the legacy raw Markdown URLs. Body text and code preserved; article metadata moved into frontmatter and Geometry Dash headings moved from H1 to H2.
- Validated content schemas, writing guide/templates, source-qualified CVE fields, and no public editing endpoint.
- GitHub Actions validation and deployment configuration restricted to `main`, with pinned action revisions. Existing `gh-pages` remains the rollback copy.

## Validation

`npm run validate` checks types, builds the site, and runs 16 tests. Coverage includes the real animation controller, reduced motion, saved pause, internal links/assets/anchors, original image bytes and article code, schemas, and public output boundaries. A separate temporary build verifies draft exclusion and a complete advisory using clearly synthetic fixtures. Caches are project-local, release builds force a fresh content sync, and a regression check confirms that temporary builds cannot alter the production content cache. Removing an advisory is also checked across successive builds.

The current site contains six generated HTML pages and no CVE detail records. Astro prints an expected empty-collection warning for CVEs. Dependency audit reports no known vulnerabilities at implementation time. The local entry, article, projects, and CVE routes returned HTTP 200.

Browser-based responsive/keyboard QA was not performed in this implementation turn. The inline design was reviewed previously; the production page uses its responsive layout rules. Visual review of the actual build is still useful before publication.

## Publication

Publication uses GitHub Actions from `main`, preserving the legacy `gh-pages` branch for rollback. The README documents future publication and rollback. Exact CVE identifiers and public attribution sources are still needed before publishing advisory records.

The old React application, modal renderer, shader background, and Tailwind/CRA configuration were removed from the active branch. They remain recoverable from Git history; original writeup assets were not removed.
