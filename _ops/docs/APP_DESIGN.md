# MAFFL HQ App — governing doc (redesign · Reel · login)

VERSION: 0.6 (2026-11-02, chat) · Owner: commissioner (Mike) · Status: **prototype v0 in `lab/`, not live**

> **This is the one doc that governs the redesign.** Every chat working on the app, the Reel, logins or
> trades reads it first and records decisions here (§0 Journal). Other files are detail under it, never
> rivals: `TRADE_CENTER_DESIGN.md` (trade rules, Sheet tabs, guardrails §5b) · `REEL_MOCKUP.html` (old
> mockups, sample data) · `lab/` (working prototype). If they disagree, this doc wins; fix the other one.
> Nothing here touches the live site until **§9 Go-live** says so; then it moves through MAFFL HQ Ops as normal.

## 0. Journal (newest on top; one line per decision, dated)

- 2026-11-02 · **§6b refresh rhythm confirmed** (commish). Still to design: a short way to tell owners how
  often the app syncs with ESPN (§8).
- 2026-11-02 · **No lineup nudges.** Alerts only for direct interactions (trades for now; maybe more later).
  Fresh ESPN data is for the Reel app (`lab/` sandbox), not the classic pages.
- 2026-11-02 · **Fresh ESPN data (§6b, proposed).** Not real time, but on a rhythm: rosters/lineups/moves
  every 30 min (every 10 before kickoffs), live scores every 5 min in game windows. Fresh data goes through
  Apps Script → Sheet, not git commits; the Tuesday robot stays the official final. Confirm §8.
- 2026-11-02 · **Contacts + notifications (§4b).** Owner emails and phones live in the backend Sheet only (never the
  repo), shown to signed-in owners. Owners already share these, so no hiding between owners. Trade nudges = a
  prefilled **Text them / Email them** button the owner sends himself, plus **opt-in automatic emails** set in
  each owner's own Settings. **No robot-sent texts or push**, ever (commish: not wanted).
- 2026-11-02 · **Login = PIN up front, mapped straight to your team.** No team picker. Welcome screen asks
  for the PIN with a small **"Just browsing"** link; guests get the league-wide app. Details §4.
- 2026-11-02 · Made this the governing doc (commish worried about sprawl across two chats).
- 2026-11-02 · Pages dissolve into the app: reel cards, tab screens, slide-up sheets (§2c, mapping to confirm).
- 2026-11-02 · Card rules: never waste space; everything reactable; deadlines are headline items (§2b).
- 2026-11-02 · Home IS the reel; category row is the key. Everything ships together at go-live (no "coming in vN").
- 2026-11-02 · Tabs: Home · Match · Team · League · More. Rules under League; no separate Credit Leaders.
- 2026-11-02 · Retire Google Forms: credit trades via offers, perk spending from Team → Credits.
- 2026-11-02 · Reel replaces the home page; hybrid (rings + cards) chosen; Reel and Pulse become one.
- 2026-11-02 · Trades: own tier only, 👻 can't trade, no picks, offers private until both agree, commish approves credits.
- 2026-11-02 · Ultra careful at go-live: confirm sheets, undo toasts, append-only log; Mike feels it on his phone first.

## Working rules for this project

- Mockups and prototypes live in `lab/` or `_ops/docs/` only (noindex, unlinked). No live page changes until §9.
- Each session: read this doc, add a Journal line per decision, update the section it changes, bump VERSION.
- Settled questions get struck through in §8 with the answer, not deleted.

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
| ☰ More | Account + misc | **Settings** (your email/phone, notification toggles), Speak Up, PIN help, sign out, what shows on Home |

## 2b. Card rules (commish 11/2)

- **Never waste space.** Every card fills its height: a hero item on top (biggest type), then supporting items below.
- **Everything on a card can be reacted to**, the card itself and its rows (stories, lineup calls, games).
- Deadlines are headline items (top of Headlines when inside their lead window), not a separate category.

## 2c. Pages dissolve into the app (commish 11/2, proposed mapping — confirm)

Three building blocks only: **reel cards** (Home), **tab screens made of cards** (Match, Team, League),
and **sheets** that slide up from anywhere (tap a team, owner, player, game or rivalry). No page-to-page browsing.

| Page today | Where it lives in the app |
|---|---|
| Weekly Pulse | Its sections become reel card types. **No separate Pulse page.** Past weeks: League → pick a week, replays that week's reel |
| Rivalry | Match tab (your game) + a **rivalry sheet** from any game/score; League → Rivals for any pair |
| Power Rankings, Stats | League → All-time; tapping any owner opens an **owner sheet** (career, titles, rating, you vs. them) |
| History | League → History (champions by year as cards; a year opens a season sheet) |
| Auction Draft / Draft Day | Team → your drafts; player sheet → draft history; League → Auction recap; offseason reel cards |
| Credits | Team → Credits (balance, history, spend); standings credits column; rules in Rulebook |
| Prizes & Dues | Team → Money (your dues + winnings); League → Prizes (payouts) |
| Rulebook | League → Rulebook, read in-app (searchable sections) |
| Speak Up | More → Speak Up (saves to the Sheet); polls appear as reel cards |
| Overview | More → About MAFFL |

## 3. Trade flow (Sleeper pattern, commish 11/2)

All rosters view → **pick a team** → side-by-side (your roster | theirs) → tap players, set credits →
**Preview trade** → **Send** → "Yes, send it" confirm → undo toast. Team tab's Trades shows a count badge
for open offers (inbound and outbound). Rules and guardrails: `TRADE_CENTER_DESIGN.md`.

## 4. Getting in (PINs) — decided 11/2

**The PIN is the login and maps to your team.** No "pick your team" step (v0 `lab/` still uses one as a stand-in).

| State | How you get there | What you see / can do |
|---|---|---|
| **Signed in** | Enter PIN once on the welcome screen; remembered on that phone | Personalized: For-you cards lead the reel, Team tab is yours, Match is your game. Can react, vote, trade, spend credits |
| **Guest** | Tap **"Just browsing"** under the PIN box | Same app, league-wide only: reel without For-you cards (scores, Coach, Survivor, headlines), all of League and Match slates. Team tab = "Sign in to see your team". A slim **Sign in** button stays on top |
| Private to PIN holders | — | Trade offers, your trade block notes, your credit/dues detail, anything that writes |

- Personalization **reorders, it doesn't wall off**: your cards first, shared league content still underneath.
- **Request access** link on the welcome screen: owner says who they are (+ optional note) → Apps Script logs it
  and **emails the commish** → commish texts the PIN → marks it done. Also reachable from More → PIN help.
- Go-live: commish emails each owner their PIN.
- More → **Sign out** (shared family devices).
- **iPhone note:** a Home-Screen web app keeps separate storage from Safari, so an owner who signed in in Safari
  enters the PIN once more after "Add to Home Screen". New phone / cleared data = asked again. Expected.
- Server side (from `TRADE_CENTER_DESIGN.md` §5): salted PIN hash in the Sheet, every write checks the PIN,
  5 wrong tries locks it until the commish resets.

## 4b. Contacts + notifications (decided 11/2)

**Where contact info lives.** Each owner's email and phone sit in the backend Sheet (Owners tab), **never** in the
repo or any page's JS: the site is public on GitHub Pages, so a PIN can't hide anything shipped with it. Apps Script
returns contact info only to a request carrying a valid PIN. Guests never see it.

**Who sees what.** Signed-in owners see every owner's email and phone (owner sheet, trade screens). The league
already shares these; the rule is only "not on the open internet". Each owner can edit his own email/phone in
More → Settings (writes need the PIN, like everything else).

**Nudging someone about a trade (two ways, both at go-live):**

1. **Text them / Email them button** (after Send, Counter, Accept, Decline, and on any open offer). Opens the
   phone's Messages (`sms:`) or Mail (`mailto:`) app with the message written for you, e.g. *"Mike sent you a trade
   offer on MAFFL HQ: [player + credits summary] 👉 [link]"*. The link deep-links to Team → Trades → that offer.
   The owner taps Send himself; it comes from his own number/email. Free, no setup. Check `sms:` body prefill on
   iOS standalone and Android.
2. **Opt-in automatic emails.** More → Settings toggles, all **off by default**: offer received · accepted ·
   declined · countered · commish approved/rejected the credit leg. Apps Script `MailApp` sends them on the
   matching write, with the same deep link. Mind the free daily email cap (fine for 20-some owners).

**Not doing:** robot-sent texts (paid SMS service + carrier registration) and web push. Commish: not wanted.

**PIN form (open, §8).** Proposal: a fun two-word passphrase per owner (e.g. `blitz-pickle`) instead of 4 digits.
Easier to remember, far harder to guess. Not case-sensitive, dash optional. Same salted hash + 5-try lockout (§7b).

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
| Rosters, lineups, moves, live scores | **New** ESPN refresh, see §6b (v2) |
| Reactions, votes, offers, PIN requests, owner email/phone, notification settings | **New** Google Sheet + Apps Script (v1). Contacts never in the repo |

## 6b. Fresh ESPN data (rhythm confirmed 11/2, commish idea)

Scope: the Reel app (`lab/` sandbox now, home page at go-live). Classic pages don't change.

Goal: an owner changes a lineup, adds a player or makes a trade on ESPN and HQ shows it soon after; on game
days scores tick up a few times an hour. **Not real time; on a rhythm.**

**Why not GitHub Actions schedules for this.** On Oct 6 every Tuesday cron ran 6½–7 h late. GitHub only
promises "best effort" for schedules, minimum 5 min. Also every refresh would be a commit + Pages rebuild
(1–2 min each, dozens a day) burying real history. Actions stay for the official weekly pull.

**Plan: Apps Script does the fetching (same backend as §7b).**
- A time trigger in the backend Sheet's script calls ESPN's league API for both tiers (cookies `espn_s2` + `SWID`
  in Script Properties, never the repo) and writes a compact snapshot to a **Live** tab (and cache).
- The app reads it via the web app's `summary`-style GET (`live` action). Each card shows **"Updated 7 min ago"**.
- Browser can't call ESPN itself (private league cookies + CORS), so the script is the go-between.

**Rhythm (ET):**

| What | When | How often |
|---|---|---|
| Rosters, lineups, adds/drops, trades | 8 AM–midnight daily | every 30 min |
| Same, lineup-lock rush | 1 h before Thu, Sun 1 PM, Sun night, Mon kickoffs (+ Sun 9:30 AM London games) | every 10 min |
| Live scores + projections | Thu 8 PM–12:30 AM · Sun 9:30 AM–12:30 AM · Mon 8 PM–12:30 AM (+ Sat games late season) | every 5 min |
| Overnight / no games | | hourly (cheap check) |
| Official final, Pulse | Tuesday robot (unchanged) | weekly |

Rough load: ~250 ESPN calls on a Sunday, well inside Apps Script's free daily limits (trigger run time is the
one to watch; keep each run small). Apps Script triggers are also not to-the-minute, but drift is minutes, not hours.

**Rules.** Live numbers are labeled "live" and never feed gold, credits, Coach of the Week or the Pulse; the
Tuesday pull stays the record. If ESPN fails, keep the last snapshot and show its age. Cookies expire about
yearly: script emails the commish when ESPN says no.

**Unlocks:** live matchup card (score, who's still to play), a moves feed (trades, adds/drops) as reel cards,
trade block that knows current rosters. **No lineup nudges** (commish 11/2): alerts only come from direct
interactions (trades for now, §4b).

## 7. Build order (everything ships together at go-live; commish 11/2)

| Step | What | Who sees it |
|---|---|---|
| **v0 (now)** | `lab/` read-only app on real data; "pick your team" instead of a PIN | Mike (hidden URL, noindex) |
| v1 | Test Sheet + Apps Script: PINs, request-access email, reactions, votes | Mike + 1 tester |
| v2 | Roster pull + Team roster/player sheet + trades in the test Sheet; guardrails | Mike + tester |
| v3 | Credit perk spending; Pick'em | Same |
| Go-live | Production Sheet, PINs emailed, app becomes the home page (`index.html`), old home → League | League |

## 7b. Backend (built 11/2)

- Sheet: **MAFFL HQ App — TEST backend (lab)** in the commish's Drive (tabs Owners, Events, Requests, Polls, README).
- Script: `_ops/apps-script/Code.gs` is a stable **loader** (bound to that Sheet, deployed once as a web app) that
  fetches `_ops/apps-script/logic.js` from GitHub main (5-min cache) and runs it. Backend changes ship by push; no redeploys. Actions: `login`, `request`
  (logs + emails the commish), `react`, `vote` (POST, text/plain JSON); `summary` (GET: reaction counts, your
  reactions, poll tallies, active polls).
- Passphrases: two football words (GRONK-PISTOL), case/dashes ignored; salted SHA-256 only; 5 wrong tries locks.
  Commish menu in the Sheet: **MAFFL → Set / reset a passphrase** (shows it once to text it), **Mark request done**, **Unlock an owner**.
- Events is append-only (reactions toggle by appending on/off; last write wins).
- Client: `lab/index.html` `API_URL` (empty = demo mode). A phone can point at a test URL via
  `localStorage.maffl_lab_api`.
- Polls: a row per poll; `options = auto` builds Game of the Week from that week's games.

## 7c. Trades in the lab (11/2)

Rosters are staged from the 2026 auction draft (gold CSV) with approved test trades applied on top; weekly points
from Top Performers (top 3 per team). Real rosters come from the daily ESPN roster pull before go-live.
Offer lifecycle and guardrails as in `TRADE_CENTER_DESIGN.md` (confirm sheet on every send/accept/decline/withdraw/
approve/negate). Private offers are only returned to a signed-in owner (POST summary with passphrase).

## 7d. Trade grade + reasons (11/2, lab formula, tune later)

- Player value = 2026 auction price + ½ × points he's posted in his team's weekly top 3 (until ESPN per-game stats exist).
- 1 credit = $2 of value. Grade per side = value in ÷ value out, ±0.06 per player for positional fit vs. the tier's
  average depth (QB/RB/WR/TE). A+ ≥1.30 · A ≥1.12 · B ≥0.95 (fair) · C ≥0.80 · D ≥0.65 · F below.
- Shown live while picking players, on the preview, and to the other team on the offer.
- Reason chips on every offer: Need depth · Win now · Selling for the future · Want credits · Bye-week fix · Just a deal (+ free text).
- Step 1 of a trade is the all-rosters grid (your column pinned, scroll across the tier, positions grouped, 🏷️ tags); tap a team to go to the side-by-side.

## 7e. Reel v2: do something, then learn (11/2)

- Each category leads with a one-shot quiz from the week's data, then the facts: top score (Scores), bench blunder +
  name-the-bench-guy (Coach), who went home (Survivor), top FAAB bid (💸 Wire). Options are the answer + 2 tier mates
  chosen by a stable hash, so every owner sees the same question. The reveal tells the story and shows how many owners got it.
- Credits = the whole Pulse Credit Tracker in one card.
- Reactions: one tray per card, 5 emojis matched to the card type, plus who reacted. No per-row reactions.
- Source: `lab/weekfacts-data.js` (derived by `_ops/scripts/gen_lab_weekfacts.py` from `_ops/inbox/*_espn.md`).

## 7f. Every category is about you (11/2)

Order: ⭐ You → 🛡️ Your division (Upper) / 📈 Your race (Lower, promotion window) → 🔥 Hot & Not (Q&A, no paragraphs) →
📊 Scores (your tier; Game of the Week vote) → 🏆 Coach → 🛟 Survivor (strikethrough board) → 💸 Wire → 💳 Credits →
🌎 the other tier in one look. Pulse prose only appears as a one-line reveal after you answer.

## 8. Open

- ~~Confirm the §6b ESPN refresh rhythm?~~ **Yes** (11/2).
- How the app tells owners the sync pattern, briefly (e.g. "Updated 7 min ago" tap → one-line rhythm note).
- ~~Lineup-hole nudge?~~ **No.** Alerts only for direct interactions (trades).
- Confirm the §2c page → app mapping.
- PIN form: 4 digits or a fun two-word passphrase per owner (§4b)?
- Trades: both tiers at once at go-live, or one first? (trade note §8 Q4)
- ~~Trade Center replaces the Credit Request form for trade credit legs?~~ **Yes** (§5).
- ~~Team picker or PIN?~~ **PIN up front, guest "Just browsing"** (§4).
- Which Pulse sections stay as the "full Pulse" page vs. live only in cards (decide after v0 feel test).
- Offseason Home: circles become What's New; Match shows next season's schedule.

## 9. Go-live checklist (fold into MAFFL HQ Ops when ready)

- [ ] Mike has used the full app on his phone (Home-Screen standalone) and signed off
- [ ] Dry run passed: fake trades incl. negate, deadline lockout, over-balance block, wrong PIN, undo
- [ ] Production Sheet + Apps Script deployed; test data wiped
- [ ] Roster and credit-balance generators live (derived data, never hand-edited)
- [ ] Guest view checked logged out
- [ ] App becomes `index.html`; old home folds into League; old links still resolve
- [ ] Every owner's email + phone in the production Sheet (not the repo); Text/Email buttons tested on iPhone + Android
- [ ] PINs emailed; Pulse announces the launch
