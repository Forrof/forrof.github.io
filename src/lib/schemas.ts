import { z } from 'astro/zod';

// Month precision preserves the dates available in the original archive.
export const dateSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/)
  .refine((value) => {
    const full = value.length === 7 ? `${value}-01` : value;
    const parsed = new Date(`${full}T00:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(full);
  }, 'Use a valid YYYY-MM or YYYY-MM-DD date');
const shared = {
  title: z.string().min(1),
  summary: z.string().min(1),
  published: dateSchema,
  updated: dateSchema.optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
};


export const entrySchema = z.object({
    ...shared,
    type: z.enum(['entry', 'writeup']).default('entry'),
    platform: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
  });

const cveIdentifier = z.string().regex(/^CVE-\d{4}-\d{4,}$/);
const ghsaIdentifier = z.string().regex(/^GHSA-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}$/);

export const cveSchema = z.object({
    ...shared,
    // Keep this identifier stable so assigning a CVE does not change an existing GHSA URL.
    identifier: z.union([cveIdentifier, ghsaIdentifier]),
    cve: cveIdentifier.optional(),
    verified: dateSchema.optional(),
    product: z.string().min(1),
    creditSource: z.url({ protocol: /^https?$/ }),
    affected: z.string().min(1),
    fixed: z.string().min(1),
    references: z.array(z.object({ label: z.string().min(1), url: z.url({ protocol: /^https?$/ }) })).min(1),
    timeline: z.array(z.object({ date: dateSchema, event: z.string().min(1) })).default([]),
    severity: z.object({ label: z.string().min(1), source: z.url({ protocol: /^https?$/ }), system: z.string().min(1) }).optional(),
  }).refine((data) => !data.identifier.startsWith('CVE-') || !data.cve || data.identifier === data.cve,
    { message: 'An advisory cannot have conflicting CVE identifiers', path: ['cve'] });

export const projectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    repository: z.url({ protocol: /^https?$/ }).refine((url) => new URL(url).hostname === 'github.com', 'Use a GitHub repository URL'),
    language: z.string().min(1),
    kind: z.enum(['original', 'fork', 'contribution']),
    order: z.number().int().nonnegative(),
  });
