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
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, crypto]
---

## Overview

The crypto integration exposes a native-loading capability with the authority of the Node.js host process. Wrapping the module as read-only does not confine the effects of its callable functions.

### Technical details

The report locates the boundary in the generic builtin loader. Builtins without a dedicated security wrapper are imported in the host realm and exposed through a recursive read-only proxy. Calls are still delegated to the original implementation with host authority.

Cryptographic modules combine ordinary operations, such as hashing, with capabilities backed by native runtime facilities. Permission to use the former should not automatically grant unrestricted access to the latter. A wrapper that controls JavaScript property writes does not mediate every effect of a native function.

For package-based workloads, the security review must cover both JavaScript behavior and the package resources accessible to the host. Denying selected JavaScript APIs is not equivalent to placing the workload in a separate operating-system process.

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

### Defensive configuration example

When the application does not require module imports or nested VMs, the following documented configuration disables them:

```javascript
const { NodeVM } = require('vm2');

const sandbox = new NodeVM({
  require: false,
  nesting: false,
});
```

This is an additional restriction, not the upstream patch. It can break workloads that depend on imports, and it does not replace upgrading or selecting an appropriately strong isolation boundary.
