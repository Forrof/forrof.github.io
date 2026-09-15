type AdvisoryIdentity = { identifier: string; cve?: string };

export const assignedCve = (data: AdvisoryIdentity) => data.cve ?? (data.identifier.startsWith('CVE-') ? data.identifier : undefined);
export const advisoryStatus = (data: AdvisoryIdentity) => assignedCve(data)
  ? 'Confirmed, published, CVE assigned'
  : 'Confirmed, published, waiting for CVE';

export function advisoryCounts(records: ReadonlyArray<AdvisoryIdentity & { draft?: boolean }>) {
  const published = records.filter((record) => !record.draft);
  const assigned = published.filter((record) => assignedCve(record)).length;
  return { assigned, pending: published.length - assigned, published: published.length };
}
