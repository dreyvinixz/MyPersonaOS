# SEC-13: Nonce-Based Content Security Policy (CSP) Strategy

## Executive Summary

MyPersonaOS currently uses a hardened Content Security Policy (CSP) configured in `next.config.ts` and `src/proxy.ts` (added during the V0.2 security audit):
- `default-src 'self'`
- `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
- `img-src 'self' data: blob:`
- `frame-ancestors 'none'`
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline'`

While this restricts network egress to the authorized Supabase endpoints and prevents framing/clickjacking, `'unsafe-inline'` in `script-src` and `style-src` is still required by Next.js client hydration and CSS-in-JS/Tailwind injection.

This document analyzes the migration path toward a strict, **nonce-based CSP** in Next.js 16.3 App Router.

---

## Technical Feasibility in Next.js 16 App Router

Next.js App Router natively supports CSP nonces via request proxy/middleware.

### How Nonce-Based CSP Works in Next.js 16

1. **Generation in `src/proxy.ts`**:
   ```ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';

   export function proxy(request: NextRequest) {
     const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
     const cspHeader = `
       default-src 'self';
       script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
       style-src 'self' 'nonce-${nonce}';
       img-src 'self' blob: data:;
       font-src 'self';
       connect-src 'self' https://*.supabase.co wss://*.supabase.co;
       frame-ancestors 'none';
       base-uri 'self';
       form-action 'self';
     `.replace(/\s{2,}/g, ' ').trim();

     const requestHeaders = new Headers(request.headers);
     requestHeaders.set('x-nonce', nonce);
     requestHeaders.set('Content-Security-Policy', cspHeader);

     const response = NextResponse.next({
       request: {
         headers: requestHeaders,
       },
     });
     response.headers.set('Content-Security-Policy', cspHeader);
     return response;
   }
   ```

2. **Reading Nonce in Server Layout / Components**:
   ```tsx
   import { headers } from 'next/headers';
   import Script from 'next/script';

   export default async function RootLayout({ children }) {
     const nonce = (await headers()).get('x-nonce') ?? undefined;
     return (
       <html lang="en">
         <body nonce={nonce}>
           {children}
         </body>
       </html>
     );
   }
   ```

---

## Practical Constraints & Edge Cases

### 1. Static Generation (SSG) vs. Dynamic Headers
- **Challenge**: MyPersonaOS generates 9/9 pages as static HTML at build time (`next build`). 
- When `headers()` or dynamic per-request nonces are accessed in `RootLayout`, Next.js switches the root rendering mode from purely static generation to dynamic server-side rendering (SSR) on every route request.
- **Trade-off**: Increases server compute / Vercel execution units and adds TTFB overhead compared to static edge hosting.

### 2. Tailwind CSS Inline Utilities
- Tailwind v3 generates atomic class rules in a compiled `.css` bundle during `next build`.
- However, React dynamic `style={{ ... }}` attributes on HTML elements (such as `style={{ borderColor: "var(--border)" }}`) are **not** blocked by `style-src 'self' 'nonce-...'` (only `<style>` tags are checked, unless `'unsafe-hashes'` or style-attribute policies are applied).

### 3. Third-Party PWA Service Worker
- `public/sw.js` runs in a worker context and does not require inline script execution.

---

## Migration Recommendation

1. **Short Term (V0.2/V0.3)**:
   - Retain the current robust CSP (`connect-src` whitelist + `frame-ancestors 'none'` + anti-MIME sniffing headers).
   - This maintains 100% static generation (9/9 static pages) on Vercel with zero latency overhead and zero SSR cold starts.

2. **Mid Term (V0.4 PWA / Operational Polish)**:
   - Prototype the `x-nonce` injection in `proxy.ts` on a dedicated feature branch.
   - Verify performance metrics (TTFB) and verify that Vercel Edge Middleware propagates the nonce to Next.js `<Script>` and static chunks without breaking Turbopack build optimization.
