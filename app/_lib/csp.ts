import { headers } from "next/headers";

// Reads the per-request nonce set by `proxy.ts`. Returned as a
// plain string so server components can hand it straight to a
// `<script nonce={…} />` tag. Returns undefined if the request did
// not pass through the proxy (e.g. static prerender during build
// — those scripts run on the client at hydration time with the same
// nonce the runtime will then emit).
export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}
