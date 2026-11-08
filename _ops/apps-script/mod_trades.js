/**
 * MAFFL HQ App backend PART: trades (offers, responses, commish review, trade block), credit perks, and the credit ledger push (credit sync robot).
 * Not standalone: logic.js (the core) evaluates this file inside its own scope (see parts_ in logic.js), so it uses the
 * core's helpers by plain name and its functions are callable from every other part. Bump VERSION in logic.js when you
 * change this file. Keep it under ~90 KB.
 */
// ---------------------------------------------------------------- trades (test Sheet only; never gold)
// Statuses: PROPOSED → ACCEPTED (24h review, visible to the tier) → APPROVED | NEGATED; or DECLINED / WITHDRAWN.
function offer_(me, b) {
  if (new Date() > TRADE_DEADLINE) return { ok: false, error: "The trade deadline has passed" };
  var to = ownerRow_(b.to), from = ownerRow_(me.owner);
  if (!to || norm_(to.owner) === norm_(me.owner)) return { ok: false, error: "Pick a trade partner" };
  if (String(to.tier) !== String(from.tier)) return { ok: false, error: "Trades stay inside your tier" };
  var give = (b.give || []).slice(0, 20), get = (b.get || []).slice(0, 20);
  var gc = Math.max(0, Math.floor(Number(b.giveCredits) || 0)), tc = Math.max(0, Math.floor(Number(b.getCredits) || 0));
  if (!give.length && !get.length) return { ok: false, error: "Every trade needs at least one player" };
  if (!give.length && !gc) return { ok: false, error: "You have to send something" };
  if (!get.length && !tc) return { ok: false, error: "You have to get something back" };
  var id = "T" + Utilities.getUuid().slice(0, 8).toUpperCase(), now = new Date();
  // A counter declines the offer it answers (one step, so the thread shows one "countered" card, not two).
  var co = b.counterOf ? offerRow_(b.counterOf) : null, isCounter = !!(co && co.status === "PROPOSED" && norm_(co.to_owner) === norm_(me.owner) && norm_(co.from_owner) === norm_(to.owner));
  sheet_("Offers").appendRow(cells_([id, now, from.owner, to.owner, from.tier, JSON.stringify(give), JSON.stringify(get), gc, tc, safe_(String(b.note || "").slice(0, 200)), "PROPOSED", now, "", JSON.stringify((b.reasons || []).slice(0, 6).map(function (r) { return String(r).slice(0, 30); }))]));
  log_(me.owner, "offer", id, "PROPOSED", "", to.owner);
  if (isCounter) { setOffer_(co, "DECLINED", "Countered"); log_(me.owner, "offer", co.offer_id, "DECLINED", "", "counter " + id); }
  post_(roomDM_(from.owner, to.owner), from.owner, "offer", b.note, id, isCounter ? "COUNTER" : "PROPOSED");
  notify_([to.owner], isCounter ? "countered" : "received", "MAFFL HQ: " + (isCounter ? from.team + " countered your offer" : "trade offer from " + from.team),
    from.team + (isCounter ? " sent a counter." : " sent you a trade offer.") + "\nYou'd get: " + legText_(give, gc) + "\nThey'd get: " + legText_(get, tc) + (b.note ? "\nNote: " + String(b.note).slice(0, 200) : ""),
    APP_URL + "#offer-" + id, me.owner);
  return { ok: true, offer_id: id, room: roomDM_(from.owner, to.owner) };
}
function offerRow_(id) { return rows_("Offers").filter(function (r) { return String(r.offer_id) === String(id); })[0]; }
function setOffer_(o, status, reason) {
  setCell_("Offers", o._row, "status", status); setCell_("Offers", o._row, "updated_ts", new Date());
  if (reason) setCell_("Offers", o._row, "reason", String(reason).slice(0, 200));
}
function legText_(players, credits) {
  var p = (players || []).map(String), c = Number(credits) || 0;
  if (c) p.push(c + " credit" + (c === 1 ? "" : "s"));
  return p.length ? p.join(", ") : "nothing";
}
function respond_(me, id, decision, quiet) {
  var o = offerRow_(id); if (!o) return { ok: false, error: "Offer not found" };
  if (o.status !== "PROPOSED") return { ok: false, error: "That offer is already " + String(o.status).toLowerCase() };
  var isTo = norm_(o.to_owner) === norm_(me.owner), isFrom = norm_(o.from_owner) === norm_(me.owner);
  var next = { accept: isTo && "ACCEPTED", decline: isTo && "DECLINED", withdraw: isFrom && "WITHDRAWN" }[decision];
  if (!next) return { ok: false, error: "You can't do that to this offer" };
  if (next === "ACCEPTED" && new Date() > TRADE_DEADLINE) return { ok: false, error: "The trade deadline has passed" };
  setOffer_(o, next); log_(me.owner, "offer", id, next, "", "");
  post_(roomDM_(o.from_owner, o.to_owner), me.owner, "offer", "", id, next);
  if (next === "ACCEPTED") { post_("tier:" + o.tier, BOT, "offer", "", id, "REVIEW"); deskPost_("offer", "", id, "REVIEW"); } // accepted trades are public to the tier
  if (!quiet && (next === "ACCEPTED" || next === "DECLINED")) notify_([o.from_owner], next.toLowerCase(), "MAFFL HQ: " + teamName_(o.to_owner) + " " + next.toLowerCase() + " your offer",
    teamName_(o.to_owner) + " " + next.toLowerCase() + " your trade offer." + (next === "ACCEPTED" ? "\nNext: send the player side on ESPN. Credits move when the commish approves." : ""), APP_URL + "#offer-" + id, me.owner);
  return { ok: true, status: next };
}
function commish_(me, id, decision, reason) {
  if (!me.commish) return { ok: false, error: "Commish only" };
  var o = offerRow_(id); if (!o) return { ok: false, error: "Offer not found" };
  if (o.status !== "ACCEPTED") return { ok: false, error: "Only accepted trades can be approved or negated" };
  var next = decision === "approve" ? "APPROVED" : decision === "negate" ? "NEGATED" : null;
  if (!next) return { ok: false, error: "approve or negate" };
  setOffer_(o, next, reason); log_(me.owner, "commish", id, next, "", String(reason || ""));
  post_(roomDM_(o.from_owner, o.to_owner), BOT, "offer", reason, id, next);
  post_(next === "APPROVED" ? "league" : "tier:" + o.tier, BOT, "offer", reason, id, next); // completed trades go to the whole league
  var out = { ok: true, status: next };
  if (next === "APPROVED" && (Number(o.give_credits) || Number(o.get_credits))) { setCell_("Offers", o._row, "sync", syncMode_()); out.sync = pushLedger_(); }
  notify_([o.from_owner, o.to_owner], "commish", "MAFFL HQ: trade " + next.toLowerCase(), teamName_(o.from_owner) + " ↔ " + teamName_(o.to_owner) + " was " + next.toLowerCase() + " by the commish." +
    (reason ? "\nReason: " + reason : "") + (next === "APPROVED" && (Number(o.give_credits) || Number(o.get_credits)) ? "\nThe credits post to the official record automatically." : ""), APP_URL + "#offer-" + id);
  return out;
}
function trades_(owner) {
  var me = owner ? ownerRow_(owner) : null, commish = me && String(me.is_commish) === "Y";
  var offers = (sheetGet_("Offers") ? rows_("Offers") : []).filter(function (o) {
    var mine = me && (norm_(o.from_owner) === norm_(me.owner) || norm_(o.to_owner) === norm_(me.owner));
    var tierPublic = me && String(o.tier) === String(me.tier) && ["ACCEPTED", "APPROVED", "NEGATED"].indexOf(o.status) >= 0;
    return mine || tierPublic || (commish && o.status === "ACCEPTED");
  }).map(function (o) {
    return { id: o.offer_id, ts: o.ts, from: o.from_owner, to: o.to_owner, tier: o.tier, give: JSON.parse(o.give || "[]"), get: JSON.parse(o.get || "[]"),
      giveCredits: Number(o.give_credits) || 0, getCredits: Number(o.get_credits) || 0, note: o.note, status: o.status, updated: o.updated_ts, reason: o.reason, reasons: (function () { try { return JSON.parse(o.reasons || "[]"); } catch (e) { return []; } })() };
  });
  var block = {}; // player -> {owner, note} (last write wins)
  rows_("Events").forEach(function (e) {
    if (e.type !== "block") return;
    if (e.value === "on") block[e.ref] = { owner: e.owner, note: e.meta }; else if (block[e.ref] && norm_(block[e.ref].owner) === norm_(e.owner)) delete block[e.ref];
  });
  return { offers: offers, block: block };
}

// ---------------------------------------------------------------- credit perks (test Sheet only; never gold)
// Statuses: REQUESTED → APPROVED | DENIED (commish), or CANCELED (owner, while still REQUESTED).
// Balance is checked in the app and by the commish at approval (the backend doesn't hold credit totals).
function livePerks_() { return rows_("Perks").filter(function (r) { return ["REQUESTED", "APPROVED"].indexOf(r.status) >= 0; }); }
function perk_(me, b) {
  var P = PERKS[b.perk]; if (!P) return { ok: false, error: "Unknown perk" };
  var now = new Date(), week = Math.floor(Number(b.week) || 0), qty = 1, player = "", pos = "", swapWith = "", affects = [];
  var mine = livePerks_().filter(function (r) { return norm_(r.owner) === norm_(me.owner); });
  if (b.perk === "faab") {
    qty = Math.floor(Number(b.qty) || 0); if (qty < 1 || qty > 20) return { ok: false, error: "Pick 1 to 20 ($20 each)" };
  } else if (b.perk === "double" || b.perk === "swap") {
    if (week < 1 || week > REG_WEEKS) return { ok: false, error: "Regular season weeks only (1–" + REG_WEEKS + "). Consolation weeks: ask the commish." };
    if (now > perkDeadline_(week)) return { ok: false, error: "Week " + week + " is locked (Thursday 6 PM ET deadline)" };
    var same = mine.filter(function (r) { return r.perk === b.perk && Number(r.week) === week; });
    if (b.perk === "double") {
      player = String(b.player || "").slice(0, 60); pos = String(b.pos || "").slice(0, 8);
      if (!player) return { ok: false, error: "Pick a player" };
      if (same.length >= 2) return { ok: false, error: "Max 2 Double Bonuses per week" };
      if (same.some(function (r) { return r.player === player; })) return { ok: false, error: player + " already has one that week" };
    } else {
      var to = ownerRow_(b.swapWith);
      if (!to || norm_(to.owner) === norm_(me.owner)) return { ok: false, error: "Pick a team to swap with" };
      if (String(to.tier) !== String(me.tier)) return { ok: false, error: "Swaps stay inside your tier" };
      if (same.length) return { ok: false, error: "1 Matchup Swap per week" };
      swapWith = to.owner;
    }
    affects = (b.affects || []).slice(0, 4).map(function (x) { return String(x).slice(0, 60); });
  } else if (b.perk === "insurance") {
    if (String(me.tier) !== "U") return { ok: false, error: "Relegation Insurance is an Upper-Tier perk" };
    if (now > INSURANCE_CLOSES) return { ok: false, error: "Closed at Week 4 kickoff (Oct 1)" };
    var taken = livePerks_().filter(function (r) { return r.perk === "insurance"; });
    if (taken.length >= INSURANCE_MAX) return { ok: false, error: "All " + INSURANCE_MAX + " are taken this season" };
    if (taken.some(function (r) { return norm_(r.owner) === norm_(me.owner); })) return { ok: false, error: "You already have it" };
  } else if (b.perk === "divswap") {
    return { ok: false, error: "Division Swaps are off-season only (open when provisional divisions post; lock Labor Day Eve)" };
  }
  var cost = P.cost * qty, id = "P" + Utilities.getUuid().slice(0, 8).toUpperCase();
  sheet_("Perks").appendRow(cells_([id, now, me.owner, me.tier, String(b.perk), cost, qty, week || "", player, pos, swapWith, JSON.stringify(affects), String(b.note || "").slice(0, 200), "REQUESTED", now, ""]));
  log_(me.owner, "perk", id, "REQUESTED", week || "", b.perk);
  deskPost_("perk", String(b.note || "").slice(0, 200), id, "REQUESTED");
  try {
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "MAFFL HQ: " + P.name + " request from " + me.owner,
      me.owner + " (" + me.team + ") requested " + P.name + " for " + cost + " credit" + (cost === 1 ? "" : "s") +
      (b.perk === "faab" ? " (+$" + 20 * qty + " FAAB)" : "") + (week ? ", Week " + week : "") + (player ? ", " + player + (pos ? " (" + pos + ")" : "") : "") +
      (swapWith ? ", swap opponents with " + swapWith : "") + (b.note ? "\nNote: " + b.note : "") +
      "\n\nApprove or deny in the app: Team → Credits.");
  } catch (err) {} // email is a nudge; the request stands either way
  return { ok: true, perk_id: id, cost: cost };
}
function perkAct_(me, id, decision, reason) {
  var r = rows_("Perks").filter(function (x) { return String(x.perk_id) === String(id); })[0];
  if (!r) return { ok: false, error: "Request not found" };
  if (r.status !== "REQUESTED") return { ok: false, error: "That request is already " + String(r.status).toLowerCase() };
  var next = decision === "cancel" && norm_(r.owner) === norm_(me.owner) ? "CANCELED"
    : me.commish && decision === "approve" ? "APPROVED" : me.commish && decision === "deny" ? "DENIED" : null;
  if (!next) return { ok: false, error: "You can't do that to this request" };
  setCell_("Perks", r._row, "status", next); setCell_("Perks", r._row, "updated_ts", new Date());
  if (reason) setCell_("Perks", r._row, "reason", String(reason).slice(0, 200));
  log_(me.owner, "perk", id, next, r.week || "", String(reason || ""));
  if (next === "CANCELED") deskPost_("perk", "", id, "CANCELED");
  var out = { ok: true, status: next };
  if (next === "APPROVED") { setCell_("Perks", r._row, "sync", syncMode_()); out.sync = pushLedger_(); }
  if (next !== "CANCELED") notify_([r.owner], "perks", "MAFFL HQ: " + (PERKS[r.perk] || {}).name + " " + next.toLowerCase(),
    "Your " + (PERKS[r.perk] || {}).name + " request (" + r.cost + " credits" + (r.week ? ", Week " + r.week : "") + (r.player ? ", " + r.player : "") + ") was " + next.toLowerCase() + "." +
    (reason ? "\nCommish: " + reason : "") + (next === "APPROVED" ? "\nThe credits post to the official record automatically." : ""), APP_URL + "#team");
  return out;
}
// Yours, ones that touch you (your opponent's Double Bonus, a swap that moves you), and for the commish everything open.
function perks_(owner) {
  var me = owner ? ownerRow_(owner) : null, commish = me && String(me.is_commish) === "Y", all = rows_("Perks");
  var list = !me ? [] : all.filter(function (r) {
    var aff = []; try { aff = JSON.parse(r.affects || "[]"); } catch (e) {}
    return norm_(r.owner) === norm_(me.owner) || (r.status !== "CANCELED" && (norm_(r.swap_with) === norm_(me.owner) || aff.some(function (a) { return norm_(a) === norm_(me.owner); }))) || (commish && r.status === "REQUESTED");
  }).map(function (r) {
    var aff = []; try { aff = JSON.parse(r.affects || "[]"); } catch (e) {}
    return { id: r.perk_id, ts: r.ts, owner: r.owner, tier: r.tier, perk: r.perk, cost: Number(r.cost) || 0, qty: Number(r.qty) || 1, week: Number(r.week) || null,
      player: r.player, pos: r.pos, swapWith: r.swap_with, affects: aff, note: r.note, status: r.status, updated: r.updated_ts, reason: r.reason };
  });
  var ins = all.filter(function (r) { return r.perk === "insurance" && ["REQUESTED", "APPROVED"].indexOf(r.status) >= 0; }).length;
  return { perks: list, insuranceLeft: Math.max(0, INSURANCE_MAX - ins) };
}

// ---------------------------------------------------------------- credit ledger → repo (credit sync robot)
// Every approved perk and every approved trade with credits becomes ledger rows. After each approval the backend
// pushes the WHOLE ledger (idempotent) to the repo; .github/workflows/credit-sync.yml applies new rows to
// data/Credit_Log.csv, balances and credits.html. Script properties:
//   GITHUB_TOKEN  fine-grained token, repo maffl-commish/maffl, Contents: read & write (needed to push)
//   CREDIT_SYNC   "live" = real credits (credit_ledger.json). Anything else = TEST (credit_ledger_test.json, robot dry run).
// Rows remember the mode they were approved in, so lab tests never leak into the live ledger.
// REPO lives in logic.js (the core needs it to load the parts)
function syncMode_() { return String(PropertiesService.getScriptProperties().getProperty("CREDIT_SYNC") || "").toLowerCase() === "live" ? "live" : "test"; }
function teamName_(owner) { var o = ownerRow_(owner); return o ? o.team : owner; }
function ledger_(mode) {
  var out = [];
  rows_("Perks").forEach(function (r) {
    if (r.status !== "APPROVED" || (r.sync || "test") !== mode) return;
    var P = PERKS[r.perk] || { name: r.perk };
    out.push({ id: "L-" + r.perk_id, season: 2026, owner: r.owner, category: "Spend", type: P.name, amount: -Math.abs(Number(r.cost) || 0),
      notes: (r.perk === "faab" ? "+$" + 20 * (Number(r.qty) || 1) + " FAAB" : r.perk === "double" ? "Wk " + r.week + " · " + r.player + (r.pos ? " (" + r.pos + ")" : "")
        : r.perk === "swap" ? "Wk " + r.week + " · swapped opponents with " + r.swap_with : r.perk === "insurance" ? "2026 season" : "") + " · app request " + r.perk_id,
      approved: r.updated_ts });
  });
  rows_("Offers").forEach(function (o) {
    if (o.status !== "APPROVED" || (o.sync || "test") !== mode) return;
    var gc = Number(o.give_credits) || 0, tc = Number(o.get_credits) || 0, note = "trade " + o.offer_id + " · " + o.from_owner + " ↔ " + o.to_owner;
    if (gc) { out.push({ id: "L-" + o.offer_id + "A", season: 2026, owner: o.from_owner, category: "Trade", type: "Trade", amount: -gc, notes: "to " + o.to_owner + " · " + note, approved: o.updated_ts });
              out.push({ id: "L-" + o.offer_id + "B", season: 2026, owner: o.to_owner, category: "Trade", type: "Trade", amount: gc, notes: "from " + o.from_owner + " · " + note, approved: o.updated_ts }); }
    if (tc) { out.push({ id: "L-" + o.offer_id + "C", season: 2026, owner: o.to_owner, category: "Trade", type: "Trade", amount: -tc, notes: "to " + o.from_owner + " · " + note, approved: o.updated_ts });
              out.push({ id: "L-" + o.offer_id + "D", season: 2026, owner: o.from_owner, category: "Trade", type: "Trade", amount: tc, notes: "from " + o.to_owner + " · " + note, approved: o.updated_ts }); }
  });
  var aw = SpreadsheetApp.getActive().getSheetByName("Awards"); // credit awards approved on the desk (daily.js §2c)
  if (aw) rows_("Awards").forEach(function (a) {
    if (a.status !== "APPROVED" || (a.sync || "test") !== mode) return;
    out.push({ id: "L-" + a.award_id, season: 2026, owner: a.owner, category: "Earn", type: a.award, amount: Math.abs(Number(a.credits) || 0), notes: a.detail + " · app award " + a.award_id, approved: a.updated_ts });
  });
  return out.sort(function (a, b) { return new Date(a.approved) - new Date(b.approved); });
}
function pushLedger_() {
  var props = PropertiesService.getScriptProperties(), token = props.getProperty("GITHUB_TOKEN"), mode = syncMode_();
  var path = "_ops/inbox/credit_ledger" + (mode === "live" ? "" : "_test") + ".json";
  var rows = ledger_(mode), body = JSON.stringify({ mode: mode, generated: new Date().toISOString(), source: "logic.js v" + VERSION, rows: rows }, null, 1);
  var res = { ok: false, mode: mode, rows: rows.length };
  try {
    if (!token) throw new Error("SETUP: add Script property GITHUB_TOKEN so approvals post automatically");
    var url = "https://api.github.com/repos/" + REPO + "/contents/" + path, h = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
    var cur = UrlFetchApp.fetch(url + "?ref=main", { headers: h, muteHttpExceptions: true }), sha = null;
    if (cur.getResponseCode() === 200) { var c = JSON.parse(cur.getContentText()); sha = c.sha;
      if (Utilities.newBlob(Utilities.base64Decode(c.content.replace(/\n/g, ""))).getDataAsString().replace(/"generated":"[^"]*",?/, "") === body.replace(/"generated":"[^"]*",?/, "")) { res.ok = true; res.same = true; }
    }
    if (!res.same) {
      var put = UrlFetchApp.fetch(url, { method: "put", headers: h, contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({ message: "Credit ledger (" + mode + "): " + rows.length + " row" + (rows.length === 1 ? "" : "s") + " from the app", branch: "main",
          content: Utilities.base64Encode(body, Utilities.Charset.UTF_8), sha: sha || undefined,
          committer: { name: "maffl-app-backend", email: "41898282+github-actions[bot]@users.noreply.github.com" } }) });
      if (put.getResponseCode() >= 300) throw new Error("GitHub said " + put.getResponseCode() + ": " + put.getContentText().slice(0, 140));
      res.ok = true;
    }
  } catch (err) {
    res.error = String(err.message || err).replace(/^SETUP: /, "");
    deskPost_("alert", "Credit sync didn't post: " + res.error.replace(/\.?$/, ".") + " The approval stands. Fix it, then tap Re-send ledger.", "", "SYNC");
    try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "MAFFL HQ: credit sync didn't post", res.error + "\n\nThe approval stands. Fix it, then tap Re-send ledger in the app (Team → Credits)."); } catch (e) {}
  }
  props.setProperty("LAST_SYNC", JSON.stringify({ at: new Date().toISOString(), ok: res.ok, mode: mode, rows: rows.length, error: res.error || "" }));
  return res;
}
// Best-effort email, only to owners who turned that email on in More → Settings (all off by default; §4b).
// Never emails the person who did the action. Never blocks the action.
function notify_(owners, key, subject, text, link, actor) {
  try {
    owners.forEach(function (n) { var o = ownerRow_(n); var to = o && String(o.email || "").trim();
      if (!to || !/@/.test(to) || !prefs_(o)[key] || (actor && norm_(o.owner) === norm_(actor))) return;
      MailApp.sendEmail(to, subject, text + "\n\nOpen MAFFL HQ: " + (link || APP_URL) + "\n\n(Turn these emails off in MAFFL HQ → More → Settings.)"); });
  } catch (err) {}
}

