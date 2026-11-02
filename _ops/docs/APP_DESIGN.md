# MAFFL HQ App — design note

VERSION: 0.2 (2026-11-02, chat) · Owner: commissioner (Mike) · Status: **prototype v0 in `lab/`**
Related: `TRADE_CENTER_DESIGN.md` (trades, PINs, guardrails §5b) · mockup `REEL_MOCKUP.html` (sample data)

## 1. Why

Few owners visit the site, and fewer read the whole Pulse. The makeover turns MAFFL HQ into a phone-first app:
the week in 30 seconds, things that need you, and a place for every page. It also retires the Google Forms over time.

## 2. Structure (decided 11/2)

Bottom tabs: **Home · Match · Team · League · More**. The app replaces the current home page at go-live.

| Tab | Job | Contents |
|---|---|---|
| 🏠 Home | **Home IS the reel** (commish 11/2) | One card stack fills the screen. The category row on top (For you, Scores, Coach, Survivor, Headlines, Credits, Dates, Done) is the **key**: it highlights where you are, pips show progress, tap to jump. **For you** leads: your game, your result, could-have-won, Elite 5, deadlines, votes, Pick'em, trade offers. React 🔥😂💀 (reacting glides the card away) or swipe; sub-rows react too; ends "You're caught up". Remembers your spot per week. Full Pulse one tap away |
| ⚔️ Match | Your game | Next opponent + stakes (Pulse preview), rivalry (series, last 5, biggest wins), last week's result + Coach of the Week lines, tier slate. **Every game links to its rivalry** (`rivalry.html#vs=A,B`) |
| 🏈 Team | You | Record, rank, credits, points. Tabs: **Roster** (player sheet: stats + MAFFL draft/owner history), **Trades** (badge = open offers in/out), **Stats** (season + career), **Credits** (balance, history, **spend credits on perks**, e.g. player double bonus) |
| 🏆 League | Everyone | Standings (credits column; no separate Credit Leaders), **Rulebook**, Pulse archive, Power Rankings, History, Draft, Rivals, Prizes & Dues |
| ☰ More | Account + misc | Speak Up, switch team / PIN help, what shows on Home |

## 3. Trade flow (Sleeper pattern, commish 11/2)

All rosters view → **pick a team** → side-by-side (your roster | theirs) → tap players, set credits →
**Preview trade** → **Send** → "Yes, send it" confirm → undo toast. Team tab's Trades shows a count badge
for open offers (inbound and outbound). Rules and guardrails: `TRADE_CENTER_DESIGN.md`.

## 4. Getting in (PINs)

- **Welcome screen:** pick your team, enter your PIN; remembered on that phone.
- **Request access link** on the welcome screen: owner picks who they are (+ optional note) → the Apps Script
  logs it and **emails the commish** → commish texts the PIN → marks the request done. Rare after go-live.
- Go-live: commish emails each owner their PIN.
- More → "PIN help / switch team" opens the same request flow.

## 5. Forms this retires

| Google Form today | Replaced by |
|---|---|
| Credit Request (trade credit leg) | Trade offers (credits ride along) |
| Credit Request (perk purchases, e.g. player double bonus) | Team → Credits → Spend (commish approves, like trades) |
| Speak Up | In-app (later) |

## 6. Data (no new gold needed for v0)

| Need | Source today |
|---|---|
| Results, Coach of the Week, Survivor, headlines, credits, previews, standings + credits | Latest Week object in `weekly.html` `WEEKS` (v0 reads it at runtime; later a generated `pulse-data.js`) |
| Schedule | `schedule-data.js` |
| Rivalry + career | `matchups-data.js` |
| Dates | `key-dates-data.js` |
| Rosters, player stats | **New** daily roster pull (GitHub Action) → `rosters-data.js` (v2) |
| Reactions, votes, offers, PIN requests | **New** Google Sheet + Apps Script (v1) |

## 7. Build order (everything ships together at go-live; commish 11/2)

| Step | What | Who sees it |
|---|---|---|
| **v0 (now)** | `lab/` read-only app on real data; "pick your team" instead of a PIN | Mike (hidden URL, noindex) |
| v1 | Test Sheet + Apps Script: PINs, request-access email, reactions, votes | Mike + 1 tester |
| v2 | Roster pull + Team roster/player sheet + trades in the test Sheet; guardrails | Mike + tester |
| v3 | Credit perk spending; Pick'em | Same |
| Go-live | Production Sheet, PINs emailed, app becomes the home page (`index.html`), old home → League | League |

## 8. Open

- Which Pulse sections stay as the "full Pulse" page vs. live only in cards (decide after v0 feel test).
- Offseason Home: circles become What's New; Match shows next season's schedule.
