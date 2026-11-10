/**
 * MAFFL HQ App — DAILY RUN (in-season mode). REEL replaces the weekly Pulse with this (commish, 2026-11-06).
 * Loaded on demand by logic.js (need_("daily")), evaluated INSIDE logic.js's scope, so it uses logic's helpers
 * (espn_, rows_, sheet_, owners_, deskPost_, bestLineup_, LEAGUES, POS, SLOT, PRO, ...). It exports by filling DAILY.
 * Keep it under ~90 KB (cache limit). Design: _ops/docs/APP_DESIGN.md §10g.
 *
 * Runs twice a day (5 AM + 5 PM ET) from the 15-minute tick, or from the desk's "Run daily now" button:
 *   1. scores    both tiers: every week's results, records, points, streaks, all-play, Survivor, weekly high
 *   2. coach     Coach of the Week for each decided week (best-lineup bench gap; bye / empty / 0-pt starter = out)
 *   3. rosters   fresh ESPN rosters; adds / drops / trades since the last run → Moves tab
 *   4. feedback  beta feedback + tap counts since the last run → one desk digest (only if there's something)
 *   5. health    ESPN reachable, tick running; trouble → desk alert
 * Results live in the Daily tab (key → JSON) and come back from GET ?action=daily for the app.
 */
DAILY.VER = "12"; // bump when a change should re-run at the next tick (not wait for the next 5 AM / 5 PM slot)
DAILY.HEAD = ["key", "updated", "json"];
DAILY.MOVE_HEAD = ["ts", "tier", "owner", "team", "type", "player", "pos", "nfl", "other"];

function dTab_(name) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(name === "Moves" ? DAILY.MOVE_HEAD : DAILY.HEAD); sh.setFrozenRows(1); }
  return sh;
}
// Daily tab: one row per key. JSON longer than a cell (50k) is split across columns C, D, E…
function dGet_(key) {
  var sh = dTab_("Daily"), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { try { return JSON.parse(v[i].slice(2).join("")); } catch (e) { return null; } }
  return null;
}
function dPut_(key, obj) {
  var sh = dTab_("Daily"), v = sh.getDataRange().getValues(), s = JSON.stringify(obj), parts = [];
  for (var k = 0; k < s.length; k += 45000) parts.push(s.slice(k, k + 45000));
  var row = [key, new Date()].concat(parts), at = -1;
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { at = i + 1; break; }
  if (at < 0) at = sh.getLastRow() + 1; else sh.getRange(at, 1, 1, Math.max(v[0].length, row.length)).clearContent();
  sh.getRange(at, 1, 1, row.length).setValues([row]);
}

// ---- 1. scores ------------------------------------------------------------------------------------------
function dScores_(tier) {
  var d = espn_(LEAGUES[tier], "view=mMatchupScore&view=mTeam&view=mSettings");
  var byTeam = {}; owners_().forEach(function (o) { if (o.team) byTeam[norm_(o.team)] = o.owner; });
  var teams = {}; (d.teams || []).forEach(function (t) {
    var name = t.name || ((t.location || "") + " " + (t.nickname || "")).trim();
    teams[t.id] = { id: t.id, team: name, owner: byTeam[norm_(name)] || "", ghost: /ghost/i.test(name), div: t.divisionId };
  });
  var cur = (d.status && d.status.currentMatchupPeriod) || d.scoringPeriodId || 1, games = [], state = {};
  (d.schedule || []).forEach(function (m) {
    if (!m.home || !m.away) return;
    var wk = m.matchupPeriodId, h = teams[m.home.teamId], a = teams[m.away.teamId]; if (!h || !a) return;
    var done = m.winner && m.winner !== "UNDECIDED";
    (state[wk] = state[wk] || []).push(done);
    games.push({ wk: wk, po: (m.playoffTierType || "NONE") !== "NONE", h: h.id, a: a.id, hp: r2_(m.home.totalPoints), ap: r2_(m.away.totalPoints), win: done ? (m.winner === "HOME" ? h.id : m.winner === "AWAY" ? a.id : 0) : null });
  });
  var decided = Object.keys(state).map(Number).filter(function (w) { return state[w].every(Boolean); }).sort(function (x, y) { return x - y; });
  var reg = games.filter(function (g) { return !g.po && g.win !== null && decided.indexOf(g.wk) >= 0; }); // final weeks only
  var rec = {}; Object.keys(teams).forEach(function (id) { rec[id] = { w: 0, l: 0, t: 0, pf: 0, pa: 0, seq: [], apw: 0, apl: 0 }; });
  var scores = {}; // wk -> id -> pts
  reg.forEach(function (g) {
    [[g.h, g.hp, g.ap], [g.a, g.ap, g.hp]].forEach(function (x) { var r = rec[x[0]]; r.pf += x[1]; r.pa += x[2];
      var res = g.win === 0 ? "T" : g.win === x[0] ? "W" : "L"; r[res.toLowerCase()]++; r.seq.push(res); (scores[g.wk] = scores[g.wk] || {})[x[0]] = x[1]; });
  });
  var real = Object.keys(teams).filter(function (id) { return !teams[id].ghost; });
  Object.keys(scores).forEach(function (wk) { var s = scores[wk]; real.forEach(function (id) { if (s[id] == null) return;
    real.forEach(function (p) { if (p !== id && s[p] != null) { if (s[id] > s[p]) rec[id].apw++; else if (s[id] < s[p]) rec[id].apl++; } }); }); });
  var table = real.map(function (id) { var r = rec[id], st = 0;
    for (var i = r.seq.length - 1; i >= 0; i--) { var x = r.seq[i]; if (x === "T") break; if (!st) st = x === "W" ? 1 : -1; else if ((x === "W") === (st > 0)) st += st > 0 ? 1 : -1; else break; }
    return { id: +id, team: teams[id].team, owner: teams[id].owner, div: teams[id].div, w: r.w, l: r.l, t: r.t, pf: r2_(r.pf), pa: r2_(r.pa), streak: st, last5: r.seq.slice(-5).join(""), allplay: [r.apw, r.apl] }; });
  // Survivor: each decided week the single lowest real score among teams still alive goes out.
  var alive = real.slice(), out = [];
  decided.forEach(function (wk) { var s = scores[wk] || {}, c = alive.filter(function (id) { return s[id] != null; });
    if (alive.length <= 1 || !c.length) return; var low = c.reduce(function (m, id) { return s[id] < s[m] ? id : m; }, c[0]);
    out.push({ wk: wk, id: +low, pts: s[low], tie: c.filter(function (id) { return s[id] === s[low]; }).length > 1 }); alive.splice(alive.indexOf(low), 1); });
  // Weekly high per decided week, season high.
  var highs = decided.map(function (wk) { var s = scores[wk] || {}, best = null; real.forEach(function (id) { if (s[id] != null && (!best || s[id] > s[best])) best = id; });
    return best ? { wk: wk, id: +best, pts: s[best] } : null; }).filter(Boolean);
  // 👻 MAFFL Ghost (Lower, odd-sized tier): its score each week is the "par" = mean of the real scores with the week's top one
  // dropped, rounded half up to the cent (same rule as maffl_espn_pull.py). The commish enters it on ESPN as a score
  // adjustment; espn = what ESPN shows now (0 until he does). Final regular-season weeks only.
  var gid = Object.keys(teams).filter(function (id) { return teams[id].ghost; })[0], ghost = [];
  if (gid) decided.forEach(function (wk) {
    var gg = games.filter(function (g) { return g.wk === wk && !g.po; }), gm = gg.filter(function (g) { return String(g.h) === gid || String(g.a) === gid; })[0]; if (!gm) return;
    var cs = []; gg.forEach(function (g) { [[g.h, g.hp], [g.a, g.ap]].forEach(function (x) { if (String(x[0]) !== gid) cs.push(Math.round(x[1] * 100)); }); });
    if (cs.length < 2) return; cs.sort(function (a, b) { return b - a; }); var rest = cs.slice(1), sum = rest.reduce(function (a, b) { return a + b; }, 0), n = rest.length;
    var par = Math.floor((2 * sum + n) / (2 * n)) / 100, home = String(gm.h) === gid;
    ghost.push({ wk: wk, par: par, espn: home ? gm.hp : gm.ap, vs: home ? gm.a : gm.h, vsPts: home ? gm.ap : gm.hp });
  });
  return { tier: tier, week: cur, decided: decided, ghost: ghost, last: decided.length ? decided[decided.length - 1] : 0, teams: teams, table: table,
    games: games.map(function (g) { return [g.wk, g.h, g.hp, g.a, g.ap, g.win, g.po ? 1 : 0]; }), survivor: { alive: alive.map(Number), out: out }, highs: highs };
}
function r2_(x) { return Math.round((Number(x) || 0) * 100) / 100; }

// ---- 2. Coach of the Week — same rule as the ESPN pull robot (maffl_espn_pull.py COTW, commish 2026-10-06): fewest points
// left on the bench; a "hole" = a starter on bye, a starter who didn't play (no stats that week) or an empty slot; out of
// contention at 4+ holes (a starter who played and scored 0 is NOT a hole). Tie → higher team score.
var COTW_HOLES = 4;
var D_SLOTS_ = {};
function dCoach_(tier, wk, teams) {
  var base = D_SLOTS_[tier] = D_SLOTS_[tier] || espn_(LEAGUES[tier], "view=mSettings"), counts = ((base.settings || {}).rosterSettings || {}).lineupSlotCounts || {}, slots = [];
  Object.keys(counts).forEach(function (s) { var id = +s; if (id !== 20 && id !== 21) for (var c = 0; c < counts[s]; c++) slots.push(id); });
  var box = espn_(LEAGUES[tier], "view=mMatchupScore&view=mBoxscore&scoringPeriodId=" + wk), pro = {};
  try { pro = proGames_(wk); } catch (e) {}
  var board = [], pwk = {}, tops = {}, started = {}; // started: player id -> 1 started / 0 benched or IR that week (commish 11/7: started-or-benched on the player chart)
  (box.schedule || []).filter(function (g) { return g.matchupPeriodId === wk; }).forEach(function (g) {
    [g.home, g.away].forEach(function (sd) {
      if (!sd || !teams[sd.teamId] || teams[sd.teamId].ghost) return;
      var ents = ((sd.rosterForCurrentScoringPeriod || sd.rosterForMatchupPeriod || {}).entries) || [], out = "";
      var ps = ents.map(function (e) { var pl = (e.playerPoolEntry || {}).player || {}, st = pl.stats || [];
        var act = st.filter(function (x) { return x.scoringPeriodId === wk && x.statSourceId === 0; })[0];
        var pts = act ? act.appliedTotal : ((e.playerPoolEntry || {}).appliedStatTotal || 0);
        var bye = !!pl.proTeamId && Object.keys(pro || {}).length > 0 && !pro[pl.proTeamId];
        if (pl.id) { pwk[pl.id] = r2_(act ? act.appliedTotal : 0); started[pl.id] = e.lineupSlotId !== 20 && e.lineupSlotId !== 21 ? 1 : 0; }
        if (act && (e.lineupSlotId !== 20 && e.lineupSlotId !== 21) && (!tops[sd.teamId] || act.appliedTotal > tops[sd.teamId].pts)) tops[sd.teamId] = { t: sd.teamId, n: pl.fullName || "?", pts: r2_(act.appliedTotal) };
        return { n: pl.fullName || "?", sid: e.lineupSlotId, pts: r2_(pts), el: pl.eligibleSlots || [], bye: bye, dnp: !bye && !act }; });
      var starters = ps.filter(function (x) { return x.sid !== 20 && x.sid !== 21; }), pool = ps.filter(function (x) { return x.sid !== 21; });
      var why = [], empty = Math.max(0, slots.length - starters.length);
      starters.forEach(function (x) { if (x.bye) why.push(x.n + " on bye"); else if (x.dnp) why.push(x.n + " didn't play"); });
      if (empty) why.push(empty + " empty slot" + (empty > 1 ? "s" : ""));
      var holes = why.length - (empty ? 1 : 0) + empty; if (holes >= COTW_HOLES) out = holes + " holes: " + why.join(", ");
      var sum = starters.reduce(function (a, x) { return a + x.pts; }, 0), best = bestLineup_(slots, pool.map(function (x) { return [x.pts, x.el]; }));
      var bp = Math.max(best.pts, sum);
      board.push({ id: sd.teamId, scored: r2_(sum), best: r2_(bp), gap: r2_(bp - sum), holes: holes, out: out });
    });
  });
  board.sort(function (a, b) { return (a.out ? 1 : 0) - (b.out ? 1 : 0) || a.gap - b.gap || b.scored - a.scored; });
  return { wk: wk, board: board, winner: board[0] && !board[0].out ? board[0].id : null, pts: pwk, st: started, top: Object.keys(tops).map(function (k) { return tops[k]; }) };
}

// ---- 2b. credit races (rulebook "League bonus credits"): leaders now, and the week each lead began.
//   Most Team Points +5 (regular season) · Largest Blowout +3 (regular season, Ghost games count, the winner must be real)
//   · Individual High Score +3 (one player's week, playoffs included) · Survivor Bonus +5 · Highest Weekly Score +1 each week.
var REG_WEEKS = 14;
function dRaces_(s, coach) {
  var real = {}; Object.keys(s.teams).forEach(function (id) { if (!s.teams[id].ghost) real[id] = 1; });
  var regDone = s.decided.filter(function (w) { return w <= REG_WEEKS; }), games = s.games.filter(function (g) { return !g[6] && g[5] !== null && regDone.indexOf(g[0]) >= 0; });
  // Most points: leader after each final week; "since" = the week the current leader took over.
  var pf = {}, leadBy = [];
  regDone.forEach(function (wk) { games.filter(function (g) { return g[0] === wk; }).forEach(function (g) { pf[g[1]] = (pf[g[1]] || 0) + g[2]; pf[g[3]] = (pf[g[3]] || 0) + g[4]; });
    var best = null; Object.keys(pf).forEach(function (id) { if (real[id] && (best === null || pf[id] > pf[best])) best = id; }); leadBy.push([wk, best]); });
  var since = function (arr) { var cur = arr.length ? arr[arr.length - 1][1] : null, w = null; for (var i = arr.length - 1; i >= 0 && arr[i][1] === cur; i--) w = arr[i][0]; return w; };
  var ptsL = leadBy.length ? leadBy[leadBy.length - 1][1] : null;
  // Largest blowout so far
  var blow = null; games.forEach(function (g) { var w = g[5], l = w === g[1] ? g[3] : g[1], m = Math.abs(g[2] - g[4]); if (w && real[w] && (!blow || m > blow.m)) blow = { wk: g[0], t: w, o: l, m: r2_(m) }; });
  // Individual high: best single-player week in the tier (any final week, playoffs included)
  var ind = null; Object.keys(coach || {}).forEach(function (wk) { (coach[wk].top || []).forEach(function (x) { if (real[x.t] && (!ind || x.pts > ind.pts)) ind = { wk: +wk, t: x.t, n: x.n, pts: x.pts }; }); });
  var sv = s.survivor || { alive: [] };
  return {
    pts: ptsL ? { t: +ptsL, value: r2_(pf[ptsL]), since: since(leadBy), final: regDone.indexOf(REG_WEEKS) >= 0 } : null,
    blow: blow ? { t: blow.t, value: blow.m, over: blow.o, wk: blow.wk, since: blow.wk, final: regDone.indexOf(REG_WEEKS) >= 0 } : null,
    ind: ind ? { t: ind.t, value: ind.pts, player: ind.n, wk: ind.wk, since: ind.wk, final: s.decided.indexOf(17) >= 0 } : null,
    surv: { alive: sv.alive.length, t: sv.alive.length === 1 ? sv.alive[0] : null, final: sv.alive.length === 1 }
  };
}

// ---- 2c. credit awards (APP_DESIGN §10g). Credits are EARNED during the season but only ISSUED after Week 17
// (rulebook key dates; commish 11/6), so rows start as EARNED (shown on the desk, nothing to do). Once Week 17 is final
// in both tiers they flip to PENDING: approve cards on the desk; Approve → the ledger, like perks. One row per award. Weekly high: each final regular-season week, per tier. Season awards when they
// become final. Never creates an award the official Credit_Log already has (2026 "Highest Weekly Score" for that tier + week).
DAILY.AWARD_HEAD = ["award_id", "ts", "tier", "owner", "team", "award", "credits", "week", "detail", "status", "updated_ts", "reason", "sync"];
function dAwardsTab_() { var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName("Awards"); if (!sh) { sh = ss.insertSheet("Awards"); sh.appendRow(DAILY.AWARD_HEAD); sh.setFrozenRows(1); } return sh; }
function dLogged_() { // keys like "U:9" for 2026 weekly-high rows already in data/Credit_Log.csv on main
  var out = {}; try { var r = UrlFetchApp.fetch("https://raw.githubusercontent.com/" + REPO + "/main/data/Credit_Log.csv?t=" + Date.now(), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    Utilities.parseCsv(r.getContentText()).forEach(function (x) { if (String(x[0]).trim() !== "2026" || !/highest weekly/i.test(x[4] || "")) return;
      var m = /(Upper|Lower)[^0-9]*Week\s*(\d+)/i.exec(x[7] || ""); if (m) out[(m[1][0].toUpperCase()) + ":" + (+m[2])] = 1; }); } catch (e) { return null; }
  return out;
}
function dAwards_(snap) {
  var sh = dAwardsTab_(), have = {}; sh.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) have[r[0]] = 1; });
  var logged = dLogged_(); if (logged === null) return 0; // can't see the official log: don't risk a double award
  var rows = [], now = new Date(), TN = { U: "Upper", L: "Lower" };
  var add = function (id, tier, teamId, award, cr, wk, detail) { if (have[id] || teamId == null) return; var t = snap.tiers[tier].teams[teamId] || {}; if (!t.owner) return;
    rows.push([id, now, tier, t.owner, t.team, award, cr, wk || "", detail, "EARNED", now, "", ""]); have[id] = 1; };
  Object.keys(snap.tiers).forEach(function (tier) { var S = snap.tiers[tier], R = S.races || {};
    (S.highs || []).forEach(function (h) { if (h.wk <= REG_WEEKS && !logged[tier + ":" + h.wk]) add("AW" + tier + ("0" + h.wk).slice(-2), tier, h.id, "Highest Weekly Score", 1, h.wk, TN[tier] + "-Tier Week " + h.wk + " · " + h.pts.toFixed(2)); });
    if (R.pts && R.pts.final) add("AW" + tier + "PTS", tier, R.pts.t, "Most Team Points Scored", 5, "", TN[tier] + "-Tier · " + R.pts.value.toFixed(2) + " regular-season points");
    if (R.blow && R.blow.final) add("AW" + tier + "BLOW", tier, R.blow.t, "Largest Blowout Victory", 3, R.blow.wk, TN[tier] + "-Tier · Week " + R.blow.wk + " · " + R.blow.value.toFixed(2) + " over " + ((S.teams[R.blow.over] || {}).team || "?"));
    if (R.ind && R.ind.final) add("AW" + tier + "IND", tier, R.ind.t, "Individual High Score", 3, R.ind.wk, TN[tier] + "-Tier · Week " + R.ind.wk + " · " + R.ind.player + " " + R.ind.value.toFixed(2));
    if (R.surv && R.surv.final) add("AW" + tier + "SURV", tier, R.surv.t, "Survivor Bonus", 5, "", TN[tier] + "-Tier Survivor winner");
  });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, DAILY.AWARD_HEAD.length).setValues(rows);
  var seasonDone = Object.keys(snap.tiers).every(function (t) { return snap.tiers[t].decided.indexOf(17) >= 0; }), flipped = 0;
  if (seasonDone) rows_("Awards").forEach(function (a) { if (a.status === "EARNED") { setCell_("Awards", a._row, "status", "PENDING"); flipped++; } });
  if (flipped) deskPost_("note", "🏅 Season's over: " + flipped + " credit award" + (flipped === 1 ? " is" : "s are") + " ready to issue. Approve them in To do.", "", "AWARDS_READY");
  return rows.length;
}

// ---- 3. rosters + moves ---------------------------------------------------------------------------------
function dMoves_(tier) {
  CacheService.getScriptCache().remove("rost_" + tier);
  var r = rosters_(tier); if (!r.ok || r.stale) throw new Error("ESPN rosters didn't come back for " + tier);
  var now = {}, info = {}; r.teams.forEach(function (t) { now[t.team] = {}; t.players.forEach(function (p) { now[t.team][p.id] = 1; info[p.id] = p; }); });
  var key = "roster_ids_" + tier, prev = dGet_(key), moves = [];
  if (prev) {
    var lost = {}, got = {};
    Object.keys(now).forEach(function (team) { var was = (prev.ids || {})[team] || {};
      Object.keys(now[team]).forEach(function (id) { if (!was[id]) got[id] = team; });
      Object.keys(was).forEach(function (id) { if (!now[team][id]) lost[id] = team; }); });
    var owner = {}; r.teams.forEach(function (t) { owner[t.team] = t.owner; });
    var pinfo = Object.assign({}, prev.info || {}, info);
    Object.keys(got).forEach(function (id) { var p = pinfo[id] || {}, from = lost[id];
      moves.push([new Date(), tier, owner[got[id]] || "", got[id], from ? "trade" : "add", p.n || id, p.pos || "", p.tm || "", from || ""]); delete lost[id]; });
    Object.keys(lost).forEach(function (id) { var p = pinfo[id] || {}; moves.push([new Date(), tier, owner[lost[id]] || "", lost[id], "drop", p.n || id, p.pos || "", p.tm || "", ""]); });
    if (moves.length) { var sh = dTab_("Moves"); sh.getRange(sh.getLastRow() + 1, 1, moves.length, DAILY.MOVE_HEAD.length).setValues(moves);
      // 📰 the tier's chat hears about trades only (commish 11/7: free-agent adds and drops were too much noise; they stay in Moves)
      var tr = moves.filter(function (m) { return m[4] === "trade"; });
      if (tr.length) { var ic = { trade: "🔁" }, ln = tr.slice(0, 8).map(function (m) { return ic[m[4]] + " " + (m[3] || "?") + (m[4] === "trade" ? " got " + m[5] + " from " + m[8] : m[4] === "add" ? " added " + m[5] : " dropped " + m[5]); });
      try { post_("tier:" + tier, BOT, "text", "🔁 Trade on ESPN\n" + ln.join("\n") + (tr.length > 8 ? "\n+" + (tr.length - 8) + " more" : ""), "", "", [], ""); } catch (e) {} } }
  }
  var slim = {}; Object.keys(info).forEach(function (id) { slim[id] = { n: info[id].n, pos: info[id].pos, tm: info[id].tm }; });
  dPut_(key, { at: new Date().toISOString(), ids: now, info: slim });
  return moves.length;
}
// 💰 Waiver auction (commish 11/9: the wire should be the FAAB report, not every add and drop): ESPN's waiver claims
// for this week and last (view=mTransactions2), winners and, when ESPN shows them, the losing bids. Kept 3 weeks under
// Daily key faab_<tier>; names from the rosters dMoves_ just saved (run it after dMoves_).
function dFaab_(tier, s) {
  var key = "faab_" + tier, old = dGet_(key) || {}, byId = {}, names = (dGet_("roster_ids_" + tier) || {}).info || {}, teams = s.teams || {}, n = 0;
  (old.list || []).forEach(function (x) { byId[x.id] = x; });
  var cur = Number(s.week) || (Number(s.last) || 0) + 1;
  [cur, cur - 1].forEach(function (sp) { if (sp < 1) return;
    var d = espn_(LEAGUES[tier], "view=mTransactions2&scoringPeriodId=" + sp);
    (d.transactions || []).forEach(function (t) {
      if (t.type !== "WAIVER" || !/^(EXECUTED|FAILED)/.test(String(t.status || ""))) return;
      var add = (t.items || []).filter(function (i) { return i.type === "ADD"; })[0]; if (!add) return;
      var id = String(t.id), was = byId[id] || {}, p = names[add.playerId] || {}, tm = teams[t.teamId] || {};
      if (!byId[id]) n++;
      byId[id] = { id: id, at: Number(t.processDate || t.proposedDate) || Date.now(), wk: sp, team: tm.team || was.team || "", owner: tm.owner || was.owner || "",
        bid: Number(t.bidAmount) || 0, won: t.status === "EXECUTED", pid: add.playerId, n: p.n || was.n || "", pos: p.pos || was.pos || "", tm: p.tm || was.tm || "" };
    });
  });
  var list = Object.keys(byId).map(function (k) { return byId[k]; }).filter(function (x) { return Date.now() - x.at < 21 * 864e5; })
    .sort(function (a, b) { return b.at - a.at; }).slice(0, 400);
  dPut_(key, { at: new Date().toISOString(), list: list });
  return n;
}
function dRecentMoves_(days) {
  var sh = SpreadsheetApp.getActive().getSheetByName("Moves"); if (!sh || sh.getLastRow() < 2) return [];
  var since = Date.now() - days * 864e5, n = Math.min(400, sh.getLastRow() - 1);
  return sh.getRange(sh.getLastRow() - n + 1, 1, n, DAILY.MOVE_HEAD.length).getValues().filter(function (r) { return new Date(r[0]).getTime() > since; })
    .map(function (r) { return { ts: new Date(r[0]).toISOString(), tier: r[1], owner: r[2], team: r[3], type: r[4], player: r[5], pos: r[6], nfl: r[7], other: r[8] }; }).reverse();
}

// ---- 4. feedback digest -----------------------------------------------------------------------------------
function dDigest_(since) {
  var ss = SpreadsheetApp.getActive(), fb = ss.getSheetByName("Feedback"), tl = ss.getSheetByName("TapLog"), lines = [], who = {};
  if (fb) rows_("Feedback").forEach(function (f) { if (new Date(f.ts).getTime() > since) { var w = who[f.owner] = who[f.owner] || { fb: 0, up: 0, down: 0, taps: 0 }; w.fb++; if (f.mood === "up") w.up++; if (f.mood === "down") w.down++; } });
  if (tl && tl.getLastRow() > 1) { var n = Math.min(4000, tl.getLastRow() - 1);
    tl.getRange(tl.getLastRow() - n + 1, 1, n, 2).getValues().forEach(function (r) { if (new Date(r[0]).getTime() > since) { var w = who[r[1]] = who[r[1]] || { fb: 0, up: 0, down: 0, taps: 0 }; w.taps++; } }); }
  Object.keys(who).forEach(function (o) { var w = who[o]; lines.push((teamName_(o) || o) + ": " + w.taps + " taps" + (w.fb ? ", " + w.fb + " feedback (" + w.up + "👍 " + w.down + "👎)" : "")); });
  return lines;
}

// ---- the run ------------------------------------------------------------------------------------------------
DAILY.run = function (why) {
  var t0 = Date.now(), log = [], problems = [], props = PropertiesService.getScriptProperties(), last = {};
  try { last = JSON.parse(props.getProperty("LAST_DAILY") || "{}"); } catch (e) {}
  var snap = { at: new Date().toISOString(), tiers: {} };
  ["U", "L"].forEach(function (tier) {
    try {
      var s = dScores_(tier), coach = dGet_("coach4_" + tier) || {};
      s.decided.forEach(function (wk) { if ((!coach[wk] || !coach[wk].st) && Date.now() - t0 < 200000) { try { coach[wk] = dCoach_(tier, wk, s.teams); } catch (e) { problems.push("Coach " + tier + " wk " + wk + ": " + e.message); } } });
      dPut_("coach4_" + tier, coach);
      var pw = {}; Object.keys(coach).forEach(function (wk) { var p = coach[wk].pts || {}; Object.keys(p).forEach(function (id) { (pw[id] = pw[id] || {})[wk] = p[id]; }); });
      dPut_("pweeks_" + tier, pw);
      var ps = {}; Object.keys(coach).forEach(function (wk) { var x = coach[wk].st || {}; Object.keys(x).forEach(function (id) { ps[id] = ps[id] || []; if (x[id]) ps[id].push(+wk); }); }); // [] = rostered but never started
      dPut_("pstart_" + tier, ps); // id -> weeks he was in that week's starting lineup
      var slim = {}; Object.keys(coach).forEach(function (wk) { slim[wk] = { wk: coach[wk].wk, board: coach[wk].board, winner: coach[wk].winner }; });
      s.coach = slim; s.races = dRaces_(s, coach); snap.tiers[tier] = s;
      var prevLast = (last.weeks || {})[tier] || 0;
      if (s.last > prevLast && prevLast) { log.push((tier === "U" ? "Upper" : "Lower") + " week " + s.last + " is final");
        // 📊 the league room gets the week's wrap: Coach of the Week + high score for this tier (commish 11/7)
        try { var cw = (coach[s.last] || {}).winner, hi = (s.highs || []).filter(function (h) { return h.wk === s.last; })[0], tn = function (id) { return ((s.teams || {})[id] || {}).team || "?"; };
          post_("league", BOT, "text", "📊 " + (tier === "U" ? "Upper" : "Lower") + " Week " + s.last + " is final." + (cw != null ? "\n🏆 Coach of the Week: " + tn(cw) : "") + (hi ? "\n🚀 High score: " + tn(hi.id) + ", " + hi.pts : ""), "", "", [], ""); } catch (e) {} }
    } catch (e) { problems.push((tier === "U" ? "Upper" : "Lower") + " scores: " + e.message); }
    try { var m = dMoves_(tier); if (m) log.push(m + " roster move" + (m === 1 ? "" : "s") + " (" + (tier === "U" ? "Upper" : "Lower") + ")"); }
    catch (e) { problems.push((tier === "U" ? "Upper" : "Lower") + " rosters: " + e.message); }
    try { if (snap.tiers[tier]) { var fb = dFaab_(tier, snap.tiers[tier]); if (fb) log.push(fb + " waiver bid" + (fb === 1 ? "" : "s") + " (" + (tier === "U" ? "Upper" : "Lower") + ")"); } }
    catch (e) { problems.push((tier === "U" ? "Upper" : "Lower") + " waivers: " + e.message); }
  });
  if (Object.keys(snap.tiers).length) dPut_("snapshot", snap);
  try { var na = Object.keys(snap.tiers).length === 2 ? dAwards_(snap) : 0; if (na) log.push(na + " credit award" + (na === 1 ? "" : "s") + " earned (issued after Wk 17)"); } catch (e) { problems.push("Awards: " + e.message); }
  var digest = []; try { digest = dDigest_(last.at ? new Date(last.at).getTime() : Date.now() - 864e5); } catch (e) {}
  var tk = tickInfo_(), tkAge = tk.at ? (Date.now() - new Date(tk.at).getTime()) / 6e4 : null;
  if (why === "tick" ? false : tkAge === null || tkAge > 60) problems.push("the 15-minute robot hasn't run in " + (tkAge === null ? "ever" : Math.round(tkAge) + " min"));
  var weeks = {}; Object.keys(snap.tiers).forEach(function (t) { weeks[t] = snap.tiers[t].last; });
  var lines = "skipped"; if (Object.keys(snap.tiers).length) { try { lines = DAILY.afterRun(); } catch (e) { lines = "error: " + e.message; } }
  props.setProperty("LAST_DAILY", JSON.stringify({ at: snap.at, why: why || "", slot: DAILY.slot(), ver: DAILY.VER, lines: lines, weeks: Object.keys(weeks).length ? weeks : (last.weeks || {}), log: log.slice(0, 20), problems: problems.slice(0, 20), secs: Math.round((Date.now() - t0) / 1000) }));
  if (log.length || digest.length) deskPost_("robot", ("🌅 Daily run" + (log.length ? ": " + log.join(" · ") : "") + (digest.length ? "\n🧪 Beta: " + digest.join(" · ") : "")).slice(0, CHAT_MAX), "", "OK");
  if (problems.length) deskPost_("alert", "Daily run trouble: " + problems.join(" · "), "", "DAILY");
  return { ok: !problems.length, log: log, problems: problems, digest: digest };
};
// Two slots a day in Eastern time: "YYYY-MM-DD am" from 5 AM, "pm" from 5 PM. null before 5 AM.
DAILY.slot = function () {
  var d = new Date(), day = Utilities.formatDate(d, "America/New_York", "yyyy-MM-dd"), h = +Utilities.formatDate(d, "America/New_York", "H");
  return h >= 17 ? day + " pm" : h >= 5 ? day + " am" : null;
};
DAILY.due = function () {
  var s = DAILY.slot(); if (!s) return false; var last = {};
  try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_DAILY") || "{}"); } catch (e) {}
  return last.slot !== s || last.ver !== DAILY.VER;
};
// Week-by-week fantasy points per ESPN player id for a tier (only weeks the player was on a roster in that tier).
DAILY.playerWeeks = function (tier) { return dGet_("pweeks_" + tier) || {}; };
DAILY.playerStarts = function (tier) { return dGet_("pstart_" + tier) || {}; };
DAILY.snapshot = function () { return dGet_("snapshot") || {}; }; // the desk reads the 👻 Ghost par list from it
// What the app reads (GET ?action=daily): the snapshot + the last 7 days of moves + the card lines + run info.
DAILY.view = function () {
  var snap = dGet_("snapshot"), info = {};
  try { info = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_DAILY") || "{}"); } catch (e) {}
  var faab = {}; ["U", "L"].forEach(function (t) { var f = dGet_("faab_" + t); if (f) faab[t] = f.list || []; });
  return { ok: !!snap, snapshot: snap, moves: dRecentMoves_(7), faab: faab, lines: dGet_("lines") || null, run: info };
};
// After a run: ask GitHub to start the card-lines workflow (Claude writes the lines, posts them back via putlines).
// Uses the GITHUB_TOKEN Script property (contents: write is enough for repository_dispatch).
// 🗞️ Drops, step 1 (commish 11/9: the Week 8 headline changed between runs): card lines are published ONCE per final week
// and then kept. The first lines after a week goes final (both tiers) are saved as lines_w<N>; later runs don't start the
// card-lines robot again, and a late putlines for a week that's out is ignored. Lines written before this change are
// adopted as that week's drop (no rewrite).
function dFinalWk_() { var T = (dGet_("snapshot") || {}).tiers || {}; return Math.min((T.U || {}).last || 0, (T.L || {}).last || 0); }
DAILY.afterRun = function () {
  var wk = dFinalWk_();
  if (wk) { if (dGet_("lines_w" + wk)) return "kept: Week " + wk + " lines are out";
    var cur = dGet_("lines"); if (cur && cur.week == null) { cur.week = wk; cur.published = cur.at || new Date().toISOString(); dPut_("lines_w" + wk, cur); dPut_("lines", cur); try { elitePost_(cur); } catch (e) {} return "kept: adopted Week " + wk + " lines"; } }
  var token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN"); if (!token) return "off: add the GITHUB_TOKEN Script property";
  var r = UrlFetchApp.fetch("https://api.github.com/repos/" + REPO + "/dispatches", { method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }, payload: JSON.stringify({ event_type: "daily-lines" }) });
  if (r.getResponseCode() >= 300) { deskPost_("alert", "Couldn't start the card-lines robot (GitHub said " + r.getResponseCode() + "). Cards show plain facts until it works.", "", "DAILY"); return "GitHub said " + r.getResponseCode(); }
  return "started";
};
DAILY.putLines = function (lines) {
  var wk = dFinalWk_(); if (wk && dGet_("lines_w" + wk)) return { kept: wk };
  lines.week = wk || null; lines.published = new Date().toISOString(); if (wk) dPut_("lines_w" + wk, lines); dPut_("lines", lines); return { saved: wk };
};
DAILY.get = function (k) { return dGet_(k); }; DAILY.put = function (k, v) { dPut_(k, v); }; // the Daily tab, for the core and parts (⭐ elite5_hist)
