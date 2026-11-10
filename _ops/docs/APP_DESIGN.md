# MAFFL HQ App — governing doc (redesign · Reel · login)

**Codename: REEL.** Front door / map: `_ops/docs/REEL.md` (documented, built, roadmap, backlog).

VERSION: 0.26 (2026-11-09, chat) · Owner: commissioner (Mike) · Status: **prototype v0 in `lab/`, not live**

> **This is the one doc that governs the redesign.** Every chat working on the app, the Reel, logins or
> trades reads it first and records decisions here (§0 Journal). Other files are detail under it, never
> rivals: `TRADE_CENTER_DESIGN.md` (trade rules, Sheet tabs, guardrails §5b) · `REEL_MOCKUP.html` (old
> mockups, sample data) · `lab/` (working prototype). If they disagree, this doc wins; fix the other one.
> Nothing here touches the live site until **§9 Go-live** says so; then it moves through MAFFL HQ Ops as normal.

## 0. Journal (newest on top; one line per decision, dated)

- 2026-11-09 · **🗞️ Drops: cards are published once, then kept** (commish: the Week 8 Upper headline changed between runs; "one news at the end of a week"). The reel becomes a news feed of drops, not a live rebuild: Tuesday's week-final drop (tier headlines, Coach, high score, Survivor, Elite 5, your result + next game), a 💰 Waiver auction drop when waivers clear, a Monday "tonight's math" drop (what you need from MNF), instant drops for commish alerts / polls / perks; the Board = the league-wide drops. Plan: (1) freeze card lines per final week ✅ backend v0.45 / daily VER 12: the card-lines robot runs only for a week with no published lines (`lines_w<N>`), late putlines are kept out, pre-freeze lines adopted as that week's; (2) waiver auction as a stored drop ✅ v0.46 (Daily key `drops`, type `faab`, one per tier per waiver run, kept 60 days); (3) Monday tonight's-math drop ✅ v0.48 (Monday 5 PM run publishes `math:<wk>`: games still alive, each side's starters yet to play + projections; the card is personal, shown until noon Tuesday); (4) Board reads stored drops.
- 2026-11-09 · **No commish-desk card in the reel** (commish): the commish's reel is news like every owner's; desk to-dos show only as the red count on the header 📥.
- 2026-11-09 · **Elite 5 stays out of chat; 📥 Desk in the header** (commish): the weekly Elite 5 is saved for the 📣 Board only (Daily key `elite5_hist`, backend v0.44). The commish desk button is a round 📥 in the header left of the initials chip (was floating bottom right); 🧪 Feedback still floats.
- 2026-11-09 · **Wire = 💰 Waiver auction** (commish): the Home wire card shows only waiver pickups that spent FAAB, with the winning bid and the losing bids (the free-agent auction report). Daily run reads ESPN `mTransactions2` (this week + last) into `faab_<tier>`; backend v0.43, daily VER 11.
- 2026-11-09 · **No Clear all; ⭐ Elite 5 on the record** (commish: train owners to save or done each card): the feed's "✓ Clear all" button is gone (Undo after a swipe stays). The first card lines after a week goes final post that week's Elite 5 to League chat (once per week, "⬇️ Out" vs the last one), so it lands on the 📣 Board; weeks before that come from each week's Pulse. Throwback-type Vault cards stay off the Board (their facts already live in the Vault). Backend v0.42.
- 2026-11-09 · **No weeks in the reel; 📣 League board in the Vault** (commish: cards now arrive twice a day from the news, so "show me last week" isn't a thing): League → Weeks (replay any week), the "Replaying Week N" banner, the feed's Earlier-weeks chips and the Week labels on Saved/Done are gone. Match keeps its ‹ Week › stepper (box scores are a lookup). Everything that went out league-wide is kept on the **Board** (Vault's first tab): commish alerts and MAFFL HQ posts from the league room and your tier room (week wraps, perk news, polls, trade reviews, deadline), newest first; weeks final before the robot posted wraps get one from the daily snapshot. Backend v0.41 `board` reads the Chat tab (no new storage).
- 2026-11-08 · **✓ Done bucket + Saved across weeks** (commish): Done chip beside ⭐ Saved; Saved stays until the owner sends it back or marks it done; Done holds cleared cards 7 days, then they self-delete (the stories stay findable in League and the Vault). Buckets keep a copy of each card as it looked; this week's show live. Needs-you cards lead the feed and can't be swiped or cleared.
- 2026-11-08 · **Home feed gets handled, not just scrolled** (commish: the feed felt like doom scrolling with no way to clear it): swipe ← = done (gone for the week), → = save (moves to a ⭐ Saved chip above the feed; open it to send a card back or mark it done); Undo after each; counter reads "N left this week"; the end card offers "Clear all" until the feed is empty, then ✅ All caught up. Per week, per owner, kept on the phone. Needs-you cards still can't be cleared. Next to try: weekly edition (daily-run lines update cards instead of adding them) and a ~10-card cap with one hero card.
- 2026-11-07 · **Trades checked against ESPN rosters** (audit S4–S5): players must be on that side's ESPN roster when sent, accepted and approved (check steps aside if ESPN can't be read; the commish still reviews), and a player can't be in two accepted trades (or one approved in the last 3 days). The same offer or perk request sent twice within 10 minutes returns the first one (double taps, retries after a lost answer).
- 2026-11-07 · **Server checks credit balances** (readiness audit B4): spendable = official record (`data/Credit_Log.csv` on main, Approved?=Y, the robot's sum) + app-approved rows not yet posted − holds (open perk requests; offers you'd pay into: PROPOSED from you, ACCEPTED either side). Checked when an offer is sent (both legs), accepted, approved, and when a perk is requested and approved. If the log can't be read, credit moves wait ("try again in a minute").
- 2026-11-07 · **Sign-in hardened** (readiness audit, Phase 1): phones keep a **device token** (handed out at sign-in, tied to the owner's salt, so a new passphrase signs every old phone out) instead of the passphrase. No automatic lockouts any more (anyone could lock anyone): passphrase-only sign-in pauses for an hour after 25 wrong guesses league-wide (signed-in phones keep working, commish alerted); owner + passphrase pauses that owner's passphrase checks after 3 wrong in an hour. New passphrases = two words + 3 digits (GRONK-PISTOL-427, ~6 million), stored as HMAC-SHA256 with a secret pepper in Script Properties (`PIN_PEPPER`, made on first use); older two-word phrases keep working until reissued. The commish can still lock by hand.
- 2026-11-07 · **Backend = core + parts** (commish: architecture must be first class): `logic.js` core + `mod_*.js` parts evaluated in one scope, each under the 95 KB cache limit, VERSION-keyed cache + 6 h last-good copy; every backend push passes `_ops/tests/regress.js` (mock backend runs the real code).
- 2026-11-07 · **Feed, not inbox** (commish): Home scrolls up through the week's cards (nothing deleted, ends "You're caught up"); things to act on live in a ⚡ Needs-you strip above it. Cards are organized as **series** with a weekly slot budget; the catalog is `REEL_SERIES.md`. Supersedes the 11/3 inbox (swipe up to clear, ← → browse).
- 2026-11-07 · **The Vault** (commish): History & Stats becomes the Vault inside REEL. History reaches owners as reel cards (Throwbacks first), the League tab holds the full Vault. Data: one derived file `lab/vault-data.js` (static, generated from gold by `gen_vault.py` + a workflow; no backend/Sheet); the only hand-written part is the commish's story line per season (`data/MAFFL_Throwbacks.csv`).
- 2026-11-07 · **Walkthrough A–E** (commish voice notes, tab by tab): reel cards fill the screen; **two kinds of card** — 🏟️ League/tier cards (everyone sees them and everyone's reactions; Elite 5 keeps your own headline on a shared card) vs. your-team-tagged cards (no reactions); Coach of the Week is one league card for both tiers (+ 🚀 high score card); polls show results **after you vote**; chat pins stay **commish only**; Chat is a real tab (no pull-up sheet); one player screen everywhere (Match, box score, other-tier card); Team = Roster · Trades · Credits (Money and Stats retired); first-time tour per tab. League tab overhaul (F) and profile revamp (G) wait for Mike's list.
- 2026-11-06 · **Desk = command center** (commish): opened from a floating 📥 Desk button (like 🧪 Feedback), not a chat room. Log newest first, filters, compact rows. Backend unchanged (desk room still stores the log).
- 2026-11-06 · **Credit awards:** the daily run tracks races and weekly highs; awards are EARNED in season and only become approve cards after Week 17 (credits are issued then, commish). Approve → ledger → credit sync, same path as perks. Elite 5 now written by the card-lines robot.
- 2026-11-06 · **Trade grade v2** (commish): auction price dropped everywhere in REEL. Grade = Now (PPG above tier replacement level × weeks left, recent form, injury) + Future (ESPN % rostered × career stage via first MAFFL draft year). §7d superseded for value; position fit unchanged.
- 2026-11-06 · **In-season mode = a daily run, not a weekly Pulse** (commish). Twice a day (5 AM + 5 PM ET): scores, rosters + moves,
  Coach/Survivor/highs, feedback digest, health; Claude writes short card lines after each run (commish picked AI lines + twice daily).
  The classic Pulse keeps going until go-live but publishes itself (no PR); it retires at go-live. §10g.
- 2026-11-06 · **Beta kit built** (backend v0.18): beta = Owners `beta` column (commish always), toggled from the desk. Feedback → Feedback tab + desk log; prompts capped at 3/day; tap log → TapLog tab (never posted). Testers: nephews (Lower) + Joe or Ed (Upper).
- 2026-11-06 · **Weekly Pulse fully automatic** (commish): no Tuesday PR to review/merge; the robot publishes the week itself.
  The app is the live product (refreshing daily per owner); the Pulse is only its weekly data drop. Not built yet (REEL.md backlog).
- 2026-11-06 · **Rosters = ESPN, read by the backend** (`rosters` action, 30-min cache) instead of a generated rosters file in the
  repo: fresher, no commits for live data (§6b). Draft CSV stays for auction price + MAFFL history. Beta crew is Lower tier.
- 2026-11-06 · **Beta crew before go-live** (commish's plan, not built). Charlie, Sam and Ben (nephews, new members) test the MVP
  first, with beta-only in-app feedback (in-the-moment prompts + Feedback button) and a tap log. League-wide feedback after
  go-live is a separate, lighter loop. Details: REEL.md backlog "Beta feedback kit".
- 2026-11-04 · **Inbox cards are complete on their face** (commish: "see the full card" opened to almost nothing). No tap-through.
  Each card is built for its job: result = score bug + one line + chips (rank, streak, Elite 5, bench); up next = VS block +
  series + preview line; deadline = big countdown; Survivor only if you're alive or went out this week; division/race =
  just your rivals' rows. Cards are as tall as their story, centered, with a stacked edge when more are waiting.
- 2026-11-03 · **⏱️ 15-minute robot** (commish: keep building). Apps Script time trigger calls `tick()`; it only reminds, checks and
  reports into the desk (never approves or changes anything). Commish set DESK_KEY in both places; first robot card posted 11/3.
- 2026-11-03 · **Home = your inbox, not a feed** (commish: 16 cards was noise; less is more). At most **8 cards** a week, picked for
  you. **Needs you** cards lead and can't be cleared until handled: trade offers (any number fold into ONE card, a row each →
  its chat thread), commish desk, an unvoted Game of the Week. **Heads up** (deadline) and story cards are light: headline +
  one line, tap → full card in a sheet. ← → browses, **swipe ↑ clears** (remembered per week), "Inbox zero" at the end; Home
  tab shows the count. Picks: your result, your next game, new chat, ONE quiz, your Survivor status, your division/race.
  Hot & Not, full scoreboard, Credit board, other tier leave Home (League/Match). Supersedes the progress-bar reel below.
- 2026-11-03 · **📥 Commish desk** (commish): a chat room only the commish's login sees, first in Chat. Live **To do** on top
  (perks to approve, trades in review, passphrase requests, lockouts, ESPN steps, credit-sync trouble) with the action buttons
  right there; a log underneath where every robot and owner action that needs him posts a card. Passphrases are issued and
  owners unlocked from the app (no Sheet menu needed). Goal stated: **REEL as automated as humanly possible** (§10e map).
- 2026-11-03 · **Loading + speed** (commish: too many blank loading moments). One spinner style everywhere + a thin gold bar under the header whenever the league server is working (background polls stay quiet). The app opens as soon as the Pulse, credits and prizes are in; rulebook and the 375 KB draft CSV (rosters) load behind. The signed-in summary starts at launch and the phone shows its last copy until the fresh one lands; Match shows the last live score (< 2 h) while ESPN is asked. Backend v0.14: each tab read once per call (summary 14 → 7 reads) and summary/inbox skip the script lock, so owners stop queueing behind each other. Watch: the loader caches `logic.js` only under 95 KB (now ~60 KB).
- 2026-11-03 · **Inbox simplified** (commish): no Chats / @ Mentions tabs, just Group chats and Direct messages.
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
| 🏠 Home | **Home IS the reel** (commish 11/2) | One card stack fills the screen. **Your inbox** (11/3): up to 8 cards; Needs-you cards first (stay until handled, trade offers folded into one); light story cards, tap for the full card; ← → browse, swipe ↑ to clear; Inbox zero. |
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
- Server side: peppered passphrase hash in the Sheet; phones hold a device token; every write checks it. No automatic
  lockouts (Journal 11/7): wrong guesses pause sign-in for an hour instead.

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
   **11/9:** + DMs/@mentions (off; one email per person per chat per 30 min) and 📣 commish announcements (**on** by
   default, sent with every desk alert); All on / All off; Settings takes up to 2 emails. Sender = the Apps Script
   (MailApp, from the commish's Gmail) on the matching write; not Claude, not GitHub. Push/SMS parked.

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
- **Messages:** text up to 500 characters, @mentions (tap @, pick an owner; highlighted in the message, count toward unread), emoji reactions
  (🔥😂💀👀👏, who reacted). Delete your own; commish deletes any and pins up to 3 per room. Trade cards can't be deleted.
- **Fresh enough, not instant.** An open thread refreshes every 8 s; unread counts every 30 s and when the app comes back.
- **Not yet:** robot posts for Pulse drops and Coach of the Week, older-message paging (keeps the last 150).
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
- Passphrases: two football words + 3 digits (GRONK-PISTOL-427; older two-word ones still work), case/spaces/dashes ignored; peppered HMAC-SHA256 (older: salted SHA-256); phones keep a device token; wrong guesses pause, never lock (Journal 11/7).
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

### 10d. 📥 Commish desk (built 11/3, backend v0.15)

**Where.** Chat → first row, "Commish desk" (room `desk`, only `is_commish = Y`; the server refuses anyone else). A For-you reel card
("N things waiting on you", with the list) leads Home whenever something is open. Deep link `lab/#chat=desk`.

**Top of the room = To do, computed live** (backend `desk` action + the signed-in summary), each with its buttons:

| Section | Source | Buttons |
|---|---|---|
| 🎟️ Perks to approve | Perks tab, REQUESTED | Deny (reason) · Approve (same confirm as Team → Credits) |
| 🤝 Trades in review | Offers, ACCEPTED | Negate (reason) · Approve |
| 🔑 Passphrase requests | Requests tab, OPEN | Dismiss · **Issue passphrase** → shown once + 💬 Text it / ✉️ Email it (prefilled, from your phone) |
| 🔒 Locked out | Owners, locked = Y | Unlock · New passphrase |
| 🏈 Do on ESPN | Approved perks without an `espn_done` event | Open ESPN · ✓ Done (logs it) |
| 💳 Credit sync | LAST_SYNC failed | Re-send ledger |

Plus a folded list of owners without a passphrase yet (Issue buttons, for go-live day) and a status line (backend version,
credits TEST/LIVE, last ledger push).

**Below = the log.** MAFFL HQ posts a card when: a perk is requested or canceled · a trade is accepted (review) · someone asks for a
passphrase · an owner locks himself out · 25 wrong guesses pause sign-in · a ledger push fails · ESPN refuses the cookies (once per 6 h) ·
a robot finishes. You can type notes to yourself there. Unread counts ride the Chat tab like any room.

**Robots → desk.** `desk-notify.yml` runs after ESPN weekly pull, Pulse draft and Credit sync and posts ✅/❌ + a hint + a run link
(backend `botpost`, guarded by a shared key). **Setup (commish, once):** the same random string as GitHub secret `DESK_KEY` and Apps
Script property `DESK_KEY`. Without it the workflow skips quietly. Any other robot (a Claude scheduled task, a future Apps Script
trigger) can post the same way.

### 10e. Automation map: every commish duty → who does it (11/3)

| Duty | Today | Target |
|---|---|---|
| Weekly Pulse | ✅ Robot drafts PR (Tue), Claude scheduled task kicks it off; you merge | Desk card when the PR is up (✅ desk-notify) |
| Credit perk requests | ✅ App request → desk → approve → credit sync robot → Credit_Log, credits.html | Same, LIVE at go-live |
| Trade credit legs | ✅ Offer → accept → desk review → approve → credit sync | Same |
| Passphrases / lockouts | ✅ Desk (issue, text, unlock) | — |
| ESPN side of perks (FAAB, DPB adjustment, swap) | Desk checklist, you do it on ESPN | §10b ESPN writes: robot does it, desk shows the read-back |
| Ghost weekly score | Manual on ESPN | §10b, first experiment |
| Weekly-high credit, season awards | By hand in Credit_Log | Tuesday robot writes ledger rows; desk "approve" card first season |
| Trade player side on ESPN | Owners | Desk reminder until the 30-min ESPN refresh sees the move (§6b, needs Apps Script trigger) |
| Dues | Hand-logged | Desk card per unpaid owner near deadlines; Venmo/notes stay manual |
| Key dates / deadlines | Pulse strip | Desk heads-up 24 h before each perk / trade deadline (needs trigger) |
| Robot failures | You find out late | ✅ desk-notify ❌ cards |
| Nightly reconciliation | — | Ledger vs Credit_Log vs credits.html; desk card only on a mismatch (needs trigger) |

### 10f. ⏱️ The 15-minute robot (built 11/3, backend v0.16)

`Code.gs` has `function tick() { logic_().tick(); }`; a time trigger runs it every 15 minutes. Each job runs on its own (one failing
never stops the others), posts each thing to the desk **once** (Script property `TICK_SENT` remembers), and never approves, denies or
changes anything.

| Job | When | What it does |
|---|---|---|
| Perk nudges | every run | A request waiting 12 h → "⏳ has waited N hours". A Double Bonus / Matchup Swap still waiting with < 6 h to its lock → "⏰ locks in N hours" |
| Review over | every run | Accepted trade past its 24-hour review → "approve or negate it" |
| Trade deadline | every run | 24 h before → a desk note (with how many offers are open) and one heads-up in League chat |
| Players moved on ESPN? | every 30 min, 8 AM–midnight ET | Reads both tiers' ESPN rosters for accepted/approved trades with players. Moved → logged + "✅ moved" note (the To do shows it next to the trade). Not moved 24 h after the offer → one reminder in the two owners' DM + a desk note. Team names must match ESPN's |
| Nightly credit check | first run after 3 AM ET | Backend ledger vs the repo's ledger file (did every push land?); LIVE also vs Credit_Log `[app L-…]` tags. Quiet when it all matches |

The desk shows **⏱️ 15-minute robot · Last ran N min ago** (⚠️ if > 1 h) with a **Run it now** button (`deskact` op `tick`).

**Setup (commish, once):** in the Apps Script editor paste the new `Code.gs` (or just add the `tick` line), Save; then ⏰ Triggers →
Add Trigger → function `tick` · deployment **Head** · event source **Time-driven** · **Minutes timer** · **Every 15 minutes** → Save
(Google asks to allow it once). No redeploy: triggers run the saved code; the web app keeps its own deployed version.

**Was the unlock for the "needs trigger" rows:** Apps Script time triggers must call a function in the bound loader, so `Code.gs` needs
one more line (`function tick() { logic_().tick(); }`), pasted once by the commish, plus a 15-min trigger. Until then, GitHub Actions
or a Claude scheduled task can hit the web app on a schedule instead (Actions schedules run late, so not for anything time-critical).

### 10g. 🌅 Daily run: in-season mode (built 11/6, backend v0.19–0.20)

Replaces the weekly Pulse inside REEL. Code: `_ops/apps-script/daily.js`, loaded by `logic.js` `need_("daily")` (fetched from
main, cached 5 min, evaluated in logic's scope; no Code.gs change; pushing daily.js = deploying it).

- **When:** from the 15-minute `tick` once per slot (5 AM and 5 PM ET), outside the script lock; or desk → 🌅 Daily run → Run it now.
- **What:** (1) both tiers' schedule from ESPN → records (final weeks only), PF/PA, streaks, last 5, all-play, Survivor (single lowest
  real score per final week), weekly highs; (2) Coach of the Week per final week, computed once and kept (best-lineup bench gap; bye,
  empty slot or 0-pt starter = out); (3) fresh rosters → adds / drops / trades vs the last run → Moves tab; (4) beta digest (feedback +
  taps since the last run); (5) health: trouble → one desk alert. A desk post only when there's news.
- **Where it lives:** Daily tab (key → JSON: `snapshot`, `coach_U/L`, `roster_ids_U/L`, `lines`), Moves tab, Script property
  LAST_DAILY (shown on the desk). GET `?action=daily` = snapshot + 7 days of moves + lines + run info (league-public).
- **Card lines:** after each run the backend fires GitHub `repository_dispatch daily-lines` (GITHUB_TOKEN Script property) →
  `card-lines.yml`: Claude follows `_ops/docs/CARD_LINES_RECIPE.md` (tier headline/hot/cold/coach/survivor/wire, each owner's
  result + next), checked, posted back via `putlines` (DESK_KEY). No commits. Fails → desk alert; cards show plain facts.
- **App:** reads the daily view at launch (kept on the phone). When it has a final week the Pulse doesn't, the app builds that week
  from it in the Pulse's shape (standings sorted record → credits → points; divisions from the last Pulse; next week's previews
  from schedule-data.js), so every screen moves on. Result / up-next cards use the card lines; 📰 Wire card shows moves.
- **Not yet:** credits from the daily run (still the last Pulse's numbers + the app ledger), Elite 5 / credit-award races / news
  reel (Pulse-only today), offseason mode, the official gold history append (stays the Tuesday GitHub robot, self-merging).

### 10c. Other jobs to automate (queue)

- Approved trade → player side reminder until ESPN shows the move (backend checks rosters in the 30-min refresh, §6b).
- Perk ESPN to-do list for the commish (until 10b exists): each approved perk lists the ESPN step with a "Done" tap.
- Weekly: Highest Weekly Score credit and season-end awards written to the ledger by the robot instead of by hand.
- Nightly reconciliation: ledger vs Credit_Log vs credits.html vs Owners Sheet; email only on a mismatch.

