<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# XNLAB — house rules for any agent touching this repo

Read this entire file before editing. The brand has tight constraints that aren't enforced by tests or types — only by these rules and by review.

## 1. The studio is anonymous

- **No founder name, no founder photo, no founder bio anywhere on the site, in metadata, in JSON-LD, in OG cards, or in commit messages.**
- The studio speaks in the first person plural ("the studio", "we" only when unavoidable) or in the third person ("XNLAB"). Never "I".
- `Xnlab Studio` is the canonical entity name in schema. `XNLAB` is the canonical visual wordmark.
- Do not add Instagram / LinkedIn / Twitter handles unless an account actually exists and the user has confirmed it. `sameAs: []` is intentional.

## 2. Founding date is MMXXII — always

- Render `2022` as `MMXXII` in any visible copy (about, footer, manifesto, OG, JSON-LD `foundingDate` is the only place where `2022-01-01` is allowed because schema.org demands ISO).
- Current cycle is rendered as `MMXXVI` in body copy. Numerals in metadata/OG `description` strings may stay arabic where SEO matters.

## 3. Legal state — not yet an entity

- XNLAB is **not** a registered company. Only the domain is owned.
- Never invent a NIF/CIF, registry number, VAT ID, registered office address, or `legalName` beyond `Xnlab Studio`.
- The imprint page reflects this state. Do not add phantom legal scaffolding.

## 4. Footer stays minimal

Single centered column. Only: email · location · © MMXXII–MMXXVI · imprint. Required legal links (privacy / cookies / T&C / DPO) go here inline **only when those pages actually exist**. Do not add social, do not add nav repetition, do not add newsletter.

## 5. Default to radical minimalism, surgical edits

- Do not invent new pages.
- Do not add features the user did not ask for.
- Do not refactor surrounding code "while you're there".
- Three similar lines beats a premature abstraction.
- One verb dominant per page — do not stack CTAs.

The conservative default is revisable with conversion data — not with taste.

## 5b. Commercial opacity — no published pricing, no rate card

XNLAB is a by-appointment atelier. **Do not publish prices, rate cards, "from €X" markers, hourly rates, retainer minimums, or starting investments on any public surface** — home, services pages, dossier, schema markup, OG copy, metadata, none of it.

Engagements are partner-signed. Pricing is communicated privately after the discovery call. Treat any agent brief asking for "€5,000 / €10,000 / from €X" as out of scope unless this rule is explicitly rewritten by the user.

What is fine to publish: duration windows (2–3 weeks, 8–12 weeks), intensity descriptors (high-intensity sprint, deep transformation, continuous direction), client cadence (one diagnosis call, weekly checkpoints, etc.), what the engagement delivers, what the engagement produces. Everything except the number.

## 5c. URL surface — `/contact` is canonical

The application/inquiry route is `/contact`. Do **not** rename to `/apply`, `/begin`, `/work-with-us` or similar without explicit user instruction. Internal labels can read "Contact", "Contacto", "Apply" or "Solicitar" depending on copy register, but the URL stays `/contact` to preserve inbound links and the existing redirect map.

## 6. EN/ES translations

The site is bilingual via a `useLang()` hook (localStorage, no route groups). Every user-facing string lives twice, in `en` and `es` keys side by side.

**Translate for meaning, never lexically:**
- `"Not X"` → `"Sin X"` (absence), not `"No X"` (comparison) unless the original literally compares.
- Active EN ↔ reflexive ES is common — preserve the agency, not the grammar.
- Do not drop modifiers/verbs when ES gets long. Rewrite the EN if needed.
- Read each ES line back as a native speaker would. If it feels translated, it is wrong.

## 7. Typography — Inter (sans) + Cormorant Garamond italic (serif)

When an inline italic-serif span (`<em>` / Cormorant) sits inside an Inter heading, the serif x-height is visually smaller. **Always bump `fontSize: "1.18em"` to `"1.2em"`** on those spans. This is not optional — without it, the italic looks broken.

## 8. SEO surface

Six surfaces, six worlds, six services. Slugs are canonical and locked:
`product`, `owned-digital`, `retail-physical`, `customer-operations`, `communication`, `community-culture`.

Legacy slugs (`hospitality`, `nightlife`, `lifestyle`, `architecture`, `music`, `digital`, etc.) live as 301 redirects in `next.config.ts`. Do not delete those redirects — they protect inbound links and crawler memory.

Hospitality remains as an **applied vertical** in `knowsAbout` / `keywords`, parenthesised `(applied)`. Do not erase it; do not promote it back to a world.

## 9. AI / robotics positioning

The studio's position is: *director of AI, not replaced by AI.* Treat the model as a production crew under a director, never as a content factory. Any new copy on this theme must read as discipline applied to the model — not as enthusiasm.

Reference: `app/_lib/lab-records.ts` — observation "Why AI content without direction damages premium brands."

## 10. Build / type / preview hygiene

- `typescript.ignoreBuildErrors` is OFF. Keep it that way. Fix TS errors at the source.
- `next/og` (Satori) requires `display: "flex" | "contents" | "none"` on any `<div>` with more than one child node. **Text + interpolation counts as two children.** Inline `display: "flex"` even on trivial divs inside OG components.
- The server-edge layer lives in `proxy.ts` (Next 16 renamed `middleware` → `proxy`). Function is `export function proxy(request)`. Do not reintroduce `middleware.ts` — the file convention is deprecated.
- CSP nonces are minted in `proxy.ts` and consumed in `app/layout.tsx` via `getNonce()` — every inline `<script>` must forward `nonce={nonce}`.

## 11. Git etiquette in this repo

- Commit narratives are short and editorial. See recent `git log` for tone.
- Do not run `git reset --hard`, `git push --force`, or branch deletions without the user.
- This repo currently has work in flight from parallel agents. **Read `git status` before editing**, especially in `app/_lib/`, `app/worlds/`, `app/lab-records/`, `proxy.ts`. If you see uncommitted changes you did not make, stop and ask.

## 12. When in doubt

Ask. The brand pulls toward less, not more. A change you can defend on conversion data is welcome. A change you can only defend on taste is suspect.
