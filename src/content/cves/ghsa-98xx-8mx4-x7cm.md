---
title: vm2 3.11.6 NodeVM can replace the host process TLS trust store
summary: Sandboxed code with access to the TLS builtin can alter trust settings shared by the host process.
published: "2026-08-24"
updated: "2026-09-15"
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
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, tls]
---

## Overview

NodeVM's read-only wrapper does not isolate the state changed by host TLS functions. Sandboxed code can influence certificate trust for subsequent connections made outside the sandbox, even though the module object itself appears protected.

### Technical details

The report identifies the default builtin loader in `lib/builtin.js` as the boundary. It exposes host modules through a recursive read-only bridge. That bridge prevents ordinary property assignment, but callable exports still act on the state owned by their host implementation.

For TLS, this includes default certificate-authority configuration shared by later connections in the host's Node.js thread. Immutability of the exported JavaScript object does not make the underlying trust configuration local to a sandbox. Security review must therefore consider side effects and shared state, not only whether a module can be modified.

The distinction also explains the scope of the finding: clients that supply their own CA configuration do not rely on that default store. The report describes a host trust-decision change, not a general file-access or command-execution capability.

## Affected configuration

The report concerns NodeVM configurations exposing TLS-related builtins on Node.js runtimes with mutable default certificate-authority settings. This is a boundary around shared host state, not merely permission to make network requests from a sandbox.

## Impact

- Host connections may accept certificates they would previously have rejected.
- Credentials and response integrity are at risk when an adversary can also influence a connection's destination or network path.
- Removing normal trust roots can break unrelated TLS connections.

The report demonstrates a change in host certificate acceptance, not direct file access or command execution. Connections with their own explicit CA configuration are outside this particular default-store effect; cached sessions may remain unchanged.

## Remediation

Upgrade affected vm2 3.11.3–3.11.6 deployments to the maintainer's patched release, 3.11.7. Review which host capabilities are exposed to untrusted code: a read-only module wrapper is not equivalent to isolating process-wide security settings.

### Defensive configuration example

For workloads that need neither module imports nor nested VMs, this example uses the restrictive options documented by vm2:

```javascript
const { NodeVM } = require('vm2');

const sandbox = new NodeVM({
  require: false,
  nesting: false,
});
```

This is a hardening example, not the maintainer's patch or a guarantee of isolation. Upgrade affected versions; use a separate process or stronger boundary where the threat model requires it.
