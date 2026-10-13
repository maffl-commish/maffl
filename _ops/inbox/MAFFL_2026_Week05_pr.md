## Week 5 draft — ready for your review
**Stat corrections applied (ESPN):**
- Week 4 · Upper · Reilly's Reindeer 104.30 → 103.30
- Week 4 · Lower · Fightin Ferrets 176.90 → 175.90
- Week 4 · Lower · Portly Primates 148.32 → 147.32
- Week 4 · Lower · MAFFL Ghost 145.67 → 145.54 (👻 par)

`weekly.html` edits in the Week 4 object: Reilly's `scoreB` 104.3 → 103.3; Ferrets `scoreA` 176.9 → 175.9; Portly `scoreA` 148.32 → 147.32; Ghost `scoreA` 145.67 → 145.54. Prose: Dan's margin 46.42 → 47.42 (150.72 − 103.30); Reilly's Survivor figure 104.30 → 103.30 (survivorNote, news reel), "7.88 behind" → "8.88 behind" (112.18 − 103.30); Portly–Burgh margin 1.58 → 0.58 (147.32 − 146.74) in the result note, Elite 5 note, couldHaveWon `lostBy` and news reel; Ferrets 176.90 → 175.90 and 651.84 → 650.84 in latestChange, Elite 5 and Credit Watch. Standings, creditTracker and highestWeekly snapshots left as published.
**Headline:** Mike Vicks Dog Sitting Co. (Braiden) put up 189.86 behind D. Maye's 47.46, the top score in either tier.
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ all required pieces present · ⚠️ 2 balance notes (Reilly's in the subhead; see below) · editorial checklist ✅
**What I did:**
- Applied the four Week 4 stat corrections to the Week 4 object (above).
- Wrote the Week 5 object: standings, 11 results, Survivor, credit tracker, highestWeekly, Elite 5, Coach of the Week (both tiers, board, calls), 6 news items, and the Week 6 preview (3 Upper + 2 Lower featured).
- Stamped `Last Updated October 13, 2026`. No VERSION line, so the version stays v6.3.
**Needs your OK / questions:**
- The checker warns that Reilly's Reindeer is in the subhead again. I kept it because the 69.24 win is Upper's biggest blowout this season and Joe's first win. Say the word and I'll swap it.
- Week 4 Coach of the Week `board` rows for Reilly's, Ferrets and Portly still show the old `scored` values (the corrections file gives only the score changes, not the new bench numbers), so their bench figures may be off by 1.0.
- Week 4 `highestWeekly` Lower still reads 176.90 for Ferrets (snapshot left as published); the holder doesn't change.
- Elite 5 #5: I picked Tommy Phamclub (4-1, 24-16 all-play) over Hadley's Comets (3-2, 35-20) to keep Lower represented. Easy to flip.
**LM to-do:** set ESPN 👻 Week 5 score to 161.96, and re-enter 👻 Week 4 as 145.54.

---
### The draft, as readers will see it
**Mike Vicks Dog Sitting Co. (Braiden) put up 189.86 behind D. Maye's 47.46, the top score in either tier.**
Reilly's Reindeer (Joe) won for the first time by 69.24, the biggest Upper blowout this season.

**News reel**
🤯 Can You Believe This?
- Fightin Ferrets (Troz) left Maye's 47.46 on the bench, a score that would have topped Lower's season high of 46.82, and started J. Allen's 31.5. Troz still won by 54.74.
- The V-Unit (Johnson) started a bye, two inactive players and an empty slot, and left C. Watson's 26.3 on the bench. Johnson still beat Camp Kes (Bo) by 17.48.
- Happy Valley Hammer Time (Tony) benched A. Rodgers' 28.0, more than any starter he played, and started B. Nix's 8.92. Tony lost by 47.12.

💸 Big Spenders
- The Prodigal Sons (Jon/Rick) paid $31 on Saturday's Upper waivers for T. Bagent, the week's top bid, and started him for -0.82. They won by 47.12 anyway. Lower's top bid was $20 from Tommy Phamclub (Sam) for D. Watson.

💀 Survivor Watch
- Portly Primates (Charlie) went out of Lower's Survivor with 133.80, 23.58 behind Sarge's Squad (Nick). Eleven teams are left, seven in Upper and four in Lower.

🪙 Credit Watch
- Turkey Hat Conglomerate (Ed) took Upper's points lead at 810.68, and Maye's 47.46 for Mike Vicks Dog Sitting Co. (Braiden) passed J. Allen's 46.82 for Upper Individual High.

**Elite 5:** 1. Fightin Ferrets (Troz): 30-10 all-play, best in either tier; 839.38 points lead Lower. 2. Mike Vicks Dog Sitting Co. (Braiden): 4-1, 37-18 all-play, three straight wins. 3. Jake's Jagoffs (Jake): 36-19 all-play, 4-1, leads Upper's seeds. 4. Turkey Hat Conglomerate (Ed): Upper's most points, 810.68, 36-19 all-play, but 2-3. 5. Tommy Phamclub (Sam): 4-1, first in Lower's seeds, 24-16 all-play.
**Coach of the Week:** Upper: Mike Vicks Dog Sitting Co. (Braiden) left 0.5 on the bench (189.86 of 190.36). Lower: Tommy Phamclub (Sam) left 0.1 (182.34 of 182.44). The V-Unit is out of the Lower race with 4 holes.
**Survivor:** Upper: Bad Attitude Gang out with 102.24. Lower: Portly Primates out with 133.80.
**Credit Tracker:** Four leads changed hands. Turkey Hat Conglomerate (Ed) took Upper points and Fightin Ferrets (Troz) took Lower points, Reilly's Reindeer (Joe) took the Upper blowout at 69.24, and Maye's 47.46 took Upper Individual High.

**Results**
- Mike Vicks Dog Sitting Co. 189.86 def. Hadley's Comets 170.94: Maye's 47.46 was the top score in either tier and made it three straight for Braiden. Brian/Ron left Winston's 30.74 on the bench and lost by 18.92.
- The Prodigal Sons 173.40 def. Happy Valley Hammer Time 126.28: Stafford's 33.32 ended Jon/Rick's three-game skid. Tony benched Rodgers' 28.0, more than any starter he played.
- Reilly's Reindeer 171.48 def. Bad Attitude Gang 102.24: Love's 29.28 powered Joe's first win of the year, by 69.24, Upper's biggest margin of 2026. Mike went out of Survivor with Upper's lowest score.
- Southside Shooters 166.82 def. Jake's Jagoffs 140.64: Warren's 30.8 and Irving's 29.5 gave Fetrow his first win and ended Jake's unbeaten start. Jake left Golden's 16.3 on the bench.
- South Hills FunShiners 164.20 def. Turkey Hat Conglomerate 150.74: Ed benched Freiermuth's 16.5 for J. Johnson's 1.6 and lost by 13.46. BJ is one win from his 150th regular-season win.
- Marco Clair Kardiac Attack 136.08 def. The Big Bang Theory 110.56: Huntley's 28.04 kept Dave's best start since 2021 going. Dan's 110.56 was Upper's second-lowest score.
- Tony's Talented Team 190.84 def. Steel City Champyinz 148.42: Gibbs' 32.7 and Washington's 25.4 made Brooks' 190.84 the top score in Lower. Dom's Stafford had 33.32 and little else.
- Fightin Ferrets 188.54 def. Portly Primates 133.80: Goff's 34.94 and Warren's 30.8 carried Troz in their first meeting ever, with Maye's 47.46 on his bench. Charlie went out of Survivor.
- Tommy Phamclub 182.34 def. The Best in The 'Burgh 174.78: Daniels' 32.26 and Brissett's 29.28 evened Sam's series with Ben at 1-1. Ben lost by 7.56 with Warren's 14.4 on the bench.
- The V-Unit 163.94 def. Camp Kes 146.46: Burrow's 32.6 beat Bo even with an empty slot, a bye and two inactive starters. It's Johnson's first win over Bo since 2020.
- MAFFL Ghost 161.96 def. Sarge's Squad 157.38: Nick lost to 👻 by 4.58 with Evans' 19.3 on his bench. Stroud's 22.94 led his lineup.

**Week 6 featured games**
- Marco Clair Kardiac Attack at Mike Vicks Dog Sitting Co.: Dave has won two straight and holds the #3 seed. Braiden has won three and is the #5, the first wild card. Braiden took their last meeting, in Week 13 last year, by 33 points.
- Happy Valley Hammer Time at Jake's Jagoffs: The #2 seed visits the #1 seed, which is off its first loss. Tony has won the last two regular-season meetings, and Jake needs to stop that streak to hold the top spot.
- Reilly's Reindeer at The Prodigal Sons: A rematch of last year's championship, which Jon/Rick won 147.92 to 116.54, and of the 2014 final that Joe won. Joe is off his first win and still in a relegation spot; Jon/Rick are the 8th seed.
- Fightin Ferrets at Tommy Phamclub: Their first meeting ever, between the top two Lower teams in points. Sam is 4-1 and the #1 seed. Troz is 5th, with the best all-play in either tier and one credit.
- Steel City Champyinz at The Best in The 'Burgh: Ben beat Dom by 51 points last year in Week 9. He's the #2 seed, on the promotion line, and Dom is 4th, two spots back after a loss.
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
