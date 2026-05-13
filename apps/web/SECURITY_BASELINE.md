# APEX-F1 — Security Baseline

**Status: Phase 2 Frozen**

## 1. Environment Protection
- **Rule**: Never prefix backend secrets (DB URLs, API Keys) with `NEXT_PUBLIC_`.
- All sensitive fetches **must** happen in Server Components to keep credentials off the client.

## 2. API Hardening
- Use the `apiSafe` layer for all requests.
- Implement Zod contract validation to prevent "Prototype Pollution" or other malformed data attacks from the backend.

## 3. Client Safety
- **Forbidden**: `dangerouslySetInnerHTML` unless the source is a trusted, sanitized F1 data feed (rarely needed).
- **XSS**: Sanitize all user-input (if any is added later) before rendering.
- **Exposure**: Audit the `public/` directory for any unintentionally exposed configuration files.

## 4. Separation of Concerns
- Maintain a strict boundary between public assets and private application logic.
- Ensure `node_modules` and `.env` files are correctly excluded from all client-side bundles.
