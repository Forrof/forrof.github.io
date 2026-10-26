---
title: Twig Sandbox Escape in Theme Templates
summary: Uploaded Mautic themes can escape Twig sandbox restrictions and execute server-side code when their templates are rendered.
published: "2026-10-26"
identifier: GHSA-h7pm-79gc-8867
cve: CVE-2026-115189
verified: "2026-10-26"
product: Mautic
creditSource: https://github.com/mautic/mautic/security/advisories/GHSA-h7pm-79gc-8867
affected: ">= 1.3.0, < 5.2.12; >= 6.0.0, < 6.0.10; >= 7.0.0, < 7.2.2"
fixed: "5.2.12, 6.0.10, 7.2.2; legacy 4.4 fix through ELTS"
severity:
  label: High · 8.8
  system: CVSS v3.1
  source: https://github.com/mautic/mautic/security/advisories/GHSA-h7pm-79gc-8867
references:
  - label: Published Mautic advisory, CVE assignment, and shared reporter credit
    url: https://github.com/mautic/mautic/security/advisories/GHSA-h7pm-79gc-8867
tags: [mautic, twig, sandbox]
---

## Description

> Summary of the [public GitHub advisory](https://github.com/mautic/mautic/security/advisories/GHSA-h7pm-79gc-8867), which credits forrof alongside other researchers. This is not a verbatim copy.

### Summary

The earlier theme-template sandbox fix was incomplete. An authenticated user granted `core:themes:create` can supply a theme that bypasses the restrictions when rendered.

### Impact

Execution occurs with the web server's privileges, potentially exposing credentials and files, allowing writes, and reaching internal services. Theme creation belongs to administrators by default but may be delegated.

### Patches and mitigation

Upgrade to **5.2.12**, **6.0.10**, or **7.2.2**, depending on the release branch. Mautic 4.4 receives its fix through ELTS rather than a public release. Until upgrading, reserve theme creation for trusted administrators; the advisory lists no official workaround.
