"use server";

import { Resend } from "resend";

export type ContactInput = {
  name: string;
  email: string;
  brand?: string;
  website?: string;
  world?: string;
  budget?: string;
  msg: string;
  _gotcha?: string;
};

export type ContactResult =
  | { ok: true }
  | { ok: false; useMailto: true; reason: "no_backend" | "send_failed" }
  | { ok: false; useMailto: false; reason: "validation" | "honeypot" };

// Server-side contact submission. Uses Resend when configured, otherwise asks
// the client to fall back to a mailto: draft. Quietly drops bot submissions.
export async function sendContactEmail(data: ContactInput): Promise<ContactResult> {
  // Honeypot — bots fill every visible field including hidden ones
  if (data._gotcha) return { ok: false, useMailto: false, reason: "honeypot" };

  if (!data.email || !data.msg) {
    return { ok: false, useMailto: false, reason: "validation" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO ?? "studio@xnlab.io";

  // No backend configured — client should compose a mailto: instead
  if (!apiKey || !from) {
    return { ok: false, useMailto: true, reason: "no_backend" };
  }

  const subject = `XNLAB Transmission — ${data.world || "General"} — ${data.name || "Unknown"}`;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.brand ? `Brand / Project: ${data.brand}` : null,
    data.website ? `Website / Instagram: ${data.website}` : null,
    `World: ${data.world || "—"}`,
    data.budget ? `Budget: ${data.budget}` : null,
    "",
    data.msg,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo: data.email,
    });
    if (error) {
      console.error("[contact] resend error", error);
      return { ok: false, useMailto: true, reason: "send_failed" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[contact] send exception", e);
    return { ok: false, useMailto: true, reason: "send_failed" };
  }
}
