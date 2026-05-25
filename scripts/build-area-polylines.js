#!/usr/bin/env node
/* =========================================================================
   Build per-area polyline JS files for lazy loading.

   Reads:  ../../data/local_polylines.json   (single 4.3 MB FeatureCollection)
   Writes: ../data/area-polylines/<area-id>.js   (one tiny file per area)
           ../data/area-mileage.js               (map of area_id → total miles)

   Run from repo root:   node scripts/build-area-polylines.js
   ========================================================================= */
"use strict";
const fs   = require("fs");
const path = require("path");

const SRC_POLY = path.resolve(__dirname, "../../data/local_polylines.json");
const OUT_DIR  = path.resolve(__dirname, "../data/area-polylines");
const OUT_MILES= path.resolve(__dirname, "../data/area-mileage.js");

if (!fs.existsSync(SRC_POLY)) {
  // Try the repo-root path used in the worktree
  console.error("Source not found:", SRC_POLY);
  process.exit(1);
}

console.log("Reading", SRC_POLY);
const fc = JSON.parse(fs.readFileSync(SRC_POLY, "utf8"));
console.log("Features:", fc.features.length);

// Group by area_id
const byArea = new Map();
for (const f of fc.features) {
  const aid = f.properties && f.properties.area_id;
  if (!aid) continue;
  if (!byArea.has(aid)) byArea.set(aid, []);
  byArea.get(aid).push(f);
}
console.log("Distinct area_ids:", byArea.size);

// Wipe + recreate output dir
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const mileage = {};
let totalBytes = 0;
for (const [aid, features] of byArea) {
  const fcPart = { type: "FeatureCollection", features };
  const content = `window.__WGHC_AREA_POLY__ && window.__WGHC_AREA_POLY__(${JSON.stringify({ id: aid, fc: fcPart })});\n`;
  const outPath = path.join(OUT_DIR, aid + ".js");
  fs.writeFileSync(outPath, content);
  totalBytes += content.length;

  // Total length_miles
  let miles = 0;
  for (const f of features) {
    miles += (f.properties && f.properties.length_miles) || 0;
  }
  mileage[aid] = Math.round(miles * 100) / 100;
}

fs.writeFileSync(OUT_MILES, "window.WGHC_AREA_MILEAGE = " + JSON.stringify(mileage) + ";\n");

console.log(`\nWrote ${byArea.size} per-area files (${(totalBytes/1024).toFixed(1)} KB total).`);
console.log(`Wrote mileage map: ${(fs.statSync(OUT_MILES).size/1024).toFixed(1)} KB`);
console.log(`\nDone.`);
