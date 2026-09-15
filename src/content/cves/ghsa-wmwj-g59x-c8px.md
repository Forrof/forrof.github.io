---
title: verify.spec bypasses the module allowlist and dangerous-permission gate to execute arbitrary host commands
summary: Execution API callers can bypass module and permission restrictions, potentially running commands on the host.
published: "2026-09-01"
updated: "2026-09-15"
identifier: GHSA-wmwj-g59x-c8px
verified: "2026-09-15"
product: flyto-core
creditSource: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
affected: ">= 2.2.2, < 2.31.1"
fixed: "2.31.1"
severity:
  label: Critical · 9.9
  system: CVSS v3.1
  source: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
references:
  - label: Published flyto-core advisory and reporter credit
    url: https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px
tags: [flyto-core, authorization]
---

## Description

> Selected passages from the [GitHub Description](https://github.com/flytohub/flyto-core/security/advisories/GHSA-wmwj-g59x-c8px), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

An authenticated Execution API caller can execute an otherwise denied module through the allowed `verify.spec` module.

### Details

The policy enforcement point is `BaseModule.run()` in `src/core/modules/base.py`. Before dispatching a module, it calls `enforce_module_policy()` with the module identifier, declared permissions, and plugin identity.

This is a sibling omission in the same general class as an earlier nested-module policy fix. The current testing/warroom nested-step runner correctly uses `instance.run()`, but `verify.spec` still uses `instance.execute()`. The tested current release and current source retain this omitted call site.

### Impact

This is an authorization and protection-mechanism bypass leading to arbitrary command execution. A caller who has only the Execution API bearer token, but was intentionally restricted to safe modules, can escape that module policy and execute commands with the privileges of the Flyto process.

An attacker could:

- read service credentials, API keys, configuration, and workflow data available to the process;
- modify application code, workflows, stored data, and writable configuration;
- destroy files or stop the service;
- make network connections and pivot using the service's network access;
- persist through writable startup files or application components; and
- bypass `FLYTO_SANDBOX_DIR` for filesystem effects performed by the command.

The attacker needs a valid Execution API bearer token and a reachable Execution API. No additional dangerous-permission grant, user interaction, or private-network setting is needed. Deployments that keep the API exclusively local and give the token only to fully trusted host administrators have a narrower practical exposure.

### Suggested remediation

Route dynamically selected child modules through the same mandatory policy entry point:

```python
return await instance.run()
```

As defense in depth, recursively inspect module identifiers embedded in `verify.spec` rulesets at the REST Execution API and workflow boundaries, applying both the module filter and declared-permission checks before execution. A registry-wide regression test should also fail whenever code dynamically selects a module and invokes `execute()` directly instead of the policy-gated dispatcher.
