# Opportunity System Logic

The complete reasoning model behind the 01 Agency / XN LAB Opportunity
Intelligence System: its philosophy, the ten filters, the evidence discipline,
the scoring math, and the classification rules. This is the document an analyst
or engineer reads to understand *why* a lead scored the way it did — and to
defend that score to Pablo or Javi.

---

## 1. Philosophy

**Do not search for companies. Search for moments.**

A company is only interesting if there is evidence it is entering a new phase
*and* its current brand / website / systems / positioning / communication /
funnel / digital presence is not strong enough to support that next phase.

Three principles govern everything below:

1. **Conservative by default.** 80% conservative judgement, 20% aggressive
   pattern detection. When uncertain, downgrade. Never optimistic without
   evidence.
2. **Evidence or silence.** Every conclusion is backed by cited evidence. No
   evidence = do not claim it.
3. **Defensibility.** Every score exposes what raises and lowers it. A
   recommendation you can only defend on taste is suspect.

The system should feel like a cold, elite creative strategist — not a hype
machine, not a generic lead generator.

---

## 2. The evidence hierarchy

Evidence is the currency. Its quantity maps to a confidence vocabulary:

| Evidence points | Verdict |
|---|---|
| 1 | intuition |
| 2 | possibility |
| 3 | hypothesis |
| 5+ | strong opportunity |

**Hard rule:** every shortlisted opportunity must carry **at least 3 concrete
evidence points**. Fewer than three caps Evidence Strength at 40 and makes the
lead ineligible for the shortlist, no matter how green its signals look. This is
why two demo rows (an early-stage SaaS, an EdTech) are deliberately held back:
they are *possibilities*, not *hypotheses*.

Each individual evidence point also carries a **tier** (how load-bearing it is):

| Tier | Meaning |
|---|---|
| 1 | weak / circumstantial |
| 2 | solid / corroborating |
| 3 | strong / load-bearing (e.g. a dated press release of an expansion) |

---

## 3. The ten filters

Every candidate is evaluated against ten mandatory filters, each resolved to a
**signal colour**. Order = the order an analyst should reason in.

| # | Filter | Weight | The question |
|---|---|---|---|
| 1 | Transition signal | 0.14 | Is the company entering a new stage? |
| 2 | Economic capacity | 0.13 | Can they pay €1,500–€5,000 without suffering? |
| 3 | Visible tension | 0.13 | Mismatch between trajectory and what they communicate? |
| 4 | Actionable lever | 0.10 | Can 01/XN name one clear first move? |
| 5 | Active pain signal | 0.11 | Is the problem active *now*? |
| 6 | Why now | 0.10 | Why call this week specifically? |
| 7 | Reachable decision maker | 0.09 | Can we reach someone who can say yes? |
| 8 | Budget priority | 0.08 | Important enough to move budget soon? |
| 9 | Strategic fit | 0.07 | The kind of company 01/XN should work with? |
| 10 | Brutal final filter | 0.05 | If we could only call 3 tomorrow — still in? |

Weights sum to 1.00. The full "what increases / what decreases" text for each
filter lives in `models.js` and is surfaced in the UI on hover.

### Signal colours

| Colour | Meaning | Conservative value | Aggressive value |
|---|---|---|---|
| 🟢 Green | strong evidence in favour | 1.00 | 1.00 |
| 🟡 Yellow | partial / circumstantial | 0.45 | 0.65 |
| ⚪ Grey | insufficient data | **0.20** | 0.50 |
| 🔴 Red | negative or missing requirement | 0.00 | 0.05 |

The crucial choice: **grey is low**, not neutral. "We don't know" defaults
toward "probably not". The conservative and aggressive readings are blended by
the conservatism dial (default 80% conservative):

```
value(level) = conservative(level) · k  +  aggressive(level) · (1 − k)
where k = conservatism (default 0.8)
```

---

## 4. Flag rules (discard logic)

Counting colours across the ten filters drives hard outcomes:

- **4+ red flags → discard.** Confidence is capped at 25.
- **3 red flags →** keep *only* if Economic Potential is "very high"; otherwise
  discard. Confidence capped at 44.
- **0–2 red flags →** valid candidate.
- **8+ green →** high-priority territory.
- **10 green →** immediate-call territory.
- **Unclear → downgrade.** Never inflate.

---

## 5. The scores

All scores are 0–100 unless noted. Each is computed by a pure function in
`scoring.js` and each has a built-in explainer (shown in the UI).

### Opportunity Confidence
Weighted sum of the ten filters' blended values, ×100, then the flag caps
above are applied.
**▲ up:** more green on high-weight filters (transition, capacity, tension).
**▼ down:** red/grey filters; any red flag lowers the ceiling.

### Evidence Strength
Balances **depth** and **breadth** so neither alone saturates the score:
```
depth   = (Σ evidence tiers / 20) · 60
breadth = (distinct filters with evidence / 10) · 40
strength = depth + breadth          (capped 0–100; <3 points ⇒ ≤40)
```
**▲ up:** more load-bearing evidence spread across *multiple* filters.
**▼ down:** few points, weak sources, or all evidence piled on one filter.

### Conversation Probability
How likely we get a real conversation:
```
core = 0.40·reachableDM + 0.25·activePain + 0.20·whyNow + 0.15·transition
conversation = core · 100 · (0.6 + 0.4 · confidence/100)
```
Damped by overall confidence so a reachable contact on a weak lead doesn't
inflate the odds.

### Meeting Probability
A meeting is a subset of a conversation, so it can **never exceed** it:
```
f = 0.40·tension + 0.35·budgetPriority + 0.25·lever
meeting = conversation · (0.4 + 0.6 · f)
```

### Closing Potential
```
core = 0.30·capacity + 0.25·budget + 0.20·fit + 0.15·tension + 0.10·brutal
closing = core · 100 · (0.55 + 0.45 · confidence/100) − 6·redCount
```

### Economic Potential — `low / medium / high / very high`
- **very high:** capacity green, closing ≥ 70, budget not red
- **high:** capacity green, or (yellow + closing ≥ 60)
- **medium:** capacity yellow/grey
- **low:** otherwise

---

## 6. Classification — 01 / XN LAB / discard

`discard` when: 4+ reds, OR strategic-fit is red, OR confidence below the
minimum, OR 3 reds without very-high economics.

For survivors, the **01-vs-XN split is about engagement scope, not merely
ability to pay.** XN LAB is the higher-ticket transformation lab. A lead is
classified **XN LAB** only when *all three* hold:

1. the scoped first move is itself **XN-tier** (an €8k+ transformation, per the
   offer ladder), **and**
2. Economic Potential is **very high**, **and**
3. confidence ≥ the configured **01 → XN threshold** (default 68).

Otherwise it is an **01 Agency** opportunity. In practice this keeps XN rare —
e.g. a property developer launching branded residences, a freshly-funded
scale-up, or a fashion atelier having an international moment — while clinics,
hotels and physios route to 01 with €1,500–€5,000 engagements.

### Final recommendation
- **Call immediately** — confidence ≥ 76, evidence ≥ 55, conversation ≥ 55, ≤1 red.
- **Prepare custom mini-audit first** — confidence ≥ 60 but not yet
  call-ready (often evidence breadth is thin, so a mini-audit manufactures the
  hook).
- **Keep as secondary** — confidence ≥ minimum but below the above.
- **Discard** — fails the gates.

---

## 7. The funnel

```
discovered → enriched → filtered → scored → shortlisted → final Top N
```

- **discovered:** raw candidate pool (target ~1,000).
- **enriched:** adapters attach cited evidence, signal hints, contact fields.
- **filtered:** anything classified `discard` is dropped.
- **scored:** every survivor carries the full score object.
- **shortlisted:** eligible (≥3 evidence, <4 reds, not discard) **and** above
  the minimum confidence threshold.
- **final:** the shortlist, ranked, truncated to the configured count.

**Ranking sort (deliberately conservative):** shortlist-eligible first → higher
confidence → higher *evidence strength* (ties broken by proof, not optimism) →
higher closing potential → fewer red flags.

The final ranking does **not** keep a per-sector quota. All companies compete
together; the Top N is by opportunity quality.

---

## 8. The opportunity card

Each final lead renders a full card (the format Pablo/Javi act on):

identity + contacts · classification + recommendation · the six scores (each
with an explainer) · the ten signal chips · executive summary · main hypothesis
(*"This company is likely losing / underusing / delaying ___ because it has not
yet solved ___."*) · evidence with sources · detected tensions · why now · why
this company before others · what they're probably not seeing · first lever +
suggested offer · call opening · most likely objection + recommended response ·
reasons NOT to call (devil's advocate) · what would invalidate the thesis.

---

## 9. The learning loop

After each call, an outcome is logged: result, objection raised, what worked,
what failed, whether the hypothesis was correct, and the next action. The loop
reports:

- **hypothesis accuracy** (were our theses right?),
- **meeting rate by classification** (do 01 vs XN leads convert as expected?),
- **most common objections**, and
- **calibration notes** (e.g. "hypothesis accuracy below 50% — tighten evidence
  requirements before shortlisting").

### Calibration (the loop feeds back into scoring)

The loop is no longer only advisory — it **adjusts the filter weights**, under
strict guardrails (`calibration.js`):

- For each filter, it measures whether a **green** signal there predicts a good
  call (reached *interested*/*meeting*) versus the base success rate. Green that
  beats the base rate bumps that filter's weight; green that underperforms trims
  it. Neutral outcomes (*no answer*, *called*, *follow-up*) carry no verdict and
  are ignored.
- **Guardrails:** inactive below **6** decisive outcomes; a filter needs **≥3**
  green observations to move; each nudge is hard-capped at **±15%**; the effect
  is scaled by how much data backs it. Weights are then **renormalised** to sum
  to 1.0, so calibration shifts the *balance* between filters, never the overall
  scale — scores stay comparable, and a noisy first week can't distort the model.
- Each logged outcome stores the lead's **signal snapshot at call time**, so the
  calibration is reproducible even if the dataset later changes.

The conservative posture extends to the system's view of itself: it learns in
small, bounded, explainable steps, and the Learning tab shows exactly which
filters moved and why.

### Portability

State (status, notes, outcomes) lives in `localStorage`, so it is per-browser.
`store.exportState()` / `importState()` make it a shareable JSON file: one caller
exports after a session, another imports, and the merged log recalibrates the
scoring both of them see. Import is non-destructive — outcomes de-duplicate and
tracking records merge newest-wins.

---

## 10. Tensions catalogue

The mismatches the system looks for (filter #3):

- Growth vs structure
- Product/service quality vs perception
- Expansion vs systems
- Premium price vs communication
- Visibility vs conversion
- Founder ambition vs brand maturity

No tension = no opportunity.

---

## 11. The offer ladder (internal)

| Key | Offer | Price | Owner |
|---|---|---|---|
| `audit` | 01 Brand/Web Audit | €1,500 | 01 |
| `reposition` | 01 Repositioning + Landing Page | €3,000 | 01 |
| `web_funnel` | 01 Web + Funnel + Automation | €5,000 | 01 |
| `xn_transformation` | XN LAB Strategic Transformation | €8,000+ | XN LAB |

The scoped offer doubles as the **scope signal** for the 01/XN classification
(§6). Prices are internal — they appear in this tool and its exports, never on a
public surface.
