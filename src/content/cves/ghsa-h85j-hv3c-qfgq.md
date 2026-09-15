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

## Description

> Selected passages from the [GitHub Description](https://github.com/patriksimek/vm2/security/advisories/GHSA-h85j-hv3c-qfgq), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

vm2 3.11.6 exposes the host process's real `https.globalAgent` when a `NodeVM` is explicitly allowed to require `https`. The module is wrapped as read-only, but calls to methods on the shared agent still mutate the host object.

The host application never passed its credentials, request, response, socket, or destination into the sandbox. They crossed the boundary solely because vm2 exposes the process-global HTTPS agent instead of a sandbox-local network module instance.

### Details

The vulnerable boundary is the default builtin loader in `lib/builtin.js`:

```js
builtins.set(key, special ? special : vm => vm.readonly(hostRequire(key)));
```

The wrapper recursively exposes properties of the actual host module. For ordinary constants, a read-only proxy can be sufficient. It is not sufficient for process-global EventEmitter objects whose methods mutate internal state.

This is a distinct residual of the same process-wide observability class for which other host builtins are rejected. The current dangerous-builtin filter does not classify `https` as process-global because the module also has legitimate sandbox network APIs. A safe implementation must avoid exposing the host singleton, such as by providing a sandbox-local module facade and sandbox-local Agent.

### Impact

This is cross-boundary exposure and misuse of a process-global authenticated network resource.

An attacker who can submit code to a `NodeVM` with `https` allowed can, when the host uses the default HTTPS agent:

- steal Authorization, Cookie, API-key, proxy-authorization, and other sensitive request options;
- discover private service hostnames and ports used only by host code;
- read plaintext response headers and bodies on reused TLS connections;
- steal client-certificate, private-key, passphrase, CA, or session-related options when the host supplies them through request options;
- perform authenticated actions using stolen bearer credentials;
- write to or destroy live host sockets, disrupting or corrupting unrelated traffic;
- cross tenant boundaries when multiple sandboxes and host workloads share one process.

The sandbox already has the intentional ability to make its own HTTPS requests. It does not intentionally have authority to observe or reuse the host application's credentials and connections. A host that always supplies a separate private Agent for every sensitive request avoids this specific singleton, but that is not the default behavior.
