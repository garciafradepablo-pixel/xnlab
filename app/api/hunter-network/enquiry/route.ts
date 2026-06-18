// REST endpoint for company (demand-side) enquiries. Mirrors the server action.
//
// POST /api/hunter-network/enquiry
//   body: { company, name, email, market, offer, lang? }
//   200  { ok: true } | 4xx/503 { ok: false, reason }

import { NextResponse } from "next/server";
import { enquireAsCompany, type CompanyEnquiryInput } from "../../../hunter-network/actions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Partial<CompanyEnquiryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const result = await enquireAsCompany({
    company: body.company ?? "",
    name: body.name ?? "",
    email: body.email ?? "",
    market: body.market ?? "",
    offer: body.offer ?? "",
    lang: body.lang,
    _gotcha: body._gotcha,
  });

  if (result.ok) return NextResponse.json({ ok: true });
  const status = !result.useMailto && result.reason === "rate_limited" ? 429 : !result.useMailto ? 400 : 503;
  return NextResponse.json(result, { status });
}
