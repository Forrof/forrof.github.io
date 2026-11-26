---
title: Repository create with upsert overwrites existing repositories without the update permission
summary: Argo CD repository upserts bypass update authorization, allowing create-only users to overwrite existing repository configuration and affect deployments.
published: "2026-11-24"
identifier: GHSA-mfgm-4p7x-3ccr
verified: "2026-11-26"
product: Argo CD
creditSource: https://github.com/argoproj/argo-cd/security/advisories/GHSA-mfgm-4p7x-3ccr
affected: "v2: >= 2.14.0; v3: >= 3.0.0, < 3.4.15 || >= 3.5.0, < 3.5.9 || >= 3.6.0, < 3.6.3"
fixed: "3.4.15, 3.5.9, 3.6.3; no v2 patch listed"
severity:
  label: High · 7.7
  system: CVSS v3.1
  source: https://github.com/argoproj/argo-cd/security/advisories/GHSA-mfgm-4p7x-3ccr
references:
  - label: Published Argo CD advisory and shared reporter credit
    url: https://github.com/argoproj/argo-cd/security/advisories/GHSA-mfgm-4p7x-3ccr
  - label: Argo CD RBAC configuration
    url: https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/
tags: [argo-cd, authorization, rbac, gitops]
---

## Description

> Summary of the [public GitHub advisory](https://github.com/argoproj/argo-cd/security/advisories/GHSA-mfgm-4p7x-3ccr), which credits forrof alongside other researchers. This is not a verbatim copy.

### Impact

Authenticated users with repository-create permission but no update permission can replace existing repository settings through an upsert. Affected configurations include credentials and transport settings. Consequences include unauthorized deployment changes and failed manifest generation. The built-in read-only role is not sufficient; write-repository impact additionally requires the source hydrator and a successful connection test.

### Patches

Upgrade to **3.4.15**, **3.5.9**, or **3.6.3**. Patched upserts require update authorization for both the existing and requested repository. The v2 package lists no patched release.

### Workarounds

Remove create-only grants or restrict their repository scope so they cannot match existing repositories. Review both global and project-role RBAC policies.
