/**
 * MAFFL HQ App — backend LOGIC. Loaded at runtime by the stable loader (Code.gs) from GitHub main.
 * Ship a backend change = edit this file + push to main. Live within ~5 minutes, no redeploy.
 * Design: _ops/docs/APP_DESIGN.md §7b · guardrails: _ops/docs/TRADE_CENTER_DESIGN.md §5b
 *
 * Contract with the loader: this file is run as the body of `function (M) { ... }` and must
 * export doGet, doPost and the menu handlers on M (see the bottom). Keep it under ~90 KB.
 * Rules: passphrases stored only as salted hashes; Events is append-only; never writes league gold.
 */
var VERSION = "0.26";
var REPO = "maffl-commish/maffl"; // GitHub repo the backend loads its parts (and daily.js) from
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
    if (p.action === "live") { try { return json(live_(p.tier, p.week)); } catch (err) { return json({ ok: false, setup: /^SETUP/.test(String(err.message)), error: String(err.message).replace(/^SETUP: /, "") }); } } // public counts only; private data needs POST + passphrase
    if (p.action === "rosters") { try { return json(rosters_(p.tier)); } catch (err) { return json({ ok: false, setup: /^SETUP/.test(String(err.message)), error: String(err.message).replace(/^SETUP: /, "") }); } } // what ESPN shows on each roster (public to the league anyway)
    if (p.action === "daily") { need_("daily"); return json(DAILY.view()); } // scores, standings, Coach, Survivor, moves, card lines (league-public)
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
      case "feedback": return json(withAuth_(b, function (o) { return feedback_(o, b); }));
      case "taplog":   return json(withAuth_(b, function (o) { return tapLog_(o, b); }));
      case "botpost":  return json(botPost_(b));
      case "putlines": return json(putLines_(b));
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
  if (!sh && name === "Feedback") { sh = ss.insertSheet("Feedback"); sh.appendRow(FB_HEAD); sh.setFrozenRows(1); }
  if (!sh && name === "TapLog") { sh = ss.insertSheet("TapLog"); sh.appendRow(TAP_HEAD); sh.setFrozenRows(1); }
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
    .map(function (p) { return { id: p.poll_id, week: p.week, q: p.question, options: p["options (separate with |)"], closes: p["closes (ISO)"], tier: p.tier || "" }; });
  var t = trades_(owner);
  var meRow = owner ? ownerRow_(owner) : null, pk = perks_(owner);
  var last = {}; try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty("LAST_SYNC") || "{}"); } catch (e) {}
  return { ok: true, contacts: owner ? contacts_() : [], perks: pk.perks, insuranceLeft: pk.insuranceLeft, sync: { mode: syncMode_(), last: last }, counts: counts, mine: mine, who: who, tallies: tallies, myVotes: myVotes, polls: polls, offers: t.offers, block: t.block, deadline: TRADE_DEADLINE.toISOString(),
    commish: !!(meRow && String(meRow.is_commish) === "Y"), beta: isBeta_(meRow), tour: meRow && meRow.tour ? String(meRow.tour) : "", chat: meRow ? inbox_(meRow) : null };
}

// ---------------------------------------------------------------- extra modules (room past the 95 KB cache limit)
// need_("daily") fetches _ops/apps-script/daily.js from main (cached 5 min) and evaluates it in THIS scope, so it can use
// every helper here. Modules export by filling their object (DAILY). Pushing daily.js = deploying it, like logic.js.
var DAILY = {}, MODS_ = {};
function need_(name) {
  if (MODS_[name]) return; var c = CacheService.getScriptCache(), k = "mod_" + name, src = c.get(k);
  if (!src) { var r = UrlFetchApp.fetch("https://raw.githubusercontent.com/" + REPO + "/main/_ops/apps-script/" + name + ".js?t=" + Date.now(), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error("Couldn't load " + name + ".js (" + r.getResponseCode() + ")");
    src = r.getContentText(); if (src.length < 95000) c.put(k, src, 300); }
  eval(src); MODS_[name] = 1;
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

// ---------------------------------------------------------------- parts: the rest of the backend, in this same scope
// logic.js is the CORE (routing, data helpers, sign-in, settings, the summary read, the commish menu). The other parts live
// next to it as mod_*.js and are evaluated HERE, inside this same function scope, so every function stays callable by plain
// name across files (no namespaces, no rewrites). Why: Apps Script caches one file only while it's under 95 KB, and
// logic.js had grown to 91 KB. Each part is cached 5 min under this VERSION (bump VERSION when you change any part, so the
// change and the core load together) and a last good copy is kept 6 h, so a GitHub hiccup doesn't take sign-in down.
// daily.js stays lazy (need_("daily")). Keep every file under ~90 KB.
var PARTS = ["mod_trades", "mod_espn", "mod_social", "mod_desk"];
function parts_() {
  var c = CacheService.getScriptCache(), out = [];
  PARTS.forEach(function (p) {
    var k = "part_" + p + "@" + VERSION, src = c.get(k);
    if (!src) {
      var r = null; try { r = UrlFetchApp.fetch("https://raw.githubusercontent.com/" + REPO + "/main/_ops/apps-script/" + p + ".js?t=" + Date.now(), { muteHttpExceptions: true }); } catch (e) {}
      if (r && r.getResponseCode() === 200) { src = r.getContentText(); if (src.length < 95000) { c.put(k, src, 300); c.put("part_last_" + p, src, 21600); } }
      else { src = c.get("part_last_" + p); if (!src) throw new Error("Couldn't load " + p + ".js (" + (r ? r.getResponseCode() : "network") + ")"); }
    }
    out.push(src);
  });
  return out.join("\n;\n");
}
eval(parts_()); // direct eval at the top level of this scope: the parts' functions and vars join it

// ---------------------------------------------------------------- exports for the loader
M.VERSION = VERSION;
M.doGet = doGet;
M.doPost = doPost;
M.menuSetPin = menuSetPin;
M.menuRequestDone = menuRequestDone;
M.menuUnlock = menuUnlock;
M.tick = tick;
