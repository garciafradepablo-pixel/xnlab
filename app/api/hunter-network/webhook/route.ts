// Stripe webhook — the only trustworthy signal that the access-evaluation fee
// was actually paid. NEVER trust the browser's success_url for that.
//
// The raw body is read unparsed (signature verification needs the exact bytes)
// and the `stripe-signature` header is HMAC-verified inside the billing port
// before we believe a single field. On a verified `checkout.session.completed`
// we mark the candidate's access-evaluation as paid — which, by the rules,
// unlocks the EVALUATION only, never campaign access.
//
// In v1 there is no shared DB with the member portal, so a paid event is logged
// and acknowledged; wiring it to a candidate record is the portal's job (Javi).
// The contract (event → reference/email) is fixed here so that wiring is trivial.
//
// POST /api/hunter-network/webhook   (called by Stripe, not by the browser)

import { NextResponse } from "next/server";
import { resolveBilling } from "../../../hunter-network/_core/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Read the RAW body — re-serialising would change bytes and break the HMAC.
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const billing = resolveBilling();
  const result = await billing.verifyWebhook(payload, signature);

  if (!result.ok) {
    // 400 tells Stripe to retry; for unconfigured billing that's harmless noise,
    // for a bad signature it's the correct rejection.
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  if (result.type === "checkout.session.completed") {
    // The access fee cleared. Reconcile to the candidate when the portal exists.
    console.info("[hn-webhook] access-evaluation fee paid", {
      reference: result.reference,
      email: result.email,
    });
    // TODO(portal): mark CommercialAccessEvaluation.payment_status = "paid" and
    // advance the hunter to "ready_for_evaluation". Unlocks evaluation only.
  }

  // Always 200 on a verified event so Stripe stops retrying.
  return NextResponse.json({ ok: true, received: result.type });
}
