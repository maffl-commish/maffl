/**
 * MAFFL HQ App — backend LOGIC. Loaded at runtime by the stable loader (Code.gs) from GitHub main.
 * Ship a backend change = edit this file + push to main. Live within ~5 minutes, no redeploy.
 * Design: _ops/docs/APP_DESIGN.md §7b · guardrails: _ops/docs/TRADE_CENTER_DESIGN.md §5b
 *
 * Contract with the loader: this file is run as the body of `function (M) { ... }` and must
 * export doGet, doPost and the menu handlers on M (see the bottom). Keep it under ~90 KB.
 * Rules: passphrases stored only as salted hashes; Events is append-only; never writes league gold.
 */
var VERSION = "0.15";
var TRADE_DEADLINE = new Date("2026-12-02T12:00:00-05:00");
var OFFER_HEAD = ["offer_id","ts","from_owner","to_owner","tier","give","get","give_credits","get_credits","note","status","updated_ts","reason","reasons","sync"];
var PERK_HEAD = ["perk_id","ts","owner","tier","perk","cost","qty","week","player","pos","swap_with","affects","note","status","updated_ts","reason","sync"];
// Credit perks (rules.html → Credit System → Spending Credits). Commish approves every one.
var PERKS = { faab: { name: "Extra FAAB $", cost: 1 }, double: { name: "Double Player Bonus", cost: 10 }, swap: { name: "Matchup Swap", cost: 10 },
  insurance: { name: "Relegation Insurance", cost: 25 }, divswap: { name: "Division Swap", cost: 10 } };
// More → Settings (APP_DESIGN §4b): owner email/phone + opt-in emails, all OFF by default. Contacts live only in the Owners tab.
var APP_URL = "https://maffl-commish.github.io/maffl/lab/";
var NOTIFY_KEYS = ["received", "countered", "accepted", "declined", "commish", "perks"];
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
    if (p.action === "ledger") return json({ ok: true, mode: syncMode_(), rows: ledger_(p.mode === "live" ? "live" : p.mode === "test" ? "test" : syncMode_()) }); // credit moves are public anyway
    if (p.action === "owners") return json({ ok: true, owners: owners_().map(function (o) { return { owner: o.owner, team: o.team, tier: o.tier, hasPin: !!o.pin_hash }; }) });
    return json({ ok: true, version: VERSION, logic: "repo" });
  } catch (err) { return json({ ok: false, error: String(err) }); }
}

// Body is sent as text/plain JSON (avoids a CORS preflight from GitHub Pages).
function doPost(e) {
  var b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { return json({ ok: false, error: "bad json" }); }
  // Reads that change nothing (summary, inbox) skip the script lock, so one owner's slow call never queues the
  // whole league behind it. Only when the passphrase checks out cleanly (no failed-try counter to write).
  var fast = LOCK_FREE[b.action] && cleanAuth_(b);
  if (fast) {
    try { return json(b.action === "summary" ? summary_(b.week, fast.owner) : { ok: true, chat: inbox_(fast) }); }
    catch (err) { return json({ ok: false, error: String(err) }); }
  }
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
      case "respond": return json(withAuth_(b, function (o) { return respond_(o, b.offer_id, b.decision, !!b.counter); }));
      case "commish": return json(withAuth_(b, function (o) { return commish_(o, b.offer_id, b.decision, b.reason); }));
      case "perk":    return json(withAuth_(b, function (o) { return perk_(o, b); }));
      case "perkact": return json(withAuth_(b, function (o) { return perkAct_(o, b.perk_id, b.decision, b.reason); }));
      case "settings": return json(withAuth_(b, function (o) { return settings_(o); }));
      case "savesettings": return json(withAuth_(b, function (o) { return saveSettings_(o, b); }));
      case "resync":  return json(withAuth_(b, function (o) { return o.commish ? pushLedger_() : { ok: false, error: "Commish only" }; }));
      case "chat":     return json(withAuth_(b, function (o) { return chat_(o, b); }));
      case "chatsend": return json(withAuth_(b, function (o) { return chatSend_(o, b); }));
      case "chatmod":  return json(withAuth_(b, function (o) { return chatMod_(o, b); }));
      case "inbox":    return json(withAuth_(b, function (o) { return { ok: true, chat: inbox_(o) }; }));
      case "desk":     return json(withAuth_(b, function (o) { return o.commish ? desk_(o) : { ok: false, error: "Commish only" }; }));
      case "deskact":  return json(withAuth_(b, function (o) { return o.commish ? deskAct_(o, b) : { ok: false, error: "Commish only" }; }));
      case "botpost":  return json(botPost_(b));
      default:        return json({ ok: false, error: "unknown action" });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---------------------------------------------------------------- data helpers
// Each web request evaluates this file fresh, so MEMO_ lives for one request: a tab is read from the Sheet once
// per call (summary used to read Owners five times). Asking for a tab with sheet_() (every write does) drops its memo.
var MEMO_ = {};
function sheet_(name) { delete MEMO_[name]; return sheetGet_(name); }
function sheetGet_(name) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name);
  if (!sh && name === "Offers") { sh = ss.insertSheet("Offers"); sh.appendRow(OFFER_HEAD); sh.setFrozenRows(1); }
  if (!sh && name === "Perks") { sh = ss.insertSheet("Perks"); sh.appendRow(PERK_HEAD); sh.setFrozenRows(1); }
  if (sh && name === "Offers" && sh.getLastColumn() < OFFER_HEAD.length) sh.getRange(1, 1, 1, OFFER_HEAD.length).setValues([OFFER_HEAD]); // add new columns
  if (sh && name === "Perks" && sh.getLastColumn() < PERK_HEAD.length) sh.getRange(1, 1, 1, PERK_HEAD.length).setValues([PERK_HEAD]);
  if (!sh && name === "Chat") { sh = ss.insertSheet("Chat"); sh.appendRow(CHAT_HEAD); sh.setFrozenRows(1); }
  if (!sh && name === "Reads") { sh = ss.insertSheet("Reads"); sh.appendRow(READS_HEAD); sh.setFrozenRows(1); }
  return sh;
}
function rows_(name) {
  if (!MEMO_[name]) {
    var v = sheetGet_(name).getDataRange().getValues(), head = v.shift();
    MEMO_[name] = v.map(function (r, i) {
      var o = { _row: i + 2, _blank: r.join("") === "" }; head.forEach(function (h, k) { o[h] = r[k]; }); return o;
    }).filter(function (o) { return !o._blank; });
  }
  return MEMO_[name].map(function (o) { return Object.assign({}, o); }); // copies: callers may change their rows
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
    if (fails + 1 === MAX_FAILS_PER_HOUR) { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "MAFFL HQ: sign-in guesses paused",
      MAX_FAILS_PER_HOUR + " wrong passphrases in the last hour. Sign-in is paused for an hour. If that wasn't owners fumbling, consider resetting passphrases.");
      deskPost_("alert", MAX_FAILS_PER_HOUR + " wrong passphrases in the last hour, so sign-in is paused for an hour. If that wasn't owners fumbling, reset passphrases.", "", "GUESSES"); }
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
    if (n >= MAX_TRIES) { setCell_("Owners", o._row, "locked", "Y"); deskPost_("lock", "", o.owner, "LOCKED"); }
    return { ok: false, error: n >= MAX_TRIES ? "Locked. Ask the commish for a new passphrase." : "Wrong passphrase (" + (MAX_TRIES - n) + " tries left)" };
  }
  if (Number(o.failed_tries)) setCell_("Owners", o._row, "failed_tries", 0);
  return { ok: true, owner: o.owner, team: o.team, tier: o.tier, commish: String(o.is_commish) === "Y" };
}
var LOCK_FREE = { summary: 1, inbox: 1 };
// Passphrase check that writes nothing: right owner, right passphrase, not locked, no failed tries to reset.
// Anything else falls through to the normal locked path (login_), which keeps the counters honest.
function cleanAuth_(b) {
  if (!b.owner || !b.pin) return null;
  var o = ownerRow_(b.owner);
  if (!o || !o.pin_hash || String(o.locked) === "Y" || Number(o.failed_tries) || hash_(o.salt, b.pin) !== o.pin_hash) return null;
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
  deskPost_("access", String(note || "").slice(0, 300), o.owner, "REQUEST");
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
  // A counter declines the offer it answers (one step, so the thread shows one "countered" card, not two).
  var co = b.counterOf ? offerRow_(b.counterOf) : null, isCounter = !!(co && co.status === "PROPOSED" && norm_(co.to_owner) === norm_(me.owner) && norm_(co.from_owner) === norm_(to.owner));
  sheet_("Offers").appendRow([id, now, from.owner, to.owner, from.tier, JSON.stringify(give), JSON.stringify(get), gc, tc, safe_(String(b.note || "").slice(0, 200)), "PROPOSED", now, "", JSON.stringify((b.reasons || []).slice(0, 6).map(function (r) { return String(r).slice(0, 30); }))]);
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
  sheet_("Perks").appendRow([id, now, me.owner, me.tier, b.perk, cost, qty, week || "", player, pos, swapWith, JSON.stringify(affects), String(b.note || "").slice(0, 200), "REQUESTED", now, ""]);
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
var REPO = "maffl-commish/maffl";
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

// ---------------------------------------------------------------- settings + contacts (§4b)
function ensureCol_(name, header) {
  var sh = sheet_(name), last = sh.getLastColumn(), head = sh.getRange(1, 1, 1, last).getValues()[0];
  if (head.indexOf(header) < 0) sh.getRange(1, last + 1).setValue(header);
}
function prefs_(o) {
  var p = {}; try { p = JSON.parse((o && o.notify) || "{}"); } catch (e) {}
  var out = {}; NOTIFY_KEYS.forEach(function (k) { out[k] = p[k] === true; }); return out;
}
function settings_(me) {
  var o = ownerRow_(me.owner); if (!o) return { ok: false, error: "Unknown owner" };
  return { ok: true, email: String(o.email || ""), phone: String(o.phone || ""), notify: prefs_(o), keys: NOTIFY_KEYS };
}
function saveSettings_(me, b) {
  var email = String(b.email || "").trim().slice(0, 120), digits = String(b.phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "That email doesn't look right" };
  if (digits && digits.length !== 10) return { ok: false, error: "Phone needs 10 digits" };
  var n = {}, any = false; NOTIFY_KEYS.forEach(function (k) { n[k] = !!(b.notify || {})[k]; any = any || n[k]; });
  if (any && !email) return { ok: false, error: "Add your email to turn on emails" };
  ["email", "phone", "notify"].forEach(function (h) { ensureCol_("Owners", h); });
  var o = ownerRow_(me.owner);
  setCell_("Owners", o._row, "email", email);
  setCell_("Owners", o._row, "phone", digits ? "'" + digits : ""); // keep it text in the Sheet
  setCell_("Owners", o._row, "notify", JSON.stringify(n));
  log_(me.owner, "settings", "settings", "saved", "", NOTIFY_KEYS.filter(function (k) { return n[k]; }).join(",")); // no contact data in Events
  return settings_(me);
}
// Signed-in owners only (summary POST): every owner's email + phone. Never on the public GET.
function contacts_() {
  return owners_().filter(function (o) { return o.email || o.phone; }).map(function (o) {
    return { owner: o.owner, email: String(o.email || "").trim(), phone: String(o.phone || "").replace(/\D/g, "") }; });
}

// ---------------------------------------------------------------- LIVE scoring (ESPN → compact JSON, 45 s cache)
// Needs Script Properties ESPN_S2 and SWID (Apps Script → Project Settings → Script properties). Same cookies
// the Tuesday robot uses. Read-only: nothing here writes anywhere.
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
function live_(tier) {
  tier = tier === "L" ? "L" : "U";
  var cache = CacheService.getScriptCache(), hit = cache.get("live_" + tier);
  if (hit) return JSON.parse(hit);
  var lid = LEAGUES[tier], base = espn_(lid, "view=mSettings&view=mTeam");
  var mp = (base.status && base.status.currentMatchupPeriod) || base.scoringPeriodId, sp = base.scoringPeriodId || mp;
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
  var games = (box.schedule || []).filter(function (g) { return g.matchupPeriodId === mp; }).map(function (g) { return { home: side(g.home), away: side(g.away) }; });
  var out = { ok: true, tier: tier, week: mp, at: new Date().toISOString(), games: games };
  var str = JSON.stringify(out); if (str.length < 95000) cache.put("live_" + tier, str, 45);
  return out;
}

// ---------------------------------------------------------------- chat (test Sheet only)
// Rooms: "league" (everyone signed in) · "tier:U" / "tier:L" (that tier's group; the commish sees both to moderate)
// · "dm:<a>|<b>" (two owners, normalized names sorted; only those two). Trade offers post themselves into the two
// owners' DM as cards (kind "offer", ref = offer id, event = PROPOSED/COUNTER/ACCEPTED/…); accepted trades also go
// to the tier group, approved trades to the league room. Chat rows can be soft-deleted or pinned; Reads keeps each
// owner's last-read time per room (unread dots). Reactions on messages ride the normal "react" action (ref chat:<id>).
var CHAT_HEAD = ["msg_id","ts","room","owner","kind","text","ref","event","mentions","reply_to","deleted","pinned"];
var READS_HEAD = ["owner","room","ts"], BOT = "MAFFL HQ", CHAT_KEEP = 150, CHAT_MAX = 500;
function safe_(s) { s = String(s == null ? "" : s); return /^[=+\-@]/.test(s) ? "'" + s : s; } // never let text become a Sheet formula
function roomDM_(a, b) { return "dm:" + [norm_(a), norm_(b)].sort().join("|"); }
function meOf_(o) { return { owner: o.owner, tier: String(o.tier), commish: String(o.is_commish) === "Y" || o.commish === true }; }
function canRoom_(me, room) {
  room = String(room || "");
  if (room === "league") return true;
  if (room === "desk") return !!me.commish; // 🛡️ Commish desk: the robots' to-do feed, commish only
  if (room === "tier:U" || room === "tier:L") return String(me.tier) === room.slice(5) || !!me.commish;
  if (room.indexOf("dm:") === 0) return room.slice(3).split("|").indexOf(norm_(me.owner)) >= 0;
  return false;
}
function post_(room, owner, kind, text, ref, event, mentions, replyTo) {
  var id = "M" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase(), now = new Date();
  sheet_("Chat").appendRow([id, now, room, owner, kind, safe_(String(text || "").slice(0, CHAT_MAX)), ref || "", event || "", JSON.stringify(mentions || []), replyTo || "", "", ""]);
  return { id: id, ts: now };
}
function markRead_(owner, room, ts) {
  var hit = rows_("Reads").filter(function (r) { return norm_(r.owner) === norm_(owner) && r.room === room; })[0];
  if (hit) { if (new Date(hit.ts) < ts) setCell_("Reads", hit._row, "ts", ts); }
  else sheet_("Reads").appendRow([owner, room, ts]);
}
function offerSnap_(o) {
  if (!o) return null;
  var js = function (s) { try { return JSON.parse(s || "[]"); } catch (e) { return []; } };
  return { id: o.offer_id, ts: o.ts, from: o.from_owner, to: o.to_owner, tier: o.tier, give: js(o.give), get: js(o.get), giveCredits: Number(o.give_credits) || 0,
    getCredits: Number(o.get_credits) || 0, note: o.note, status: o.status, updated: o.updated_ts, reason: o.reason, reasons: js(o.reasons) };
}
function msgOut_(r, offers) {
  var del = String(r.deleted) === "Y", m = [];
  try { m = JSON.parse(r.mentions || "[]"); } catch (e) {}
  var out = { id: r.msg_id, ts: r.ts, room: r.room, owner: r.owner, kind: r.kind, text: del ? "" : String(r.text), event: r.event, ref: r.ref,
    mentions: m, reply_to: r.reply_to, deleted: del, pinned: String(r.pinned) === "Y" };
  if (r.kind === "offer" && offers) out.offer = offerSnap_(offers[r.ref]);
  return out;
}
// One room's last messages (+ reactions, pinned) and mark it read.
function chat_(meRaw, b) {
  var me = meOf_(meRaw), room = b.to ? roomDM_(me.owner, (ownerRow_(b.to) || {}).owner || b.to) : String(b.room || "");
  if (!canRoom_(me, room)) return { ok: false, error: "That chat isn't yours to read" };
  var all = rows_("Chat").filter(function (r) { return r.room === room; }), list = all.slice(-CHAT_KEEP), offers = {};
  rows_("Offers").forEach(function (o) { offers[o.offer_id] = o; });
  var refs = {}; list.forEach(function (r) { refs["chat:" + r.msg_id] = 1; });
  var state = {}; rows_("Events").forEach(function (e) { if (e.type === "react" && refs[e.ref]) state[norm_(e.owner) + "|" + e.ref + "|" + e.value] = { on: e.meta === "on", owner: e.owner }; });
  var counts = {}, mine = {}, who = {};
  Object.keys(state).forEach(function (k) {
    var s = state[k]; if (!s.on) return; var p = k.split("|"), emo = p[p.length - 1], ref = p.slice(1, -1).join("|");
    counts[ref] = counts[ref] || {}; counts[ref][emo] = (counts[ref][emo] || 0) + 1;
    who[ref] = who[ref] || {}; (who[ref][emo] = who[ref][emo] || []).push(s.owner);
    if (p[0] === norm_(me.owner)) { mine[ref] = mine[ref] || {}; mine[ref][emo] = true; }
  });
  if (b.mark !== false && list.length) markRead_(me.owner, room, new Date(list[list.length - 1].ts));
  var pinned = all.filter(function (r) { return String(r.pinned) === "Y" && String(r.deleted) !== "Y"; }).slice(-3).map(function (r) { return msgOut_(r, offers); });
  var msgs = list.map(function (r) { return msgOut_(r, offers); });
  if (room === "desk") { var pk = {}; rows_("Perks").forEach(function (r) { pk[r.perk_id] = r; });
    msgs.forEach(function (m) { var r = m.kind === "perk" && pk[m.ref]; if (r) m.perk = { id: r.perk_id, ts: r.ts, owner: r.owner, tier: r.tier, perk: r.perk, cost: Number(r.cost) || 0, qty: Number(r.qty) || 1,
      week: Number(r.week) || null, player: r.player, pos: r.pos, swapWith: r.swap_with, note: r.note, status: r.status, reason: r.reason }; }); }
  return { ok: true, room: room, messages: msgs, pinned: pinned, counts: counts, mine: mine, who: who, more: all.length > list.length };
}
function chatSend_(meRaw, b) {
  var me = meOf_(meRaw), room = String(b.room || "");
  if (b.to) { var t = ownerRow_(b.to); if (!t || norm_(t.owner) === norm_(me.owner)) return { ok: false, error: "Pick someone to message" }; room = roomDM_(me.owner, t.owner); }
  if (!canRoom_(me, room)) return { ok: false, error: "You can't post there" };
  var text = String(b.text || "").replace(/\s+$/, "").replace(/^\s+/, "");
  if (!text) return { ok: false, error: "Type a message" };
  if (text.length > CHAT_MAX) return { ok: false, error: "Keep it under " + CHAT_MAX + " characters" };
  var cache = CacheService.getScriptCache(), rk = "chat_" + norm_(me.owner).replace(/[^a-z0-9]/g, "");
  if (cache.get(rk)) return { ok: false, error: "Easy, one second between messages" };
  cache.put(rk, "1", 2);
  var mentions = (b.mentions || []).slice(0, 8).map(function (n) { return ownerRow_(n); }).filter(function (o) { return o && canRoom_(meOf_(o), room) && norm_(o.owner) !== norm_(me.owner); })
    .map(function (o) { return o.owner; });
  var m = post_(room, me.owner, "text", text, "", "", mentions, String(b.reply_to || "").slice(0, 20));
  markRead_(me.owner, room, m.ts);
  return { ok: true, id: m.id, room: room };
}
// Delete: your own message, or any (commish). Pin / unpin: commish only.
function chatMod_(meRaw, b) {
  var me = meOf_(meRaw), r = rows_("Chat").filter(function (x) { return x.msg_id === b.msg_id; })[0];
  if (!r || !canRoom_(me, r.room)) return { ok: false, error: "Message not found" };
  if (b.op === "delete") {
    if (norm_(r.owner) !== norm_(me.owner) && !me.commish) return { ok: false, error: "You can only delete your own messages" };
    if (r.kind === "offer") return { ok: false, error: "Trade cards stay in the thread" };
    setCell_("Chat", r._row, "deleted", "Y"); log_(me.owner, "chatmod", r.msg_id, "delete", "", r.room); return { ok: true };
  }
  if (b.op === "pin" || b.op === "unpin") {
    if (!me.commish) return { ok: false, error: "Commish only" };
    setCell_("Chat", r._row, "pinned", b.op === "pin" ? "Y" : ""); log_(me.owner, "chatmod", r.msg_id, b.op, "", r.room); return { ok: true };
  }
  return { ok: false, error: "delete, pin or unpin" };
}
// Your chats: league room, your tier's group (commish: both), and every DM you're in, with unread counts and @mentions.
function inbox_(meRaw) {
  var me = meOf_(meRaw), reads = {}, names = {}, rooms = {}, mentions = [];
  rows_("Reads").forEach(function (r) { if (norm_(r.owner) === norm_(me.owner)) reads[r.room] = new Date(r.ts).getTime(); });
  owners_().forEach(function (o) { names[norm_(o.owner)] = o.owner; });
  (me.commish ? ["desk"] : []).concat(["league", "tier:" + me.tier], me.commish ? ["tier:" + (me.tier === "U" ? "L" : "U")] : []).forEach(function (k) { rooms[k] = { room: k, unread: 0, at: 0, mentions: 0 }; });
  rows_("Chat").forEach(function (r) {
    if (!canRoom_(me, r.room)) return;
    var x = rooms[r.room] = rooms[r.room] || { room: r.room, unread: 0, at: 0, mentions: 0 }, t = new Date(r.ts).getTime(), mineMsg = norm_(r.owner) === norm_(me.owner);
    if (String(r.deleted) !== "Y") x.last = { owner: r.owner, kind: r.kind, event: r.event, text: String(r.text).slice(0, 90), ts: r.ts };
    x.at = t;
    var isNew = !mineMsg && t > (reads[r.room] || 0) && String(r.deleted) !== "Y";
    if (isNew) x.unread++;
    var m = []; try { m = JSON.parse(r.mentions || "[]"); } catch (e) {}
    if (m.some(function (n) { return norm_(n) === norm_(me.owner); }) && String(r.deleted) !== "Y") {
      if (isNew) x.mentions++;
      mentions.push({ id: r.msg_id, room: r.room, owner: r.owner, text: String(r.text).slice(0, 140), ts: r.ts, unread: isNew });
    }
  });
  var list = Object.keys(rooms).map(function (k) {
    var x = rooms[k]; if (k.indexOf("dm:") === 0) { var other = k.slice(3).split("|").filter(function (n) { return n !== norm_(me.owner); })[0]; x.with = names[other] || other; }
    return x;
  }).sort(function (a, b) { var fixed = function (x) { return x.room === "desk" ? -1 : x.room === "league" ? 0 : x.room.indexOf("tier:") === 0 ? 1 : 2; }; return fixed(a) - fixed(b) || b.at - a.at; });
  var unread = list.reduce(function (n, x) { return n + x.unread; }, 0);
  return { rooms: list, unread: unread, mentions: mentions.slice(-30).reverse(), mentionsUnread: mentions.filter(function (m) { return m.unread; }).length };
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
  var last = {}; try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_SYNC") || "{}"); } catch (e) {}
  return { ok: true, contacts: owner ? contacts_() : [], perks: pk.perks, insuranceLeft: pk.insuranceLeft, sync: { mode: syncMode_(), last: last }, counts: counts, mine: mine, who: who, tallies: tallies, myVotes: myVotes, polls: polls, offers: t.offers, block: t.block, deadline: TRADE_DEADLINE.toISOString(),
    commish: !!(meRow && String(meRow.is_commish) === "Y"), chat: meRow ? inbox_(meRow) : null };
}

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
    espn: espn, sync: { mode: syncMode_(), last: last } };
}
function deskAct_(me, b) {
  if (b.op === "espn") { if (!b.perk_id) return { ok: false, error: "Which perk?" }; log_(me.owner, "espn_done", b.perk_id, "Y", "", "Y"); return { ok: true }; }
  var o = ownerRow_(b.target); if (!o) return { ok: false, error: "Unknown owner" };
  if (b.op === "issue") {
    var pin = setPhrase_(o); closeRequests_(o.owner);
    deskPost_("note", "New passphrase issued to " + o.owner + ".", o.owner, "ISSUED");
    var c = contacts_().filter(function (x) { return norm_(x.owner) === norm_(o.owner); })[0] || {};
    return { ok: true, owner: o.owner, team: o.team, pin: pin, phone: c.phone || "", email: c.email || "" }; // shown once, to the commish only
  }
  if (b.op === "unlock") { setCell_("Owners", o._row, "failed_tries", 0); setCell_("Owners", o._row, "locked", ""); deskPost_("note", o.owner + " unlocked (same passphrase).", o.owner, "UNLOCKED"); return { ok: true }; }
  if (b.op === "dismiss") { closeRequests_(o.owner); return { ok: true }; }
  return { ok: false, error: "issue, unlock, dismiss or espn" };
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
  var pin = setPhrase_(o);
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
