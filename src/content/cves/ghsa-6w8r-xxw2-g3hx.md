---
title: vm2 3.11.6 allows a sandboxed plugin to execute native code through node:sqlite
summary: The SQLite integration exposes native extension loading to sandboxed plugins with builtin access.
published: "2026-08-24"
updated: "2026-09-15"
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
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, sqlite]
---

## Overview

The SQLite integration retains native extension capabilities belonging to the host process. Making the module read-only does not remove those capabilities or constrain their effects to the JavaScript sandbox.

### Technical details

The report identifies a boundary spanning the builtin inventory, resolver, runtime loader, and generic wrapper. Those components must agree on the identity of an allowed module. Inconsistent handling of builtin names makes it harder to ensure that resolution and execution enforce the same policy.

The resulting module is the real host implementation exposed through `vm.readonly()`, rather than a separate SQLite service confined to the sandbox. That wrapper restricts property assignment; it does not automatically remove native functionality from the module's callable interfaces.

The important security distinction is between database operations and host-process extension authority. Native code loaded into the Node.js process operates beyond JavaScript proxy restrictions, so permission to use a database cannot safely stand in for permission to use every capability its native integration exposes.

Defensive review must address both consistent module policy and the capabilities returned by an allowed module. The presence of a read-only proxy alone is not evidence that the native boundary has been contained.

## Affected configuration

The advisory describes untrusted plugin or package workloads evaluated in NodeVM with the SQLite builtin available, either individually or through a broad builtin policy. Typical examples include automation platforms, notebooks, build services, and multi-tenant code runners.

## Impact

Native code can execute under the identity and privileges of the Node.js process. This exceeds the intended authority of a plugin and bypasses vm2's language-level restrictions.

Host-accessible secrets, files, and internal services may be exposed. Writable application resources and other tenants' data may be affected, and the host process can lose integrity or availability. These are consequences of host-level execution, not merely unauthorized access to a database.

## Remediation

The maintainer lists vm2 3.11.7 as the patched release for versions 3.11.3–3.11.6. Upgrade affected deployments and review broad builtin grants. Native extension authority should not be treated as safely confined simply because the JavaScript-facing module is read-only.

### Defensive configuration example

For code that needs neither module imports nor nested VMs, this example uses vm2's documented restrictive settings:

```javascript
const { NodeVM } = require('vm2');

const sandbox = new NodeVM({
  require: false,
  nesting: false,
});
```

The example removes features rather than patching the SQLite integration. It is not a substitute for upgrading, and an in-process JavaScript sandbox should not be treated as operating-system isolation.
