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
  return { tier: tier, week: cur, decided: decided, last: decided.length ? decided[decided.length - 1] : 0, teams: teams, table: table,
    games: games.map(function (g) { return [g.wk, g.h, g.hp, g.a, g.ap, g.win, g.po ? 1 : 0]; }), survivor: { alive: alive.map(Number), out: out }, highs: highs };
}
function r2_(x) { return Math.round((Number(x) || 0) * 100) / 100; }

// ---- 2. Coach of the Week (same rule as the robot: fewest points left on the bench; bye / empty / 0-pt starter = out)
var D_SLOTS_ = {};
function dCoach_(tier, wk, teams) {
  var base = D_SLOTS_[tier] = D_SLOTS_[tier] || espn_(LEAGUES[tier], "view=mSettings"), counts = ((base.settings || {}).rosterSettings || {}).lineupSlotCounts || {}, slots = [];
  Object.keys(counts).forEach(function (s) { var id = +s; if (id !== 20 && id !== 21) for (var c = 0; c < counts[s]; c++) slots.push(id); });
  var box = espn_(LEAGUES[tier], "view=mMatchupScore&view=mBoxscore&scoringPeriodId=" + wk), pro = {};
  try { pro = proGames_(wk); } catch (e) {}
  var board = [];
  (box.schedule || []).filter(function (g) { return g.matchupPeriodId === wk; }).forEach(function (g) {
    [g.home, g.away].forEach(function (sd) {
      if (!sd || !teams[sd.teamId] || teams[sd.teamId].ghost) return;
      var ents = ((sd.rosterForCurrentScoringPeriod || sd.rosterForMatchupPeriod || {}).entries) || [], out = "";
      var ps = ents.map(function (e) { var pl = (e.playerPoolEntry || {}).player || {}, st = pl.stats || [];
        var act = st.filter(function (x) { return x.scoringPeriodId === wk && x.statSourceId === 0; })[0];
        var pts = act ? act.appliedTotal : ((e.playerPoolEntry || {}).appliedStatTotal || 0);
        return { n: pl.fullName || "?", sid: e.lineupSlotId, pts: r2_(pts), el: pl.eligibleSlots || [], bye: !!pl.proTeamId && pro && Object.keys(pro).length && !pro[pl.proTeamId] }; });
      var starters = ps.filter(function (x) { return x.sid !== 20 && x.sid !== 21; }), pool = ps.filter(function (x) { return x.sid !== 21; });
      if (starters.length < slots.length) out = "empty slot";
      else if (starters.some(function (x) { return x.bye; })) out = "started a player on bye";
      else if (starters.some(function (x) { return !x.pts; })) out = "0-point starter";
      var sum = starters.reduce(function (a, x) { return a + x.pts; }, 0), best = bestLineup_(slots, pool.map(function (x) { return [x.pts, x.el]; }));
      board.push({ id: sd.teamId, scored: r2_(sum), best: r2_(best.pts), gap: r2_(best.pts - sum), out: out });
    });
  });
  board.sort(function (a, b) { return (a.out ? 1 : 0) - (b.out ? 1 : 0) || a.gap - b.gap; });
  return { wk: wk, board: board, winner: board[0] && !board[0].out ? board[0].id : null };
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
    if (moves.length) { var sh = dTab_("Moves"); sh.getRange(sh.getLastRow() + 1, 1, moves.length, DAILY.MOVE_HEAD.length).setValues(moves); }
  }
  var slim = {}; Object.keys(info).forEach(function (id) { slim[id] = { n: info[id].n, pos: info[id].pos, tm: info[id].tm }; });
  dPut_(key, { at: new Date().toISOString(), ids: now, info: slim });
  return moves.length;
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
      var s = dScores_(tier), coach = dGet_("coach_" + tier) || {};
      s.decided.forEach(function (wk) { if (!coach[wk] && Date.now() - t0 < 200000) { try { coach[wk] = dCoach_(tier, wk, s.teams); } catch (e) { problems.push("Coach " + tier + " wk " + wk + ": " + e.message); } } });
      dPut_("coach_" + tier, coach);
      s.coach = coach; snap.tiers[tier] = s;
      var prevLast = (last.weeks || {})[tier] || 0;
      if (s.last > prevLast && prevLast) log.push((tier === "U" ? "Upper" : "Lower") + " week " + s.last + " is final");
    } catch (e) { problems.push((tier === "U" ? "Upper" : "Lower") + " scores: " + e.message); }
    try { var m = dMoves_(tier); if (m) log.push(m + " roster move" + (m === 1 ? "" : "s") + " (" + (tier === "U" ? "Upper" : "Lower") + ")"); }
    catch (e) { problems.push((tier === "U" ? "Upper" : "Lower") + " rosters: " + e.message); }
  });
  if (Object.keys(snap.tiers).length) dPut_("snapshot", snap);
  var digest = []; try { digest = dDigest_(last.at ? new Date(last.at).getTime() : Date.now() - 864e5); } catch (e) {}
  var tk = tickInfo_(), tkAge = tk.at ? (Date.now() - new Date(tk.at).getTime()) / 6e4 : null;
  if (why === "tick" ? false : tkAge === null || tkAge > 60) problems.push("the 15-minute robot hasn't run in " + (tkAge === null ? "ever" : Math.round(tkAge) + " min"));
  var weeks = {}; Object.keys(snap.tiers).forEach(function (t) { weeks[t] = snap.tiers[t].last; });
  props.setProperty("LAST_DAILY", JSON.stringify({ at: snap.at, why: why || "", slot: DAILY.slot(), weeks: Object.keys(weeks).length ? weeks : (last.weeks || {}), log: log, problems: problems, secs: Math.round((Date.now() - t0) / 1000) }));
  if (log.length || digest.length) deskPost_("robot", ("🌅 Daily run" + (log.length ? ": " + log.join(" · ") : "") + (digest.length ? "\n🧪 Beta: " + digest.join(" · ") : "")).slice(0, CHAT_MAX), "", "OK");
  if (problems.length) deskPost_("alert", "Daily run trouble: " + problems.join(" · "), "", "DAILY");
  try { DAILY.afterRun(); } catch (e) {}
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
  return last.slot !== s;
};
// What the app reads (GET ?action=daily): the snapshot + the last 7 days of moves + the card lines + run info.
DAILY.view = function () {
  var snap = dGet_("snapshot"), info = {};
  try { info = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_DAILY") || "{}"); } catch (e) {}
  return { ok: !!snap, snapshot: snap, moves: dRecentMoves_(7), lines: dGet_("lines") || null, run: info };
};
DAILY.afterRun = function () {}; // card-line writer hooks in here (APP_DESIGN §10g)
