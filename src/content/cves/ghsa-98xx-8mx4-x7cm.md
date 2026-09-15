---
title: vm2 — host TLS trust-store isolation failure
summary: Sandboxed code with access to the TLS builtin can alter trust settings shared by the host process.
published: "2026-08-24"
identifier: GHSA-98xx-8mx4-x7cm
verified: "2026-09-15"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 10.0
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm
references:
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm
tags: [vm2, sandbox, tls]
---

## Overview

The sandbox boundary does not fully isolate process-wide TLS trust configuration. When the relevant builtin is available, changes made inside NodeVM can affect certificate trust outside the sandbox.

## Remediation

The maintainer lists vm2 3.11.7 as the patched release for the affected 3.11.3–3.11.6 versions.
