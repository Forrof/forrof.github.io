---
title: goshs — TFTP file protection bypass
summary: The TFTP service can modify existing files despite the server's deletion-protection setting.
published: "2026-08-23"
identifier: GHSA-2q29-798w-6qcp
verified: "2026-09-15"
product: goshs
creditSource: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
affected: "1.2.4 and 1.2.5 (listed; see version note)"
fixed: "v2.1.6 (per advisory)"
severity:
  label: High · 7.5
  system: CVSS v3.1
  source: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
references:
  - label: Published goshs advisory and reporter credit
    url: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
tags: [goshs, tftp]
---

## Overview

The TFTP service does not consistently honor the server's file-protection policy. Existing files can be overwritten or truncated even when deletion protection is enabled.

## Remediation

The advisory identifies v2.1.6 as the patched release.

## Version note

The published affected-version field lists **1.2.4 and 1.2.5**, while the advisory body describes **2.1.5**. These source values conflict; the affected range has not been silently corrected here. Consult the maintainer's advisory for clarification.
