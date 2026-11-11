# REEL — the new MAFFL HQ app (front door)

Last updated: 2026-11-10 (chat) · Roadmap refreshed for the beta launch (Week 10); ops handbook added

**"REEL" is the name for the whole redesign:** the phone-first app now in `lab/` (Home reel, Match, Team,
League, More), its passphrase login, trades, credit perks, the Apps Script backend and the robots behind it.
When a chat message starts with **REEL**, it's about this. Read this page first, then `APP_DESIGN.md`.

This page is the map. `APP_DESIGN.md` stays the governing doc for decisions (§0 Journal) and details; if the
two disagree, APP_DESIGN wins and this page gets fixed.

---

## 1. Documented (where things are written down)

| Doc | What it holds |
|---|---|
| `_ops/docs/REEL_OPERATIONS.md` | **Ops & architecture handbook**: diagram, inventory (pages, backend files, Sheet tabs, Script properties, workflows), operating calendar, procedures, risks, go-live readiness checklist, cutover plan |
| `_ops/docs/REEL_SERIES.md` | **Card series catalog**: every series, its group, audience, cadence, writer; the weekly budget and feed order |
| `_ops/docs/APP_DESIGN.md` | **Governing doc.** Decision journal, structure, card rules, page → app mapping, login, contacts, data, ESPN refresh, build notes (§7b–7g), open questions (§8), go-live checklist (§9), automation (§10) |
| `_ops/docs/TRADE_CENTER_DESIGN.md` | Trade rules, Sheet tabs, guardrails (§5b), trade open questions (§8) |
| `_ops/docs/REEL_MOCKUP.html` | Early mockups v1–v4 (sample data). History only |
| `CLAUDE.md` → "App backend" | `logic.js` is live backend code; pushing = deploying |
| `_ops/STATUS.md` → Recently shipped | Dated log of every REEL ship |

## 2. Built (in the lab sandbox, not live)

Lab: `lab/index.html` (hidden, noindex). Backend: Apps Script loader `Code.gs` + `logic.js` **v0.68** (core) + parts `mod_trades/espn/social/desk.js` + `daily.js`, TEST Sheet.

| Area | What works today |
|---|---|
| Shell | Pinned header + tab bar, iPhone zoom/pan fixed, Home-Screen friendly. **Loading:** logo boot screen, one spinner everywhere, gold bar under the header while the league server works; opens before rulebook/rosters arrive; last summary + last live score kept on the phone for instant paint |
| Sign-in | Passphrase (GRONK-PISTOL-427; older two-word ones still work until `LEGACY_PINS = false` at go-live, and the desk lists who still has one), no team picker; the phone then keeps a device token (a new passphrase signs old phones out). Wrong guesses pause sign-in for an hour (25 league-wide / 3 per owner), never a permanent lockout. Request-access email |
| 🏠 Home (inbox) | Up to 16 cards a week (cap raised 11/6; + 📣 your tier, 🏆 Coach, 🌎 other tier, up to 3 quizzes): **Needs you** first (trade offers folded into one card, commish desk, open vote; can't be cleared until handled), **Heads up** deadline, then story cards complete on their face, no tap-through (result score bug, up-next VS, chat, one quiz, Survivor if it's about you, division/race). ← → browse, swipe ↑ clears (per week), Inbox zero; count on the Home tab. Reactions on story cards |
| ⚔️ Match | **‹ Week › stepper** (Week 1 → this week; earlier weeks show Final + bench points) and **My game / 🏟️ Scoreboard** (every game in Upper or Lower for that week, leader bold, your game gold, each team's W–L through that week (11/9); tap a game → full matchup + lineups; 11/7). Live score from ESPN (backend `live`, 60 s auto-refresh, tap "↻ Ns ago" to pull now), ⚔️ Rivalry button between the teams, ESPN-style lineups (NFL team, opponent, kickoff, stat line). **✖️2 Double Player Bonus**: bonus score flashes gold with ×2 + player chip, doubled player highlighted. **🧪 Test scores** while ESPN is all 0 (opponent gets a pretend DPB; pill turns it off) |
| 🏈 Team | **Rosters live from ESPN** (backend `rosters`, 30-min cache, last good copy kept 6 h; rows show season pts · per game · Bench/IR · injury; player screen: ESPN rank, % rostered, status, week-by-week bars (11/6); MAFFL draft history from the draft CSV; staged draft roster only if ESPN can't be read; approved test trades on top). Trades end to end (all-rosters grid → side by side → live grade v2: Now + Future, no auction price (11/6) + reason chips → confirm → accept/decline/counter → commish approve/negate). Credits: balance (counts app-approved perks/trades/awards right away, before the credit robot posts them; standings too), history, **perk requests** (approved → MAFFL HQ post in League chat @-ing the owner and everyone it affects, Extra FAAB included) (Extra FAAB, Double Player Bonus, Matchup Swap, Relegation Insurance, Division Swap). Money: dues + winnings |
| 🏆 League | **Button grid (11/10)**, 2×5: 📊 Standings (tier toggle + table) · 📣 Board · 📋 Rules (search in-page) · 💰 Dues & Prizes (this season's dues + payouts) · 💸 Auction Draft (every pick since 2005) · 🗓️ Key Dates · 👤 Owners · ⚔️ Rivalries (you vs. every active owner) · 📚 Seasons · 📈 Records. Each opens its own page with ‹ League; tapping the League tab returns to the grid. The Vault name is gone; weekly scores live in Match; 💡 Ideas & feedback in You. |
| 💬 Chat | Bottom tab (Home · Team · Match · Chat · League, reordered 11/6) with unread count → pull-up sheet; More lives behind your avatar. League chat, Upper/Lower Tier groups, DMs. Trade offers land in the DM as cards with live buttons; accepted → tier group, approved → league room. Reel "Trade talk" cards open the thread. @mentions, reactions, commish pin/delete. **Send feedback:** message shows dimmed with a spinner + "Sending…" until the Sheet confirms; a failure stays in red with ↻ Retry / ✕ (APP_DESIGN §4c) |
| 📥 Commish desk | **Own screen from a floating 📥 Desk button (11/6, out of Chat):** tappable status tiles (Run it now / Re-send ledger inside) → To do → League (💳 Credits · 🤝 Trades · 🔑 Owner access) → Log newest-first with filters → 🧪 Beta (until go-live). Was a commish-only chat room. Live To do (perks, trades in review, passphrase requests → issue + text it, lockouts → unlock, ESPN steps → ✓ Done, credit-sync trouble → Re-send) above a log every robot and owner action posts to. Robots post via `desk-notify.yml` (DESK_KEY set 11/3 ✓) (APP_DESIGN §10d). **⏱️ 15-minute robot** (`tick`): perk nudges + lock warnings, review-over, trade-deadline heads-up, players-moved-on-ESPN check + DM reminder, nightly credit check; Run it now button (§10f) |
| ☰ More | **Settings**: your email + mobile, up to 2 emails (co-owned teams), eight emails in two groups with All on / All off: Trades & credits (offer received / countered / accepted / declined, commish decision, perk decision) off by default; Chat & league (DMs + @mentions, max one email per chat per 30 min, off; 📣 commish announcements, **on** by default). Email only for now (push/texts parked: need a push service / paid SMS). Contacts only in the backend Sheet, shown to signed-in owners |
| Contacts + nudges | Owner panel shows Text / Call / Email. Every open offer has 💬 Text them / ✉️ Email them (prefilled from your phone, link to the offer); a heads-up box pops after Send, Counter, Accept, Decline. `#offer-ID` links open that offer |
| Panels | Owner panel and rivalry panel from any name/game; real rivalry page embedded (`rivalry.html?embed=1`) |
| 🧪 Beta kit | Beta crew (Owners `beta`=Y, managed from the desk's 🚀 Go-live → 🧪 Beta crew panel; commish always on): floating 🧪 Feedback button (👍 Like it / 🤔 Confusing / 👎 Don't like + note, grabs the screen/card/sheet, phone, last error) → Feedback tab + desk log. Quick 👍/👎 prompts on first look at each tab, after a trade offer/answer, perk, chat message, inbox zero (max 3/day, 3 min apart; 👎 opens the note box). Tap log (tabs, sheets, taps, prompts, errors, open/hide) batched every 60 s + on close → TapLog tab. Desk panel: each tester's last visit, taps + feedback in 24 h, add/remove |
| 💡 Ideas & feedback | Every owner (11/9, replaces the Speak Up and credit-request Google forms): You → Talk to the commish and League → Rules & $ open a sheet with 1–5 stars (Not good … Love it) and an optional note (ideas, gripes, kudos). Backend `feedback` kind `rate` (open to every signed-in owner) → Feedback tab (mood "4★") + 📥 desk post "💡 Team · ★★★★☆" with the note (green 4–5, red 1–2) |
| 🌅 Daily run | In-season mode (replaces the Pulse in REEL): 5 AM + 5 PM ET from the tick (or desk Run it now): scores, records, streaks, Survivor, highs, Coach of the Week, roster moves (Moves tab), beta digest, health. ✍️ Claude writes card lines after each run (`card-lines.yml`). App builds the newest final week from it when the Pulse doesn't have it; result/next cards use the lines; 📰 Wire card. APP_DESIGN §10g |
| 🏅 Credits (daily) | Credit races (Most Points, Blowout, Individual High, Survivor) + weekly highs from the daily run; 💳 Credit races + ⭐ Elite 5 reel cards; Awards tab: EARNED all season → approve cards on the desk after Week 17 → ledger (11/6) |
| 🗳️ Votes | Polls and Game of the Week: one vote per owner, locked once cast (app + backend v0.35, commish 11/7); results show after you vote |
| 📅 Desk ESPN steps | 👻 Ghost score each final Lower week (par from the daily run, clears when ESPN matches; a stat correction that moves a past week's par brings it back, even after ✓ Done; v0.40). Desk sections are accordions, closed on open. Each approved perk's ESPN step has a Do-on day (default: Double Bonus = Tue after its week, Swap = Tue before, else the day approved); counts as a to-do from that day, else waits under Scheduled (v0.38, commish 11/8). No Home "needs you" banner: action cards lead the feed |
| 👋 Welcome tour | First open (or You → Show the tour again, or a desk replay): a "new and improved MAFFL HQ" card over the app (it's yours now · virtually live from ESPN · everything but lineups happens here), then one stop per tab (the app switches tabs and rings the button; tab bar stays visible). First visit to Team / Match / Chat adds a tip or two, on-screen targets only (fix: an off-screen target used to strand the tour). Commish 11/8 |
| ✨ Update check | A Home-Screen app keeps running the copy it loaded, so the app fingerprints its own scripts + styles and compares with a fresh fetch of the page: 4 s after opening, on coming back to the app (≥1 min apart) and every 10 min. Newer copy → back after 10+ min away with nothing being typed: reloads itself; otherwise a gold-edged "✨ Update ready · Tap to refresh" pill at the top. Automatic (no build number to bump). Commish 11/9 |
| 🎭 Seed data | Desk → Go-live → 🎭 Seed data: **Build / Reseed** stages pretend league activity on the live ESPN rosters, real owners included (commish 11/9): every beta tester gets an offer waiting, a counter waiting (+1 credit if affordable) and an old declined offer, with DM banter; testers in one tier get one between them; per tier 2 private offers between other owners, an APPROVED trade with credits (players move on the app's rosters; credits count in balances as test moves), an ACCEPTED one for the desk, perk requests approved / waiting / denied; tier + league chat; trade-block listings. **🏷️ Tag as staged** marks the earlier tinkering (Offers / Perks / Chat outside the desk log, block listings) as staged. Staged = id prefix `TSD` / `PSD` / `MSD` or column `stage` = seed (block Events week `seed`). Never emails, never reaches the repo credit ledger or nightly check, no ESPN reminders or Do-on-ESPN steps. **Wipe seed** rewrites Offers / Perks / Chat without staged rows (+ chat cards pointing at them) and appends block "off" rows. Backend v0.62. |
| 📥 Desk dashboard | Top of the Commish desk (commish 11/9): six count tiles (Trades to approve, Perks to approve, Do on ESPN, Sign-in help, Offers out league-wide, Beta notes 24 h), gold when waiting on him, tap opens that section; league-wide trade line; one folded 🤖 Robots row in plain words with real states (tap a robot → what it does + Run it now). |
| 🧾 Trade audit | Desk log → 🤝 Trades: every offer step from the Events tab (offered, countered, accepted, declined, withdrew, approved, negated + reason), tap for both sides, offer ID, current status and timeline; log search by owner / team / player / offer ID (v0.63, commish 11/9) |
| ✂️ Trade grades | Dropped 2026-11-09 (commish: not working, too much). Builder, preview, offers and the player screen show no grade or trade value |
| Robots | Credit sync (`credit-sync.yml`): app approval → Credit_Log → balances → credits.html. TEST mode (dry run) |

## 3. Roadmap (to go-live — everything ships at once)

1. **Finish the sandbox** — backlog "Next" items below.
2. **Hook up for real** — GITHUB_TOKEN Script property (credit sync **and** the daily card-lines robot need it) + DESK_KEY (Script property and GitHub secret); real ESPN live feed; real rosters (ESPN roster pull); lab week facts wired into the Tuesday robot.
3. **Mike's feel test** — full app on his phone (Home-Screen standalone), then a dry run: fake trades incl. negate, deadline lockout, over-balance block, wrong passphrase, undo.
3a. **Beta launch, Week 10 (target Wed 11/11 evening, before Thursday's game):** add the crew on the desk + issue new passphrases → Reseed Wed night → `OWNER_EMAILS = "beta"` when they're told → text the link + a short brief (real: scores, rosters, standings, history · pretend: trades, credits, chat with other owners; keep it in the crew) → no risky pushes Sat noon–Mon night → collect feedback through 🧪, read it Monday. Go-live target: week of 11/23 (trade deadline 12/2).
3b. **Beta crew** — Charlie, Sam and Ben (Mike's nephews, new to the league, all in the **Lower** tier; young, used to modern apps, have time to test). Joe Reilly joins (commish 11/9) for Upper-tier activity with Mike. They get the MVP before everyone else, with the 🧪 beta kit (built 11/6). To start: desk → 🚀 🚀 Go-live → 🧪 Beta crew → add each tester, issue their passphrases, text them the link.
4. **Go-live** — readiness checklist + cutover plan in `REEL_OPERATIONS.md` §5–§6 (same-URL swap, tag `classic-final`, scripted build step, `lab/` redirect). APP_DESIGN §9 checklist: `STAGE = "live"` in lab/index.html (hides the beta strip + practice note), production Sheet, test data wiped, CREDIT_SYNC=live, `OWNER_EMAILS = "live"` (logic.js) after the emails are reviewed, passphrases emailed, app becomes `index.html`, old home → League, Pulse announces it.

## 4. Backlog

**Next (decided, not built)**
- 💬 Chat follow-ups: robot posts for Pulse drop + Coach of the Week, older-message paging (APP_DESIGN §4c).
- Guest "Just browsing" mode (§4).
- ESPN refresh on a rhythm via Apps Script trigger (§6b), "Updated N min ago" label.
- **Daily run follow-ups:** offseason mode for the daily run; retire the classic Pulse at go-live (stop `pulse-draft.yml`'s Claude step, keep the gold append).
- Prices for waiver adds (FAAB paid) and draft CSV off the critical path (only player history needs it).
- Remaining pages into the app: Power Rankings, History, Draft (§2c).

**Commish walkthrough 11/7 (voice notes, tab by tab)**: A–E shipped 11/7 (STATUS). Still open:
- 🗄️ **The Vault** (decided 11/7; History & Stats reborn inside REEL): steps 1–3 shipped (vault-data.js + Throwback card; lines final for all 24 seasons; League → Vault with Seasons, Records, Owners, Draft). Step 4 done (11/7): What would you pay?, This week in MAFFL history, Name that team, Meet the owner, Records watch.
- F · 🏆 **League tab overhaul**: the deep-dive area cards drill into (Rulebook is buried; standings list is too plain). Waiting on Mike's list of what owners should reach from it.
- Done 11/7: 🧑 MAFFL player profile (any player, anywhere: season + price history + owners + title pedigree + trade value + 8 Ball).
- Done 11/7: 👤 MAFFL owner profile (Power Rankings ratings + scout report, trophy case, season strip, auction profile, rivalries).
- G · 👤 **Profile revamp** (owner side done 11/7; left: anything else from the classic Power Rankings page): bring Power Rankings / owner profile (years in league, draft profile, Madden-style ratings) into the app's look, behind Team → Profile.
- Box scores today read ESPN on demand (`live` with `week`, finals cached 6 h). If we want them offline/historic later: end-of-season roster + lineup snapshot into the archive (gold stays results-only).
- Done 11/7: player week-by-week bars show started vs benched (daily.js keeps each week's starters).
- Decided 11/10: League tab = a grid of 10 buttons (people come to League looking for something; the reel surfaces things in season). The Vault concept is retired: Board / Seasons / Records / Owners / Auction Draft are buttons. Preseason draft info comes through reel cards; draft history through the Board where it fits. No scoreboard in League (Match has it).
- Decided 11/9: Match win probability must match ESPN (ESPN's number if the feed has it, else an estimate fit to ESPN's); team header shows owner · record (streak).
- Decided 11/9: 🏷️ @handles for every owner (default = registry short name, editable in Settings) and the @ Mentions tab back in Chat (reversing 11/3): cards and chat tag people by handle (backend v0.50).
- Decided 11/9: a league card that names you tags you in Chat → @ Mentions (⭐ Elite 5 first; tap opens the card). Client-side, unread kept on the phone.
- 11/10 (built): **Pre-launch review fixes** (`_ops/AUDIT_2026-11-10_prelaunch.md`): reaction XSS + formula guards closed; seed tools off at go-live; broken part pushes fall back to the last good copy; Pulse robot scope guard; frozen regression + data-contract CI (`backend-check.yml`); ↩️ Reverse for approved trades/perks; alert emails, email-quota guard, app errors from every phone; sign-in by name when guesses pause; `?action=health` for an uptime monitor. Open: commish steps in the audit's action list.
- 11/9 (built): REEL_SERIES v2.1 build plan done: drops (cards wait for their slot, newest drop first), 🏅 Week awards, one quiz a week, no "you" headlines on shared cards, anatomy pass, 📣 Commish alert + 💳 Perk news cards (also in chat).
- 11/9: 🗂️ **Card inventory** in REEL_SERIES.md v2.0: every series, its drop slot in the weekly rhythm, lifetime, verdict (keep / fix / merge / your call / new) and the card anatomy everyone follows. Build plan at its end.
- Decided 11/9: 🗞️ **Drops**: cards are published once and kept (no rewriting between runs). Step 1 ✅ card lines frozen per final week (backend v0.45). Step 2 ✅ waiver auction is a stored drop (v0.46). Step 3 ✅ 🧮 Tonight's math, Monday 5 PM (v0.48), your matchup only. Step 4 ✅ Board shows the published drops (v0.49). Plan complete (APP_DESIGN journal 11/9).
- Decided 11/9: the wire card is the 💰 Waiver auction report (FAAB pickups $1+, winner + bid, losing bids), not every add/drop. Daily run reads ESPN waiver claims (backend v0.43). Verified on real ESPN 11/9: losing bids from other teams come back. Players on no MAFFL roster get their names from ESPN's public players list (v0.55).
- Decided 11/9 (later): no "Clear all" in the reel: every card gets ← done or → save. ⭐ Elite 5 is saved once per final week (from the card lines) and shows on the Board; not posted to chat (backend v0.44). 📥 Desk button lives in the header, left of your initials. No commish-desk card in the reel: the 📥 count is the signal.
- Decided 11/9: no weeks in the reel. League → Weeks replay, the replay banner and the feed's Earlier-weeks chips are gone; league-wide posts live on the 📣 **Board** in the Vault (backend v0.41 `board`, from the Chat tab). Match keeps its week stepper.
- Decided 11/7: no custom group chats; DMs plus the league and tier rooms are enough.
- Decided 11/8: the "8 Ball" name is retired: it's **MAFFL Auction Draft Insights** (💡) in the reel, player profile and the classic draft page (tab "Insights").
- Decided 11/8 (later): ✓ Done bucket beside ⭐ Saved. Saved crosses weeks and stays until dispositioned; Done keeps cards 7 days then drops them (content lives on in League / the Vault). Needs-you cards can't be swiped.
- Decided 11/8: the feed can be handled: swipe ← done, → save (⭐ Saved chip), Undo, "N left this week", Clear all → ✅ All caught up (per week, on the phone). Up next to try: weekly edition (daily lines update cards, not add them) + ~10-card cap with a hero card.
- Decided 11/7: Home is a feed (scroll up = next, nothing deleted, "caught up" end) with a Needs-you strip; cards come from series with a weekly slot budget (REEL_SERIES.md). The 8 Ball is now a Vault series (25 rewritten tidbits); off-season Vault gets 6 slots; earlier weeks listed after "caught up".
- Decided 11/7 (evening): chat is part of the page column (no floating layer; the tab bar hides while typing); polls vote right in chat (bot posts kind "poll" with the poll id; older poll posts match by question), same results-after-you-vote rule as Home; tier chats get trades only from the daily run (free-agent adds/drops stay in the Moves tab).

**Commish backlog (added 11/6, not built)**

**Beta kit follow-ups (after the first testers)**
- Desk summary of the tap log (where they spend time, where they drop off); feedback inside the Chat sheet (the button sits under it today).
- How long the beta runs before go-live; whether prompts are too pushy (tune after the crew's first days).

**Automation queue (§10c, map §10e)**
- Commish: paste `Code.gs` (tick line) + add the 15-min trigger (§10f). Next robot jobs: weekly-high credit + season awards to the ledger (approve card), dues reminders, ESPN writes (§10b).
- Approved trade → reminder until ESPN shows the move.
- Perk ESPN to-do list for the commish (until ESPN writes exist).
- Robot writes weekly-high credit + season awards to the ledger.
- Nightly reconciliation; email only on mismatch.
- ESPN writes experiment, Ghost score adjustment first (§10b).

**Open questions (§8)**
- Sync-pattern note for owners.
- Confirm the §2c page → app mapping.
- Trades at go-live: both tiers or one first?
- What, if anything, stays as a "full Pulse" page.
- Offseason mode (decided: same tabs, different contents): which cards and what Match shows.

**Known issues**
- **Readiness audit 11/7:** `_ops/AUDIT_2026-11-07_reel_readiness.md`. Phases 1–2 shipped 11/7 (issue the crew new passphrases; new Code.gs deployed as Version 5); Phase 3 (go-live switch) next; §2 of this page is out of date (feed, no Money tab, Vault).
- 11/6 startup bug (no screen after load, blank tabs): guarded startup + You → App errors shipped. If it recurs on the iPhone, the error list names the cause.
- Done 11/7: backend split into core + parts (each well under the 95 KB cache limit); `_ops/tests/` holds the mock backend, regression and screenshot tools.

---

### How REEL chats work
- Start the message with **REEL**. Claude reads this page + `APP_DESIGN.md`, then the real files.
- Work in `lab/` and `_ops/` only until go-live. Decisions → APP_DESIGN §0 Journal. Ships → STATUS "Recently shipped" with a **REEL ·** tag.
- When something moves (built, decided, dropped), update this page in the same commit.
