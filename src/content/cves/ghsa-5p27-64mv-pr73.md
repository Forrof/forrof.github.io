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

## Overview

The token flow fails to enforce the registered client type, allowed grants, and authentication method consistently. Public-client secret handling also violates the intended distinction between public and confidential clients.

## Affected configuration

Exposure requires enabling the OAuth server while leaving dynamic client registration open. **OAuth is disabled by default**, so a default installation is not affected.

The affected range begins at 10.20.0, when the owner's API-key authorization gate was introduced. Earlier OAuth behavior existed, but not that gate to bypass.

## Impact

Unauthorized clients can gain read/write access to stored memories without the owner's API key. The normal authorization-code flow is not itself broken; the issue is a separate token-grant path that fails to enforce equivalent restrictions.

## Remediation

Version 11.8.2 enforces stored grant and authentication settings, stops issuing secrets to public clients, and corrects empty-secret storage. The related storage inconsistency was not independently sufficient to authenticate an empty secret.

## Workarounds

If upgrading is temporarily impossible, the advisory recommends either:

- Protect registration with a strong random `MCP_DCR_REGISTRATION_KEY`.
- Set `MCP_OAUTH_ENABLED=false` and use API-key authentication.

The report states that the registration-key protection was verified.
