import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import { parseHTML } from 'linkedom';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
const root = new URL('../', import.meta.url);
const files = readdirSync(dist, { recursive: true }).filter((name) => name.endsWith('.html'));
const documents = new Map(files.map((file) => [file, parseHTML(readFileSync(new URL(file, dist), 'utf8')).document]));
const homepage = documents.get('index.html');

test('all public routes render complete HTML without relying on JavaScript', () => {
  for (const file of ['index.html', 'cves/index.html', 'projects/index.html', 'entries/free-boost/index.html', 'entries/geometrydash/index.html', '404.html']) assert.ok(documents.has(file), file);
  for (const [file, doc] of documents) {
    assert.equal(doc.documentElement.lang, 'en', file);
    assert.equal(doc.querySelectorAll('main').length, 1, file);
    assert.equal(doc.querySelectorAll('h1').length, 1, file);
    assert.ok(doc.querySelector('title').textContent.includes('forrof'), file);
    assert.ok(doc.querySelector('meta[name="description"]').content, file);
    assert.ok(doc.querySelector('link[rel="canonical"]').href.startsWith('https://forrof.github.io/'), file);
    assert.equal(doc.querySelectorAll('nav[aria-label="Main navigation"] a[aria-current="page"]').length, 1, file);
    assert.ok(doc.querySelector('a[href="#main"]'), file);
    assert.equal(doc.querySelectorAll('form, [contenteditable], astro-island').length, 0, file);
    const ids = [...doc.querySelectorAll('[id]')].map((element) => element.id);
    assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
  }
  const cves = documents.get('cves/index.html');
  if (!cves.querySelector('.ff-entry')) assert.match(cves.querySelector('main').textContent, /Advisories will appear here/);
  const projects = documents.get('projects/index.html');
  for (const name of ['FFind', 'DiffSearchVuln', 'Vol2Installer']) assert.ok(projects.querySelector('main').textContent.includes(name));
  assert.equal(documents.get('404.html').querySelector('meta[name="robots"]').content, 'noindex');
});

test('the entries page lists the new article while keeping removed posts and CVEs out', () => {
  const links = [...homepage.querySelectorAll('.ff-entry h2 a')];
  assert.deepEqual(links.map((link) => link.getAttribute('href')), ['/entries/is-freezing-ram-a-thing/']);
  assert.equal(links[0].textContent, 'Is freezing RAM a thing?????');
  assert.equal(homepage.querySelector('main .ff-empty'), null);
  for (const id of ['free-boost', 'geometrydash']) {
    assert.equal(homepage.querySelector(`a[href="/entries/${id}/"]`), null);
    assert.ok(documents.get(`entries/${id}/index.html`).querySelector('.ff-prose'));
  }
  assert.equal(homepage.querySelector('main a[href^="/cves/"], main .ff-status'), null);
  assert.ok(homepage.querySelector('nav a[href="/cves/"]'));
  assert.ok(homepage.querySelector('.ff-disclosure-counter'));
});

test('the freezing-RAM entry preserves the updated writing and renders its images, math, and references', () => {
  const id = 'is-freezing-ram-a-thing';
  const document = documents.get(`entries/${id}/index.html`);
  assert.ok(document);
  assert.equal(document.querySelector('h1').textContent, 'Is freezing RAM a thing?????');
  assert.equal(document.querySelector('.ff-byline time').getAttribute('datetime'), '2026-09-15');
  const markdown = readFileSync(new URL(`src/content/entries/${id}.md`, root), 'utf8').split('---\n').slice(2).join('---\n').trim();
  // Author text is unchanged apart from title metadata, image/caption markup, and disclaimer labels.
  assert.equal(createHash('sha256').update(markdown).digest('hex'), '8bfb90b841e5230ffaa94d6de074fb9389bb3bd9b54327d74db6b9f6ac60c320');
  assert.equal(document.querySelector('.ff-image-caption').textContent, '^|me fr');
  assert.ok(document.querySelector('.ff-prose').textContent.includes('Photos of the real experiment (Obviously not real):'));
  const expectedMath = [...markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g)].map((match) => (match[1] ?? match[2]).trim());
  const renderedMath = [...document.querySelectorAll('.katex annotation[encoding="application/x-tex"]')].map((element) => element.textContent.trim());
  assert.deepEqual(renderedMath, expectedMath);
  assert.equal(document.querySelectorAll('.katex-display').length, 4);
  assert.equal(document.querySelector('.katex-error, .ff-prose script'), null);
  assert.equal(document.querySelectorAll('.ff-prose table').length, 3);
  assert.equal(document.querySelectorAll('[data-footnotes] ol > li').length, 6);
  assert.ok(document.getElementById('8-but-modern-memory-encryption-changes-the-game'));
  assert.ok(document.querySelector('a[href="https://ro.ecu.edu.au/adf/162/"]'));
  const images = [
    ['FrozonoHacker.png', 1254, 1254, '388cfa3b6c46eea3784b80246a63099cf86ff3dc2c9a1f5b4ed56f46e580bf03'],
    ['BrainBoom.jpg', 1000, 562, '3278b5f3cb9409b0fd6b04c0eaaca8ac25b39f485ad04745adcc11d007bde35b'],
    ['capa.jpg', 550, 481, '8f9fee62791fd4cf49b9521044983c6e86ae51d5cd3c0790787300a899c14fcc'],
    ['Luigui.jpg', 800, 774, '766b4adaf372ae3c8dc752c6efb03621f1c35fa00f22452143db7c4bfe226e4c'],
    ['CoolRam.jpg', 750, 751, '95d6072f628792e39fad6f7dbc53180374fd2940bf6c87ff6f38b035c1115269'],
    ['fancoool.png', 1448, 1086, '18accd2c4c43e072fc9e8602b96ea92cbec4563ce0e0ba4e99f2eea23610aa86'],
  ];
  assert.deepEqual([...document.querySelectorAll('.ff-prose img')].map((image) => image.getAttribute('src')), images.map(([name]) => `/images/${id}/${name}`));
  for (const [name, width, height, digest] of images) {
    const path = `images/${id}/${name}`;
    const image = document.querySelector(`.ff-prose img[src="/${path}"]`);
    assert.equal(Number(image.getAttribute('width')), width);
    assert.equal(Number(image.getAttribute('height')), height);
    assert.equal(image.getAttribute('loading'), 'lazy');
    assert.equal(image.getAttribute('decoding'), 'async');
    assert.equal(image.parentElement.getAttribute('href'), `/${path}`);
    assert.equal(createHash('sha256').update(readFileSync(new URL(`public/${path}`, root))).digest('hex'), digest);
    assert.deepEqual(readFileSync(new URL(path, dist)), readFileSync(new URL(`public/${path}`, root)));
  }
  assert.ok(readFileSync(new URL('sitemap-0.xml', dist), 'utf8').includes(`https://forrof.github.io/entries/${id}/`));
});

test('every internal page, asset, and heading link resolves in the build', () => {
  for (const [file, doc] of documents) {
    const base = new URL(file === 'index.html' ? '/' : file.replace(/index\.html$/, ''), 'https://forrof.github.io/');
    for (const element of doc.querySelectorAll('[href], [src]')) {
      const value = element.getAttribute('href') ?? element.getAttribute('src');
      const url = new URL(value, base);
      if (url.origin !== base.origin) continue;
      const path = decodeURIComponent(url.pathname).replace(/^\//, '');
      let target = new URL(path || 'index.html', dist);
      if (existsSync(target) && statSync(target).isDirectory()) target = new URL('index.html', target.href.endsWith('/') ? target : `${target.href}/`);
      assert.ok(existsSync(target), `${file}: missing ${value}`);
      if (url.hash && target.pathname.endsWith('.html')) {
        const targetFile = relative(dist.pathname, target.pathname);
        assert.ok(documents.get(targetFile)?.getElementById(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor ${value}`);
      }
    }
  }
});

test('all original evidence images and raw Markdown remain byte-identical', () => {
  const assets = readdirSync(new URL('public/writeups/', root), { recursive: true });
  let images = 0;
  for (const asset of assets) {
    const source = new URL(`public/writeups/${asset}`, root);
    if (!statSync(source).isFile()) continue;
    assert.deepEqual(readFileSync(new URL(`writeups/${asset}`, dist)), readFileSync(source), asset);
    if (asset.endsWith('.png')) images++;
  }
  assert.ok(images >= 10);
  for (const name of ['free-boost', 'geometrydash']) {
    const doc = documents.get(`entries/${name}/index.html`);
    assert.ok(doc.querySelectorAll('.ff-prose img').length > 0);
    for (const image of doc.querySelectorAll('.ff-prose img')) {
      assert.ok(Number(image.getAttribute('width')) > 0);
      assert.ok(Number(image.getAttribute('height')) > 0);
      assert.equal(image.getAttribute('loading'), 'lazy');
      assert.equal(image.parentElement.getAttribute('href'), image.getAttribute('src'));
    }
    for (const heading of doc.querySelectorAll('.ff-prose h2, .ff-prose h3')) assert.equal(heading.querySelector('a').getAttribute('href'), `#${heading.id}`);
    assert.equal(doc.querySelectorAll('.ff-masthead').length, 0);
  }
});

test('migration preserves the original writing and code, apart from moved metadata and heading levels', () => {
  const boost = readFileSync(new URL('public/writeups/htb-free-boost.md', root), 'utf8');
  const migratedBoost = readFileSync(new URL('src/content/entries/free-boost.md', root), 'utf8').split('---\n').slice(2).join('---\n').trim();
  assert.equal(migratedBoost, boost.slice(boost.indexOf('## Challenge Description')).trim());
  const geometry = readFileSync(new URL('public/writeups/geometrydash.md', root), 'utf8');
  const migratedGeometry = readFileSync(new URL('src/content/entries/geometrydash.md', root), 'utf8').split('---\n').slice(2).join('---\n').trim();
  assert.equal(migratedGeometry, geometry.replace(/^# /gm, '## ').trim());
  const doc = documents.get('entries/free-boost/index.html');
  const originalCode = [...boost.matchAll(/```powershell\n([\s\S]*?)```/g)].map((match) => match[1].trim());
  const renderedCode = [...doc.querySelectorAll('.ff-prose pre code')].map((block) => block.textContent.trim());
  assert.deepEqual(renderedCode, originalCode);
});

test('approved artwork is server-rendered, decorative, and contains no rejected symbols', () => {
  for (const [selector, rows, columns] of [['[data-iris]', 25, 57], ['[data-knot]', 24, 56]]) {
    const art = homepage.querySelector(selector);
    const lines = art.textContent.split('\n');
    assert.equal(lines.length, rows);
    assert.ok(lines.every((line) => line.length === columns));
    assert.ok(art.closest('[aria-hidden="true"]'));
  }
  for (const doc of documents.values()) {
    for (const art of doc.querySelectorAll('.ff-ascii')) assert.doesNotMatch(art.textContent, /[01\u4e00-\u9fff]/);
    assert.equal(doc.querySelector('[data-motion-toggle]').hidden, true);
  }
});

test('artwork counters are accessible, server-rendered, and match the public archive', () => {
  const rows = [...documents.get('cves/index.html').querySelectorAll('.ff-entry')];
  const assigned = rows.filter((row) => row.querySelector('.ff-status').textContent.endsWith('CVE assigned')).length;
  const expected = { assigned, pending: rows.length - assigned, published: rows.length };
  for (const [file, document] of documents) {
    const masthead = document.querySelector('.ff-masthead');
    if (!masthead) {
      assert.equal(document.querySelector('.ff-disclosure-counter'), null, `${file}: reading pages stay uncluttered`);
      continue;
    }
    const counter = masthead.querySelector('.ff-disclosure-counter');
    assert.ok(counter, file);
    assert.equal(counter.getAttribute('role'), 'group');
    assert.equal(counter.getAttribute('aria-label'), 'Public disclosure counts');
    assert.equal(counter.closest('[aria-hidden="true"], [hidden]'), null, `${file}: counts must not be decorative`);
    assert.deepEqual([...counter.querySelectorAll('dt')].map((term) => term.textContent), ['CVEs assigned', 'pending CVE']);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(counter.querySelector(`[data-count="${key}"]`).textContent, String(value).padStart(2, '0'), `${file}: ${key}`);
    }
    for (const art of masthead.querySelectorAll('.ff-ascii, .ff-masthead-foot')) assert.equal(art.getAttribute('aria-hidden'), 'true');
  }
});

test('published output contains no source templates or private configuration', () => {
  for (const path of ['src', 'docs', 'tests', '.git', '.env', 'package.json', 'node_modules']) assert.equal(existsSync(new URL(path, dist)), false, path);
  const sitemap = readFileSync(new URL('sitemap-0.xml', dist), 'utf8');
  for (const route of ['https://forrof.github.io/', 'https://forrof.github.io/entries/free-boost/', 'https://forrof.github.io/entries/geometrydash/', 'https://forrof.github.io/cves/', 'https://forrof.github.io/projects/']) assert.ok(sitemap.includes(route), route);
  assert.doesNotMatch(sitemap, /404/);
  const styles = readdirSync(new URL('_astro/', dist)).filter((file) => file.endsWith('.css')).map((file) => readFileSync(new URL(`_astro/${file}`, dist), 'utf8')).join('');
  assert.ok(styles.includes('.woff2'));
  assert.doesNotMatch(styles, /fonts\.googleapis|fonts\.gstatic/);
});

test('the seven verified public advisories have credited details and visible CVE status', () => {
  const verified = [
    ['goshs-labs/goshs', 'GHSA-2q29-798w-6qcp'],
    ['patriksimek/vm2', 'GHSA-98xx-8mx4-x7cm'],
    ['patriksimek/vm2', 'GHSA-h85j-hv3c-qfgq'],
    ['patriksimek/vm2', 'GHSA-46pr-c5wc-xffx'],
    ['patriksimek/vm2', 'GHSA-6w8r-xxw2-g3hx'],
    ['doobidoo/mcp-memory-service', 'GHSA-5p27-64mv-pr73'],
    ['flytohub/flyto-core', 'GHSA-wmwj-g59x-c8px'],
  ];
  const sitemap = readFileSync(new URL('sitemap-0.xml', dist), 'utf8');
  for (const [repository, identifier] of verified) {
    const route = `/cves/${identifier.toLowerCase()}/`;
    const detail = documents.get(`${route.slice(1)}index.html`);
    assert.ok(detail, identifier);
    const source = `https://github.com/${repository}/security/advisories/${identifier}`;
    assert.ok(detail.querySelector(`.ff-facts a[href="${source}"]`), identifier);
    assert.ok(detail.querySelector(`.ff-reference-list a[href="${source}"]`), identifier);
    assert.ok(detail.querySelector('.ff-byline').textContent.includes('forrof'), identifier);
    assert.ok(detail.querySelector('.ff-facts time'), identifier);
    const title = detail.querySelector('h1').textContent;
    assert.doesNotMatch(title, /GHSA-|CVE-\d/);
    assert.ok(detail.querySelector('title').textContent.startsWith(title));
    assert.doesNotMatch(detail.querySelector('title').textContent, /GHSA-/);
    for (const heading of ['description', 'impact']) assert.ok(detail.getElementById(heading), `${identifier}: ${heading}`);
    const sections = [...detail.querySelectorAll('.ff-prose h2, .ff-prose h3')].map((heading) => heading.id);
    assert.equal(detail.getElementById('description').tagName, 'H2');
    assert.equal(detail.getElementById('impact').tagName, 'H3');
    assert.ok(sections.indexOf('impact') > sections.indexOf('description'));
    assert.ok(detail.querySelector(`.ff-prose blockquote a[href="${source}"]`));
    assert.match(detail.querySelector('.ff-prose blockquote').textContent, /reproduced verbatim.*Exploit and reproduction details are omitted/);
    assert.equal(detail.querySelector('#poc'), null);
    if (repository !== 'doobidoo/mcp-memory-service') {
      assert.equal(detail.getElementById('summary').tagName, 'H3');
      assert.equal(detail.getElementById('details').tagName, 'H3');
    }
    const assigned = [...detail.querySelectorAll('.ff-facts dt')].some((term) => term.textContent === 'CVE');
    const status = assigned ? 'Confirmed, published, CVE assigned' : 'Confirmed, published, waiting for CVE';
    assert.ok(detail.querySelector('.ff-facts').textContent.includes(status), identifier);
    const row = documents.get('cves/index.html').querySelector(`a[href="${route}"]`)?.closest('.ff-entry');
    assert.equal(row?.querySelector('h2')?.textContent, title, `CVE archive: title for ${identifier}`);
    assert.equal(row?.querySelector('.ff-status')?.textContent, `Status: ${status}`, `CVE archive: ${identifier}`);
    assert.equal(homepage.querySelector(`a[href="${route}"]`), null, `Entries exclude ${identifier}`);
    assert.ok(sitemap.includes(`https://forrof.github.io${route}`), identifier);
  }
  assert.ok(documents.get('cves/ghsa-2q29-798w-6qcp/index.html').querySelector('#version-note'));
  assert.ok(documents.get('cves/ghsa-2q29-798w-6qcp/index.html').querySelector('#severity-note'));
  const oauth = documents.get('cves/ghsa-5p27-64mv-pr73/index.html');
  assert.ok(oauth.querySelector('#workarounds'));
  assert.match(oauth.querySelector('.ff-prose').textContent, /OAuth is off by default/);
  assert.ok(oauth.querySelector('#patches'));
  assert.ok(oauth.querySelector('#precondition-and-what-it-means-for-severity'));
});

test('source explanation and remediation snippets render intact as static code', () => {
  for (const file of readdirSync(new URL('src/content/cves/', root)).filter((file) => file.endsWith('.md'))) {
    const source = readFileSync(new URL(`src/content/cves/${file}`, root), 'utf8');
    const expected = [...source.matchAll(/```\w+\n([\s\S]*?)```/g)].map((match) => match[1].trim());
    const document = documents.get(`cves/${file.replace('.md', '')}/index.html`);
    const actual = [...document.querySelectorAll('.ff-prose pre code')].map((block) => block.textContent.trim());
    assert.deepEqual(actual, expected, file);
    assert.equal(document.querySelector('.ff-prose script'), null, file);
    assert.equal(document.querySelector('#defensive-configuration-example'), null, 'No added examples presented as source text');
  }
  const flyto = documents.get('cves/ghsa-wmwj-g59x-c8px/index.html');
  assert.ok(flyto.getElementById('suggested-remediation'));
  assert.equal(flyto.querySelector('.ff-prose pre code').textContent.trim(), 'return await instance.run()');
});


test('approved verbatim Description excerpts retain their verified wording', () => {
  // Checked against the public repository advisory API on 2026-09-15.
  // These snapshots cover selected safe passages, not the omitted full descriptions.
  const verified = [
    [
      "ghsa-2q29-798w-6qcp",
      "2e87dbfddaabbe11d3137619d195ef1bef491132e8f41aab193b943f0d1ae20d"
    ],
    [
      "ghsa-46pr-c5wc-xffx",
      "93cd574241fd57e7e514a4b33497dcad600ba8473d3d8695099dbf13232f428a"
    ],
    [
      "ghsa-5p27-64mv-pr73",
      "93898fbd88196540ead08a77f506c6feb58fc6c4032832d5474da2fe59f24a68"
    ],
    [
      "ghsa-6w8r-xxw2-g3hx",
      "4f25b42729463a3ffde8afa3572b31af2c083cccf5fb3f731c7e4555320bc410"
    ],
    [
      "ghsa-98xx-8mx4-x7cm",
      "793ec8485eb22a4ae65ab7bbcaf3bb86aa53dbb8307668de822835e4f4a95633"
    ],
    [
      "ghsa-h85j-hv3c-qfgq",
      "e03154e54493446bb2f1f72bd67a7949b3469233a0893e65ff41010072bb2396"
    ],
    [
      "ghsa-wmwj-g59x-c8px",
      "271c9f3fe94bdc8ebeba134cc695f30b9b2a681cb9f6287b362d5601e2155d74"
    ]
  ];
  for (const [id, digest] of verified) {
    const markdown = readFileSync(new URL('src/content/cves/' + id + '.md', root), 'utf8');
    const description = markdown.slice(markdown.indexOf('## Description')).split('\n## Version note')[0].trim();
    assert.equal(createHash('sha256').update(description).digest('hex'), digest, id);
  }
});

test('CVE typography uses the archive monospace without changing regular blog posts', () => {
  for (const [file, document] of documents) {
    assert.equal(Boolean(document.querySelector('article.ff-advisory')), /^cves\/[^/]+\/index\.html$/.test(file), file);
  }
  const css = readFileSync(new URL('src/styles/site.css', root), 'utf8');
  assert.match(css, /--ff-reading:\s*"Literata Variable"/);
  assert.match(css, /\.site \.ff-advisory\s*\{\s*--ff-reading:\s*var\(--ff-mono\)/);
  assert.match(css, /\.site \.ff-advisory \.ff-prose\s*\{[^}]*font-size:\s*1\.0625rem;\s*line-height:\s*1\.85/);
  assert.match(css, /\.site \.ff-advisory h1\s*\{[^}]*font-size:\s*clamp\(1\.5rem, 3cqw, 2rem\)/);
  for (const face of ['400-italic', '700', '700-italic']) assert.ok(css.includes(`@fontsource/ibm-plex-mono/latin-${face}.css`));
  let bundledFonts = 0;
  for (const filename of readdirSync(new URL('_astro/', dist)).filter((file) => file.endsWith('.css'))) {
    const stylesheet = new URL(`_astro/${filename}`, dist);
    for (const match of readFileSync(stylesheet, 'utf8').matchAll(/url\(([^)]+\.woff2)\)/g)) {
      const font = match[1].startsWith('/') ? new URL(match[1].slice(1), dist) : new URL(match[1], stylesheet);
      assert.ok(existsSync(font), `${filename}: font ${match[1]}`);
      assert.equal(readFileSync(font).subarray(0, 4).toString(), 'wOF2');
      bundledFonts++;
    }
  }
  assert.ok(bundledFonts > 0, 'Font asset checks must run against the build');
});

test('article section colors remain distinct and readable on the dark background', () => {
  const css = readFileSync(new URL('src/styles/site.css', root), 'utf8');
  const token = (name) => css.match(new RegExp(`--ff-${name}:\\s*(#[a-fA-F0-9]{6})`))[1];
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const background = luminance(token('bg'));
  for (const name of ['accent', 'subheading']) assert.ok((luminance(token(name)) + .05) / (background + .05) >= 4.5, name);
  assert.notEqual(token('accent'), token('subheading'));
  assert.match(css, /\.ff-prose h2\s*\{[^}]*color:\s*var\(--ff-accent\)/);
  assert.match(css, /\.ff-prose h3\s*\{[^}]*color:\s*var\(--ff-subheading\)/);
});
