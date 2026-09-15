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
tags: [vm2, sandbox, https]
---

## Overview

NodeVM exposes the host's shared HTTPS agent rather than an isolated network instance. A read-only wrapper protects the module's surface, but does not separate the agent's live resources from sandboxed code.

## Affected configuration

The reported case permits HTTPS inside NodeVM while unrelated host requests use the default HTTPS agent. The host does not need to deliberately pass its credentials or connections into the sandbox.

## Impact

Sensitive request settings, authentication material, internal destination information, and plaintext data on reused TLS connections can cross the boundary. The report describes exposure of a host token and response data, followed by unauthorized use of that credential.

The shared resource also creates integrity and availability risks for host traffic and other tenants in the same process. Permission to make a sandbox's own HTTPS requests should not confer access to another workload's authenticated connections.

## Remediation

The maintainer identifies vm2 3.11.7 as the patched release for versions 3.11.3–3.11.6. The advisory notes that sensitive host requests consistently using a separate private agent avoid this specific shared singleton; this is not the default behavior or a general sandbox fix.
