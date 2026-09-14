# forrof — redesign plan

Status: approved design implemented on `codex/redesign`, 14 September 2026. Publication to GitHub Pages was authorized the same day; the release workflow records the deployment status.

## Confirmed direction

- Site: https://forrof.github.io; source: https://github.com/Forrof/forrof.github.io.
- Public identity: `forrof`, always lowercase. No full name, biography, About page, professional introduction, profile photograph, hobbies, garage, or personal positioning statement.
- Purpose: publish technical entries, CTF writeups, credited CVEs, and selected GitHub projects.
- Only forrof authors and publishes content. Readers browse public content; there are no reader accounts or public submission forms.
- English is the working assumption, based on existing content and this conversation. Language was not explicitly confirmed; this does not require a translation system now.
- The user delegated technical decisions and approved implementation of the final character-art design.

## Reference interpretation

- https://secret.club/2020/05/26/introduction-to-uefi-part-1.html: primary article reference. Adopt the uninterrupted reading column, serif prose, separate monospace metadata, heading anchors, inline code, figures, and modest navigation. Omit author portraits and biographies.
- https://tmpout.sh/5/: primary atmosphere reference. Adopt the dark surface, restrained blue accent, compact index, fine rules, and text-oriented identity. Moderate the dense ASCII framing and pixel typography for mobile and long reading.
- https://fuzzysecurity.com/: secondary reference for a browsable technical archive and clearly separated content categories.
- Borrow principles rather than copying logos, artwork, article text, or page code.

## Navigation and reading flow

The header contains `forrof`, `entries`, `cves`, `projects`, and an external `github` link. The wordmark returns to the entry index.

| Destination | Content and behavior |
| --- | --- |
| `/` | All published entries, newest first, with title, short summary, publication date, type and tags. Starts with the archive immediately. |
| `/entries/<slug>/` | A complete article or CTF writeup, with a stable URL and linked headings. |
| `/cves/` | Credited public disclosures, with identifier, affected product, concise issue description, publication date, and linked detail. |
| `/cves/<cve-id>/` | Advisory: verified credit, affected/fixed versions, technical explanation, source-qualified severity when known, references, and disclosure timeline. |
| `/projects/` | Curated GitHub repositories with useful summaries and repository links. |
| `/projects/<slug>/` | Optional project explanation when there is enough original content to justify a page. Simple repository entries link directly to GitHub. |

CTF writeups belong to the entry collection and carry a `writeup` type plus platform, category, and difficulty metadata. They do not require another top-level archive at launch. CVE advisories may appear as linked items in the entry index, generated from their canonical CVE records rather than duplicated text. Default homepage sorting uses original publication dates.

## Visual system

- Default palette: dark neutral background `#111315`, foreground `#e6e7e9`, secondary text `#a1a7ae`, fine borders `#34393e`, restrained blue accent `#9eb9f2`.
- Typography revision: IBM Plex Mono for navigation, index titles, dates and code; Literata for article headings and prose. The draft also offers IBM Plex Sans for a more technical feel and Charter for comparison with the previous draft. Self-host the selected fonts in the production site.
- Main prose: approximately 18px, 1.8 line height, 65–75 characters per line. Regular navigation at least 14px. Typography uses rem units.
- Current art revision: the user approved the character-art direction, additional motion and lateral artwork, but rejected the kanji and binary-number decorations. Replace those with an original slowly rotating radial ASCII iris and layered geometric character drawings. Retain lowercase `forrof` as the site's only public name; no substitute language or numeric slogans.
- Pair the iris with the original rotating ASCII knot. Fill both lateral margins with woven character patterns, linked diamonds, interlocking geometric forms and small radial ornaments, with restrained pointer response in the masthead. The article text stays static, and margin art is dimmer during reading. Narrow screens retain a compact iris/knot composition and omit the vertical rails so they do not squeeze the text.
- Entry rows use whitespace, small index numbers, thin rules and occasional dotted leaders.
- Simple rectangular surfaces, little or no rounding, no large shadows or statistics dashboards.
- Motion is explicitly requested. Update character geometry at a restrained frame rate, keep frame dimensions stable, stop updates when the document or art is not visible, honor reduced-motion preferences, and provide an always-available pause/play control. Avoid flashes, moving article text, automatic typewriter copy and fake terminal sequences.
- Article content uses the full normal document flow; it never opens inside a modal. Code wraps or scrolls within its own block as appropriate. Screenshots retain readable dimensions and captions.
- On narrow screens, dates and tags wrap beneath titles, navigation wraps cleanly and wide figures/code stay inside the viewport.
- Keyboard focus, sufficient contrast and reduced-motion preferences are part of the implementation.

The approved conversation draft has been translated into the implementation with complete original writeups. The empty CVE view reflects the lack of provided records; it is not a claim about the number of CVEs credited to forrof.

## Content and publishing

Use Astro with TypeScript and validated Markdown content collections. React is unnecessary for the initial reading experience; use small client-side enhancements only where they serve an actual interaction. Preserve npm and maintain the lockfile during the framework migration.

Store technical entries, CVEs and project descriptions separately from layout code. Plain Markdown is the default; introduce MDX only if a real article needs an embedded component.

Shared entry fields: title, stable slug, summary, publication date, optional updated date, tags, and type. Writeups add platform, category, and difficulty. CVEs add identifier, product, public credit source, affected/fixed versions, references, and timeline; optional severity includes its published source and scoring version.

forrof writes locally or through GitHub's file editor, using templates. Only the public-ready source goes into the public repository. A draft flag controls rendering but is not privacy: unpublished research stays outside public Git history and deploy output. No public CMS, editor route, database, or write API is needed for the proposed workflow.

GitHub remains the source of truth. Normal publishing is: edit content, preview, commit and push, automated validation/build, GitHub Pages deployment. A pull request may be used to review larger changes, but public branches are not private drafts.

Curate an explicit list of public repositories. Fetch optional repository metadata during the build, using committed descriptive fallbacks so an unavailable API does not make the public projects page blank. Clearly distinguish original projects from upstream forks/contributions. Never include account credentials in client code.

GitHub Pages is the intended production host. Keep static output portable; choose a single public canonical origin. Do not replace the production origin with an unrelated hosting service by default.

## Migration and implementation sequence

1. Create an isolated `codex/redesign` branch from current main when implementation begins. Preserve original history, existing images and Markdown asset URLs.
2. Replace the current Create React App build with the static content foundation. Introduce validated content schemas, shared metadata, true page routes and article rendering.
3. Build the smallest recognizable entry index and one article template using real migrated content, then show a local preview.
4. Complete the CVE archive/detail schema and curated project archive. Remove the garage, introduction/about concepts, statistics charts and animated background from the proposed replacement.
5. Migrate Free Boost and geometryDash, retaining original publication dates and screenshots. Check link targets and heading structure. Keep the user's original writing unless rewriting is separately requested.
6. Populate CVEs only after exact identifiers and public attribution sources are available. Verify product/version and severity fields against those sources; do not guess records or credentials.
7. Add per-page titles/descriptions, canonical URLs, sitemap and a useful 404 page. Search, comments, analytics, newsletters, subscriptions and a CMS are outside launch scope unless requested later.
8. Validate the production build, content metadata, deep links, direct page refreshes, existing image URLs and absence of unpublished material in output. Include responsive and keyboard review in the final acceptance plan.
9. At publication, replace the legacy `gh-pages` build-output workflow with a GitHub Actions static deployment. Retain the previous published revision for rollback.

## Acceptance criteria

- Only `forrof` appears as the site's identity; no About, introduction or hobbies remain.
- The homepage displays entries without opening or expanding a category first.
- Every full entry has a shareable address and remains readable with JavaScript disabled.
- Adding an entry requires a content file and optional images, without modifying components.
- CVE credits and official facts have reference links and match their sources.
- No public visitor can submit or edit published content through the website.
- The two existing writeups and their images survive the migration.
- Projects are intentionally selected and stay readable when GitHub metadata is unavailable.
- Layout works on small screens and with enlarged text; navigation works with a keyboard.
- The final reviewed site publishes to https://forrof.github.io.

## Remaining content input

Exact CVE identifiers and public accreditation/advisory links are needed before populating CVE records. This does not block implementation of the content model or page design.

## Technical references

- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Astro GitHub Pages deployment: https://docs.astro.build/en/guides/deploy/github/
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
