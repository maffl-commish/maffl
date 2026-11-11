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
  var give = (b.give || []).slice(0, 20).map(function (x) { return String(x).slice(0, 60); }), get = (b.get || []).slice(0, 20).map(function (x) { return String(x).slice(0, 60); });
  var gc = Math.max(0, Math.floor(Number(b.giveCredits) || 0)), tc = Math.max(0, Math.floor(Number(b.getCredits) || 0));
  if (!give.length && !get.length) return { ok: false, error: "Every trade needs at least one player" };
  if (!give.length && !gc) return { ok: false, error: "You have to send something" };
  if (!get.length && !tc) return { ok: false, error: "You have to get something back" };
  var short = creditShort_(from.owner, gc, { offer: b.counterOf }, "you") || creditShort_(to.owner, tc, {}, to.team);
  if (short) return { ok: false, error: short };
  var bad = rosterProblem_(from.tier, from.owner, give, "you") || rosterProblem_(from.tier, to.owner, get, to.team);
  if (bad) return { ok: false, error: bad };
  // Same offer sent twice in a few minutes (double tap, or a retry after a lost answer): hand back the first one.
  var key = JSON.stringify([give.slice().sort(), get.slice().sort(), gc, tc]), dup = rows_("Offers").filter(function (o) {
    return o.status === "PROPOSED" && norm_(o.from_owner) === norm_(from.owner) && norm_(o.to_owner) === norm_(to.owner) && Date.now() - new Date(o.ts).getTime() < 10 * 6e4 &&
      JSON.stringify([JSON.parse(o.give || "[]").sort(), JSON.parse(o.get || "[]").sort(), Number(o.give_credits) || 0, Number(o.get_credits) || 0]) === key; })[0];
  if (dup) return { ok: true, offer_id: dup.offer_id, room: roomDM_(from.owner, to.owner), duplicate: true };
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
  if (next === "ACCEPTED") { var short = creditShort_(o.to_owner, Number(o.get_credits) || 0, { offer: id }, "you") || creditShort_(o.from_owner, Number(o.give_credits) || 0, { offer: id }, teamName_(o.from_owner)) || tradeProblem_(o, "you");
    if (short) return { ok: false, error: short }; }
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
  if (next === "APPROVED") { var short = creditShort_(o.from_owner, Number(o.give_credits) || 0, { offer: id }, teamName_(o.from_owner)) || creditShort_(o.to_owner, Number(o.get_credits) || 0, { offer: id }, teamName_(o.to_owner)) || tradeProblem_(o, teamName_(o.to_owner));
    if (short) return { ok: false, error: short + " Negate it, or wait for their balance." }; }
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

// ---------------------------------------------------------------- roster checks
// Players in a trade must be on that side's ESPN roster (rosters_ is cached 30 min). If ESPN can't be read at all, the
// check steps aside (the commish still reviews every trade). who = "you" or the other team's name.
function rosterProblem_(tier, owner, names, who) {
  if (!names.length) return null;
  var r = null; try { r = rosters_(tier); } catch (e) { return null; }
  var team = ((r && r.teams) || []).filter(function (t) { return norm_(t.owner) === norm_(owner); })[0]; if (!team) return null;
  var have = {}; team.players.forEach(function (p) { have[norm_(p.n)] = 1; });
  var gone = names.filter(function (n) { return !have[norm_(n)]; });
  if (!gone.length) return null;
  return gone.join(", ") + (gone.length === 1 ? " isn't" : " aren't") + " on " + (who === "you" ? "your" : who + "'s") + " ESPN roster" + (gone.length === 1 ? "" : "s") + " right now.";
}
// Accept / approve: rosters still hold, and no player is already in another accepted trade (or one approved in the last
// 3 days whose ESPN move may not show yet).
function tradeProblem_(o, who) {
  var give = JSON.parse(o.give || "[]"), get = JSON.parse(o.get || "[]");
  var bad = rosterProblem_(o.tier, o.from_owner, give, teamName_(o.from_owner)) || rosterProblem_(o.tier, o.to_owner, get, who);
  if (bad) return bad;
  var mine = {}; give.concat(get).forEach(function (n) { mine[norm_(n)] = n; });
  var clash = null;
  rows_("Offers").forEach(function (x) {
    if (clash || String(x.offer_id) === String(o.offer_id) || String(x.tier) !== String(o.tier)) return;
    var live = x.status === "ACCEPTED" || (x.status === "APPROVED" && Date.now() - new Date(x.updated_ts).getTime() < 3 * 864e5);
    if (!live) return;
    JSON.parse(x.give || "[]").concat(JSON.parse(x.get || "[]")).forEach(function (n) { if (!clash && mine[norm_(n)]) clash = mine[norm_(n)]; });
  });
  return clash ? clash + " is already in another accepted trade." : null;
}

// ---------------------------------------------------------------- credit balance (server-side check)
// What an owner can spend right now = the official record (data/Credit_Log.csv on main: Approved?=Y rows with a season,
// the same sum the credit sync robot writes) + app-approved ledger rows the robot hasn't posted yet − credits on hold
// (open perk requests, offers they'd pay into). `skip` = {offer, perk} ids to leave out (the one being decided).
function officialCredits_() {
  var c = CacheService.getScriptCache(), hit = c.get("credlog"); if (hit) return JSON.parse(hit);
  var res = UrlFetchApp.fetch("https://raw.githubusercontent.com/" + REPO + "/main/data/Credit_Log.csv?t=" + Date.now(), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  var rows = Utilities.parseCsv(res.getContentText()), h = rows[0] || [], iS = h.indexOf("Season"), iO = h.indexOf("Owner"), iA = h.indexOf("Credit +/-"), iY = h.indexOf("Approved?"), iN = h.indexOf("Notes");
  var out = { bal: {}, posted: {} };
  rows.slice(1).forEach(function (r) {
    var m = /\[app (L-[A-Za-z0-9-]+)\]/.exec(r[iN] || ""); if (m) out.posted[m[1]] = 1;
    if (String(r[iY] || "").trim() !== "Y" || !String(r[iS] || "").trim()) return;
    var k = norm_(r[iO]), n = Math.round(Number(r[iA]) || 0); out.bal[k] = (out.bal[k] || 0) + n;
  });
  c.put("credlog", JSON.stringify(out), 300);
  return out;
}
function spendable_(owner, skip) {
  skip = skip || {}; var off = officialCredits_(); if (!off) return null;
  var k = norm_(owner), n = off.bal[k] || 0;
  ledger_(syncMode_()).forEach(function (r) { if (norm_(r.owner) === k && !off.posted[r.id]) n += Number(r.amount) || 0; });
  rows_("Perks").forEach(function (r) { if (r.status === "REQUESTED" && norm_(r.owner) === k && String(r.perk_id) !== String(skip.perk)) n -= Number(r.cost) || 0; });
  (sheetGet_("Offers") ? rows_("Offers") : []).forEach(function (o) {
    if (String(o.offer_id) === String(skip.offer)) return;
    if ((o.status === "PROPOSED" || o.status === "ACCEPTED") && norm_(o.from_owner) === k) n -= Number(o.give_credits) || 0;
    if (o.status === "ACCEPTED" && norm_(o.to_owner) === k) n -= Number(o.get_credits) || 0;
  });
  return n;
}
// null = fine; otherwise the error to return. who = "you" or the other owner's name.
function creditShort_(owner, need, skip, who) {
  if (!(need > 0)) return null;
  var have = spendable_(owner, skip);
  if (have === null) return "Couldn't check credit balances right now. Try again in a minute.";
  if (need <= have) return null;
  var h = Math.max(0, have) + " credit" + (Math.max(0, have) === 1 ? "" : "s");
  return who === "you" ? "You have " + h + " to spend (after open requests and offers), not " + need + "." : who + " only has " + h + " to spend right now, not " + need + ".";
}

// ---------------------------------------------------------------- credit perks (test Sheet only; never gold)
// Statuses: REQUESTED → APPROVED | DENIED (commish), or CANCELED (owner, while still REQUESTED).
// Balance is checked here too (spendable_: request, and again at approval).
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
  var dup = rows_("Perks").filter(function (r) { return r.status === "REQUESTED" && norm_(r.owner) === norm_(me.owner) && r.perk === b.perk && Number(r.qty) === qty &&
    String(r.week || "") === String(week || "") && String(r.player || "") === player && String(r.swap_with || "") === swapWith && Date.now() - new Date(r.ts).getTime() < 10 * 6e4; })[0];
  if (dup) return { ok: true, perk_id: dup.perk_id, cost: Number(dup.cost) || cost, duplicate: true }; // double tap / retry: the first request stands
  var short = creditShort_(me.owner, cost, {}, "you"); if (short) return { ok: false, error: short };
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
  if (next === "APPROVED") { var short = creditShort_(r.owner, Number(r.cost) || 0, { perk: id }, teamName_(r.owner)); if (short) return { ok: false, error: short + " Deny it, or wait for their balance." }; }
  setCell_("Perks", r._row, "status", next); setCell_("Perks", r._row, "updated_ts", new Date());
  if (reason) setCell_("Perks", r._row, "reason", String(reason).slice(0, 200));
  log_(me.owner, "perk", id, next, r.week || "", String(reason || ""));
  if (next === "CANCELED") deskPost_("perk", "", id, "CANCELED");
  var out = { ok: true, status: next };
  if (next === "APPROVED") { setCell_("Perks", r._row, "sync", syncMode_()); out.sync = pushLedger_(); perkNews_(r); }
  if (next !== "CANCELED") notify_([r.owner], "perks", "MAFFL HQ: " + (PERKS[r.perk] || {}).name + " " + next.toLowerCase(),
    "Your " + (PERKS[r.perk] || {}).name + " request (" + r.cost + " credits" + (r.week ? ", Week " + r.week : "") + (r.player ? ", " + r.player : "") + ") was " + next.toLowerCase() + "." +
    (reason ? "\nCommish: " + reason : "") + (next === "APPROVED" ? "\nThe credits post to the official record automatically." : ""), APP_URL + "#team");
  return out;
}
// Approved perk → league chat news (commish 11/7): who spent what, on whom, which week, with @mentions so the
// owner and everyone it touches get the @ badge. Extra FAAB posts too (waiver budgets are public, commish 11/8).
// Who an owner plays in a week, from the daily run's ESPN schedule (both tiers; "" if unknown or the Ghost).
function weekOpp_(owner, wk) {
  try { need_("daily"); var sn = DAILY.snapshot(), out = ""; Object.keys(sn.tiers || {}).forEach(function (t) { var s = sn.tiers[t], tm = s.teams || {};
    var me = Object.keys(tm).filter(function (id) { return norm_(tm[id].owner) === norm_(owner); })[0]; if (!me) return;
    (s.games || []).forEach(function (g) { if (Number(g[0]) !== Number(wk) || g[6]) return; var o = String(g[1]) === me ? g[3] : String(g[3]) === me ? g[1] : null;
      if (o != null && tm[o] && tm[o].owner) out = tm[o].owner; }); }); return out; } catch (e) { return ""; }
}
function perkNews_(r) {
  var aff = []; try { aff = JSON.parse(r.affects || "[]"); } catch (e) {}
  var at = function (n) { return at_(n); }, cost = Number(r.cost) || 0, cr = cost + " credit" + (cost === 1 ? "" : "s"), wk = r.week ? " · Week " + r.week : "";
  if (!aff.length && r.week && (r.perk === "double" || r.perk === "swap")) aff = [weekOpp_(r.owner, r.week), r.swap_with ? weekOpp_(r.swap_with, r.week) : ""]; // the app didn't say who it hits: read it off the ESPN schedule (commish 11/9)
  var opp = aff.filter(function (a) { return a && norm_(a) !== norm_(r.owner) && norm_(a) !== norm_(r.swap_with); });
  var text = r.perk === "double" ? "✖️2 Double Player Bonus" + wk + "\n" + at(r.owner) + " spent " + cr + ": " + r.player + (r.pos ? " (" + r.pos + ")" : "") + " scores double" + (opp.length ? " vs " + opp.map(at).join(", ") : "") + "."
    : r.perk === "swap" ? "🔀 Matchup Swap" + wk + "\n" + at(r.owner) + " spent " + cr + " to swap opponents with " + at(r.swap_with) + "." + (opp.length ? " New matchups for " + opp.map(at).join(" and ") + "." : "")
    : r.perk === "faab" ? "💰 Extra FAAB\n" + at(r.owner) + " spent " + cr + " for +$" + 20 * (Number(r.qty) || 1) + " FAAB."
    : r.perk === "insurance" ? "🛡️ Relegation Insurance\n" + at(r.owner) + " spent " + cr + " to insure against relegation this season."
    : "🎟️ " + ((PERKS[r.perk] || {}).name || r.perk) + wk + "\n" + at(r.owner) + " spent " + cr + ".";
  var seen = {}, mentions = [r.owner, r.swap_with].concat(opp).filter(function (n) { var o = n && ownerRow_(n), k = o && norm_(o.owner); if (!k || seen[k]) return false; seen[k] = 1; return true; })
    .map(function (n) { return ownerRow_(n).owner; });
  try { post_("league", BOT, "text", text + (syncMode_() === "live" ? "" : "\n🧪 Test, not real credits."), r.perk_id, "APPROVED", mentions, ""); } catch (e) {}
}
// App-approved credit moves the official Credit_Log doesn't show yet, for every owner, so balances in the app
// (standings, Team → Credits) count them right away. TEST mode: the robot only dry-runs, so test moves stay
// here until the test data is wiped. null = couldn't read Credit_Log; the app then falls back to "held".
function pendingMoves_() {
  try { var off = officialCredits_(); if (!off) return null; var mode = syncMode_();
    return ledger_(mode).filter(function (x) { return !off.posted[x.id]; }).map(function (x) {
      return { id: x.id, owner: x.owner, amount: x.amount, type: x.type, category: x.category, notes: x.notes, test: mode !== "live" }; });
  } catch (e) { return null; }
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
function syncMode_() { return String(prop_("CREDIT_SYNC") || "").toLowerCase() === "live" ? "live" : "test"; }
function teamName_(owner) { var o = ownerRow_(owner); return o ? o.team : owner; }
function ledger_(mode) {
  var out = [];
  rows_("Perks").forEach(function (r) {
    if (r.status !== "APPROVED" || (r.sync || "test") !== mode) return;
    var P = PERKS[r.perk] || { name: r.perk };
    out.push({ seed: isSeedRow_(r), id: "L-" + r.perk_id, season: 2026, owner: r.owner, category: "Spend", type: P.name, amount: -Math.abs(Number(r.cost) || 0),
      notes: (r.perk === "faab" ? "+$" + 20 * (Number(r.qty) || 1) + " FAAB" : r.perk === "double" ? "Wk " + r.week + " · " + r.player + (r.pos ? " (" + r.pos + ")" : "")
        : r.perk === "swap" ? "Wk " + r.week + " · swapped opponents with " + r.swap_with : r.perk === "insurance" ? "2026 season" : "") + " · app request " + r.perk_id,
      approved: r.updated_ts });
  });
  rows_("Offers").forEach(function (o) {
    if (o.status !== "APPROVED" || (o.sync || "test") !== mode) return;
    var gc = Number(o.give_credits) || 0, tc = Number(o.get_credits) || 0, note = "trade " + o.offer_id + " · " + o.from_owner + " ↔ " + o.to_owner;
    var sd = isSeedRow_(o);
    if (gc) { out.push({ seed: sd, id: "L-" + o.offer_id + "A", season: 2026, owner: o.from_owner, category: "Trade", type: "Trade", amount: -gc, notes: "to " + o.to_owner + " · " + note, approved: o.updated_ts });
              out.push({ seed: sd, id: "L-" + o.offer_id + "B", season: 2026, owner: o.to_owner, category: "Trade", type: "Trade", amount: gc, notes: "from " + o.from_owner + " · " + note, approved: o.updated_ts }); }
    if (tc) { out.push({ seed: sd, id: "L-" + o.offer_id + "C", season: 2026, owner: o.to_owner, category: "Trade", type: "Trade", amount: -tc, notes: "to " + o.from_owner + " · " + note, approved: o.updated_ts });
              out.push({ seed: sd, id: "L-" + o.offer_id + "D", season: 2026, owner: o.from_owner, category: "Trade", type: "Trade", amount: tc, notes: "from " + o.to_owner + " · " + note, approved: o.updated_ts }); }
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
  var rows = ledger_(mode).filter(function (r) { return !r.seed; }), body = JSON.stringify({ mode: mode, generated: new Date().toISOString(), source: "logic.js v" + VERSION, rows: rows }, null, 1);
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
// Never emails the person who did the action. Never blocks the action. Before go-live OWNER_EMAILS limits who can get one (commish only, for now).
function notify_(owners, key, subject, text, link, actor) {
  try {
    owners.forEach(function (n) { var o = ownerRow_(n); var to = o && String(o.email || "").trim();
      if (!to || !/@/.test(to) || !prefs_(o)[key] || (actor && norm_(o.owner) === norm_(actor))) return;
      if (OWNER_EMAILS !== "live" && !(OWNER_EMAILS === "beta" ? isBeta_(o) : String(o.is_commish) === "Y")) return; // until go-live: commish only, then beta crew, then everyone
      MailApp.sendEmail(to, subject, text + "\n\nOpen MAFFL HQ: " + (link || APP_URL) + "\n\n(Turn these emails off in MAFFL HQ → More → Settings.)"); });
  } catch (err) {}
}

