// 📥 Desk-only mode check (commish 11/24): node _ops/tests/desk_mode.js  → prints PASS or the first failure.
// Runs the real backend in REEL_MODE "desk" against the mock: clean slate, no owner posts, Ghost email, headline pick.
process.env.MAFFL_DATA = process.env.MAFFL_DATA || require("path").join(__dirname, "fixtures");
const m = require("./mock.js").create({ mode: "desk" });
const ok = (c, msg) => { if (!c) { console.log("FAIL:", msg); process.exit(1); } console.log("ok  ", msg); };
const me = { owner: "Mike Murello", pin: "GRONK-PISTOL" };
const rows = (n) => (m.sheet(n) || []).slice(1).filter((r) => r.join("") !== "");
m.prop("DESK_KEY", "k");
ok(rows("Offers").length + rows("Chat").length > 0, "mock starts with test offers / chat");
const sum = m.post(Object.assign({ action: "summary" }, me)); ok(sum.mode === "desk", "summary says mode desk");
const t1 = m.tick(); ok(t1.ok, "tick runs");
ok(rows("Offers").length === 0 && rows("Perks").length === 0, "clean slate: offers + perks gone");
const chat = rows("Chat"); ok(chat.length >= 1 && chat.every((r) => r[2] === "desk"), "clean slate: only the fresh desk note is left (" + chat.length + ")");
m.tick(); ok(rows("Chat").length === chat.length, "clean slate runs once");
const d = m.post(Object.assign({ action: "desk" }, me)); ok(d.ok && d.mode === "desk" && d.pulse === null, "desk answers in desk mode");
ok(m.post({ action: "pulseopts", key: "nope", week: 11, options: [] }).ok === false, "pulseopts needs the key");
const before = m.mail().length;
const po = m.post({ action: "pulseopts", key: "k", week: 11, options: [{ headline: "A", subhead: "a" }, { headline: "B", subhead: "b" }, { headline: "C", subhead: "c" }] });
ok(po.ok && po.options === 3, "pulseopts stores 3 options");
ok(m.mail().length === before + 1 && /headline/.test(m.mail().slice(-1)[0].subj), "commish gets the headline email");
const d2 = m.post(Object.assign({ action: "desk" }, me)); ok(d2.pulse && d2.pulse.week === 11 && d2.pulse.live === 0, "desk shows the pick, option 1 live");
ok(m.post(Object.assign({ action: "deskact", op: "pulsepick", week: 11, pick: 0 }, me)).ok === false, "picking the live one is refused");
const pk = m.post(Object.assign({ action: "deskact", op: "pulsepick", week: 11, pick: 2 }, me)); ok(pk.ok && pk.live === 2, "pick 3 dispatches the swap");
ok(m.post(Object.assign({ action: "desk" }, me)).pulse.live === 2, "desk shows 3 live");
const g = m.post({ action: "deskact", op: "pulsepick", week: 11, pick: 1, owner: "Ben Funari", pin: "x" }); ok(g.ok === false, "owners can't pick");
const notDesk = rows("Chat").filter((r) => r[2] !== "desk"); ok(notDesk.length === 0, "nothing posted outside the desk room");
console.log("PASS");
