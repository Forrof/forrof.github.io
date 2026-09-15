import { getCollection } from 'astro:content';
import { assignedCve } from './advisories';

export const displayDate = (date: string) => date.split('-').join(' / ');
export const fullDate = (date: string) => new Intl.DateTimeFormat('en', {
  year: 'numeric', month: 'long', ...(date.length > 7 ? { day: 'numeric' } : {}), timeZone: 'UTC',
}).format(new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`));

export async function publishedEntries() {
  return (await getCollection('entries', ({ data }) => !data.draft))
    .sort((a, b) => b.data.published.localeCompare(a.data.published) || a.id.localeCompare(b.id));
}

export async function publishedCves() {
  const cves = await getCollection('cves', ({ data }) => !data.draft);
  const identifiers = cves.map(({ data }) => data.identifier);
  if (new Set(identifiers).size !== identifiers.length) throw new Error('Each advisory identifier must have exactly one record.');
  const assigned = cves.map(({ data }) => assignedCve(data)).filter(Boolean);
  if (new Set(assigned).size !== assigned.length) throw new Error('Each assigned CVE must have exactly one advisory.');
  return cves.sort((a, b) => b.data.published.localeCompare(a.data.published) || a.id.localeCompare(b.id));
}
