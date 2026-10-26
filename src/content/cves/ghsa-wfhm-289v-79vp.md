---
title: Arbitrary File Read via Path Traversal in Asset API
summary: Mautic's Asset API can expose server-readable files through public asset downloads when an API user has asset-creation permission.
published: "2026-10-26"
identifier: GHSA-wfhm-289v-79vp
cve: CVE-2026-115194
verified: "2026-10-26"
product: Mautic
creditSource: https://github.com/mautic/mautic/security/advisories/GHSA-wfhm-289v-79vp
affected: ">= 2.3.0, < 5.2.12; >= 6.0.0, < 6.0.10; >= 7.0.0, < 7.2.2"
fixed: "5.2.12, 6.0.10, 7.2.2"
severity:
  label: Medium · 6.5
  system: CVSS v3.1
  source: https://github.com/mautic/mautic/security/advisories/GHSA-wfhm-289v-79vp
references:
  - label: Published Mautic advisory, CVE assignment, and shared reporter credit
    url: https://github.com/mautic/mautic/security/advisories/GHSA-wfhm-289v-79vp
tags: [mautic, path-traversal, information-disclosure]
---

## Description

> Summary of the [public GitHub advisory](https://github.com/mautic/mautic/security/advisories/GHSA-wfhm-289v-79vp), which credits forrof alongside other researchers. This is not a verbatim copy.

### Summary

Local asset creation through the API does not confine file paths to the upload directory. An authenticated user with asset-creation permission can expose files accessible to the web server.

### Impact

Published download links require no authentication. Exposed files may contain database passwords, mail credentials, or application secrets, potentially compromising connected services.

### Patches and mitigation

Upgrade to **5.2.12**, **6.0.10**, or **7.2.2**. Until upgrading, disable API access or restrict asset creation to trusted administrators. Audit existing local assets for paths outside their intended upload directory. These mitigations are not described as official workarounds.
