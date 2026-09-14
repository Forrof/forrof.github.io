import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { entrySchema, cveSchema, projectSchema } from './lib/schemas';

const entries = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/entries' }),
  schema: entrySchema,
});
const cves = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/cves' }),
  schema: cveSchema,
});
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/projects' }),
  schema: projectSchema,
});
export const collections = { entries, cves, projects };
