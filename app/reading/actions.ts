"use server";

import { Resend } from "resend";

export type ReadingInput = {
  email: string;
  role?: string;
  scale?: string;
  surface?: string;
  gap?: string;
  timing?: string;
  lang?: "en" | "es";
  _gotcha?: string;
};

export type ReadingResult =
  | { ok: true }
  | { ok: false; useMailto: true; reason: "no_backend" | "send_failed" }
  | { ok: false; useMailto: false; reason: "validation" | "honeypot" | "rate_limited" };

// Per-field caps. Mirrors /contact/actions.ts so the inbox-side
// hygiene is the same across both funnel doors.
const LIMITS = {
  email: 200,
  role: 80,
  scale: 80,
  surface: 80,
  gap: 600,
  timing: 80,
} as const;

const EMAIL_RE = /^[^\s<>@]{1,64}@[^\s<>@.]{1,63}(?:\.[^\s<>@.]{1,63})+$/;

const RECENT = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

function clean(value: string | undefined, max: number): string {
  if (!value) return "";
  return value
    .replace(/[ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanLong(value: string | undefined, max: number): string {
  if (!value) return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ --]/g, "")
    .slice(0, max);
}

export async function sendReading(data: ReadingInput): Promise<ReadingResult> {
  if (data._gotcha) return { ok: false, useMailto: false, reason: "honeypot" };

  const email = clean(data.email, LIMITS.email);
  const role = clean(data.role, LIMITS.role);
  const scale = clean(data.scale, LIMITS.scale);
  const surface = clean(data.surface, LIMITS.surface);
  const gap = cleanLong(data.gap, LIMITS.gap);
  const timing = clean(data.timing, LIMITS.timing);

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, useMailto: false, reason: "validation" };
  }

  // Rate limit per email — same shape as /contact
  const now = Date.now();
  for (const [k, t] of RECENT) {
    if (now - t > RATE_WINDOW_MS) RECENT.delete(k);
  }
  const fp = email;
  const hits = Array.from(RECENT.keys()).filter((k) => k.startsWith(fp + "|")).length;
  if (hits >= RATE_MAX) {
    return { ok: false, useMailto: false, reason: "rate_limited" };
  }
  RECENT.set(`${fp}|${now}`, now);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO ?? "studio@xnlab.io";

  if (!apiKey || !from) {
    return { ok: false, useMailto: true, reason: "no_backend" };
  }

  const subject = `XNLAB — Reading from ${email}`;
  const text = [
    `Email: ${email}`,
    role ? `Role: ${role}` : null,
    scale ? `Scale: ${scale}` : null,
    surface ? `Surface closest to the gap: ${surface}` : null,
    timing ? `Timing: ${timing}` : null,
    "",
    gap ? `The gap, in one line:\n${gap}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Auto-confirmation to the lead. Same atelier voice as the contact
  // ack. Failure here is not fatal — the studio already received the
  // reading, so we don't ask the lead to retry.
  const lang = data.lang === "es" ? "es" : "en";
  const ackSubject = lang === "es" ? "Lectura recibida — XNLAB" : "Reading received — XNLAB";
  const ackText =
    lang === "es"
      ? `Hola,\n\nEl estudio ha recibido tu lectura. La leemos en persona y respondemos cuando el trabajo apunta a un encaje. Habitualmente dentro de siete días.\n\nMientras tanto, el dossier MMXXVI queda abierto en xnlab.io/dossier.\n\n— XNLAB · MMXXVI`
      : `Hello,\n\nThe studio has received your reading. We read it in person and reply when the work suggests a fit. Usually within seven days.\n\nIn the meantime, the MMXXVI dossier is open at xnlab.io/dossier.\n\n— XNLAB · MMXXVI`;

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo: email,
    });
    if (error) {
      console.error("[reading] resend error", error);
      return { ok: false, useMailto: true, reason: "send_failed" };
    }

    try {
      await resend.emails.send({
        from,
        to: email,
        subject: ackSubject,
        text: ackText,
      });
    } catch (e) {
      console.error("[reading] ack send failed", e);
    }

    return { ok: true };
  } catch (e) {
    console.error("[reading] send exception", e);
    return { ok: false, useMailto: true, reason: "send_failed" };
  }
}
