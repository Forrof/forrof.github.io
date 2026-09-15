---
title: vm2 — shared HTTPS agent exposes host data
summary: Access to a shared HTTPS agent can expose host credentials and connection data across the sandbox boundary.
published: "2026-08-24"
identifier: GHSA-h85j-hv3c-qfgq
verified: "2026-09-15"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-h85j-hv3c-qfgq
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 10.0
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-h85j-hv3c-qfgq
references:
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-h85j-hv3c-qfgq
tags: [vm2, sandbox, https]
---

## Overview

NodeVM's HTTPS integration exposes shared host state to sandboxed code. This can compromise the confidentiality of credentials and TLS connection data used outside the sandbox.

## Remediation

The maintainer lists vm2 3.11.7 as the patched release for the affected 3.11.3–3.11.6 versions.
