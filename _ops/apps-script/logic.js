/**
 * MAFFL HQ App — backend LOGIC. Loaded at runtime by the stable loader (Code.gs) from GitHub main.
 * Ship a backend change = edit this file + push to main. Live within ~5 minutes, no redeploy.
 * Design: _ops/docs/APP_DESIGN.md §7b · guardrails: _ops/docs/TRADE_CENTER_DESIGN.md §5b
 *
 * Contract with the loader: this file is run as the body of `function (M) { ... }` and must
 * export doGet, doPost and the menu handlers on M (see the bottom). Keep it under ~90 KB.
 * Rules: passphrases stored only as salted hashes; Events is append-only; never writes league gold.
 */
var VERSION = "0.9";
var TRADE_DEADLINE = new Date("2026-12-02T12:00:00-05:00");
var OFFER_HEAD = ["offer_id","ts","from_owner","to_owner","tier","give","get","give_credits","get_credits","note","status","updated_ts","reason","reasons"];
var PERK_HEAD = ["perk_id","ts","owner","tier","perk","cost","qty","week","player","pos","swap_with","affects","note","status","updated_ts","reason"];
// Credit perks (rules.html → Credit System → Spending Credits). Commish approves every one.
var PERKS = { faab: { name: "Extra FAAB $", cost: 1 }, double: { name: "Double Player Bonus", cost: 10 }, swap: { name: "Matchup Swap", cost: 10 },
  insurance: { name: "Relegation Insurance", cost: 25 }, divswap: { name: "Division Swap", cost: 10 } };
var INSURANCE_CLOSES = new Date("2026-10-01T20:15:00-04:00"), INSURANCE_MAX = 3, REG_WEEKS = 14;
// Double Bonus / Matchup Swap deadline: Thursday 6:00 PM ET of that week, or 1 hour before the week's first game if earlier
// (Wk 12 = Thanksgiving, first game 12:30 PM → 11:30 AM). Week 1 Thursday = Sep 10, 2026.
function perkDeadline_(week) {
  var d = new Date(Date.UTC(2026, 8, 10 + 7 * (week - 1))), dst = d < new Date(Date.UTC(2026, 10, 1));
  var ymd = d.toISOString().slice(0, 10), hm = week === 12 ? "11:30" : "18:00";
  return new Date(ymd + "T" + hm + ":00" + (dst ? "-04:00" : "-05:00"));
}
var MAX_FAILS_PER_HOUR = 25; // league-wide guess limit for passphrase-only sign-in

// Passphrases are two football words, e.g. GRONK-PISTOL. Case, spaces and dashes don't matter when typing.
var WORDS_A = ["GRONK","BLITZ","PISTOL","HAIL","WILDCAT","SHOTGUN","NICKEL","DIME","REDZONE","AUDIBLE","SPIKE","LAMBEAU",
  "PYLON","STIFFARM","JUKE","SACK","PICKSIX","ONSIDE","FLEAFLICKER","BOOTLEG","CHEESE","FROZEN","TUNDRA","PRIMETIME",
  "TURKEY","GRIDIRON","TOUCHBACK","FUMBLE","WAIVER","BYEWEEK","SLEEPER","HANDCUFF","FLEX","STACK","BOOM","BUST",
  "MONEYBALL","BULLDOZER","TRUCK","HURDLE","DIVE","BLINDSIDE","GOALLINE","HASHMARK","HUDDLE","ENDZONE","BOMB","COUNTER",
  "BLOCKBUSTER","CHAINGANG","COFFIN","DRAWPLAY","FAIRCATCH","FIRSTDOWN","FOURTHDOWN","HAILMARY","HOTROUTE","JUMBO","KNEEL",
  "LATERAL","MUDDY","PLAYBOOK","POCKET","PUNTRETURN","QBSNEAK","REVERSE","ROOKIE","RUSHER","SCRAMBLE","SNAP","SWEEP",
  "TAILGATE","TRICKPLAY","TWOMINUTE","UPBACK","WISHBONE","ZEBRA","SIDELINE","FACEMASK","CHINSTRAP","SUNDAY","MONDAY"];
var WORDS_B = ["PISTOL","HAMMER","TORNADO","EXPRESS","RAMPAGE","CANNON","THUNDER","STAMPEDE","LIGHTNING","BULLDOG","MACHINE",
  "ROCKET","BLIZZARD","GRIZZLY","HURRICANE","JACKPOT","WRECKER","DYNAMO","PRESSURE","FURY","STALLION","TITAN","VORTEX",
  "COMET","AVALANCHE","RHINO","TANK","SPARTAN","VIKING","OUTLAW","MAVERICK","BANDIT","PANTHER","COBRA","FALCON","GLADIATOR",
  "WARHORSE","JUGGERNAUT","BOOMSTICK","DAGGER","HAYMAKER","SLINGSHOT","BRAWLER","ROCKSLIDE","FIREBALL","SNOWPLOW","MONSOON","GOLIATH",
  "BARRACUDA","BISON","BOBCAT","BRONCO","BUZZSAW","CHAINSAW","CYCLONE","DRAGON","EAGLE","EARTHQUAKE","FREIGHTTRAIN","GATOR",
  "GHOST","HAWK","HYENA","JAGUAR","KRAKEN","LANDSLIDE","LION","MAMMOTH","MONGOOSE","MUSTANG","PHANTOM","PIRATE","PYTHON",
  "RAPTOR","RATTLER","SHARK","SLEDGEHAMMER","SPITFIRE","STORM","TIGER","TOMAHAWK","TYPHOON","WOLF","WOLVERINE","YETI"];
function newPhrase_() {
  var a = WORDS_A[Math.floor(Math.random() * WORDS_A.length)], b;
  do { b = WORDS_B[Math.floor(Math.random() * WORDS_B.length)]; } while (b === a);
  return a + "-" + b;
}
function normPin_(pin) { return String(pin || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
var MAX_TRIES = 5;

// ---------------------------------------------------------------- HTTP
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === "summary") return json(summary_(p.week, null));
    if (p.action === "live") { try { return json(live_(p.tier)); } catch (err) { return json({ ok: false, setup: /^SETUP/.test(String(err.message)), error: String(err.message).replace(/^SETUP: /, "") }); } } // public counts only; private data needs POST + passphrase
    if (p.action === "owners") return json({ ok: true, owners: owners_().map(function (o) { return { owner: o.owner, team: o.team, tier: o.tier, hasPin: !!o.pin_hash }; }) });
    return json({ ok: true, version: VERSION, logic: "repo" });
  } catch (err) { return json({ ok: false, error: String(err) }); }
}

// Body is sent as text/plain JSON (avoids a CORS preflight from GitHub Pages).
function doPost(e) {
  var b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { return json({ ok: false, error: "bad json" }); }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (b.action) {
      case "login":   return json(login_(b.owner, b.pin));
      case "request": return json(request_(b.owner, b.note));
      case "react":   return json(withAuth_(b, function (o) { return log_(o.owner, "react", b.ref, b.emoji, b.week, b.on ? "on" : "off"); }));
      case "vote":    return json(withAuth_(b, function (o) { return vote_(o.owner, b.poll, b.choice, b.week); }));
      case "summary": return json(withAuth_(b, function (o) { return summary_(b.week, o.owner); }));
      case "block":   return json(withAuth_(b, function (o) { return log_(o.owner, "block", b.player, b.on ? "on" : "off", "", String(b.note || "").slice(0, 80)); }));
      case "offer":   return json(withAuth_(b, function (o) { return offer_(o, b); }));
      case "respond": return json(withAuth_(b, function (o) { return respond_(o, b.offer_id, b.decision); }));
      case "commish": return json(withAuth_(b, function (o) { return commish_(o, b.offer_id, b.decision, b.reason); }));
      case "perk":    return json(withAuth_(b, function (o) { return perk_(o, b); }));
      case "perkact": return json(withAuth_(b, function (o) { return perkAct_(o, b.perk_id, b.decision, b.reason); }));
      default:        return json({ ok: false, error: "unknown action" });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---------------------------------------------------------------- data helpers
function sheet_(name) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name);
  if (!sh && name === "Offers") { sh = ss.insertSheet("Offers"); sh.appendRow(OFFER_HEAD); sh.setFrozenRows(1); }
  if (!sh && name === "Perks") { sh = ss.insertSheet("Perks"); sh.appendRow(PERK_HEAD); sh.setFrozenRows(1); }
  if (sh && name === "Offers" && sh.getLastColumn() < OFFER_HEAD.length) sh.getRange(1, 1, 1, OFFER_HEAD.length).setValues([OFFER_HEAD]); // add new columns
  return sh;
}
function rows_(name) {
  var v = sheet_(name).getDataRange().getValues(), head = v.shift();
  return v.map(function (r, i) {
    var o = { _row: i + 2, _blank: r.join("") === "" }; head.forEach(function (h, k) { o[h] = r[k]; }); return o;
  }).filter(function (o) { return !o._blank; });
}
function norm_(s) { return String(s || "").replace(/\s*\/\s*/g, "/").trim().toLowerCase(); }
function owners_() { return rows_("Owners"); }
function ownerRow_(owner) { var n = norm_(owner); return owners_().filter(function (o) { return norm_(o.owner) === n; })[0]; }
function hash_(salt, pin) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ":" + normPin_(pin));
  return raw.map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join("");
}
function setCell_(name, row, header, value) {
  var sh = sheet_(name), head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.getRange(row, head.indexOf(header) + 1).setValue(value);
}

// ---------------------------------------------------------------- auth
// Sign in with the passphrase alone: try it against every owner's salted hash.
function loginByPhrase_(pin) {
  var cache = CacheService.getScriptCache(), fails = Number(cache.get("fails") || 0);
  if (fails >= MAX_FAILS_PER_HOUR) return { ok: false, error: "Too many wrong tries. Wait an hour, or ask the commish." };
  if (normPin_(pin).length < 4) return { ok: false, error: "Type your two-word passphrase" };
  var hit = owners_().filter(function (o) { return o.pin_hash && String(o.locked) !== "Y" && hash_(o.salt, pin) === o.pin_hash; })[0];
  if (!hit) {
    cache.put("fails", String(fails + 1), 3600);
    if (fails + 1 === MAX_FAILS_PER_HOUR) MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "MAFFL HQ: sign-in guesses paused",
      MAX_FAILS_PER_HOUR + " wrong passphrases in the last hour. Sign-in is paused for an hour. If that wasn't owners fumbling, consider resetting passphrases.");
    return { ok: false, error: "That passphrase doesn't match anyone" };
  }
  return { ok: true, owner: hit.owner, team: hit.team, tier: hit.tier, commish: String(hit.is_commish) === "Y" };
}
function login_(owner, pin) {
  if (!owner) return loginByPhrase_(pin);
  var o = ownerRow_(owner);
  if (!o) return { ok: false, error: "Unknown owner" };
  if (String(o.locked) === "Y") return { ok: false, error: "Locked after too many tries. Ask the commish for a new passphrase." };
  if (!o.pin_hash) return { ok: false, error: "No passphrase yet. Request one below." };
  if (hash_(o.salt, pin) !== o.pin_hash) {
    var n = Number(o.failed_tries || 0) + 1;
    setCell_("Owners", o._row, "failed_tries", n);
    if (n >= MAX_TRIES) setCell_("Owners", o._row, "locked", "Y");
    return { ok: false, error: n >= MAX_TRIES ? "Locked. Ask the commish for a new passphrase." : "Wrong passphrase (" + (MAX_TRIES - n) + " tries left)" };
  }
  if (Number(o.failed_tries)) setCell_("Owners", o._row, "failed_tries", 0);
  return { ok: true, owner: o.owner, team: o.team, tier: o.tier, commish: String(o.is_commish) === "Y" };
}
function withAuth_(b, fn) {
  var r = login_(b.owner, b.pin);
  if (!r.ok) return r;
  return fn(r);
}

// ---------------------------------------------------------------- writes
function log_(owner, type, ref, value, week, meta) {
  if (!ref) return { ok: false, error: "missing ref" };
  sheet_("Events").appendRow([new Date(), owner, type, String(ref).slice(0, 120), String(value || "").slice(0, 40), week || "", meta || ""]);
  return { ok: true };
}
function vote_(owner, poll, choice, week) {
  var p = rows_("Polls").filter(function (x) { return String(x.poll_id) === String(poll); })[0];
  if (!p || String(p.active) !== "Y") return { ok: false, error: "Poll is closed" };
  if (p["closes (ISO)"] && new Date() > new Date(p["closes (ISO)"])) return { ok: false, error: "Poll is closed" };
  return log_(owner, "vote", poll, choice, week, "");
}
function request_(owner, note) {
  var o = ownerRow_(owner);
  if (!o) return { ok: false, error: "Pick your name from the list" };
  var dayAgo = Date.now() - 864e5;
  var recent = rows_("Requests").filter(function (r) { return norm_(r.owner) === norm_(owner) && new Date(r.ts).getTime() > dayAgo; });
  if (recent.length >= 3) return { ok: false, error: "Already requested. The commish will text you." };
  sheet_("Requests").appendRow([new Date(), o.owner, String(note || "").slice(0, 300), "OPEN", "", ""]);
  var to = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, "MAFFL HQ: passphrase request from " + o.owner,
    o.owner + " (" + o.team + ") asked for their PIN.\n\nNote: " + (note || "—") +
    "\n\nTo finish: open the MAFFL HQ App Sheet → MAFFL menu → Set / reset a passphrase, text it to them, then MAFFL → Mark request done.\n" +
    SpreadsheetApp.getActive().getUrl());
  return { ok: true };
}

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
  sheet_("Offers").appendRow([id, now, from.owner, to.owner, from.tier, JSON.stringify(give), JSON.stringify(get), gc, tc, String(b.note || "").slice(0, 200), "PROPOSED", now, "", JSON.stringify((b.reasons || []).slice(0, 6).map(function (r) { return String(r).slice(0, 30); }))]);
  log_(me.owner, "offer", id, "PROPOSED", "", to.owner);
  return { ok: true, offer_id: id };
}
function offerRow_(id) { return rows_("Offers").filter(function (r) { return String(r.offer_id) === String(id); })[0]; }
function setOffer_(o, status, reason) {
  setCell_("Offers", o._row, "status", status); setCell_("Offers", o._row, "updated_ts", new Date());
  if (reason) setCell_("Offers", o._row, "reason", String(reason).slice(0, 200));
}
function respond_(me, id, decision) {
  var o = offerRow_(id); if (!o) return { ok: false, error: "Offer not found" };
  if (o.status !== "PROPOSED") return { ok: false, error: "That offer is already " + String(o.status).toLowerCase() };
  var isTo = norm_(o.to_owner) === norm_(me.owner), isFrom = norm_(o.from_owner) === norm_(me.owner);
  var next = { accept: isTo && "ACCEPTED", decline: isTo && "DECLINED", withdraw: isFrom && "WITHDRAWN" }[decision];
  if (!next) return { ok: false, error: "You can't do that to this offer" };
  if (next === "ACCEPTED" && new Date() > TRADE_DEADLINE) return { ok: false, error: "The trade deadline has passed" };
  setOffer_(o, next); log_(me.owner, "offer", id, next, "", "");
  return { ok: true, status: next };
}
function commish_(me, id, decision, reason) {
  if (!me.commish) return { ok: false, error: "Commish only" };
  var o = offerRow_(id); if (!o) return { ok: false, error: "Offer not found" };
  if (o.status !== "ACCEPTED") return { ok: false, error: "Only accepted trades can be approved or negated" };
  var next = decision === "approve" ? "APPROVED" : decision === "negate" ? "NEGATED" : null;
  if (!next) return { ok: false, error: "approve or negate" };
  setOffer_(o, next, reason); log_(me.owner, "commish", id, next, "", String(reason || ""));
  return { ok: true, status: next };
}
function trades_(owner) {
  var me = owner ? ownerRow_(owner) : null, commish = me && String(me.is_commish) === "Y";
  var offers = (sheet_("Offers") ? rows_("Offers") : []).filter(function (o) {
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
  sheet_("Perks").appendRow([id, now, me.owner, me.tier, b.perk, cost, qty, week || "", player, pos, swapWith, JSON.stringify(affects), String(b.note || "").slice(0, 200), "REQUESTED", now, ""]);
  log_(me.owner, "perk", id, "REQUESTED", week || "", b.perk);
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
  return { ok: true, status: next };
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

// ---------------------------------------------------------------- LIVE scoring (ESPN → compact JSON, 45 s cache)
// Needs Script Properties ESPN_S2 and SWID (Apps Script → Project Settings → Script properties). Same cookies
// the Tuesday robot uses. Read-only: nothing here writes anywhere.
var LEAGUES = { U: 34467, L: 1587593698 }, SEASON = 2026;
var POS = { 1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 7: "P", 9: "DT", 10: "DE", 11: "LB", 12: "CB", 13: "S", 14: "HC", 16: "D/ST" };
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
  if (r.getResponseCode() !== 200) throw new Error("ESPN said " + r.getResponseCode());
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
function live_(tier) {
  tier = tier === "L" ? "L" : "U";
  var cache = CacheService.getScriptCache(), hit = cache.get("live_" + tier);
  if (hit) return JSON.parse(hit);
  var lid = LEAGUES[tier], base = espn_(lid, "view=mSettings&view=mTeam");
  var mp = (base.status && base.status.currentMatchupPeriod) || base.scoringPeriodId, sp = base.scoringPeriodId || mp;
  var counts = ((base.settings || {}).rosterSettings || {}).lineupSlotCounts || {}, slots = [];
  Object.keys(counts).forEach(function (s) { var id = +s; if (id !== 20 && id !== 21) for (var c = 0; c < counts[s]; c++) slots.push(id); });
  var names = {}; (base.teams || []).forEach(function (t) { names[t.id] = t.name || ((t.location || "") + " " + (t.nickname || "")).trim(); });
  var box = espn_(lid, "view=mMatchupScore&view=mBoxscore&view=mScoreboard&scoringPeriodId=" + sp);
  function side(sd) {
    if (!sd) return null;
    var ents = ((sd.rosterForCurrentScoringPeriod || sd.rosterForMatchupPeriod || {}).entries) || [];
    var players = ents.map(function (e) {
      var pl = (e.playerPoolEntry || {}).player || {}, st = pl.stats || [];
      var act = st.filter(function (x) { return x.scoringPeriodId === sp && x.statSourceId === 0; })[0], prj = st.filter(function (x) { return x.scoringPeriodId === sp && x.statSourceId === 1; })[0];
      var pts = act ? act.appliedTotal : ((e.playerPoolEntry || {}).appliedStatTotal || 0);
      return { n: pl.fullName || "?", pos: POS[pl.defaultPositionId] || "", slot: SLOT[e.lineupSlotId] || String(e.lineupSlotId), sid: e.lineupSlotId,
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
  var games = (box.schedule || []).filter(function (g) { return g.matchupPeriodId === mp; }).map(function (g) { return { home: side(g.home), away: side(g.away) }; });
  var out = { ok: true, tier: tier, week: mp, at: new Date().toISOString(), games: games };
  var str = JSON.stringify(out); if (str.length < 95000) cache.put("live_" + tier, str, 45);
  return out;
}

// ---------------------------------------------------------------- reads
// Reaction counts per ref, which ones this owner has on, and poll tallies.
function summary_(week, owner) {
  var ev = rows_("Events").filter(function (e) { return !week || String(e.week) === String(week); });
  var state = {}; // owner|ref|emoji -> on/off (last write wins)
  var votes = {}; // poll|owner -> choice
  ev.forEach(function (e) {
    if (e.type === "react") state[norm_(e.owner) + "|" + e.ref + "|" + e.value] = e.meta === "on";
    if (e.type === "vote") votes[e.ref + "|" + norm_(e.owner)] = e.value;
  });
  var counts = {}, mine = {}, who = {}, display = {};
  owners_().forEach(function (o) { display[norm_(o.owner)] = o.owner; });
  Object.keys(state).forEach(function (k) {
    if (!state[k]) return;
    var p = k.split("|"), ref = p.slice(1, -1).join("|"), emo = p[p.length - 1];
    counts[ref] = counts[ref] || {}; counts[ref][emo] = (counts[ref][emo] || 0) + 1;
    if (ref.indexOf(":quiz:") < 0) { who[ref] = who[ref] || {}; (who[ref][emo] = who[ref][emo] || []).push(display[p[0]] || p[0]); } // quiz picks stay anonymous
    if (owner && p[0] === norm_(owner)) { mine[ref] = mine[ref] || {}; mine[ref][emo] = true; }
  });
  var tallies = {}, myVotes = {};
  Object.keys(votes).forEach(function (k) {
    var p = k.split("|"), poll = p[0]; tallies[poll] = tallies[poll] || {};
    tallies[poll][votes[k]] = (tallies[poll][votes[k]] || 0) + 1;
    if (owner && p[1] === norm_(owner)) myVotes[poll] = votes[k];
  });
  var polls = rows_("Polls").filter(function (p) { return String(p.active) === "Y" && (!week || String(p.week) === String(week)); })
    .map(function (p) { return { id: p.poll_id, week: p.week, q: p.question, options: p["options (separate with |)"], closes: p["closes (ISO)"] }; });
  var t = trades_(owner);
  var meRow = owner ? ownerRow_(owner) : null, pk = perks_(owner);
  return { ok: true, perks: pk.perks, insuranceLeft: pk.insuranceLeft, counts: counts, mine: mine, who: who, tallies: tallies, myVotes: myVotes, polls: polls, offers: t.offers, block: t.block, deadline: TRADE_DEADLINE.toISOString(),
    commish: !!(meRow && String(meRow.is_commish) === "Y") };
}

// ---------------------------------------------------------------- commish menu
function pickOwner_(title) {
  var ui = SpreadsheetApp.getUi(), r = ui.prompt(title, "Owner name exactly as in the Owners tab:", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return null;
  var o = ownerRow_(r.getResponseText());
  if (!o) { ui.alert("No owner named \"" + r.getResponseText() + "\"."); return null; }
  return o;
}
function menuSetPin() {
  var ui = SpreadsheetApp.getUi(), o = pickOwner_("Set / reset a passphrase");
  if (!o) return;
  if (o.pin_hash && ui.alert("Replace " + o.owner + "'s existing passphrase?", ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  var others = owners_().filter(function (x) { return x.pin_hash && x._row !== o._row; }), pin, tries = 0;
  do { pin = newPhrase_(); tries++; } while (tries < 50 && others.some(function (x) { return hash_(x.salt, pin) === x.pin_hash; }));
  var salt = Utilities.getUuid();
  setCell_("Owners", o._row, "salt", salt);
  setCell_("Owners", o._row, "pin_hash", hash_(salt, pin));
  setCell_("Owners", o._row, "failed_tries", 0);
  setCell_("Owners", o._row, "locked", "");
  sheet_("Events").appendRow([new Date(), "commish", "pin_set", o.owner, "", "", ""]);
  ui.alert("Passphrase for " + o.owner + ":\n\n" + pin + "\n\nText it to them now. It isn't stored anywhere, so this is the only time you'll see it.");
}
function menuRequestDone() {
  var sh = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (sh.getName() !== "Requests") { ui.alert("Go to the Requests tab and select the request's row first."); return; }
  var row = sh.getActiveRange().getRow(); if (row < 2) return;
  sh.getRange(row, 4, 1, 2).setValues([["DONE", new Date()]]);
}
function menuUnlock() {
  var o = pickOwner_("Unlock an owner"); if (!o) return;
  setCell_("Owners", o._row, "failed_tries", 0); setCell_("Owners", o._row, "locked", "");
  SpreadsheetApp.getUi().alert(o.owner + " is unlocked. Their passphrase didn't change.");
}

// ---------------------------------------------------------------- exports for the loader
M.VERSION = VERSION;
M.doGet = doGet;
M.doPost = doPost;
M.menuSetPin = menuSetPin;
M.menuRequestDone = menuRequestDone;
M.menuUnlock = menuUnlock;
