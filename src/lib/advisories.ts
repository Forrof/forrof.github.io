type AdvisoryIdentity = { identifier: string; cve?: string };

export const assignedCve = (data: AdvisoryIdentity) => data.cve ?? (data.identifier.startsWith('CVE-') ? data.identifier : undefined);
export const advisoryLabel = (data: AdvisoryIdentity) => assignedCve(data) ?? data.identifier;
export const advisoryStatus = (data: AdvisoryIdentity) => assignedCve(data) ? 'CVE assigned' : 'CVE not yet assigned';
