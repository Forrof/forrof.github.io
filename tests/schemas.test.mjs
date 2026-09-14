import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dateSchema, entrySchema, cveSchema, projectSchema } from '../src/lib/schemas.ts';

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
