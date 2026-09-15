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

  // Isolate the collection so the final rebuild also exercises removing its last record.
  for (const file of readdirSync(join(scratch, 'src/content/cves'))) {
    if (file.endsWith('.md')) unlinkSync(join(scratch, 'src/content/cves', file));
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
  assert.equal(existsSync(join(output, 'entries/test-draft')), false);
  assert.equal(existsSync(join(output, 'cves/cve-2099-99998')), false);
  assert.equal(existsSync(join(output, 'cves/ghsa-2345-6789-cfgj')), false);
  const detail = parseHTML(readFileSync(join(output, 'cves/cve-2099-99999/index.html'), 'utf8')).document;
  assert.equal(detail.querySelector('h1').textContent, 'CVE-2099-99999');
  for (const value of ['PUBLIC_ADVISORY_FIXTURE_BODY', 'Fixture report', 'Test severity', 'Test version', 'Test fix']) assert.ok(detail.querySelector('main').textContent.includes(value));
  assert.ok(detail.querySelector('a[href="https://example.invalid/credit"]'));
  assert.ok(detail.querySelector('a[href="#technical-explanation"]'));
  assert.ok(detail.querySelector('.ff-facts').textContent.includes('CVE assigned'));
  const pendingDetail = parseHTML(readFileSync(join(output, 'cves/ghsa-2345-6789-cfgh/index.html'), 'utf8')).document;
  assert.equal(pendingDetail.querySelector('h1').textContent, 'GHSA-2345-6789-cfgh');
  assert.ok(pendingDetail.querySelector('.ff-facts').textContent.includes('CVE not yet assigned'));
  assert.ok(pendingDetail.querySelector('.ff-facts time[datetime="2026-09-15"]'));
  for (const page of ['index.html', 'cves/index.html', 'sitemap-0.xml']) {
    const text = readFileSync(join(output, page), 'utf8');
    assert.ok(text.includes('/cves/cve-2099-99999/'), page);
    assert.ok(text.includes('/cves/ghsa-2345-6789-cfgh/'), page);
    assert.doesNotMatch(text, /test-draft|cve-2099-99998|ghsa-2345-6789-cfgj|DRAFT_FIXTURE_MUST_NEVER_RENDER|DRAFT_CVE_MUST_NEVER_RENDER/);
    if (page.endsWith('.html')) assert.ok(text.includes('CVE not yet assigned'), page);
  }
  assert.equal(existsSync(join(repository, 'dist/cves/cve-2099-99999')), false);
  assert.deepEqual(cacheSnapshot(), originalCache, 'Fixture build must not modify the parent content cache');

  // A later assignment changes the label/status, not the existing public URL.
  writeFileSync(join(scratch, 'src/content/cves/test-pending.md'), pending.replace('identifier:', 'cve: CVE-2099-99997\nidentifier:'));
  const assignmentBuild = spawnSync('npm', ['run', 'build'], { cwd: scratch, encoding: 'utf8', timeout: 60_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(assignmentBuild.status, 0, assignmentBuild.stdout + assignmentBuild.stderr);
  const assignedDetail = parseHTML(readFileSync(join(output, 'cves/ghsa-2345-6789-cfgh/index.html'), 'utf8')).document;
  assert.equal(assignedDetail.querySelector('h1').textContent, 'CVE-2099-99997');
  assert.ok(assignedDetail.querySelector('.ff-facts').textContent.includes('GHSA-2345-6789-cfgh'));
  assert.ok(assignedDetail.querySelector('.ff-facts').textContent.includes('CVE assigned'));
  assert.doesNotMatch(assignedDetail.querySelector('main').textContent, /CVE not yet assigned/);
  for (const page of ['index.html', 'cves/index.html']) {
    const document = parseHTML(readFileSync(join(output, page), 'utf8')).document;
    const row = document.querySelector('a[href="/cves/ghsa-2345-6789-cfgh/"]').closest('.ff-entry');
    assert.ok(row.textContent.includes('CVE-2099-99997'));
    assert.equal(row.querySelector('.ff-status').textContent, 'Status: CVE assigned');
  }
  assert.deepEqual(cacheSnapshot(), originalCache, 'Assignment build must not modify the parent content cache');

  // Deleting the last advisory must also remove it from subsequent releases.
  unlinkSync(join(scratch, 'src/content/cves/test-public.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-draft.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-pending.md'));
  unlinkSync(join(scratch, 'src/content/cves/test-pending-draft.md'));
  const rebuild = spawnSync('npm', ['run', 'build'], { cwd: scratch, encoding: 'utf8', timeout: 60_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(rebuild.status, 0, rebuild.stdout + rebuild.stderr);
  assert.equal(existsSync(join(output, 'cves/cve-2099-99999')), false);
  assert.equal(existsSync(join(output, 'cves/ghsa-2345-6789-cfgh')), false);
  assert.doesNotMatch(readFileSync(join(output, 'sitemap-0.xml'), 'utf8'), /cve-2099-99999|ghsa-2345-6789-cfgh/);
  assert.deepEqual(cacheSnapshot(), originalCache, 'Rebuild must not modify the parent content cache');
});
