# REEL card series — the catalog

Last updated: 2026-11-07 (chat) · v1.1 · Owner: commissioner (Mike)

The reel is built from **series**. A series is a family of cards with one job (your result, Coach of the Week,
a throwback...). This page is where we plan them: what each series is, who sees it, how often, who writes it, and how
many slots it gets. The app follows this page (`lab/index.html` → `SERIES`, `BUDGET`, `FEED_ORDER`); change both
together. Mark it up freely: strike things, add ideas at the bottom.

## How the reel works (decided 11/7)

- **A feed, not an inbox.** Swipe up for the next card, down to go back. Nothing gets deleted. The reel ends with
  "You're caught up". The Home badge counts cards you haven't seen yet, plus things that need you.
- **Needs you** sits in a strip above the feed. It holds only items you have to act on (trade offers, the
  commish desk, dues). Tapping it opens them all in one sheet. These are outside the budget.
- **Weekly issue.** Tuesday's data drop makes the week's issue; the daily run updates it during the week. Replaying
  an older week (League → Weeks) shows that week's issue.
- **Budget, not a cap.** Each group gets slots; series inside a group compete by rank. The feed then interleaves the
  groups so it never runs five league cards in a row.

### Weekly budget

| Group | Slots | Purpose |
|---|---|---|
| ⚡ Needs you | all (strip) | Things to act on |

Off-season (no games that week): Your week 3 · League week 3 · Play 3 · **Vault 6** (three throwbacks + three 8 Balls).
| ⭐ Your week | 5 | About you: your game, your race, your chats |
| 🏟️ League week | 5 | What happened, league-wide or your tier |
| 🎯 Play | 3 | Quizzes, polls, Game of the Week |
| 🗄️ Vault | 2 | League history, one bite at a time |

"You're caught up" ends the feed, then lists earlier weeks (tap → that week's reel, with Back to this week).

Feed order: you · you · league · play · league · vault · you · league · play · league · you · vault · play · league · you,
then anything left inside the budget.

## Card types (what every card is)

- **Audience:** `me` (team tag, no reactions) · `tier` (crest + Upper/Lower, shared reactions) · `league` (crest, shared reactions).
- **Interaction:** read + react · play (quiz / vote, results after you answer) · act (Needs you).
- **Writer:** data (computed in the app) · robot (Claude card lines after the daily run) · commish (hand-written, in a CSV).
- **Lifespan:** week (gone with the next issue) · until handled (Needs you) · rotating pool (one per week from a set).

## The catalog

### ⚡ Needs you (strip)

| Series | id | Audience | When | Writer | Status |
|---|---|---|---|---|---|
| Trade offers | `offers` | me | Until handled | data | Built |
| Commish desk | `desk` | commish | Until handled | data | Built |
| Dues | `dues` | me | While owed | data (prize.html dues) | Built |

### ⭐ Your week (5)

| Rank | Series | id | Audience | When | Writer | Status |
|---|---|---|---|---|---|---|
| 1 | Your result (bullets, box score) | `result` | me | Weekly | data + robot line | Built |
| 2 | Up next (first meeting / top-3 clash) | `next` | me | Weekly | data + robot line | Built |
| 3 | Chats with new messages | `msgs` | me | When there are some | data | Built |
| 4 | Survivor (only if it's about you) | `surv` | me | Weekly | data | Built |
| 5 | Division / promotion race | `div` | me | Weekly | data | Built |
| 6 | The wire (moves in your tier) | `wire` | tier | Last 48 h | data + robot line | Built |

### 🏟️ League week (5)

| Rank | Series | id | Audience | When | Writer | Status |
|---|---|---|---|---|---|---|
| 1 | Key date heads-up | `deadline` | league | Inside lead window | data (Key Dates CSV) | Built |
| 2 | Tier headline (🔥 hot / 🧊 cold) | `tier` | tier | Weekly | robot | Built |
| 3 | Coach of the Week (both tiers) | `coach` | league | Weekly | data | Built |
| 4 | High scores (both tiers) | `high` | league | Weekly | data | Built |
| 5 | Elite 5 (your line on a shared card) | `elite5` | league | Weekly | robot | Built |
| 6 | Credit races | `credits` | tier | Weekly | data | Built |
| 7 | The other tier in one look | `other` | league | Weekly | data | Built |

### 🎯 Play (3)

| Rank | Series | id | Audience | When | Writer | Status |
|---|---|---|---|---|---|---|
| 1 | Game of the Week vote | `gotw` | league | Weekly | data | Built |
| 2 | Polls | `poll:*` | league or tier | When the commish posts one | commish (desk) | Built |
| 3 | Quizzes (top score, bench blunder, Survivor…) | `quiz:*` | league | Weekly | data | Built |

### 🗄️ Vault (2)

| Rank | Series | id | Audience | When | Writer | Status |
|---|---|---|---|---|---|---|
| 1 | Throwback (a past season) | `throwback:YYYY` | league | Weekly, rotating pool | commish line + data | Built (lines drafted, commish editing) |
| 2 | 🎱 8 Ball (tidbits, reborn) | `tidbit:*` | league | Weekly, rotating pool | commish (`data/MAFFL_Tidbits.csv`: hook + line + player/position) + data (price history chart) | Built: 25 drafted, commish editing |
| 3 | This week in MAFFL history | `history` | league | Weekly (same week number) | data | Planned |
| 4 | What would you pay? | `pay` | league | Rotating | data (auction archive) | Planned (play-style quiz) |
| 5 | Name that team | `names` | league | Rotating | data (team-name history) | Planned |
| 6 | Meet the owner | `owner` | league | Rotating, one owner a week | data + commish line | Planned |
| 7 | Records watch | `records` | league | When someone is close | data | Planned |

## Rules of thumb

1. A new series needs: an id, a group, a rank, an audience, a lifespan and a writer. Add it here first.
2. One card per series per issue (pools rotate weekly).
3. League and tier cards never say "you" in the headline. Your own angle goes in a line or chip (Elite 5 is the model).
4. No rule explanations on cards. Everyone knows the rules.
5. Hand-written lines live in a CSV in `data/` (like `MAFFL_Throwbacks.csv`), never in code.

## Open questions

- Decided 11/7: the Vault grows in the off-season (6 slots); "You're caught up" lists earlier weeks (tap one to replay its reel); the 8 Ball's items were rewritten as hand-kept tidbits.
- Player names aren't unique (two Josh Allens, several Mike Williamses, two Adrian Petersons): anything keyed on a player must use name + position.
