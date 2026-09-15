---
title: OAuth client_credentials grant ignores the client's registered grant types and authentication method, allowing an unauthenticated authorization bypass
summary: In the affected OAuth configuration, client registration restrictions are not enforced when granting access tokens.
published: "2026-08-23"
updated: "2026-09-15"
identifier: GHSA-5p27-64mv-pr73
verified: "2026-09-15"
product: mcp-memory-service
creditSource: https://github.com/doobidoo/mcp-memory-service/security/advisories/GHSA-5p27-64mv-pr73
affected: ">= 10.20.0, < 11.8.2"
fixed: "11.8.2"
severity:
  label: Critical · 9.1
  system: CVSS v3.1
  source: https://github.com/doobidoo/mcp-memory-service/security/advisories/GHSA-5p27-64mv-pr73
references:
  - label: Published mcp-memory-service advisory and reporter credit
    url: https://github.com/doobidoo/mcp-memory-service/security/advisories/GHSA-5p27-64mv-pr73
tags: [mcp, oauth, authorization]
---

## Description

> Selected passages from the [GitHub Description](https://github.com/doobidoo/mcp-memory-service/security/advisories/GHSA-5p27-64mv-pr73), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Impact

When the OAuth 2.1 authorization server is enabled (`MCP_OAUTH_ENABLED=true`) and Dynamic Client Registration is left open (`MCP_DCR_REGISTRATION_KEY` unset, which is the default), an unauthenticated attacker can obtain a bearer token with `read write` scope and use it to read and write memories without possessing the owner's API key.

The intended authorization-code flow is not affected: it correctly requires the owner's API key at `/oauth/authorize` and correctly reads the auth method off the stored client. The bypass goes around that flow entirely rather than through it.

A fourth, related weakness was found while fixing this: `store_client()` hashed an empty secret, so a secretless client was persisted as `sha256$e3b0c442...` (the SHA-256 of the empty string) and looked like a client that has one. Authentication still failed, because the constant-time comparison rejects empty input, but the stored representation was misleading. It is corrected in the same change.

### Precondition, and what it means for severity

OAuth is **off by default** (`OAUTH_ENABLED = safe_get_bool_env('MCP_OAUTH_ENABLED', False)`), so a default installation is not affected. Affected deployments are those that enabled the OAuth server — which is the documented path for remote MCP access from claude.ai. Once OAuth is enabled with open registration, the attack is deterministic and needs no prior access, credentials, or user interaction, which is what the CVSS vector reflects.

### Patches

Fixed in 11.8.2. The `client_credentials` grant now reads the stored client and rejects it unless the grant is registered and the authentication method is not `none`; registration issues no secret to a public client; and an empty secret is no longer hashed at rest.

### Workarounds

For deployments that cannot upgrade immediately, either of these closes the entry point:

- Set `MCP_DCR_REGISTRATION_KEY` to a strong random value. Unauthenticated registration then returns HTTP 401, so an attacker cannot obtain a client at all. This was verified by the reporter.
- Set `MCP_OAUTH_ENABLED=false` and use API-key authentication instead.

### Affected versions

10.20.0 and later. The vulnerable token behavior dates back to the introduction of the OAuth layer in 7.0.0, but the owner API-key gate that this bypasses landed in 10.20.0, so earlier versions had no such gate to bypass.
