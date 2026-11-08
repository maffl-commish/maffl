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
  .replace(/"F[a-z0-9]{6,}"/g, "\"<fid>\"").replace(/"pin":"[^"]*"/g, '"pin":"<pin>"')
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
const poll = (s.polls || [])[0]; if (poll) out("vote", P(Object.assign({ action: "vote", poll: poll.id, choice: "x", week: poll.week }, me)));
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
out("chat league after announce", P(Object.assign({ action: "chat", room: "league" }, me)).pinned);
out("deskact beta", P(Object.assign({ action: "deskact", op: "beta", target: "Sam Lavrinc", on: true }, me)));
out("deskact daily", P(Object.assign({ action: "deskact", op: "daily", target: "" }, me)));
out("feedback", P(Object.assign({ action: "feedback", mood: "up", note: "nice", kind: "button", where: "Home", ctx: "" }, me)));
out("taplog", P(Object.assign({ action: "taplog", taps: [["tab", "home", "Home"]], session: "s1" }, me)));
out("resync", P(Object.assign({ action: "resync" }, me)));
out("request", P({ action: "request", owner: "Tony Brooks", note: "pls" }));
out("botpost badkey", P({ action: "botpost", key: "nope", title: "x" }));
out("summary end", P(Object.assign({ action: "summary" }, me)));
out("sheet Polls", m.sheet("Polls"));
out("sheet Events len", (m.sheet("Events") || []).length);
out("sheet Chat rows (room != dm)", (m.sheet("Chat") || []).filter((r) => !/^dm:/.test(r[2])).length); // DMs vary with the tick's ESPN window
