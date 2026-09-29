# MAFFL HQ — Status

_Read first. Keep it short. Newest entries on top in each section._

**Last updated:** 2026-09-29 by Claude (chat)

## Now

- **Week 4 Pulse.** Run Week 4 screenshots through capture **v2.2** (re-paste
  `_ops/docs/CAPTURE_SYSTEM_PROMPT.md` into the Weekly Results Engine first). Paste the ESPN
  League Schedule page for **both tiers** with the screenshots. That feeds the new prior-week score
  audit. Lower schedule is on ESPN; don't derive it.
- **LM to-do:** set ESPN 👻 scores to Wk 1 151.28, Wk 2 138.02, Wk 3 151.47 (delete this line once done).
- **Season:** 2026, Week 4 in progress. Weekly Pulse is live through Week 3 (`weekly.html` v6.2).

## Queued prompts (in `_ops/prompts/`)

- (none)

## Open decisions / known issues

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

- 2026-09-29 · ESPN stat corrections applied to 2026 Wks 1–2 (17 rows); generator -CorrectSeason; CE-1a added; Pulse Wks 1–3 corrected
- 2026-09-29 · Capture prompt v2.2: prior-week score audit (needs re-paste into Results Engine)
- 2026-09-29 · Week 3 ingested (CE-1 + new data/MAFFL_Top_Performers_2026.csv) and Pulse Week 3 published; Week 2 preview Lower pairings corrected
- 2026-09-29 · Editorial guide §8: 3 Upper + 2 Lower featured games; pairings from schedules only
- 2026-09-23 · Weekly Pulse v6.2: 3 Upper + 2 Lower featured games in Week 3 preview
- 2026-09-23 · Weekly Pulse v6.1: tier accordions, inline rivalry link, credits in bracket
- 2026-09-23 · CLAUDE.md: version pill policy reset (none/minor/major, `VERSION:` line decides)
- 2026-09-23 · Weekly Pulse v5.0: sectioned news, Post-Season Picture, credit status
- 2026-09-22 · Week 2 matchups appended + downstream CSV regen
