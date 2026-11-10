/**
 * MAFFL HQ App backend PART: the commish desk (to-do, actions, polls, commish alerts, robot posts, credit awards) and the 15-minute tick robot + its jobs.
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
  do { pin = newPhrase_(); tries++; } while (tries < 50 && others.some(function (x) { return pinOk_(x, pin); }));
  var salt = Utilities.getUuid();
  setCell_("Owners", o._row, "salt", salt); o.salt = salt; // callers may hand out a token for the new salt
  setCell_("Owners", o._row, "pin_hash", hash_(salt, pin));
  setCell_("Owners", o._row, "failed_tries", 0);
  setCell_("Owners", o._row, "locked", ""); CacheService.getScriptCache().remove("of:" + norm_(o.owner));
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
  var done = {}, when = {}; rows_("Events").forEach(function (e) { if (e.type === "espn_done") done[e.ref] = e.meta || "Y"; if (e.type === "espn_when") when[e.ref] = String(e.value).replace(/^when:/, ""); });
  var espn = rows_("Perks").filter(function (r) { return r.status === "APPROVED" && r.perk !== "insurance" && !done[r.perk_id]; }).map(function (r) {
    return { id: r.perk_id, owner: r.owner, tier: r.tier, perk: r.perk, qty: Number(r.qty) || 1, week: Number(r.week) || null, player: r.player, pos: r.pos, swapWith: r.swap_with, approved: r.updated_ts, when: when[r.perk_id] || "" };
  });
  // 👻 Ghost score steps (commish 11/8, the job the Pulse robot used to flag): every final week where ESPN's Ghost score isn't the par yet.
  try { need_("daily"); var sn = DAILY.snapshot(), c2 = function (x) { return Math.round((Number(x) || 0) * 100); }; Object.keys(sn.tiers || {}).forEach(function (t) { var s = sn.tiers[t];
    (s.ghost || []).forEach(function (g) { var id = "ghost:" + t + ":" + g.wk + "@" + c2(g.par); if (c2(g.espn) === c2(g.par) || done[id]) return; // par in the id: a stat correction that moves the par brings the step back, even after ✓ Done (commish 11/8: past weeks get re-set regularly)
      espn.push({ id: id, owner: "", tier: t, perk: "ghost", qty: 1, week: g.wk, player: "", pos: "", swapWith: "", approved: sn.at, when: when[id] || "",
        par: g.par, espnPts: g.espn, vs: ((s.teams || {})[g.vs] || {}).team || "", vsPts: g.vsPts }); }); }); } catch (e) {}
  var owners = owners_(), last = {};
  try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_SYNC") || "{}"); } catch (e) {}
  return { ok: true, version: VERSION,
    access: openRequests_().map(function (r) { var o = ownerRow_(r.owner) || {}; return { owner: r.owner, team: o.team, ts: r.ts, note: String(r.note || ""), hasPin: !!o.pin_hash }; }),
    locked: owners.filter(function (o) { return String(o.locked) === "Y"; }).map(function (o) { return o.owner; }),
    noPin: owners.filter(function (o) { return !o.pin_hash && !/ghost/i.test(String(o.team || "") + String(o.owner || "")); }).map(function (o) { return o.owner; }),
    espn: espn, sync: { mode: syncMode_(), last: last }, tick: tickInfo_(), daily: (function () { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_DAILY") || "{}"); } catch (e) { return {}; } })(),
    moved: rows_("Events").filter(function (e) { return e.type === "espn_moved"; }).map(function (e) { return e.ref; }), beta: betaInfo_(), awards: awardsPending_(), seed: seedInfo_(), offers: offerCounts_() };
}
// Desk dashboard counts (commish 11/9): every offer in the league, not just the commish's own. Numbers only (offers stay private).
function offerCounts_() {
  var wk = Date.now() - 7 * 864e5, c = { open: 0, review: 0, approved7: 0 };
  (sheetGet_("Offers") ? rows_("Offers") : []).forEach(function (o) { if (o.status === "PROPOSED") c.open++; else if (o.status === "ACCEPTED") c.review++;
    else if (o.status === "APPROVED" && new Date(o.updated_ts).getTime() > wk) c.approved7++; });
  return c;
}
// 👋 Welcome tour reset (commish 11/7): a new stamp in the Owners "tour" column; summary hands it to that owner's app,
// which clears its "seen" marks once per new stamp and replays the tour. "T" prefix keeps the Sheet from making it a date.
function tourStamp_(o) { ensureCol_("Owners", "tour"); setCell_("Owners", o._row, "tour", "T" + Date.now()); }
// One daily run at a time (the button and the 5 AM / 5 PM tick can overlap).
function dailyOnce_(why) {
  var c = CacheService.getScriptCache(); if (c.get("daily_running")) return { ok: false, error: "The daily run is already going. Give it a few minutes." };
  c.put("daily_running", "1", 360);
  try { need_("daily"); return DAILY.run(why); } finally { c.remove("daily_running"); }
}
function tickInfo_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_TICK") || "{}"); } catch (e) { return {}; } }
function deskAct_(me, b) {
  if (b.op === "tick") return tickRun_(); // "Run the robot now" button (doPost already holds the lock)
  if (b.op === "daily") return dailyOnce_("button"); // "Run daily now" (doPost runs this one outside the lock)
  if (b.op === "award" || b.op === "awardall") return awardAct_(b);
  if (b.op === "poll" || b.op === "pollclose") return poll_(me, b);
  if (b.op === "announce") return announce_(me, b);
  if (b.op === "espnwhen") { // 📅 the day the commish plans to do an ESPN step (commish 11/8); "when:" keeps the Sheet from turning it into a date
    if (!b.perk_id || !/^\d{4}-\d{2}-\d{2}$/.test(String(b.when || ""))) return { ok: false, error: "Pick a date" };
    log_(me.owner, "espn_when", b.perk_id, "when:" + b.when, "", ""); return { ok: true }; }
  if (b.op === "espn") { if (!b.perk_id) return { ok: false, error: "Which perk?" }; log_(me.owner, "espn_done", b.perk_id, "Y", "", "Y"); return { ok: true }; }
  if (b.op === "tour" && b.target === "*") { var n = 0; owners_().forEach(function (x) { if (!/ghost/i.test(String(x.team || "") + String(x.owner || ""))) { tourStamp_(x); n++; } });
    deskPost_("note", "👋 Welcome tour reset for everyone (" + n + " owners; replays on their next open).", "", "TOUR"); return { ok: true, n: n }; }
  if (b.op === "seed") return seedBuild_(me);
  if (b.op === "unseed") { var w = seedWipe_(); deskPost_("note", "🎭 Seed data wiped (" + w.offers + " offers, " + w.msgs + " messages, " + w.block + " trade-block listings).", "", "SEED"); return Object.assign({ ok: true }, w); }
  var o = ownerRow_(b.target); if (!o) return { ok: false, error: "Unknown owner" };
  if (b.op === "issue") {
    var pin = setPhrase_(o); closeRequests_(o.owner);
    deskPost_("note", "New passphrase issued to " + o.owner + ".", o.owner, "ISSUED");
    var c = contacts_().filter(function (x) { return norm_(x.owner) === norm_(o.owner); })[0] || {};
    var out = { ok: true, owner: o.owner, team: o.team, pin: pin, phone: c.phone || "", email: c.email || "" }; // shown once, to the commish only
    if (norm_(o.owner) === norm_(me.owner)) { out.token = token_(o); out.self = true; } // your own: keep this phone signed in
    return out;
  }
  if (b.op === "unlock") { setCell_("Owners", o._row, "failed_tries", 0); setCell_("Owners", o._row, "locked", ""); CacheService.getScriptCache().remove("of:" + norm_(o.owner)); deskPost_("note", o.owner + " unlocked (same passphrase).", o.owner, "UNLOCKED"); return { ok: true }; }
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
  post_(tier ? "tier:" + tier : "league", BOT, "poll", "📊 New poll: " + q + "\nVote right here or on Home. Results show once you've voted.", id, "", [], ""); // kind "poll" + id: the app draws the vote buttons in chat
  return { ok: true, id: id };
}
// 📣 Commish alert (commish 11/7): one announcement, posted by the commish into every group chat (league + both tiers)
// as kind "announce" and pinned there, so it sits on top of each room until he unpins it.
function announce_(me, b) {
  var text = String(b.text || "").trim().slice(0, CHAT_MAX); if (!text) return { ok: false, error: "Write the alert first" };
  var rooms = ["league", "tier:U", "tier:L"], sh = sheet_("Chat");
  rooms.forEach(function (room) { post_(room, me.owner, "announce", text, "", "ALERT", [], ""); setCell_("Chat", sh.getLastRow(), "pinned", "Y"); });
  deskPost_("note", "📣 Commish alert sent to " + rooms.length + " group chats: " + text.slice(0, 80), "", "ANNOUNCE");
  notify_(owners_().map(function (o) { return o.owner; }), "announce", "MAFFL HQ: 📣 Commish alert", text, "", me.owner); // on by default (Settings)
  return { ok: true, n: rooms.length };
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
  need_("daily"); var r = DAILY.putLines(b.lines); if (r && r.kept) return { ok: true, kept: r.kept }; // that week's lines are already out (drops: published once)
  var e5 = null; try { e5 = elitePost_(b.lines); } catch (e) {} return { ok: true, saved: r && r.saved, elite5: e5 };
}
// ⭐ Elite 5 on the record (commish 11/9): the first lines after a week goes final (both tiers) save that week's Elite 5,
// once per week, to Daily key elite5_hist; the 📣 Board shows it. Not posted to chat (commish 11/9, later). "Out" compares
// with the last one saved.
function elitePost_(lines) {
  var e5 = (lines.elite5 || []).slice(0, 5); if (e5.length < 5) return null;
  var T = (DAILY.snapshot() || {}).tiers || {}, wk = Math.min((T.U || {}).last || 0, (T.L || {}).last || 0); if (!wk) return null;
  var P = PropertiesService.getScriptProperties(), last = {}; try { last = JSON.parse(P.getProperty("ELITE5_POSTED") || "{}"); } catch (e) {}
  if (Number(last.wk) >= wk) return null;
  var now = e5.map(function (e) { return e.owner; }), was = (last.owners || []).filter(function (o) { return now.map(norm_).indexOf(norm_(o)) < 0; });
  var text = "⭐ Elite 5 · Week " + wk + "\n" + e5.map(function (e, k) { return (k + 1) + ". " + teamName_(e.owner); }).join("\n") +
    (was.length ? "\n⬇️ Out: " + was.map(teamName_).join(", ") : "");
  var hist = DAILY.get("elite5_hist") || []; hist.push({ wk: wk, at: new Date().toISOString(), text: text.slice(0, CHAT_MAX) }); DAILY.put("elite5_hist", hist.slice(-30));
  P.setProperty("ELITE5_POSTED", JSON.stringify({ wk: wk, owners: now }));
  return wk;
}

// ---------------------------------------------------------------- ⏱️ tick: the 15-minute robot (APP_DESIGN §10f)
// Called by a time trigger on Code.gs `tick()` every 15 minutes. Each job is independent (one failing never stops
// the others), posts to the 📥 desk at most once per thing (keys remembered in Script property TICK_SENT), and
// never changes a perk, trade or credit by itself: it reminds, checks and reports.
var HOUR = 36e5;
// The memory of what's been sent is split over TICK_SENT, TICK_SENT_1, … (Apps Script caps one property at 9 KB).
function tickSent_() {
  var p = PropertiesService.getScriptProperties(), s = p.getProperty("TICK_SENT") || "", i = 1, more;
  while ((more = p.getProperty("TICK_SENT_" + i))) { s += more; i++; }
  try { return JSON.parse(s || "{}"); } catch (e) { return {}; }
}
function saveTickSent_(sent) {
  var p = PropertiesService.getScriptProperties(), s = JSON.stringify(sent), CH = 8000, n = Math.max(1, Math.ceil(s.length / CH));
  for (var i = 0; i < n; i++) p.setProperty(i ? "TICK_SENT_" + i : "TICK_SENT", s.slice(i * CH, (i + 1) * CH));
  for (var j = n; p.getProperty("TICK_SENT_" + j); j++) p.deleteProperty("TICK_SENT_" + j);
}
function once_(sent, key, fn) { if (sent[key]) return false; fn(); sent[key] = Date.now(); return true; }
function etHour_(d) { return Number(Utilities.formatDate(d || new Date(), "America/New_York", "H")); }
function etDay_(d) { return Utilities.formatDate(d || new Date(), "America/New_York", "yyyy-MM-dd"); }
function hrs_(ms) { var h = Math.round(ms / HOUR); return h <= 1 ? "1 hour" : h + " hours"; }
function tick() {
  var lock = LockService.getScriptLock(), r = { ok: false, error: "busy" };
  if (lock.tryLock(20000)) { try { r = tickRun_(); } finally { lock.releaseLock(); } }
  // In-season daily run, 5 AM + 5 PM ET (daily.js). Outside the lock: it only writes its own tabs, and can take a minute.
  try { need_("daily"); if (DAILY.due()) r.daily = dailyOnce_("tick"); } catch (e) { r.daily = { ok: false, error: String(e.message || e) }; deskPost_("alert", "Daily run didn't start: " + String(e.message || e).slice(0, 160), "", "DAILY"); }
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
    saveTickSent_(sent);
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


// ---------------------------------------------------------------- 🎭 seed data (commish 11/9, desk → Go-live)
// Pretend league activity on the real ESPN rosters, so the beta crew opens an app that's already busy (commish 11/9: real
// owners in it too, all pretend): every tester gets an offer waiting, a counter waiting and an old declined offer from
// other owners, with DM banter; testers in the same tier get one between them; a couple of private offers between other
// owners; tier + league chat from all over; trade-block listings. Nothing seeded is ACCEPTED (no review items), nothing emails.
// Tagged so Wipe / Reseed can find it: Offers ids "TSD…", Chat ids "MSD…" (plus any chat card pointing at a TSD offer),
// trade-block Events with week "seed" (Events stays append-only: wiping appends "off" rows).
var SEED_OFFER = "TSD", SEED_MSG = "MSD";
function seedId_(pre) { return pre + Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase(); }
function seedBlock_() { // seeded listings still on the block: ref -> owner
  var on = {}; rows_("Events").forEach(function (e) { if (e.type !== "block") return;
    if (e.value === "on") { if (String(e.week) === "seed") on[e.ref] = e.owner; else delete on[e.ref]; } else if (on[e.ref] && norm_(on[e.ref]) === norm_(e.owner)) delete on[e.ref]; });
  return on;
}
function seedInfo_() {
  var isS = function (v, p) { return String(v || "").indexOf(p) === 0; };
  return { offers: rows_("Offers").filter(function (r) { return isS(r.offer_id, SEED_OFFER); }).length,
    msgs: rows_("Chat").filter(function (r) { return isS(r.msg_id, SEED_MSG); }).length, block: Object.keys(seedBlock_()).length,
    at: PropertiesService.getScriptProperties().getProperty("SEED_AT") || "" };
}
function seedWipe_() {
  var out = { offers: 0, msgs: 0, block: 0 }, del = function (name, test) {
    var sh = sheet_(name), rs = rows_(name).filter(test).map(function (r) { return r._row; }).sort(function (a, b) { return b - a; });
    rs.forEach(function (r) { sh.deleteRow(r); }); sheet_(name); return rs.length; };
  out.offers = del("Offers", function (r) { return String(r.offer_id).indexOf(SEED_OFFER) === 0; });
  out.msgs = del("Chat", function (r) { return String(r.msg_id).indexOf(SEED_MSG) === 0 || String(r.ref).indexOf(SEED_OFFER) === 0; });
  var bl = seedBlock_(); Object.keys(bl).forEach(function (ref) { sheet_("Events").appendRow(cells_([new Date(), bl[ref], "block", ref, "off", "seed", ""])); out.block++; });
  PropertiesService.getScriptProperties().deleteProperty("SEED_AT");
  return out;
}
function seedBuild_(me) {
  var wiped = seedWipe_(), now = Date.now(), at = function (min) { return new Date(now - min * 6e4); };
  var all = owners_().filter(function (o) { return o.owner && o.team && !/ghost/i.test(String(o.team) + String(o.owner)); });
  var chat = [], offers = [], block = [], skipped = [], pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  var tag = function (o) { try { return at_(o.owner); } catch (e) { return "@" + String(o.owner).split(/[ \/]/)[0]; } };
  var msg = function (min, room, owner, text, mentions, kind, ref, ev) { chat.push([seedId_(SEED_MSG), at(min), room, owner, kind || "text", safe_(text || ""), ref || "", ev || "", JSON.stringify(mentions || []), "", "", ""]); };
  var offer = function (min, upd, from, to, tier, give, get, gc, tc, note, status, reason, reasons) { var id = seedId_(SEED_OFFER);
    offers.push(cells_([id, at(min), from.owner, to.owner, tier, JSON.stringify(give), JSON.stringify(get), gc, tc, note, status, at(upd), reason || "", JSON.stringify(reasons || []), ""])); return id; };
  var credits = function (o, n) { if (!n) return 0; try { var h = spendable_(o.owner); return h !== null && h >= n ? n : 0; } catch (e) { return 0; } };
  var listed = {}; try { listed = trades_("").block || {}; } catch (e) {}
  var REASONS = ["Need depth", "Win now", "Selling for the future", "Want credits", "Bye-week fix"];
  ["L", "U"].forEach(function (t) {
    var T0 = t === "U" ? "Upper" : "Lower", tier = all.filter(function (o) { return String(o.tier) === t; });
    var r; try { r = rosters_(t); } catch (e) { skipped.push(T0 + " (ESPN rosters didn't load)"); return; }
    var pl = {}; tier.forEach(function (o) { var tm = ((r && r.teams) || []).filter(function (x) { return norm_(x.owner) === norm_(o.owner); })[0];
      pl[o.owner] = ((tm && tm.players) || []).filter(function (p) { return ["K", "D/ST", "DST", ""].indexOf(p.pos) < 0; }).sort(function (a, b) { return (Number(b.sp) || 0) - (Number(a.sp) || 0); }); });
    var ok = tier.filter(function (o) { return pl[o.owner].length >= 10; });
    var T = ok.filter(isBeta_).sort(function (a, b) { return (String(a.is_commish) === "Y") - (String(b.is_commish) === "Y") || String(a.owner).localeCompare(String(b.owner)); });
    var O = shuffle(ok.filter(function (o) { return !isBeta_(o); }));
    if (O.length < 3) { skipped.push(T0 + " (rosters didn't load)"); return; }
    var oi = 0, nextO = function () { return O[oi++ % O.length]; }, P = function (o, i) { var l = pl[o.owner]; return l[Math.min(i, l.length - 1)]; };
    var room = function (x, y) { return roomDM_(x.owner, y.owner); };
    // Every tester: an offer waiting on them, a counter waiting on them, an old declined one. From real owners, all pretend.
    T.forEach(function (X, k) {
      var A = nextO(), a = P(A, 3 + k % 3), x = P(X, 4 + k % 3), n1 = pick(["Your " + x.pos + " room is stacked. Mine isn't. Let's fix that.", "Fair deal. Look it over.", "I need " + x.n + " more than you do. Let's talk.", "Sending this before somebody else does."]);
      var o1 = offer(150 + k * 70, 150 + k * 70, A, X, t, [a.n], [x.n], credits(A, pick([0, 0, 1, 2])), 0, n1, "PROPOSED", "", [pick(REASONS)]);
      msg(152 + k * 70, room(A, X), A.owner, pick(["You around? Got something for you", "Hey, quick one for you 👀", "Got a trade idea, hear me out"]));
      msg(150 + k * 70, room(A, X), A.owner, n1, [], "offer", o1, "PROPOSED");
      msg(148 + k * 70, room(A, X), A.owner, pick([a.n + " has been a stud lately, just saying", "Don't sleep on it, deadline's coming", "Open to tweaks if you want to counter"]));
      var B = nextO(), b = P(B, 4), x2 = P(X, 6), b2 = P(B, 7);
      var o2 = offer(1500 + k * 60, 620 + k * 30, X, B, t, [x2.n], [b.n], 0, 0, "Straight up?", "DECLINED", "Countered", [pick(REASONS)]);
      msg(1500 + k * 60, room(X, B), X.owner, "Straight up?", [], "offer", o2, "PROPOSED");
      msg(640 + k * 30, room(X, B), B.owner, pick(["Close. Not giving up " + b.n + " for just that though", "Ehh. Let me counter", "I like it but I need a little more"]));
      var o3 = offer(620 + k * 30, 620 + k * 30, B, X, t, [b2.n], [x2.n], credits(B, 1), 0, "Here's what I can do.", "PROPOSED", "", [pick(REASONS)]);
      msg(620 + k * 30, room(X, B), B.owner, "Here's what I can do.", [], "offer", o3, "COUNTER");
      msg(618 + k * 30, room(X, B), B.owner, pick(["Your move 😤", "Ball's in your court", "That's my best one"]));
      var C = nextO(), c3 = P(C, 2), x3 = P(X, 8);
      var o4 = offer(3000 + k * 50, 2800 + k * 50, X, C, t, [x3.n], [c3.n], 0, 0, "Worth a shot.", "DECLINED", "", [pick(REASONS)]);
      msg(3000 + k * 50, room(X, C), X.owner, "Worth a shot.", [], "offer", o4, "PROPOSED");
      msg(2800 + k * 50, room(X, C), C.owner, "", [], "offer", o4, "DECLINED");
      msg(2798 + k * 50, room(X, C), C.owner, pick(["Not a chance 😂 " + c3.n + " stays", "Lol no", "Come back with something real"]));
      msg(2790 + k * 50, room(X, C), X.owner, pick(["Had to try. I'll be back.", "Worth asking 🤷", "Noted. Round two coming"]));
    });
    // Two testers in the tier: one between them too.
    if (T.length >= 2) { var U1 = T[0], U2 = T[1], u1 = P(U1, 7), u2 = P(U2, 5);
      var o5 = offer(90, 90, U1, U2, t, [u1.n], [u2.n], credits(U1, 2), 0, "Family discount 😇", "PROPOSED", "", ["Need depth"]);
      msg(92, room(U1, U2), U1.owner, "You up? Got an idea for your " + u2.pos + " logjam 👀"); msg(90, room(U1, U2), U1.owner, "Family discount 😇", [], "offer", o5, "PROPOSED"); msg(40, room(U1, U2), U2.owner, "Looking now. Give me a bit 🤔"); }
    // Offers between other owners (private; only the counts show on the desk).
    for (var i = 0; i < 2; i++) { var F = nextO(), G = nextO(); if (F === G) continue; offer(300 + i * 200, 300 + i * 200, F, G, t, [P(F, 5 + i).n], [P(G, 6 + i).n], 0, 0, "", "PROPOSED", "", [pick(REASONS)]); }
    // Tier chat, newest last.
    var c1 = nextO(), c2 = nextO(), c3o = nextO(), c4 = nextO();
    msg(95, "tier:" + t, c1.owner, "Who's buying " + P(c1, 6).n + "? Price is reasonable 👀");
    msg(80, "tier:" + t, c2.owner, "Reasonable to who, " + tag(c1) + " 😂", [c1.owner]);
    msg(66, "tier:" + t, c3o.owner, "Bye weeks are killing me. Need a " + P(c3o, 1).pos + " bad");
    if (T[0]) msg(52, "tier:" + t, T[0].owner, "Trade block is open for business. Check mine 👀");
    msg(38, "tier:" + t, c4.owner, "Deadline's Dec 2. Somebody make me an offer I can't refuse");
    msg(22, "tier:" + t, c2.owner, "That last waiver run was highway robbery");
    if (T[1]) msg(9, "tier:" + t, T[1].owner, "I'll take that action, " + tag(c4), [c4.owner]);
    // Trade block: four other owners + each tester (skips players already listed for real).
    O.slice(0, 4).concat(T).forEach(function (o, j) { for (var q = 8; q < 13; q++) { var p = P(o, q), ref = t + ":" + p.n; if (listed[ref]) continue; listed[ref] = 1;
      block.push(cells_([at(240 - j * 25), o.owner, "block", ref, "on", "seed", pick(["Make me an offer", "Selling high", "Open to credits", "Need a " + P(o, 0).pos + " back", "Best offer by Sunday", ""])])); break; } });
  });
  // League chat: a few voices from both tiers.
  var L = shuffle(all.filter(function (o) { return !isBeta_(o); })).slice(0, 4), crew = all.filter(isBeta_);
  if (L.length >= 4) {
    msg(120, "league", L[0].owner, "New MAFFL HQ looks legit. Who built this 👀");
    msg(100, "league", L[1].owner, "Lower tier trash talk > Upper tier trash talk. Discuss.");
    msg(75, "league", L[2].owner, "Bold words from a guy with a bye-week disaster, " + tag(L[1]), [L[1].owner]);
    msg(45, "league", L[3].owner, "Somebody tell the commish the Ghost is cheating 👻");
    if (crew[0]) msg(12, "league", crew[0].owner, "Is this thing on? 🎤");
  }
  chat.sort(function (a, b) { return a[1] - b[1]; });
  var oSh = sheet_("Offers"); offers.forEach(function (row) { oSh.appendRow(row); });
  var cSh = sheet_("Chat"); chat.forEach(function (row) { cSh.appendRow(row); });
  var eSh = sheet_("Events"); block.forEach(function (row) { eSh.appendRow(row); });
  ["Offers", "Chat", "Events"].forEach(function (n) { delete MEMO_[n]; });
  if (offers.length || chat.length) PropertiesService.getScriptProperties().setProperty("SEED_AT", new Date().toISOString());
  var out = { ok: true, offers: offers.length, msgs: chat.length, block: block.length, skipped: skipped, wiped: wiped };
  deskPost_("note", "🎭 Seed data built: " + out.offers + " offers, " + out.msgs + " messages, " + out.block + " trade-block listings" + (skipped.length ? ". Skipped: " + skipped.join(", ") : "") + ".", "", "SEED");
  return out;
}
