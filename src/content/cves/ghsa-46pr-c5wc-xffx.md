---
title: vm2 3.11.6 crypto builtin loads attacker native code through setEngine
summary: The crypto integration exposes native-code loading capabilities beyond the intended sandbox permissions.
published: "2026-08-24"
updated: "2026-09-15"
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

The crypto integration exposes a native-loading capability with the authority of the Node.js host process. Wrapping the module as read-only does not confine the effects of its callable functions.

## Affected configuration

The report concerns plugin and code-running platforms that evaluate untrusted packages in NodeVM while exposing the crypto builtin. The security boundary includes package contents as well as JavaScript: language-level restrictions cannot contain native code executing inside the host.

## Impact

Native execution occurs with the host account's operating-system privileges, outside vm2's JavaScript and module restrictions. The resulting exposure includes:

- Application secrets and files accessible to that account.
- Modification of application data and other writable resources.
- Access to services available from the host.
- Loss of isolation between tenants, or disruption of the host process.

The advisory distinguishes this from simply allowing normal cryptographic operations inside a sandbox: those operations should not confer arbitrary host execution.

## Remediation

Upgrade affected vm2 3.11.3–3.11.6 installations to 3.11.7, the maintainer's patched release. Review builtin permissions and native host capabilities exposed to untrusted packages; read-only wrappers alone do not supply process isolation.
