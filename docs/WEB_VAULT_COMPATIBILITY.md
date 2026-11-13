# Web Vault Compatibility Specification (GitHub Pages & Android)

## Overview
This specification details the cross-platform cryptographic and document contract shared between the GitHub Pages web owner portal (which creates and encrypts session envelopes) and the Android native application (which reads and decrypts them in memory).

---

## 1. Firestore Document Storage Path
The encrypted envelope must be written to:
`privateSessions/{firebaseUid}`
where `{firebaseUid}` is the exact Firebase Authentication UID of the owner.

---

## 2. Encrypted Envelope Schema (Version 1)
```json
{
  "schemaVersion": 1,
  "cipherSuite": "AES-256-GCM",
  "kdf": "PBKDF2-HMAC-SHA256",
  "iterations": 600000,
  "saltB64": "<16-byte random salt Base64 encoded without line breaks>",
  "ivB64": "<12-byte random IV Base64 encoded without line breaks>",
  "ciphertextB64": "<AES-256-GCM ciphertext + 16-byte auth tag Base64 encoded>",
  "expiresAtEpochSeconds": 1750000000,
  "updatedAt": "2026-11-10T00:00:00Z"
}
```

---

## 3. Cryptographic Parameters & Web Crypto Implementation

### Primitives
- **Cipher**: `AES-256-GCM` with a 128-bit (16-byte) authentication tag.
- **KDF**: `PBKDF2` using `SHA-256` hashing.
- **Key Length**: 256 bits (32 bytes).
- **Iterations**: `600000` (Bounded between 500,000 and 1,000,000).
- **Salt**: 16 cryptographically random bytes (`crypto.getRandomValues(new Uint8Array(16))`).
- **IV**: 12 cryptographically random bytes (`crypto.getRandomValues(new Uint8Array(12))`).
- **Base64 Encoding**: Standard Base64 without line breaks (`NO_WRAP`).

### Authenticated Additional Data (AAD) Construction
Both Web Crypto and Android MUST construct byte-for-byte identical AAD:
```text
xtrinox-session-v1|<firebaseUid>|<expiresAtEpochSeconds>
```
Encoded as UTF-8 bytes:
```javascript
const aadString = `xtrinox-session-v1|${firebaseUid}|${expiresAtEpochSeconds}`;
const aadBytes = new TextEncoder().encode(aadString);
```

### GitHub Pages Web Crypto Reference Pattern
```javascript
// 1. Import raw passphrase as PBKDF2 base key
const keyMaterial = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(vaultPassphrase),
  "PBKDF2",
  false,
  ["deriveKey"]
);

// 2. Derive 256-bit AES-GCM key
const aesKey = await crypto.subtle.deriveKey(
  {
    name: "PBKDF2",
    salt: saltBytes,
    iterations: 600000,
    hash: "SHA-256"
  },
  keyMaterial,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"]
);

// 3. Encrypt session JSON with AAD
const ciphertextBuffer = await crypto.subtle.encrypt(
  {
    name: "AES-GCM",
    iv: ivBytes,
    additionalData: aadBytes,
    tagLength: 128
  },
  aesKey,
  new TextEncoder().encode(plaintextSessionJson)
);
```

---

## 4. Plaintext Session Payload Schema
Inside the ciphertext, the decrypted payload MUST match:
```json
{
  "schemaVersion": 1,
  "targetUrl": "https://chatgpt.com/",
  "expiresAtEpochSeconds": 1750000000,
  "cookies": [
    {
      "name": "<cookie-name>",
      "value": "<cookie-value>",
      "url": "https://chatgpt.com/",
      "domain": null,
      "path": "/",
      "secure": true,
      "httpOnly": true,
      "sameSite": "Lax",
      "expiresAtEpochSeconds": 1750000000,
      "chunkIndex": null,
      "chunkCount": null
    }
  ]
}
```

---

## 5. Deterministic Fake Test Vector (Non-Sensitive)
Use this vector to verify cryptographic compatibility:
- **UID**: `test_owner_uid_12345`
- **Passphrase**: `TestVaultPassphrase!987`
- **Salt (16 bytes)**: `1234567890abcdef`
- **SaltB64**: `MTIzNDU2Nzg5MGFiY2RlZg==`
- **IV (12 bytes)**: `1234567890ab`
- **IvB64**: `MTIzNDU2Nzg5MGFi`
- **ExpiresAtEpochSeconds**: `1750000000`
- **Expected AAD**: `xtrinox-session-v1|test_owner_uid_12345|1750000000`
- **Plaintext JSON**:
  `{"schemaVersion":1,"targetUrl":"https://chatgpt.com/","expiresAtEpochSeconds":1750000000,"cookies":[{"name":"__Host-fake_session","value":"fake_val_123","url":"https://chatgpt.com/","path":"/","secure":true,"httpOnly":true,"sameSite":"Lax","expiresAtEpochSeconds":1750000000}]}`
