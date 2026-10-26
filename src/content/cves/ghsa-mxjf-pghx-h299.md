---
title: Remote Code Execution in Campaign Import
summary: Mautic campaign imports can place unrestricted files in a public media directory, enabling server-side code execution on affected deployments.
published: "2026-10-26"
identifier: GHSA-mxjf-pghx-h299
cve: CVE-2026-115188
verified: "2026-10-26"
product: Mautic
creditSource: https://github.com/mautic/mautic/security/advisories/GHSA-mxjf-pghx-h299
affected: ">= 7.0.0, < 7.2.2"
fixed: "7.2.2"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/mautic/mautic/security/advisories/GHSA-mxjf-pghx-h299
references:
  - label: Published Mautic advisory, CVE assignment, and shared reporter credit
    url: https://github.com/mautic/mautic/security/advisories/GHSA-mxjf-pghx-h299
tags: [mautic, file-upload, rce]
---

## Description

> Summary of the [public GitHub advisory](https://github.com/mautic/mautic/security/advisories/GHSA-mxjf-pghx-h299), which credits forrof alongside other researchers. This is not a verbatim copy.

### Summary

Campaign archives can supply files that Mautic copies into publicly served storage without adequate filename or file-type checks. Exploitation requires campaign-import permission, not necessarily an administrator account.

### Impact

If the server executes those files, an attacker can run code with the web server's privileges, expose application secrets, and change contact data. Otherwise, the issue still permits arbitrary files in public storage.

### Patches and mitigation

Upgrade to **7.2.2**. The advisory excludes Mautic 4, 5, and 6 from this issue. Until upgrading, limit campaign-import permission and enforce non-overridable server-level restrictions against script execution in the media directory.
