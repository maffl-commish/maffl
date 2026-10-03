# MAFFL HQ — Status

_Read first. Keep it short. Newest entries on top in each section._

**Last updated:** 2026-10-03 by Claude (code), Rivalry v2.0 live + home What's New slide

## Now

- **ESPN history inventory ✅ (9/30).** Report: `_ops/inbox/MAFFL_ESPN_Inventory.md` (raw zip is git-ignored: private, keep local). ESPN has Upper 2005–2026 (results, drafts, weekly starters; bench only from 2018) and Lower 2025–26. Old message boards are gone (1 LM note per season survives); no Coach of the Week posts. Next, when wanted: check gold 2005–2025 against ESPN (would settle the quarantined-CSV swaps below).
- **Coach of the Week is back (bragging rights, from Week 4).** Fewest points left on the bench, per tier; a bye, empty slot or 0-point starter knocks you out. ESPN pull v0.5.1 computes it plus 🔄 Could have won (lost by less than you left on the bench) (OUTPUT 2e), editorial §8b, recipe v0.3 (chat, 9/30). Page card ✅ (`weekly.html` v6.3).
- **Weeks 1–2 validated vs ESPN (9/30):** gold, `matchups-data.js` and the Pulse all match ESPN's current scores.
- **Weekly robot ✅ live (9/30).** One-pager: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`. Connection test passed end to end (data job → Claude → PR). Rehearsal ✅ (9/30): full chain ran, REHEARSAL PR opened, an `@claude` comment revised it, PR closed unmerged. Still unproven: a run with no manual start (first = Tue Oct 6). **Habit: GitHub Desktop Fetch/Pull before starting work.** **Merge each Pulse PR before the next Tuesday.**
- **Week 4 Pulse (Tue Oct 6) = the robot's first real draft.** Review the "Weekly Pulse: Week 4 draft" PR, comment `@claude …` for changes, Merge to publish. Fallback: draft in Cowork chat from `_ops/inbox/`. After one good Tuesday, retire the Results Engine, screenshots and `CAPTURE_SYSTEM_PROMPT.md`.
- **LM to-do:** set ESPN 👻 scores to Wk 1 151.28, Wk 2 138.02 (Wk 3 already shows 151.47 per the ESPN pull). Delete this line once done.
- **Season:** 2026, Week 4 in progress. Weekly Pulse is live through Week 3 (`weekly.html` v6.3).

## Queued prompts (in `_ops/prompts/`)

- (none)

## Planned (not written yet)

- **Rivalry, next wave:** Defining Moments cards + upset flag (record entering the game); Tale of the Tape (needs a governance call on career-stat source); shareable rivalry card image (canvas PNG → iOS share sheet); MAFFL's Best: Nemesis / Punching Bag, per-owner heatmap row, player "rivalry killers" (2026+ from Top Performers). Commish hand-written notes: dropped.

## Open decisions / known issues

- **Data-through pill on weekly.html + power-rankings.html** (both read matchups-data.js), at their next edit (CLAUDE.md rule).
- **Build is unsafe for dues.** `gen-prize.ps1` emits the old `dues_2026` shape and would wipe
  pay stamps. Hand-edit `dues_seasons` in `prize.html` until the generator reads
  `Dues_Log.csv`. (See `_ops/docs/DUES_PROCESS_NOTE.md`.)
- **Page generators have drifted from their pages.** build check-only (9/29): stats/history/draft/credits report differences vs the live pages (hand edits since June), and gen-prize aborts because the `dues_2026` marker is gone. Never run `build.ps1 -Write` until each is reconciled.
- **Quarantined cleaned_maffl_revised.csv is still read** by validate Gates 1 (champ flags) + 7 (names), gen-history (csv-seasons embed) and gen-draft (CHAMPS). It has 3 swapped 2015/2022/2024 results and 5 mis-owned seasons (Warren Brownies 2011–13, Daddy Fat Sacks 2006–07). Repoint to gold per governance §7.3 before the robot runs generators unattended.
- **`Dues_Log.csv` is at repo root, not `data/`.** Open: move it and point `gen-prize.ps1` at it.
- **Old repo copy at `Desktop\MAFFL`.** After the hook fix, nothing depends on it. Archive or
  delete it by hand once cleanup is committed.

## Recently shipped

- 2026-10-03 · Home What's New: Draft slide retired; new slide 2 "⚔️ Your League, Live Every Week" → rivalry.html.
- 2026-10-03 · Rivalry v2.0 live: scoreboard + accordions, Week N Rivalries card (auto-advances after each ingest), This Week strip + stakes lines. Reads schedule-data.js.
- 2026-10-03 · Rivalry v2.0 part 1 (committed, not pushed): scoreboard hero, Pulse-style accordion sections (Recent Form open), Last 5, Series Lead chart, 12px type floor, picker collapses after a pick; rating recency anchored to last complete season.
- 2026-10-03 · Rivalry upgrade 1/3: data/MAFFL_Schedule_2026_Lower.csv (one-time ESPN extract, Wks 1–3 match gold) + build/generate-schedule-data.ps1 → schedule-data.js (both tiers); governance §2 rows. No page changes.
- 2026-09-30 · Rivalry: 2026 divisions/tiers added (gold Division_History alignment rows + DIVISION_DATA); runtime "Data through YYYY Wk N" pill; governance CE-9 "New season begins" + G-9; CLAUDE.md data-freshness pill rule
- 2026-09-30 · Sweep audit fixes: pulse-draft won't draft week W until W−1 is in gold (emails instead; merge each PR before the next Tuesday); retry = "Re-run failed jobs"; CLAUDE.md robot section; runbook + governance refreshed (build is check-only, no cleaned_maffl as a source, dues_seasons, robot CE-1); _ops README map. Audit: _ops/AUDIT_2026-09-30_sweep.md
- 2026-09-30 · Rehearsal findings fixed: pulse-draft allows the github-actions bot (Claude had refused a bot-started run); ESPN pull now tries Tue 1:17/2:47/4:13/5:37/7:23 AM ET + Wed backstop (the one-off 6 AM schedule ran 6 h late). Re-run Actions → Rehearsal to confirm.
- 2026-09-30 · Rehearsal workflow + pulse-draft rehearsal mode; recipe v0.4 (full draft as readable text in the PR). Week 3 rehearsal scheduled Wed Sep 30 6:00 AM ET: expect a "REHEARSAL: Week 3 redo" PR to review on the phone, then close.
- 2026-09-30 · Coach of the Week is back (bragging rights): ESPN pull v0.5.1 computes fewest points left on the bench per tier + 🔄 Could have won (OUTPUT 2e); Pulse v6.3 card; editorial §8b; robot recipe v0.3. First appears Week 4.
- 2026-09-30 · Weekly robot live: Pulse-draft connection test passed (Windows data job + Linux Claude job + PR). Automation plan rewritten as a one-page guide
- 2026-09-29 · Pulse-draft robot: data job ✅ and Claude ✅ on test #3; final push failed on expired action token, fixed by resetting git auth to GITHUB_TOKEN. Re-run the connection test.
- 2026-09-29 · Pulse-draft robot split: Windows job (ingest_week.py → CE-1 → validate → facts) + Linux Claude job (writes Pulse, opens PR). First smoke test had failed: Claude action won't install on Windows.
- 2026-09-29 · Automation Step 4 installed: pulse-draft.yml (runs after the ESPN pull; Windows runner; opens "Weekly Pulse: Week N draft" PR), claude-mention.yml (@claude on PRs, owner-only), ROBOT_PULSE_RECIPE.md, pulse_facts.py (matches published Wk 3). Connection test pending.
- 2026-09-29 · validate Gate 2 now reads gold Matchups_Clean (Regular, 2005–2025); 34/34 owners match. validate: 8/8 pass. build check-only: validate 8/8, nothing written; stats/history/draft/credits report drift vs current pages; gen-prize aborts (`dues_2026` marker gone) before the final summary
- 2026-09-29 · Automation Step 2 ✅: repo secrets added; manual test run of `espn-weekly-pull` on Week 3 green/READY; report committed by the robot
- 2026-09-29 · Automation Step 2 installed: `.github/workflows/espn-weekly-pull.yml` (Tue 5 & 7 AM ET + Wed backstop) runs pull script v0.4 → `_ops/inbox/`. Needs secrets ESPN_S2 + SWID; first test run pending
- 2026-09-29 · Pulse Wk 3 waiver-time wording fixed; editorial guide §4 "Waiver times" rule; ESPN pull v0.3.2 lists waiver runs separately from real-time moves
- 2026-09-29 · Weekly automation Step 1 done: ESPN pull v0.3.1 matched Week 3 gold (scores, 👻, all 63 top-3s) and caught waiver bids the screenshots missed; Pulse Wk 3 Big Spenders corrected
- 2026-09-29 · ESPN pull Phase 1: `_ops/scripts/maffl_espn_pull.py` v0.2 (run in Google Colab; my workspace can't reach ESPN). Live Week 3 pull matched gold on all 11 games + Ghost par 151.47. Next: Week 4 via the script alongside screenshots
- 2026-09-29 · ESPN stat corrections applied to 2026 Wks 1–2 (17 rows); generator -CorrectSeason; CE-1a added; Pulse Wks 1–3 corrected
- 2026-09-29 · Capture prompt v2.2: prior-week score audit (needs re-paste into Results Engine)
- 2026-09-29 · Week 3 ingested (CE-1 + new data/MAFFL_Top_Performers_2026.csv) and Pulse Week 3 published; Week 2 preview Lower pairings corrected
- 2026-09-29 · Editorial guide §8: 3 Upper + 2 Lower featured games; pairings from schedules only
- 2026-09-23 · Weekly Pulse v6.2: 3 Upper + 2 Lower featured games in Week 3 preview
- 2026-09-23 · Weekly Pulse v6.1: tier accordions, inline rivalry link, credits in bracket
- 2026-09-23 · CLAUDE.md: version pill policy reset (none/minor/major, `VERSION:` line decides)
- 2026-09-23 · Weekly Pulse v5.0: sectioned news, Post-Season Picture, credit status
- 2026-09-22 · Week 2 matchups appended + downstream CSV regen
