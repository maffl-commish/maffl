/**
 * MAFFL HQ App backend PART: ESPN reads: live scoring + box scores (live_), real rosters (rosters_), best-lineup solver, NFL schedule, stat lines.
 * Not standalone: logic.js (the core) evaluates this file inside its own scope (see parts_ in logic.js), so it uses the
 * core's helpers by plain name and its functions are callable from every other part. Bump VERSION in logic.js when you
 * change this file. Keep it under ~90 KB.
 */
// ---------------------------------------------------------------- LIVE scoring (ESPN → compact JSON, 45 s cache)
// Needs Script Properties ESPN_S2 and SWID (Apps Script → Project Settings → Script properties). Same cookies
// the Tuesday robot uses. Reads only, except the ESPN write test at the bottom (test league only, APP_DESIGN §10b).
var LEAGUES = { U: 34467, L: 1587593698 }, SEASON = 2026;
var POS = { 1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 7: "P", 9: "DT", 10: "DE", 11: "LB", 12: "CB", 13: "S", 14: "HC", 16: "D/ST" };
var PRO = { 1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET", 9: "GB", 10: "TEN", 11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA", 16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ", 21: "PHI", 22: "ARI", 23: "PIT", 24: "LAC", 25: "SF", 26: "SEA", 27: "TB", 28: "WSH", 29: "CAR", 30: "JAX", 33: "BAL", 34: "HOU" };
// NFL games for a scoring period: proTeamId -> { opp: "@CIN" | "vs NE", kick: ms }. Public ESPN view, cached 6 h.
function proGames_(sp) {
  var cache = CacheService.getScriptCache(), key = "pro_" + SEASON + "_" + sp, hit = cache.get(key); if (hit) return JSON.parse(hit);
  var out = {};
  try {
    var r = UrlFetchApp.fetch("https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/" + SEASON + "?view=proTeamSchedules_wl", { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) (((JSON.parse(r.getContentText()).settings || {}).proTeams) || []).forEach(function (t) {
      var g = ((t.proGamesByScoringPeriod || {})[sp] || [])[0]; if (!g) return;
      var home = g.homeProTeamId === t.id, o = home ? g.awayProTeamId : g.homeProTeamId;
      out[t.id] = { opp: (home ? "vs " : "@") + (PRO[o] || "?"), kick: g.date };
    });
  } catch (e) {}
  cache.put(key, JSON.stringify(out), 21600); return out;
}
// One short ESPN-style stat line from the raw stat map (ESPN stat ids).
function statLine_(pos, st) {
  if (!st) return "";
  function v(id) { return Math.round(Number(st[id]) || 0); }
  var b = [];
  if (pos === "QB") { if (v(0)) b.push(v(1) + "/" + v(0) + ", " + v(3) + " yd"); if (v(4)) b.push(v(4) + " TD"); if (v(20)) b.push(v(20) + " INT"); if (v(24)) b.push(v(23) + "-" + v(24) + " rush"); if (v(25)) b.push(v(25) + " rush TD"); }
  else if (pos === "RB" || pos === "WR" || pos === "TE") {
    var ru = v(23) ? v(23) + "-" + v(24) + " rush" : "", rc = v(53) || v(58) ? v(53) + "/" + v(58) + " rec, " + v(42) + " yd" : "";
    (pos === "RB" ? [ru, rc] : [rc, ru]).forEach(function (x) { if (x) b.push(x); }); var td = v(25) + v(43); if (td) b.push(td + " TD");
  } else if (pos === "K") { if (v(84)) b.push(v(83) + "/" + v(84) + " FG"); if (v(87)) b.push(v(86) + "/" + v(87) + " XP"); }
  else if (pos === "D/ST") { if (v(120) || v(99) || v(95)) b.push(v(120) + " PA"); if (v(99)) b.push(v(99) + " sk"); if (v(95)) b.push(v(95) + " INT"); if (v(96)) b.push(v(96) + " FR"); if (v(105)) b.push(v(105) + " TD"); }
  if (v(72)) b.push(v(72) + " FUM");
  return b.join(" · ");
}
var SLOT = { 0: "QB", 1: "TQB", 2: "RB", 3: "RB/WR", 4: "WR", 5: "WR/TE", 6: "TE", 7: "OP", 8: "DT", 9: "DE", 10: "LB", 11: "DL", 12: "CB", 13: "S", 14: "DB", 15: "DP", 16: "D/ST", 17: "K", 18: "P", 19: "HC", 20: "BE", 21: "IR", 23: "FLEX", 24: "ER" };
// Accepts one shared cookie pair (ESPN_S2 / SWID) or one per league: any property whose name starts with
// ESPN_S2 or SWID and mentions the tier (U/UPPER/34467 or L/LOWER/1587593698) wins for that tier.
function cookie_(all, base, tier, lid) {
  var keys = Object.keys(all).filter(function (k) { return k.toUpperCase().replace(/[^A-Z0-9]/g, "").indexOf(base) === 0; });
  var tierTags = tier === "L" ? ["LOWER", "L", String(lid)] : ["UPPER", "U", String(lid)];
  var mine = keys.filter(function (k) { var rest = k.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(base.length); return tierTags.indexOf(rest) >= 0; })[0];
  var plain = keys.filter(function (k) { return k.toUpperCase().replace(/[^A-Z0-9]/g, "") === base; })[0];
  var v = all[mine || plain || keys[0]];
  return v ? String(v).trim() : "";
}
function espn_(lid, query) {
  var all = PropertiesService.getScriptProperties().getProperties(), tier = lid === LEAGUES.L ? "L" : "U";
  var s2 = cookie_(all, "ESPNS2", tier, lid), swid = cookie_(all, "SWID", tier, lid);
  if (!s2 || !swid) throw new Error("SETUP: add ESPN_S2 and SWID in Apps Script → Project Settings → Script properties");
  var url = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/" + SEASON + "/segments/0/leagues/" + lid + "?" + query;
  var r = UrlFetchApp.fetch(url, { headers: { Cookie: "espn_s2=" + s2 + "; SWID=" + swid }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) {
    var c6 = CacheService.getScriptCache();
    if ([401, 403].indexOf(r.getResponseCode()) >= 0 && !c6.get("desk_espn")) { c6.put("desk_espn", "1", 21600);
      deskPost_("alert", "ESPN said " + r.getResponseCode() + " to the live feed. The espn_s2 / SWID cookies probably expired: copy fresh ones from your browser into Apps Script → Project Settings → Script properties (and the GitHub secrets ESPN_S2 / SWID).", "", "ESPN"); }
    throw new Error("ESPN said " + r.getResponseCode());
  }
  return JSON.parse(r.getContentText());
}
// Best legal lineup (exact, Hungarian); same rule as the robot's Coach of the Week. slots: [slotId...], players: [[pts, [eligibleSlotIds]]]
function bestLineup_(slots, players) {
  var n = slots.length; if (!n) return { pts: 0, used: [] };
  var cols = players.map(function (p) { return [p[0], p[1]]; }); for (var e = 0; e < n; e++) cols.push([0, null]);
  var m = cols.length, BIG = 1e9, INF = Infinity;
  var cost = slots.map(function (s) { return cols.map(function (c) { return (c[1] === null || c[1].indexOf(s) >= 0) ? -c[0] : BIG; }); });
  var u = new Array(n + 1).fill(0), v = new Array(m + 1).fill(0), p = new Array(m + 1).fill(0), way = new Array(m + 1).fill(0);
  for (var i = 1; i <= n; i++) {
    p[0] = i; var j0 = 0, minv = new Array(m + 1).fill(INF), used = new Array(m + 1).fill(false);
    do {
      used[j0] = true; var i0 = p[j0], delta = INF, j1 = 0;
      for (var j = 1; j <= m; j++) if (!used[j]) { var cur = cost[i0 - 1][j - 1] - u[i0] - v[j]; if (cur < minv[j]) { minv[j] = cur; way[j] = j0; } if (minv[j] < delta) { delta = minv[j]; j1 = j; } }
      for (j = 0; j <= m; j++) { if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
      j0 = j1;
    } while (p[j0] !== 0);
    do { var jj = way[j0]; p[j0] = p[jj]; j0 = jj; } while (j0);
  }
  var pts = 0, usedIdx = [];
  for (var k = 1; k <= m; k++) if (p[k]) { pts += cols[k - 1][0]; if (k - 1 < players.length) usedIdx.push(k - 1); }
  return { pts: pts, used: usedIdx };
}
function live_(tier, week) { // week = an earlier week's box score (REEL result card); finals cached 6 h
  tier = tier === "L" ? "L" : "U"; week = Math.floor(Number(week) || 0);
  var ck = week ? "box_" + tier + "_" + week : "live_" + tier, cache = CacheService.getScriptCache(), hit = cache.get(ck);
  if (hit) return JSON.parse(hit);
  var lid = LEAGUES[tier], base = espn_(lid, "view=mSettings&view=mTeam");
  var mp = (base.status && base.status.currentMatchupPeriod) || base.scoringPeriodId, sp = base.scoringPeriodId || mp;
  if (week && week < mp) { mp = week; sp = week; } else week = 0;
  var counts = ((base.settings || {}).rosterSettings || {}).lineupSlotCounts || {}, slots = [];
  Object.keys(counts).forEach(function (s) { var id = +s; if (id !== 20 && id !== 21) for (var c = 0; c < counts[s]; c++) slots.push(id); });
  var names = {}; (base.teams || []).forEach(function (t) { names[t.id] = t.name || ((t.location || "") + " " + (t.nickname || "")).trim(); });
  var box = espn_(lid, "view=mMatchupScore&view=mBoxscore&view=mScoreboard&scoringPeriodId=" + sp), pro = proGames_(sp);
  function side(sd) {
    if (!sd) return null;
    var ents = ((sd.rosterForCurrentScoringPeriod || sd.rosterForMatchupPeriod || {}).entries) || [];
    var players = ents.map(function (e) {
      var pl = (e.playerPoolEntry || {}).player || {}, st = pl.stats || [];
      var act = st.filter(function (x) { return x.scoringPeriodId === sp && x.statSourceId === 0; })[0], prj = st.filter(function (x) { return x.scoringPeriodId === sp && x.statSourceId === 1; })[0];
      var pts = act ? act.appliedTotal : ((e.playerPoolEntry || {}).appliedStatTotal || 0);
      var pg = pro[pl.proTeamId] || null, pos = POS[pl.defaultPositionId] || "";
      return { n: pl.fullName || "?", pos: pos, slot: SLOT[e.lineupSlotId] || String(e.lineupSlotId), sid: e.lineupSlotId,
        tm: PRO[pl.proTeamId] || "", opp: pg ? pg.opp : (pl.proTeamId ? "BYE" : ""), kick: pg ? pg.kick : null, st: act ? statLine_(pos, act.stats) : "",
        pts: Math.round((pts || 0) * 100) / 100, proj: prj ? Math.round(prj.appliedTotal * 10) / 10 : null, played: !!act, el: pl.eligibleSlots || [] };
    });
    var starters = players.filter(function (x) { return x.sid !== 20 && x.sid !== 21; }), pool = players.filter(function (x) { return x.sid !== 21; });
    var score = sd.totalPointsLive != null ? sd.totalPointsLive : (sd.totalPoints != null ? sd.totalPoints : starters.reduce(function (a, x) { return a + x.pts; }, 0));
    var best = bestLineup_(slots, pool.map(function (x) { return [x.pts, x.el]; }));
    players.forEach(function (x) { delete x.el; delete x.sid; });
    return { team: names[sd.teamId] || ("Team " + sd.teamId), pts: Math.round(score * 100) / 100,
      proj: sd.totalProjectedPointsLive != null ? Math.round(sd.totalProjectedPointsLive * 10) / 10 : null,
      bench: Math.round((best.pts - starters.reduce(function (a, x) { return a + x.pts; }, 0)) * 100) / 100,
      left: starters.filter(function (x) { return !x.played; }).length, players: players };
  }
  // 🎯 Win probability (commish 11/9: match ESPN's). If ESPN's feed carries a win-probability field on the matchup or a side,
  // pass it through as wp (0–100) per side; the first look posts to the desk which field it found, or that there is none
  // (then the app computes its own from ESPN's projections).
  var wpKey = null, findWp = function (o) { var hit = null; Object.keys(o || {}).forEach(function (k) { if (!hit && /prob/i.test(k) && typeof o[k] === "number") hit = k; }); return hit; };
  var wpOf = function (g, sd) { var k = findWp(sd) || null; if (k) { wpKey = wpKey || "side." + k; return sd[k] <= 1 ? Math.round(sd[k] * 1000) / 10 : sd[k]; } return null; };
  var games = (box.schedule || []).filter(function (g) { return g.matchupPeriodId === mp; }).map(function (g) {
    var h = side(g.home), a = side(g.away);
    if (h) h.wp = wpOf(g, g.home); if (a) a.wp = wpOf(g, g.away);
    var gk = findWp(g); if (gk && h && a && h.wp == null) { wpKey = wpKey || "matchup." + gk; var v = g[gk] <= 1 ? g[gk] * 100 : g[gk]; h.wp = Math.round(v * 10) / 10; a.wp = Math.round((100 - v) * 10) / 10; }
    return { home: h, away: a }; });
  try { if (!week && !PropertiesService.getScriptProperties().getProperty("WP_PROBE")) { PropertiesService.getScriptProperties().setProperty("WP_PROBE", wpKey || "none");
    deskPost_("note", wpKey ? "🎯 ESPN sends a win probability (" + wpKey + "): Match now shows ESPN's number." : "🎯 ESPN's matchup feed has no win-probability field: Match shows MAFFL HQ's own estimate from ESPN's projections.", "", "WP"); } } catch (e) {}
  var out = { ok: true, tier: tier, week: mp, at: new Date().toISOString(), games: games };
  out.final = !!week;
  var str = JSON.stringify(out); if (str.length < 95000) cache.put(ck, str, week ? 21600 : 45);
  return out;
}

// Real rosters from ESPN, one tier per call (APP_DESIGN §6b). Cached 30 min; the last good copy is kept 6 h so a
// hiccup at ESPN still shows rosters ("as of" time comes back with them). Owner = the Owners-tab row whose team
// name matches the ESPN team name (same rule as the trade-moved check); unmatched teams come back with owner "".
var ACQ = { DRAFT: "Drafted", ADD: "Waiver add", TRADE: "Traded", FREEAGENT: "Free agent" };
function rosters_(tier) {
  tier = tier === "L" ? "L" : "U";
  var cache = CacheService.getScriptCache(), hit = cache.get("rost_" + tier);
  if (hit) return JSON.parse(hit);
  var d;
  try { d = espn_(LEAGUES[tier], "view=mTeam&view=mRoster"); }
  catch (err) { var old = cache.get("rost_last_" + tier); if (old) { var o = JSON.parse(old); o.stale = true; return o; } throw err; }
  var byTeam = {}; owners_().forEach(function (o) { if (o.team) byTeam[norm_(o.team)] = o.owner; });
  var pweeks = {}, pstart = {}; try { need_("daily"); pweeks = DAILY.playerWeeks(tier); pstart = DAILY.playerStarts(tier); } catch (e) {} // id -> {week: pts} / [weeks started], from the daily run's box scores
  var teams = (d.teams || []).map(function (tm) {
    var name = tm.name || ((tm.location || "") + " " + (tm.nickname || "")).trim();
    var players = (((tm.roster || {}).entries) || []).map(function (e) {
      var ppe = e.playerPoolEntry || {}, pl = ppe.player || {}, st = pl.stats || [];
      var season = st.filter(function (x) { return x.scoringPeriodId === 0 && x.statSourceId === 0 && (x.statSplitTypeId || 0) === 0 && (!x.seasonId || x.seasonId === SEASON); })[0];
      var proj = st.filter(function (x) { return x.scoringPeriodId === 0 && x.statSourceId === 1 && (!x.seasonId || x.seasonId === SEASON); })[0];
      var rk = ((ppe.ratings || {})["0"] || {}), own = (pl.ownership || {}).percentOwned, id = pl.id || e.playerId;
      return { n: pl.fullName || "?", id: id, pos: POS[pl.defaultPositionId] || "", tm: PRO[pl.proTeamId] || "FA",
        slot: SLOT[e.lineupSlotId] || "", acq: ACQ[e.acquisitionType] || "", inj: pl.injuryStatus && pl.injuryStatus !== "ACTIVE" ? String(pl.injuryStatus).replace(/_/g, " ") : "",
        sp: season ? Math.round(season.appliedTotal * 10) / 10 : (ppe.appliedStatTotal != null ? Math.round(ppe.appliedStatTotal * 10) / 10 : null),
        avg: season && season.appliedAverage != null ? Math.round(season.appliedAverage * 10) / 10 : null,
        proj: proj ? Math.round(proj.appliedTotal) : null, own: own != null ? Math.round(own) : null, prk: rk.positionalRanking || null,
        wk: (pweeks[id] || null), ws: (pstart[id] || null) };
    });
    return { team: name, owner: byTeam[norm_(name)] || "", players: players };
  });
  var out = { ok: true, tier: tier, at: new Date().toISOString(), teams: teams }, str = JSON.stringify(out);
  if (str.length < 95000) { cache.put("rost_" + tier, str, 1800); cache.put("rost_last_" + tier, str, 21600); }
  return out;
}


// ---------------------------------------------------------------- 🧪 ESPN writes, experiment 2 (APP_DESIGN §10b)
// Proves the commish writes captured in Chrome (11/25) also work from Apps Script with the stored espn_s2 / SWID.
// HARD-LIMITED to the throwaway "Testing MAFFL HQ" league: espnW_ refuses any other league id. Runs ONCE (Script property
// ESPN_WTEST = tag, set BEFORE any write, so a crash never repeats a write), from the tick. Result: GET ?action=espntest.
var TEST_LEAGUE = 1722387564, WTEST = "t1";
function espnW_(lid, path, body) {
  // Real leagues: only the 👻 Ghost score adjustment on MAFFL Lower (ghostWrite_), nothing else (APP_DESIGN §10b).
  if (lid !== TEST_LEAGUE && !(lid === LEAGUES.L && path === "/schedule" && body && body.ghost === true)) throw new Error("ESPN writes: only the Ghost score on Lower, or the test league");
  if (body && body.ghost === true) body = body.rows;
  var all = PropertiesService.getScriptProperties().getProperties(), s2 = cookie_(all, "ESPNS2", "U", lid), swid = cookie_(all, "SWID", "U", lid);
  if (!s2 || !swid) throw new Error("SETUP: no ESPN cookies");
  var r = UrlFetchApp.fetch("https://lm-api-writes.fantasy.espn.com/apis/v3/games/ffl/seasons/" + SEASON + "/segments/0/leagues/" + lid + path,
    { method: "post", contentType: "application/json", payload: JSON.stringify(body), headers: { Cookie: "espn_s2=" + s2 + "; SWID=" + swid }, muteHttpExceptions: true });
  return { code: r.getResponseCode(), text: String(r.getContentText()).slice(0, 300) };
}
function espnWriteTest_(force) {
  var props = PropertiesService.getScriptProperties();
  if (!force && props.getProperty("ESPN_WTEST") === WTEST) return null;
  props.setProperty("ESPN_WTEST", WTEST); // before any write: no retries, ever
  var out = { ok: false, tag: WTEST, at: new Date().toISOString(), league: TEST_LEAGUE, steps: [] };
  function step(name, fn) { try { var x = fn(); x.name = name; out.steps.push(x); return x; } catch (e) { out.steps.push({ name: name, ok: false, error: String(e.message || e).slice(0, 200) }); return null; } }
  var st = step("read", function () {
    var d = espn_(TEST_LEAGUE, "view=mMatchupScore&view=mRoster&view=mStatus");
    var m = (d.schedule || []).filter(function (x) { return x.id === 24; })[0];
    var teams = (d.teams || []).map(function (t) { return { id: t.id, players: ((t.roster || {}).entries || []).map(function (e) { return e.playerId; }) }; });
    return { ok: !!m, sp: (d.status || {}).latestScoringPeriod || d.scoringPeriodId, m: m && { away: m.away.teamId, home: m.home.teamId, adj: m.away.adjustment, hadj: m.home.adjustment || 0, hrs: m.home.adjustmentReason || "" }, teams: teams };
  });
  if (st && st.ok) {
    step("score", function () {
      var target = st.m.adj === 120.55 ? 121.55 : 120.55;
      var w = espnW_(TEST_LEAGUE, "/schedule", [{ id: 24, away: { teamId: st.m.away, adjustment: target, adjustmentReason: "MAFFL HQ backend test" }, home: { teamId: st.m.home, adjustment: st.m.hadj, adjustmentReason: st.m.hrs } }]);
      var back = ((espn_(TEST_LEAGUE, "view=mMatchupScore").schedule || []).filter(function (x) { return x.id === 24; })[0] || {}).away || {};
      return { ok: w.code === 200 && back.adjustment === target, code: w.code, before: st.m.adj, target: target, readBack: back.adjustment, resp: w.code === 200 ? "" : w.text };
    });
    step("trade", function () {
      var from = st.teams.filter(function (t) { return t.players.length; })[0]; if (!from) return { ok: false, error: "no team has players" };
      var to = st.teams.filter(function (t) { return t.id !== from.id; })[0], moving = from.players.slice(0, 2);
      var swid = cookie_(PropertiesService.getScriptProperties().getProperties(), "SWID", "U", TEST_LEAGUE); if (swid.charAt(0) !== "{") swid = "{" + swid + "}";
      var w = espnW_(TEST_LEAGUE, "/transactions/", { isLeagueManager: true, teamId: from.id, type: "TRADE_PROPOSAL", memberId: swid, scoringPeriodId: st.sp, executionType: "EXECUTE",
        items: moving.map(function (p) { return { playerId: p, type: "TRADE", fromTeamId: from.id, toTeamId: to.id }; }), expirationDate: null, comment: "MAFFL HQ backend test", isActingAsTeamOwner: false, skipTransactionCounters: false });
      var now = (espn_(TEST_LEAGUE, "view=mRoster").teams || []).filter(function (t) { return t.id === to.id; })[0] || {};
      var ids = ((now.roster || {}).entries || []).map(function (e) { return e.playerId; });
      return { ok: w.code === 200 && moving.every(function (p) { return ids.indexOf(p) >= 0; }), code: w.code, from: from.id, to: to.id, moved: moving, resp: w.code === 200 ? "" : w.text };
    });
  }
  out.ok = out.steps.length === 3 && out.steps.every(function (x) { return x.ok; });
  props.setProperty("ESPN_WTEST_RESULT", JSON.stringify(out).slice(0, 8000));
  try { deskPost_("note", "🧪 ESPN write test (test league): " + out.steps.map(function (x) { return x.name + " " + (x.ok ? "✅" : "❌"); }).join(" · "), "", "ESPNTEST"); } catch (e) {}
  return out;
}

// ---------------------------------------------------------------- 👻 Ghost score → ESPN (commish taps "Send to ESPN" on the desk)
// The tap IS the confirm (first season: never on its own). Sets only the Ghost's side of its game that week so ESPN's total
// equals the par (adjustment = par − the Ghost's points without adjustment), keeps the opponent's side as it was, then reads
// ESPN back. One try per tap, no retries; a 2-minute guard stops a double tap. ✓ read-back logs espn_done (the step clears).
function ghostWrite_(me, stepId) {
  var step = ghostSteps_({}, {}).filter(function (g) { return g.id === stepId; })[0];
  if (!step) return { ok: false, error: "That Ghost step is gone (already on ESPN?). Refresh." };
  if (step.tier !== "L") return { ok: false, error: "Ghost writes are Lower only" };
  var par = Math.round(Number(step.par) * 100) / 100, wk = Number(step.week);
  if (!(par > 40 && par < 260) || !(wk >= 1 && wk <= 18)) return { ok: false, error: "Par " + par + " / week " + wk + " looks wrong. Do this one by hand." };
  var c = CacheService.getScriptCache(), gk = "gw:" + stepId; if (c.get(gk)) return { ok: false, error: "Already sent a minute ago. Refresh in 2 minutes." }; c.put(gk, "1", 120);
  function game(d) {
    var gid = ((d.teams || []).filter(function (t) { return /ghost/i.test(t.name || ((t.location || "") + " " + (t.nickname || ""))); })[0] || {}).id;
    var m = (d.schedule || []).filter(function (x) { return x.matchupPeriodId === wk && x.home && x.away && (x.home.teamId === gid || x.away.teamId === gid); })[0];
    return gid && m ? { gid: gid, m: m, side: m.home.teamId === gid ? "home" : "away" } : null;
  }
  var g = game(espn_(LEAGUES.L, "view=mMatchupScore&view=mTeam"));
  if (!g) return { ok: false, error: "Couldn't find the Ghost's Week " + wk + " game on ESPN. Do this one by hand." };
  var other = g.side === "home" ? "away" : "home", gs = g.m[g.side], os = g.m[other];
  var base = Math.round(((Number(gs.totalPoints) || 0) - (Number(gs.adjustment) || 0)) * 100) / 100, adj = Math.round((par - base) * 100) / 100;
  var row = { id: g.m.id }; row[g.side] = { teamId: g.gid, adjustment: adj, adjustmentReason: "Ghost par (MAFFL HQ)" };
  row[other] = { teamId: os.teamId, adjustment: Number(os.adjustment) || 0, adjustmentReason: os.adjustmentReason || "" };
  var w = espnW_(LEAGUES.L, "/schedule", { ghost: true, rows: [row] });
  var g2 = game(espn_(LEAGUES.L, "view=mMatchupScore&view=mTeam")), now = g2 ? Number(g2.m[g2.side].totalPoints) : NaN, oNow = g2 ? Number(g2.m[other].adjustment) || 0 : NaN;
  var ok = w.code === 200 && Math.round(now * 100) === Math.round(par * 100) && Math.round(oNow * 100) === Math.round((Number(os.adjustment) || 0) * 100);
  log_(me.owner, "ghost_write", stepId, ok ? "ok" : "fail", wk, JSON.stringify({ code: w.code, par: par, adj: adj, readBack: now }).slice(0, 200));
  if (ok) { log_(me.owner, "espn_done", stepId, "Y", "", "robot");
    deskPost_("note", "👻 Week " + wk + ": MAFFL HQ set the Ghost to " + par.toFixed(2) + " on ESPN ✓ (read back " + now.toFixed(2) + ").", "", "GHOSTOK"); return { ok: true, par: par, readBack: now }; }
  deskPost_("alert", "👻 Week " + wk + ": sending the Ghost score to ESPN didn't check out (ESPN said " + w.code + ", shows " + (isNaN(now) ? "?" : now.toFixed(2)) + ", par " + par.toFixed(2) + "). Please set it by hand.", "", "GHOSTFAIL");
  return { ok: false, error: "ESPN didn't take it (" + w.code + "). Set it by hand; the desk has the details." };
}
