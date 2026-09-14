import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import { parseHTML } from 'linkedom';

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
  const titles = [...homepage.querySelectorAll('.ff-entry h2')].map((heading) => heading.textContent);
  assert.ok(titles.includes('geometryDash') && titles.includes('Free Boost'));
  assert.ok(titles.indexOf('geometryDash') < titles.indexOf('Free Boost'));
  const dates = [...homepage.querySelectorAll('.ff-entry time')].map((time) => time.getAttribute('datetime'));
  assert.deepEqual(dates, [...dates].sort().reverse());
  const cves = documents.get('cves/index.html');
  if (!cves.querySelector('.ff-entry')) assert.match(cves.querySelector('main').textContent, /Advisories will appear here/);
  const projects = documents.get('projects/index.html');
  for (const name of ['FFind', 'DiffSearchVuln', 'Vol2Installer']) assert.ok(projects.querySelector('main').textContent.includes(name));
  assert.equal(documents.get('404.html').querySelector('meta[name="robots"]').content, 'noindex');
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

test('published output contains no source templates or private configuration', () => {
  for (const path of ['src', 'docs', 'tests', '.git', '.env', 'package.json', 'node_modules']) assert.equal(existsSync(new URL(path, dist)), false, path);
  const sitemap = readFileSync(new URL('sitemap-0.xml', dist), 'utf8');
  for (const route of ['https://forrof.github.io/', 'https://forrof.github.io/entries/free-boost/', 'https://forrof.github.io/entries/geometrydash/', 'https://forrof.github.io/cves/', 'https://forrof.github.io/projects/']) assert.ok(sitemap.includes(route), route);
  assert.doesNotMatch(sitemap, /404/);
  const styles = readdirSync(new URL('_astro/', dist)).filter((file) => file.endsWith('.css')).map((file) => readFileSync(new URL(`_astro/${file}`, dist), 'utf8')).join('');
  assert.ok(styles.includes('.woff2'));
  assert.doesNotMatch(styles, /fonts\.googleapis|fonts\.gstatic/);
});
