/**
 * MAFFL REEL lab — local mock of the Apps Script backend.
 *
 * Instead of re-implementing every action, this runs the REAL backend source (_ops/apps-script/logic.js + daily.js,
 * read from the repo at every request, like the live loader does) inside a Node vm sandbox with fake Google services:
 *   SpreadsheetApp  in-memory Sheet (Owners, Events, Polls, Requests, Offers, Perks, Chat, Reads, Feedback, TapLog, Moves, Daily, Awards)
 *   UrlFetchApp     fake ESPN API (both tiers, 2026, Week 9 live) · daily.js / Credit_Log.csv from the local repo · GitHub API = fake 2xx
 *   CacheService / PropertiesService / LockService / Utilities / MailApp / ContentService  small in-memory stand-ins
 * So response shapes are exactly what logic.js returns, writes (offers, chat, perks, reactions…) are stateful, and a backend
 * change in the repo is picked up on the next request.
 *
 * Data: owners / teams / tiers / divisions from the latest Pulse (weekly.html); rosters = the 2026 auction draft
 * (data/MAFFL_Draft_History_Clean_v3.csv); Weeks 1–8 team scores = real ESPN results (_ops/inbox/MAFFL_2026_WeekNN_espn.md),
 * real top-3 player scores pinned (data/MAFFL_Top_Performers_2026.csv), other player points seeded-random and scaled so
 * each starting lineup adds up to the real team score. Week 9 is live: some NFL games final, some in progress, some upcoming,
 * kickoffs relative to when the mock started.
 *
 * Use:   node mock.js [port]         → HTTP server; GET/POST /exec behave like the Apps Script web app.
 *        require("./mock.js").create() → { get(params), post(bodyObj), sheet(name), pin(owner) }
 * Extra: GET /__reset (reseed) · GET /__pins (owner → passphrase) · GET /__sheet?name=Chat (raw rows)
 * Env:   MAFFL_REPO (default: this repo) · MOCK_QUIET=1 · MOCK_DELAY=summary:1500,daily:800 ("*" = every action)
 */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), vm = require("vm"), http = require("http");
const REPO = process.env.MAFFL_REPO || path.resolve(__dirname, "../..");
const rd = (p) => fs.readFileSync(path.join(REPO, p), "utf8");
const norm = (s) => String(s || "").replace(/\s*\/\s*/g, "/").trim().toLowerCase();
const r2 = (x) => Math.round(x * 100) / 100;
const HOUR = 36e5;

// ------------------------------------------------------------------ seeded random
function seeded(str) {
  let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function hashInt(str) { return Math.floor(seeded(str)() * 1e9); }

// ------------------------------------------------------------------ repo data
function extract(src, marker) {
  const i = src.indexOf(marker); if (i < 0) return null;
  const k = i + marker.length, open = src[k], close = open === "[" ? "]" : "}"; let d = 0, j = k;
  for (; j < src.length; j++) { if (src[j] === open) d++; if (src[j] === close) { d--; if (!d) break; } }
  return new Function("return " + src.slice(k, j + 1))();
}
function loadWindowVar(file, name) { const w = {}; new Function("window", rd(file).replace(/^﻿/, ""))(w); return w[name]; }

function loadData() {
  const weekly = rd("weekly.html");
  const WEEKS = extract(weekly, "const WEEKS = ").sort((a, b) => a.weekNumber - b.weekNumber), PL = WEEKS[WEEKS.length - 1];
  const teams = { U: [], L: [] };
  Object.keys(PL.upperTier).forEach((div, di) => PL.upperTier[div].forEach((t) => teams.U.push({ team: t.team, owner: t.owner, div: di })));
  PL.lowerTier.forEach((t) => teams.L.push({ team: t.team, owner: /ghost/i.test(t.team) ? "" : t.owner, div: 0, ghost: /ghost/i.test(t.team) }));
  ["U", "L"].forEach((tier) => teams[tier].forEach((t, i) => { t.id = i + 1; t.tier = tier; }));
  const byOwner = {}, byTeam = {};
  ["U", "L"].forEach((tier) => teams[tier].forEach((t) => { if (t.owner) byOwner[norm(t.owner)] = t; byTeam[norm(t.team)] = t; }));

  // 2026 draft rosters
  const draft = {};
  rd("data/MAFFL_Draft_History_Clean_v3.csv").split(/\r?\n/).slice(1).forEach((line) => {
    if (!/^2026,/.test(line)) return; const c = line.split(",");
    (draft[norm(c[1])] = draft[norm(c[1])] || []).push({ name: c[3] || c[2], pos: c[4] || c[5], nfl: c[6], price: +c[7] || 0 });
  });
  // real top-3 per team per week
  const tops = {};
  rd("data/MAFFL_Top_Performers_2026.csv").split(/\r?\n/).slice(1).forEach((line) => {
    const c = line.split(","); if (c.length < 9 || c[0] !== "2026") return;
    (tops[c[1] + "|" + norm(c[4])] = tops[c[1] + "|" + norm(c[4])] || []).push({ abbr: c[6], pts: +c[8] });
  });
  // real game results Weeks 1..N from the robot's ESPN pull files
  const games = [];
  const seenG = {};
  fs.readdirSync(path.join(REPO, "_ops/inbox")).filter((f) => /^MAFFL_2026_Week\d+_espn\.md$/.test(f)).sort().forEach((f) => {
    const fw = +/Week(\d+)/.exec(f)[1];
    rd("_ops/inbox/" + f).split(/\r?\n/).forEach((line) => {
      const m = /^2026,(\d+),(Upper|Lower),(True|False),(\w+),/.exec(line); if (!m || +m[1] !== fw) return; // OUTPUT 1 rows of the file's own week only
      const key = m[1] + "|" + line.split(",").slice(5).join(","); if (seenG[key]) return; seenG[key] = 1;
      const c = line.split(","), n = c.length; // owner fields may hold commas? (they don't today) → read team/score from the ends
      games.push({ wk: +m[1], tier: m[2][0], teamA: c[7], ptsA: +c[8], teamB: c[n - 2], ptsB: +c[n - 1], playoff: m[3] === "True" });
    });
  });
  const lastWeek = Math.max.apply(null, games.map((g) => g.wk));
  const sched = loadWindowVar("schedule-data.js", "SCHEDULE_DATA");
  const credits = rd("data/Credit_Log.csv");
  const moveLines = [];
  try { rd("_ops/inbox/MAFFL_2026_Week" + String(lastWeek).padStart(2, "0") + "_espn.md").split(/\r?\n/).forEach((l) => { if (/^- .*(ADD|DROP)/.test(l)) moveLines.push(l); }); } catch (e) {}
  return { PL, WEEKS, teams, byOwner, byTeam, draft, tops, games, lastWeek, sched, credits, moveLines };
}

// ------------------------------------------------------------------ fake ESPN
const PRO = { 1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET", 9: "GB", 10: "TEN", 11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA", 16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ", 21: "PHI", 22: "ARI", 23: "PIT", 24: "LAC", 25: "SF", 26: "SEA", 27: "TB", 28: "WSH", 29: "CAR", 30: "JAX", 33: "BAL", 34: "HOU" };
const PROID = {}; Object.keys(PRO).forEach((k) => { PROID[PRO[k]] = +k; }); PROID.WAS = 28; PROID.JAC = 30; PROID.LA = 14;
const POSID = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DT: 9, DE: 10, LB: 11, CB: 12, S: 13 };
const ELIG = { QB: [0, 7, 20, 21], RB: [2, 3, 23, 7, 20, 21], WR: [4, 3, 5, 23, 7, 20, 21], TE: [6, 5, 23, 7, 20, 21],
  DT: [8, 11, 15, 20, 21], DE: [9, 11, 15, 20, 21], LB: [10, 15, 20, 21], CB: [12, 14, 15, 20, 21], S: [13, 14, 15, 20, 21] };
// MAFFL 2025+ lineup (ESPN inventory): QB, RB×2, WR×2, TE, OP, LB×2, DL×2, DB×2, DP, RB/WR/TE [BE×7] (+1 IR)
const SLOT_COUNTS = { 0: 1, 2: 2, 4: 2, 6: 1, 7: 1, 10: 2, 11: 2, 14: 2, 15: 1, 23: 1, 20: 7, 21: 1 };
const FILL_ORDER = [0, 6, 2, 2, 4, 4, 11, 11, 10, 10, 14, 14, 23, 7, 15];
const BASE = { QB: 19, RB: 12, WR: 11.5, TE: 8, DT: 7, DE: 8.5, LB: 9, CB: 6.5, S: 7.5 };
const BYES9 = ["PIT", "SF"];

function abbr(name) { const p = String(name).split(" "); return p[0][0] + ". " + p.slice(1).join(" "); }

function buildLeague(D, T0) {
  const L = { U: {}, L: {} };
  // NFL slate per scoring period. Weeks 1..8: everyone plays, all final. Week 9: Thursday final, Sunday early final,
  // late window in progress, SNF / MNF upcoming (relative to T0 so screenshots always look "live").
  const proIds = Object.keys(PRO).map(Number);
  const slate = {};
  for (let sp = 1; sp <= 18; sp++) {
    const r = seeded("slate" + sp), ids = proIds.filter((id) => sp !== 9 || BYES9.indexOf(PRO[id]) < 0).sort(() => r() - 0.5), games = [];
    for (let i = 0; i + 1 < ids.length; i += 2) games.push({ homeProTeamId: ids[i], awayProTeamId: ids[i + 1] });
    games.forEach((g, i) => {
      if (sp < 9) g.date = Date.UTC(2026, 8, 13 + 7 * (sp - 1), 17, 0);
      else if (sp === 9) g.date = i === 0 ? T0 - 50 * HOUR : i < 8 ? T0 - 5 * HOUR : i < 12 ? T0 - 1.5 * HOUR : i < 13 ? T0 + 2 * HOUR : i < 14 ? T0 + 6 * HOUR : T0 + 30 * HOUR;
      else g.date = Date.UTC(2026, 8, 13 + 7 * (sp - 1), 18, 0);
      g.state = sp < 9 ? "final" : sp > 9 ? "pre" : T0 >= g.date + 4 * HOUR ? "final" : T0 >= g.date ? "live" : "pre";
    });
    slate[sp] = games;
  }
  const gameOf = {}; // sp -> proId -> game
  Object.keys(slate).forEach((sp) => { gameOf[sp] = {}; slate[sp].forEach((g) => { gameOf[sp][g.homeProTeamId] = g; gameOf[sp][g.awayProTeamId] = g; }); });

  ["U", "L"].forEach((tier) => {
    const T = L[tier]; T.teams = D.teams[tier]; T.players = {}; T.roster = {};
    T.teams.forEach((tm) => {
      const list = (tm.ghost ? [] : D.draft[norm(tm.owner)] || []).map((d) => {
        const r = seeded(tier + d.name), pos = ELIG[d.pos] ? d.pos : "WR";
        const talent = (BASE[pos] || 8) * (0.7 + 0.3 * r() + 0.7 * Math.min(d.price, 60) / 60);
        const inj = r() < 0.09 ? ["QUESTIONABLE", "OUT", "DOUBTFUL"][Math.floor(r() * 3)] : "";
        return { id: 3900000 + (hashInt(d.name) % 900000), name: d.name, pos, nfl: d.nfl, pro: PROID[d.nfl] || 0, talent: r2(talent), price: d.price,
          inj, own: Math.max(1, Math.min(100, Math.round(20 + talent * 4 + r() * 25))), acq: "DRAFT", wk: {}, live: null };
      });
      // a waiver pickup or two, and one IR stash on some teams
      list.forEach((p, i) => { if (p.price <= 1 && seeded("acq" + tm.team + p.name)() < 0.2) p.acq = "ADD"; });
      // lineup: best eligible player for each starting slot (most restrictive first); the rest on the bench
      const used = {}, slotOf = {};
      const ranked = list.slice().sort((a, b) => b.talent - a.talent);
      const irGuy = ranked.filter((p) => p.inj === "OUT")[0];
      if (irGuy && seeded("ir" + tm.team)() < 0.6) { irGuy.inj = "INJURY_RESERVE"; slotOf[irGuy.id] = 21; used[irGuy.id] = 1; }
      FILL_ORDER.forEach((s) => { const p = ranked.filter((x) => !used[x.id] && ELIG[x.pos].indexOf(s) >= 0 && x.inj !== "OUT")[0]; if (p) { used[p.id] = 1; slotOf[p.id] = s; } });
      list.forEach((p) => { if (slotOf[p.id] == null) slotOf[p.id] = 20; p.slot = slotOf[p.id]; T.players[p.id] = p; });
      T.roster[tm.id] = list;
    });
    // Weeks 1..last: per-player points. Starters scaled so they add up to the real ESPN team score; real top-3 pinned.
    const games = D.games.filter((g) => g.tier === tier);
    T.games = games.map((g) => ({ wk: g.wk, h: D.byTeam[norm(g.teamA)], a: D.byTeam[norm(g.teamB)], hp: g.ptsA, ap: g.ptsB, po: g.playoff }))
      .filter((g) => g.h && g.a).map((g) => ({ wk: g.wk, h: g.h.id, a: g.a.id, hp: g.hp, ap: g.ap, po: g.po }));
    T.games.forEach((g) => [[g.h, g.hp], [g.a, g.ap]].forEach(([id, score]) => {
      const tm = T.teams.filter((t) => t.id === id)[0], list = T.roster[id] || []; if (!list.length) return;
      const pin = {}; (D.tops[g.wk + "|" + norm(tm.owner)] || []).forEach((t) => { const p = list.filter((x) => abbr(x.name) === t.abbr)[0]; if (p) pin[p.id] = t.pts; });
      const raw = {}; list.forEach((p) => { const r = seeded(tier + p.name + "w" + g.wk); raw[p.id] = r2(p.talent * (0.25 + 1.35 * Math.pow(r(), 1.2)) * (p.slot === 20 ? 0.85 : 1)); });
      const starters = list.filter((p) => p.slot !== 20 && p.slot !== 21), fixed = starters.filter((p) => pin[p.id] != null);
      const fixedSum = fixed.reduce((a, p) => a + pin[p.id], 0), free = starters.filter((p) => pin[p.id] == null), freeSum = free.reduce((a, p) => a + raw[p.id], 0);
      const k = freeSum > 0 ? Math.max(0, (score - fixedSum) / freeSum) : 1, cap = Math.min.apply(null, Object.values(pin).concat([999]));
      list.forEach((p) => { let v = pin[p.id] != null ? pin[p.id] : starters.indexOf(p) >= 0 ? raw[p.id] * k : raw[p.id];
        if (pin[p.id] == null && Object.keys(pin).length >= 3) v = Math.min(v, cap - 0.4); p.wk[g.wk] = r2(Math.max(-2, v)); });
      if (Object.keys(pin).length >= 3) { // re-balance the capped remainder onto the pinned guys' teammates' floor
        const sum = starters.reduce((a, p) => a + p.wk[g.wk], 0), diff = r2(score - sum), last = free[free.length - 1]; if (last && Math.abs(diff) > 0.001) last.wk[g.wk] = r2(last.wk[g.wk] + diff); }
    }));
    // Week 9 (current): live by NFL game state
    Object.values(T.players).forEach((p) => {
      const g = gameOf[9][p.pro], r = seeded(tier + p.name + "w9"), full = r2(p.talent * (0.25 + 1.35 * Math.pow(r(), 1.2)));
      p.proj9 = Math.round(p.talent * 10) / 10;
      if (!g) { p.live = { state: "bye", pts: 0 }; return; }
      p.live = { state: g.state, pts: g.state === "final" ? full : g.state === "live" ? r2(full * 0.55) : 0, full };
    });
    T.slate = slate; T.gameOf = gameOf;
  });
  // Week 9..14 schedule (fixtures)
  const fut = (D.sched.games || []).filter((g) => g[0] > D.lastWeek && g[0] <= 14);
  ["U", "L"].forEach((tier) => { const T = L[tier];
    fut.filter((g) => g[1] === tier).forEach((g) => { const a = D.byOwner[norm(g[2])] || (/ghost/i.test(g[2]) ? T.teams.filter((t) => t.ghost)[0] : null),
      b = D.byOwner[norm(g[3])] || (/ghost/i.test(g[3]) ? T.teams.filter((t) => t.ghost)[0] : null); if (a && b) T.games.push({ wk: g[0], h: a.id, a: b.id, hp: 0, ap: 0, po: false, future: true }); }); });
  return L;
}

// ESPN raw stat map from a point total (ids as in logic.js statLine_)
function rawStats(pos, pts, r) {
  const R = (x) => Math.max(0, Math.round(x)), s = {};
  if (pos === "QB") { const td = R(pts / 9), yd = R(Math.max(0, pts - 4 * td) * 25 * (0.7 + 0.2 * r())), att = R(yd / 7.1) || 12;
    Object.assign(s, { 0: att, 1: R(att * 0.64), 3: yd, 4: td, 20: r() < 0.3 ? 1 : 0, 23: R(2 + r() * 5), 24: R(r() * 30) }); }
  else if (pos === "RB") { const td = R(pts / 15), ry = R(Math.max(0, pts - 6 * td) * 6), car = R(ry / 4.3) || 5, rec = R(r() * 4);
    Object.assign(s, { 23: car, 24: ry, 25: td, 53: rec, 58: rec + R(r() * 2), 42: R(rec * 7) }); }
  else if (pos === "WR" || pos === "TE") { const td = R(pts / 16), y = R(Math.max(0, pts - 6 * td) * 7), rec = R(y / 12) || 1;
    Object.assign(s, { 53: rec, 58: rec + R(1 + r() * 3), 42: y, 43: td }); }
  else { Object.assign(s, { 107: R(pts / 1.5), 99: r() < 0.3 ? 1 : 0 }); }
  return s;
}

function espnPayload(L, D, tier, query, T0) {
  const T = L[tier], q = new URLSearchParams(query), views = q.getAll("view"), spq = +q.get("scoringPeriodId") || 0, CUR = D.lastWeek + 1;
  const out = { id: tier === "U" ? 34467 : 1587593698, seasonId: 2026, scoringPeriodId: CUR, status: { currentMatchupPeriod: CUR, latestScoringPeriod: CUR },
    settings: { name: "MAFFL " + (tier === "U" ? "Upper" : "Lower"), rosterSettings: { lineupSlotCounts: SLOT_COUNTS } } };
  const entry = (p, sp) => {
    const stats = [], season = Object.values(p.wk).reduce((a, x) => a + x, 0), n = Object.keys(p.wk).length;
    if (!sp) {
      stats.push({ seasonId: 2026, scoringPeriodId: 0, statSourceId: 0, statSplitTypeId: 0, appliedTotal: season, appliedAverage: n ? season / n : 0 });
      stats.push({ seasonId: 2026, scoringPeriodId: 0, statSourceId: 1, statSplitTypeId: 0, appliedTotal: p.talent * 17 });
    } else {
      const r = seeded(tier + p.name + "st" + sp);
      if (sp < CUR && p.wk[sp] != null) stats.push({ seasonId: 2026, scoringPeriodId: sp, statSourceId: 0, appliedTotal: p.wk[sp], stats: rawStats(p.pos, p.wk[sp], r) });
      if (sp === CUR && p.live && (p.live.state === "final" || p.live.state === "live")) stats.push({ seasonId: 2026, scoringPeriodId: sp, statSourceId: 0, appliedTotal: p.live.pts, stats: rawStats(p.pos, p.live.pts, r) });
      stats.push({ seasonId: 2026, scoringPeriodId: sp, statSourceId: 1, appliedTotal: sp === CUR ? p.proj9 : p.talent });
    }
    return { playerId: p.id, lineupSlotId: p.slot, acquisitionType: p.acq, injuryStatus: p.inj || "ACTIVE",
      playerPoolEntry: { id: p.id, appliedStatTotal: sp ? null : season, ratings: { 0: { positionalRanking: p.prk || null, totalRanking: 0 } },
        player: { id: p.id, fullName: p.name, defaultPositionId: POSID[p.pos] || 3, proTeamId: p.pro, eligibleSlots: ELIG[p.pos] || [], injuryStatus: p.inj || "ACTIVE",
          ownership: { percentOwned: p.own }, stats } } };
  };
  // positional rank by season points within the tier
  const byPos = {}; Object.values(T.players).forEach((p) => { (byPos[p.pos] = byPos[p.pos] || []).push(p); });
  Object.values(byPos).forEach((arr) => arr.sort((a, b) => Object.values(b.wk).reduce((x, y) => x + y, 0) - Object.values(a.wk).reduce((x, y) => x + y, 0)).forEach((p, i) => { p.prk = i + 1; }));
  out.teams = T.teams.map((t) => ({ id: t.id, name: t.team, abbrev: t.team.replace(/[^A-Z]/g, "").slice(0, 4) || "TM", divisionId: t.div,
    roster: views.indexOf("mRoster") >= 0 ? { entries: (T.roster[t.id] || []).map((p) => entry(p, 0)) } : undefined }));
  if (views.indexOf("mMatchupScore") >= 0 || views.indexOf("mBoxscore") >= 0) {
    out.schedule = T.games.map((g, i) => {
      const side = (id, pts) => { const s = { teamId: id, totalPoints: pts };
        if (g.wk === CUR) { const list = T.roster[id] || [], st = list.filter((p) => p.slot !== 20 && p.slot !== 21);
          s.totalPoints = s.totalPointsLive = r2(st.reduce((a, p) => a + p.live.pts, 0));
          s.totalProjectedPointsLive = r2(st.reduce((a, p) => a + (p.live.state === "final" ? p.live.pts : p.live.state === "live" ? Math.max(p.live.pts, p.live.full) : p.live.state === "bye" ? 0 : p.proj9), 0)); }
        if (spq && g.wk === spq) s.rosterForCurrentScoringPeriod = { entries: (T.roster[id] || []).map((p) => entry(p, spq)) };
        return s; };
      const done = !g.future && g.wk < CUR;
      return { id: i + 1, matchupPeriodId: g.wk, playoffTierType: g.po ? "WINNERS_BRACKET" : "NONE", home: side(g.h, g.hp), away: side(g.a, g.ap),
        winner: done ? (g.hp > g.ap ? "HOME" : g.hp < g.ap ? "AWAY" : "TIE") : "UNDECIDED" };
    });
  }
  return out;
}
function proSchedule(L) {
  const T = L.U, teams = Object.keys(PRO).map((id) => ({ id: +id, abbrev: PRO[id], proGamesByScoringPeriod: {} }));
  Object.keys(T.slate).forEach((sp) => T.slate[sp].forEach((g) => teams.forEach((t) => { if (g.homeProTeamId === t.id || g.awayProTeamId === t.id) t.proGamesByScoringPeriod[sp] = [{ homeProTeamId: g.homeProTeamId, awayProTeamId: g.awayProTeamId, date: g.date }]; })));
  return { settings: { proTeams: teams } };
}

// ------------------------------------------------------------------ fake Google services
class Range {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr: nr || 1, nc: nc || 1 }); }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = this.sh.data[this.r - 1 + i] || [], o = []; for (let j = 0; j < this.nc; j++) { const v = row[this.c - 1 + j]; o.push(v === undefined || v === null ? "" : v); } out.push(o); } return out; }
  setValues(v) { v.forEach((row, i) => { const R = this.sh.data[this.r - 1 + i] = this.sh.data[this.r - 1 + i] || []; row.forEach((x, j) => { R[this.c - 1 + j] = x; }); }); this.sh.fill(); return this; }
  setValue(x) { return this.setValues([[x]]); }
  clearContent() { return this.setValues(Array.from({ length: this.nr }, () => Array(this.nc).fill(""))); }
}
class Sheet {
  constructor(name) { this.name = name; this.data = []; }
  fill() { for (let i = 0; i < this.data.length; i++) if (!this.data[i]) this.data[i] = []; }
  getName() { return this.name; }
  appendRow(r) { this.data.push(r.slice()); return this; }
  setFrozenRows() { return this; }
  getLastRow() { let n = this.data.length; while (n && !(this.data[n - 1] || []).some((x) => x !== "" && x != null)) n--; return n; }
  getLastColumn() { return Math.max(0, ...this.data.map((r) => (r || []).length)); }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  getRange(r, c, nr, nc) { return new Range(this, r, c, nr, nc); }
  getActiveRange() { return new Range(this, 2, 1); }
}
function parseCsv(t) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; } else cur += ch; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function formatDate(d, tz, fmt) {
  const parts = {}; new Intl.DateTimeFormat("en-US", { timeZone: tz || "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", hour12: false, minute: "2-digit", weekday: "short" })
    .formatToParts(new Date(d)).forEach((p) => { parts[p.type] = p.value; });
  const H = +parts.hour % 24, mon = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short" }).format(new Date(d));
  return String(fmt).replace(/'([^']*)'|yyyy|MMM|MM|dd|EEE|HH|H|h|mm|a|d/g, (m, lit) => lit !== undefined ? lit : ({ yyyy: parts.year, MMM: mon, MM: parts.month, dd: parts.day, d: String(+parts.day),
    EEE: parts.weekday, HH: String(H).padStart(2, "0"), H: String(H), h: String(H % 12 || 12), mm: parts.minute, a: H < 12 ? "AM" : "PM" })[m]);
}

function create(opts) {
  opts = opts || {};
  const log = opts.quiet || process.env.MOCK_QUIET ? () => {} : (...a) => console.error("[mock]", ...a);
  const T0 = Date.now(), D = loadData(), LG = buildLeague(D, T0);
  const sheets = {}, cache = {}, props = {}, mail = [];
  const SS = { getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = new Sheet(n)), getUrl: () => "https://docs.google.com/spreadsheets/d/MOCK", getActiveSheet: () => sheets.Requests };
  const ctx = {
    console, JSON, Math, Date, Object, Array, String, Number, Boolean, RegExp, Error, Infinity, NaN, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
    SpreadsheetApp: { getActive: () => SS, getUi: () => { throw new Error("no UI in the mock"); } },
    CacheService: { getScriptCache: () => ({ get: (k) => { const e = cache[k]; return e && e.until > Date.now() ? e.v : null; }, put: (k, v, s) => { cache[k] = { v: String(v), until: Date.now() + (s || 600) * 1000 }; }, remove: (k) => { delete cache[k]; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, getProperties: () => Object.assign({}, props), deleteProperty: (k) => { delete props[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
    MailApp: { sendEmail: (to, subj) => { mail.push({ to, subj, at: new Date() }); log("mail →", to, "·", subj); } },
    Session: { getEffectiveUser: () => ({ getEmail: () => "commish@maffl.test" }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (s) => ({ body: s, setMimeType() { return this; } }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" }, Charset: { UTF_8: "utf8" },
      computeDigest: (alg, s) => Array.from(crypto.createHash("sha256").update(String(s), "utf8").digest()).map((b) => (b > 127 ? b - 256 : b)),
      computeHmacSha256Signature: (v, k) => Array.from(crypto.createHmac("sha256", String(k)).update(String(v), "utf8").digest()).map((b) => (b > 127 ? b - 256 : b)),
      getUuid: () => crypto.randomUUID(),
      base64Encode: (s) => Buffer.from(String(s), "utf8").toString("base64"),
      base64Decode: (s) => Array.from(Buffer.from(String(s), "base64")),
      newBlob: (bytes) => ({ getDataAsString: () => Buffer.from(bytes.map((b) => b & 255)).toString("utf8") }),
      formatDate, parseCsv, sleep() {},
    },
    UrlFetchApp: { fetch: (url, o) => fetchFake(String(url), o || {}) },
  };
  ctx.globalThis = ctx; vm.createContext(ctx);
  function resp(code, body) { const s = typeof body === "string" ? body : JSON.stringify(body); return { getResponseCode: () => code, getContentText: () => s }; }
  function fetchFake(url, o) {
    let m;
    if ((m = /fantasy\.espn\.com\/apis\/v3\/games\/ffl\/seasons\/2026\/segments\/0\/leagues\/(\d+)\?(.*)$/.exec(url))) return resp(200, espnPayload(LG, D, m[1] === "34467" ? "U" : "L", m[2], T0));
    if (/fantasy\.espn\.com\/apis\/v3\/games\/ffl\/seasons\/2026\?view=proTeamSchedules/.test(url)) return resp(200, proSchedule(LG));
    if ((m = /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/main\/([^?]+)/.exec(url))) { try { return resp(200, rd(m[1])); } catch (e) { return resp(404, "404: Not Found"); } }
    if (/api\.github\.com\/.*\/dispatches/.test(url)) return resp(204, "");
    if (/api\.github\.com\/.*\/contents\//.test(url)) return (o.method || "get").toLowerCase() === "put" ? resp(201, { content: {} }) : resp(404, { message: "Not Found" });
    log("fetch (unmocked) →", url); return resp(404, "mock: no route");
  }
  // Each request evaluates logic.js fresh (like Code.gs does), so MEMO_ / MODS_ never go stale between calls.
  function logic() {
    const src = rd("_ops/apps-script/logic.js") + "\n;M._need = need_; M._daily = function () { return DAILY; }; M._deskPost = deskPost_; M._post = post_;";
    const M = {}; vm.runInContext("(function (M) {" + src + "\n})", ctx, { filename: "logic.js" })(M); return M;
  }
  const bodyOf = (out) => JSON.parse(out.body);

  // -------------------------------------------------------------- seed the Sheet
  const PINS = {};
  function seed() {
    Object.keys(sheets).forEach((k) => delete sheets[k]); Object.keys(cache).forEach((k) => delete cache[k]); Object.keys(props).forEach((k) => delete props[k]);
    const now = Date.now(), ago = (h) => new Date(now - h * HOUR), sh = (n, head) => { const s = sheets[n] = new Sheet(n); s.appendRow(head); return s; };
    const ME = "Mike Murello", all = D.teams.U.concat(D.teams.L).filter((t) => t.owner), team = (o) => D.byOwner[norm(o)] || {};
    const ownerOf = (teamName) => (D.byTeam[norm(teamName)] || {}).owner;
    const beta = ["Mike Murello", "Charles Lavrinc", "Sam Lavrinc", "Ben Funari"];
    const owners = sh("Owners", ["owner", "team", "tier", "salt", "pin_hash", "failed_tries", "locked", "is_commish", "beta", "email", "phone", "notify"]);
    const A = ["GRONK", "BLITZ", "PISTOL", "HAIL", "WILDCAT", "SHOTGUN", "NICKEL", "DIME", "REDZONE", "AUDIBLE", "SPIKE", "LAMBEAU", "PYLON", "STIFFARM", "JUKE", "SACK", "PICKSIX", "ONSIDE", "BOOTLEG", "CHEESE", "FROZEN", "TUNDRA"];
    const B = ["PISTOL", "HAMMER", "TORNADO", "EXPRESS", "RAMPAGE", "CANNON", "THUNDER", "STAMPEDE", "LIGHTNING", "BULLDOG", "MACHINE", "ROCKET", "BLIZZARD", "GRIZZLY", "HURRICANE", "JACKPOT", "WRECKER", "DYNAMO", "FURY", "STALLION", "TITAN", "VORTEX"];
    all.forEach((t, i) => {
      const pin = t.owner === ME ? "GRONK-PISTOL" : A[(i + 1) % A.length] + "-" + B[(i + 3) % B.length], salt = "salt-" + i, noPin = t.owner === "Tony Brooks";
      const hash = Buffer.from(crypto.createHash("sha256").update(salt + ":" + pin.replace(/[^A-Z0-9]/g, ""), "utf8").digest()).toString("hex");
      if (!noPin) PINS[t.owner] = pin;
      const first = t.owner.split(/[ /]/)[0].toLowerCase();
      owners.appendRow([t.owner, t.team, t.tier, noPin ? "" : salt, noPin ? "" : hash, 0, "", t.owner === ME ? "Y" : "", beta.indexOf(t.owner) >= 0 ? "Y" : "",
        i % 3 === 2 ? "" : first + "@maffl.test", i % 4 === 3 ? "" : "'412555" + String(1000 + i * 37).slice(-4), t.owner === ME ? JSON.stringify({ received: true, countered: true, accepted: true, declined: false, commish: true, perks: true }) : ""]);
    });
    const rosterOf = (o, tier) => { const t = team(o); return (LG[tier || t.tier].roster[t.id] || []).slice().sort((a, b) => b.talent - a.talent); };
    const pick = (o, pos, n) => rosterOf(o).filter((p) => !pos || pos.indexOf(p.pos) >= 0)[n || 0];

    // Events: reactions, Game-of-the-Week votes, trade block
    const ev = sh("Events", ["ts", "owner", "type", "ref", "value", "week", "meta"]), WK = D.PL.weekNumber;
    const react = (o, ref, e, h) => ev.appendRow([ago(h), o, "react", ref, e, WK, "on"]);
    (D.PL.results || []).slice(0, 5).forEach((g, i) => { react("Braiden Snyder", "w" + WK + ":g:" + g.ownerA + "~" + g.ownerB, "🔥", 30 - i); if (i % 2 === 0) react("Ed Peters", "w" + WK + ":g:" + g.ownerA + "~" + g.ownerB, "😂", 28 - i); });
    react("Jacob Nickman", "w" + WK + ":res:" + ME, "😤", 40); react("David Murello", "w" + WK + ":res:" + ME, "👏", 38); react("Tony Trozzo", "w" + WK + ":res:" + ME, "🔥", 20);
    const gotw = (D.PL.results || []).filter((g) => !/ghost/i.test(g.teamA + g.teamB)).slice(0, 3).map((g) => g.ownerA + "~" + g.ownerB);
    ["Ed Peters", "BJ Funari", "Joe Reilly", "Dan Reilly", "Sam Lavrinc", "Ben Funari", "Todd Trozzo"].forEach((o, i) => { if (gotw.length) ev.appendRow([ago(20 - i), o, "vote", "gotw" + WK, gotw[i % gotw.length], WK, ""]); });
    const block = [["Mike Murello", ["QB"], 1, "Third QB, need RB depth. Make me an offer."], ["Mike Murello", ["WR"], 3, "Young WR, taking 2nd-tier RB back"],
      ["Braiden Snyder", ["QB"], 1, "Two-QB glut. Want a WR1."], ["Jacob Nickman", ["RB"], 2, "Will move an RB for a TE"], ["Ed Peters", ["QB"], 1, "Mahomes or Goff, your pick"],
      ["Tony Trozzo", ["TE"], 0, "Kelce/Kraft logjam"], ["Dan Reilly", ["LB", "DE"], 0, "IDP for a flex RB"], ["BJ Funari", ["WR"], 2, ""]];
    const blocked = [];
    block.forEach(([o, pos, n, note], i) => { const p = pick(o, pos, n); if (!p) return; blocked.push(p.name); ev.appendRow([ago(70 - i * 6), o, "block", "U:" + p.name, "on", "", note]); });
    sh("Polls", ["poll_id", "week", "question", "options (separate with |)", "closes (ISO)", "active"]).appendRow(["gotw" + WK, WK, "Game of the Week", "auto", "", "Y"]);
    sh("Requests", ["ts", "owner", "note", "status", "done_ts"]).appendRow([ago(5), "Dominic Nicastro", "New phone, lost my passphrase. Text me?", "OPEN", ""]);

    // Offers: two pending with Mike, one accepted (24-hour review) in Upper
    const offers = sh("Offers", ["offer_id", "ts", "from_owner", "to_owner", "tier", "give", "get", "give_credits", "get_credits", "note", "status", "updated_ts", "reason", "reasons", "sync"]);
    const P = (o, pos, n) => (pick(o, pos, n) || {}).name;
    const o1 = ["TMIKE0001", ago(26), ME, "Braiden Snyder", "U", JSON.stringify([P(ME, ["QB"], 1)]), JSON.stringify([P("Braiden Snyder", ["RB"], 0)]), 2, 0, "You've got two QBs starting and I need a back. Throwing in 2 credits.", "PROPOSED", ago(26), "", JSON.stringify(["Fills a need", "Bye-week help"]), ""];
    const o2 = ["TJAKE0002", ago(9), "Jacob Nickman", ME, "U", JSON.stringify([P("Jacob Nickman", ["WR"], 1)]), JSON.stringify([P(ME, ["RB"], 1), P(ME, ["LB"], 0)]), 0, 3, "WR for your RB + a linebacker. Need 3 credits for my trouble.", "PROPOSED", ago(9), "", JSON.stringify(["Win now"]), ""];
    const o3 = ["TREVIEW03", ago(30), "Tony Trozzo", "Ed Peters", "U", JSON.stringify([P("Tony Trozzo", ["TE"], 1)]), JSON.stringify([P("Ed Peters", ["WR"], 2)]), 0, 0, "TE for WR, straight up.", "ACCEPTED", ago(20), "", JSON.stringify(["Positional need"]), ""];
    [o1, o2, o3].forEach((r) => offers.appendRow(r));

    // Perks: Mike's canceled Double Bonus, Braiden's approved one against Mike (Week 9), Joe's FAAB request waiting on the commish
    const perks = sh("Perks", ["perk_id", "ts", "owner", "tier", "perk", "cost", "qty", "week", "player", "pos", "swap_with", "affects", "note", "status", "updated_ts", "reason", "sync"]);
    const CUR = D.lastWeek + 1, bq = pick("Braiden Snyder", ["QB"], 0);
    perks.appendRow(["PMIKE0001", ago(80), ME, "U", "double", 10, 1, CUR, P(ME, ["QB"], 0), "QB", "", JSON.stringify(["Braiden Snyder"]), "Allen vs a bad secondary", "CANCELED", ago(76), "", ""]);
    perks.appendRow(["PBRAI0002", ago(60), "Braiden Snyder", "U", "double", 10, 1, CUR, bq.name, "QB", "", JSON.stringify([ME]), "", "APPROVED", ago(50), "", "test"]);
    perks.appendRow(["PJOER0003", ago(14), "Joe Reilly", "U", "faab", 2, 2, "", "", "", "", "[]", "Need waiver money for the IDP market", "REQUESTED", ago(14), "", ""]);

    // Chat
    const chat = sh("Chat", ["msg_id", "ts", "room", "owner", "kind", "text", "ref", "event", "mentions", "reply_to", "deleted", "pinned"]);
    let n = 0; const say = (room, o, text, h, extra) => { const id = "M" + String(1000000000 + (++n)); const e = extra || {};
      chat.appendRow([id, ago(h), room, o, e.kind || "text", text, e.ref || "", e.event || "", JSON.stringify(e.mentions || []), e.reply || "", "", e.pinned ? "Y" : ""]); return id; };
    const dm = (a, b) => "dm:" + [norm(a), norm(b)].sort().join("|");
    const pin1 = say("league", ME, "📌 Trade deadline is Wed Dec 2 at noon. Offers must be accepted in the app by then.", 96, { pinned: true });
    say("league", "Ed Peters", "186 and change. Somebody check on Jake.", 70);
    const j1 = say("league", "Jacob Nickman", "Mahomes on a Thursday. I want a recount.", 69);
    say("league", "Joe Reilly", "Penix in my OP slot for -5.9. I've made worse decisions but not many.", 66);
    say("league", "MAFFL HQ", "", 64, { kind: "offer", ref: "TREVIEW03", event: "REVIEW" });
    say("league", "Ben Funari", "Lower is a war zone. Ferrets, Phamclub and me all at 5-6 wins.", 30);
    say("league", "David Murello", "@Mike Coach of the Week again? Who's setting your lineup?", 6, { mentions: [ME] });
    say("league", "Sam Lavrinc", "The Wire card is great. Feels like the ESPN app but ours.", 2);
    say("tier:U", "Braiden Snyder", "Maye doubled this week. Sorry in advance, Mike.", 40);
    say("tier:U", "MAFFL HQ", "", 20, { kind: "offer", ref: "TREVIEW03", event: "REVIEW" });
    say("tier:U", "Tony Trozzo", "Kelce for a WR. Ed got a deal and he knows it.", 19);
    say("tier:U", "Dan Reilly", "Anyone selling a linebacker? Block's open.", 4);
    say("tier:L", "Todd Trozzo", "Ghost put up 147 on me. The Ghost is cheating.", 50);
    say("tier:L", "Charles Lavrinc", "Benched Caleb Williams for Mayfield. Never again.", 45);
    const dmB = dm(ME, "Braiden Snyder"), dmJ = dm(ME, "Jacob Nickman");
    say(dmB, ME, "", 26, { kind: "offer", ref: "TMIKE0001", event: "PROPOSED" });
    say(dmB, ME, "Two credits on top. You're never starting him over Maye anyway.", 25.9);
    say(dmB, "Braiden Snyder", "Let me sleep on it. Hurts might be back next week.", 22);
    say(dmJ, "Jacob Nickman", "", 9, { kind: "offer", ref: "TJAKE0002", event: "PROPOSED" });
    say(dmJ, "Jacob Nickman", "Got a WR you'll like. Check it out.", 8.9);
    say(dm("Tony Trozzo", "Ed Peters"), "Tony Trozzo", "", 30, { kind: "offer", ref: "TREVIEW03", event: "PROPOSED" });
    say(dm("Tony Trozzo", "Ed Peters"), "Ed Peters", "", 20, { kind: "offer", ref: "TREVIEW03", event: "ACCEPTED" });
    // Commish desk log
    say("desk", "MAFFL HQ", "ESPN weekly pull\nWeek " + D.lastWeek + " pulled: 11 games, 0 trades. Draft PR opened.", 100, { kind: "robot", ref: "https://github.com/maffl-commish/maffl/actions", event: "OK" });
    say("desk", "MAFFL HQ", "", 80, { kind: "perk", ref: "PMIKE0001", event: "REQUESTED" });
    say("desk", "MAFFL HQ", "", 76, { kind: "perk", ref: "PMIKE0001", event: "CANCELED" });
    say("desk", "MAFFL HQ", "", 60, { kind: "perk", ref: "PBRAI0002", event: "REQUESTED" });
    say("desk", "MAFFL HQ", "", 20, { kind: "offer", ref: "TREVIEW03", event: "REVIEW" });
    say("desk", "MAFFL HQ", "", 14, { kind: "perk", ref: "PJOER0003", event: "REQUESTED" });
    say("desk", "MAFFL HQ", "👍 " + team("Sam Lavrinc").team + " · Home · 📰 The wire\nLove the wire card. Can it show FAAB bids?", 7, { kind: "feedback", ref: "F1", event: "up" });
    say("desk", "MAFFL HQ", "", 5, { kind: "access", ref: "Dominic Nicastro", event: "REQUEST", text: "" });
    say("desk", "MAFFL HQ", "⏳ " + team("Joe Reilly").team + "'s Extra FAAB $ request has waited 13 hours.", 1, { kind: "note", ref: "PJOER0003", event: "WAITING" });
    // reactions on chat messages
    [["Ed Peters", j1, "😂"], ["Tony Trozzo", j1, "😂"], ["BJ Funari", pin1, "👍"], ["Braiden Snyder", pin1, "👍"]].forEach(([o, id, e], i) => ev.appendRow([ago(60 - i), o, "react", "chat:" + id, e, "chat", "on"]));
    // Mike's read marks: league read through 2 days ago (unread since), his DMs read except Jake's
    const reads = sh("Reads", ["owner", "room", "ts"]);
    reads.appendRow([ME, "league", ago(48)]); reads.appendRow([ME, "tier:U", ago(19)]); reads.appendRow([ME, dmB, ago(23)]); reads.appendRow([ME, "desk", ago(15)]);
    // beta kit
    const fb = sh("Feedback", ["fb_id", "ts", "owner", "tier", "kind", "mood", "where", "note", "ctx"]);
    fb.appendRow(["F1", ago(7), "Sam Lavrinc", "L", "button", "up", "Home · 📰 The wire", "Love the wire card. Can it show FAAB bids?", "{}"]);
    fb.appendRow(["F2", ago(3), "Charles Lavrinc", "L", "prompt", "meh", "Match", "", "{}"]);
    const taps = sh("TapLog", ["ts", "owner", "session", "type", "what", "where"]);
    ["Sam Lavrinc", "Charles Lavrinc", "Ben Funari", ME].forEach((o, k) => { for (let i = 0; i < 6 + k * 3; i++) taps.appendRow([ago(2 + i * 0.4 + k), o, "s" + k, "tap", "data-tab=home", "home"]); });
    // Wire: last run's roster moves, restamped into the last 2 days (adds matched to real roster players where possible)
    const moves = sh("Moves", ["ts", "tier", "owner", "team", "type", "player", "pos", "nfl", "other"]);
    let mh = 2;
    D.moveLines.slice(0, 14).forEach((l) => {
      const m = /^- (?:[A-Z][a-z]{2} [\d/]+ [\d:]+ [AP]M · )?(?:(Upper|Lower) · )?([^·]+?) · (.*)$/.exec(l); if (!m) return;
      const t = D.byTeam[norm(m[2])]; if (!t) return;
      m[3].split("|").forEach((part) => { const mm = /(ADD|DROP) ([^($]+)/.exec(part); if (!mm) return; const nm = mm[2].trim();
        const p = (LG[t.tier].roster[t.id] || []).filter((x) => abbr(x.name) === nm)[0];
        moves.appendRow([ago(mh), t.tier, t.owner, t.team, mm[1] === "ADD" ? "add" : "drop", p ? p.name : nm, p ? p.pos : "", p ? p.nfl : "", ""]); mh += 1.7; }); });

    props.LAST_TICK = JSON.stringify({ at: new Date(now - 6 * 6e4).toISOString(), log: ["perks 1"] });
    props.LAST_SYNC = JSON.stringify({ at: ago(50).toISOString(), ok: true, mode: "test", rows: 1 });
    props.CREDIT_SYNC = "test"; props.GITHUB_TOKEN = "mock-token"; props.ESPN_S2 = "mock"; props.SWID = "{MOCK}";

    // Daily run (the real daily.js against the fake ESPN), then card lines
    const M = logic(); M._need("daily"); const DAILY = M._daily(), res = DAILY.run("button");
    if (!res.ok) log("daily run problems:", res.problems);
    const snap = DAILY.view().snapshot; DAILY.putLines(cardLines(snap));
    log("seeded: " + all.length + " owners, daily snapshot weeks", JSON.stringify((snap && Object.keys(snap.tiers).map((t) => t + ":" + snap.tiers[t].last)) || []));
  }
  // Claude-style card lines (what the card-lines workflow posts back), built from the snapshot.
  function cardLines(snap) {
    const L = { at: new Date().toISOString(), tiers: {}, owners: {}, elite5: [] }; if (!snap) return L;
    const all = [];
    Object.keys(snap.tiers).forEach((tier) => {
      const S = snap.tiers[tier], wk = S.last, name = (id) => (S.teams[id] || {}).team || "?", TN = tier === "U" ? "Upper" : "Lower";
      const tab = S.table.slice().sort((a, b) => b.w - a.w || b.pf - a.pf);
      const hot = S.table.slice().sort((a, b) => b.streak - a.streak)[0], cold = S.table.slice().sort((a, b) => a.streak - b.streak)[0];
      const hi = (S.highs || []).filter((h) => h.wk === wk)[0], c = (S.coach || {})[wk] || {}, cw = c.winner, out = (S.survivor.out || []).slice(-1)[0];
      L.tiers[tier] = { headline: hi ? "🔥 " + name(hi.id) + " put up " + hi.pts.toFixed(2) + ", the top " + TN + " score of Week " + wk + "." : "",
        hot: hot ? name(hot.id) + " has won " + hot.streak + " straight and leads the tier in heat." : "",
        cold: cold ? name(cold.id) + " has dropped " + (-cold.streak) + " in a row; the all-play says it's not all luck." : "",
        coach: cw ? "🧠 " + name(cw) + " left " + ((c.board || []).filter((b) => b.id === cw)[0] || { gap: 0 }).gap.toFixed(2) + " on the bench, the cleanest lineup in " + TN + "." : "",
        survivor: out ? name(out.id) + " went out of Survivor with " + out.pts.toFixed(2) + "; " + S.survivor.alive.length + " still standing." : "",
        wire: tier === "U" ? "Hammer Time spent $25 on Lemon. Bold, or a cry for help." : "Sarge's Squad dropped $37 on Cooper Jr., the biggest bid in either tier." };
      tab.forEach((t, i) => { if (!t.owner) return; all.push({ t, tier, i });
        const g = S.games.filter((x) => x[0] === wk && (x[1] === t.id || x[3] === t.id))[0], ng = S.games.filter((x) => x[0] === S.week && (x[1] === t.id || x[3] === t.id))[0];
        const mine = g && (g[1] === t.id ? [g[2], g[4], g[3]] : [g[4], g[2], g[1]]), opp = ng && (ng[1] === t.id ? ng[3] : ng[1]), ot = opp && S.table.filter((x) => x.id === opp)[0];
        L.owners[t.owner] = { result: mine ? (mine[0] > mine[1] ? "You beat " + name(mine[2]) + " by " + (mine[0] - mine[1]).toFixed(2) + (t.streak > 1 ? ", " + t.streak + " straight now." : ".") : "Lost to " + name(mine[2]) + " by " + (mine[1] - mine[0]).toFixed(2) + "; the bench had the points to flip it.") : "",
          next: ot ? name(opp) + " (" + ot.last5 + " lately) is next; a win " + (ot.w > t.w ? "pulls you level." : "keeps you clear of them.") : opp ? "The Ghost is next. Don't be the team that loses to it." : "" }; });
    });
    L.elite5 = all.sort((a, b) => b.t.w - a.t.w || (b.t.allplay[0] - a.t.allplay[0]) || b.t.pf - a.t.pf).slice(0, 5)
      .map((x) => ({ owner: x.t.owner, note: x.t.w + "-" + x.t.l + " with a " + x.t.allplay[0] + "-" + x.t.allplay[1] + " all-play and " + x.t.pf.toFixed(2) + " points (" + (x.tier === "U" ? "Upper" : "Lower") + ")." }));
    return L;
  }
  seed();
  return {
    get(params) { const t = Date.now(), out = bodyOf(logic().doGet({ parameter: params || {} })); log("GET", params.action || "(version)", params.tier || "", Date.now() - t + "ms", out.ok === false ? "→ " + out.error : ""); return out; },
    post(body) { const t = Date.now(), out = bodyOf(logic().doPost({ postData: { contents: JSON.stringify(body || {}) } })); if (body.action !== "taplog") log("POST", body.action, Date.now() - t + "ms", out.ok === false ? "→ " + out.error : ""); return out; },
    reset: seed, pins: () => PINS, sheet: (n) => (sheets[n] ? sheets[n].data : null), mail: () => mail,
  };
}

function serve(port) {
  let mock = create();
  const DELAY = {}; String(process.env.MOCK_DELAY || "").split(",").forEach((x) => { const [k, v] = x.split(":"); if (k && v) DELAY[k.trim()] = +v; });
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://x"), send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Cache-Control": "no-store" }); res.end(typeof obj === "string" ? obj : JSON.stringify(obj)); };
    if (req.method === "OPTIONS") return send(204, "");
    try {
      if (u.pathname === "/__reset") { mock.reset(); return send(200, { ok: true }); }
      if (u.pathname === "/__pins") return send(200, mock.pins());
      if (u.pathname === "/__sheet") return send(200, mock.sheet(u.searchParams.get("name")) || []);
      if (u.pathname === "/__mail") return send(200, mock.mail());
      const later = (action, fn) => { const ms = DELAY[action] || DELAY["*"] || 0; if (ms) setTimeout(fn, ms); else fn(); };
      if (req.method === "GET") { const q = Object.fromEntries(u.searchParams); return later(q.action || "version", () => send(200, mock.get(q))); }
      let body = ""; req.on("data", (c) => { body += c; });
      req.on("end", () => { let b = {}; try { b = JSON.parse(body || "{}"); } catch (e) {}
        later(b.action, () => { try { send(200, mock.post(b)); } catch (e) { console.error(e); send(200, { ok: false, error: "mock: " + e.message }); } }); });
    } catch (e) { console.error(e); send(200, { ok: false, error: "mock: " + e.message }); }
  });
  server.listen(port, "127.0.0.1", () => console.log("MOCK READY http://127.0.0.1:" + server.address().port + "/exec"));
  return server;
}

module.exports = { create, serve };
if (require.main === module) serve(+(process.argv[2] || process.env.MOCK_PORT || 8765));
