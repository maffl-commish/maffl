## Week 8 draft — ready for your review
**Stat corrections applied (ESPN):**
- Week 7 · Upper · Bad Attitude Gang 134.22 → 134.72 (vs Jake's Jagoffs, result unchanged)
- Week 7 · Upper · The Big Bang Theory 187.74 → 189.24 (vs Hadley's Comets, result unchanged)
- Week 7 · Lower · Portly Primates 143.80 → 144.30 (vs Camp Kes, result unchanged)
- Week 7 · Lower · Tony's Talented Team 159.26 → 160.76 (vs Sarge's Squad, result unchanged)
- Week 7 · Lower · MAFFL Ghost 145.73 → 145.98 (vs The Best in The 'Burgh, result unchanged)

`weekly.html` edits in the Week 7 object for these:
- `scoreA`/`scoreB` set to 134.72, 189.24, 144.30, 160.76, 145.98.
- Headline: 187.74 → 189.24, and the margin 56.88 → 58.38 (189.24 − 130.86).
- Big Bang Theory results note: "Dan's 187.74" → "Dan's 189.24".
- Ghost results note: "beat 👻 by 19.29" → "19.04" (165.02 − 145.98).
- Coach `couldHaveWon` Tony's Talented Team: lostBy 13.64 → 12.14 (172.90 − 160.76).
- News item on Sarge's/Tony's: "172.90-159.26" → "172.90-160.76", and "best lineup would have won by 4.54" → "6.04" (18.18 − 12.14).

**Headline:** Turkey Hat Conglomerate (Ed) beat Jake's Jagoffs (Jake) by 76.14, Upper's biggest margin of the year.
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ (Result: ✅ all required pieces present, no ⚠️) · editorial checklist ✅
**What I did:**
- Wrote the Week 8 object from the facts file and ESPN report (standings, 11 results, Survivor, Credit Tracker, highest weekly, Elite 5, Coach of the Week with board and missed calls, Week 9 preview). Stamped `Last Updated November 3, 2026`; version pill stays v6.3 (no VERSION line).
- Credit Tracker: Turkey Hat Conglomerate takes the Upper blowout mark (76.14, since 8). Burrow's 46.48 is below both Individual High marks (47.46 Maye, 46.82 Allen), so those carry forward.
- Applied the five Week 7 corrections listed above.
- Spread the wealth: Southside Shooters (not written about in 3 Pulses) has two reel mentions, Bad Attitude Gang one, and four Lower teams get items.

**Needs your OK / questions:**
- **Lower Survivor:** only The Best in The 'Burgh is left after 8 eliminations, so I set `lowerConcluded: true` and `lowerWinner` to them (last team standing, per the rulebook). Say if you'd rather it stay open until Week 14.
- **Week 7 snapshots left as published** (per recipe): the `highestWeekly` entry for Week 7 still shows 187.74 for The Big Bang Theory (now 189.24), and the Week 7 Coach board still shows the old `scored` values for the five corrected teams. No holder or winner changed.
- Bad Attitude Gang is only lightly in the reel (Playoff Race standings line, plus Coach of the Week). I didn't force a second item given the rule against leaning on the commissioner's team.

**LM to-do:** set ESPN 👻 Week 8 score to 147.62. Also re-enter the Week 7 👻 score as 145.98 (par changed from 145.73).

---
### The draft, as readers will see it
**Turkey Hat Conglomerate (Ed) beat Jake's Jagoffs (Jake) by 76.14, Upper's biggest margin of the year.**
Happy Valley Hammer Time (Tony) edged Mike Vicks Dog Sitting Co. (Braiden) by 0.24 in a first meeting, ending Braiden's five-game win streak.

**News reel**
🤯 Can You Believe This?
- Southside Shooters (Fetrow) beat Marco Clair Kardiac Attack (Dave) by 1.54 with T. Allgeier's 31.1 on the bench, more than any starter. The OP slot Fetrow filled instead, B. Hall, didn't play.
- Tommy Phamclub (Sam) benched C. Dike's 21.1, more than any starter, and still beat Portly Primates (Charlie) by 2.54. Charlie left C. Williams' 15.98 on the bench for Mayfield's 1.4.
- Camp Kes (Bo) beat Tony's Talented Team (Brooks) by 1.74 for Bo's first win over Brooks, after three losses. Brooks left 41.58 on the bench, and his best lineup would have won by 39.84.

💀 Survivor Watch
- The Prodigal Sons (Jon/Rick) went out of Upper's Survivor with 124.24, and Sarge's Squad (Nick) went out of Lower's with 135.52. The Best in The 'Burgh (Ben) is the last team standing in Lower.

🏟️ Playoff Race
- Bad Attitude Gang (Mike) is the 5th seed at 5-3 and Jake's Jagoffs (Jake) the 6th, with Marco Clair Kardiac Attack (Dave) 7th at 4-4. Reilly's Reindeer (Joe) and Southside Shooters (Fetrow) hold the relegation spots at 2-6.

💸 Big Spenders
- Sarge's Squad (Nick) paid $37 for O. Cooper Jr., the top bid of the week, and started him for 0.0. Happy Valley Hammer Time (Tony) paid $25 for M. Lemon on Friday's waivers and $10 for G. Rousseau on Thursday's.

**Elite 5:**
1. Fightin Ferrets (Troz): 5-3 with a 46-18 all-play and 1319.36 points, the most in either tier. A perfect lineup this week, and the best start since 2016.
2. The Best in The 'Burgh (Ben): 6-2 with a 43-21 all-play and 1282.90 points. First in Lower's seeds on three straight wins, and the last team standing in Survivor.
3. Mike Vicks Dog Sitting Co. (Braiden): 6-2 with the best all-play in Upper at 56-32. The 0.24 loss to Tony ended five straight wins, with 21.0 left on the bench.
4. Bad Attitude Gang (Mike): A 54-34 all-play and Upper's most points, 1264.34. 5-3 on three straight wins after a perfect 171.36 lineup.
5. Turkey Hat Conglomerate (Ed): Only 3-5, but a 54-34 all-play ties for second in Upper, and 1245.86 points is the second-most there. Ed has the week's top score, 186.58, and the biggest Upper blowout.

**Coach of the Week:** Upper: Bad Attitude Gang (Mike), 0.0 left on the bench (171.36 of 171.36); runners-up Turkey Hat Conglomerate 6.7, Marco Clair Kardiac Attack 6.9. Lower: The Best in The 'Burgh (Ben), 0.0 (169.52 of 169.52), ahead of Fightin Ferrets, also 0.0, on score; then Steel City Champyinz 14.5. Nobody out. Could have won: Tony's Talented Team (lost by 1.74, 41.58 on the bench), Portly Primates (2.54, 24.18), Mike Vicks Dog Sitting Co. (0.24, 21.0), Marco Clair Kardiac Attack (1.54, 6.9). Biggest call: Southside Shooters benched T. Allgeier's 31.1 for B. Hall's 0.0.
**Survivor:** Upper: The Prodigal Sons out (124.24), four left. Lower: Sarge's Squad out (135.52); The Best in The 'Burgh is the last team standing.
**Credit Tracker:** Turkey Hat Conglomerate took the Upper blowout mark with 76.14. The other five leads held, and Burrow's 46.48 fell short of both Individual High marks.

**Results**
- Upper: Turkey Hat Conglomerate 186.58 def. Jake's Jagoffs 110.44: Mahomes' 31.44, Pollard's 25.7 and Gibbs' 22.8 made Ed's 186.58 the week's top Upper score, and the 76.14 margin is Upper's biggest this year. Jake is 5-3 and has lost two straight.
- Upper: Hadley's Comets 177.08 def. Reilly's Reindeer 142.22: Burrow's 46.48 was the week's top player score and ended Brian/Ron's skid. Joe left Darnold's 20.52 on the bench for Penix's -5.9.
- Upper: Bad Attitude Gang 171.36 def. The Big Bang Theory 141.72: Allen's 29.56, Murray's 22.9 and Hubbard's 17.9 powered a perfect lineup, Mike's first win over Dan since 2022. Higgins' 27.5 wasn't enough for Dan.
- Upper: South Hills FunShiners 159.68 def. The Prodigal Sons 124.24: Cousins' 34.18 carried BJ's fourth straight win and his first over Jon/Rick since 2024. Jon/Rick left Kincaid's 14.6 on the bench for Taylor's 1.7 and went out of Survivor.
- Upper: Southside Shooters 143.80 def. Marco Clair Kardiac Attack 142.26: Lawrence's 24.4, Warren's 20.3 and Irving's 20.0 won it by 1.54, even with Allgeier's 31.1 on Fetrow's bench. Dave left Gordon's 6.9 on the bench for Jackson's 0.0.
- Upper: Happy Valley Hammer Time 136.76 def. Mike Vicks Dog Sitting Co. 136.52: A 0.24 game in a first meeting ever. Tuten's 27.9 and Nix's 23.28 got Tony there, and Braiden left Gainwell's 15.0 on the bench for London's 2.8.
- Lower: The Best in The 'Burgh 169.52 def. Sarge's Squad 135.52: Cousins' 34.18 and Irving's 20.0 gave Ben the top Lower score and a perfect lineup. Nick's O. Cooper Jr., a $37 claim on Thursday's waivers, scored 0.0, and Sarge's went out of Survivor.
- Lower: The V-Unit 169.28 def. Steel City Champyinz 139.08: Burrow's 46.48 and Higgins' 27.5 made it four straight for Johnson, in a first meeting ever. Dom started Penix for -5.9 with McConkey's 8.6 on the bench.
- Lower: Fightin Ferrets 162.02 def. 👻 147.62: Allen's 29.56, Maye's 26.46 and Pollard's 25.7 beat 👻 by 14.40 in a perfect lineup. Troz is 5-3, his best start since 2016.
- Lower: Tommy Phamclub 147.44 def. Portly Primates 144.90: Daniels' 16.98 led a quiet lineup to a 2.54 win, with Dike's 21.1 on the bench. Charlie left C. Williams' 15.98 on the bench for Mayfield's 1.4.
- Lower: Camp Kes 142.22 def. Tony's Talented Team 140.48: Mahomes' 31.44 and Swift's 25.9 gave Bo his first win over Brooks, after three losses. Brooks left Belton's 17.5 on the bench for Hunter's 4.0 and lost by 1.74.

**Week 9 featured games**
- Upper: Hadley's Comets at The Prodigal Sons: Jon/Rick beat Brian/Ron in the 2022 championship game, and Brian/Ron have won the last two regular-season meetings. Brian/Ron lead Division D as the 4th seed at 4-4, and Jon/Rick are 3-5 and 9th, a game behind the playoff line.
- Upper: Jake's Jagoffs at Marco Clair Kardiac Attack: Jake holds the last wild card at 5-3 and Dave sits right behind in 7th at 4-4, so the winner owns the line. Dave won their last meeting, a 1.14-point game in the 2023 consolation round.
- Upper: Happy Valley Hammer Time at Turkey Hat Conglomerate: Tony is the 3rd seed at 4-4, and Ed is 3-5 and 10th off the biggest win of the year. Ed has won the last three regular-season meetings and their one playoff game, the 2022 quarterfinal.
- Lower: The Best in The 'Burgh at Tony's Talented Team: Ben is 6-2, the 1st seed and the Survivor winner. Brooks is 2-6 and 8th, and Ben won their last meeting by 21.60 in Week 13 last year.
- Lower: Steel City Champyinz at Portly Primates: Both are 4-4, a game off the three 5-3 teams chasing the promotion line, with Charlie 5th and Dom 6th. Charlie won their last meeting by 2.44 in Week 12 last year.
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
