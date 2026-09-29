# Week 3 — ingest results + publish Weekly Pulse Week 3

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: CE-1 for Week 3, new top-performers gold
file, weekly.html Week 3 entry, one factual fix to the archived Week 2 preview.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, `MAFFL_HQ_DATA_GOVERNANCE.md` §2 and §4 (CE-1),
`build/generate-matchups-data.ps1` header. If any anchor below doesn't match the file exactly,
**stop and ask**. Don't guess. No `*.bak` files.

Source: MAFFL Weekly Results Engine, capture v2.1, `STATUS: READY TO INGEST`,
`CHECKSUM · week 3 · rows 11 · upper 6 · lower 5 · ghost 1 · score_sum 3310.09 · top3_rows 63`.

---

## Step 1 — Append Week 3 to gold `data/MAFFL_Matchups_Clean.csv`

Pre-check: `Select-String -Path data/MAFFL_Matchups_Clean.csv -Pattern '^2026,3,'` must return
**zero** hits. If Week 3 is already there, stop.

Append these 11 lines at the end of the file, verbatim. The file uses **CRLF** line endings and
ends with a CRLF, so keep both. No quoting, no trailing spaces.

```
2026,3,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,169.32,Mike Murello,Michael Murello,Bad Attitude Gang,154.22
2026,3,Upper,False,Regular,BJ Funari,Bryan Funari,South Hills FunShiners,168.86,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,114.32
2026,3,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,150.2,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,143.78
2026,3,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.6
2026,3,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,172.02,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,130.46
2026,3,Upper,False,Regular,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,181.8,Joe Reilly,Joseph Reilly,Reilly's Reindeer,123.26
2026,3,Lower,False,Regular,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,141.06,Todd Trozzo,Todd Trozzo,Fightin Ferrets,137.6
2026,3,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,179.34,Chris Johnson,Chris Johnson,The V-Unit,143.76
2026,3,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,138.42,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,135.94
2026,3,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,185.98,Tony Brooks,Tony Brooks,Tony's Talented Team,167.52
2026,3,Lower,False,Ghost,Dominic Nicastro,Dominic Nicastro,Steel City Champyinz,168.08,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,151.47
```

Then run the CE-1 chain:

```
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1          # check
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -Write   # write
```

- The check run should exit **1** (differences found), with additions only. An exit **2** means REFUSED:
  paste the problems and stop. Note that `John Fetrow / Casey Trozzo` in the ESPN column already
  appears in Weeks 1–2, so it should pass. If it's flagged, add it to Fetrow's `aliases` in
  `data/MAFFL_Owner_Registry.csv` (governance §7.1) and re-run the check. Don't fuzzy-match.
- Then run `-Write`.

Verify:
- `(Select-String data/MAFFL_Matchups_NoConsolation.csv -Pattern '^2026,').Count` → **33**
- `(Select-String data/MAFFL_Matchups_NoConsolation.csv -Pattern '^2026,3,').Count` → **11**
- `matchups-data.js` gained **10** Week 3 games. The Ghost row is excluded, per the generator.
- Week 3 score sum: 3310.09 (11 rows, both sides).
- `git diff --stat` touches only: Clean, NoConsolation, matchups-data.js, Points_By_Season,
  Points_AllTime. For both Points files, only 2026 lines change.

## Step 2 — Create gold `data/MAFFL_Top_Performers_2026.csv`

This is a new file. Hand-appended weekly from capture v2.1. Use CRLF line endings and include a
trailing CRLF. Content is verbatim:

```
Year,Week,Tier,Team,Owner,Rank,Player,Pos,Points
2026,3,Upper,Happy Valley Hammer Time,Tony Trozzo,1,B. Purdy,,39.28
2026,3,Upper,Happy Valley Hammer Time,Tony Trozzo,2,B. Nix,,27.14
2026,3,Upper,Happy Valley Hammer Time,Tony Trozzo,3,N. Dean,,16.0
2026,3,Upper,Bad Attitude Gang,Mike Murello,1,T. Shough,,28.8
2026,3,Upper,Bad Attitude Gang,Mike Murello,2,J. Smith-Njigba,,25.36
2026,3,Upper,Bad Attitude Gang,Mike Murello,3,W. Anderson Jr.,,18.5
2026,3,Upper,South Hills FunShiners,BJ Funari,1,B. Robinson,,33.3
2026,3,Upper,South Hills FunShiners,BJ Funari,2,G. Smith,,31.04
2026,3,Upper,South Hills FunShiners,BJ Funari,3,K. Cousins,,28.22
2026,3,Upper,Marco Clair Kardiac Attack,David Murello,1,L. Jackson,,24.44
2026,3,Upper,Marco Clair Kardiac Attack,David Murello,2,C. Stroud,,13.68
2026,3,Upper,Marco Clair Kardiac Attack,David Murello,3,D. Davis,,11.5
2026,3,Upper,Jake's Jagoffs,Jacob Nickman,1,J. Brissett,,29.6
2026,3,Upper,Jake's Jagoffs,Jacob Nickman,2,G. Kittle,,20.2
2026,3,Upper,Jake's Jagoffs,Jacob Nickman,3,D. Samuel Sr.,,18.9
2026,3,Upper,The Prodigal Sons,Jon Murello/ Rick Simmons,1,J. Cook III,,18.4
2026,3,Upper,The Prodigal Sons,Jon Murello/ Rick Simmons,2,C. Watson,,15.6
2026,3,Upper,The Prodigal Sons,Jon Murello/ Rick Simmons,3,B. Young,,14.64
2026,3,Upper,Mike Vicks Dog Sitting Co.,Braiden Snyder,1,D. London,,20.4
2026,3,Upper,Mike Vicks Dog Sitting Co.,Braiden Snyder,2,K. Walker III,,19.3
2026,3,Upper,Mike Vicks Dog Sitting Co.,Braiden Snyder,3,K. Williams,,15.8
2026,3,Upper,The Big Bang Theory,Dan Reilly,1,F. Warner,,16.5
2026,3,Upper,The Big Bang Theory,Dan Reilly,2,J. Williams,,16.3
2026,3,Upper,The Big Bang Theory,Dan Reilly,3,T. Higgins,,15.0
2026,3,Upper,Hadley's Comets,Brian Murello/ Ron Murello,1,J. Burrow,,27.58
2026,3,Upper,Hadley's Comets,Brian Murello/ Ron Murello,2,D. Prescott,,20.94
2026,3,Upper,Hadley's Comets,Brian Murello/ Ron Murello,3,D. Henry,,20.9
2026,3,Upper,Southside Shooters,Jon Fetrow/ Casey Trozzo,1,C. Keenum,,28.48
2026,3,Upper,Southside Shooters,Jon Fetrow/ Casey Trozzo,2,T. Lawrence,,24.78
2026,3,Upper,Southside Shooters,Jon Fetrow/ Casey Trozzo,3,C. Lamb,,13.2
2026,3,Upper,Turkey Hat Conglomerate,Ed Peters,1,J. Gibbs,,34.4
2026,3,Upper,Turkey Hat Conglomerate,Ed Peters,2,J. Goff,,23.36
2026,3,Upper,Turkey Hat Conglomerate,Ed Peters,3,P. Mahomes,,18.94
2026,3,Upper,Reilly's Reindeer,Joe Reilly,1,J. Love,,21.48
2026,3,Upper,Reilly's Reindeer,Joe Reilly,2,C. McCaffrey,,17.6
2026,3,Upper,Reilly's Reindeer,Joe Reilly,3,R. Smith,,12.5
2026,3,Lower,Camp Kes,Bob Keslar,1,T. Hufanga,,22.5
2026,3,Lower,Camp Kes,Bob Keslar,2,P. Mahomes,,18.94
2026,3,Lower,Camp Kes,Bob Keslar,3,N. Dean,,16.0
2026,3,Lower,Fightin Ferrets,Todd Trozzo,1,L. Jackson,,24.44
2026,3,Lower,Fightin Ferrets,Todd Trozzo,2,K. Walker III,,19.3
2026,3,Lower,Fightin Ferrets,Todd Trozzo,3,J. Warren,,17.6
2026,3,Lower,The Best in The 'Burgh,Ben Funari,1,B. Purdy,,39.28
2026,3,Lower,The Best in The 'Burgh,Ben Funari,2,J. Smith-Njigba,,25.36
2026,3,Lower,The Best in The 'Burgh,Ben Funari,3,J. Rodriguez,,17.0
2026,3,Lower,The V-Unit,Chris Johnson,1,J. Burrow,,27.58
2026,3,Lower,The V-Unit,Chris Johnson,2,T. Lawrence,,24.78
2026,3,Lower,The V-Unit,Chris Johnson,3,D. Henry,,20.9
2026,3,Lower,Sarge's Squad,Nick Yankovich,1,D. Prescott,,20.94
2026,3,Lower,Sarge's Squad,Nick Yankovich,2,C. McCaffrey,,17.6
2026,3,Lower,Sarge's Squad,Nick Yankovich,3,M. Golden,,16.0
2026,3,Lower,Tommy Phamclub,Sam Lavrinc,1,J. Brissett,,29.6
2026,3,Lower,Tommy Phamclub,Sam Lavrinc,2,J. Cook III,,18.4
2026,3,Lower,Tommy Phamclub,Sam Lavrinc,3,B. Young,,14.64
2026,3,Lower,Portly Primates,Charles Lavrinc,1,B. Robinson,,33.3
2026,3,Lower,Portly Primates,Charles Lavrinc,2,G. Smith,,31.04
2026,3,Lower,Portly Primates,Charles Lavrinc,3,W. Anderson Jr.,,18.5
2026,3,Lower,Tony's Talented Team,Tony Brooks,1,J. Gibbs,,34.4
2026,3,Lower,Tony's Talented Team,Tony Brooks,2,T. Shough,,28.8
2026,3,Lower,Tony's Talented Team,Tony Brooks,3,B. Bowers,,17.6
2026,3,Lower,Steel City Champyinz,Dominic Nicastro,1,M. Stafford,,22.9
2026,3,Lower,Steel City Champyinz,Dominic Nicastro,2,G. Kittle,,20.2
2026,3,Lower,Steel City Champyinz,Dominic Nicastro,3,D. Samuel Sr.,,18.9
```

Notes (don't "fix" these):
- `Player` is ESPN's first-initial form (`B. Purdy`). That's the capture convention.
- `Pos` is blank in all 63 rows because the scoreboard doesn't show positions.
- The same player in both tiers with the same points is normal, since the two auctions are
  separate (editorial guide §1).
- `Owner` uses the same gold spellings as the Matchups files, and all 21 resolve against
  `MAFFL_Owner_Registry.csv` aliases.

Verify: 64 lines (header + 63). 21 distinct teams × Rank 1/2/3. Every team's Rank 1 ≥ Rank 2 ≥ Rank 3.

## Step 3 — Register the new gold file in `MAFFL_HQ_DATA_GOVERNANCE.md`

**3a.** In §2 (Source-of-Truth Registry), add this row directly after the
`| Game result (W/L, scores) |` row:

```
| Weekly top-3 scorers per team (2026+) | `data/MAFFL_Top_Performers_2026.csv` — **hand-appended weekly from capture v2.1** (`Year,Week,Tier,Team,Owner,Rank,Player,Pos,Points`; ESPN first-initial player names; `Pos` blank until capture supplies it) | None generated. Quoted by hand in weekly.html Pulse prose (Results notes, Credit Tracker Individual High) | Weekly (in season) |
```

**3b.** In §4, CE-1, add this line directly after the first line
(`` `MAFFL_Matchups_Clean.csv` (append rows) ``):

```
+ `data/MAFFL_Top_Performers_2026.csv` (append that week's 3 rows per real team — gold, same capture; no derived files)
```

Don't make other governance edits.

## Step 4 — `weekly.html`: add Week 3 and correct the archived Week 2 preview

**4a. Insert Week 3.** Find the single line `const WEEKS = [`. Insert the block below
immediately after it, so Week 3 becomes the first element and Week 2 follows. Paste verbatim. The
block ends with `},` so the existing Week 2 `{` follows it.

```js
  {
    weekNumber: 3,
    dateString: "Sep 29, 2026",
    headline: "Turkey Hat Conglomerate (Ed) beat Reilly's Reindeer (Joe) for the first time in eight tries, by 58.54.",
    subhead: "Tommy Phamclub (Sam) leads Lower in points and went out of Survivor anyway. Three unbeaten teams are left.",
    latestChange: "One lead changed hands: Turkey Hat Conglomerate (Ed) passed Bad Attitude Gang (Mike) for Most Points in Upper, 497.16 to 494.20. The other five held.",

    /* points = SEASON TOTAL through Week 3. credits are unchanged from Week 2 —
       credit balances do not move during the season. */
    upperTier: {
      divA: [
        { team: "South Hills FunShiners",     owner: "BJ Funari",     w: 2, l: 1, points: 436.06, streak:  2, credits:  4 },
        { team: "Bad Attitude Gang",          owner: "Mike Murello",  w: 1, l: 2, points: 494.20, streak: -1, credits: 27 },
        { team: "Marco Clair Kardiac Attack", owner: "David Murello", w: 1, l: 2, points: 383.16, streak: -2, credits: 12 }
      ],
      divB: [
        { team: "Jake's Jagoffs",             owner: "Jacob Nickman",            w: 3, l: 0, points: 475.08, streak:  3, credits: 15 },
        { team: "Mike Vicks Dog Sitting Co.", owner: "Braiden Snyder",           w: 2, l: 1, points: 410.40, streak:  1, credits:  5 },
        { team: "The Prodigal Sons",          owner: "Jon Murello/Rick Simmons", w: 1, l: 2, points: 447.30, streak: -2, credits: 24 }
      ],
      divC: [
        { team: "Happy Valley Hammer Time",   owner: "Tony Trozzo", w: 2, l: 1, points: 464.26, streak:  2, credits: 17 },
        { team: "The Big Bang Theory",        owner: "Dan Reilly",  w: 1, l: 2, points: 388.12, streak: -2, credits:  6 },
        { team: "Reilly's Reindeer",          owner: "Joe Reilly",  w: 0, l: 3, points: 407.96, streak: -3, credits: 23 }
      ],
      divD: [
        { team: "Hadley's Comets",            owner: "Brian Murello/Ron Murello", w: 3, l: 0, points: 489.32, streak:  3, credits: 7 },
        { team: "Turkey Hat Conglomerate",    owner: "Ed Peters",                 w: 2, l: 1, points: 497.16, streak:  2, credits: 7 },
        { team: "Southside Shooters",         owner: "Jon Fetrow",                w: 0, l: 3, points: 375.72, streak: -3, credits: 7 }
      ]
    },
    lowerTier: [
      { team: "The Best in The 'Burgh", owner: "Ben Funari",       w: 3, l: 0, points: 487.26, streak:  3, credits:  6 },
      { team: "Tommy Phamclub",         owner: "Sam Lavrinc",      w: 2, l: 1, points: 493.16, streak: -1, credits:  8 },
      { team: "Portly Primates",        owner: "Charles Lavrinc",  w: 2, l: 1, points: 480.90, streak:  1, credits:  6 },
      { team: "Steel City Champyinz",   owner: "Dominic Nicastro", w: 2, l: 1, points: 421.98, streak:  2, credits:  6 },
      { team: "Sarge's Squad",          owner: "Nick Yankovich",   w: 2, l: 1, points: 397.60, streak:  2, credits:  5 },
      { team: "Tony's Talented Team",   owner: "Tony Brooks",      w: 1, l: 2, points: 482.98, streak: -1, credits: 10 },
      { team: "Fightin Ferrets",        owner: "Todd Trozzo",      w: 1, l: 2, points: 469.94, streak: -2, credits:  1 },
      { team: "Camp Kes",               owner: "Bob Keslar",       w: 1, l: 2, points: 412.50, streak:  1, credits:  1 },
      { team: "The V-Unit",             owner: "Chris Johnson",    w: 1, l: 2, points: 403.56, streak: -2, credits:  0 },
      { team: "MAFFL Ghost",            owner: "—",                w: 0, l: 3, points: 434.28, streak: -3, credits:  0 }
    ],

    /* Winner first in every row. Player names are last names only — capture v2.1
       gives ESPN's first-initial form (B. Purdy), so no first names are guessed. */
    results: [
      { tier: "U", teamA: "Turkey Hat Conglomerate", ownerA: "Ed Peters", scoreA: 181.8,
        teamB: "Reilly's Reindeer", ownerB: "Joe Reilly", scoreB: 123.26,
        note: "Ed's first win over Joe in eight meetings, and Gibbs had 34.4 of it. Joe is 0-3." },
      { tier: "U", tag: "Div A", teamA: "South Hills FunShiners", ownerA: "BJ Funari", scoreA: 168.86,
        teamB: "Marco Clair Kardiac Attack", ownerB: "David Murello", scoreB: 114.32,
        note: "Robinson (33.3) and Smith (31.04) outscored Dave's top three combined. BJ has won five straight regular-season meetings." },
      { tier: "U", tag: "Div D", teamA: "Hadley's Comets", ownerA: "Brian Murello/Ron Murello", scoreA: 172.02,
        teamB: "Southside Shooters", ownerB: "Jon Fetrow", scoreB: 130.46,
        note: "Fetrow had won four straight in this series, including last year's quarterfinal. Burrow's 27.58 led the Comets to 3-0." },
      { tier: "U", teamA: "Happy Valley Hammer Time", ownerA: "Tony Trozzo", scoreA: 169.32,
        teamB: "Bad Attitude Gang", ownerB: "Mike Murello", scoreB: 154.22,
        note: "Purdy's 39.28 was Upper's individual high of the week. Tony has won two straight since a 124.14 opener." },
      { tier: "U", tag: "Div B", teamA: "Jake's Jagoffs", ownerA: "Jacob Nickman", scoreA: 150.2,
        teamB: "The Prodigal Sons", ownerB: "Jon Murello/Rick Simmons", scoreB: 143.78,
        note: "Jake's lowest score of the season still won, with Brissett's 29.6 covering the margin. That's five straight over Jon/Rick." },
      { tier: "U", teamA: "Mike Vicks Dog Sitting Co.", ownerA: "Braiden Snyder", scoreA: 127.08,
        teamB: "The Big Bang Theory", ownerB: "Dan Reilly", scoreB: 125.6,
        note: "1.48 points, the closest game of the week. Dan opened with Upper's top score and has lost two straight." },
      { tier: "L", teamA: "Portly Primates", ownerA: "Charles Lavrinc", scoreA: 185.98,
        teamB: "Tony's Talented Team", ownerB: "Tony Brooks", scoreB: 167.52,
        note: "The highest score in either tier, led by Robinson's 33.3. Brooks posted 167.52 and would have beaten five other Lower teams." },
      { tier: "L", teamA: "The Best in The 'Burgh", ownerA: "Ben Funari", scoreA: 179.34,
        teamB: "The V-Unit", ownerB: "Chris Johnson", scoreB: 143.76,
        note: "Purdy's 39.28 was Lower's individual high. Ben is 3-0, the last unbeaten team in Lower." },
      { tier: "L", teamA: "Steel City Champyinz", ownerA: "Dominic Nicastro", scoreA: 168.08,
        teamB: "MAFFL Ghost", ownerB: "—", scoreB: 151.47,
        note: "Dom cleared a 151.47 par by 16.61 for his second straight win. 👻 is 0-3." },
      { tier: "L", teamA: "Sarge's Squad", ownerA: "Nick Yankovich", scoreA: 138.42,
        teamB: "Tommy Phamclub", ownerB: "Sam Lavrinc", scoreB: 135.94,
        note: "Sam lost by 2.48, and it also cost him his Survivor spot: 135.94 was the lowest real score in Lower." },
      { tier: "L", teamA: "Camp Kes", ownerA: "Bob Keslar", scoreA: 141.06,
        teamB: "Fightin Ferrets", ownerB: "Todd Trozzo", scoreB: 137.6,
        note: "Bo's first win of the season, by 3.46. Troz has scored 137.52 and 137.6 in back-to-back weeks since opening with 194.82." }
    ],

    /* One elimination per tier per week — the single lowest score among active teams.
       The Ghost is not in the pool. */
    survivor: {
      upperActive: [
        "Bad Attitude Gang", "The Prodigal Sons", "Jake's Jagoffs",
        "South Hills FunShiners", "Hadley's Comets", "Turkey Hat Conglomerate",
        "Mike Vicks Dog Sitting Co.", "Reilly's Reindeer", "Southside Shooters"
      ],
      upperEliminated: [
        { team: "Marco Clair Kardiac Attack", week: 3, recent: true  },
        { team: "The Big Bang Theory",        week: 2, recent: false },
        { team: "Happy Valley Hammer Time",   week: 1, recent: false }
      ],
      upperConcluded: false,
      upperWinner: null,
      lowerActive: [
        "Fightin Ferrets", "Tony's Talented Team", "Portly Primates",
        "The Best in The 'Burgh", "Camp Kes", "Sarge's Squad"
      ],
      lowerEliminated: [
        { team: "Tommy Phamclub",       week: 3, recent: true  },
        { team: "The V-Unit",           week: 2, recent: false },
        { team: "Steel City Champyinz", week: 1, recent: false }
      ],
      lowerConcluded: false,
      lowerWinner: null
    },
    survivorNote: "One team goes out per tier per week, the single lowest score. Tommy Phamclub (Sam) has the most points in Lower and went out 1.66 behind Fightin Ferrets (Troz). Marco Clair Kardiac Attack (Dave) was Upper's lowest by 8.94. Fifteen left of twenty-one.",

    creditTracker: [
      { award: "Most Team Points Scored — Upper",      credits: 5, leaderTeam: "Turkey Hat Conglomerate", leaderOwner: "Ed Peters",    value: "497.16 through Wk 3", status: "leading", since: 3 },
      { award: "Most Team Points Scored — Lower",      credits: 5, leaderTeam: "Tommy Phamclub",          leaderOwner: "Sam Lavrinc",  value: "493.16 through Wk 3", status: "leading", since: 2 },
      { award: "Largest Blowout Victory — Upper",      credits: 3, leaderTeam: "Turkey Hat Conglomerate", leaderOwner: "Ed Peters",    value: "65.40 over Southside (Wk 2)", status: "leading", since: 2 },
      { award: "Largest Blowout Victory — Lower",      credits: 3, leaderTeam: "Tommy Phamclub",          leaderOwner: "Sam Lavrinc",  value: "63.27 over 👻 (Wk 2)", status: "leading", since: 1 },
      { award: "Individual High Score (Wkly) — Upper", credits: 3, leaderTeam: "Bad Attitude Gang",       leaderOwner: "Mike Murello", value: "46.82 — Josh Allen", status: "leading", since: 2 },
      { award: "Individual High Score (Wkly) — Lower", credits: 3, leaderTeam: "Fightin Ferrets",         leaderOwner: "Todd Trozzo",  value: "46.82 — Josh Allen", status: "leading", since: 2 }
    ],
    highestWeekly: {
      credits: 1,
      weeks: [
        { week: 3, upper: { team: "Turkey Hat Conglomerate", owner: "Ed Peters",       score: 181.8 },
                   lower: { team: "Portly Primates",         owner: "Charles Lavrinc", score: 185.98 } },
        { week: 2, upper: { team: "Bad Attitude Gang",   owner: "Mike Murello", score: 202.0 },
                   lower: { team: "Tommy Phamclub",      owner: "Sam Lavrinc",  score: 194.92 } },
        { week: 1, upper: { team: "The Big Bang Theory", owner: "Dan Reilly",   score: 174.80 },
                   lower: { team: "Fightin Ferrets",     owner: "Todd Trozzo",  score: 194.82 } }
      ]
    },

    /* Rubric (editorial guide §6): all-play first, then PF. All-play through Wk 3:
       Upper — THC 24-9, HC 23-10, JAG 23-10. Lower — Burgh 18-6, PP 16-8. */
    elite5: [
      { rank: 1, team: "Turkey Hat Conglomerate", owner: "Ed Peters", tier: "U",
        note: "Upper's best all-play (24-9) and most points (497.16). The only loss was by 11.66 to the Comets in Week 1. Since then Ed has won by 65.40 and 58.54." },
      { rank: 2, team: "Hadley's Comets", owner: "Brian Murello/Ron Murello", tier: "U",
        note: "3-0 with a 23-10 all-play and the head-to-head win over #1. Week 4 against the other Upper unbeaten settles part of the argument." },
      { rank: 3, team: "The Best in The 'Burgh", owner: "Ben Funari", tier: "L",
        note: "Lower's last unbeaten team, with the best all-play in either tier at 18-6. It has never had Lower's top score in a week." },
      { rank: 4, team: "Jake's Jagoffs", owner: "Jacob Nickman", tier: "U",
        note: "3-0, with the same 23-10 all-play as the Comets and 14.24 fewer points. His lowest score of the season (150.2) still won." },
      { rank: 5, team: "Portly Primates", owner: "Charles Lavrinc", tier: "L",
        note: "185.98 was the highest score in either tier this week, and the 16-8 all-play is second in Lower. A 126.2 loss in Week 2 is the only blemish." }
    ],

    postseasonNote: "Turkey Hat Conglomerate (Ed) has the most points in Upper and is only the 5th seed, because Hadley's Comets (Brian/Ron) are 3-0 in the same division.",

    newsReel: [
      { section: "Can You Believe This?", icon: "🤯", items: [
        "Hadley's Comets (Brian/Ron) paid $10 for Jalen McMillan at 3:12 a.m. Thursday and cut him at 6:08 a.m. That was one of 13 moves this week, and they're 3-0.",
        "Southside Shooters (Fetrow) picked up Case Keenum for $0 on Thursday. He was their top scorer at 28.48, and they still lost by 41.56 to fall to 0-3."
      ] },
      { section: "Big Spenders", icon: "💸", items: [
        "Reilly's Reindeer (Joe) made the top bid again, $11 on Denzel Boston, and cut last week's $51 pickup, Carson Wentz, for Adonai Mitchell. Joe is 0-3."
      ] },
      { section: "Hot & Not", icon: "🔥", items: [
        "The Best in The 'Burgh (Ben) is 3-0 and has the best all-play in either tier at 18-6, without once posting Lower's top score.",
        "Sarge's Squad (Nick) is 2-1 with a 7-17 all-play, second-worst in Lower. The two wins came by 6.58 and 2.48."
      ] },
      { section: "Playoff Race", icon: "🏟️", items: [
        "Reilly's Reindeer (Joe) and Southside Shooters (Fetrow) are the only winless real teams, and they hold Upper's two relegation spots."
      ] }
    ],

    /* WEEK 4 PREVIEW. Upper from data/MAFFL_Schedule_2026_Upper.csv (Week 4).
       Lower from ESPN's League Schedule page (pasted by the commissioner 2026-09-29).
       Away team first. Featured: 3 Upper + 2 Lower (editorial guide §8). */
    matchupPreviews: [
      { tier: "U", highlight: true, teamA: "Hadley's Comets", ownerA: "Brian Murello/Ron Murello", teamB: "Jake's Jagoffs", ownerB: "Jacob Nickman",
        note: "Upper's last two unbeaten teams, and the #1 and #2 seeds if the season ended today. The Comets have won five straight regular-season meetings, but Jake beat them in the 2021 quarterfinal. The winner is alone at 4-0." },
      { tier: "U", highlight: true, teamA: "Reilly's Reindeer", ownerA: "Joe Reilly", teamB: "The Big Bang Theory", ownerB: "Dan Reilly",
        note: "The Reilly series couldn't be more even, and Joe won the last two, including 188.48 last year. Now Dan is 1-2 and the 10th seed, and Joe is 0-3 and 11th, in a relegation spot. Division C's basement is on the line." },
      { tier: "U", highlight: true, teamA: "Marco Clair Kardiac Attack", ownerA: "David Murello", teamB: "Turkey Hat Conglomerate", ownerB: "Ed Peters",
        note: "A rematch of last year's quarterfinal, which Dave won with 208.08. Ed has Upper's best all-play and has won his last two by a combined 123.94. Dave has scored 109.62 and 114.32 in his last two and just went out of Survivor." },
      { tier: "U", highlight: false, teamA: "Bad Attitude Gang", ownerA: "Mike Murello", teamB: "South Hills FunShiners", ownerB: "BJ Funari",
        note: "Division A. BJ leads it at 2-1; a win would put him two games up on Mike." },
      { tier: "U", highlight: false, teamA: "Mike Vicks Dog Sitting Co.", ownerA: "Braiden Snyder", teamB: "The Prodigal Sons", ownerB: "Jon Murello/Rick Simmons",
        note: "Division B. Braiden is 2-1 and Jon/Rick have lost two straight." },
      { tier: "U", highlight: false, teamA: "Happy Valley Hammer Time", ownerA: "Tony Trozzo", teamB: "Southside Shooters", ownerB: "Jon Fetrow",
        note: "Tony has won two straight. Fetrow is 0-3 with the fewest points in Upper." },
      { tier: "L", highlight: false, teamA: "MAFFL Ghost", ownerA: "—", teamB: "Camp Kes", ownerB: "Bob Keslar",
        note: "Bo draws 👻 after his first win of the season." },
      { tier: "L", highlight: false, teamA: "Fightin Ferrets", ownerA: "Todd Trozzo", teamB: "The V-Unit", ownerB: "Chris Johnson",
        note: "Both 1-2 and both on two-game losing streaks." },
      { tier: "L", highlight: false, teamA: "Steel City Champyinz", ownerA: "Dominic Nicastro", teamB: "Sarge's Squad", ownerB: "Nick Yankovich",
        note: "Both 2-1, the #4 and #5 seeds in Lower. Nick won their only meeting last year." },
      { tier: "L", highlight: true, teamA: "The Best in The 'Burgh", ownerA: "Ben Funari", teamB: "Portly Primates", ownerB: "Charles Lavrinc",
        note: "Lower's last unbeaten team against the highest score in either tier this week. Ben is the #1 seed and Charlie is #3, one spot off the promotion line. Ben won their only meeting last year." },
      { tier: "L", highlight: true, teamA: "Tommy Phamclub", ownerA: "Sam Lavrinc", teamB: "Tony's Talented Team", ownerB: "Tony Brooks",
        note: "Sam holds the second promotion spot over Charlie on credits alone, 8 to 6, after losing by 2.48. Brooks has the third-most points in Lower and sits 6th at 1-2. Brooks won their only meeting last year by 3.28." }
    ]
  },
```

**4b. Fix the Week 2 object's Week 3 Lower preview.** That preview guessed the Lower pairings, and 4 of 5
were wrong. Here's what ESPN actually played in Week 3: Camp Kes–Fightin Ferrets, 👻–Steel City Champyinz,
The V-Unit–The Best in The 'Burgh, Sarge's Squad–Tommy Phamclub, Portly Primates–Tony's Talented Team.
The notes are written from the Week 2 point of view, since that's when the preview ran.

- In the Week 2 object's comment above `matchupPreviews`, replace these two lines:
  `Lower pairings are DERIVED from the ten-slot rotation implied by Weeks 1 and 2 —`
  `confirm against ESPN before publishing. */`
  with:
  `Lower pairings corrected 2026-09-29 from ESPN's League Schedule (the derived`
  `rotation had 4 of 5 wrong). */`
- In that same `matchupPreviews`, **replace the four Lower entries** whose pairs are
  `MAFFL Ghost / Sarge's Squad`, `Camp Kes / Tommy Phamclub`,
  `Fightin Ferrets / Steel City Champyinz` and `Tony's Talented Team / Portly Primates`
  with the four below. **Leave the `The Best in The 'Burgh / The V-Unit` entry unchanged** and
  keep it last.

```js
      { tier: "L", highlight: false, teamA: "Camp Kes", ownerA: "Bob Keslar", teamB: "Fightin Ferrets", ownerB: "Todd Trozzo",
        note: "Bo is 0-2 and hasn't cleared 145. Troz has the highest Lower score of the season and just lost with 137.52." },
      { tier: "L", highlight: false, teamA: "MAFFL Ghost", ownerA: "—", teamB: "Steel City Champyinz", ownerB: "Dominic Nicastro",
        note: "👻 is 0-2. Dom just won for the first time after the tier's lowest Week 1." },
      { tier: "L", highlight: true, teamA: "Sarge's Squad", ownerA: "Nick Yankovich", teamB: "Tommy Phamclub", ownerB: "Sam Lavrinc",
        note: "Tommy Phamclub (Sam) is 2-0 with the most points in either tier and the #1 seed in Lower. Sarge's Squad (Nick) is 1-1 after the tier's second-lowest Week 1. They split two meetings last season." },
      { tier: "L", highlight: false, teamA: "Portly Primates", ownerA: "Charles Lavrinc", teamB: "Tony's Talented Team", ownerB: "Tony Brooks",
        note: "Both 1-1, 20.54 apart on the season, and both with a loss by under seven." },
```

**4c. Stamp.** VERSION is none, so leave `v6.2` as is. Change the date pill to
`Last Updated September 29, 2026`.

Verify weekly.html:
- `Select-String weekly.html -Pattern 'weekNumber: 3,'` → 1 hit, located before `weekNumber: 2,`
- `Select-String weekly.html -Pattern 'NEEDS COMMISH|CONFIRM|placeholder'`: this must return no
  hits inside the Week 3 object.
- `Select-String weekly.html -Pattern 'Lavrinc-adjacent|First-ever meeting. Tommy'` → 0 hits
  (both were in the replaced Week 2 entries)
- Open `weekly.html` locally in Chrome DevTools, iPhone 12 Pro (390×844), and check:
  - No console errors other than failed font/logo/GA loads from `file://`.
  - The week picker defaults to Week 3.
  - Page width is exactly 390 (`document.documentElement.scrollWidth === 390`), with no
    horizontal scroll.
  - Standings: Division A lists South Hills FunShiners first; Lower lists Burgh first and 👻 last.
  - Post-Season: Upper seeds are 1 Jake's Jagoffs, 2 Hadley's Comets, 3 Happy Valley,
    4 South Hills, 5 Turkey Hat (WC), 6 Mike Vicks (WC). Lower 1–2 is Burgh, then Tommy Phamclub.
  - Survivor: 9 alive Upper, 6 alive Lower. Marco Clair and Tommy Phamclub show as Wk 3 outs.
  - Credit Tracker: Upper Most Points shows NEW LEADER (Turkey Hat, 497.16). Highest Weekly Wk 3
    is 181.8 / 186.0.
  - Week 4 Preview shows 3 Upper + 2 Lower featured. Tags are Unbeaten clash / Division C /
    Playoff rematch. The ⚔️ strips read 21–11, Tied 6–6, 16–11, 1–0, 1–0.
  - Elite 5 reads Turkey Hat, Hadley's, Burgh, Jake's, Portly. The stat lines show
    24-9, 23-10, 18-6, 23-10, 16-8.
  - Switch to Week 2. Its Week 3 Preview Lower section should now show Sarge's Squad vs Tommy
    Phamclub and The Best in The 'Burgh vs The V-Unit as the featured games.
  - Standalone mode (Home-Screen app): headline and subhead wrap cleanly under the News card
    title, and each Results note stays inside its card.

## Step 5 — Close out

Report the diff summary. Then `git mv` this prompt to `_ops/prompts/done/` and update
`_ops/STATUS.md` using the block below. One commit covers everything: Clean + 4 derived files +
new top-performers CSV + governance + weekly.html + STATUS + the prompt move.

Suggested commit message: `Week 3: ingest results + top performers, publish Pulse Week 3`

---

STATUS:
- Recently shipped (top): `2026-09-29 · Week 3 ingested (CE-1 + new data/MAFFL_Top_Performers_2026.csv) and Pulse Week 3 published; Week 2 preview Lower pairings corrected`
- Now → replace the "Week 3 Pulse" bullet with: `**Week 4 Pulse.** Run Week 4 screenshots through capture v2.1. Lower schedule is on ESPN (League Schedule); don't derive it.`
- Now → Season line: `**Season:** 2026, Week 4 in progress. Weekly Pulse is live through Week 3 (`weekly.html` v6.2).`
- Queued prompts: remove this prompt's line.
