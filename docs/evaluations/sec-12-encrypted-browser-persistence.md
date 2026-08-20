# SEC-12: Encrypted-at-Rest Browser Persistence Evaluation

## Executive Summary

MyPersonaOS is a personal-first operating system designed for single-owner productivity with local-first offline capabilities. Currently, browser-side data (LocalStorage snapshots, backup copies, and durable offline outbox items) are stored as plaintext JSON in browser-isolated origin storage.

While origin isolation (SOP) and user-scoped cache keys prevent cross-account logical leakage, plaintext browser storage remains accessible to:
1. Anyone with physical access to an unlocked shared/borrowed device profile.
2. Malicious browser extensions with storage inspection privileges.
3. Forensics on local disk storage in shared computer environments.

This evaluation explores the trade-offs, threat models, and architectural patterns for adding **Encrypted-at-Rest Browser Persistence** without compromising instant offline PWA usability.

---

## Threat Model & Constraints

### What Encryption-at-Rest Protects
- **Shared / Family Computer Risk**: Prevents another user of the same OS profile or browser from reading exported IndexedDB/LocalStorage dumps.
- **Lost / Stolen Unencrypted Laptop/Device**: Adds a layer of defense-in-depth beyond OS-level disk encryption (e.g. BitLocker/FileVault).

### What It Does NOT Protect
- **Active Memory Scraping / Compromised Runtime**: If an attacker executes code in the active page session (e.g., XSS), in-memory keys or decrypted state can be extracted.
- **Physical Keylogger / Screen Capture**: Passphrase entry can still be captured if the device hardware is compromised.

---

## Architectural Approaches

### Approach A: Opt-in "Vault Mode" (Session Key Derivation via PBKDF2 / Argon2id)

1. **User Experience**:
   - User enables "Vault Mode" in Settings and chooses a local encryption passphrase (or PIN).
   - On app launch, a modal prompts for the Vault passphrase.
   - The passphrase derives an AES-GCM 256-bit key via `PBKDF2` (with high iteration count, e.g., 600,000 rounds) or `Argon2id` (WebAssembly).
   - LocalStorage / IndexedDB snapshots and outbox entries are stored as AES-GCM ciphertexts: `{ iv, salt, ciphertext, tag }`.
   - The key is held only in volatile memory (`sessionStorage` or JS memory) and discarded on tab close or after an idle timeout.

2. **Trade-offs**:
   - **Pros**: Strong privacy on shared devices; zero server-side key escrow needed; mathematically secure at rest.
   - **Cons**: Disrupts instant-open PWA flow (user must enter passphrase every session); forgetting the passphrase causes permanent loss of un-synced offline mutations.

---

### Approach B: WebAuthn PRF (Pseudo-Random Function) Hardware-Backed Key

1. **User Experience**:
   - Uses the WebAuthn `prf` extension (supported in modern Chromium, Safari, and Firefox).
   - Touch ID / Windows Hello / YubiKey biometric gesture derives a symmetric encryption key from the hardware authenticator without requiring a typed password.
   - Decrypts local storage instantly with biometric tap.

2. **Trade-offs**:
   - **Pros**: Seamless UX with biometric tap; hardware-level key security; no passwords to remember.
   - **Cons**: Device-bound (cannot decrypt on a secondary browser unless registered); requires browser/OS platform authenticator support.

---

### Approach C: Transparent Supabase Token-Derived Key (SubtleCrypto)

1. **User Experience**:
   - Derives a client-side encryption key from the authenticated Supabase session access/refresh token or user encryption salt stored in `user_profiles`.
   - Encrypts offline outbox and cached state transparently.

2. **Trade-offs**:
   - **Pros**: Fully transparent UX in Cloud Mode.
   - **Cons**: When offline before session refresh or in pure Local Mode, key management becomes circular. Storing the derivation secret in the same LocalStorage renders encryption trivial to bypass.

---

## Recommendation & Phasing

| Phase | Milestone | Action |
|---|---|---|
| **Phase 1 (V0.3)** | Core Workflows Baseline | Keep user-scoped isolation + `SEC-11` schema validation. Document device security baseline (lock screen, personal profile). |
| **Phase 2 (V0.4 PWA)** | Opt-in Vault Mode | Implement **Approach A (Opt-in Vault Mode)** as an optional setting in MyPersonaOS Settings for users on shared/untrusted machines. |
| **Phase 3 (Future)** | Biometric Hardware Unlock | Add **Approach B (WebAuthn PRF)** for single-tap biometric vault decryption on supported platforms. |
