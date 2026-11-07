/**
 * MAFFL HQ App backend PART: the commish desk (to-do, actions, polls, test trade block, robot posts, credit awards) and the 15-minute tick robot + its jobs.
 * Not standalone: logic.js (the core) evaluates this file inside its own scope (see parts_ in logic.js), so it uses the
 * core's helpers by plain name and its functions are callable from every other part. Bump VERSION in logic.js when you
 * change this file. Keep it under ~90 KB.
 */
// ---------------------------------------------------------------- 🛡️ Commish desk (APP_DESIGN §10d)
// One chat room only the commish sees. Every robot and every owner action that needs him posts a card here
// (kind perk | offer | access | lock | alert | robot | note). desk_ returns the live to-do list on top of it;
// deskAct_ does the jobs that used to need the Sheet menu (issue a passphrase, unlock) and ticks off ESPN steps.
function deskPost_(kind, text, ref, event) { try { post_("desk", BOT, kind, text, ref, event, [], ""); } catch (e) {} }
function setPhrase_(o) {
  var others = owners_().filter(function (x) { return x.pin_hash && x._row !== o._row; }), pin, tries = 0;
  do { pin = newPhrase_(); tries++; } while (tries < 50 && others.some(function (x) { return hash_(x.salt, pin) === x.pin_hash; }));
  var salt = Utilities.getUuid();
  setCell_("Owners", o._row, "salt", salt);
  setCell_("Owners", o._row, "pin_hash", hash_(salt, pin));
  setCell_("Owners", o._row, "failed_tries", 0);
  setCell_("Owners", o._row, "locked", "");
  sheet_("Events").appendRow([new Date(), "commish", "pin_set", o.owner, "", "", ""]);
  return pin;
}
function openRequests_() { // Requests tab: ts, owner, note, status, done_ts (by position; header names vary)
  var sh = sheet_("Requests"), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) if (v[i][1] && String(v[i][3]).toUpperCase() === "OPEN") out.push({ row: i + 1, ts: v[i][0], owner: v[i][1], note: v[i][2] });
  return out;
}
function closeRequests_(owner) {
  var sh = sheet_("Requests"); openRequests_().forEach(function (r) { if (norm_(r.owner) === norm_(owner)) sh.getRange(r.row, 4, 1, 2).setValues([["DONE", new Date()]]); });
}
function desk_(me) {
  var done = {}; rows_("Events").forEach(function (e) { if (e.type === "espn_done") done[e.ref] = e.meta || "Y"; });
  var espn = rows_("Perks").filter(function (r) { return r.status === "APPROVED" && r.perk !== "insurance" && !done[r.perk_id]; }).map(function (r) {
    return { id: r.perk_id, owner: r.owner, tier: r.tier, perk: r.perk, qty: Number(r.qty) || 1, week: Number(r.week) || null, player: r.player, pos: r.pos, swapWith: r.swap_with, approved: r.updated_ts };
  });
  var owners = owners_(), last = {};
  try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_SYNC") || "{}"); } catch (e) {}
  return { ok: true, version: VERSION,
    access: openRequests_().map(function (r) { var o = ownerRow_(r.owner) || {}; return { owner: r.owner, team: o.team, ts: r.ts, note: String(r.note || ""), hasPin: !!o.pin_hash }; }),
    locked: owners.filter(function (o) { return String(o.locked) === "Y"; }).map(function (o) { return o.owner; }),
    noPin: owners.filter(function (o) { return !o.pin_hash && !/ghost/i.test(String(o.team || "") + String(o.owner || "")); }).map(function (o) { return o.owner; }),
    espn: espn, sync: { mode: syncMode_(), last: last }, tick: tickInfo_(), daily: (function () { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_DAILY") || "{}"); } catch (e) { return {}; } })(),
    moved: rows_("Events").filter(function (e) { return e.type === "espn_moved"; }).map(function (e) { return e.ref; }), beta: betaInfo_(), awards: awardsPending_() };
}
// 👋 Welcome tour reset (commish 11/7): a new stamp in the Owners "tour" column; summary hands it to that owner's app,
// which clears its "seen" marks once per new stamp and replays the tour. "T" prefix keeps the Sheet from making it a date.
function tourStamp_(o) { ensureCol_("Owners", "tour"); setCell_("Owners", o._row, "tour", "T" + Date.now()); }
function tickInfo_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_TICK") || "{}"); } catch (e) { return {}; } }
function deskAct_(me, b) {
  if (b.op === "tick") return tickRun_(); // "Run the robot now" button (doPost already holds the lock)
  if (b.op === "daily") { need_("daily"); return DAILY.run("button"); } // "Run daily now"
  if (b.op === "award" || b.op === "awardall") return awardAct_(b);
  if (b.op === "poll" || b.op === "pollclose") return poll_(me, b);
  if (b.op === "seedblock") { // 🧪 TEST Sheet only: put one player from each of 8 teams per tier on the block, so the block can be seen full
    var notes = ["Listening to offers", "Need a RB back", "Selling high", "Open to credits", "Bye-week fix wanted", ""], n = 0;
    ["U", "L"].forEach(function (t) { (rosters_(t).teams || []).filter(function (x) { return x.owner && norm_(x.owner) !== norm_(me.owner); }).slice(0, 8).forEach(function (x, k) {
      var p = (x.players || []).filter(function (q) { return q.slot === "BE" && q.pos !== "K" && q.pos !== "D/ST"; })[0]; if (!p) return;
      log_(x.owner, "block", t + ":" + p.n, "on", "", notes[k % notes.length]); n++; }); });
    return { ok: true, n: n };
  }
  if (b.op === "espn") { if (!b.perk_id) return { ok: false, error: "Which perk?" }; log_(me.owner, "espn_done", b.perk_id, "Y", "", "Y"); return { ok: true }; }
  if (b.op === "tour" && b.target === "*") { var n = 0; owners_().forEach(function (x) { if (!/ghost/i.test(String(x.team || "") + String(x.owner || ""))) { tourStamp_(x); n++; } });
    deskPost_("note", "👋 Welcome tour reset for everyone (" + n + " owners; replays on their next open).", "", "TOUR"); return { ok: true, n: n }; }
  var o = ownerRow_(b.target); if (!o) return { ok: false, error: "Unknown owner" };
  if (b.op === "issue") {
    var pin = setPhrase_(o); closeRequests_(o.owner);
    deskPost_("note", "New passphrase issued to " + o.owner + ".", o.owner, "ISSUED");
    var c = contacts_().filter(function (x) { return norm_(x.owner) === norm_(o.owner); })[0] || {};
    return { ok: true, owner: o.owner, team: o.team, pin: pin, phone: c.phone || "", email: c.email || "" }; // shown once, to the commish only
  }
  if (b.op === "unlock") { setCell_("Owners", o._row, "failed_tries", 0); setCell_("Owners", o._row, "locked", ""); deskPost_("note", o.owner + " unlocked (same passphrase).", o.owner, "UNLOCKED"); return { ok: true }; }
  if (b.op === "dismiss") { closeRequests_(o.owner); return { ok: true }; }
  if (b.op === "beta") { ensureCol_("Owners", "beta"); setCell_("Owners", o._row, "beta", b.on ? "Y" : "");
    deskPost_("note", (b.on ? "🧪 " + o.owner + " joined the beta crew." : o.owner + " left the beta crew."), o.owner, b.on ? "BETA_ON" : "BETA_OFF"); return { ok: true }; }
  if (b.op === "tour") { tourStamp_(o); deskPost_("note", "👋 Welcome tour reset for " + o.owner + " (replays on their next open).", o.owner, "TOUR"); return { ok: true }; }
  return { ok: false, error: "issue, unlock, dismiss, beta, tour or espn" };
}
// 📊 Polls (commish 11/7): the commish posts a poll from the desk (question, 2–6 options, league or one tier, closes in N days).
// It lands in the Polls tab (summary → every owner's reel) and the bot announces it in the matching chat room.
// Owners see results only after voting (app side). op "pollclose" sets active = N.
function poll_(me, b) {
  ensureCol_("Polls", "tier");
  if (b.op === "pollclose") { var hit = rows_("Polls").filter(function (x) { return String(x.poll_id) === String(b.target); })[0]; if (!hit) return { ok: false, error: "No such poll" };
    setCell_("Polls", hit._row, "active", "N");
    var t = summary_("", "").tallies[hit.poll_id] || {}, n = 0; Object.keys(t).forEach(function (k) { n += t[k]; }); // results go to the same room the poll was announced in
    post_(hit.tier ? "tier:" + hit.tier : "league", BOT, "text", "📊 Poll closed: " + hit.question + "\n" + Object.keys(t).sort(function (x, y) { return t[y] - t[x]; }).map(function (k) { return k + " · " + Math.round(100 * t[k] / n) + "% (" + t[k] + ")"; }).join("\n") + (n ? "" : "No votes."), "", "", [], "");
    return { ok: true }; }
  var q = String(b.question || "").trim().slice(0, 140), opts = (b.options || []).map(function (o) { return String(o).replace(/\|/g, "/").trim().slice(0, 60); }).filter(String).slice(0, 6);
  if (!q || opts.length < 2) return { ok: false, error: "A question and at least 2 options" };
  var tier = b.tier === "U" || b.tier === "L" ? b.tier : "", days = Math.max(1, Math.min(14, Number(b.days) || 7)), id = "P" + Date.now().toString(36).toUpperCase();
  var vals = { poll_id: id, week: Number(b.week) || "", question: safe_(q), "options (separate with |)": safe_(opts.join("|")), "closes (ISO)": new Date(Date.now() + days * 864e5).toISOString(), active: "Y", tier: tier };
  var sh = sheet_("Polls"), head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(head.map(function (h) { return vals[h] != null ? vals[h] : ""; }));
  post_(tier ? "tier:" + tier : "league", BOT, "text", "📊 New poll: " + q + "\nVote in the app (Home). Results show once you've voted.", "", "", [], "");
  return { ok: true, id: id };
}
// Robots (GitHub Actions, Claude scheduled tasks) post to the desk with the shared key in Script property DESK_KEY.
// No key set = closed. Body: { action:"botpost", key, title, text, link, status: ok|fail|info }
function botPost_(b) {
  var key = PropertiesService.getScriptProperties().getProperty("DESK_KEY");
  if (!key || String(b.key || "") !== key) return { ok: false, error: "bad key" };
  var title = String(b.title || "Robot").slice(0, 80), text = String(b.text || "").slice(0, 400), link = String(b.link || "");
  if (link && !/^https:\/\//.test(link)) link = "";
  post_("desk", BOT, "robot", (title + (text ? "\n" + text : "")).slice(0, CHAT_MAX), link.slice(0, 300), String(b.status || "info").slice(0, 8).toUpperCase());
  return { ok: true };
}

// Credit awards (Awards tab, made by the daily run): Approve → APPROVED + sync mode → ledger push; Deny → DENIED.
function awardsPending_() { // PENDING = ready to issue (after Wk 17); EARNED = shown, nothing to do yet
  var sh = SpreadsheetApp.getActive().getSheetByName("Awards"); if (!sh) return [];
  return rows_("Awards").filter(function (a) { return a.status === "PENDING" || a.status === "EARNED"; }).map(function (a) {
    return { id: a.award_id, tier: a.tier, owner: a.owner, team: a.team, award: a.award, credits: Number(a.credits) || 0, week: a.week, detail: a.detail, status: a.status }; });
}
function awardAct_(b) {
  var list = rows_("Awards").filter(function (a) { return a.status === "PENDING" && (b.op === "awardall" || a.award_id === b.target); });
  if (!list.length) return { ok: false, error: "Nothing waiting" };
  var ok = b.decision !== "deny", mode = syncMode_();
  list.forEach(function (a) { setCell_("Awards", a._row, "status", ok ? "APPROVED" : "DENIED"); setCell_("Awards", a._row, "updated_ts", new Date());
    if (ok) setCell_("Awards", a._row, "sync", mode); if (b.reason) setCell_("Awards", a._row, "reason", String(b.reason).slice(0, 200)); });
  deskPost_("note", (ok ? "🏅 Approved " : "Denied ") + list.length + " credit award" + (list.length === 1 ? "" : "s") + (list.length === 1 ? ": " + list[0].team + " +" + list[0].credits + " (" + list[0].award + ")" : "") + ".", "", ok ? "AWARD_OK" : "AWARD_NO");
  return { ok: true, n: list.length, sync: ok ? pushLedger_() : null };
}

// Card lines from the card-lines workflow (Claude, after each daily run). Same DESK_KEY as botpost.
function putLines_(b) {
  var key = PropertiesService.getScriptProperties().getProperty("DESK_KEY");
  if (!key || String(b.key || "") !== key) return { ok: false, error: "bad key" };
  if (!b.lines || typeof b.lines !== "object") return { ok: false, error: "no lines" };
  var s = JSON.stringify(b.lines); if (s.length > 60000) return { ok: false, error: "too long" };
  need_("daily"); DAILY.putLines(b.lines); return { ok: true };
}

// ---------------------------------------------------------------- ⏱️ tick: the 15-minute robot (APP_DESIGN §10f)
// Called by a time trigger on Code.gs `tick()` every 15 minutes. Each job is independent (one failing never stops
// the others), posts to the 📥 desk at most once per thing (keys remembered in Script property TICK_SENT), and
// never changes a perk, trade or credit by itself: it reminds, checks and reports.
var HOUR = 36e5;
function tickSent_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("TICK_SENT") || "{}"); } catch (e) { return {}; } }
function once_(sent, key, fn) { if (sent[key]) return false; fn(); sent[key] = Date.now(); return true; }
function etHour_(d) { return Number(Utilities.formatDate(d || new Date(), "America/New_York", "H")); }
function etDay_(d) { return Utilities.formatDate(d || new Date(), "America/New_York", "yyyy-MM-dd"); }
function hrs_(ms) { var h = Math.round(ms / HOUR); return h <= 1 ? "1 hour" : h + " hours"; }
function tick() {
  var lock = LockService.getScriptLock(), r = { ok: false, error: "busy" };
  if (lock.tryLock(20000)) { try { r = tickRun_(); } finally { lock.releaseLock(); } }
  // In-season daily run, 5 AM + 5 PM ET (daily.js). Outside the lock: it only writes its own tabs, and can take a minute.
  try { need_("daily"); if (DAILY.due()) r.daily = DAILY.run("tick"); } catch (e) { r.daily = { ok: false, error: String(e.message || e) }; deskPost_("alert", "Daily run didn't start: " + String(e.message || e).slice(0, 160), "", "DAILY"); }
  return r;
}
// ---------------------------------------------------------------- ⏱️ tick jobs
function tickRun_() {
  var props = PropertiesService.getScriptProperties(), sent = tickSent_(), now = new Date(), log = [];
  function job(name, fn) { try { var n = fn(); if (n) log.push(name + " " + n); } catch (e) { log.push(name + " ERROR " + String(e.message || e).slice(0, 80)); } }
  try {
    job("perks", function () { return tickPerks_(sent, now); });
    job("trades", function () { return tickTrades_(sent, now); });
    job("deadline", function () { return tickDeadline_(sent, now); });
    if (etHour_(now) >= 8 && Math.floor(now.getTime() / 9e5) % 2 === 0) job("espn", function () { return tickEspnMoves_(sent, now); }); // every 30 min, 8 AM–midnight
    var day = etDay_(now);
    if (etHour_(now) >= 3 && props.getProperty("TICK_DAILY") !== day) { props.setProperty("TICK_DAILY", day); job("reconcile", function () { return tickReconcile_(sent, now); }); }
    Object.keys(sent).forEach(function (k) { if (now - sent[k] > 60 * 864e5) delete sent[k]; }); // forget after 60 days
    props.setProperty("TICK_SENT", JSON.stringify(sent));
    props.setProperty("LAST_TICK", JSON.stringify({ at: now.toISOString(), log: log.slice(0, 12) }));
    return { ok: true, log: log };
  } catch (e) { return { ok: false, error: String(e) }; }
}
// Perk requests: nudge when one has waited 12 h, and warn when a Double Bonus / Matchup Swap still waiting locks in < 6 h.
function tickPerks_(sent, now) {
  var n = 0;
  rows_("Perks").filter(function (r) { return r.status === "REQUESTED"; }).forEach(function (r) {
    var name = (PERKS[r.perk] || {}).name || r.perk, who = teamName_(r.owner), wait = now - new Date(r.ts);
    if (wait > 12 * HOUR && once_(sent, "perkwait:" + r.perk_id, function () { deskPost_("note", "⏳ " + who + "'s " + name + " request has waited " + hrs_(wait) + ".", r.perk_id, "WAITING"); })) n++;
    if ((r.perk === "double" || r.perk === "swap") && Number(r.week)) {
      var left = perkDeadline_(Number(r.week)) - now;
      if (left > 0 && left < 6 * HOUR && once_(sent, "perklock:" + r.perk_id, function () { deskPost_("note", "⏰ " + who + "'s Week " + r.week + " " + name + " locks in " + hrs_(left) + ". Approve or deny before then.", r.perk_id, "LOCKSOON"); })) n++;
    }
  });
  return n;
}
// Trades: the 24-hour review is over → approve or negate now (the rule: commish decides after the review window).
function tickTrades_(sent, now) {
  var n = 0;
  rows_("Offers").filter(function (o) { return o.status === "ACCEPTED" && now - new Date(o.updated_ts) > 24 * HOUR; }).forEach(function (o) {
    if (once_(sent, "review:" + o.offer_id, function () { deskPost_("offer", "The 24-hour review is over. Approve or negate it.", o.offer_id, "REVIEWDONE"); })) n++;
  });
  return n;
}
// Trade deadline: heads-up 24 h before, to the desk and the league room (once each).
function tickDeadline_(sent, now) {
  var left = TRADE_DEADLINE - now, n = 0;
  if (left > 0 && left < 24 * HOUR) {
    var when = Utilities.formatDate(TRADE_DEADLINE, "America/New_York", "EEE MMM d 'at' h:mm a");
    if (once_(sent, "tdl:desk", function () { var open = rows_("Offers").filter(function (o) { return o.status === "PROPOSED" || o.status === "ACCEPTED"; }).length;
      deskPost_("note", "⏰ Trade deadline is " + when + " ET. " + open + " offer" + (open === 1 ? " is" : "s are") + " still open.", "", "DEADLINE"); })) n++;
    if (once_(sent, "tdl:league", function () { post_("league", BOT, "text", "⏰ Trade deadline is " + when + " ET (less than 24 hours). Offers need to be accepted before then.", "", "", [], ""); })) n++;
  }
  return n;
}
// Accepted / approved trades with players: did the players actually move on ESPN? Reads both tiers' rosters, matches
// ESPN team names to the Owners tab team names. Moved → logs `espn_moved` + a desk note. Not moved 24 h after the
// accept → one reminder in the two owners' DM and one on the desk.
function tickEspnMoves_(sent, now) {
  var moved = {}; rows_("Events").forEach(function (e) { if (e.type === "espn_moved") moved[e.ref] = 1; });
  var open = rows_("Offers").filter(function (o) { return (o.status === "ACCEPTED" || o.status === "APPROVED") && !moved[o.offer_id] && now - new Date(o.updated_ts) < 14 * 864e5; })
    .filter(function (o) { return JSON.parse(o.give || "[]").length + JSON.parse(o.get || "[]").length > 0; });
  if (!open.length) return 0;
  var rosters = {}, n = 0; // tier -> norm(team name) -> { norm(player): 1 }
  ["U", "L"].forEach(function (t) {
    if (!open.some(function (o) { return String(o.tier) === t; })) return;
    var d = espn_(LEAGUES[t], "view=mTeam&view=mRoster"); rosters[t] = {};
    (d.teams || []).forEach(function (tm) { var nm = norm_(tm.name || ((tm.location || "") + " " + (tm.nickname || "")).trim()), set = rosters[t][nm] = {};
      (((tm.roster || {}).entries) || []).forEach(function (e) { set[norm_(((e.playerPoolEntry || {}).player || {}).fullName)] = 1; }); });
  });
  open.forEach(function (o) {
    var R = rosters[String(o.tier)] || {}, fromR = R[norm_(teamName_(o.from_owner))], toR = R[norm_(teamName_(o.to_owner))];
    if (!fromR || !toR) { once_(sent, "espnname:" + o.offer_id, function () { deskPost_("note", "🤷 Can't match " + teamName_(o.from_owner) + " or " + teamName_(o.to_owner) + " to an ESPN team name, so I can't check whether the players moved. Make the Owners tab team name match ESPN.", o.offer_id, "NOMATCH"); }); return; }
    var give = JSON.parse(o.give || "[]"), get = JSON.parse(o.get || "[]");
    var done = give.every(function (p) { return toR[norm_(p)]; }) && get.every(function (p) { return fromR[norm_(p)]; });
    if (done) { log_("robot", "espn_moved", o.offer_id, "Y", "", ""); deskPost_("note", "✅ The players in " + teamName_(o.from_owner) + " ↔ " + teamName_(o.to_owner) + " moved on ESPN.", o.offer_id, "MOVED"); n++; return; }
    if (now - new Date(o.ts) > 24 * HOUR) {
      if (once_(sent, "espnwait:" + o.offer_id, function () {
        post_(roomDM_(o.from_owner, o.to_owner), BOT, "text", "Reminder: ESPN doesn't show this trade's players on the new rosters yet. One of you propose it on ESPN and the other accept, so it matches MAFFL HQ.", "", "", [], "");
        deskPost_("note", "⏳ " + teamName_(o.from_owner) + " ↔ " + teamName_(o.to_owner) + ": players still haven't moved on ESPN. I reminded them in their DM.", o.offer_id, "NOTMOVED"); })) n++;
    }
  });
  return n;
}
// Nightly: does the repo hold the same ledger the backend has (did every push land)? LIVE also checks that every
// ledger row approved 2+ hours ago is in data/Credit_Log.csv (tagged [app L-…]). Quiet when everything matches.
function tickReconcile_(sent, now) {
  var mode = syncMode_(), mine = ledger_(mode), raw = "https://raw.githubusercontent.com/" + REPO + "/main/";
  var f = UrlFetchApp.fetch(raw + "_ops/inbox/credit_ledger" + (mode === "live" ? "" : "_test") + ".json?t=" + now.getTime(), { muteHttpExceptions: true });
  var repoIds = {}; if (f.getResponseCode() === 200) (JSON.parse(f.getContentText()).rows || []).forEach(function (r) { repoIds[r.id] = 1; });
  var problems = [], notPushed = mine.filter(function (r) { return !repoIds[r.id]; });
  if (notPushed.length) problems.push(notPushed.length + " approved credit move" + (notPushed.length === 1 ? " isn't" : "s aren't") + " in the repo's ledger file (tap Re-send ledger)");
  if (mode === "live") {
    var c = UrlFetchApp.fetch(raw + "data/Credit_Log.csv?t=" + now.getTime(), { muteHttpExceptions: true }), txt = c.getResponseCode() === 200 ? c.getContentText() : "";
    var missing = mine.filter(function (r) { return now - new Date(r.approved) > 2 * HOUR && txt.indexOf("[app " + r.id + "]") < 0; });
    if (missing.length) problems.push(missing.length + " approved move" + (missing.length === 1 ? " isn't" : "s aren't") + " in Credit_Log yet (" + missing.slice(0, 3).map(function (r) { return r.id; }).join(", ") + "); check the Credit sync run");
  }
  if (!problems.length) return 0;
  deskPost_("alert", "Nightly credit check (" + mode.toUpperCase() + "): " + problems.join("; ") + ".", "", "RECONCILE");
  return problems.length;
}

