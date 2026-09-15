---
title: flyto-core — execution policy bypass
summary: Execution API callers can bypass module and permission restrictions, potentially running commands on the host.
published: "2026-09-01"
identifier: GHSA-wmwj-g59x-c8px
verified: "2026-09-15"
product: flyto-core
creditSource: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
affected: ">= 2.2.2, < 2.31.1"
fixed: "2.31.1"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
references:
  - label: Published flyto-core advisory and reporter credit
    url: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
tags: [flyto-core, authorization]
---

## Overview

An execution path fails to apply the module allowlist and dangerous-permission checks consistently. An authenticated API caller can reach capabilities that the configured policy should deny.

## Remediation

The maintainer identifies 2.31.1 as the patched release. The published affected range begins at 2.2.2 and excludes 2.31.1.
