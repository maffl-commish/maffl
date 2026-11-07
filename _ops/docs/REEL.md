# REEL — the new MAFFL HQ app (front door)

Last updated: 2026-11-06 (chat) · 🌅 Daily run (in-season mode) + card lines; Pulse PR merges itself

**"REEL" is the name for the whole redesign:** the phone-first app now in `lab/` (Home reel, Match, Team,
League, More), its passphrase login, trades, credit perks, the Apps Script backend and the robots behind it.
When a chat message starts with **REEL**, it's about this. Read this page first, then `APP_DESIGN.md`.

This page is the map. `APP_DESIGN.md` stays the governing doc for decisions (§0 Journal) and details; if the
two disagree, APP_DESIGN wins and this page gets fixed.

---

## 1. Documented (where things are written down)

| Doc | What it holds |
|---|---|
| `_ops/docs/APP_DESIGN.md` | **Governing doc.** Decision journal, structure, card rules, page → app mapping, login, contacts, data, ESPN refresh, build notes (§7b–7g), open questions (§8), go-live checklist (§9), automation (§10) |
| `_ops/docs/TRADE_CENTER_DESIGN.md` | Trade rules, Sheet tabs, guardrails (§5b), trade open questions (§8) |
| `_ops/docs/REEL_MOCKUP.html` | Early mockups v1–v4 (sample data). History only |
| `CLAUDE.md` → "App backend" | `logic.js` is live backend code; pushing = deploying |
| `_ops/STATUS.md` → Recently shipped | Dated log of every REEL ship |

## 2. Built (in the lab sandbox, not live)

Lab: `lab/index.html` (hidden, noindex). Backend: Apps Script loader `Code.gs` + `logic.js` **v0.20** + `daily.js`, TEST Sheet.

| Area | What works today |
|---|---|
| Shell | Pinned header + tab bar, iPhone zoom/pan fixed, Home-Screen friendly. **Loading:** logo boot screen, one spinner everywhere, gold bar under the header while the league server works; opens before rulebook/rosters arrive; last summary + last live score kept on the phone for instant paint |
| Sign-in | Two-word passphrase (GRONK-PISTOL), no team picker, 25 wrong/hour league limit, request-access email |
| 🏠 Home (inbox) | Up to 16 cards a week (cap raised 11/6; + 📣 your tier, 🏆 Coach, 🌎 other tier, up to 3 quizzes): **Needs you** first (trade offers folded into one card, commish desk, open vote; can't be cleared until handled), **Heads up** deadline, then story cards complete on their face, no tap-through (result score bug, up-next VS, chat, one quiz, Survivor if it's about you, division/race). ← → browse, swipe ↑ clears (per week), Inbox zero; count on the Home tab. Reactions on story cards |
| ⚔️ Match | Just the scoreboard: live score from ESPN (backend `live`, 60 s auto-refresh, tap "↻ Ns ago" to pull now), ⚔️ Rivalry button between the teams, ESPN-style lineups (NFL team, opponent, kickoff, stat line). **✖️2 Double Player Bonus**: bonus score flashes gold with ×2 + player chip, doubled player highlighted. **🧪 Test scores** while ESPN is all 0 (opponent gets a pretend DPB; pill turns it off) |
| 🏈 Team | **Rosters live from ESPN** (backend `rosters`, 30-min cache, last good copy kept 6 h; rows show season pts · per game · Bench/IR · injury; player screen: ESPN rank, % rostered, status, week-by-week bars (11/6); MAFFL draft history from the draft CSV; staged draft roster only if ESPN can't be read; approved test trades on top). Trades end to end (all-rosters grid → side by side → live grade v2: Now + Future, no auction price (11/6) + reason chips → confirm → accept/decline/counter → commish approve/negate). Credits: balance, history, **perk requests** (Extra FAAB, Double Player Bonus, Matchup Swap, Relegation Insurance, Division Swap). Money: dues + winnings |
| 🏆 League | Four sections (11/6): **Standings** (tier toggle, table, week's scores) · **Weeks** (time-travel any week) · **Rules & $** (Rulebook in-app, Prizes, key dates, Speak Up) · **History** (Champions, classic tiles for Power Rankings, History, Draft, Pulse) |
| 💬 Chat | Bottom tab (Home · Team · Match · Chat · League, reordered 11/6) with unread count → pull-up sheet; More lives behind your avatar. League chat, Upper/Lower Tier groups, DMs. Trade offers land in the DM as cards with live buttons; accepted → tier group, approved → league room. Reel "Trade talk" cards open the thread. @mentions, reactions, commish pin/delete. **Send feedback:** message shows dimmed with a spinner + "Sending…" until the Sheet confirms; a failure stays in red with ↻ Retry / ✕ (APP_DESIGN §4c) |
| 📥 Commish desk | Commish-only room, first in Chat + a For-you card. Live To do (perks, trades in review, passphrase requests → issue + text it, lockouts → unlock, ESPN steps → ✓ Done, credit-sync trouble → Re-send) above a log every robot and owner action posts to. Robots post via `desk-notify.yml` (DESK_KEY set 11/3 ✓) (APP_DESIGN §10d). **⏱️ 15-minute robot** (`tick`): perk nudges + lock warnings, review-over, trade-deadline heads-up, players-moved-on-ESPN check + DM reminder, nightly credit check; Run it now button (§10f) |
| ☰ More | **Settings**: your email + mobile, six opt-in emails (offer received / countered / accepted / declined, commish decision, perk decision), all off by default. Contacts only in the backend Sheet, shown to signed-in owners |
| Contacts + nudges | Owner panel shows Text / Call / Email. Every open offer has 💬 Text them / ✉️ Email them (prefilled from your phone, link to the offer); a heads-up box pops after Send, Counter, Accept, Decline. `#offer-ID` links open that offer |
| Panels | Owner panel and rivalry panel from any name/game; real rivalry page embedded (`rivalry.html?embed=1`) |
| 🧪 Beta kit | Beta crew (Owners `beta`=Y, managed from the desk's 🧪 Beta crew panel; commish always on): floating 🧪 Feedback button (👍 Like it / 🤔 Confusing / 👎 Don't like + note, grabs the screen/card/sheet, phone, last error) → Feedback tab + desk log. Quick 👍/👎 prompts on first look at each tab, after a trade offer/answer, perk, chat message, inbox zero (max 3/day, 3 min apart; 👎 opens the note box). Tap log (tabs, sheets, taps, prompts, errors, open/hide) batched every 60 s + on close → TapLog tab. Desk panel: each tester's last visit, taps + feedback in 24 h, add/remove |
| 🌅 Daily run | In-season mode (replaces the Pulse in REEL): 5 AM + 5 PM ET from the tick (or desk Run it now): scores, records, streaks, Survivor, highs, Coach of the Week, roster moves (Moves tab), beta digest, health. ✍️ Claude writes card lines after each run (`card-lines.yml`). App builds the newest final week from it when the Pulse doesn't have it; result/next cards use the lines; 📰 Wire card. APP_DESIGN §10g |
| Robots | Credit sync (`credit-sync.yml`): app approval → Credit_Log → balances → credits.html. TEST mode (dry run) |

## 3. Roadmap (to go-live — everything ships at once)

1. **Finish the sandbox** — backlog "Next" items below.
2. **Hook up for real** — GITHUB_TOKEN Script property (credit sync **and** the daily card-lines robot need it) + DESK_KEY (Script property and GitHub secret); real ESPN live feed; real rosters (ESPN roster pull); lab week facts wired into the Tuesday robot.
3. **Mike's feel test** — full app on his phone (Home-Screen standalone), then a dry run: fake trades incl. negate, deadline lockout, over-balance block, wrong passphrase, undo.
3b. **Beta crew** — Charlie, Sam and Ben (Mike's nephews, new to the league, all in the **Lower** tier; young, used to modern apps, have time to test). Mike may add Joe or Ed so a second voice / tier is covered. They get the MVP before everyone else, with the 🧪 beta kit (built 11/6). To start: desk → 🧪 Beta crew → add each tester, issue their passphrases, text them the link.
4. **Go-live** — APP_DESIGN §9 checklist: production Sheet, test data wiped, CREDIT_SYNC=live, passphrases emailed, app becomes `index.html`, old home → League, Pulse announces it.

## 4. Backlog

**Next (decided, not built)**
- 💬 Chat follow-ups: opt-in email for DMs/@mentions (add a toggle to Settings), robot posts for Pulse drop + Coach of the Week, older-message paging (APP_DESIGN §4c).
- Guest "Just browsing" mode (§4).
- ESPN refresh on a rhythm via Apps Script trigger (§6b), "Updated N min ago" label.
- **Daily run follow-ups:** credits + credit-award races + Elite 5 from the daily run (today they still come from the last Pulse); offseason mode for the daily run; retire the classic Pulse at go-live (stop `pulse-draft.yml`'s Claude step, keep the gold append).
- Prices for waiver adds (FAAB paid) and draft CSV off the critical path (only player history needs it).
- `gen_lab_weekfacts.py` added to the Tuesday robot.
- Remaining pages into the app: Power Rankings, History, Draft (§2c).

**Commish backlog (added 11/6, not built)**
- ⚖️ Trade grade v2 follow-up: a real age source for Future value (ESPN's league API has none; today it's years since first MAFFL draft). Tune weights once real trades come through.

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
- `logic.js` is ~79 KB after v0.17 (cache limit 95 KB): split it before the next big backend feature.
- 11/6 startup bug (no screen after load, blank tabs): guarded startup + You → App errors shipped. If it recurs on the iPhone, the error list names the cause.
- Watch: `Code.gs` caches `logic.js` only while it is under 95 KB (Apps Script cache limit). It is ~60 KB now; past 95 KB every call would re-download it from GitHub (slow). Split it before then.

---

### How REEL chats work
- Start the message with **REEL**. Claude reads this page + `APP_DESIGN.md`, then the real files.
- Work in `lab/` and `_ops/` only until go-live. Decisions → APP_DESIGN §0 Journal. Ships → STATUS "Recently shipped" with a **REEL ·** tag.
- When something moves (built, decided, dropped), update this page in the same commit.
