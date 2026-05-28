// Re-encode the hero PNGs in place using sharp.
//
// Why: the source PNGs in /public/images/hero ship at 1–2 MB each.
// Next/Image serves optimized AVIF/WebP variants at request time, but
// the original blobs still travel through the build, the git history
// and any non-Next consumer. Compressing them once at the source cuts
// repo weight + first-time CDN warmup without losing quality.
//
// How: for each *.png we read the bytes, re-encode with a tuned palette
// + adaptive filter, write the result to a sibling `.optimized.png`
// for review, and report the byte delta. Nothing is overwritten until
// you run with `--apply`.
//
// Run:
//   node scripts/reencode-hero.mjs           # dry run, writes .optimized.png siblings
//   node scripts/reencode-hero.mjs --apply   # overwrites the originals
//
// Requires sharp (already a transitive dep via next, present in
// node_modules; if not, `npm i -D sharp`).

import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const HERO_DIR = join(HERE, "..", "public", "images", "hero");
const APPLY = process.argv.includes("--apply");

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function reencode(file) {
  const src = join(HERO_DIR, file);
  const tmp = `${src}.optimized.png`;
  const before = (await stat(src)).size;

  // PNG settings tuned for the hero PNGs:
  // - quality 82 trades 0–3% perceptual quality for ~30–60% size.
  // - compressionLevel 9 = max zlib pass.
  // - effort 10 = slowest, smallest. We run this offline once.
  // - palette: true converts to indexed PNG when possible (8-bit).
  //   For the hero PNGs (chrome / orbs / haze) the gradients are
  //   broad enough to survive indexing; if you see banding on a
  //   specific file, drop palette and re-run with --apply.
  // - adaptiveFiltering: true picks the best per-row filter.
  await sharp(src)
    .png({
      quality: 82,
      compressionLevel: 9,
      effort: 10,
      palette: true,
      adaptiveFiltering: true,
    })
    .toFile(tmp);

  const after = (await stat(tmp)).size;
  const delta = before - after;
  const pct = ((delta / before) * 100).toFixed(1);
  const arrow = delta > 0 ? "↓" : "↑";

  if (APPLY) {
    if (after < before) {
      await rename(tmp, src);
      console.log(`  ${file.padEnd(36)} ${formatBytes(before)} → ${formatBytes(after)}  ${arrow} ${pct}%  (applied)`);
    } else {
      await unlink(tmp);
      console.log(`  ${file.padEnd(36)} no gain, kept original`);
    }
  } else {
    console.log(`  ${file.padEnd(36)} ${formatBytes(before)} → ${formatBytes(after)}  ${arrow} ${pct}%  → ${tmp.split("/").pop()}`);
  }
}

async function main() {
  console.log(`\nReencoding hero PNGs in ${HERO_DIR}`);
  console.log(APPLY ? "Mode: APPLY (originals will be overwritten)\n" : "Mode: DRY RUN (writes *.optimized.png siblings)\n");

  const files = (await readdir(HERO_DIR))
    .filter((f) => f.endsWith(".png") && !f.endsWith(".optimized.png"))
    .sort();

  if (!files.length) {
    console.log("  no PNGs found.");
    return;
  }

  for (const f of files) {
    try {
      await reencode(f);
    } catch (e) {
      console.error(`  ${f}: ERROR ${e?.message ?? e}`);
    }
  }
  console.log("\nDone.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
