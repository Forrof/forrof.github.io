import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseHTML } from 'linkedom';

test('a clean build excludes drafts and renders a complete credited advisory from content alone', (context) => {
  const repository = fileURLToPath(new URL('../', import.meta.url));
  const parentCache = join(repository, '.astro/cache');
  function cacheSnapshot() {
    if (!existsSync(parentCache)) return [];
    return readdirSync(parentCache, { recursive: true }).sort().filter((file) => statSync(join(parentCache, file)).isFile()).map((file) => [file, createHash('sha256').update(readFileSync(join(parentCache, file))).digest('hex')]);
  }
  const originalCache = cacheSnapshot();
  const scratch = mkdtempSync(join(tmpdir(), 'forrof-publishing-test-'));
  context.after(() => rmSync(scratch, { recursive: true, force: true }));
  for (const path of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) cpSync(join(repository, path), join(scratch, path), { recursive: true });
  symlinkSync(join(repository, 'node_modules'), join(scratch, 'node_modules'), 'dir');

  // Exercise the configured radio without publishing sample music to the real site.
  const radioTracks = [
    { title: 'First <test> track', artist: 'Fixture artist', src: '/audio/test-first.wav' },
    { title: 'Second test track', artist: 'Fixture artist', src: '/audio/test-second.wav' },
  ];
  writeFileSync(join(scratch, 'src/data/radio.json'), JSON.stringify(radioTracks));
  const silence = Buffer.alloc(124, 128);
  silence.write('RIFF', 0); silence.writeUInt32LE(116, 4); silence.write('WAVEfmt ', 8);
  silence.writeUInt32LE(16, 16); silence.writeUInt16LE(1, 20); silence.writeUInt16LE(1, 22);
  silence.writeUInt32LE(8000, 24); silence.writeUInt32LE(8000, 28); silence.writeUInt16LE(1, 32); silence.writeUInt16LE(8, 34);
  silence.write('data', 36); silence.writeUInt32LE(80, 40);
  for (const track of radioTracks) writeFileSync(join(scratch, 'public', track.src.slice(1)), silence);

  // Isolate the collection so the final rebuild also exercises removing its last record.
  for (const file of readdirSync(join(scratch, 'src/content/cves'))) {
    if (file.endsWith('.md')) unlinkSync(join(scratch, 'src/content/cves', file));
  }
  // Isolate listed entries while retaining the two hidden legacy articles.
  for (const file of readdirSync(join(scratch, 'src/content/entries'))) {
    if (file.endsWith('.md') && !['free-boost.md', 'geometrydash.md'].includes(file)) unlinkSync(join(scratch, 'src/content/entries', file));
  }

  // These clearly synthetic records exist only inside the isolated test directory.
  writeFileSync(join(scratch, 'src/content/entries/test-draft.md'), `---
title: Private draft fixture
summary: Do not publish this test record.
published: "2026-09-14"
draft: true
---
DRAFT_FIXTURE_MUST_NEVER_RENDER
`);
  for (const [id, date] of [['test-older-entry', '2026-09-14'], ['test-newer-entry', '2026-09-15']]) {
    writeFileSync(join(scratch, `src/content/entries/${id}.md`), `---
title: ${id}
summary: Synthetic entry publication test.
published: "${date}"
---
PUBLIC_ENTRY_FIXTURE_BODY
`);
  }
  const advisory = `---
title: Synthetic advisory fixture
summary: Isolated publication test, not a real CVE.
published: "2026-09-14"
identifier: CVE-2099-99999
product: Fixture only
creditSource: https://example.invalid/credit
affected: Test version
fixed: Test fix
references:
  - label: Fixture reference
    url: https://example.invalid/advisory
timeline:
  - date: "2026-09-01"
    event: Fixture report
severity:
  label: Test severity
  system: Test scale
  source: https://example.invalid/severity
---
## Technical explanation

PUBLIC_ADVISORY_FIXTURE_BODY
`;
  writeFileSync(join(scratch, 'src/content/cves/test-public.md'), advisory);
  writeFileSync(join(scratch, 'src/content/cves/test-draft.md'), advisory.replace('CVE-2099-99999', 'CVE-2099-99998').replace('title:', 'draft: true\ntitle:').replace('PUBLIC_ADVISORY_FIXTURE_BODY', 'DRAFT_CVE_MUST_NEVER_RENDER'));
  const pending = advisory.replace('CVE-2099-99999', 'GHSA-2345-6789-cfgh').replace('identifier:', 'verified: "2026-09-15"\nidentifier:');
  writeFileSync(join(scratch, 'src/content/cves/test-pending.md'), pending);
  writeFileSync(join(scratch, 'src/content/cves/test-pending-draft.md'), pending.replace('GHSA-2345-6789-cfgh', 'GHSA-2345-6789-cfgj').replace('title:', 'draft: true\ntitle:'));
  const astroPackage = JSON.parse(readFileSync(join(repository, 'node_modules/astro/package.json'), 'utf8'));
  const build = spawnSync(process.execPath, [join(repository, 'node_modules/astro', astroPackage.bin.astro), 'build'], {
    cwd: scratch, encoding: 'utf8', timeout: 60_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  assert.equal(build.status, 0, build.stdout + build.stderr);
  const output = join(scratch, 'dist');
  for (const page of ['index.html', 'cves/index.html', 'projects/index.html', 'entries/test-newer-entry/index.html']) {
    const document = parseHTML(readFileSync(join(output, page), 'utf8')).document;
    const radio = document.querySelector('[data-radio]');
    assert.ok(radio, `${page}: configured radio renders`);
    assert.equal(radio.nextElementSibling.tagName, 'FOOTER');
    assert.equal(radio.hidden, true, 'Controls require enhancement before becoming interactive');
    assert.equal(radio.querySelector('[data-radio-title]').textContent, radioTracks[0].title);
    assert.equal(radio.querySelector('[data-radio-title] test'), null, 'Track text is escaped');
    const audio = radio.querySelector('audio');
    assert.equal(audio.hasAttribute('src'), false);
    assert.equal(audio.hasAttribute('autoplay'), false);
    assert.equal(audio.getAttribute('preload'), 'none');
    assert.equal(radio.querySelector('[data-radio-list]').hidden, true);
    assert.deepEqual([...radio.querySelectorAll('[data-radio-choice]')].map((button) => button.dataset.src), radioTracks.map((track) => track.src));
    for (const slider of radio.querySelectorAll('input[type="range"]')) assert.ok(slider.getAttribute('aria-label'));
  }
  assert.equal(parseHTML(readFileSync(join(output, '404.html'), 'utf8')).document.querySelector('[data-radio]'), null);
  for (const track of radioTracks) assert.deepEqual(readFileSync(join(output, track.src.slice(1))), silence);
  function assertCounters(expected) {
    for (const page of ['index.html', 'cves/index.html', 'projects/index.html']) {
      const document = parseHTML(readFileSync(join(output, page), 'utf8')).document;
      for (const [key, value] of Object.entries(expected)) {
        assert.equal(Number(document.querySelector(`.ff-disclosure-counter [data-count="${key}"]`).textContent), value, `${page}: ${key}`);
      }
    }
  }
  function assertEntriesOnly() {
    const document = parseHTML(readFileSync(join(output, 'index.html'), 'utf8')).document;
    const links = [...document.querySelectorAll('main .ff-entry h2 a')];
    assert.deepEqual(links.map((link) => link.textContent), ['test-newer-entry', 'test-older-entry'], 'New entries appear by default, newest first');
    for (const link of links) assert.ok(link.getAttribute('href').startsWith('/entries/'));
    for (const id of ['free-boost', 'geometrydash']) {
      assert.equal(document.querySelector(`a[href="/entries/${id}/"]`), null, `${id}: removed from index`);
      assert.ok(existsSync(join(output, `entries/${id}/index.html`)), `${id}: direct URL preserved`);
    }
    assert.equal(document.querySelector('main a[href^="/cves/"], main .ff-status'), null);
    assert.doesNotMatch(document.querySelector('main').textContent, /Synthetic advisory fixture|Private draft fixture|DRAFT_FIXTURE_MUST_NEVER_RENDER/);
  }
  assertCounters({ assigned: 1, pending: 1, published: 2 });
  assertEntriesOnly();
  assert.equal(existsSync(join(output, 'entries/test-draft')), false);
  assert.equal(existsSync(join(output, 'cves/cve-2099-99998')), false);
  assert.equal(existsSync(join(output, 'cves/ghsa-2345-6789-cfgj')), false);
  const detail = parseHTML(readFileSync(join(output, 'cves/cve-2099-99999/index.html'), 'utf8')).document;
  assert.equal(detail.querySelector('h1').textContent, 'Synthetic advisory fixture');
  assert.ok(detail.querySelector('.ff-facts').textContent.includes('CVE-2099-99999'));
  for (const value of ['PUBLIC_ADVISORY_FIXTURE_BODY', 'Fixture report', 'Test severity', 'Test version', 'Test fix']) assert.ok(detail.querySelector('main').textContent.includes(value));
  assert.ok(detail.querySelector('a[href="https://example.invalid/credit"]'));
  assert.ok(detail.querySelector('a[href="#technical-explanation"]'));
  assert.ok(detail.querySelector('.ff-facts').textContent.includes('Confirmed, published, CVE assigned'));
  const pendingDetail = parseHTML(readFileSync(join(output, 'cves/ghsa-2345-6789-cfgh/index.html'), 'utf8')).document;
  assert.equal(pendingDetail.querySelector('h1').textContent, 'Synthetic advisory fixture');
  assert.ok(pendingDetail.querySelector('.ff-facts').textContent.includes('GHSA-2345-6789-cfgh'));
  assert.ok(pendingDetail.querySelector('.ff-facts').textContent.includes('Confirmed, published, waiting for CVE'));
  assert.ok(pendingDetail.querySelector('.ff-facts time[datetime="2026-09-15"]'));
  for (const page of ['cves/index.html', 'sitemap-0.xml']) {
    const text = readFileSync(join(output, page), 'utf8');
    assert.ok(text.includes('/cves/cve-2099-99999/'), page);
    assert.ok(text.includes('/cves/ghsa-2345-6789-cfgh/'), page);
    assert.doesNotMatch(text, /test-draft|cve-2099-99998|ghsa-2345-6789-cfgj|DRAFT_FIXTURE_MUST_NEVER_RENDER|DRAFT_CVE_MUST_NEVER_RENDER/);
    if (page.endsWith('.html')) {
      assert.ok(text.includes('Confirmed, published, waiting for CVE'), page);
      const document = parseHTML(text).document;
      const title = document.querySelector('a[href="/cves/ghsa-2345-6789-cfgh/"]');
      assert.equal(title.textContent, 'Synthetic advisory fixture');
    }
  }
  assert.equal(existsSync(join(repository, 'dist/cves/cve-2099-99999')), false);
  assert.deepEqual(cacheSnapshot(), originalCache, 'Fixture build must not modify the parent content cache');

  // A later assignment updates the facts/status, not the title or existing URL.
  writeFileSync(join(scratch, 'src/content/cves/test-pending.md'), pending.replace('identifier:', 'cve: CVE-2099-99997\nidentifier:'));
  const assignmentBuild = spawnSync('npm', ['run', 'build'], { cwd: scratch, encoding: 'utf8', timeout: 60_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(assignmentBuild.status, 0, assignmentBuild.stdout + assignmentBuild.stderr);
  assertCounters({ assigned: 2, pending: 0, published: 2 });
  assertEntriesOnly();
  const assignedDetail = parseHTML(readFileSync(join(output, 'cves/ghsa-2345-6789-cfgh/index.html'), 'utf8')).document;
  assert.equal(assignedDetail.querySelector('h1').textContent, 'Synthetic advisory fixture');
  assert.ok(assignedDetail.querySelector('.ff-facts').textContent.includes('CVE-2099-99997'));
  assert.ok(assignedDetail.querySelector('.ff-facts').textContent.includes('GHSA-2345-6789-cfgh'));
  assert.ok(assignedDetail.querySelector('.ff-facts').textContent.includes('Confirmed, published, CVE assigned'));
  assert.doesNotMatch(assignedDetail.querySelector('main').textContent, /waiting for CVE/);
  const archive = parseHTML(readFileSync(join(output, 'cves/index.html'), 'utf8')).document;
  const assignedRow = archive.querySelector('a[href="/cves/ghsa-2345-6789-cfgh/"]').closest('.ff-entry');
  assert.equal(assignedRow.querySelector('h2').textContent, 'Synthetic advisory fixture');
  assert.equal(assignedRow.querySelector('.ff-status').textContent, 'Status: Confirmed, published, CVE assigned');
  assert.deepEqual(cacheSnapshot(), originalCache, 'Assignment build must not modify the parent content cache');

  // Deleting the last advisory must also remove it from subsequent releases.
  unlinkSync(join(scratch, 'src/content/cves/test-public.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-draft.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-pending.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-pending-draft.md'));
  const rebuild = spawnSync('npm', ['run', 'build'], { cwd: scratch, encoding: 'utf8', timeout: 60_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(rebuild.status, 0, rebuild.stdout + rebuild.stderr);
  assertCounters({ assigned: 0, pending: 0, published: 0 });
  assertEntriesOnly();
  assert.equal(existsSync(join(output, 'cves/cve-2099-99999')), false);
  assert.equal(existsSync(join(output, 'cves/ghsa-2345-6789-cfgh')), false);
  assert.doesNotMatch(readFileSync(join(output, 'sitemap-0.xml'), 'utf8'), /cve-2099-99999|ghsa-2345-6789-cfgh/);
  assert.deepEqual(cacheSnapshot(), originalCache, 'Rebuild must not modify the parent content cache');
});
