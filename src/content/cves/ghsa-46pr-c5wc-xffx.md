---
title: vm2 — native-code execution through the crypto builtin
summary: The crypto integration exposes native-code loading capabilities beyond the intended sandbox permissions.
published: "2026-08-24"
identifier: GHSA-46pr-c5wc-xffx
verified: "2026-09-15"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
references:
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
tags: [vm2, sandbox, crypto]
---

## Overview

Sandboxed code permitted to use the crypto builtin can reach a native-code loading capability that retains host-process authority. This breaks the intended separation between the sandbox and its host.

## Remediation

The maintainer lists vm2 3.11.7 as the patched release for the affected 3.11.3–3.11.6 versions.
