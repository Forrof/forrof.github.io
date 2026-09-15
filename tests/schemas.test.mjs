import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dateSchema, entrySchema, cveSchema, projectSchema } from '../src/lib/schemas.ts';
import { assignedCve, advisoryStatus, advisoryCounts } from '../src/lib/advisories.ts';

test('dates preserve known precision and reject impossible dates', () => {
  for (const date of ['2024-11', '2025-11', '2024-02-29', '2026-09-14']) assert.equal(dateSchema.parse(date), date);
  for (const date of ['2025-02-29', '2026-13', '2026-04-31', 'yesterday', '2026-9-1']) assert.equal(dateSchema.safeParse(date).success, false);
});

test('entry metadata is validated and draft status is explicit', () => {
  const base = { title: 'Test only', summary: 'Fixture', published: '2026-09', tags: [] };
  assert.equal(entrySchema.parse(base).draft, false);
  assert.equal(entrySchema.parse({ ...base, draft: true }).draft, true);
  assert.equal(entrySchema.safeParse({ ...base, published: undefined }).success, false);
  assert.equal(entrySchema.safeParse({ ...base, type: 'unrecognized' }).success, false);
});

test('advisories require public attribution and source-qualified severity', () => {
  // Synthetic metadata never enters the website content directories.
  const fixture = { title: 'Test fixture', summary: 'Not a real advisory', published: '2026-09', identifier: 'CVE-2099-99999', product: 'Fixture', creditSource: 'https://example.invalid/credit', affected: 'Test', fixed: 'Test', references: [{ label: 'Fixture', url: 'https://example.invalid/advisory' }] };
  assert.equal(cveSchema.safeParse(fixture).success, true);
  for (const key of ['creditSource', 'affected', 'fixed', 'references']) assert.equal(cveSchema.safeParse({ ...fixture, [key]: undefined }).success, false);
  assert.equal(cveSchema.safeParse({ ...fixture, creditSource: 'javascript:alert(1)' }).success, false);
  assert.equal(cveSchema.safeParse({ ...fixture, identifier: 'not-a-cve' }).success, false);
  assert.equal(cveSchema.safeParse({ ...fixture, severity: { label: 'High' } }).success, false);
});

test('project URLs and ownership type are constrained', () => {
  const fixture = { name: 'Test', repository: 'https://github.com/Forrof/FFind', language: 'Python', kind: 'original', order: 1 };
  assert.equal(projectSchema.safeParse(fixture).success, true);
  assert.equal(projectSchema.safeParse({ ...fixture, repository: 'https://github.com.evil.invalid/project' }).success, false);
  assert.equal(projectSchema.safeParse({ ...fixture, kind: undefined }).success, false);
});

test('public GHSAs can await a CVE without inventing an identifier or changing their route key', () => {
  const pending = { title: 'Fixture', summary: 'Synthetic record', published: '2026-09-15', identifier: 'GHSA-2345-6789-cfgh', verified: '2026-09-15', product: 'Fixture', creditSource: 'https://example.invalid/credit', affected: 'Test', fixed: 'Test', references: [{ label: 'Fixture', url: 'https://example.invalid/advisory' }] };
  assert.equal(cveSchema.safeParse(pending).success, true);
  assert.equal(assignedCve(pending), undefined);
  assert.equal(advisoryStatus(pending), 'Confirmed, published, waiting for CVE');
  const assigned = cveSchema.parse({ ...pending, cve: 'CVE-2099-99997' });
  assert.equal(assigned.identifier, pending.identifier);
  assert.equal(assignedCve(assigned), 'CVE-2099-99997');
  assert.equal(advisoryStatus(assigned), 'Confirmed, published, CVE assigned');
  assert.equal(advisoryStatus({ identifier: 'CVE-2099-99999' }), 'Confirmed, published, CVE assigned');
  for (const identifier of ['GHSA-invalid', 'GHSA-0000-0000-0000', 'CVE-pending']) assert.equal(cveSchema.safeParse({ ...pending, identifier }).success, false);
  assert.equal(cveSchema.safeParse({ ...pending, cve: 'pending' }).success, false);
  assert.equal(cveSchema.safeParse({ ...pending, verified: '2026-02-30' }).success, false);
  assert.equal(cveSchema.safeParse({ ...pending, identifier: 'CVE-2099-99999', cve: 'CVE-2099-99997' }).success, false);
});

test('disclosure counts distinguish assigned CVEs, pending advisories, and private drafts', () => {
  assert.deepEqual(advisoryCounts([]), { assigned: 0, pending: 0, published: 0 });
  const pending = { identifier: 'GHSA-2345-6789-cfgh' };
  const records = [
    { identifier: 'CVE-2099-99999' },
    { identifier: 'GHSA-2345-6789-cfgj', cve: 'CVE-2099-99998' },
    pending,
    { identifier: 'CVE-2099-99997', draft: true },
    { identifier: 'GHSA-2345-6789-cfgm', draft: true },
  ];
  assert.deepEqual(advisoryCounts(records), { assigned: 2, pending: 1, published: 3 });
  assert.deepEqual(advisoryCounts([{ ...pending, cve: 'CVE-2099-99996' }]), { assigned: 1, pending: 0, published: 1 });
  assert.deepEqual(advisoryCounts([{ ...pending, draft: true }]), { assigned: 0, pending: 0, published: 0 });
});
