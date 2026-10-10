# MAFFL HQ — Status

_Read first. Keep it short. Newest entries on top in each section._

**Last updated:** 2026-10-09 by Claude (chat), gold fixed against ESPN (PR)

## Now

- **ESPN history inventory ✅ (9/30).** Report: `_ops/inbox/MAFFL_ESPN_Inventory.md` (raw zip is git-ignored: private, keep local). ESPN has Upper 2005–2026 (results, drafts, weekly starters; bench only from 2018) and Lower 2025–26. Old message boards are gone (1 LM note per season survives); no Coach of the Week posts. Next, when wanted: check gold 2005–2025 against ESPN (would settle the quarantined-CSV swaps below).
- **Coach of the Week is back (bragging rights, from Week 4).** Fewest points left on the bench, per tier; a bye, empty slot or 0-point starter knocks you out. ESPN pull v0.5.1 computes it plus 🔄 Could have won (lost by less than you left on the bench) (OUTPUT 2e), editorial §8b, recipe v0.3 (chat, 9/30). Page card ✅ (`weekly.html` v6.3).
- **Weeks 1–2 validated vs ESPN (9/30):** gold, `matchups-data.js` and the Pulse all match ESPN's current scores.
- **Weekly robot ✅ live (9/30).** One-pager: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`. Connection test passed end to end (data job → Claude → PR). Rehearsal ✅ (9/30): full chain ran, REHEARSAL PR opened, an `@claude` comment revised it, PR closed unmerged. **GitHub's Tuesday schedules DID fire on Oct 6, but every one ran ~6½–7 h late** (1:17 AM slot started 8:00 AM; last at 1:17 PM). Fix: a Claude scheduled task "MAFFL Tuesday Pulse kickoff" (Tue 5:07 AM ET) dispatches the ESPN pull, watches the chain, re-runs a transient failure once, and pushes Mike a phone report. GitHub crons stay as a backstop. First real test: Tue Oct 13. **Work happens in claude.ai chat now (push to main; "PR first" on request); the desktop copy is a backup.** **Merge each Pulse PR before the next Tuesday.**
- **Week 4 Pulse ✅** merged (PR #16) after a hand re-run (first unattended run hit a CRLF bug, fixed 10/6). After one good Tuesday (Oct 13), retire the Results Engine, screenshots and `CAPTURE_SYSTEM_PROMPT.md`.
- **Season:** 2026, Week 5 in progress. Weekly Pulse is live through Week 4 (`weekly.html` v6.3).

## Queued prompts (in `_ops/prompts/`)

- _(none)_

## Planned (not written yet)

- **Rivalry, next wave:** Defining Moments cards + upset flag (record entering the game); Tale of the Tape (needs a governance call on career-stat source); shareable rivalry card image (canvas PNG → iOS share sheet); MAFFL's Best: Nemesis / Punching Bag, per-owner heatmap row, player "rivalry killers" (2026+ from Top Performers). Commish hand-written notes: dropped.

## Open decisions / known issues

- **`rivalry.html` old static embed** says it came from `cleaned_maffl_revised.csv`; may still credit Warren Brownies 2011–13 to Jimmy Crisan. Not generated; check by hand.
- **History year cards on phones:** long owner names (e.g. Jon Murello/Rick Simmons) overlap the era pill (pre-existing).

## Recently shipped

- 2026-10-09 · Draft: the 3 held 2010 rows now follow ESPN (commish): David's Tulloch pick → Keith Bulluck (NYG) + added Rashad Jennings; Mike's Atogwe pick → Devin Aromashodu (CHI). Draft summary + draft/history pages regenerated (Build write).
- 2026-10-09 · **Gold fixed against ESPN (PR from `build-fix/espn-audit-games`).** Games: 5 corrected (2015 Wk5, 2022 Wk6, 2022 Wk13 ×2, 2024 Wk13) → 6 owners' career W-L (Owners Sheet, stats, power-rankings win%), Owner_Seasons, points, matchups-data.js. New CE-1b `-CorrectHistory` switch + Build write workflow did the regen (BUILD OK, proof re-run clean). history.html csv-matchups now generated from gold (adds 11 missing 2025 consolation games). Drafts: `rebuild_draft_from_espn.py` fixed 46 wrong players, 121 spellings, 509 positions (FLX → real), 3 owners, added 18 picks; 2006 left as is (ESPN lost picks); 3 rows for commish (2010 Tulloch, Atogwe). New `gen_draft_summary.py` regenerates draft-summary-data.js (round-trips old gold). Re-audit: games 100% match ESPN. Stamps: draft, history, stats, power-rankings (no version bump).
- 2026-10-09 · Build write workflow (`.github/workflows/build-write.yml`, Run workflow only, build-fix/* branches only): runs the CE-1 generator (optional `correct_history`) + `build.ps1 -Write` on Windows, re-checks both clean, commits the regenerated files to the branch. Lets chat regenerate derived data; merge the branch PR to publish.
- 2026-10-09 · Audit adds pick-level draft check (ESPN names): ~57 gold picks name the wrong player (surname guessed, e.g. Ed Reed as K, Evan Engram 2008), 18 missing, 3 wrong owner; 2006 gold beats ESPN. Gold game fixes on branch `build-fix/espn-audit-games` (Build check: Gate 2 fails as expected, generator lock blocks regen). Report updated.
- 2026-10-09 · Private ESPN raw archive (`_ops/inbox/MAFFL_ESPN_raw/` + `.zip`: message boards, member IDs) untracked; it had been committed to the public repo on 9/29 despite the ignore rule. Still in git history until purged (commish decision). Scripts that read it take a path.
- 2026-10-09 · ESPN draft history pull (Action, Run workflow only): `maffl_espn_drafts.py` v0.1 saves every 2005–2025 draft with player names to `_ops/inbox/MAFFL_ESPN_Drafts.json` (no board/member data), to name gold's 27 missing picks.
- 2026-10-09 · Gold vs ESPN audit (2005–2025): `_ops/scripts/audit_gold_vs_espn.py` + report `_ops/AUDIT_2026-10-09_gold_vs_espn.md`. All 2,726 games match ESPN; 5 bad games (3 wrong winners: 2015 Wk5, 2022 Wk13, 2024 Wk13) explain all 6 W-L diffs; drafts short 27 picks. No data changed yet.
- 2026-10-06 · Generator drift reconciled; **Build check: BUILD OK** (validate 8/8, season table + all 5 pages round-trip), so `build.ps1 -Write` is safe again. Generators compare line-ending-neutral (Windows CRLF was most of the "drift"). gen-stats learned third/pWins/pLosses (match gold for all 34 owners). Pages brought to gold: stats (Jimmy Crisan years 11→8, row order), history csv-divisions/csv-drafts (Marcus Ruby 2006–07, Vincent/Dom 2011–13, 42 position fixes, 2026 rows; no visible year-card change), draft (owner list order + 42 position fixes, e.g. Eli Manning QB). gen-draft now simply lists diffs and writes on -Write. Stamps: stats, draft (no version bump).
- 2026-10-06 · Quarantined `cleaned_maffl_revised.csv` retired: new `data/MAFFL_Owner_Seasons.csv` is generated from gold by `build/gen-owner-seasons.ps1` (2002–04 from hand-kept `MAFFL_Seasons_2002_2004.csv`) and feeds history csv-seasons, draft CHAMPS, validate Gates 1+7. Fixes the 3 swapped W/L seasons, 5 mis-owned seasons, 15 duplicate rows, 2 false division titles; adds 2005–12 division titles. Visible on History: 2007 champ shows ONE HOUSE DIVIDED (8–5), 2008 runner-up The Silver Bullets. Build check: gen-owner-seasons + csv-seasons round-trip, validate 8/8.
- 2026-10-06 · Dues: `Dues_Log.csv` moved to `data/`; `gen-prize.ps1` now generates `prize.html` `dues_seasons` rows from it (round-trips 2026 exactly, Build check CLEAN). Payments from chat: append the log row + hand-edit the page row, Build check proves they match. Docs updated. 👻 Wks 1–2 confirmed on ESPN (151.28, 138.02).
- 2026-10-06 · Build check workflow (`.github/workflows/build-check.yml`): runs validate + every `gen-*.ps1` + build.ps1 CHECK-ONLY on a Windows runner for any `build-fix/*` branch (or Run workflow); results in the run summary. Lets chat verify build\ script fixes.

- 2026-10-06 · Old `Desktop\MAFFL` copy archived by the commish; open issue closed.

- 2026-10-06 · Docs: chat-first workflow written down (CLAUDE.md "Chat sessions", _ops/README, runbook §5, automation plan: 5:07 AM kickoff task, no desktop Fetch/Pull step).

- 2026-10-06 · Coach of the Week card: winner per tier with a "See all N coaches" tap; Biggest lineup calls = 15+ pts or the call that cost the game (ESPN pull v0.5.6 tags COST THE GAME); "It's back" tag through Week 6 (`COACH_BADGE_THROUGH_WEEK`).

- 2026-10-06 · Coach of the Week card: per-tier winner blocks removed (the full ranking board replaces them); winners' missed calls now lead the Biggest lineup calls list. Collapsed preview still names both winners.

- 2026-10-06 · Coach of the Week card: "Every coach" board, every team's points left on the bench with a scored-vs-possible bar, per tier (coachOfWeek.board; Week 4 filled; recipe + checker). No VERSION line, so weekly.html stays v6.3.

- 2026-10-06 · Coach of the Week names the decisions: ESPN pull v0.5.5 MISSED CALLS (bench player the best lineup starts · over whom · cost); card shows each winner's "one that got away" + Biggest lineup calls (5); recipe + editorial §8b.

- 2026-10-06 · Coach of the Week hole redefined (ESPN pull v0.5.4): bye, empty slot, or a starter who didn't play (no stats that week). A starter who played and scored 0 (e.g. Rice hurt in Q1) is not a hole. Week 4: no change.
- 2026-10-06 · Coach of the Week knockout set to 4+ lineup holes (commish, for the expanded lineup; Week 4: nobody out). Earlier same day: 3+ lineup holes (bye, empty slot, 0-point starter), the pre-expansion rule; 1–2 holes stay in. ESPN pull v0.5.2 (`COTW_KNOCKOUT_HOLES`), editorial §8b, recipe, card footer; Week 4 out lists updated (winners unchanged). Story hooks no longer mention the old cash prize.

- 2026-10-06 · Pulse quality pass: (1) Week 4 Coach of the Week added to the page (robot listed it in the PR but never wrote it); (2) `check_pulse_week.py` checks the page itself (required sections, 11 games, coach matches OUTPUT 2e, 3+2 featured, reel size) and the workflow flags the PR ⚠️ when it fails; `@claude` fixes re-run it; (3) editorial §4a "Spread the wealth" + facts Coverage section (teams skipped in the last 3 Pulses, heavy teams, headline rotation); (4) facts v0.2 Story hooks for every team via `pulse_history.py` (series, streak snaps, best/worst start in years, 2025-era top-10 scores, career-win milestones, trophy case, old COTW counts); recipe 0.6.

- 2026-10-06 · Robot fix: CE-1 generator finds the matchups-data.js anchor on CRLF checkouts (first unattended run failed on it); ESPN stat corrections now auto-applied to gold by apply_corrections.py + generator -CorrectSeason; recipe 0.5 has the robot fix earlier Week objects' scores and list every change in the PR.
- 2026-10-03 · Rivalry v2.0 fixes: tiers start collapsed; tapping a game lands on the hero with every card closed; ‹ Week N Rivalries back button (and phone Back) returns to landing; Data-through pill + CLAUDE.md rule removed; compact one-line Show filter.
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
