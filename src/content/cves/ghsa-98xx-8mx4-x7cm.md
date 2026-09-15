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

## Description

> Selected passages from the [GitHub Description](https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

vm2 3.11.6 exposes the host `tls` module to a `NodeVM` when that builtin is explicitly allowed. Although the module object is wrapped as read-only, its functions still execute against process-wide host state.

This crosses the intended sandbox boundary. An attacker can make host HTTPS clients trust an attacker-controlled CA, enabling credential theft and response tampering when the attacker can influence a subsequent destination or network path. Replacing the list also removes the normal trust roots, disrupting unrelated host TLS traffic.

### Details

The vulnerable boundary is the default builtin loader in `lib/builtin.js`. Builtins that are not classified as dangerous are exposed through a recursive read-only bridge:

```js
builtins.set(key, special ? special : vm => vm.readonly(hostRequire(key)));
```

The read-only wrapper prevents ordinary property assignment through the sandbox proxy.

### Impact

This is an improper sandbox authorization boundary around a process-wide TLS security setting.

An attacker who can submit code to a `NodeVM` configured with the `tls` and `url` builtins can:

- replace the CAs used by subsequent host-side HTTPS and TLS clients;
- make the host authenticate services presenting certificates signed by the attacker;
- intercept host credentials, API tokens, session data, request bodies, and responses when the attacker can influence DNS, routing, a proxy, or a later request destination;
- modify trusted responses, including configuration, webhook, update, identity, and package-retrieval traffic;
- remove the normal trusted roots and cause unrelated host TLS connections to fail.

The attacker does not obtain a direct file or command-execution primitive from this PoC. The critical impact is control of the host process's authentication trust decision, outside the sandbox's authority. Connections that explicitly provide their own CA list are not affected, and already cached TLS sessions may remain unchanged.
