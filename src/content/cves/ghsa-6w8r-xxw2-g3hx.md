---
title: vm2 3.11.6 allows a sandboxed plugin to execute native code through node:sqlite
summary: The SQLite integration exposes native extension loading to sandboxed plugins with builtin access.
published: "2026-08-24"
updated: "2026-09-20"
identifier: GHSA-6w8r-xxw2-g3hx
cve: CVE-2026-92938
verified: "2026-09-20"
product: vm2
creditSource: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
affected: ">= 3.11.3, <= 3.11.6"
fixed: "3.11.7"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
references:
  - label: NIST NVD CVE-2026-92938 record
    url: https://nvd.nist.gov/vuln/detail/CVE-2026-92938
  - label: Published vm2 advisory and reporter credit
    url: https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx
  - label: vm2 configuration documentation
    url: https://github.com/patriksimek/vm2
tags: [vm2, sandbox, sqlite]
---

## Description

> Selected passages from the [GitHub Description](https://github.com/patriksimek/vm2/security/advisories/GHSA-6w8r-xxw2-g3hx), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

vm2 3.11.6 exposes Node.js's host `node:sqlite` module to `NodeVM` code when that builtin is allowed explicitly or through `builtin: ['*']`. The module is wrapped as read-only, but callable methods retain host-process authority.

SQLite loads the library into the Node.js host process and invokes its native extension entry point. This gives the untrusted plugin arbitrary native code execution outside the sandbox.

### Details

The vulnerable boundary spans the builtin inventory, resolver, runtime loader, and generic read-only wrapper.

The default builtin loader imports the real module in the host realm and exposes it through `vm.readonly()`:

```js
builtins.set(key, vm => vm.readonly(hostRequire(key)));
```

Read-only wrapping prevents property assignment. It does not remove dangerous callable capabilities.

### Impact

This is a sandbox escape to arbitrary native code execution. The native code runs inside the Node.js host process with the operating-system identity and privileges of that process, beyond all vm2 JavaScript, module, and proxy restrictions.

- reads application secrets, credentials, environment variables, and files available to the host account;
- modifies application data or executable files and establishes persistence;
- accesses internal services using the host's network identity;
- steals other tenants' data from the same process;
- terminates or corrupts the host process; and
- performs any other operating-system action permitted to the host account.

The realistic affected workflow is a plugin platform, automation service, notebook, build service, or multi-tenant code runner that stores attacker-supplied package contents and evaluates the package's JavaScript in `NodeVM` while allowing `node:sqlite` or all builtins. The attacker does not need pre-existing host execution, a writable database, or a command-execution builtin.
