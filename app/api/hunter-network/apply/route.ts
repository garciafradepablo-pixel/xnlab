// REST endpoint for hunter applications.
//
// The public page posts through a server action; this route exposes the SAME
// logic as a plain JSON API so the internal member portal (Javi's app) or any
// other trusted client can submit candidates too. One validation path, two
// front doors. No new business logic lives here.
//
// POST /api/hunter-network/apply
//   body: { name, email, whatsapp?, country?, markets, experience, lang? }
//   200  { ok: true } | 4xx { ok: false, reason }

import { NextResponse } from "next/server";
import { applyToHunterNetwork, type HunterApplicationInput } from "../../../hunter-network/actions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Partial<HunterApplicationInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const result = await applyToHunterNetwork({
    name: body.name ?? "",
    email: body.email ?? "",
    whatsapp: body.whatsapp,
    country: body.country,
    markets: body.markets ?? "",
    experience: body.experience ?? "",
    lang: body.lang,
    _gotcha: body._gotcha,
  });

  if (result.ok) return NextResponse.json({ ok: true });
  // no_backend means email isn't configured server-side; surface as 503 so a
  // programmatic caller can distinguish "we're not wired" from "you sent junk".
  const status = !result.useMailto && result.reason === "rate_limited" ? 429 : !result.useMailto ? 400 : 503;
  return NextResponse.json(result, { status });
}
