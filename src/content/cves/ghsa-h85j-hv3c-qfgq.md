---
title: vm2 3.11.6 exposes host HTTPS credentials and TLS traffic through globalAgent
summary: Access to a shared HTTPS agent can expose host credentials and connection data across the sandbox boundary.
published: "2026-08-24"
updated: "2026-09-15"
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
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, https]
---

## Overview

NodeVM exposes the host's shared HTTPS agent rather than an isolated network instance. A read-only wrapper protects the module's surface, but does not separate the agent's live resources from sandboxed code.

### Technical details

The default builtin loader exposes the actual host module through a recursive proxy. This is materially different from supplying a sandbox-owned implementation. The default HTTPS agent manages live connections and their associated state for unrelated host requests.

Read-only protection prevents assigning properties, but does not necessarily prevent methods on shared objects from changing internal state. Event-driven objects and pooled connections need a stronger ownership boundary: otherwise data from a host workload can be presented through the bridge without that workload intentionally sharing it.

The report's defensive conclusion is to avoid exporting the host singleton. A sandbox-local network facade and agent can separate the resources belonging to the sandbox from the host's authenticated connections. Merely freezing the outer module object does not establish that separation.

## Affected configuration

The reported case permits HTTPS inside NodeVM while unrelated host requests use the default HTTPS agent. The host does not need to deliberately pass its credentials or connections into the sandbox.

## Impact

Sensitive request settings, authentication material, internal destination information, and plaintext data on reused TLS connections can cross the boundary. The report describes exposure of a host token and response data, followed by unauthorized use of that credential.

The shared resource also creates integrity and availability risks for host traffic and other tenants in the same process. Permission to make a sandbox's own HTTPS requests should not confer access to another workload's authenticated connections.

## Remediation

The maintainer identifies vm2 3.11.7 as the patched release for versions 3.11.3–3.11.6. The advisory notes that sensitive host requests consistently using a separate private agent avoid this specific shared singleton; this is not the default behavior or a general sandbox fix.

### Defensive configuration example

If the workload does not need imports or nested VMs, vm2 documents options to disable both:

```javascript
const { NodeVM } = require('vm2');

const sandbox = new NodeVM({
  require: false,
  nesting: false,
});
```

This optional hardening changes the workload's available features. It is not the maintainer's patch and does not replace an upgrade or stronger process isolation.
