# Dues → Ledger: season rollover design (decided 2026-09-03)

<!-- Migrated from claude.ai Project doc claude/DUES_LEDGER_DESIGN.md on 2026-09-27. This repo copy is now canonical. Implemented: prize.html uses dues_seasons. -->

## The problem
`prize.html`'s Dues tab is a live tracker for one hard-coded year (`dues_2026`).
Once 2026 settles it stops being a tracker and becomes history — but there is
nowhere for it to go, and no shape for 2027.

## The decision
The Dues tab becomes **one open season on top, a collapsed ledger underneath.**

- Live tracker at the top of the tab: unchanged look — "<year> Dues Status" with the
  Pay Commish button inline on that line, summary chips, Owner / Owed / Status table.
- Below it, a divider titled **DUES LEDGER** — heading and rule only, no explanatory
  sub-line — then one collapsed `<details>` row per closed season, newest first.
  Summary line: `2026 · SETTLED · 21 of 21 paid · $1,774 collected · closed Sep 2026`.
  Expanded: Owner / Dues / Paid (method + date with year), plus a season total footer.
- Rejected alternatives: a Current/Ledger sub-tab pair (cleaner, but buries prior
  years behind a tap with no visual cue anything is there) and a year-pill selector
  (reads like a tracker, not a record book).

## The data shape
`dues_2026` (flat array) is replaced by `dues_seasons` (array of season objects):

    "dues_seasons": [
      {"year":2027,"status":"OPEN","rows":[],"note":"Amounts TBD following the 2026 season."},
      {"year":2026,"status":"SETTLED","closed_date":"2026-09-07","rows":[ ...owner rows... ]}
    ]

Owner row: `{owner, amount, owed, status, paid_date, method}` — `amount` is new
(dues assessed, from `Dues_Log.csv` Obligation rows) and is what makes an archived
season worth reading; `owed` alone is all zeros once a year closes.

**`status` alone decides where a season renders.** `OPEN` → live tracker at top
(empty `rows` renders a "Not open yet / amounts TBD" card). `SETTLED` → collapsed
ledger row. Rolling a season over is therefore a data edit, never a markup edit:
flip the closing season to `SETTLED`, add a `closed_date`, prepend the new `OPEN`
season; fill its rows when amounts are set.

## Payments: one button, unchanged
The Pay Commish (Venmo) button stays as it is and stays inline with the season
heading. It renders in **every** state, including a season whose amounts are not set
yet — a mid-season payment can come due at any time, and a button that disappears for
eight months is one people stop looking for. The only mobile change is shrinking the
h2 to 18px and the button to 13px under 768px so the two hold one line down to ~360px.

An "Other Ways to Pay" second button — a panel with tap-to-copy Zelle tokens, check
and cash instructions — was prototyped 2026-09-03 and **scrapped** as clutter.
Zelle payments still get their `Zelle · <date>` stamp on the roster row; owners who
need a non-Venmo route ask the Commish directly. Do not re-propose it.

## 2026 season: closed 2026-09-07
21 owners · assessed $1,774 · collected $1,774 · outstanding $0. Final two payments
were Dan Reilly ($80) and Chris Johnson ($100), both Venmo on 9/7; Todd Trozzo paid
9/3, Tony Brooks and Dominic Nicastro 9/6. Payment mix across the season: 5 covered
by 2025 prize winnings, 13 Venmo, 1 Commish (Braiden Snyder, HS graduation), 1 check
(Brian/Ron Murello), 1 Zelle (Bob Keslar). 2026 is the first season in the ledger.

## Build-system caveat
`gen-prize.ps1` emits the old flat `dues_2026` array with only `{owner,owed,status}`.
Renaming the key does not make that worse in practice — per
`_ops/docs/DUES_PROCESS_NOTE.md` the build already must not be run for dues changes —
but after this lands the generator's dues output is structurally incompatible, not
merely lossy. If `gen-prize.ps1` is ever pointed at `Dues_Log.csv` (the open decision
in that note), it should emit `dues_seasons` directly: `amount` from the Obligation
row, `owed = Obligation − Payments`, `status`/`paid_date`/`method` from the latest
approved Payment, and `status:"SETTLED"` for any season whose owed total is 0 and
which is not the active year.

## Handoff
The original Claude Code prompt was `claude/PROMPT_dues_ledger.md` (executed; retired with the
2026-09-27 ops cleanup).
