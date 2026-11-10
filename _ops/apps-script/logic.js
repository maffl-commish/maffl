/**
 * MAFFL HQ App — backend LOGIC. Loaded at runtime by the stable loader (Code.gs) from GitHub main.
 * Ship a backend change = edit this file + push to main. Live within ~5 minutes, no redeploy.
 * Design: _ops/docs/APP_DESIGN.md §7b · guardrails: _ops/docs/TRADE_CENTER_DESIGN.md §5b
 *
 * Contract with the loader: this file is run as the body of `function (M) { ... }` and must
 * export doGet, doPost and the menu handlers on M (see the bottom). Keep it under ~90 KB.
 * Rules: passphrases stored only as salted hashes; Events is append-only; never writes league gold.
 */
var VERSION = "0.48";
var REPO = "maffl-commish/maffl"; // GitHub repo the backend loads its parts (and daily.js) from
var TRADE_DEADLINE = new Date("2026-12-02T12:00:00-05:00");
var OFFER_HEAD = ["offer_id","ts","from_owner","to_owner","tier","give","get","give_credits","get_credits","note","status","updated_ts","reason","reasons","sync"];
var PERK_HEAD = ["perk_id","ts","owner","tier","perk","cost","qty","week","player","pos","swap_with","affects","note","status","updated_ts","reason","sync"];
// Credit perks (rules.html → Credit System → Spending Credits). Commish approves every one.
var PERKS = { faab: { name: "Extra FAAB $", cost: 1 }, double: { name: "Double Player Bonus", cost: 10 }, swap: { name: "Matchup Swap", cost: 10 },
  insurance: { name: "Relegation Insurance", cost: 25 }, divswap: { name: "Division Swap", cost: 10 } };
// More → Settings (APP_DESIGN §4b): owner email/phone + opt-in emails, all OFF by default. Contacts live only in the Owners tab.
var APP_URL = "https://maffl-commish.github.io/maffl/lab/";
var NOTIFY_KEYS = ["received", "countered", "accepted", "declined", "commish", "perks", "chat", "announce"];
var NOTIFY_DEFAULT_ON = { announce: true }; // commish announcements start on; everything else off until the owner turns it on
var INSURANCE_CLOSES = new Date("2026-10-01T20:15:00-04:00"), INSURANCE_MAX = 3, REG_WEEKS = 14;
// Double Bonus / Matchup Swap deadline: Thursday 6:00 PM ET of that week, or 1 hour before the week's first game if earlier
// (Wk 12 = Thanksgiving, first game 12:30 PM → 11:30 AM). Week 1 Thursday = Sep 10, 2026.
function perkDeadline_(week) {
  var d = new Date(Date.UTC(2026, 8, 10 + 7 * (week - 1))), dst = d < new Date(Date.UTC(2026, 10, 1));
  var ymd = d.toISOString().slice(0, 10), hm = week === 12 ? "11:30" : "18:00";
  return new Date(ymd + "T" + hm + ":00" + (dst ? "-04:00" : "-05:00"));
}
var MAX_FAILS_PER_HOUR = 60; // league-wide guess limit for passphrase-only sign-in (raised 11/7: phrases now ~6 million, phones use tokens)

// Passphrases are two football words and 3 digits, e.g. GRONK-PISTOL-427 (older ones: two words). Case, spaces and dashes don't matter when typing.
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
  return a + "-" + b + "-" + (100 + Math.floor(Math.random() * 900)); // + 3 digits: ~6 million phrases
}
function normPin_(pin) { return String(pin || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }

// ---------------------------------------------------------------- HTTP
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === "summary") { // public counts: cached a minute so anonymous calls can't keep the Sheet busy
      var pc = CacheService.getScriptCache(), pk = "pubsum:" + (p.week || ""), hit = pc.get(pk); if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
      var pub = JSON.stringify(summary_(p.week, null)); try { pc.put(pk, pub, 60); } catch (e) {} return ContentService.createTextOutput(pub).setMimeType(ContentService.MimeType.JSON); }
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
  // whole league behind it. A phone still holding a passphrase (not a token) gets its token back with the summary.
  if (LOCK_FREE[b.action]) {
    var fast = auth_(b.owner, b.pin);
    if (!fast.ok) return json(fast);
    try {
      if (b.action === "chat") return json(chat_(fast, b)); // marks the room read with a short lock of its own (markRead_)
      if (b.action !== "summary") return json({ ok: true, chat: inbox_(fast) });
      var sum = summary_(b.week, fast.owner); if (fast.viaPhrase) sum.token = token_(fast.viaPhrase);
      return json(sum);
    } catch (err) { return json({ ok: false, error: String(err) }); }
  }
  // "Run daily now" can take minutes of ESPN calls: run it outside the lock (it only writes its own tabs), like the tick does.
  if (b.action === "deskact" && b.op === "daily") return json(withAuth_(b, function (o) { return o.commish ? dailyOnce_("button") : { ok: false, error: "Commish only" }; }));
  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err) { return json({ ok: false, busy: true, error: "The league server is busy. Try again in a few seconds." }); }
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
      case "board":    return json(withAuth_(b, board_));
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
// Passphrase hashes. New ones (setPhrase_) are "h2:" + HMAC-SHA256 with a secret pepper kept in Script Properties, so the
// Sheet alone can't be used to test guesses. Older plain SHA-256 hashes still verify until the commish issues a new phrase.
function hex_(bytes) { return bytes.map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function pepper_(make) {
  var p = PropertiesService.getScriptProperties(), k = p.getProperty("PIN_PEPPER");
  if (!k && make) { k = Utilities.getUuid() + Utilities.getUuid(); p.setProperty("PIN_PEPPER", k); }
  return k || "";
}
function hmac_(text, key) { return hex_(Utilities.computeHmacSha256Signature(text, key)); }
function hashV1_(salt, pin) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ":" + normPin_(pin))); }
function hash_(salt, pin) { return "h2:" + hmac_(salt + ":" + normPin_(pin), pepper_(true)); }
function pinOk_(o, pin) {
  var h = String(o.pin_hash || ""); if (!h || !normPin_(pin)) return false;
  if (h.indexOf("h2:") !== 0) return hashV1_(o.salt, pin) === h;
  var k = pepper_(false); return !!k && "h2:" + hmac_(o.salt + ":" + normPin_(pin), k) === h;
}
// Device token: handed out at sign-in and kept on the phone instead of the passphrase. Tied to the owner's salt, so a
// new passphrase signs every old device out. Checking it writes nothing and is never rate-limited.
function token_(o) { return "t." + hmac_("tok:" + o.salt + ":" + norm_(o.owner), pepper_(true)).slice(0, 40); }
function tokenOk_(o, t) { var k = pepper_(false); return !!k && !!o.salt && String(t) === "t." + hmac_("tok:" + o.salt + ":" + norm_(o.owner), k).slice(0, 40); }
// Never let typed text become a Sheet formula: a string starting with = + - @ is stored with a leading ' (as text).
function safe_(s) { s = String(s == null ? "" : s); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function cells_(row) { return row.map(function (v) { return typeof v === "string" ? safe_(v) : v; }); }
function setCell_(name, row, header, value) {
  var sh = sheet_(name), head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.getRange(row, head.indexOf(header) + 1).setValue(typeof value === "string" ? safe_(value) : value);
}

// ---------------------------------------------------------------- auth
// Two ways in: a device token (normal: every call from a signed-in phone) or a passphrase (sign-in, older phones).
// Wrong tokens and wrong passphrases never lock an owner out for good (anyone could do that to anyone). Instead:
//  · passphrase-only sign-in: MAX_FAILS_PER_HOUR wrong guesses league-wide pauses passphrase checks for the hour
//    (signed-in phones keep working on their tokens) and alerts the commish;
//  · owner + passphrase: OWNER_FAILS wrong per owner per hour, then that owner's passphrase checks pause for the hour.
// The commish can still lock someone by hand (Owners "locked" = Y).
var OWNER_FAILS = 3, LOCK_FREE = { summary: 1, inbox: 1, chat: 1 };
function me_(o) { return { ok: true, owner: o.owner, team: o.team, tier: o.tier, commish: String(o.is_commish) === "Y" }; }
function signedOut_(msg) { return { ok: false, auth: false, error: msg || "You've been signed out (new passphrase?). Sign in again." }; }
function loginByPhrase_(pin) {
  var cache = CacheService.getScriptCache(), fails = Number(cache.get("fails") || 0);
  if (fails >= MAX_FAILS_PER_HOUR) return { ok: false, error: "Sign-in is paused for a bit after too many wrong tries. Try again in an hour, or text the commish." };
  if (normPin_(pin).length < 4) return { ok: false, error: "Type your passphrase" };
  var hit = owners_().filter(function (o) { return String(o.locked) !== "Y" && pinOk_(o, pin); })[0];
  if (!hit) {
    cache.put("fails", String(fails + 1), 3600);
    if (fails + 1 === MAX_FAILS_PER_HOUR) { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "MAFFL HQ: sign-in guesses paused",
      MAX_FAILS_PER_HOUR + " wrong passphrases in the last hour. New sign-ins are paused for an hour (signed-in phones keep working). If that wasn't owners fumbling, consider issuing new passphrases.");
      deskPost_("alert", MAX_FAILS_PER_HOUR + " wrong passphrases in the last hour, so new sign-ins are paused for an hour. Signed-in phones keep working. If that wasn't owners fumbling, issue new passphrases.", "", "GUESSES"); }
    return { ok: false, error: "That passphrase doesn't match anyone" };
  }
  return me_(hit);
}
// Write-free check (safe outside the script lock). Returns the signed-in owner, or { ok:false, … }.
function auth_(owner, pin) {
  if (!owner) return signedOut_("Sign in first.");
  var o = ownerRow_(owner);
  if (!o) return { ok: false, auth: false, error: "Unknown owner" };
  if (String(o.locked) === "Y") return signedOut_("Locked by the commish. Text him for a new passphrase.");
  if (/^t\./.test(String(pin || ""))) return tokenOk_(o, pin) ? me_(o) : signedOut_();
  var cache = CacheService.getScriptCache(), key = "of:" + norm_(o.owner), n = Number(cache.get(key) || 0);
  if (n >= OWNER_FAILS) return signedOut_("Too many wrong tries. Wait an hour, or text the commish.");
  if (!o.pin_hash) return signedOut_("No passphrase yet. Request one on the sign-in screen.");
  if (pinOk_(o, pin)) { var r = me_(o); r.viaPhrase = o; return r; }
  cache.put(key, String(n + 1), 3600);
  return signedOut_("That passphrase didn't work. Sign in again.");
}
function login_(owner, pin) {
  var r = owner ? auth_(owner, pin) : loginByPhrase_(pin);
  if (!r.ok) return r;
  var o = r.viaPhrase || ownerRow_(r.owner); delete r.viaPhrase;
  r.token = token_(o); // the phone keeps this instead of the passphrase
  return r;
}
function withAuth_(b, fn) {
  var r = auth_(b.owner, b.pin);
  if (!r.ok) return r;
  delete r.viaPhrase;
  return fn(r);
}

// ---------------------------------------------------------------- writes
function log_(owner, type, ref, value, week, meta) {
  if (!ref) return { ok: false, error: "missing ref" };
  sheet_("Events").appendRow(cells_([new Date(), String(owner || ""), String(type || ""), String(ref).slice(0, 120), String(value || "").slice(0, 40), week || "", String(meta || "")]));
  return { ok: true };
}
function vote_(owner, poll, choice, week) {
  var p = rows_("Polls").filter(function (x) { return String(x.poll_id) === String(poll); })[0];
  if (!p || String(p.active) !== "Y") return { ok: false, error: "Poll is closed" };
  if (p["closes (ISO)"] && new Date() > new Date(p["closes (ISO)"])) return { ok: false, error: "Poll is closed" };
  if (rows_("Events").some(function (e) { return e.type === "vote" && String(e.ref) === String(poll) && norm_(e.owner) === norm_(owner); }))
    return { ok: false, error: "Your vote is in. Votes can't be changed." }; // commish 11/7: one vote per owner per poll
  return log_(owner, "vote", poll, choice, week, "");
}
function request_(owner, note) {
  var o = ownerRow_(owner);
  if (!o) return { ok: false, error: "Pick your name from the list" };
  var dayAgo = Date.now() - 864e5, v = sheet_("Requests").getDataRange().getValues(), recent = 0; // by position: ts, owner (header names vary)
  for (var i = 1; i < v.length; i++) if (norm_(v[i][1]) === norm_(o.owner) && new Date(v[i][0]).getTime() > dayAgo) recent++;
  if (recent >= 3) return { ok: false, error: "Already requested. The commish will text you." };
  sheet_("Requests").appendRow(cells_([new Date(), o.owner, String(note || "").slice(0, 300), "OPEN", "", ""]));
  var cache = CacheService.getScriptCache(), sentHr = Number(cache.get("reqmail") || 0); // at most 10 request emails an hour (the desk still gets every one)
  if (sentHr < 10) try { cache.put("reqmail", String(sentHr + 1), 3600); var to = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, "MAFFL HQ: passphrase request from " + o.owner,
    o.owner + " (" + o.team + ") asked for their PIN.\n\nNote: " + (note || "—") +
    "\n\nTo finish: open the MAFFL HQ App Sheet → MAFFL menu → Set / reset a passphrase, text it to them, then MAFFL → Mark request done.\n" +
    SpreadsheetApp.getActive().getUrl()); } catch (e) {}
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
  var out = {}; NOTIFY_KEYS.forEach(function (k) { out[k] = (k in p) ? p[k] === true : !!NOTIFY_DEFAULT_ON[k]; }); return out;
}
function settings_(me) {
  var o = ownerRow_(me.owner); if (!o) return { ok: false, error: "Unknown owner" };
  return { ok: true, email: String(o.email || ""), phone: String(o.phone || ""), notify: prefs_(o), keys: NOTIFY_KEYS };
}
function saveSettings_(me, b) {
  var email = String(b.email || "").trim().slice(0, 120), digits = String(b.phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
  var list = email ? email.split(/[,;\s]+/).filter(String) : []; // co-owned teams: up to 2 addresses, comma-separated
  if (list.length > 2) return { ok: false, error: "Two emails at most" };
  if (list.some(function (e) { return !/^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(e); })) return { ok: false, error: "That email doesn't look right" };
  email = list.join(", ");
  if (digits && digits.length !== 10) return { ok: false, error: "Phone needs 10 digits" };
  var n = {}, any = false; NOTIFY_KEYS.forEach(function (k) { n[k] = !!(b.notify || {})[k]; any = any || (n[k] && !NOTIFY_DEFAULT_ON[k]); });
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
  return { ok: true, contacts: owner ? contacts_() : [], perks: pk.perks, insuranceLeft: pk.insuranceLeft, moves: pendingMoves_(), sync: { mode: syncMode_(), last: last }, counts: counts, mine: mine, who: who, tallies: tallies, myVotes: myVotes, polls: polls, offers: t.offers, block: t.block, deadline: TRADE_DEADLINE.toISOString(),
    commish: !!(meRow && String(meRow.is_commish) === "Y"), beta: isBeta_(meRow), tour: meRow && meRow.tour ? String(meRow.tour) : "", chat: meRow ? inbox_(meRow) : null };
}

// ---------------------------------------------------------------- extra modules (room past the 95 KB cache limit)
// need_("daily") fetches _ops/apps-script/daily.js from main (cached 5 min) and evaluates it in THIS scope, so it can use
// every helper here. Modules export by filling their object (DAILY). Pushing daily.js = deploying it, like logic.js.
var DAILY = {}, MODS_ = {};
function need_(name) {
  if (MODS_[name]) return; var c = CacheService.getScriptCache(), k = "mod_" + name, src = c.get(k);
  if (!src) { var r = UrlFetchApp.fetch("https://raw.githubusercontent.com/" + REPO + "/main/_ops/apps-script/" + name + ".js?t=" + Date.now(), { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) { src = r.getContentText(); if (src.length < 95000) { c.put(k, src, 300); c.put("mod_last_" + name, src, 21600); } }
    else { src = c.get("mod_last_" + name); if (!src) throw new Error("Couldn't load " + name + ".js (" + r.getResponseCode() + ")"); } } // GitHub hiccup: last good copy (6 h)
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
  setCell_("Owners", o._row, "failed_tries", 0); setCell_("Owners", o._row, "locked", ""); CacheService.getScriptCache().remove("of:" + norm_(o.owner));
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
