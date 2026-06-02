# MAFFL HQ — Documentation Consistency Sweep

**Date:** 2026-06-01
**Scope:** Read-only sweep of every prose/spec/notes file and every process-/architecture-/data-rule
comment embedded in the HTML/JS/PS1 files, checked against the two ground-truth docs
(`CHANGE_INVENTORY.md` and the revised `# MAFFL HQ Project.md`). This is a *documentation* sweep,
not a data audit (that was `AUDIT.md`). It looks for prose/comments that are now **wrong**.
**Constraint honored:** No file was modified, created, moved, or deleted except this `DOC_SWEEP.md`.

---

## 1. Summary

**Stale / inaccurate documentation items found: 9** (4 confirmed-stale statements, 2 inaccurate
status claims, 1 ground-truth-doc-vs-code contradiction, plus 2 historical docs carrying
now-resolved "open" items). Plus 3 orphan/leftover artifacts.

**Most important contradictions, worst first:**

1. **`weekly.html` is live with `IS_OFFSEASON = false` — both `CHANGES.md` and the ground-truth
   `CHANGE_INVENTORY.md` say it is `true`.** The actual file (`weekly.html:930`) reads
   `const IS_OFFSEASON = false;`. `CHANGES.md` Fix 5 claims it was set to `true` and "verified,"
   and `CHANGE_INVENTORY.md:157` states "Current state: `IS_OFFSEASON = true` … Good until kickoff."
   It is the off-season (placeholder Week-1 data is still tagged `[PLACEHOLDER]`), so this is the
   exact go-live blocker Fix 5 was supposed to close — **apparently reverted by a later commit
   ("go live for season").** This is a code-vs-doc contradiction, but it surfaces *here* because
   two documents (one of them a ground-truth doc) now misstate reality. **Resolve first.**

2. **`credits.html` still describes the retired Google Sheet as the live credit source** (page
   meta description + an internal comment). Ground truth: the Google Sheet is **retired**;
   `Credit_Log.csv` is the source and balances are a generated mirror.

3. **The premise that a stale `# MAFFL HQ Project.md` needs replacing is itself obsolete.** Only
   one spec file exists and it *is* the revised/current one. No `__MAFFL_HQ_Project.md` exists;
   `_quarantine/` is empty. There is **no competing authoritative spec** — that risk is closed.

4. **`MAFFL_HQ_Weekly_Week01_2026.html` (the Gmail standalone) still uses Google-Sheet "tab"
   language** for credits ("Credit Log tab," "Credit Balance tab").

No wrong league name was found anywhere — every reference uses "Mid-Atlantic Fantasy Football
League" (e.g. `index.html:6-7`, `weekly.html:42`). No reference to the retired "MAFFL HQ
Annual + Weekly two-artifact" concept survives in any page. Co-owner names render in the canonical
`Name A / Name B` forward-slash form throughout the prose/UI. Those classes of drift are clean.

---

## 2. Per-file findings

### `# MAFFL HQ Project.md` — **CURRENT (ground truth). Leave.**
This is the revised spec, not a stale one. It correctly states Mid-Atlantic Fantasy Football
League, the multi-page site, the retired Google Sheet / `Credit_Log.csv` model, recompute-from-
history, forward-slash owner normalization, and back-entered credit history. The sweep brief
described it as the "dated spec … contradicting current decisions," but that description predates
git commit `2066a9d "Rewrite project spec"`, which rewrote it in place. **No action** — it is one
of the two yardsticks.

### `CHANGE_INVENTORY.md` — **CURRENT (ground truth), with one factual drift.**
Used as a yardstick. One statement is contradicted by the code it describes:
- **`CHANGE_INVENTORY.md:157`** — "**Current state:** `IS_OFFSEASON = true` (set in the fix pass)
  so no placeholder leaks. Good until kickoff." The actual file is `false` (`weekly.html:930`).
- **Current truth:** the flag is `false`; placeholder standings would render today.
- **Recommended action:** *Investigate the code* (re-apply Fix 5 / set the flag) **and then** the
  inventory line becomes true again. Don't "fix" the doc by editing it to match a wrong code state.
  See Open Question 1.

### `AUDIT.md` — **HISTORICAL diagnostic. Leave as a frozen record, but it lists resolved items as open.**
By design a point-in-time audit (the spec even references it as "the 2026-06 data provenance
audit"), so its age is acceptable *if a reader understands it is superseded*. It carries no
"superseded" banner, and several of its open items have since been decided:
- **`AUDIT.md:390-391` (Open Question 8)** — "Should a `Credit_Log` CSV become the source of
  truth …?" **Now RESOLVED:** ground truth says yes; the Google Sheet is retired
  (`CHANGE_INVENTORY.md:213`, `# MAFFL HQ Project.md:98`).
- **`AUDIT.md:355-379` (Open Questions 1, 2, 3, 4)** — 2002 co-championship, Tony Brooks division
  titles, Slot 2 time, and the live weekly placeholder are all addressed by `CHANGES.md` fixes 2–5
  (commissioner-ruled). The audit still presents them as unresolved defects.
- **`AUDIT.md:24-28 / §5a` (the Brian/Ron backslash bug, `draft.html:7958`)** — `CHANGES.md` Fix 1
  reports the backslash is **not present** (already forward-slash). The two docs disagree on
  whether this defect exists; see Duplicate/Conflict notes.
- **Recommended action:** **Leave** (it is the historical record), but add a one-line "superseded
  by `CHANGES.md` + `CHANGE_INVENTORY.md`; see those for current status" pointer at the top so no
  one acts on its stale "open" list. (Flagged, not edited — read-only.)

### `CHANGES.md` — **STALE status; one wrong claim. Update recommended.**
Describes the post-audit fix pass. Two problems:
- **`CHANGES.md:125-141` and summary row `:158`** — Fix 5 states the toggle was changed
  `false → true` and "Verification: With `IS_OFFSEASON = true` …" The live file is `false`
  (`weekly.html:930`). **The documented fix is not in effect.**
- **`CHANGES.md:3` and `:162-163`** — "created off a pre-edit snapshot commit; **NOT pushed, NOT
  merged**" and "**Nothing committed, pushed, or merged. Awaiting commissioner review.**" Git
  history shows commit `461546c "Fix post-audit defects (commissioner-approved)"` — the work *was*
  committed and approved. The status block is stale.
- **Current truth:** fixes were committed/approved; Fix 5 specifically is currently reverted in the
  working file.
- **Recommended action:** Reconcile Fix 5 (re-apply in code, then the doc is true) and refresh the
  status block to reflect that the branch was committed and approved.

### `credits.html` — **STALE Google-Sheet references. Update recommended.**
- **`credits.html:7`** (page `<meta name="description">`) — "A hand-updated snapshot so owners
  never have to **open the Google Sheet**."
- **`credits.html:838-839`** (comment) — "These numbers are **hand-copied from the league Google
  Sheet**; they are **NOT live**."
- **`credits.html:289`** (CSS comment) — "Snapshot note — makes it clear this is **hand-updated,
  not live**." (The `.snapshot-note` class it documents appears **unused** in the visible markup —
  see orphans.)
- **Current truth:** the Google Sheet is retired (`# MAFFL HQ Project.md:98-106`,
  `CHANGE_INVENTORY.md:121-145`). Credits are to be **generated from `Credit_Log.csv`**; the
  balance is a derived mirror, not a hand-copy of a Sheet.
- **Recommended action:** Update the meta description and comments to describe the
  `Credit_Log.csv` → derived-balance model. **Note:** `credits.html:847,851` ("opens the league
  Google **Form**") is **correct and current** — the Form survives as the intake/request queue
  (`# MAFFL HQ Project.md:104`). Leave the Form references.

### `MAFFL_HQ_Weekly_Week01_2026.html` (Gmail standalone) — **STALE credit-tab prose.**
- **`MAFFL_HQ_Weekly_Week01_2026.html:685`** — "Credit transactions are logged in the **Credit Log
  tab**. … The **Credit Balance tab** is the source of truth for tiebreaker use."
- **Current truth:** "tab" language is the retired Google-Sheet structure. `Credit_Log.csv` is the
  source; for tiebreaking, the **Credits page** is the stated source of truth (`rules.html:1476`).
- **Recommended action:** Update the wording away from Sheet "tabs." (This file is also the
  placeholder template twin of `weekly.html`; its invented Week-1 data is intentional per the spec,
  so only the credit-tab line is a doc defect.)

### `rules.html` — **CURRENT. Leave.**
- **`rules.html:1476`** — "The Credits page serves as the source of truth … for tiebreaking" —
  consistent with current model.
- **`rules.html:1611-1645`** (COMMISSIONER WORKFLOW comment) — "Edit the CSV … FIRST … then sync
  into the HTML … commit and push." This is the **interim** CSV-first manual process and matches
  the spec's ad-hoc-correction rule (Event 6). It is not wrong today, but it predates `build.py`;
  flag it for a refresh when the pipeline lands (it currently says "sync into the HTML by hand,"
  whereas the target is build-regenerated). **Leave now; revisit at pipeline build.**
- **`rules.html:1647-1662`** explicitly frames manual maintenance as "CURRENT STATE" with a
  "FUTURE STATE (Phase 2)" pipeline note — correctly transitional. Leave.
- **`rules.html:1405-1409` "Annual Milestones"** is a legitimate rulebook section (the league's
  yearly calendar), **not** the retired "MAFFL HQ Annual" artifact. Not stale.

### `weekly.html` — **comment OK; code value is the problem (see Summary 1).**
- **`weekly.html:908-927`** (COMMISSIONER WORKFLOW comment) accurately describes the
  paste → build → publish flow and the off-season toggle. No staleness in the prose.
- **`weekly.html:930`** `const IS_OFFSEASON = false;` is the code contradiction tracked in
  Summary 1 / Open Question 1. (Code, not a doc — flagged, not edited.)

### `power-rankings.html` — **CURRENT, minor note.**
- **`power-rankings.html:785-805`** (COMMISSIONER WORKFLOW comment) correctly says ratings/scout
  notes are commissioner-authored and career/timeline data is derived from the canonical CSVs and
  inlined — consistent with ground truth. The "append next season's timeline entry to each owner"
  step is manual and will be superseded by recompute-from-history under the pipeline; minor,
  transitional. **Leave.**

### `index.html` — **CURRENT. Leave.**
- **`index.html:6-7`** correct league name. **`index.html:753`** "get us out of spreadsheets"
  is consistent with the Sheet retirement. **`index.html:720`** "HAND-EDITED NEWS STRIP" and
  **`:811`** "annual-cycle pages" describe site chrome / yearly cadence (category H, legitimately
  hand-maintained) — not the retired Annual artifact. No action.

### `.claude/serve.ps1`, `.claude/launch.json`, `check-standalone.ps1`, `manifest.json` — **config/tooling, not docs.**
No stale process/data prose. One minor oddity: `serve.ps1:12` defaults the root request to
`prize.html` rather than `index.html` (the spec's landing page) — likely a leftover from
prize-focused dev. Out of scope for this sweep; noted for cleanup.

### `_chunk1.txt` — **ORPHAN. Delete recommended.** (see §4)

---

## 3. Duplicate / near-duplicate file map

| File | Status | Notes |
|---|---|---|
| `# MAFFL HQ Project.md` | **CURRENT — sole authoritative spec** | Revised in place (commit `2066a9d`). No second/competing spec exists. |
| `__MAFFL_HQ_Project.md` | **Does not exist** | Named in the sweep brief as the "revised" copy, but absent. `_quarantine/` is empty. The in-place rewrite removed the duplicate-spec risk. |
| `CHANGE_INVENTORY.md` | **CURRENT — ground-truth companion** | Datapoint map + change-event catalog. (One drifted line, §157 — see findings.) |
| `AUDIT.md` | **HISTORICAL** | 2026-06 point-in-time audit; several of its "open" items are now resolved. Keep as record; mark superseded. |
| `CHANGES.md` | **STALE STATUS** | Fix-pass log; status block and Fix 5 no longer match reality. |
| `weekly.html` ↔ `MAFFL_HQ_Weekly_Week01_2026.html` | **Intentional twin, not a stray duplicate** | Site page vs. self-contained Gmail attachment, per spec. Both hold placeholder Week-1 data (by design for the standalone). The standalone additionally has the stale "Credit Log tab" line. |

**Could more than one file be read as authoritative?** No for the spec (only one exists). For the
*audit trail*, `AUDIT.md` and `CHANGES.md` can both read as "current status" — `AUDIT.md` lists
defects as open that `CHANGES.md` says are fixed, and `CHANGES.md` itself overstates one fix. A
reader could be misled about what is actually done. Recommend the superseded-pointer on `AUDIT.md`
and the status refresh on `CHANGES.md`.

---

## 4. Orphan / leftover artifacts

| Artifact | Assessment | Recommended action |
|---|---|---|
| `_chunk1.txt` | CSS/HTML fragment of the springboard styles (card-grid, carousel) sliced out of `index.html`, with mojibake (`â†’`, `â€”`). No consumer; `AUDIT.md:106/351` already flagged it as an orphan build artifact. | **Delete.** |
| `_quarantine/` (directory) | Empty. Leftover holding pen. | Remove (or document its purpose). |
| `.snapshot-note` CSS class (`credits.html:290-297`) + its comment (`:289`) | Class defined and commented but not present in the visible credit markup; describes a "hand-updated, not live" note that no longer renders. | Remove the dead class/comment (or restore the note with corrected, non-Google-Sheet wording). |
| `serve.ps1:12` default-to-`prize.html` | Dev-server quirk, likely stale from prize-focused dev. | Point default at `index.html` (minor; outside doc scope). |
| `desktop.ini`, `data/desktop.ini` | Windows system metadata. | Ignore. |

---

## 5. Open questions (need the commissioner)

1. **`IS_OFFSEASON` — true or false right now?** The live code is `false`, but the fix log and the
   ground-truth inventory both say `true`. If the season has genuinely "gone live" (per commit
   `2066a9d`), then the placeholder `WEEKS[]` data must be replaced with real results before this
   is safe; if not, the flag should be `true`. **This is the only finding with reputational/data
   exposure** (invented standings shown as real) and should be settled before anything else.
2. **Did Fix 1's backslash already exist?** `AUDIT.md` says `draft.html:7958` used a backslash key;
   `CHANGES.md` Fix 1 says it was already a forward slash. Confirm which doc was right so the audit
   record is trustworthy (no code change implied — both now agree the live value is forward-slash).
3. **`AUDIT.md` superseded banner — OK to add?** It would prevent readers from acting on its
   now-resolved "open questions." (Out of scope for this read-only sweep; flagging for approval.)
4. **Credit-doc rewording scope:** when updating the Google-Sheet references in `credits.html` and
   the standalone weekly, confirm the intended user-facing phrasing for the new
   `Credit_Log.csv` → derived-balance model (the commissioner-facing comments are separate from the
   owner-facing meta/registry copy).

---

*No edits were made to any file other than this one. Where a statement was ambiguous it was flagged
rather than resolved.*
