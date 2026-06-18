// ---------------------------------------------------------------------------
// Hunter Network — billing port (Stripe behind a swappable seam)
//
// Money is dangerous, so it lives behind one interface, exactly like the engine
// ports. The product talks to `BillingProvider`; the concrete adapter is chosen
// at runtime from the environment:
//
//   STRIPE_SECRET_KEY set  → StripeBilling (real, hosted checkout + webhooks)
//   not set                → StubBilling, which REFUSES with `billing_not_configured`
//
// Safety posture:
//   • No card data ever touches our servers — checkout is hosted by Stripe.
//   • No price/amount lives in this repo (house rule 5b). The amount is a Stripe
//     Price referenced by STRIPE_PRICE_ID; the code only ever names the id.
//   • Nothing charges by default. Live billing requires explicit keys.
//   • This is the *access-evaluation* fee. It unlocks the Commercial Access
//     Evaluation only — never campaign access (critical business rule #2).
//
// Implemented against Stripe's REST API with fetch — no SDK dependency.
// ---------------------------------------------------------------------------

import crypto from "node:crypto";

export type BillingMode = "stripe" | "stub";

export interface CheckoutRequest {
  // The applicant's email, so Stripe can prefill and we can reconcile.
  email: string;
  // Optional hunter/application reference to stitch the payment back to a
  // candidate once the member portal exists.
  reference?: string;
  lang?: "en" | "es";
}

export interface CheckoutResult {
  ok: boolean;
  url?: string; // hosted Stripe Checkout URL to redirect the candidate to
  id?: string; // session id
  reason?: string;
}

export interface WebhookResult {
  ok: boolean;
  type?: string; // stripe event type, e.g. checkout.session.completed
  reference?: string | null;
  email?: string | null;
  reason?: string;
}

export interface BillingProvider {
  readonly mode: BillingMode;
  // Create a hosted checkout session for the access-evaluation fee.
  createAccessCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  // Verify and parse an incoming Stripe webhook. `signature` is the raw
  // `stripe-signature` header; `payload` is the raw request body string.
  verifyWebhook(payload: string, signature: string | null): Promise<WebhookResult>;
}

const NOT_CONFIGURED = "billing_not_configured";
const STRIPE_API = "https://api.stripe.com/v1";

// --- Stripe adapter ---------------------------------------------------------

class StripeBilling implements BillingProvider {
  readonly mode: BillingMode = "stripe";

  constructor(
    private readonly secretKey: string,
    private readonly priceId: string,
    private readonly webhookSecret: string | null,
    private readonly successUrl: string,
    private readonly cancelUrl: string,
  ) {}

  async createAccessCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    // Form-encoded body — Stripe's API is application/x-www-form-urlencoded.
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", this.successUrl);
    body.set("cancel_url", this.cancelUrl);
    body.set("line_items[0][price]", this.priceId);
    body.set("line_items[0][quantity]", "1");
    if (req.email) body.set("customer_email", req.email);
    // Carry the reference + intent through to the webhook for reconciliation.
    body.set("metadata[purpose]", "commercial_access_evaluation");
    if (req.reference) body.set("metadata[reference]", req.reference);
    if (req.lang) body.set("metadata[lang]", req.lang);
    body.set("client_reference_id", req.reference ?? req.email);

    try {
      const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !json.url) {
        console.error("[hn-billing] stripe checkout error", json.error);
        return { ok: false, reason: json.error?.message ?? "stripe_error" };
      }
      return { ok: true, url: json.url, id: json.id };
    } catch (e) {
      console.error("[hn-billing] stripe checkout exception", e);
      return { ok: false, reason: "network_error" };
    }
  }

  async verifyWebhook(payload: string, signature: string | null): Promise<WebhookResult> {
    if (!this.webhookSecret) return { ok: false, reason: "no_webhook_secret" };
    if (!signature) return { ok: false, reason: "missing_signature" };

    // Stripe signature header: "t=timestamp,v1=hexsig[,v1=...]".
    const parts = Object.fromEntries(signature.split(",").map((kv) => kv.split("=")));
    const timestamp = parts["t"];
    const provided = parts["v1"];
    if (!timestamp || !provided) return { ok: false, reason: "malformed_signature" };

    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    // Constant-time comparison to avoid timing leaks.
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature_mismatch" };
    }

    // Reject events older than 5 minutes — replay protection.
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return { ok: false, reason: "timestamp_out_of_tolerance" };
    }

    try {
      const event = JSON.parse(payload) as {
        type?: string;
        data?: { object?: { client_reference_id?: string; customer_email?: string; metadata?: Record<string, string> } };
      };
      const obj = event.data?.object;
      return {
        ok: true,
        type: event.type,
        reference: obj?.metadata?.reference ?? obj?.client_reference_id ?? null,
        email: obj?.customer_email ?? null,
      };
    } catch {
      return { ok: false, reason: "invalid_json" };
    }
  }
}

// --- Stub adapter (default) -------------------------------------------------
// Refuses loudly so a missing key fails fast instead of silently pretending a
// payment happened. Nothing here can move money.
class StubBilling implements BillingProvider {
  readonly mode: BillingMode = "stub";
  async createAccessCheckout(): Promise<CheckoutResult> {
    return { ok: false, reason: NOT_CONFIGURED };
  }
  async verifyWebhook(): Promise<WebhookResult> {
    return { ok: false, reason: NOT_CONFIGURED };
  }
}

// --- Factory ----------------------------------------------------------------
// The single place that reads billing env. Everything downstream is provider-
// agnostic. Live billing needs SECRET + PRICE; without them we stay on the stub.
export function resolveBilling(): BillingProvider {
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!secret || !price) return new StubBilling();

  const base = process.env.HN_PUBLIC_BASE_URL ?? "https://xnlab.io";
  const success = process.env.STRIPE_SUCCESS_URL ?? `${base}/hunter-network?paid=1`;
  const cancel = process.env.STRIPE_CANCEL_URL ?? `${base}/hunter-network?canceled=1`;
  return new StripeBilling(secret, price, process.env.STRIPE_WEBHOOK_SECRET ?? null, success, cancel);
}

export const BILLING_NOT_CONFIGURED = NOT_CONFIGURED;
