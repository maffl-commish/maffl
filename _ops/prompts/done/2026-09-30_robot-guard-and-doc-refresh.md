# Robot guard + doc refresh (from the 9/30 sweep audit)

VERSION: none

**Source:** `_ops/AUDIT_2026-09-30_sweep.md` items 1, 2, 4, 5, 6 (+ README folder map).
**Scope:** one workflow file and five docs. **No site pages, no CSVs, no generators, no scripts.**
**Mobile:** no page changes, so no mobile rendering impact. Don't touch any `.html` file.

Read each file before editing it. Use the real text you find. If a quoted "find" string below isn't in
the file exactly, stop and report it. Don't guess. Don't create `*.bak` files.

---

## 1. `.github/workflows/pulse-draft.yml`: block drafting week W while week W−1 isn't in gold

**Why:** if a Pulse PR is still open the next Tuesday, "Pick the week" chooses week W+1 on a `main` that's
missing week W. Ingest, facts and validate don't notice, so the standings come out wrong with no error.

In the `Pick the week` step (`shell: pwsh`), find:

```powershell
          if (-not $week) { Write-Host "No new week to draft."; "mode=none" >> $env:GITHUB_OUTPUT; exit 0 }
          $branch = "pulse/2026-week{0:D2}" -f $week
```

Insert this block **between** those two lines. It runs only on the draft path. Smoke and rehearsal exit earlier.

```powershell
          if ($week -gt 1) {
            $prev = $week - 1
            if (-not (Select-String -Path data/MAFFL_Matchups_Clean.csv -Pattern "^2026,$prev," -Quiet)) {
              $pb = "pulse/2026-week{0:D2}" -f $prev
              Write-Host "::error::Week $prev isn't in gold on main yet, so Week $week can't be drafted. Merge the 'Weekly Pulse: Week $prev draft' pull request first. The Wednesday backstop then drafts Week $week by itself, or use Actions > Pulse draft > Run workflow (week $week). If the Week $prev PR was closed without merging, delete branch $pb and run Pulse draft for week $prev first."
              exit 1
            }
          }
```

Also update the file's header comment. After the line `# (Claude's GitHub action can't install on Windows runners, hence the split.)`, add:

```
# Guard: a week is only drafted when the previous week is already in gold on main (merge each PR before the next Tuesday).
```

Change nothing else in this file.

**Verify (local, PowerShell, repo root):**
```powershell
Select-String -Path data/MAFFL_Matchups_Clean.csv -Pattern "^2026,3," -Quiet   # expect True  (Week 4 would be allowed)
Select-String -Path data/MAFFL_Matchups_Clean.csv -Pattern "^2026,4," -Quiet   # expect False (Week 5 would be blocked today)
git diff --stat .github/workflows/pulse-draft.yml                             # expect ~10 added lines, 0 removed
```
Also check the YAML indentation by eye in the diff. The new lines sit at the same 10-space indent as their neighbours.

---

## 2. `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`

a) **Your Tuesday routine:** after item 4, add:
   `5. **Merge each week's PR before the next Tuesday.** The robot won't draft a week while the previous one is still unmerged. It emails you instead.`

b) **If something breaks** table: add these two rows before the `Any other red ✗` row:

| Symptom | Fix |
|---|---|
| Pulse draft failed and you want to retry it | Open the failed run and click **Re-run failed jobs**. (**Run workflow** does nothing while the `pulse/2026-weekNN` branch exists. Delete that branch first if you want a fresh start.) |
| Email: "Week N−1 isn't in gold on main yet" | Last week's Pulse PR wasn't merged. Merge it. The Wednesday backstop drafts this week by itself, or use Actions → Pulse draft → **Run workflow** (week N). Expect one of these emails per Tuesday retry until you merge. |

c) **The parts:** change `**3 robots**` to `**4 robots**` and append ` · `rehearsal.yml` (re-draft a published week into a PR to close; button only after 2026-09-30)` to that bullet.

d) Top line: change `Updated 2026-09-30` only if it isn't already that. Leave everything else.

---

## 3. `CLAUDE.md`: add a robot section

Append at the end of the file:

```markdown
## Weekly robot (added 2026-09-30)

- In season, each week arrives through GitHub Actions: `espn-weekly-pull.yml` writes
  `_ops/inbox/MAFFL_2026_WeekNN_espn.md`, and `pulse-draft.yml` appends gold, runs CE-1 + validate, and has
  Claude draft the Week object in `weekly.html` on branch `pulse/2026-weekNN`, then opens a PR. The
  commissioner merges it. Guide: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`.
- **Don't hand-append a week to the gold CSVs, and don't edit `weekly.html` or `matchups-data.js`
  while a "Weekly Pulse" PR is open.** Both would conflict with the robot's branch. If a prompt needs to,
  stop and say so.
- `_ops/inbox/` is written by the robots. Don't edit or delete files there unless a prompt says so.
- Don't edit `.github/workflows/*` or `_ops/scripts/*` unless the prompt is about them.
- Before starting work, make sure the local repo is up to date with `main` (the robots push to it).
```

---

## 4. `MAFFL_HQ_OPERATIONS_RUNBOOK.md`: bring it in line with CLAUDE.md and STATUS

This doc currently says to run `build.ps1 -Write`, which is banned. It also names the quarantined CSV as
authoritative. Make these edits and keep every section not listed here as it is.

**4a. Top of file.** Replace the `**Companion documents** ...` block (the heading line and its 4 bullets) with:

```markdown
> **Read this first (2026-09-30):** the page generators have drifted from the hand-edited pages, so
> `build\build.ps1` is **check-only**. **Never run `build.ps1 -Write`.** `_ops/STATUS.md` lists what's safe
> right now. Where this runbook and `CLAUDE.md` disagree, `CLAUDE.md` wins.

**Companion documents:**
- `CLAUDE.md`: binding rules for Claude Code
- `MAFFL_HQ_DATA_GOVERNANCE.md`: gold sources (§2) and chain events (§4)
- `_ops/STATUS.md`: current work, open issues, what's safe
- `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`: the weekly robot
- History only, don't follow: `_ops/archive/2026-06-build/` (June build spec, audits, change inventory)
```

**4b. §0.** Replace the first bold sentence and the paragraph after it (through `...not the page.` plus the
"The principle is..." sentence) with:

```markdown
**Data lives in the gold CSVs (`./data/`, plus `Dues_Log.csv` at the repo root). Derived files and page
embeds are regenerated from gold, or synced to it in the same commit. You never change a number only in the HTML.**

To change a number on the site: edit the gold CSV that owns it, regenerate or sync what derives from it,
validate, review, publish. When the *source itself* is wrong, fix the source, not the page.
```
Keep the "Why this matters" paragraph.

**4c. §1 publish loop.** Replace steps 1–6 and the `> The pipeline is PowerShell...` note with:

```markdown
1. **Identify the gold source.** `MAFFL_HQ_DATA_GOVERNANCE.md` §2 (short version in §2 below).
2. **Write a Claude Code prompt** (`_ops/prompts/`) that edits the gold CSV.
3. **Regenerate what derives from it**, using only the generator for that event. Today the safe one is
   `build\generate-matchups-data.ps1` (CE-1 / CE-1a): check → `-Write` → re-check. For page embeds that have no
   safe generator (see STATUS), the prompt syncs the embed to gold by hand **in the same commit** and says so.
4. **Validate:** `powershell -ExecutionPolicy Bypass -File build\validate.ps1`. Expect 8/8.
5. **Review** the diff in GitHub Desktop: the change you intended, nothing else.
6. **Commit and push.** GitHub Pages publishes.

> Build and generator scripts are Windows PowerShell 5.1 (`build\*.ps1`). The weekly robot's scripts are
> Python 3 (`_ops/scripts/`) and run in GitHub Actions.
```

**4d. §2 table.** Replace the table (keep the heading, and keep the owner-name normalization paragraph after it) with:

```markdown
Full registry: `MAFFL_HQ_DATA_GOVERNANCE.md` §2. Owner names always resolve through `data/MAFFL_Owner_Registry.csv`.

| Datapoint | Gold source | Feeds |
|---|---|---|
| Game results | `data/MAFFL_Matchups_Clean.csv` | CE-1 generator → NoConsolation, `matchups-data.js`, Points_* |
| Weekly top-3 scorers | `data/MAFFL_Top_Performers_2026.csv` (robot appends) | weekly.html prose |
| Division titles | `data/MAFFL_Division_History_2005_2025.csv` | history, power-rankings, stats |
| Champ / RU / Lower-Tier finishes | `data/prize.csv` placement rows | history, power-rankings, prize |
| Playoff appearances | `data/MAFFL_Matchups_NoConsolation.csv` (Upper, `Is_Playoffs`) | history, power-rankings |
| Draft picks | `data/MAFFL_Draft_History_Clean_v3.csv` (name crosswalk first) | `draft-summary-data.js`, draft.html |
| Credits | `data/Credit_Log.csv` | credits.html, Owners Sheet balance |
| Dues | `Dues_Log.csv` (repo root) | prize.html `dues_seasons`, hand-synced (see `_ops/docs/DUES_PROCESS_NOTE.md`) |
| Prizes / payouts | `data/prize.csv` | prize.html |
| Power ratings + scout notes | `data/Power_Rankings.csv` | power-rankings.html |
| Rules | `data/MAFFL_Rules_revised.csv` | rules.html is manual (§4 Event 7) |
| Weekly Pulse | the weekly robot's PR | weekly.html |

**Never use `data/cleaned_maffl_revised.csv` as a source.** It's corrupted and quarantined (governance §7.2).
```

**4e. §3.** After the list of 8 gates, add one line:
`> Gates 1 and 7 still read the quarantined `cleaned_maffl_revised.csv` (open issue in STATUS). A pass there isn't proof that the finish flags are right.`

**4f. §4 Event 1.** In step 1, replace `` `MAFFL League Packet - 2025 Prizes.csv` `` with `` `data/prize.csv` ``. Replace step 4 with:
`4. **History**: add the season's division ranks to `MAFFL_Division_History_2005_2025.csv` and placements to `prize.csv`. **Don't** append to `cleaned_maffl_revised.csv` (quarantined). Follow governance CE-3.`
Replace the final bullet `- Then run the publish loop. ...` with `- Then run the publish loop (§1). Validate must pass before anything ships.`

**4g. §4 Event 2.** Replace `Update the power-rankings source CSV (once created), run the build.` with
`Update `data/Power_Rankings.csv`, then sync the power-rankings.html embed from it (governance CE-8).`

**4h. §4 Event 4.** Replace `run the build → regenerates draft.html.` with `run the player-name crosswalk first, then regenerate per governance CE-5. `_ops/docs/AUDIT_2026_Draft_Ingest.md` is the per-season checklist.`

**4i. §4 Event 5.** Replace its body (the lines under the heading) with:
```markdown
*Every regular-season week, automatic.* The robot pulls ESPN on Tuesday morning, updates gold + matchup
files, and opens a "Weekly Pulse: Week N draft" PR. Review it, comment `@claude …` for changes, and merge to
publish. Stat corrections to earlier weeks are flagged in the PR, never applied: CE-1a is the commissioner's
call. See `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`.
```

**4j. §5 intro.** Replace `The pipeline and all file edits happen in Claude Code (it can see the real files; a chat assistant cannot).` with
`All file edits happen in Claude Code. Claude in Cowork chat reads the live repo and writes prompts into `_ops/prompts/` (see `_ops/README.md`).`

**4k. §6.** Rename the heading to `## 6. Known open work` and replace its bullets with one line:
`Tracked in `_ops/STATUS.md` → "Open decisions / known issues". (The June 2026 list is in git history.)`

**4l. Quick reference card.** Replace the first bullet (`**To change any number:** ...`) with
`**To change any number:** edit the gold CSV (§2) → its generator or same-commit sync → `validate.ps1` → review → commit/push. **Never `build.ps1 -Write`.**`
Add a last bullet:
`**Tuesday in season:** review and merge the robot's Weekly Pulse PR before the next Tuesday.`

**Verify:**
```powershell
Select-String MAFFL_HQ_OPERATIONS_RUNBOOK.md -Pattern 'build.ps1 -Write'          # only in "Never ..." lines
Select-String MAFFL_HQ_OPERATIONS_RUNBOOK.md -Pattern 'cleaned_maffl'              # only in "never/quarantined/don't" lines
Select-String MAFFL_HQ_OPERATIONS_RUNBOOK.md -Pattern 'no working Python|to be created|TBD|League Packet - 2025'   # expect nothing
```

---

## 5. `MAFFL_HQ_DATA_GOVERNANCE.md`: targeted fixes

**5a. Header.** Replace the `**Status:** First-pass audit (pre go-live, target 2026-07-01)` line with
`**Status:** Living reference. First written June 2026 (pre go-live); refreshed 2026-09-30 for the weekly robot and dues ledger.`
Keep the Coverage and Author note lines.

**5b. §2 registry, "Weekly top-3 scorers" row.** Replace `**hand-appended weekly from capture v2.1**` with
`**appended weekly by the robot** (`_ops/scripts/ingest_week.py`, from the ESPN pull's OUTPUT 2a)`. Then check the
real `data/MAFFL_Top_Performers_2026.csv`: if `Pos` is filled on the robot-era rows, replace `` `Pos` blank until capture supplies it `` with
`` `Pos` may be blank on rows captured from screenshots (Weeks 1–3) ``. If `Pos` is blank everywhere, leave that phrase alone and say so in your report.

**5c. §2 registry.** Add a row directly after the "Prizes/payouts" row:
`| Dues obligations + payments | `Dues_Log.csv` (repo root; append-only) | prize.html `dues_seasons` (hand-synced until gen-prize reads Dues_Log; see `_ops/docs/DUES_PROCESS_NOTE.md`) | Ad-hoc |`

**5d. CE-1.** Directly under the `### CE-1 ...` heading, insert:
`*In season this runs automatically in the weekly robot (`pulse-draft.yml`): `ingest_week.py` appends gold, then `build\generate-matchups-data.ps1` regenerates the derived files and `validate.ps1` runs. Nothing publishes until the commissioner merges the PR.*`
Then open `build\generate-matchups-data.ps1` and check which files it actually writes. If the arrow list below
names a derived file the generator doesn't write, don't change the list. Say so in your report.

**5e. CE-3.** Replace the line `` `cleaned_maffl_revised.csv` (finish flags) `` with:
`Finish flags per §7.5: `MAFFL_Division_History_2005_2025.csv` (division ranks) + `prize.csv` (Champ / RU / Lower-Tier placements) + `MAFFL_Matchups_NoConsolation.csv` (playoffs). **Never `cleaned_maffl_revised.csv`.**`

**5f. CE-7.** Replace `→ re-bake `prize.html` dues_2026 array` through the end of the line `→ this is the ONLY place dues_2026 should be edited — never hand-edit the array directly` with:
```
→ update the open season's rows in `prize.html` `dues_seasons` (owed = Obligation − Payments; status = PAID when owed ≤ 0)
→ until `gen-prize.ps1` reads `Dues_Log.csv`, this sync is by hand, in the same commit. See `_ops/docs/DUES_PROCESS_NOTE.md` and `DUES_LEDGER_DESIGN.md`
```
Keep the `→ keep 2025_League_Status ...` line.

**5g. §5 cadence table, Weekly row.** Replace `This is where your Fable screenshot→CSV flow lives. Automate hard.` with
`Automated by the weekly robot (ESPN pull → gold → PR).`

**5h. §7.3.** In the sentence `...is generated from Team_History + cleaned_maffl**, not hand-typed`, replace `Team_History + cleaned_maffl` with `Team_History + Division_History + prize.csv + Matchups (§7.5)`,
and in the example comment replace `Team_History.csv + cleaned_maffl.csv` with `Team_History.csv + Division_History + prize.csv`.

**5i. §8 item 5.** Replace `recomputed from cleaned_maffl/Matchups` with `recomputed from Matchups + Division_History + prize.csv`.

**5j. §9.** Under the heading, add: `*Historical: the June 2026 go-live plan. Current open work lives in `_ops/STATUS.md`.*`

**Verify:**
```powershell
Select-String MAFFL_HQ_DATA_GOVERNANCE.md -Pattern 'cleaned_maffl'   # every hit must be: §1 entity list, §3/§6 "where" columns, §7.2 CORRUPTED, CE-3 "Never", or a CLAUDE.md-style warning. No hit may name it as a source.
Select-String MAFFL_HQ_DATA_GOVERNANCE.md -Pattern 'dues_2026|Fable|capture v2.1|go-live, target'   # expect nothing
```

---

## 6. `_ops/README.md`: folder map

In the §2 table, add two rows after the `_ops/docs/` row:

```
| `_ops/inbox/` | Robot output each week: `_espn.md`, `_facts.md`, `_datalog.md`, `_pr.md` (ESPN raw archive is git-ignored) | The robots |
| `_ops/scripts/` | Robot scripts: ESPN pull, ingest, facts calculator | Claude Code prompts |
```

In §5, after the Results Engine bullet, add:
`(Retiring: after the robot's first good Tuesday, this project and the capture prompt go away. See `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`.)`

---

## 7. Final checks

```powershell
git status --short    # expect exactly: pulse-draft.yml, WEEKLY_AUTOMATION_PLAN.md, CLAUDE.md, RUNBOOK, GOVERNANCE, _ops/README.md, STATUS.md, this prompt (moved)
git diff --stat
```
No `.html`, `.csv`, `.js`, `.ps1` or `.py` file may appear. If one does, undo it.

Then per CLAUDE.md: `git mv` this prompt to `_ops/prompts/done/` and update `_ops/STATUS.md` using the block below.
All in one commit: `Robot guard (week N-1 must be in gold) + runbook/governance/CLAUDE.md refresh`.

Report back: each section done or skipped (and why), the 5b and 5d findings, and the verify outputs.

---

STATUS:
- **Recently shipped** (top): `2026-09-30 · Sweep audit fixes: pulse-draft won't draft week W until W−1 is in gold (emails instead; merge each PR before the next Tuesday); retry = "Re-run failed jobs"; CLAUDE.md robot section; runbook + governance refreshed (build is check-only, no cleaned_maffl as a source, dues_seasons, robot CE-1); _ops README map. Audit: _ops/AUDIT_2026-09-30_sweep.md`
- **Open decisions / known issues:** delete the line `Runbook §6 "Known open work (as of 2026-06)" needs a refresh.`
- **Now**, in the "Weekly robot ✅ live" bullet, after `**Habit: GitHub Desktop Fetch/Pull before starting work.**` add: ` **Merge each Pulse PR before the next Tuesday.**`
