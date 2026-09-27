# Dues updates — how they actually work (discovered 2026-09-03)

<!-- Migrated from claude.ai Project doc claude/DUES_PROCESS_NOTE.md on 2026-09-27. This repo copy is now canonical.
     NOTE 2026-09-27: prize.html now uses `dues_seasons` (see DUES_LEDGER_DESIGN.md), not `dues_2026`.
     Where this note says "the dues_2026 array", read "the open season's rows in dues_seasons". -->

**Supersedes `MAFFL_HQ_DATA_GOVERNANCE.md` CE-7 and the runbook's "prize dues" row
until the generator is fixed.** CE-7 says to append to `Dues_Log.csv` and re-bake the
`prize.html` `dues_2026` array via the build. The code does not do that. Verified against
the live repo by Claude Code on 2026-09-03.

## What the code actually does

- `build/gen-prize.ps1:29` reads **`MAFFL League Packet - 2025 Prizes.csv`**, not
  `Dues_Log.csv`. `Dues_Log.csv` is referenced in **no** `.ps1` file.
- `Dues_Log.csv` lives at **repo root**, not `data/`. `Read-MafflCsv`
  (`build/maffl-lib.ps1:18`) resolves paths against `$DataDir`, so it could not be loaded
  even if a generator asked for it.
- The generator emits only three keys — `{"owner","owed","status"}`. It has **no**
  `paid_date` / `method`. Every PAID row on the live page carries both.
- The packet's `2026 Pay Status` column is **stale** — it marks PAID only for the five
  Prize-2025 owners.

### Consequence: DO NOT run the build to publish a dues change
`build.ps1 -Write` today would strip `paid_date`/`method` from every PAID row (killing all
pay stamps, since `payStamp()` returns `""` on `!d.paid_date`) and flip ~11 owners back to
UNPAID, undoing months of bookkeeping.

Separately, `build.ps1` currently **aborts in check mode** on a pre-existing **validate
Gate 2** failure (recomputed W/L/T vs. Owners_Sheet, incl. co-owner/solo split-attribution
mismatches). That blocks the publish loop for *any* change until resolved. Unrelated to dues.

## The working process for a dues payment (until the above is fixed)

1. Append a `Payment` row to `Dues_Log.csv` (repo root) — the ledger / audit trail.
2. **Hand-edit** the single owner's entry in the `dues_2026` array in `prize.html`
   (owed → 0, status → PAID, add `paid_date` + `method`). One line, nothing else.
3. Stamp `prize.html` per `CLAUDE.md`: bump the version pill, set Last Updated to today.
4. Do **not** run `build.ps1` / `gen-prize.ps1` for this change.

Chips (`prize.html:1493`) render at runtime from the array — never hand-edited.
`payStamp()` (`:1480`) lowercases `method` and handles: `venmo`, `prize-2025`, `commish`,
`zelle`, `check`; anything else falls through to a bare date stamp.

## Non-mirrors (nothing to sync)

Neither `2025 MAFFL League Status - Sheet1.csv` nor `MAFFL_Owners_Sheet_revised.csv` has a
dues or pay-status column. The only stale hand-maintained mirror is the Prizes packet's
`2026 Pay Status` column — which the generator treats as source of truth. That collision is
the root cause.

## Open decision (not yet made)

Point `gen-prize.ps1` at `Dues_Log.csv` per CE-7: `owed = Obligation − Payments`,
`status = PAID` when `owed <= 0`, emit `paid_date`/`method` from the latest approved Payment
row. That makes the log authoritative, reproduces all current PAID rows including stamps,
and demotes the packet's Pay Status column to derived. Requires also resolving the
root-vs-`data/` file location and clearing Gate 2 before anything can publish.
