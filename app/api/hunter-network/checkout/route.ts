// Access-evaluation checkout. Creates a hosted Stripe Checkout session for the
// Commercial Access Evaluation fee and returns its URL for the client to
// redirect to.
//
// LANGUAGE DISCIPLINE: this fee unlocks the EVALUATION only — never campaign
// access (critical business rule #2). PRICING DISCIPLINE: no amount appears in
// this repo; the price is a Stripe Price referenced by STRIPE_PRICE_ID (rule 5b).
//
// When Stripe keys are absent the billing provider is a stub that returns
// `billing_not_configured`; this route then answers 503 so the UI can fall back
// to "we'll arrange the evaluation by email" instead of charging anyone.
//
// POST /api/hunter-network/checkout
//   body: { email, reference?, lang? }
//   200  { ok: true, url } | 503 { ok: false, reason: "billing_not_configured" }

import { NextResponse } from "next/server";
import { resolveBilling, BILLING_NOT_CONFIGURED } from "../../../hunter-network/_core/billing";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s<>@]{1,64}@[^\s<>@.]{1,63}(?:\.[^\s<>@.]{1,63})+$/;

export async function POST(request: Request) {
  let body: { email?: string; reference?: string; lang?: "en" | "es" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, reason: "validation" }, { status: 400 });
  }

  const billing = resolveBilling();
  const result = await billing.createAccessCheckout({ email, reference: body.reference, lang: body.lang });

  if (result.ok) return NextResponse.json({ ok: true, url: result.url, id: result.id });
  const status = result.reason === BILLING_NOT_CONFIGURED ? 503 : 502;
  return NextResponse.json({ ok: false, reason: result.reason }, { status });
}
