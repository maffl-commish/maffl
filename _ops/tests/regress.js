// Backend regression: runs every backend action against the mock (the REAL logic.js + parts + daily.js, fake Google + ESPN)
// and prints normalized results (timestamps, ids, durations masked).
//   node _ops/tests/regress.js > /tmp/out.txt && diff _ops/tests/regress_expected.txt /tmp/out.txt
// An intended behavior change → review the diff, then refresh regress_expected.txt in the same commit.
// Freeze the clock at Sat 2026-11-07 10:00 AM ET (real time still ticks forward from there), so the daily slot, the
// trade deadline and "N min ago" text don't depend on when this runs.
(function () {
  const Real = Date, start = Real.UTC(2026, 10, 7, 15, 0, 0), t0 = Real.now();
  const now = () => start + (Real.now() - t0);
  class FrozenDate extends Real { constructor(...a) { if (a.length) super(...a); else super(now()); } static now() { return now(); } }
  global.Date = FrozenDate;
})();
const mockMod = require("./mock.js");
const m = mockMod.create({});
const norm = (o) => JSON.stringify(o, null, 0)
  .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<ts>")
  .replace(/"(ts|at|updated|updated_ts|last|since|kick)":\s*\d{10,}/g, '"$1":<n>')
  .replace(/\b1[6-9]\d{11}\b/g, "<ms>")
  .replace(/\b[A-Z]{1,3}[0-9A-Z]{7,}\b/g, (s) => /^[A-Z]+$/.test(s) ? s : "<id>")
  .replace(/"F[a-z0-9]{6,}"/g, "\"<fid>\"").replace(/"pin":"[^"]*"/g, '"pin":"<pin>"').replace(/"token":"t\.[0-9a-f]+"/g, '"token":"<token>"')
  .replace(/\d+ ?(s|ms)\b/g, "<dur>")
  .replace(/(\d+ (min|minutes|hours?|h) ago)/g, "<ago>");
// The tick's ESPN job only runs every other 15-minute window (and DMs owners when it does): mask it so the result
// doesn't depend on the clock.
const clockFree = (k, v) => k === "deskact tick" ? JSON.parse(JSON.stringify(v).replace(/"espn \d+",?/g, "")) : v;
const pins = m.pins(), me = { owner: "Mike Murello", pin: "GRONK-PISTOL" };
const out = (k, r) => console.log(k.padEnd(28), norm(clockFree(k, r)).slice(0, 4000));
const G = (q) => m.get(q), P = (b) => m.post(b);
out("get version", G({}));
out("get daily", G({ action: "daily" }));
out("daily drops", (G({ action: "daily" }).drops || []).map((d) => [d.id, d.type, d.tier, d.items.length, d.items[0].bid, d.items[0].lost.length]));
out("math drop", m.daily().mathDrop(true));
out("math drop again", m.daily().mathDrop(true));
out("math drop data", (G({ action: "daily" }).drops || []).filter((d) => d.type === "math").map((d) => [d.id, d.games.length, d.games[0].tier, d.games[0].a.left.length, d.games[0].b.left.length]));
out("get rosters U", G({ action: "rosters", tier: "U" }));
out("get rosters L", G({ action: "rosters", tier: "L" }));
out("get live U", G({ action: "live", tier: "U" }));
out("get live U wk8", G({ action: "live", tier: "U", week: 8 }));
out("get ledger", G({ action: "ledger" }));
out("login", P({ action: "login", pin: "GRONK-PISTOL" }));
out("login bad", P({ action: "login", pin: "NOPE-NOPE" }));
let s = P(Object.assign({ action: "summary" }, me)); out("summary", s);
out("settings", P(Object.assign({ action: "settings" }, me)));
out("savesettings", P(Object.assign({ action: "savesettings", email: "m@x.test", phone: "4125550000", notify: { offer: true } }, me)));
out("inbox", P(Object.assign({ action: "inbox" }, me)));
out("chat league", P(Object.assign({ action: "chat", room: "league" }, me)));
const sent = P(Object.assign({ action: "chatsend", room: "league", text: "regression hello", mentions: [] }, me)); out("chatsend", sent);
out("chatmod pin", P(Object.assign({ action: "chatmod", msg_id: sent.id || "", op: "pin" }, me)));
out("react", P(Object.assign({ action: "react", ref: "inbox:coach", emoji: "🔥", on: true, week: 8 }, me)));
const poll = (s.polls || [])[0]; if (poll) out("vote", P(Object.assign({ action: "vote", poll: poll.id, choice: "x", week: poll.week }, me)))
if (poll) out("vote again", P(Object.assign({ action: "vote", poll: poll.id, choice: "y", week: poll.week }, me)));
out("block on", P(Object.assign({ action: "block", player: "U:Josh Allen", on: true, note: "test" }, me)));
const offers = s.offers || [];
const toMe = offers.filter((o) => o.status === "PROPOSED" && o.to === "Mike Murello")[0], fromMe = offers.filter((o) => o.status === "PROPOSED" && o.from === "Mike Murello")[0];
const rev = offers.filter((o) => o.status === "ACCEPTED")[0];
if (toMe) out("respond accept", P(Object.assign({ action: "respond", offer_id: toMe.id, decision: "accept" }, me)));
if (fromMe) out("respond withdraw", P(Object.assign({ action: "respond", offer_id: fromMe.id, decision: "withdraw" }, me)));
if (rev) out("commish approve", P(Object.assign({ action: "commish", offer_id: rev.id, decision: "approve" }, me)));
out("perk faab", P(Object.assign({ action: "perk", perk: "faab", qty: 1 }, me)));
s = P(Object.assign({ action: "summary" }, me));
const pk = (s.perks || []).filter((p) => p.status === "REQUESTED")[0]; if (pk) out("perkact approve", P(Object.assign({ action: "perkact", perk_id: pk.id, decision: "approve" }, me)));
out("desk", P(Object.assign({ action: "desk" }, me)));
out("deskact tick", P(Object.assign({ action: "deskact", op: "tick", target: "" }, me)));
out("deskact poll", P(Object.assign({ action: "deskact", op: "poll", target: "", question: "Q?", options: ["A", "B"], tier: "", days: 7, week: 8 }, me)));
out("deskact announce", P(Object.assign({ action: "deskact", op: "announce", target: "", text: "Dues are due Friday." }, me)));
{ const d0 = P(Object.assign({ action: "desk" }, me)); const e0 = (d0.espn || [])[0];
  if (e0) { out("deskact espnwhen", P(Object.assign({ action: "deskact", op: "espnwhen", target: "", perk_id: e0.id, when: "2026-11-17" }, me)));
    out("deskact espnwhen bad", P(Object.assign({ action: "deskact", op: "espnwhen", target: "", perk_id: e0.id, when: "soon" }, me)));
    out("desk espn when", (P(Object.assign({ action: "desk" }, me)).espn || []).map(function (x) { return x.perk + ":" + x.when; })); } }
out("chat league after announce", P(Object.assign({ action: "chat", room: "league" }, me)).pinned);
out("board", P(Object.assign({ action: "board" }, me)));
out("deskact beta", P(Object.assign({ action: "deskact", op: "beta", target: "Sam Lavrinc", on: true }, me)));
out("deskact daily", P(Object.assign({ action: "deskact", op: "daily", target: "" }, me)));
out("feedback", P(Object.assign({ action: "feedback", mood: "up", note: "nice", kind: "button", where: "Home", ctx: "" }, me)));
{ const tb = { owner: "Dan Reilly", pin: pins["Dan Reilly"] }; // 💡 Ideas & feedback: any owner, beta or not
  out("feedback nonbeta button", P(Object.assign({ action: "feedback", mood: "up", note: "x", kind: "button", where: "Home" }, tb)));
  out("feedback rate", P(Object.assign({ action: "feedback", kind: "rate", stars: 4, note: "Love the reel", where: "Ideas & feedback" }, tb)));
  out("feedback rate empty", P(Object.assign({ action: "feedback", kind: "rate", stars: 0, note: " ", where: "Ideas & feedback" }, tb)));
  out("feedback rate desk", (P(Object.assign({ action: "chat", room: "desk" }, me)).messages || []).filter((l) => l.event === "rate").map((l) => l.text)); }
out("taplog",P(Object.assign({ action: "taplog", taps: [["tab", "home", "Home"]], session: "s1" }, me)));
out("resync", P(Object.assign({ action: "resync" }, me)));
out("request", P({ action: "request", owner: "Tony Brooks", note: "pls" }));
out("botpost badkey", P({ action: "botpost", key: "nope", title: "x" }));
m.prop("DESK_KEY", "k1"); const E5 = { elite5: ["Mike Murello", "Joe Reilly", "Braiden Snyder", "Dominic Nicastro", "Tony Brooks"].map((o) => ({ owner: o, note: "x" })) };
out("putlines wk out", P({ action: "putlines", key: "k1", lines: E5 }));
out("putlines wk out again", P({ action: "putlines", key: "k1", lines: E5 }));
// Drops (11/9): the seeded Week 8 lines are already out, so putlines keeps them (and saves no new Elite 5).
out("board elite5", (P(Object.assign({ action: "board" }, me)).posts || []).filter((x) => x.event === "ELITE5").map((x) => x.text));
out("board drops", (P(Object.assign({ action: "board" }, me)).posts || []).filter((x) => /NEWS|FAAB|ELITE5/.test(x.event)).map((x) => [x.event, x.room, x.text.split("\n")[0]]));
out("summary end", P(Object.assign({ action: "summary" }, me)));
out("sheet Polls", m.sheet("Polls"));
out("sheet Events len", (m.sheet("Events") || []).length);
out("sheet Chat rows (room != dm)", (m.sheet("Chat") || []).filter((r) => !/^dm:/.test(r[2])).length); // DMs vary with the tick's ESPN window
// 🏷️ Handles (11/9), last so the 1-second chat limit and Mike's new handle don't touch the checks above
setTimeout(() => {
  out("handle taken", P(Object.assign({ action: "savesettings", email: "m@x.test", handle: "Joe" }, me)).error);
  out("handle bad", P(Object.assign({ action: "savesettings", email: "m@x.test", handle: "1x" }, me)).error);
  out("handle set", P(Object.assign({ action: "savesettings", email: "m@x.test", handle: "@Commish_Mike" }, me)).handle);
  out("handles", P(Object.assign({ action: "summary" }, me)).handles);
  out("chat @handle", (() => { P(Object.assign({ action: "chatsend", room: "league", text: "@Joe you up? cc @braiden" }, me)); const c = P(Object.assign({ action: "chat", room: "league" }, me)); return c.messages[c.messages.length - 1].mentions; })());
  // 🎭 seed data: build, rebuild (wipes first), what a tester sees, wipe; nothing emails
  const mail0 = m.mail().length;
  const shape = (r) => ({ ok: r.ok, offers: r.offers > 0, perks: r.perks > 0, msgs: r.msgs > 0, block: r.block > 0, skipped: r.skipped });
  out("seed", shape(P(Object.assign({ action: "deskact", op: "seed", target: "" }, me))));
  out("reseed", (() => { const r = P(Object.assign({ action: "deskact", op: "seed", target: "" }, me)); return Object.assign(shape(r), { wipedAll: r.wiped.offers > 0 && r.wiped.msgs > 0 }); })());
  out("seed desk", (() => { const d = P(Object.assign({ action: "desk" }, me)); return { staged: d.seed.offers > 0 && d.seed.perks > 0, untagged: d.seed.untagged.offers > 0, espnNoSeed: d.espn.every((x) => !/^PSD/.test(x.id)) }; })());
  out("seed tester offers", (() => { const ch = { owner: "Charles Lavrinc", pin: pins["Charles Lavrinc"] }; return [...new Set(P(Object.assign({ action: "summary" }, ch)).offers.filter((o) => /^TSD/.test(o.id)).map((o) => o.status + (o.reason ? "/" + o.reason : "")))].sort(); })());
  out("seed ledger", (() => { const l = m.get({ action: "ledger" }); return { seedRows: l.rows.some((r) => r.seed) }; })());
  out("adopt", P(Object.assign({ action: "deskact", op: "adopt", target: "" }, me)));
  out("adopt desk", P(Object.assign({ action: "desk" }, me)).seed.untagged);
  out("unseed", (() => { const r = P(Object.assign({ action: "deskact", op: "unseed", target: "" }, me)); return { ok: r.ok, all: r.offers > 0 && r.perks > 0 && r.msgs > 0 }; })());
  out("unseed desk", P(Object.assign({ action: "desk" }, me)).seed);
  out("seed mail", m.mail().length - mail0);
}, 2200);
