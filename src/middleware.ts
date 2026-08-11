// Next.js 15.x uses middleware.ts (not proxy.ts which is a Next.js 16 concept).
// This file re-exports the proxy logic so the auth boundary works correctly.
export { proxy as middleware, config } from "./proxy";
