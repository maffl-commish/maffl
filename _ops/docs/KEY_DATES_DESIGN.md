# Key Dates — design note

VERSION: 0.1 (2026-10-17, chat) · Owner: commissioner (Mike) · Status: **steps 1–2 built 2026-10-27** (see §10)

## 1. Problem

Owners read the Weekly Pulse every week but rarely go back to the home page or Rules & Info.
Deadlines therefore pass silently. 2026 example: Relegation Insurance closed before Week 4's
first kickoff (Thu Oct 1) and no Pulse mentioned it.

## 2. Decision: where each kind of alert lives

| Season phase | Where owners see it | Why |
|---|---|---|
| In season (Wk 1 → Wk 17) | **Weekly Pulse: "Key Dates" strip** | The one page everyone opens weekly |
| Offseason | **Home carousel** ("What's New") | No Pulse; home is the front door |
| Always | **Rules & Info → Annual Milestones** | The reference. Alerts link here; it is never the alert |
| Hard deadlines that cost something | **Group text from the commish** | The site is pull-only; a text is push |

## 3. One source: `data/MAFFL_Key_Dates_2026.csv` (new gold file)

Today the dates live as prose in two places that already disagree (§7). Alerts need real
timestamps, so add one small hand-kept gold file, one row per milestone:

| Column | Example | Notes |
|---|---|---|
| `id` | `trade-deadline` | Stable slug |
| `label` | `Trade deadline` | Short; shown in the strip |
| `due` | `2026-12-02T12:00-05:00` | ISO, ET offset |
| `kind` | `deadline` / `event` | Deadlines get "Last call"; events don't |
| `tier` | `All` / `Upper` / `Lower` | |
| `lead_days` | `21` | How early "Coming up" starts (default 21) |
| `note` | `No trades in the postseason.` | One line, optional |
| `link` | `rules.html#trades` | Rule that explains it |
| `nudge` | `yes` | Commish sends a group text for it (§6) |

Hand-kept gold, like `Dues_Log.csv`. Add a row to governance §2. A small Python generator in
`_ops/scripts/` writes `key-dates-data.js` (derived; never hand-edited) so both
`weekly.html` and `index.html` read the same data. Python, not `build\`, so chat can run it.

### Seed rows for the rest of 2026 (computed; commish to confirm)

Week N's Thursday kickoff = Sep 10 + 7·(N−1), checked against the Pulse dates (Wk 4 Pulse
Oct 6, trade deadline Wed Dec 2 after Wk 12).

| id | label | due (ET) | kind | nudge |
|---|---|---|---|---|
| `releg-insurance` | Relegation Insurance closes | Thu Oct 1, first kickoff | deadline | yes |
| `trade-deadline` | Trade deadline | Wed Dec 2, 12:00 PM | deadline | yes |
| `reg-season-ends` | Regular season ends (Wk 14) | Mon Dec 14 | event | no |
| `faab-reset` | FAAB resets to $100 | Thu Dec 17, before Wk 15 kickoff | event | no |
| `postseason` | Postseason begins (Wk 15) | Thu Dec 17 | event | no |
| `season-end` | Prizes + credits awarded | after Wk 17 (verify date vs NFL schedule) | event | no |

Offseason rows (division swap window, Labor Day Eve freeze, draft) are added when the 2027
dates are set.

**Not in the file:** the weekly Thursday 6 PM perk deadlines (Double Player Bonus, Matchup
Swap). They repeat every week, so a strip line would be noise. One standing line in the Pulse
footer covers them if wanted.

## 4. The Pulse strip

A compact card directly under the headline, above the News reel. The page builds it
automatically from `key-dates-data.js` and the Week object's `dateString`. **The robot writes
nothing**, so it can't forget.

Rows shown, relative to that Pulse's date (Tuesday):

- **⏰ Last call**: a deadline due before the next Pulse (within 7 days). Bold, accent color.
- **📅 Coming up**: due within `lead_days`.
- **✅ Just closed**: due in the 7 days before this Pulse. One week only.

Each row: label · date · "Rules →" link. Strip hidden when nothing qualifies.

Because it's computed from each Week's own date, old Pulses keep showing what was relevant
then. Checked against 2026: Week 2 (Sep 22) would have shown "Coming up: Relegation Insurance
closes Thu Oct 1"; Week 3 (Sep 29) "Last call"; Week 4 (Oct 6) "Just closed". That's the
miss this fixes.

The robot *may* mention a Last-call item in prose (editorial guide gets one line) but never
replaces the strip.

## 5. Home carousel (offseason, phase 2)

When no in-season row is in range, `index.html` shows a "Next up" slide built from the same
data (e.g. "Division swap window freezes Sun Sep 6"). In season the carousel keeps pointing
to the Pulse. No new data needed.

## 6. Nudges (the Tuesday gap)

The Pulse lands Tuesday; a Wednesday or Thursday deadline gets one or two days of warning.
For `nudge: yes` rows, the existing "MAFFL Tuesday Pulse kickoff" task adds one line to its
phone report the week the deadline falls: "Send the group text: Trade deadline Wed noon."
The commish sends it. Nothing is sent automatically.

## 7. Cleanup found while scoping

- The Annual Milestones tables in `rules.html` and `MAFFL_Rules_revised.csv` don't match
  (the CSV has "New Season Begins Aug 1" and the credit realignment window; the page has
  "Season Credits Issued", "ESPN.com Adjustments", etc.). Pick one wording.
- Neither lists Relegation Insurance's deadline; it lives only in the credit perks table.
  Add it to In-Season milestones.
- The milestone section has no anchor id for deep links (`#milestones`). Add one.

## 8. Build plan

| Step | What | Version | Notes |
|---|---|---|---|
| 1 | Gold CSV + generator + `key-dates-data.js`, governance row | n/a | No page change |
| 2 | Pulse strip in `weekly.html` | **minor** (v6.3 → v6.4) | Only when no Weekly Pulse PR is open (Wed → Mon). 390px screenshot, iOS standalone check. `check_pulse_week.py` must still pass |
| 3 | Tuesday kickoff task: nudge line | n/a | Scheduled task prompt edit |
| 4 | Rules cleanup (§7) | none | Rule text |
| 5 | Home "Next up" slide | minor | Before the offseason |

## 9. Open questions for the commish

1. Confirm the seed dates, especially the Wk 17 / prize date.
2. Lower-tier-only milestones: any?
3. Which rows get `nudge: yes`? (Proposed: Relegation Insurance, trade deadline.)
4. Standing footer line for the weekly Thursday 6 PM perk deadline: yes or no?

## 10. Commish answers (2026-10-27) and what was built

1. Dates come from Rules & Info → Annual Milestones plus the credit perk rules. Week 17 shows as
   "After Wk 17" (no exact day).
2. Lower: the end of the regular season is the end for most Lower teams, so it gets its own row
   (`lower-season-ends`, tier Lower).
3. No group texts. The `nudge` column and step 3 are dropped.
4. No standing footer line for the Thursday 6 PM perk deadlines.

Built: `data/MAFFL_Key_Dates_2026.csv` (no `nudge` column; adds `when`, the display text),
`_ops/scripts/gen_key_dates.py` (`--check` to verify) → `key-dates-data.js`, governance row,
editorial guide line, `rules.html#milestones` anchor + Relegation Insurance row, and the strip in
`weekly.html` v6.4. Trade deadline uses `lead_days` 42 so it shows from the Week 7 Pulse (Oct 27).
Still open: step 5, the home "Next up" slide, before the offseason.
