/**
 * MAFFL HQ App backend PART: the beta feedback kit (feedback, tap log) and chat (rooms, DMs, posts, reads, moderation).
 * Not standalone: logic.js (the core) evaluates this file inside its own scope (see parts_ in logic.js), so it uses the
 * core's helpers by plain name and its functions are callable from every other part. Bump VERSION in logic.js when you
 * change this file. Keep it under ~90 KB.
 */
// ---------------------------------------------------------------- 🧪 beta feedback kit (REEL.md roadmap 3b)
// Owners with beta = "Y" (the commish always) get the Feedback button, quick prompts and the tap log. Feedback lands in
// the Feedback tab and on the desk; taps land in TapLog (batched from the phone, never posted anywhere).
var FB_HEAD = ["fb_id","ts","owner","tier","kind","mood","where","note","ctx"];
var TAP_HEAD = ["ts","owner","session","type","what","where"];
var MOOD = { up: "👍", meh: "🤔", down: "👎" };
function isBeta_(o) { return !!o && (String(o.beta || "").toUpperCase() === "Y" || String(o.is_commish) === "Y"); }
function feedback_(me, b) {
  var o = ownerRow_(me.owner); if (!isBeta_(o)) return { ok: false, error: "Beta testers only" };
  var mood = MOOD[b.mood] ? b.mood : "", note = String(b.note || "").trim().slice(0, 600), where = String(b.where || "").slice(0, 120);
  if (!mood && !note) return { ok: false, error: "Pick a thumb or write a note" };
  var id = "F" + Date.now().toString(36), ctx = String(b.ctx || "").slice(0, 1500);
  sheet_("Feedback").appendRow([id, new Date(), me.owner, o.tier, String(b.kind || "button").slice(0, 20), mood, safe_(where), safe_(note), safe_(ctx)]);
  deskPost_("feedback", ((MOOD[mood] || "💬") + " " + (o.team || me.owner) + " · " + where + (note ? "\n" + note : "")).slice(0, CHAT_MAX), id, mood || "NOTE");
  return { ok: true, id: id };
}
function tapLog_(me, b) {
  var o = ownerRow_(me.owner); if (!isBeta_(o)) return { ok: true, skipped: true };
  var ev = (Array.isArray(b.events) ? b.events : []).slice(0, 300), sid = String(b.session || "").slice(0, 16);
  if (!ev.length) return { ok: true, n: 0 };
  var rows = ev.map(function (e) { return [new Date(Number(e[0]) || Date.now()), me.owner, sid, String(e[1] || "").slice(0, 20), safe_(String(e[2] || "").slice(0, 80)), safe_(String(e[3] || "").slice(0, 60))]; });
  var sh = sheet_("TapLog"); sh.getRange(sh.getLastRow() + 1, 1, rows.length, TAP_HEAD.length).setValues(rows);
  return { ok: true, n: rows.length };
}
// Desk panel: who's in the crew, when they were last in, taps + feedback in the last 24 h. Reads only the TapLog tail.
function betaInfo_() {
  var crew = owners_().filter(function (o) { return String(o.beta || "").toUpperCase() === "Y"; }), day = Date.now() - 864e5, by = {};
  crew.forEach(function (o) { by[norm_(o.owner)] = { owner: o.owner, team: o.team, tier: o.tier, last: null, taps: 0, fb: 0 }; });
  var sh = SpreadsheetApp.getActive().getSheetByName("TapLog");
  if (sh && sh.getLastRow() > 1) { var n = Math.min(4000, sh.getLastRow() - 1);
    sh.getRange(sh.getLastRow() - n + 1, 1, n, 2).getValues().forEach(function (r) { var x = by[norm_(r[1])]; if (!x) return; var t = new Date(r[0]).getTime();
      if (!x.last || t > x.last) x.last = t; if (t > day) x.taps++; }); }
  var fsh = SpreadsheetApp.getActive().getSheetByName("Feedback");
  if (fsh) rows_("Feedback").forEach(function (f) { var x = by[norm_(f.owner)]; if (x && new Date(f.ts).getTime() > day) x.fb++; });
  return { crew: Object.keys(by).map(function (k) { var x = by[k]; if (x.last) x.last = new Date(x.last).toISOString(); return x; }) };
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

