# MAFFL HQ App — governing doc (redesign · Reel · login)

**Codename: REEL.** Front door / map: `_ops/docs/REEL.md` (documented, built, roadmap, backlog).

VERSION: 0.12 (2026-11-03, chat) · Owner: commissioner (Mike) · Status: **prototype v0 in `lab/`, not live**

> **This is the one doc that governs the redesign.** Every chat working on the app, the Reel, logins or
> trades reads it first and records decisions here (§0 Journal). Other files are detail under it, never
> rivals: `TRADE_CENTER_DESIGN.md` (trade rules, Sheet tabs, guardrails §5b) · `REEL_MOCKUP.html` (old
> mockups, sample data) · `lab/` (working prototype). If they disagree, this doc wins; fix the other one.
> Nothing here touches the live site until **§9 Go-live** says so; then it moves through MAFFL HQ Ops as normal.

## 0. Journal (newest on top; one line per decision, dated)

- 2026-11-03 · **No category row on Home** (commish: the circles felt like a menu). The reel is one stack: thin progress bar on top
  (tap → Jump to sections), each card names its section, 🎯 Play cards (quizzes, Game of the Week) spread through the stack
  (never more than 2 in a row; scoreboard-spoiling quizzes stay before the scoreboard). Done circle → "You're caught up" card
  (your quiz score, 💬 Open chat, ⚔️ Your game). Custom tab icons dropped: a fixed tab bar keeps the app familiar.
  **Offseason mode** = same five tabs, different contents (reel → draft, keepers, rankings, history; Match → schedule/draft).
- 2026-11-03 · **Match = the scoreboard** (commish). No MAFFL-scoring section (Coach, Survivor, weekly high come post-match in the reel); DPB shown only on the score itself (flash + ×2), no spotlight card; Rivalry button lives in the scoreboard; lineups look like ESPN's (opponent, kickoff, stat line).
- 2026-11-03 · **Chat gets a bottom tab** (commish): Home · Match · 💬 Chat · Team · League, unread count on the tab; it opens the chat sheet over whatever you're on. More moved behind your avatar (top right, screen titled "You"). Header no longer shows Week/Tier.
- 2026-11-03 · **Double Player Bonus on the live scoreboard** (commish asked to showcase it). ESPN doesn't know about perks, so the app adds approved (and pending, labeled) DPBs to the live score itself; the commish still makes the official ESPN adjustment. Lab-only **test scores** fill in while ESPN shows all zeros (pretend opponent DPB included); never saved.
- 2026-11-03 · **Settings built (§4b).** More → Settings (email, mobile, 6 opt-in emails, all off). Automatic emails now go
  only to owners who turned that one on (perk emails included; before, anyone with an email got them). Contacts reach the app
  only in the signed-in summary. Text/Email nudge on open offers + after Send/Counter/Accept/Decline; `#offer-ID` deep link. Backend v0.12. Counter emails ride the chat change (server declines the countered offer).
- 2026-11-03 · **Chat, Sleeper-style (§4c), built in the lab.** One league room for everyone, a group per tier
  (listed with DMs), and DMs between any two owners. Trade offers post themselves into the two owners' DM as cards;
  the thread is the whole back-and-forth. A For-you reel card opens that thread ("a card that's a DM"). Skipped:
  wallet, GIFs, voice, read receipts.
- 2026-11-03 · **Codename REEL** (commish) for the whole redesign. `REEL.md` is the map; this doc still governs.
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
- 2026-11-03 · Full credit reconciliation (commish): app approval → credit sync robot → Credit_Log, balances, credits.html, app, next Pulse. No manual logging. Lab runs in TEST (dry run) until go-live flips CREDIT_SYNC=live. ESPN writes: experiment, Ghost score first (§10).
- 2026-11-03 · Credit perks live in the lab (Team → Credits → Spend): request → commish approves/denies; credits held until logged on the Credits page; ESPN side (FAAB, scoring adjustment, schedule swap) stays manual for the commish.
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
| 🏠 Home | **Home IS the reel** (commish 11/2) | One card stack fills the screen. No category row (11/3): a thin progress bar on top (tap → Jump to), each card names its own section, 🎯 Play cards spread through the stack. **For you** leads: your game, your result, could-have-won, Elite 5, deadlines, votes, Pick'em, trade offers. React 🔥😂💀 (reacting glides the card away) or swipe; sub-rows react too; ends "You're caught up". Remembers your spot per week. Full Pulse one tap away |
| ⚔️ Match | **Your live game** (commish 11/2): ESPN live scores via the backend, MAFFL scoring live (Coach of the Week bench gap, Survivor danger, weekly high), lineups side by side, Rivalry history button. Was: | Next opponent + stakes (Pulse preview), rivalry (series, last 5, biggest wins), last week's result + Coach of the Week lines, tier slate. **Every game links to its rivalry** (`rivalry.html#vs=A,B`) |
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

## 4c. Chat (built 11/3 in the lab, commish idea from Sleeper)

**Where.** 💬 button in the header (red count = unread). It slides up as a sheet over whatever you're on; trade
sheets, owner sheets and confirms open on top of it, so you never lose your place. Deep link: `lab/#chat` or `#chat=<room>`.

| Room | Who reads and posts | Gets automatic posts |
|---|---|---|
| **League chat** | Every signed-in owner | Approved trades ("Trade completed ✅" card) |
| **Upper / Lower Tier group** | That tier only (the commish sees both, to moderate) | Accepted trades (24-hour review card; commish gets Approve/Negate right on it) |
| **DM** | Just the two owners, any tier. Not the commish (the Sheet holds them, so say so at go-live) | Every offer, counter, accept, decline, withdraw and the commish's approve/negate |

- **Trade threads.** Sending an offer drops a trade card in the DM with your note and reason chips, then opens the thread.
  The newest card for an offer carries the live buttons (Accept / Counter / Decline, Withdraw, commish Approve / Negate),
  each with the usual confirm. A counter declines the original in the same step, so the thread shows one "countered" card.
  DMs with a tier-mate have a ⇄ button to start a trade with them; Team → Trades offers get a 💬 Chat button.
- **Reel.** For you leads with "💬 Trade talk" cards (an offer that needs you, or new messages in a DM) showing the trade
  card and the last line, and a card for unread league or tier chat. Tap to open the thread.
- **Messages:** text up to 500 characters, @mentions (tap @, pick an owner; Mentions tab + counts), emoji reactions
  (🔥😂💀👀👏, who reacted). Delete your own; commish deletes any and pins up to 3 per room. Trade cards can't be deleted.
- **Fresh enough, not instant.** An open thread refreshes every 8 s; unread counts every 30 s and when the app comes back.
- **Not yet:** opt-in email for DMs/mentions (§4b toggles), robot posts for Pulse drops and Coach of the Week, older-message paging (keeps the last 150).
- Backend: Sheet tabs **Chat** (msg_id, ts, room, owner, kind text|offer, text, ref, event, mentions, reply_to,
  deleted, pinned) and **Reads** (owner, room, last read). Both auto-created. Text is stored formula-safe.

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
  reactions, poll tallies, active polls; POST adds your chat inbox). Chat (v0.11): `chat` (one room + mark read),
  `chatsend`, `chatmod` (delete / pin), `inbox` (§4c).
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

## 7g. Recycle the goods (11/2)

Where the site already has a great view, the app embeds it instead of rebuilding it. First: the rivalry page via
`rivalry.html?embed=1#vs=A,B` (page chrome hidden; same accordions, charts and taps). Used on the "your game" card,
the Match tab and every rivalry panel. Swipe the card from its header or reaction bar (the page scrolls inside).

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
- Offseason mode: same tabs; the reel carries draft, keeper, rankings and history cards; Match shows next season's schedule / the draft.

## 9. Go-live checklist (fold into MAFFL HQ Ops when ready)

- [ ] Mike has used the full app on his phone (Home-Screen standalone) and signed off
- [ ] Dry run passed: fake trades incl. negate, deadline lockout, over-balance block, wrong PIN, undo
- [ ] Production Sheet + Apps Script deployed; test data wiped
- [ ] Roster and credit-balance generators live (derived data, never hand-edited)
- [ ] Credit sync: Script properties GITHUB_TOKEN set; one TEST approval ran the robot's dry run green; then CREDIT_SYNC=live and a real 1-credit FAAB request round-trips to credits.html (§10)
- [ ] Guest view checked logged out
- [ ] App becomes `index.html`; old home folds into League; old links still resolve
- [ ] Every owner's email + phone in the production Sheet (not the repo); Text/Email buttons tested on iPhone + Android
- [ ] PINs emailed; Pulse announces the launch

## 10. Automation: the league runs itself (commish 11/3)

**Goal:** the commish's job is tapping Approve/Deny in his own signed-in view. Everything downstream is a robot.

### 10a. Credit sync (built 11/3)

```
Approve in app ──▶ backend (logic.js) ──push──▶ _ops/inbox/credit_ledger.json ──▶ Credit sync workflow
  (perk, or trade       stamps the row, builds         whole ledger, idempotent      apply_credit_ledger.py → Credit_Log.csv
   with credits)        the ledger, emails owner                                     + Owners Sheet balance → gen-credits.ps1
                                                                                     → validate (Gate 4) → commit to main
                                                                                         │
     app balances (read credits.html registry) ◀──────────────────────────────────────┘ next Pulse reads Owners Sheet
```

- Ledger row ids `L-<request id>` ride in Credit_Log Notes as `[app L-…]`; that's how re-runs skip rows and how the app shows **Logged ✓**.
  Until logged, approved credits stay held (no double spending); status reads "Approved · posting".
- Trades with credits: two rows per credit leg (−n sender, +n receiver), category Trade. Perks: one row, category Spend.
- **TEST vs LIVE.** Script property `CREDIT_SYNC=live` → `credit_ledger.json`, robot commits. Anything else → `credit_ledger_test.json`,
  robot does the full run and shows the result in the Actions summary but commits nothing. Each approval remembers its mode,
  so lab tests never reach real credits.
- Setup (commish, once): Apps Script → Project Settings → Script properties → `GITHUB_TOKEN` = fine-grained token for
  `maffl-commish/maffl`, Contents read/write. Without it approvals still work; the push fails, you get an email, and Team → Credits shows
  ⚠️ with a **Re-send ledger** button.
- Robot rules: appends only (never edits or deletes a Credit_Log row); unknown owner name = stop; validate must pass or nothing commits;
  credits.html gets a Last Updated date stamp (no version bump).
- Notifications: owners get an email on approve/deny when the Owners tab has an `email` column filled (§4b). Opponents see perks aimed at
  them in the app.

### 10b. ESPN writes (experiment, not built)

ESPN has no official API; its own site writes through `lm-api-writes.fantasy.espn.com` with the same espn_s2/SWID cookies the robot
already uses. Others have proven lineup and add/drop writes; League Manager tools (score adjustments, FAAB, schedule) are undocumented.
Plan: commish does one Ghost score adjustment in Chrome while Claude records the request; if it can be replayed, the Tuesday robot posts
the Ghost adjustment, then reads it back and reports. No retries (a retry can apply twice), confirm step first season.
Candidates after that: approved Extra FAAB, Double Player Bonus adjustment, Matchup Swap schedule edit.

### 10c. Other jobs to automate (queue)

- Approved trade → player side reminder until ESPN shows the move (backend checks rosters in the 30-min refresh, §6b).
- Perk ESPN to-do list for the commish (until 10b exists): each approved perk lists the ESPN step with a "Done" tap.
- Weekly: Highest Weekly Score credit and season-end awards written to the ledger by the robot instead of by hand.
- Nightly reconciliation: ledger vs Credit_Log vs credits.html vs Owners Sheet; email only on a mismatch.

