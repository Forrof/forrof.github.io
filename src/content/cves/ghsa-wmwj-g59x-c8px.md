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

## Overview

Dynamically selected child modules do not consistently pass through the same authorization checks as ordinary execution. This breaks the module allowlist and dangerous-permission boundary enforced elsewhere in the application.

### Technical details

The advisory identifies `BaseModule.run()` as the shared policy entry point. It checks the module's identity, declared permissions, and plugin context before dispatching the implementation. An execution path that directly invokes an implementation bypasses that authorization boundary.

Top-level admission is not sufficient when an allowed module can select child modules dynamically. Each child must undergo the same checks as a directly requested module. Otherwise, a restrictive outer policy can fail to constrain the work that happens underneath it.

The report distinguishes this from an authentication failure: the caller already has an API token. The missing boundary is the authorization that should restrict that caller's permitted operations. Regression coverage must therefore include nested execution under both ordinary and restrictive policies.

## Affected configuration

The report concerns reachable Execution API deployments where a caller has a valid bearer token but is intentionally restricted to safe modules. Authentication is required; possession of an API token should not imply unrestricted host access.

An exclusively local API whose token is held only by fully trusted host administrators has narrower practical exposure.

## Impact

The policy bypass can lead to command execution with the Flyto service account's privileges. Consequences include exposure of service secrets and workflow data, modification of writable resources, and service disruption.

The report also describes filesystem effects outside the workflow's configured sandbox directory. These effects remain bounded by the operating-system permissions of the service account, not by the intended module policy.

## Remediation

The maintainer lists 2.31.1 as the patched release for versions from 2.2.2 onward. The report recommends a mandatory authorization path for every child-module invocation, recursive policy checks for embedded module selections, and regression tests covering indirect execution paths.

### Suggested patch

The advisory supplies this replacement at the child-dispatch call site:

```python
return await instance.run()
```

This is a call-site fragment, not a standalone program. It routes the existing module instance through the mandatory policy checks. The report also recommends validating embedded module selections at API and workflow boundaries, plus registry-wide checks that prevent new dispatchers from skipping the guarded path.
