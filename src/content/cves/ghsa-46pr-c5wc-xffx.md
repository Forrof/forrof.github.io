---
title: vm2 3.11.6 crypto builtin loads attacker native code through setEngine
summary: The crypto integration exposes native-code loading capabilities beyond the intended sandbox permissions.
published: "2026-08-24"
updated: "2026-09-20"
identifier: GHSA-46pr-c5wc-xffx
cve: CVE-2026-92939
verified: "2026-09-20"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
references:
  - label: NIST NVD CVE-2026-92939 record
    url: https://nvd.nist.gov/vuln/detail/CVE-2026-92939
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, crypto]
---

## Description

> Selected passages from the [GitHub Description](https://github.com/patriksimek/vm2/security/advisories/GHSA-46pr-c5wc-xffx), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

vm2 3.11.6 exposes the host `crypto` module to a `NodeVM` when that single builtin is allowed. The module is presented through a read-only bridge, but its functions still execute with host-process authority.

The exploit requires only the `crypto` builtin. It does not require `fs`, `process`, `module`, `child_process`, `worker_threads`, `vm`, `inspector`, unrestricted builtins, or vm2 nesting.

### Details

The vulnerable boundary is the generic builtin loader. Builtins that are not specially wrapped or classified as dangerous are imported in the host realm and exposed through a recursive read-only proxy:

```js
builtins.set(key, special ? special : vm => vm.readonly(hostRequire(key)));
```

Read-only prevents sandbox code from assigning properties on the module object. It does not reduce the authority of callable exports. Calls are forwarded to the original host function with bridge values converted back to host values.

### Impact

This is a sandbox escape to arbitrary native code execution. The code runs with the operating-system identity and privileges of the Node.js host process, outside all vm2 language and module restrictions.

- reads application secrets, environment variables, credentials, and files available to the host user;
- modifies application data or executable files and establishes persistence;
- accesses internal services using the host's network identity;
- steals other tenants' data from the same process;
- terminates or corrupts the host process; and
- executes arbitrary operating-system actions permitted to the host account.

The realistic affected workflow is a plugin, automation, notebook, or multi-tenant code runner that stores attacker-supplied package contents on disk and runs the package's JavaScript in `NodeVM` while allowing `crypto`. The attacker does not need the sandbox to expose a file-write or command-execution module.
