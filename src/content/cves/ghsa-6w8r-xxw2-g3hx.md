---
title: vm2 — native-code execution through the SQLite builtin
summary: The SQLite integration exposes native extension loading to sandboxed plugins with builtin access.
published: "2026-08-24"
identifier: GHSA-6w8r-xxw2-g3hx
verified: "2026-09-15"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
references:
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
tags: [vm2, sandbox, sqlite]
---

## Overview

The SQLite builtin retains capabilities that can load native code in the host process. Exposing it to sandboxed plugins can therefore undermine NodeVM's isolation guarantees.

## Remediation

The maintainer lists vm2 3.11.7 as the patched release for the affected 3.11.3–3.11.6 versions.
