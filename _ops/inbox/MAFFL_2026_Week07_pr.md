## Week 7 draft — ready for your review
**Stat corrections applied (ESPN):**
- Week 6 · Upper · Mike Vicks Dog Sitting Co. 151.06 → 151.56 (vs Marco Clair Kardiac Attack, result unchanged)
- Week 6 · Upper · The Prodigal Sons 160.32 → 159.32 (vs Reilly's Reindeer, result unchanged)
- Week 6 · Upper · The Big Bang Theory 125.86 → 125.36 (vs Turkey Hat Conglomerate, result unchanged)
- Week 6 · Upper · Turkey Hat Conglomerate 107.68 → 106.68 (vs The Big Bang Theory, result unchanged)
- Week 6 · Lower · Sarge's Squad 178.70 → 178.20 (vs Camp Kes, result unchanged)
- Week 6 · Lower · Fightin Ferrets 171.50 → 172.00 (vs Tommy Phamclub, result unchanged)
- Week 6 · Lower · MAFFL Ghost 141.19 → 141.25 (vs Tony's Talented Team, result unchanged)

`weekly.html` edits in the Week 6 object (scores and every margin they touch, arithmetic from the corrected scores):
- Scores (results, coach board `scored`): MVDSC 151.56, Prodigal 159.32, Big Bang 125.36, Turkey Hat 106.68, Sarge's 178.20, Ferrets 172.00, 👻 141.25. Board `best` / `leftOnBench` left as ESPN printed them.
- Mike Vicks over Marco: 151.56 − 150.58 = **0.98** (was 0.48). Fixed in the results note, the Elite 5 note, the couldHaveWon row and the "Dave lost by 0.48" news item. Dave's best-lineup margin 12.3 − 0.98 = **11.32** (was 11.82).
- Prodigal over Reilly's Reindeer: 159.32 − 134.56 = **24.76** (was 25.76). Fixed in the couldHaveWon row and the Coach note.
- Sarge's over Camp Kes: 178.20 − 122.9 = **55.30** (was 55.80). Fixed in the headline; "178.70" → 178.20 in the Sarge's results note and the Week 7 preview note.
- Ferrets over Tommy Phamclub: 172.00 − 151.24 = **20.76** (was 20.26). Fixed in the Big Spenders item.
- 👻 over Tony's Talented Team: 141.25 − 134.44 = **6.81** (was 6.75). Fixed in the results note, the couldHaveWon row and the news item.
- Turkey Hat dropped to 106.68, so Hadley's 100.30 trails it by 106.68 − 100.30 = **6.38** (was 7.38). Fixed in the Survivor note and news item.
- Not touched, as published: Week 6 standings, creditTracker and the `highestWeekly` Week 6 snapshot (still shows Sarge's 178.70). The new Week 7 `highestWeekly` list carries the corrected 178.20 for Week 6.

**Headline:** The Big Bang Theory (Dan) posted 187.74, the week's top score, and beat Hadley's Comets (Brian/Ron) by 56.88.
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ (Result: ✅ all required pieces present · ⚠️ 1 balance note(s)) · editorial checklist ✅
**What I did:**
- Wrote the Week 7 object from the facts file and ESPN report: standings, 11 results, Survivor, credit tracker, Elite 5, Coach of the Week (with board, 6 missed calls, 3 could-have-wons), news reel, Week 8 preview.
- Applied the 7 Week 6 stat corrections to the Week 6 object (above).
- Stamped `Last Updated October 27, 2026`; no `VERSION:` line, so the version pill stays v6.3.
**Needs your OK / questions:**
- Coverage warning kept: the facts file lists only one team nobody wrote about in 3 Pulses (Steel City Champyinz), so "2+ cold teams" can't be met. Steel City is in the subhead and one news item.
- Elite 5 #4 is Bad Attitude Gang (your team) on the rubric alone (45-32 all-play, 4th best among the Elite candidates, most Upper points). Swap with Tommy Phamclub if you'd rather not have it there.
- ESPN's cross-tier check flagged "J. Williams" (21.5 Upper RB for Big Bang, 21.1 Lower WR for Steel City). They are different players (RB vs WR), so I treated it as a false alarm. Data log shows no failed step.
**LM to-do:** set ESPN 👻 Week 7 score to 145.73, and re-enter the Week 6 👻 as 141.25 (par changed from 141.19).

---
### The draft, as readers will see it
**The Big Bang Theory (Dan) posted 187.74, the week's top score, and beat Hadley's Comets (Brian/Ron) by 56.88.**
Steel City Champyinz (Dom) led Lower with 175.52, and Marco Clair Kardiac Attack (Dave) beat The Prodigal Sons (Jon/Rick) by 44.12.

**News reel**
- 🤯 Can You Believe This?
  - Fightin Ferrets (Troz) benched T. Pollard's 33.5, more than any starter Troz played, and lost to Steel City Champyinz (Dom) by 29.56. Troz's best lineup would have won by 9.04.
- 🔥 Hot & Not
  - Camp Kes (Bo) scored 94.18, the lowest Lower score in 175 games since 2025, and benched K. Murray's 15.9, more than any starter. Bo has lost four straight and is 1-6.
  - South Hills FunShiners (BJ) beat Happy Valley Hammer Time (Tony) 145.18-135.00, BJ's first win over Tony since 2013 after four straight losses. Tony's best lineup would have won by 0.28.
  - Sarge's Squad (Nick) beat Tony's Talented Team (Brooks) for the first time ever, 172.90-159.26. Brooks left 18.18 on the bench, and his best lineup would have won by 4.54.
- 💀 Survivor Watch
  - Jake's Jagoffs (Jake) went out of Upper's Survivor with 84.76, the 3rd-lowest Upper score since 2025. Fightin Ferrets (Troz) went out of Lower's, 19.06 behind The Best in The 'Burgh (Ben). Seven teams are left.
- 💸 Big Spenders
  - South Hills FunShiners (BJ) topped Thursday's Upper waivers with $70 on J. Coleman. The Prodigal Sons (Jon/Rick) paid $17 for O. Cooper Jr. and then left his 17.5 on the bench.

**Elite 5:**
1. Mike Vicks Dog Sitting Co. (Braiden): 6-1 with the best all-play in Upper at 54-23 and five straight wins. Maye's 30.44 won a 5.24 game over Ed.
2. Fightin Ferrets (Troz): A 40-16 all-play and 1157.34 points are the best in Lower, and the points lead both tiers. A loss with 38.6 left on the bench, and his best lineup would have won.
3. The Best in The 'Burgh (Ben): 5-2 with a 35-21 all-play and 1113.38 points. First in Lower's seeds, and one of two teams left in Survivor.
4. Bad Attitude Gang (Mike): A 45-32 all-play and Upper's most points, 1092.48. 4-3 with two straight wins, and 25.0 left on the bench.
5. Tommy Phamclub (Sam): 4-3 and second in Lower's seeds on credits, with a 31-25 all-play and 1116.54 points. Lost to The V-Unit by 24.94 in a first meeting.

**Coach of the Week:**
- Upper: Reilly's Reindeer (Joe) left 0.0 on the bench, a perfect 160.88 lineup (South Hills FunShiners also 0.0; Joe's higher score won the tie). Next: South Hills 0.0, Turkey Hat Conglomerate 3.0.
- Lower: Portly Primates (Charlie) left 4.0 (143.80 of a possible 147.80). Next: Tommy Phamclub 6.0, The V-Unit 8.22.
- Could have won: Fightin Ferrets (lost by 29.56, left 38.6), Tony's Talented Team (13.64, 18.18), Happy Valley Hammer Time (10.18, 10.46).
- Biggest calls: Pollard 33.5 over Walker 5.7 (Ferrets, 27.8); J. Williams 21.1 over Noel 1.7 (Southside Shooters, 19.4); Higgins 20.8 over Shaheed 3.1 (Big Bang, 17.7); Burden III 19.7 over Bernard 2.7 (Bad Attitude, 17.0); O. Cooper Jr. 17.5 over Coker 0.9 (Prodigal, 16.6); Concepcion 15.2 over Hurst III 0.0 (Hadley's, 15.2).
**Survivor:** Upper: Jake's Jagoffs out (84.76), 5 left. Lower: Fightin Ferrets out (145.96), 2 left (Sarge's Squad, The Best in The 'Burgh).
**Credit Tracker:** No lead changed hands this week. Both points leaders, both blowout marks and both Individual High marks held.

**Results** (one line each):
- Upper: The Big Bang Theory 187.74 def. Hadley's Comets 130.86: Willis' 30.02, C. Williams' 26.12 and J. Williams' 21.5 made Dan's 187.74 the week's top score. Burrow's 36.88 was the best in Upper and Brian/Ron still lost for the fourth straight week.
- Upper: Reilly's Reindeer 160.88 def. Southside Shooters 116.80: Penix's 26.42 and Singleton's 20.5 powered Joe's perfect lineup, and he is 5-0 against Fetrow. Fetrow sat J. Williams' 21.1 for Noel's 1.7.
- Upper: Marco Clair Kardiac Attack 156.14 def. The Prodigal Sons 112.02: Stroud's 20.52 and Gordon's 16.3 led Dave to a 44.12 win. Jon/Rick left O. Cooper Jr.'s 17.5 on the bench for Coker's 0.9.
- Upper: Mike Vicks Dog Sitting Co. 147.16 def. Turkey Hat Conglomerate 141.92: Maye's 30.44 settled a 5.24 game, Braiden's fifth straight win. Pollard's 33.5 for Ed still wasn't enough, and Ed has lost four straight.
- Upper: South Hills FunShiners 145.18 def. Happy Valley Hammer Time 135.00: G. Smith's 28.48 and Cousins' 24.4 gave BJ his first win over Tony since 2013. Tony's best lineup would have won by 0.28.
- Upper: Bad Attitude Gang 134.22 def. Jake's Jagoffs 84.76: Judkins' 22.4 and Smith-Njigba's 22.3 beat a Jake lineup that scored 84.76, the 3rd-lowest Upper score since 2025. It was Mike's first win over Jake since 2024.
- Lower: Steel City Champyinz 175.52 def. Fightin Ferrets 145.96: Penix's 26.42, Stafford's 22.5 and J. Williams' 21.1 gave Dom the top Lower score in their first meeting ever. Troz benched Pollard's 33.5.
- Lower: Sarge's Squad 172.90 def. Tony's Talented Team 159.26: Prescott's 29.28 and Cashman's 21.0, a $3 claim on Thursday's waivers, gave Nick his first win ever over Brooks.
- Lower: The Best in The 'Burgh 165.02 def. MAFFL Ghost 145.73: Cousins' 24.4, Irving's 23.0 and Smith-Njigba's 22.3 beat 👻 by 19.29. Ben is 5-2 and still alive in Survivor.
- Lower: The V-Unit 154.84 def. Tommy Phamclub 129.90: Burrow's 36.88 was bigger than the 24.94 margin, Johnson's third straight win. It was their first meeting ever.
- Lower: Portly Primates 143.80 def. Camp Kes 94.18: G. Smith's 28.48 and C. Williams' 26.12 carried Charlie in a first meeting ever. Bo's 94.18 is the lowest Lower score since 2025, with Murray's 15.9 on the bench.

**Week 8 featured games:**
- Jake's Jagoffs at Turkey Hat Conglomerate: Jake is 5-2 and the 5th seed, the first wild card, and Ed is 2-5 and in a relegation spot after four straight losses. Ed has won the last three regular-season meetings, the latest in Week 8 of 2021.
- Reilly's Reindeer at Hadley's Comets: Brian/Ron are the 4th seed at 3-4 but have lost four straight, and Joe is 2-5 and 10th. They split two playoff meetings: Joe won the 2017 quarterfinal and Brian/Ron the 2022 semifinal.
- Mike Vicks Dog Sitting Co. at Happy Valley Hammer Time: A first meeting ever. Braiden is 6-1 on five straight wins and holds the 1st seed, and Tony is 3-4, ninth, on a three-game skid.
- Portly Primates at Tommy Phamclub: Both are 4-3 on the promotion line: Sam holds 2nd on 8 credits and Charlie is 3rd on 6, so the winner owns the line. Charlie won their last meeting, in last year's Week 17 consolation game.
- Sarge's Squad at The Best in The 'Burgh: The last two Lower teams in Survivor meet, so one goes home. Ben is 5-2 and the 1st seed, Nick is 4-3 and 5th, and Ben won their last meeting, in Week 11 last year.
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
