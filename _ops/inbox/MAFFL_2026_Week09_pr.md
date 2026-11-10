## Week 9 draft — ready for your review
**Stat corrections applied (ESPN):**
- Week 8 · Upper · Southside Shooters 143.80 → 144.30 (vs Marco Clair Kardiac Attack, result unchanged)
- Week 8 · Upper · Hadley's Comets 177.08 → 176.58 (vs Reilly's Reindeer, result unchanged)
- Week 8 · Lower · Portly Primates 144.90 → 145.40 (vs Tommy Phamclub, result unchanged)
- Week 8 · Lower · Sarge's Squad 135.52 → 136.52 (vs The Best in The 'Burgh, result unchanged)
- Week 8 · Lower · MAFFL Ghost 147.62 → 147.81 (vs Fightin Ferrets, result unchanged)

weekly.html edits in the Week 8 object:
- `scoreA`/`scoreB` set to the four corrected values above, plus the Ghost's 147.81.
- Southside note: "won it by 1.54" → 2.04 (144.30 − 142.26). Marco's `couldHaveWon.lostBy` 1.54 → 2.04, and the Can You Believe This? item "by 1.54" → 2.04.
- Tommy/Portly note: "2.54 win" → 2.04 (147.44 − 145.40). Portly's `couldHaveWon.lostBy` 2.54 → 2.04, and the news item "by 2.54" → 2.04.
- Ferrets/Ghost note: "by 14.40" → 14.21 (162.02 − 147.81).
- `survivorNote` and the Survivor Watch item: Sarge's "135.52" → 136.52, and the gap to Burgh "34.00" → 33.00 (169.52 − 136.52).
- Left as published: Week 8 standings, creditTracker, highestWeekly, and the Coach board's `scored`/`leftOnBench` snapshot (board still shows 177.08 / 143.8 / 135.52 for those teams).

**Headline:** Sarge's Squad (Nick) scored 194.06, the week's top score, and edged Fightin Ferrets (Troz) by 7.50.
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ (Result: ✅ all required pieces present) · editorial checklist ✅
**What I did:**
- Wrote the Week 9 object from the facts file and ESPN report (standings, 11 results, Survivor, credit tracker, highestWeekly, Elite 5, Coach of the Week with board and calls, Week 10 previews).
- Headline leads with Sarge's Squad and Fightin Ferrets (neither was in the last two headlines). The Prodigal Sons' Upper Coach win is in a news item and Results.
- Individual High carried from Week 8 (Maye 47.46 Upper, Allen 46.82 Lower): Stroud's 44.36 fell short of both.
- Applied the Week 8 stat corrections to the earlier object (above) and stamped weekly.html Last Updated November 10, 2026. No version bump (no VERSION line).
**Needs your OK / questions:**
- Elite 5 #5 is Tommy Phamclub (6-3, 40-32 all-play) rather than Turkey Hat Conglomerate (57-42 all-play but 3-6). Easy to swap.
- Week 8's Coach board still shows pre-correction scores for the four corrected teams; I didn't recompute their bench numbers. Say so if you want them updated.
**LM to-do:** set ESPN 👻 Week 9 score to 147.04. Also re-enter the Week 8 👻 score as 147.81 (par changed from 147.62).

---
### The draft, as readers will see it
**Sarge's Squad (Nick) scored 194.06, the week's top score, and edged Fightin Ferrets (Troz) by 7.50.**
Reilly's Reindeer (Joe) beat South Hills FunShiners (BJ) by 31.52 on J. Love's 42.18, and BJ went out of Upper's Survivor.

**News reel**
🤯 Can You Believe This?
- The V-Unit (Johnson) left J. Love's 42.18 on the bench, more than any starter, for T. Lawrence's 15.58, and still beat 👻 by 19.86 for his fifth straight win.
- The Big Bang Theory (Dan) lost to Southside Shooters (Fetrow) by 12.10 with J. Hill's 18.2 on the bench for Z. Flowers' 3.3. Dan left 26.38 on the bench in all, and his best lineup would have won by 14.28.

💀 Survivor Watch
- South Hills FunShiners (BJ) went out of Upper's Survivor with 126.44, 8.04 behind Turkey Hat Conglomerate (Ed). Mike Vicks Dog Sitting Co. (Braiden), Ed and Fetrow are the three left.

💸 Big Spenders
- The Prodigal Sons (Jon/Rick) paid $89 for G. Minshew II on Thursday's waivers, the top bid of the week, and beat Hadley's Comets (Brian/Ron) by 23.74 while leaving only 4.3 on the bench.

🏟️ Playoff Race
- Jake's Jagoffs (Jake) has lost three straight and holds the last wild card only on credits, 15 to 12 over Marco Clair Kardiac Attack (Dave), with both at 5-4.
- The Best in The 'Burgh (Ben) is 7-2 on four straight wins, with Tommy Phamclub (Sam) and The V-Unit (Johnson) 6-3 behind. Sam holds the 2nd promotion spot on 8 credits to Johnson's 0.

**Elite 5:** 1. Fightin Ferrets (Troz): 53-19 all-play and 1505.92 points, the most in either tier; Maye's 21.26 sat on the bench in the 7.50 loss. 2. The Best in The 'Burgh (Ben): 7-2 on four straight wins, 48-24 all-play, last team standing in Survivor. 3. Bad Attitude Gang (Mike): 64-35 all-play, tied for best in Upper, and the most Upper points, 1427.60. 4. Mike Vicks Dog Sitting Co. (Braiden): the other 64-35 all-play, 1372.80 points, 6-3. 5. Tommy Phamclub (Sam): 6-3 and second in Lower, 40-32 all-play, 1416.78 points.
**Coach of the Week:** Upper: The Prodigal Sons left 4.3 on the bench (176.76 of 181.06); runners-up Southside Shooters 4.6, Bad Attitude Gang 5.7. Lower: Sarge's Squad left 0.0, a perfect lineup (194.06); runners-up Camp Kes 0.6, Tommy Phamclub 10.4. Could have won: Big Bang Theory (lost by 12.1, left 26.38), Fightin Ferrets (7.5, 16.96), Portly Primates (12.84, 15.32), Mike Vicks Dog Sitting Co. (7.64, 13.2).
**Survivor:** Upper: South Hills FunShiners out with 126.44 (3 left). Lower: no change, The Best in The 'Burgh is the winner.
**Credit Tracker:** No lead changed hands this week. Bad Attitude Gang and Fightin Ferrets stretched their points leads, and Stroud's 44.36 fell short of both Individual High marks.

**Results**
- Upper: The Prodigal Sons 176.76 def. Hadley's Comets 153.02: Young's 24.34, Watson's 23.1 and Reese's 22.5 made Jon/Rick's 176.76 the week's top Upper score, with just 4.3 left on the bench. It's his first win over Brian/Ron since 2023.
- Upper: Bad Attitude Gang 163.26 def. Mike Vicks Dog Sitting Co. 155.62: Schwesinger's 24.0 and Shough's 21.7 won a first meeting ever. Braiden left 13.2 on the bench, and his best lineup would have won by 5.56.
- Upper: Reilly's Reindeer 157.96 def. South Hills FunShiners 126.44: Love's 42.18 and McCaffrey's 20.7 beat BJ by 31.52 and sent South Hills FunShiners out of Survivor. Joe left Sanders' 26.68 on the bench for Penix's 14.48.
- Upper: Marco Clair Kardiac Attack 152.06 def. Jake's Jagoffs 123.74: Stroud's 44.36 was the week's top player score, and Dave won by 28.32. Jake has lost three straight.
- Upper: Happy Valley Hammer Time 148.06 def. Turkey Hat Conglomerate 134.48: Purdy's 28.28 and Nix's 18.68 gave Tony his first win over Ed since 2021, ending a four-game skid in the series. Ed started M. Lloyd, who didn't play.
- Upper: Southside Shooters 144.28 def. The Big Bang Theory 132.18: Irving's 24.5 and Lamb's 22.5 beat Dan by 12.10 and kept Fetrow alive in Survivor. Dan left Hill's 18.2 on the bench for Flowers' 3.3.
- Lower: Sarge's Squad 194.06 def. Fightin Ferrets 186.56: Stroud's 44.36, Prescott's 22.5 and Golden's 22.4 powered a perfect lineup in a first meeting ever. Troz left Maye's 21.26 on the bench for Goff's 4.3 and lost by 7.50.
- Lower: The V-Unit 166.90 def. MAFFL Ghost 147.04: Burrow's 35.54 and Watson's 23.1 beat 👻 by 19.86 for Johnson's fifth straight win, with Love's 42.18 on the bench.
- Lower: The Best in The 'Burgh 155.62 def. Tony's Talented Team 131.28: Purdy's 28.28 and Irving's 24.5 made it four straight for Ben. Brooks left Shough's 21.7 on the bench for McCarthy's 7.28 and has lost four in a row.
- Lower: Tommy Phamclub 152.80 def. Camp Kes 123.58: Young's 24.34 and Lamb's 22.5 led Sam to a win in a first meeting ever. Bo left only 0.6 on the bench, the second-best lineup in Lower.
- Lower: Steel City Champyinz 136.20 def. Portly Primates 123.36: Reese's 22.5 and Chase's 21.5 gave Dom his first win over Charlie, after two losses. Charlie started T. McDuffie, who didn't play, and left 15.32 on the bench.

**Week 10 featured games**
- Upper: Marco Clair Kardiac Attack at Reilly's Reindeer: Joe has won the last three regular-season meetings and last year's semifinal, 175.94-162.48. Dave is 5-4 and 7th, on the wrong side of the playoff line, and Joe is 3-6 and 10th.
- Upper: Mike Vicks Dog Sitting Co. at Southside Shooters: Braiden is 6-3 and the 2nd seed, and Fetrow is 3-6 in a relegation spot, but both are alive in Survivor. Fetrow has won the last two regular-season meetings, including last year's Week 10.
- Upper: Jake's Jagoffs at South Hills FunShiners: BJ has won the last three regular-season meetings, but Jake took the 2015 quarterfinal and the 2021 semifinal. BJ is 6-3 and the 5th seed, and Jake is 5-4 and 6th on credits, so the winner owns the wild-card line.
- Lower: Tommy Phamclub at Steel City Champyinz: Sam is 6-3 and holds the 2nd promotion spot, and Dom is 5-4 and 4th, a game back. Sam won their Week 1 meeting.
- Lower: Sarge's Squad at The V-Unit: Johnson is 6-3 and 3rd on five straight wins, and Nick is 5-4 and 5th off a 194.06 week. Johnson won their Week 1 meeting.
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
