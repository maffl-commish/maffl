# Week 3 Pulse — correct Big Spenders + Hadley's move count (from ESPN pull)

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: two strings in the Week 3 `newsReel` of
`weekly.html`, plus tidy one inbox filename. No data files change.

Read first: `_ops/STATUS.md`, `CLAUDE.md` (date/version stamp rule). If an anchor below doesn't
match the file exactly, **stop and ask**. Don't guess. No `*.bak` files.

Why: the new ESPN pull (`_ops/scripts/maffl_espn_pull.py` v0.3.1, report
`_ops/inbox/MAFFL_2026_Week03_espn (2).md`) shows the Week 3 screenshots missed part of Thursday's
3:12 a.m. waiver run. Commissioner confirmed on ESPN: Hadley's Comets claimed Marcus Mariota for
$51. The week's top bids were $51 and $31 (both Hadley's), then $27. Joe's $11 was not the top bid.
Hadley's made 15 moves in the week, not 13.

---

## Step 1 — `weekly.html`: fix the Week 3 news reel

Both strings are in the Week 3 entry's `newsReel` (around lines 1613–1620). Each anchor appears
exactly once in the file. Check with `Select-String` first; each must return **1** hit.

**1a. Can You Believe This? — move count**

Find:
```
That was one of 13 moves this week, and they're 3-0.",
```
Replace with:
```
That was one of 15 moves this week, and they're 3-0.",
```

**1b. Big Spenders — replace the only item**

Find (entire line, inside `{ section: "Big Spenders", icon: "💸", items: [` of Week 3):
```
        "Reilly's Reindeer (Joe) made the top bid again, $11 on Denzel Boston, and cut last week's $51 pickup, Carson Wentz, for Adonai Mitchell. Joe is 0-3."
```
Replace with:
```
        "Hadley's Comets (Brian/Ron) placed the week's two biggest bids in Thursday's 3:12 a.m. waiver run, $51 on Marcus Mariota and $31 more on a second claim. Nobody else went above $27."
```

The reel stays at 6 items across 4 sections (editorial guide §4). Don't touch the Week 2 Big
Spenders block further down (around line 1805).

**1c. Stamp.** Per `CLAUDE.md`: VERSION none → leave the `v6.2` pill; set the Last Updated pill to
today's date (it may already read September 29, 2026).

Verify:
- `Select-String weekly.html -Pattern '13 moves'` → **0** hits; `'15 moves'` → **1**.
- `Select-String weekly.html -Pattern 'top bid again'` → **0** hits; `'Marcus Mariota'` → **1**.
- `git diff --stat` touches only `weekly.html` (plus the files in Steps 2–3).
- Mobile: Chrome DevTools, iPhone 12 Pro (390×844), Week 3 selected, News card expanded. The new
  Big Spenders item wraps inside its card, `Hadley's Comets (Brian/Ron)` gets the team highlight,
  and `document.documentElement.scrollWidth === 390`. Also check once in standalone (Home-Screen) mode.

## Step 2 — Tidy the inbox filename

Rename `_ops/inbox/MAFFL_2026_Week03_espn (2).md` → `_ops/inbox/MAFFL_2026_Week03_espn.md`
(the browser added the "(2)"). Content unchanged. Commit it; it's the first ESPN-pulled week report.

## Step 3 — Close out

Report the diff summary. Then `git mv` this prompt to `_ops/prompts/done/` and update
`_ops/STATUS.md` using the block below. One commit covers everything.

Suggested commit message: `Pulse Week 3: correct Big Spenders + Hadley's move count from ESPN pull; ESPN pull script v0.3.1`

(Also include in the same commit, if uncommitted: `_ops/scripts/maffl_espn_pull.py`,
`_ops/docs/WEEKLY_AUTOMATION_PLAN.md`.)

---

STATUS:
- Recently shipped (top): `2026-09-29 · Weekly automation Step 1 done: ESPN pull v0.3.1 matched Week 3 gold (scores, 👻, all 63 top-3s) and caught waiver bids the screenshots missed; Pulse Wk 3 Big Spenders corrected`
- Now → replace the "Weekly automation" bullet with: `**Weekly automation (ESPN → drafted Pulse PR).** Plan: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`. Step 1 ✅. Next: Step 2, GitHub robot (data only). Screenshots stay the live process until Step 2 ships.`
- Queued prompts: remove this prompt's line.
