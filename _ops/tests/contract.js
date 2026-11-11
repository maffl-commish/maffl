#!/usr/bin/env node
// REEL data contract (pre-launch review F8): the app (lab/index.html) reads these data literals and classes out of the
// classic pages at runtime. Renaming one breaks the app with no warning, so this check fails loudly instead.
//   node _ops/tests/contract.js            # checks the repo it sits in; exit 1 on any break
// Runs in .github/workflows/backend-check.yml (every push/PR touching these pages), pulse-draft.yml (before the
// robot merges) and credit-sync.yml (before it commits). Add a line here whenever the app starts reading something new.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = process.argv[2] || path.resolve(__dirname, "../..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
function extract(src, marker) { // same scanner the app uses (lab/index.html extract())
  const i = src.indexOf(marker); if (i < 0) return undefined;
  const k = i + marker.length, open = src[k], close = open === "[" ? "]" : "}"; let d = 0, j = k;
  for (; j < src.length; j++) { if (src[j] === open) d++; if (src[j] === close) { d--; if (!d) break; } }
  return new Function("return " + src.slice(k, j + 1))();
}
const bad = [];
function check(file, what, fn) {
  try { const r = fn(read(file)); if (r !== true) bad.push(`${file}: ${what}: ${r || "failed"}`); }
  catch (e) { bad.push(`${file}: ${what}: ${e.message}`); }
}
const hasKeys = (o, keys) => { const miss = keys.filter((k) => !(o && k in o)); return miss.length ? "missing " + miss.join(", ") : true; };

check("weekly.html", "const WEEKS", (s) => {
  const W = extract(s, "const WEEKS = "); if (!Array.isArray(W) || !W.length) return "not found or empty";
  const L = W.slice().sort((a, b) => a.weekNumber - b.weekNumber).pop();
  const k = hasKeys(L, ["weekNumber", "upperTier", "lowerTier"]); if (k !== true) return "latest week " + k;
  const t = Object.values(L.upperTier)[0][0] || L.lowerTier[0];
  return hasKeys(t, ["team", "owner", "w", "l", "points", "credits"]);
});
check("weekly.html", "const SHORT_NAMES", (s) => { const o = extract(s, "const SHORT_NAMES = "); return o && typeof o === "object" && Object.keys(o).length ? true : "not found or empty"; });
check("credits.html", "const REGISTRY_DATA", (s) => {
  const R = extract(s, "const REGISTRY_DATA = "); if (!Array.isArray(R) || !R.length) return "not found or empty";
  return hasKeys(R[0], ["owner", "amount", "approved", "notes"]);
});
check("prize.html", "const MAFFL", (s) => {
  const P = extract(s, "const MAFFL = "); const k = hasKeys(P, ["prize_events", "dues_seasons", "meta"]); if (k !== true) return k;
  return Array.isArray(P.prize_events) && P.prize_events.length && hasKeys(P.prize_events[0], ["owner", "amount", "year"]) === true && "data_start" in P.meta ? true : "prize_events / meta.data_start shape changed";
});
check("power-rankings.html", "const OWNERS_DATA", (s) => {
  const O = extract(s, "const OWNERS_DATA = "); if (!Array.isArray(O) || !O.length) return "not found or empty";
  return hasKeys(O[0], ["key", "name", "ovr"]);
});
check("rules.html", ".rule-section / .rule-title / .rule-body", (s) => {
  const n = (c) => (s.match(new RegExp('class="[^"]*\\b' + c + '\\b', "g")) || []).length;
  const a = n("rule-section"), b = n("rule-title"), c = n("rule-body");
  return a > 0 && b >= a && c >= a ? true : `sections ${a}, titles ${b}, bodies ${c}`;
});
check("rivalry.html", "?embed=1 mode", (s) => /embed/.test(s) ? true : "no embed handling found");

if (bad.length) { console.log("❌ REEL data contract broken (the app would fail to load or show blanks):\n- " + bad.join("\n- ")); process.exit(1); }
console.log("✅ REEL data contract OK (weekly, credits, prize, power-rankings, rules, rivalry)");
