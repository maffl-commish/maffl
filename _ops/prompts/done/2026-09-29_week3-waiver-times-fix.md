# Week 3 Pulse — remove waiver processing times from two news items

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: two strings in the Week 3 `newsReel` of
`weekly.html`. Follow-up to `2026-09-29_week3-big-spenders-fix.md` (already run).

Read first: `_ops/STATUS.md`, `CLAUDE.md` (date/version stamp rule). If an anchor below doesn't
match the file exactly, **stop and ask**. Don't guess. No `*.bak` files.

Why (commissioner ruling): 3:12 a.m. is when ESPN *processed* Thursday's waiver run, not when
Hadley's picked anyone up. Standing rule now in `_ops/docs/PULSE_EDITORIAL_GUIDE.md` §4
("Waiver times"). The facts stay; only the timing language changes.

---

## Step 1 — `weekly.html`

Each Find string must return exactly **1** `Select-String -SimpleMatch` hit before replacing.

**1a. Can You Believe This?** (around line 1615)

Find:
```
        "Hadley's Comets (Brian/Ron) paid $10 for Jalen McMillan at 3:12 a.m. Thursday and cut him at 6:08 a.m. That was one of 15 moves this week, and they're 3-0.",
```
Replace with:
```
        "Hadley's Comets (Brian/Ron) won Jalen McMillan for $10 on Thursday's waivers and cut him less than three hours after the claim went through. That was one of 15 moves this week, and they're 3-0.",
```

**1b. Big Spenders** (around line 1619)

Find:
```
        "Hadley's Comets (Brian/Ron) placed the week's two biggest bids in Thursday's 3:12 a.m. waiver run, $51 on Marcus Mariota and $31 more on a second claim. Nobody else went above $27."
```
Replace with:
```
        "Hadley's Comets (Brian/Ron) won the week's two biggest waiver claims, $51 on Marcus Mariota and $31 on a second player. Nobody else went above $27."
```

**1c. Stamp.** VERSION none → keep the `v6.2` pill; Last Updated = today's date.

Verify:
- `Select-String weekly.html -Pattern '3:12|6:08'` → **0** hits.
- `Select-String weekly.html -SimpleMatch "Thursday's waivers"` → **1**; `'biggest waiver claims'` → **1**.
- `git diff --stat` → `weekly.html`, plus `_ops/docs/PULSE_EDITORIAL_GUIDE.md` and
  `_ops/scripts/maffl_espn_pull.py` if still uncommitted (chat already wrote those), STATUS, and this prompt's move.
- Mobile: DevTools iPhone 12 Pro (390×844), Week 3, News card expanded. Both items wrap inside their
  cards, `Hadley's Comets (Brian/Ron)` highlights, `document.documentElement.scrollWidth === 390`.

## Step 2 — Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/` and update `_ops/STATUS.md`
with the block below. One commit.

Suggested commit message: `Pulse Week 3: drop waiver processing times; editorial rule + ESPN pull v0.3.2 groups waiver runs`

---

STATUS:
- Recently shipped (top): `2026-09-29 · Pulse Wk 3 waiver-time wording fixed; editorial guide §4 "Waiver times" rule; ESPN pull v0.3.2 lists waiver runs separately from real-time moves`
- Queued prompts: remove this prompt's line.
