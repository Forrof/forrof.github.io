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

## Description

> Selected passages from the [GitHub Description](https://github.com/goshs-labs/goshs/security/advisories/GHSA-2q29-798w-6qcp), reproduced verbatim. Exploit and reproduction details are omitted. Attribution is shown as forrof.

### Summary

The TFTP server in goshs 2.1.5 does not enforce the global `--no-delete`
security option.

Severity: **Critical — CVSS v3.1 9.1**

### Details

goshs exposes multiple file-transfer protocols over a shared webroot or upload
directory. The `--no-delete` option is intended to allow new uploads while
preventing deletion, truncation, replacement, or rename of existing content.
The current HTTP and WebDAV paths enforce this distinction, but the TFTP path
does not.

The relevant source is `tftpserver/tftpserver.go`.

`TFTPServer` stores the read-only and upload-only policy flags, but has no field
for the global no-delete state:

```go
type TFTPServer struct {
    IP         string
    Port       int
    Root       string
    UploadRoot string
    ReadOnly   bool
    UploadOnly bool
    // No NoDelete field
}
```

`NewTFTPServer` copies `opts.ReadOnly` and `opts.UploadOnly`, but does not copy
`opts.NoDelete`:

```go
return &TFTPServer{
    IP:         opts.IP,
    Port:       opts.TFTPPort,
    Root:       opts.Webroot,
    UploadRoot: uploadRoot,
    ReadOnly:   opts.ReadOnly,
    UploadOnly: opts.UploadOnly,
}
```

The global option does exist in `options/options.go` and is populated by the
`--no-delete` command-line flag, so the omission is specific to propagation
into the TFTP server.

Path traversal is not required. The target remains inside the configured upload
root. The vulnerability is the conversion of permission to create a new file
into permission to destroy or replace an existing file despite
`--no-delete`.

Suggested remediation is to propagate `opts.NoDelete` into `TFTPServer` and,
when enabled, open new uploads using an atomic exclusive-create operation. If
the target exists, the server should return TFTP ERROR code 2 without opening
or modifying it. A separate existence check followed by a normal create would
be race-prone.

### Impact

This is an improper-access-control vulnerability affecting goshs deployments
that enable both TFTP and `--no-delete` and expose the TFTP UDP port to an
attacker not blocked by an IP whitelist or external network policy.

The directly demonstrated impact is complete integrity and availability loss
for targeted files. Direct confidentiality loss, path traversal, writes outside
the configured root, and direct command execution were not demonstrated.
Secondary code execution is possible only if another trusted component later
loads or executes an attacker-replaced file.

## Version note

The affected-version field lists **1.2.4 and 1.2.5**, but the report discusses **2.1.5**. The conflicting range is preserved pending maintainer clarification.

## Severity note

GitHub's metadata rates this **High / 7.5**; the report proposes **Critical / 9.1**. The facts panel uses the metadata rating, not the reporter's assessment.
