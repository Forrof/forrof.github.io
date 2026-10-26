---
title: Instance reconfiguration allows YAML structure injection through template arguments
summary: Yamcs instance reconfiguration can persist injected YAML structure, causing denial of service and potentially code execution depending on the deployment.
published: "2026-10-01"
identifier: GHSA-wqq5-5w4p-m569
verified: "2026-10-26"
product: Yamcs
creditSource: https://github.com/yamcs/yamcs/security/advisories/GHSA-wqq5-5w4p-m569
affected: "< 5.13.6"
fixed: "5.13.6"
severity:
  label: High · 7.2
  system: CVSS v3.1
  source: https://github.com/yamcs/yamcs/security/advisories/GHSA-wqq5-5w4p-m569
references:
  - label: Published Yamcs advisory and shared reporter credit
    url: https://github.com/yamcs/yamcs/security/advisories/GHSA-wqq5-5w4p-m569
tags: [yamcs, yaml, configuration-injection]
---

## Description

> Summary of the [public GitHub advisory](https://github.com/yamcs/yamcs/security/advisories/GHSA-wqq5-5w4p-m569), which credits forrof alongside other researchers. This is not a verbatim copy; reproduction instructions are omitted.

### Summary

The earlier YAML-sanitization fix covered instance creation but not reconfiguration. A user granted `CreateInstances` can cross the intended template-argument boundary; the resulting configuration is saved before the instance restarts.

### Impact

The report confirms persistent invalid configuration and instance-level denial of service. Code-execution impact depends on available templates and installed services; it is not a universal outcome.

### Patches

Upgrade to **5.13.6**. The remediation applies structured YAML sanitization to reconfiguration as well as creation. No CVE identifier is assigned in this public advisory; identifiers mentioned for the earlier vulnerability do not identify this finding.
