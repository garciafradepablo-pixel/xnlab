#!/usr/bin/env node
// =============================================================================
// bin/run.mjs — Headless pipeline runner.
//
// Generates the ranked Top-N and writes CSV / JSON / call-sheet to disk, so the
// list can be produced on a schedule (cron) without opening the UI. This is the
// "wake up with 20 companies to call" automation path.
//
// Usage:
//   node bin/run.mjs [--final N] [--conservatism 0..1] [--min-score N]
//                    [--out DIR] [--enrich] [--quiet]
//
// Examples:
//   node bin/run.mjs                       # Top 20 from the seed, exports to ./out
//   node bin/run.mjs --final 10 --out /tmp/leads
//   node bin/run.mjs --enrich              # also run live adapters (needs network)
//   node bin/run.mjs --dataset researched  # use the real, cited Spanish leads
// =============================================================================

import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { runPipeline } from "../src/pipeline.js";
import { defaultAdapters, liveAdapters } from "../src/enrichment.js";
import { toCSV, toJSON, toCallSheet } from "../src/export.js";
import { DEFAULT_CONFIG, CLASSIFICATIONS, RECOMMENDATIONS } from "../src/models.js";
import SEED from "../src/seed.js";
import RESEARCHED from "../src/data/researched.js";

// --- tiny arg parser ---------------------------------------------------------
function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--")) {
      const key = t.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) a[key] = true;
      else { a[key] = next; i++; }
    } else a._.push(t);
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const config = {
  ...DEFAULT_CONFIG,
  finalCount: args.final ? +args.final : DEFAULT_CONFIG.finalCount,
  conservatism: args.conservatism != null && args.conservatism !== true ? +args.conservatism : DEFAULT_CONFIG.conservatism,
  minScore: args["min-score"] ? +args["min-score"] : DEFAULT_CONFIG.minScore,
};
const outDir = resolve(args.out && args.out !== true ? args.out : "out");
const adapters = args.enrich ? liveAdapters() : defaultAdapters();
const quiet = !!args.quiet;

// --dataset researched|demo (default demo). Researched = real, cited Spanish leads.
const datasetName = args.dataset === "researched" ? "researched" : "demo";
const candidates = datasetName === "researched" ? RESEARCHED : SEED;

const res = await runPipeline(candidates, config, adapters);
const tracking = {}; // headless: no stored tracking

mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const files = {
  [`opportunities-${stamp}.csv`]: toCSV(res.final, tracking),
  [`opportunities-${stamp}.json`]: toJSON(res.final, tracking),
  [`call-sheet-${stamp}.txt`]: toCallSheet(res.final),
};
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(outDir, name), content, "utf8");
}

if (!quiet) {
  const c = res.counts;
  console.log(`\n01 · XN LAB — Opportunity Intelligence (headless run)`);
  console.log(`pool ${config.candidateVolume} · scored ${c.scored} · filtered ${c.filtered} · shortlisted ${c.shortlisted} · final ${c.final}`);
  console.log(`dataset ${datasetName} · conservatism ${Math.round(config.conservatism * 100)}% · min score ${config.minScore} · adapters ${args.enrich ? "LIVE" : "demo(offline)"}\n`);
  console.log("RNK  CLS  CONF  EVID  CLOSE  RECOMMENDATION      COMPANY");
  console.log("-".repeat(76));
  for (const o of res.final) {
    const s = o.scores;
    const cls = (s.classification === "xn" ? "XN" : s.classification === "01" ? "01" : "--").padEnd(3);
    console.log(
      `${String(o.ranking).padStart(3)}  ${cls}  ${String(s.confidence).padStart(4)}  ${String(s.evidence).padStart(4)}  ${String(s.closing).padStart(5)}  ${RECOMMENDATIONS[s.recommendation].padEnd(18)}  ${o.company}`
    );
  }
  console.log(`\nWrote ${Object.keys(files).length} files to ${outDir}`);
}
