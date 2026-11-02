# Trade Center — design note

> **Governed by `APP_DESIGN.md`** (the redesign's one governing doc). Record decisions there; this note holds trade detail.

VERSION: 0.2 (2026-11-02, chat) · Owner: commissioner (Mike) · Status: **idea / design only, nothing built**

## 1. Why

Sleeper's trade experience is what makes it great, and ESPN's isn't. MAFFL has something neither one has:
**credits can ride along in a trade.** Today owners handle that by sending a player trade on ESPN plus a
separate Credit Request form, and nobody can see who is shopping whom. A Trade Center on MAFFL HQ gives
owners a trade block, a Sleeper-style roster view, and offers that bundle players and credits, while the
commish keeps control over everything that touches gold.

## 2. Rules it must enforce (from `rules.html#trades`, nothing new)

| Rule | What the app does |
|---|---|
| Trades stay inside your own tier | Owners only see and trade with their own tier's teams. No cross-tier anything |
| Tradeable: players, plus credits as part of a player trade | Offer builder allows players + credits. **Every offer must include at least one player** |
| Not tradeable: draft/auction anything (MAFFL uses an auction draft; no pick trading), FAAB, dues, prize money, future considerations | No cards for these. Nothing to build |
| Balance must cover the trade; no negatives; credits committed to a perk aren't available | Offer is blocked if credits offered > available balance (balance minus pending offers and committed perks) |
| Deadline 12:00 PM ET Wed Dec 2, 2026 (from `key-dates-data.js`); no postseason trades | Offer and Accept buttons turn off at the deadline |
| 24-hour review after acceptance; credit trades are approved or negated as a whole | States: Proposed → Accepted (24h review) → Commish approved / Negated |
| Player leg runs on ESPN and doesn't wait on the commish | The app never touches ESPN. It shows "Now send this on ESPN" with the exact players |
| MAFFL Ghost doesn't earn credits | 👻 can't trade at all (commish 11/2): no column, no credits card |

## 3. Screens (copying Sleeper's layout, adapted)

1. **Trade Center home:** my open offers (in / out), the tier's trade block feed, the deadline countdown.
2. **Select Trade Partners** (from Sleeper's screenshot): my roster pinned on the left, the other tier
   teams scroll sideways, one column each, about 3½ columns visible at 390px. Column header: team, record,
   rank, ◯ select. Cards are colored by position and show position, NFL team, bye, name and age (if we
   have it). A white **TRADE BLOCK** banner on tagged players. ♡ = private watchlist (kept on the phone,
   no Sheet). **MAFFL extra: a 💳 credits card at the top of each column** showing the available balance.
   Sticky "Start Trade Proposal" button.
3. **Build offer:** what I send / what I get, a credits stepper (capped at my available balance), an
   optional note, and a rule check line ("✅ Within balance · ✅ Before deadline · ✅ At least one player").
4. **Offer detail** (receiver): Accept / Counter / Decline with a PIN.
5. **Commish queue** (Mike only): accepted credit trades waiting on approval → Approve / Negate.
6. **My trade block:** tag/untag my players, plus a one-line note ("selling QB, want RB").

## 4. Architecture

- **Site stays static** (GitHub Pages). New page `trade.html` (sandbox name `trade-lab.html`, see §6).
- **Google Sheet + Apps Script web app** (the Poppy pattern) is the only thing that saves input:
  tabs `Owners` (owner, tier, PIN hash, active), `Block` (owner, player, note, updated), `Offers`,
  `OfferItems`, `Events` (an audit log of who did what, when). The page posts plain JSON to the script.
- **Rosters:** a new small Action (daily, plus on demand) pulls current ESPN rosters for both tiers into a
  derived `rosters-data.js` (owner, player, pos, NFL team, bye, ESPN player id). The ESPN pull already reads
  rosters for Coach of the Week, so this reuses that code. Age only if ESPN's player data carries it; else v1
  skips it.
- **Credit balances:** today `credits.html` balances are **hand-copied** (governance flags credit balance
  as "at risk", with 3 copies). The Trade Center needs real numbers, so add a generator
  `Credit_Log.csv` → `credit-balances-data.js` (derived). This fixes the at-risk item on its own as well.
- **Gold is never written by the Sheet.** Approving a credit trade queues the two credit rows (−N giver,
  +N receiver, Credit Type "Trade", Approved?=Y). Chat or a small Action appends them to `Credit_Log.csv`
  in a normal commit (CE-4), regenerates balances, and the site updates. Same principle as dues: no
  owner-side "I paid" or "I'm owed" buttons.

## 5. Login: per-owner PINs

- The commish issues each owner a separate PIN by text. The Sheet stores only a salted hash.
- The PIN is entered once and remembered on that phone (it can be cleared with "Not me / log out"). The
  commish can reset any PIN.
- Every write (tag, offer, accept, approve) checks the PIN on the server side and lands in `Events`.
- Honest limit: this is shared-secret integrity, good for a league, not bank-grade. Credits only move
  after commish approval, so a leaked PIN can at worst create a bogus offer that gets negated.
- Lock out a PIN after 5 wrong tries (the commish unlocks it).

## 6. Bubble first: sandbox → go-live

| Phase | What | Who |
|---|---|---|
| 0 | This note; commish answers §8 | Mike |
| 1 | Test Sheet + script; `trade-lab.html` (no nav link, `noindex`) reading a **frozen copy** of rosters and balances | Mike + 1 tester, test PINs |
| 2 | Real `rosters-data.js` + `credit-balances-data.js` generators (useful on their own; balances replace the hand copy on credits.html) | chat |
| 3 | Dry run: a few fake trades end to end, incl. negate, deadline lockout, over-balance block, wrong PIN | Mike + tester |
| 4 | Go-live: point the page at the production Sheet, rename it to `trade.html`, add a nav link, text out PINs, announce in the Pulse | Mike |

GitHub Pages is public, so the lab page is hidden but not private. That's fine, because the test Sheet can't
touch real credits or gold.

## 5b. Guardrails (commish 11/2: "ultra careful" about interactions and data)

| Action | Guardrail |
|---|---|
| Reactions, votes, trade-block ♡ | No prompt (reversible; tap again to undo) |
| Send / accept / decline / withdraw an offer | **Confirm sheet** that repeats the exact deal, the rule checks, and what happens next |
| After any confirmed action | **Undo toast** (about 10 s) before it's written to the Sheet |
| Accepted trade | 24h review; credits move only after commish approval (gold via commit) |
| Commish approve / negate | Confirm sheet + reason field; every action logged in `Events` |
| Data | Sheet is append-only (`Events`); nothing deletes rows; gold is never written by the Sheet |

## 6b. Direction change (commish 11/2)

The Trade Center becomes part of the **MAFFL Reel**: a personalized, swipeable card feed alongside the base
site. Trade-block tags, offers, and accepted deals become Reel cards; the roster grid stays a full screen
opened from a card. Reel design note to follow.

## 7. Later (not v1)

Counter-offers with history; multi-team trades; a Pulse "Trade Wire" section (accepted trades of the
week, read from approved rows); push notifications (only through a group text for now; the site is pull-only).

## 8. Open questions for the commish

1. ~~Can 👻 trade?~~ **No** (commish 11/2).
2. ~~Visibility?~~ **Offers are private to the two teams until both agree.** Once accepted (in the 24h
   review / awaiting commish), the deal is visible to the whole tier. Trade-block tags are visible tier-wide.
3. ~~Replace the Credit Request form for trade credit legs?~~ **Yes** (APP_DESIGN §5).
4. v1 tier scope: both tiers at once, or one tier first?
