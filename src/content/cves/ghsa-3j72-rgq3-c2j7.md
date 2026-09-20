---
title: SeaweedFS 4.42 inline GCS credentials allow unauthenticated SSRF with response read-back
summary: Unauthenticated access to the volume server gRPC port can bypass outbound destination protections and expose internal service responses.
published: "2026-09-18"
identifier: GHSA-3j72-rgq3-c2j7
verified: "2026-09-20"
product: SeaweedFS
creditSource: https://github.com/seaweedfs/seaweedfs/security/advisories/GHSA-3j72-rgq3-c2j7
affected: "4.24 through 4.42"
fixed: Not specified in the published advisory
severity:
  label: Critical · 9.3
  system: CVSS v3.1
  source: https://github.com/seaweedfs/seaweedfs/security/advisories/GHSA-3j72-rgq3-c2j7
references:
  - label: Published SeaweedFS advisory and reporter credit
    url: https://github.com/seaweedfs/seaweedfs/security/advisories/GHSA-3j72-rgq3-c2j7
tags: [seaweedfs, ssrf, gcs]
---

## Description

> Selected passages from the [GitHub Description](https://github.com/seaweedfs/seaweedfs/security/advisories/GHSA-3j72-rgq3-c2j7), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

SeaweedFS 4.42 allows an unauthenticated caller with network access to the volume server gRPC port to bypass the endpoint SSRF protection in `VolumeServer.FetchAndWriteNeedle`.

### Details

When endpoint protection is enabled, every network destination derived from caller-supplied remote configuration should be validated with the same address policy and connection-time protections. Inline GCS credentials containing loopback, private, link-local, or metadata-service URLs should be rejected before any connection occurs.

### Impact

This is server-side request forgery with response read-back.

The practical impact depends on which internal services the volume server can reach. Network isolation, gRPC mTLS, or a restrictive admin whitelist reduces exploitability. Deployments in which an untrusted client can reach the default unauthenticated gRPC plane have the highest exposure.
