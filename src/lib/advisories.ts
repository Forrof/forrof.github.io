type AdvisoryIdentity = { identifier: string; cve?: string };

export const assignedCve = (data: AdvisoryIdentity) => data.cve ?? (data.identifier.startsWith('CVE-') ? data.identifier : undefined);
export const advisoryStatus = (data: AdvisoryIdentity) => assignedCve(data)
  ? 'Confirmed, published, CVE assigned'
  : 'Confirmed, published, waiting for CVE';
