# MAFFL HQ — Status

_Read first. Keep it short. Newest entries on top in each section._

**Last updated:** 2026-09-29 by Claude (chat)

## Now

- **Week 4 Pulse.** Run Week 4 screenshots through capture v2.1. Lower schedule is on ESPN (League Schedule); don't derive it.
- **Ops cleanup.** Prompt queued: `_ops/prompts/2026-09-27_ops-cleanup.md`. Run it in
  Claude Code, review the diff, then commit.
- **Season:** 2026, Week 4 in progress. Weekly Pulse is live through Week 3 (`weekly.html` v6.2).

## Queued prompts (in `_ops/prompts/`)

- `2026-09-27_ops-cleanup.md`: .gitignore, remove committed backups, archive June docs,
  fix hook path, add ops section to CLAUDE.md. VERSION: none.

## Open decisions / known issues

- **ESPN scores for Lower Weeks 1–2 no longer match gold.** Probably stat corrections. The
  League Schedule page (pasted 2026-09-29) shows 11 of 18 real Lower Wk 1–2 team scores higher than
  gold, by 0.5 to 12.0 (e.g. Wk 2 Camp Kes 138.86 vs gold 126.86, Tommy Phamclub 198.92 vs 194.92).
  W/L and Survivor outs don't change. PF, Most Points and the Wk 2 👻 par (would be 138.02, not
  131.65) do. Upper hasn't been checked. Decide: re-capture Wks 1–2 and correct gold
  (the generator allows in-season edits), or freeze scores as captured. Week 3 scores match ESPN
  as of 2026-09-29, but Week 3 corrections may still post.
- **Build is unsafe for dues.** `gen-prize.ps1` emits the old `dues_2026` shape and would wipe
  pay stamps. Hand-edit `dues_seasons` in `prize.html` until the generator reads
  `Dues_Log.csv`. (See `_ops/docs/DUES_PROCESS_NOTE.md`.)
- **`build.ps1` aborts on validate Gate 2** (W/L/T recompute vs Owners_Sheet, co-owner split
  attribution). This blocks the full publish loop. Status unverified since 2026-09-03.
- **`Dues_Log.csv` is at repo root, not `data/`.** Open: move it and point `gen-prize.ps1` at it.
- **Old repo copy at `Desktop\MAFFL`.** After the hook fix, nothing depends on it. Archive or
  delete it by hand once cleanup is committed.
- Runbook §6 "Known open work (as of 2026-06)" needs a refresh.

## Recently shipped

- 2026-09-29 · Week 3 ingested (CE-1 + new data/MAFFL_Top_Performers_2026.csv) and Pulse Week 3 published; Week 2 preview Lower pairings corrected
- 2026-09-29 · Editorial guide §8: 3 Upper + 2 Lower featured games; pairings from schedules only
- 2026-09-23 · Weekly Pulse v6.2: 3 Upper + 2 Lower featured games in Week 3 preview
- 2026-09-23 · Weekly Pulse v6.1: tier accordions, inline rivalry link, credits in bracket
- 2026-09-23 · CLAUDE.md: version pill policy reset (none/minor/major, `VERSION:` line decides)
- 2026-09-23 · Weekly Pulse v5.0: sectioned news, Post-Season Picture, credit status
- 2026-09-22 · Week 2 matchups appended + downstream CSV regen
