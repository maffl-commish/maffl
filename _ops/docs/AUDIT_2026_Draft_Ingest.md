# 2026 Draft Ingest — Audit & Decisions

<!-- Migrated from claude.ai Project doc claude/AUDIT_2026_Draft_Ingest.md on 2026-09-27. Kept as reference: the "Second pass" and "Code debt" sections are a per-season checklist for the 2027 draft ingest. -->

Date processed: 2026-09-07. Revised 2026-09-10 (see *Second pass* below). Both tiers drafted Mon Sep 7, 2026 (Lower 8:00 AM, Upper 9:00 AM), salary cap format.

Deliverables: `MAFFL_2026_append.csv` (462 rows, gold schema), `crosswalk_additions.csv` (3 rows), `PROMPT_2026_draft_ingest.md`.

## What was ingested

| | Teams | Picks | Notes |
|---|---|---|---|
| Upper-Tier | 12 | 264 | all rosters exactly 22 picks / $200 |
| Lower-Tier | 9 | 198 | +1 excluded phantom roster (see below) |
| **Recorded total** | **21 owners** | **462** | matches 2025's 462 exactly |

Gold file goes 5,855 → 6,317 rows; era becomes 2005–2026.

## Decisions made (Mike confirmed)

1. **"Marco Clair Kardiac Attack" = David Murello.** The team name matched nothing in 2025. Resolved via two independent signals: "Kardiac Kids" was David Murello's team 2005–2023, and the owner count only balances to 21 if it's him. Recorded as a rename from "Kids BadBlood HighSchool".

2. **Nickname merges — canonical is the fuller form.** `Kenny Gainwell` → **Kenneth Gainwell** (3 prior picks, thru 2024); `Kam Curl` → **Kamren Curl** (1 prior pick, 2021). `Player_Raw` preserves the 2026 source string. Chosen to avoid rewriting historical rows.

3. **Justin Jefferson collision.** Sam Lavrinc took Justin Jefferson (CLE, LB) at Lower pick 216 — a different person from Justin Jefferson (MIN, WR), who has 6 seasons of history. Player profiles key on the name string alone, so the linebacker would have fused into the receiver's career page and corrupted his price history. The newcomer is recorded as **`Justin Jefferson (CLE LB)`**; the receiver is untouched in every year, including his two other 2026 buys.

   This is a **new crosswalk case**: unlike the existing father/son DO_NOT_MERGE pairs (Antoine Winfield Jr., Joey Porter Jr., Marvin Harrison Jr., Michael Pittman Jr.), where the two people already have distinguishable strings, here the source string is byte-identical for two unrelated players. Expect more of these as IDP depth grows.

4. **Southside Shooters → `Jon Fetrow / Casey Trozzo`** *(added in second pass)*. Casey Trozzo joined as co-owner of record for 2026 and `weekly.html` v2.0 already shipped with it. Recorded as a **new identity**, following MAFFL precedent — `Marcus Ruby` / `Marcus Ruby / Joe Ruby` and `Dominic Nicastro` / `Vincent Cavalier / Dominic Nicastro` both coexist. Requires a new `OWNERS[]` entry at index 34, **appended** (never inserted — every index in `PICKS`, `CHAMPS` and `SEASON_RECORDS` is positional). Accepted cost: Jon Fetrow's draft profile splits at 2026, the same tradeoff the existing partnerships carry.

## MAFFL Ghost — excluded from draft history

The Lower-Tier recap contained a 10th roster, "MAFFL Ghost": 22 picks of undrafted free agents, all `NFL_Team = FA`, with $179 dumped on one player to burn cap. It exists solely to let ESPN operate with an odd team count. **It is not a franchise and must never enter draft history.** Stripped before output; preserved separately in `MAFFL_2026_ghost_EXCLUDED.csv`.

This is an **intentional asymmetry**: the Ghost *does* appear in `weekly.html`'s Lower standings and on the schedule, because it occupies a real schedule slot and posts a computed score. It is excluded from draft history and from the survivor pool.

Standing check for future ingests: **no recorded draft row may have `NFL_Team == "FA"`.**

## Validation performed

- Pick numbers contiguous within each tier (Upper 1–264, Lower 1–220 incl. Ghost), no duplicates.
- No duplicate players within any roster. 186 players drafted in both tiers — expected, the tiers are independent leagues sharing a player pool.
- 206 of 264 Upper names matched an existing identity exactly; fuzzy last-name and near-match sweep run against all 5,855 historical names to catch identities hiding under a different first name (this is what surfaced Gainwell and Curl).
- Position-mismatch sweep against prior history flagged three: `Kamren Curl` DB→S and `DeMarcus Lawrence` DL→DE are the old coarse position buckets vs. the current granular ones (benign); `Justin Jefferson` WR→LB was the real find.
- 56 players are new to MAFFL history.

## Budget exceptions (correct, not errors)

Chris Johnson spent **$199** and Tony Brooks **$189**. Real leftover cap, legal in an auction, precedented by Bob Keslar's $180 in 2025 and Mike Murello's $199. Every other roster hit exactly $200.

## First real promotion/relegation

2026 is the first year the two-tier system actually moved anyone. Off 2025, a clean 3-for-3 swap:

- **Promoted to Upper:** Mike Murello, Jacob Nickman, Tony Trozzo
- **Relegated to Lower:** Bob Keslar, Chris Johnson, Todd Trozzo

Worth surfacing on the site — a genuine first for the league.

---

## Second pass (2026-09-10) — what a deeper `draft.html` sweep found

The first prompt covered four `draft.html` changes. A fuller sweep found three more that do **not** "just map in," plus cross-page effects. The prompt was rewritten to seven changes. Recorded here because each is a per-season landmine, not a one-time fix.

1. **The Superflex era button is pinned to a single year, in two places that must move together.** The markup at line ~2040 carries `data-min="2025" data-max="2025"`, and the `ERAS` array at ~8239 has `{ key: "modern", min: 2025, max: 2025 }`. The two are compared against each other to highlight the active button, so changing one alone breaks the highlight. **Left unchanged, clicking "Modern Superflex Era" filters to 2025 and hides the entire 2026 draft** — the most user-visible failure mode in the whole ingest.

2. **The Oracle's two-tier tidbit is hardcoded to 2025.** `splitPlayers2025` (lines ~8724–8727) filters `p[F_Y] === 2025` and renders *"A 2-Tier first: in 2025, X was drafted in BOTH leagues."* With 2026 in, the "first" claim is false and 186 qualifying players are invisible to it. Generalized to `p[F_Y] >= TIER_ERA_START`, keyed `player|year`, with the framing dropped.

3. **`ACTIVE_OWNERS` has reach well beyond tier pills.** Pinned to `OWNER_TIER_BY_YEAR[2025]`, it gates the Oracle's `dollarPicks`, `breakouts`, `oneTimeBig`, `expensivePlayers`, `ownersWithFav`, `ownersWithBigPick` and `loyalty` pools. Left stale, the new `Jon Fetrow / Casey Trozzo` identity is treated as an inactive franchise and vanishes from every one of those narratives. Now derived from the max year present in `OWNER_TIER_BY_YEAR`.

4. **Regenerating `draft-summary-data.js` silently changes `power-rankings.html`.** That page loads it and renders Most-Drafted Player, Favorite Position, and biggest-splash-by-position from it. Its Draft tab shifts without the file being edited — it needs its own stamp bump and a hardcoded "5,855-row" comment updated.

5. **Stale counts in `draft.html` metadata.** `<meta name="description">` says "5,855 picks across 21 seasons"; the meta pills still read v1.0 / July 1, 2026.

## Code debt this exposed

- **Per-year hardcoded objects in `draft.html` that fail silently.** `OWNER_TIER_BY_YEAR` has one key per season and `pickTier()` returns `null` for any unmapped year — a missing entry produces no error, just absent tier pills. `YEAR_MAX`, the era markup and the `ERAS` array are all hardcoded literals needing a manual edit every season. The structural fix is moving tier assignment into the data layer as a `Tier` column on the gold CSV and deriving the rest.
- **Owner-name drift on the join key — now three spellings.** `MAFFL_Team_History.csv` uses `Brian Murello/ Ron Murello` (no space before the slash); the draft CSV and `OWNERS[]` use `Brian Murello / Ron Murello`; `weekly.html` uses `Jon Fetrow/Casey Trozzo` with no spaces at all. Owner name is the join key across every file in the repo. 2026 draft output follows the draft/`OWNERS` spelling. **Unresolved — needs a separate normalization pass.**
- **"Ahead of the Game" has no tier awareness.** The $1–$5 in year Y vs. $25+ in Y+1 logic reads a cheap Lower buy followed by an expensive Upper buy as the market catching up, when it's two independent auctions. Latent since 2025; 2026 roughly doubles the surface. Deliberately not fixed in this change.

## Team renames / ownership changes for 2026 (`MAFFL_Team_History.csv`, separate task)

- David Murello: "Kids BadBlood HighSchool" → "Marco Clair Kardiac Attack"
- Todd Trozzo: "U-Town Fightin Ferrets" → "Fightin Ferrets"
- Southside Shooters: owner of record → `Jon Fetrow / Casey Trozzo`
