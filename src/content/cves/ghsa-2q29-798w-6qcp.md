---
title: goshs TFTP ignores --no-delete, allowing unauthenticated overwrite and truncation of existing files
summary: The TFTP service can modify existing files despite the server's deletion-protection setting.
published: "2026-08-23"
updated: "2026-09-15"
identifier: GHSA-2q29-798w-6qcp
verified: "2026-09-15"
product: goshs
creditSource: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
affected: "1.2.4 and 1.2.5 (listed; see version note)"
fixed: "v2.1.6 (per advisory)"
severity:
  label: High · 7.5
  system: CVSS v3.1
  source: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
references:
  - label: Published goshs advisory and reporter credit
    url: https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp
tags: [goshs, tftp]
---

## Overview

The TFTP service does not enforce the server's deletion-protection policy consistently. Its file-opening behavior permits destructive writes to existing files despite the operator enabling that protection.

### Technical details

The report traces the problem to policy propagation in `tftpserver/tftpserver.go`. The global no-delete option exists, but the TFTP server's state and initialization do not carry it through alongside the read-only and upload-only settings. HTTP and WebDAV enforce the intended distinction; TFTP does not apply the same rule.

Permission to create a new upload and permission to replace existing content are separate decisions. Checking that a path stays inside the upload root addresses location, not whether a destructive write is authorized. A file operation with truncation semantics can therefore violate the no-delete policy without escaping that root.

The report recommends enforcing the policy at the actual file-open operation. Checking whether a file exists and opening it later would leave a race between the check and the write.

## Affected configuration

The reported exposure concerns deployments with TFTP and deletion protection enabled, where network controls do not restrict access to the TFTP service. Other protocols may share the same upload directory.

## Impact

Files inside that directory can lose their original contents or be replaced. This threatens integrity and availability, including data served through other protocols.

The report does not demonstrate disclosure of confidential information, traversal outside the configured root, or direct command execution. Any subsequent execution would depend on another component consuming a modified file.

## Remediation

The advisory identifies v2.1.6 as the patched release. Operators should review exposure of the TFTP service and avoid relying on deletion protection in affected versions.

### Defensive code example

When no-delete protection applies, an exclusive-create operation preserves an existing target:

```go
file, err := os.OpenFile(
    path,
    os.O_WRONLY|os.O_CREATE|os.O_EXCL,
    0o600,
)
```

This illustrates the report's remediation, not a complete server patch. Keep the existing path validation, propagate the policy into TFTP state, handle `err` before using `file`, and reject an existing target without modifying it. File permissions must also follow the application's policy.

## Version note

The affected-version field lists **1.2.4 and 1.2.5**, but the report discusses **2.1.5**. The conflicting range is preserved pending maintainer clarification.

## Severity note

GitHub's metadata rates this **High / 7.5**; the report proposes **Critical / 9.1**. The facts panel uses the metadata rating, not the reporter's assessment.
