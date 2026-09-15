---
title: mcp-memory-service — OAuth client authorization bypass
summary: In the affected OAuth configuration, client registration restrictions are not enforced when granting access tokens.
published: "2026-08-23"
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

The OAuth token flow does not enforce a client's registered grant types and authentication method. With the OAuth server enabled and dynamic registration left open, this can permit unauthorized access to stored memories.

## Remediation

The maintainer identifies 11.8.2 as the patched release. The published affected range begins at 10.20.0 and excludes 11.8.2.
