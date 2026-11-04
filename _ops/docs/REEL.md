# REEL — the new MAFFL HQ app (front door)

Last updated: 2026-11-03 (chat) · Match = scoreboard

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

Lab: `lab/index.html` (hidden, noindex). Backend: Apps Script loader `Code.gs` + `logic.js` **v0.12**, TEST Sheet.

| Area | What works today |
|---|---|
| Shell | Pinned header + tab bar, iPhone zoom/pan fixed, Home-Screen friendly |
| Sign-in | Two-word passphrase (GRONK-PISTOL), no team picker, 25 wrong/hour league limit, request-access email |
| 🏠 Home (reel) | Personalized order: ⭐ You → Division/Race → Hot & Not Q&A → Scores (Game of the Week vote) → Coach → Survivor → Wire → Credits → other tier. Quiz-first cards, one reaction tray per card + who reacted |
| ⚔️ Match | Just the scoreboard: live score from ESPN (backend `live`, 60 s auto-refresh, tap "↻ Ns ago" to pull now), ⚔️ Rivalry button between the teams, ESPN-style lineups (NFL team, opponent, kickoff, stat line). **✖️2 Double Player Bonus**: bonus score flashes gold with ×2 + player chip, doubled player highlighted. **🧪 Test scores** while ESPN is all 0 (opponent gets a pretend DPB; pill turns it off) |
| 🏈 Team | Trades end to end (all-rosters grid → side by side → live grade + reason chips → confirm → accept/decline/counter → commish approve/negate). Credits: balance, history, **perk requests** (Extra FAAB, Double Player Bonus, Matchup Swap, Relegation Insurance, Division Swap). Money: dues + winnings |
| 🏆 League | Standings, Weeks (time-travel any week), Rulebook in-app, Prizes, Champions; classic tiles for Power Rankings, History, Draft |
| 💬 Chat | Bottom tab (Home · Match · Chat · Team · League) with unread count → pull-up sheet; More lives behind your avatar. League chat, Upper/Lower Tier groups, DMs. Trade offers land in the DM as cards with live buttons; accepted → tier group, approved → league room. Reel "Trade talk" cards open the thread. @mentions, reactions, commish pin/delete (APP_DESIGN §4c) |
| ☰ More | **Settings**: your email + mobile, six opt-in emails (offer received / countered / accepted / declined, commish decision, perk decision), all off by default. Contacts only in the backend Sheet, shown to signed-in owners |
| Contacts + nudges | Owner panel shows Text / Call / Email. Every open offer has 💬 Text them / ✉️ Email them (prefilled from your phone, link to the offer); a heads-up box pops after Send, Counter, Accept, Decline. `#offer-ID` links open that offer |
| Panels | Owner panel and rivalry panel from any name/game; real rivalry page embedded (`rivalry.html?embed=1`) |
| Robots | Credit sync (`credit-sync.yml`): app approval → Credit_Log → balances → credits.html. TEST mode (dry run) |

## 3. Roadmap (to go-live — everything ships at once)

1. **Finish the sandbox** — backlog "Next" items below.
2. **Hook up for real** — GITHUB_TOKEN Script property; real ESPN live feed; real rosters (ESPN roster pull); lab week facts wired into the Tuesday robot.
3. **Mike's feel test** — full app on his phone (Home-Screen standalone), then a dry run: fake trades incl. negate, deadline lockout, over-balance block, wrong passphrase, undo.
4. **Go-live** — APP_DESIGN §9 checklist: production Sheet, test data wiped, CREDIT_SYNC=live, passphrases emailed, app becomes `index.html`, old home → League, Pulse announces it.

## 4. Backlog

**Next (decided, not built)**
- 💬 Chat follow-ups: opt-in email for DMs/@mentions (add a toggle to Settings), robot posts for Pulse drop + Coach of the Week, older-message paging (APP_DESIGN §4c).
- Guest "Just browsing" mode (§4).
- ESPN refresh on a rhythm via Apps Script trigger (§6b), "Updated N min ago" label.
- Real rosters from ESPN (replace draft-staged rosters).
- `gen_lab_weekfacts.py` added to the Tuesday robot.
- Remaining pages into the app: Power Rankings, History, Draft (§2c).

**Automation queue (§10c)**
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
- Offseason Home and Match.

**Known issues**
- _(none logged)_

---

### How REEL chats work
- Start the message with **REEL**. Claude reads this page + `APP_DESIGN.md`, then the real files.
- Work in `lab/` and `_ops/` only until go-live. Decisions → APP_DESIGN §0 Journal. Ships → STATUS "Recently shipped" with a **REEL ·** tag.
- When something moves (built, decided, dropped), update this page in the same commit.
