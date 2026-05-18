"use server";

import { Resend } from "resend";

export type DossierInput = {
  email: string;
  lang: "en" | "es";
};

export type DossierResult =
  | { ok: true }
  | { ok: false; reason: "validation" | "rate_limited" | "send_failed" };

// Strict but pragmatic email regex. Rejects obviously malformed addresses
// and anything carrying CR/LF (header injection vector for Reply-To).
const EMAIL_RE = /^[^\s<>@]{1,64}@[^\s<>@.]{1,63}(?:\.[^\s<>@.]{1,63})+$/;

// In-memory rate limit. Keyed by email alone since the dossier request is
// always the same shape. Three requests per minute is enough to allow a
// retry after a network glitch while shutting down enumeration loops.
const RECENT = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

function pruneAndCount(key: string, now: number): number {
  const arr = RECENT.get(key) ?? [];
  const kept = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (kept.length === 0) {
    RECENT.delete(key);
  } else {
    RECENT.set(key, kept);
  }
  return kept.length;
}

const COPY = {
  en: {
    subject: "Your XNLAB studio dossier",
    body: (url: string) => `The studio dossier is open at ${url}.

This message is the studio's record that you have it. We do not send a newsletter. studio@xnlab.io receives a copy of every request and replies personally when the work suggests a fit.

— XNLAB · MMXXVI`,
  },
  es: {
    subject: "Tu dossier del estudio XNLAB",
    body: (url: string) => `El dossier del estudio queda abierto en ${url}.

Este mensaje es la constancia del estudio de que lo tienes. No enviamos newsletter. studio@xnlab.io recibe una copia de cada petición y responde en persona cuando el trabajo apunta a un encaje.

— XNLAB · MMXXVI`,
  },
} as const;

const SITE = "https://xnlab.io";

// Server-side dossier request. Two-message flow:
//   1. Notify the studio inbox so a real human sees the lead.
//   2. Confirm to the lead with the URL of the now-unlocked dossier.
// If a Resend Audience is configured, also adds the contact.
export async function requestDossier(data: DossierInput): Promise<DossierResult> {
  const raw = (data.email ?? "").trim().toLowerCase();
  const email = raw.slice(0, 200);
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, reason: "validation" };
  }

  const now = Date.now();
  if (pruneAndCount(email, now) >= RATE_MAX) {
    return { ok: false, reason: "rate_limited" };
  }
  const arr = RECENT.get(email) ?? [];
  arr.push(now);
  RECENT.set(email, arr);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO ?? "studio@xnlab.io";
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Without Resend configured, treat as success: the visitor still gets
  // the dossier (which is rendered client-side after this returns ok).
  // The studio cannot be notified, but the gate is not a security
  // boundary — it is a soft-conversion courtesy.
  if (!apiKey || !from) {
    return { ok: true };
  }

  const lang = data.lang === "es" ? "es" : "en";
  const dossierUrl = `${SITE}/dossier`;
  const copy = COPY[lang];

  try {
    const resend = new Resend(apiKey);

    // Notify the studio with the lead's email. Reply-To set so the
    // studio can reply directly from their inbox if they want to.
    await resend.emails.send({
      from,
      to,
      subject: `XNLAB — Dossier requested · ${email}`,
      text: [
        `Dossier request received.`,
        ``,
        `Email: ${email}`,
        `Language: ${lang.toUpperCase()}`,
        `Source: ${dossierUrl}`,
        `Time: ${new Date(now).toISOString()}`,
      ].join("\n"),
      replyTo: email,
    });

    // Confirmation to the requester. Quiet, single line, no marketing
    // language. The dossier itself does the work — this just confirms
    // arrival and gives the URL for return visits.
    await resend.emails.send({
      from,
      to: email,
      subject: copy.subject,
      text: copy.body(dossierUrl),
    });

    // Optional contact-list integration. If the studio has set up a
    // Resend Audience, every requester is appended. Failure here is
    // not fatal — the dossier is already delivered.
    if (audienceId) {
      try {
        await resend.contacts.create({
          email,
          unsubscribed: false,
          audienceId,
        });
      } catch (e) {
        console.error("[dossier] audience append failed", e);
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("[dossier] send exception", e);
    return { ok: false, reason: "send_failed" };
  }
}
