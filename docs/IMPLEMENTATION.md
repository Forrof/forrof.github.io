# Implementation handoff — updated 20 September 2026

Implemented the approved design on `codex/redesign`. Public release to `forrof.github.io` was authorized on 14 September 2026. The **Validate and publish** workflow records deployment status for the release commit.

## Included

- Static entry index and individual article URLs, separate CVE archive/detail template, projects, 404, sitemap, and canonical metadata. The entry index contains only entries and writeups; advisories remain exclusively in the CVE archive.
- Original rotating iris/knot and margin artwork, server-rendered fallbacks, remembered pause, reduced-motion handling, and offscreen/background suspension.
- A monospace disclosure counter sits between the two masthead artworks on wide layouts and beneath them on narrow layouts. Counts are derived from public records, exclude drafts, and remain readable without JavaScript; decorative art stays hidden from assistive technology while the counts are accessible.
- Locally bundled IBM Plex Mono, IBM Plex Sans, and Literata, with their font licenses.
- CVE articles use IBM Plex Mono for titles, descriptions, tables, and references, with real bold/italic faces, responsive titles, and 17px body text at the default browser size with generous line spacing. Regular blog posts retain Literata; artwork and archive typography are unchanged.
- Both original writeups, all ten original PNGs, and the legacy raw Markdown URLs are preserved. The two writeups are removed from the Entries list with `showInIndex: false`; their article URLs remain public, and new posts are listed by default. Body text and code preserved; article metadata moved into frontmatter and Geometry Dash headings moved from H1 to H2.
- “Is freezing RAM a thing?????” is published from the supplied Frozono draft with both original images, tables, equations, and footnotes. Import changes are limited to title metadata, public image paths/dimensions, and readable disclaimer labels. Math is rendered at build time with KaTeX and MathML; no external font service or client-side math runtime is required.
- Validated content schemas, writing guide/templates, source-qualified CVE fields, and no public editing endpoint.
- Advisory pages include selected verbatim passages from the public GitHub Description, with linked attribution and an explicit omission notice. Non-operational source explanations and remediation snippets retain their wording; generated summaries and illustrative examples have been removed. Section headings use blue and subheadings violet, with tested text contrast and print colors.
- GitHub Actions validation and deployment configuration restricted to `main`, with pinned action revisions. Existing `gh-pages` remains the rollback copy.

## Validation

`npm run validate` checks types, builds the site, and runs the test suite. Coverage includes the real animation controller, reduced motion, saved pause, internal links/assets/anchors, original image bytes and article code, schemas, and public output boundaries. A separate temporary build verifies draft exclusion and complete advisories using clearly synthetic fixtures, including a GHSA transitioning from unassigned to an assigned CVE without changing its URL. Caches are project-local, release builds force a fresh content sync, and a regression check confirms that temporary builds cannot alter the production content cache. Removing the last advisory is also checked across successive builds.

The site now includes eight public GHSA records, alongside three article pages, bringing the total to fifteen generated HTML pages. On 20 September 2026, the public SeaweedFS advisory GHSA-3j72-rgq3-c2j7 was verified without authentication, with published state and reporter credit for forrof. It has no assigned CVE or specified patched release. Its selected non-operational passages were compared verbatim with the public Description; exploit and reproduction details remain omitted.

NIST NVD's public API confirmed four vm2 assignments through explicit repository-advisory references: CVE-2026-92938 → GHSA-6w8r-xxw2-g3hx, CVE-2026-92939 → GHSA-46pr-c5wc-xffx, CVE-2026-92940 → GHSA-h85j-hv3c-qfgq, and CVE-2026-92941 → GHSA-98xx-8mx4-x7cm. All four NVD records were published on 17 September 2026. The GitHub repository advisory CVE fields were still empty on verification, so NVD references establish these assignments. NVD's deferred enrichment status is separate from CVE assignment. The site now counts four assigned, four pending, and eight published disclosures automatically.

Each record retains its descriptive title and stable GHSA URL, linked credit, reported affected/fixed versions, and source-qualified severity. CVE identifiers link to NVD from both archive rows and detail facts. Existing Description passages and their snapshot checks remain unchanged. The conflicting versions and severity assessments in the goshs advisory are explicitly distinguished; OAuth limitations and workarounds remain intact. No private advisories or exploit reproductions were added.

Browser-based responsive/keyboard QA was not performed in this implementation turn. The inline design was reviewed previously; the production page uses its responsive layout rules. Visual review of the actual build is still useful before publication.

## Publication

Publication uses GitHub Actions from `main`, preserving the legacy `gh-pages` branch for rollback. The README documents future publication and rollback. Public GHSAs without CVEs display “Confirmed, published, waiting for CVE”; later assignments can be added without changing their descriptive titles or public URLs. Assigned CVEs appear as NVD links in archive rows and detail facts. Status is verified at editing time, not updated automatically.

The old React application, modal renderer, shader background, and Tailwind/CRA configuration were removed from the active branch. They remain recoverable from Git history; original writeup assets were not removed.
