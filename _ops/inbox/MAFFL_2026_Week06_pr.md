## Week 6 draft — ready for your review
**Stat corrections applied (ESPN):**
- Week 5 · Upper · Reilly's Reindeer 171.48 → 171.98 (vs Bad Attitude Gang, result unchanged)
- Week 5 · Lower · MAFFL Ghost 161.96 → 162.02 (vs Sarge's Squad, result unchanged)
- Week 5 · Lower · Sarge's Squad 157.38 → 157.88 (vs MAFFL Ghost, result unchanged)

`weekly.html` edits in the Week 5 object for these:
- Reilly's `scoreA` 171.48 → 171.98; Ghost `scoreA` 161.96 → 162.02; Sarge's `scoreB` 157.38 → 157.88.
- Reilly's margin: 171.98 − 102.24 = 69.74 (was 69.24). Fixed in the subhead, `latestChange` and the Reilly's result note.
- Sarge's margin: 162.02 − 157.88 = 4.14 (was 4.58). Fixed in the result note and `couldHaveWon.lostBy`.
- Coach board `scored` updated for Reilly's (171.98) and Sarge's (157.88). I did NOT touch their `best` / `leftOnBench`, because the corrections file doesn't give new bench numbers. They may be off by up to 0.5.
- Left as published (per recipe): Week 5 creditTracker "69.24 over Bad Attitude Gang" snapshot, standings, highestWeekly. This week's tracker carries 69.74.

**Headline:** Sarge's Squad (Nick) scored 178.70, the top score in either tier, and beat Camp Kes (Bo) by 55.80.
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ (Result: ✅ all required pieces present, no ⚠️) · editorial checklist ✅
**What I did:**
- Wrote the Week 6 object from the facts file and ESPN report: standings, 11 results, Survivor, Credit Tracker, highestWeekly, Elite 5, Coach of the Week, Week 7 preview.
- Led with Lower (Sarge's Squad) because the last two headlines were all Upper. News reel gives items to South Hills FunShiners, The Big Bang Theory and Tony's Talented Team, who were uncovered, and 5 of 6 items mention a Lower team.
- Bad Attitude Gang is not in the reel or headline, and not featured in the preview. It took the Upper points lead (credit tracker only).
- Reilly's Reindeer and Hadley's Comets each had a "bench beat every starter" week, but both are already heavy in coverage, so they stay in Results and the Coach card, not the reel.
- Stamped Last Updated Oct 20, 2026. No VERSION line, so v6.3 is unchanged.
**Needs your OK / questions:**
- Elite 5 #5: Bad Attitude Gang (41-25 all-play, Upper's most points, but 3-3) and The Best in The 'Burgh (29-19, 4-2) were close. I took the Burgh because the rubric didn't clearly favor the commish team.
- Hadley's Comets' and Marco's biggest bench swings were `[shuffle]` rows, so they're not in Biggest lineup calls (recipe says skip those). Marco's entry is the smaller Egbuka/Pickens call (2.5, cost the game).
- Week 5 Coach board `best` / `leftOnBench` for Reilly's and Sarge's not recomputed (see above).
**LM to-do:** set ESPN 👻 Week 6 score to 141.19. Also re-enter the 👻 Week 5 score as 162.02 (corrected from 161.96).

---
### The draft, as readers will see it
**Sarge's Squad (Nick) scored 178.70, the top score in either tier, and beat Camp Kes (Bo) by 55.80.**
The V-Unit (Johnson) beat Portly Primates (Charlie) by 2.20 with a perfect lineup and T. Lawrence's 34.34.

**News reel**
*Can You Believe This?*
- 🤯 Tony's Talented Team (Brooks) lost to 👻 by 6.75 after benching T. McKee's 14.6 for J. Winston's 6.48 in the OP slot. That 8.12 swing was bigger than the margin.
- 🤯 Marco Clair Kardiac Attack (Dave) lost to Mike Vicks Dog Sitting Co. (Braiden) by 0.48 and left 12.3 on the bench. Dave's best lineup would have won by 11.82.

*Hot & Not*
- 🔥 South Hills FunShiners (BJ) won the 150th regular-season game of his career, 134.20-100.30, and leads Division A at 4-2.
- 🔥 The Big Bang Theory (Dan) won career regular-season game No. 100 and beat Turkey Hat Conglomerate (Ed) for the first time since 2023. Ed has lost three straight.

*Survivor Watch*
- 💀 Hadley's Comets (Brian/Ron) went out of Upper's Survivor with 100.30, 7.38 behind Turkey Hat Conglomerate (Ed). Tony's Talented Team (Brooks) went out of Lower's, 0.64 behind The Best in The 'Burgh (Ben). Nine teams are left.

*Big Spenders*
- 💸 Fightin Ferrets (Troz) spent $74 on Thursday's Lower waivers, $32 on D. Boston and $21 each on P. Wilson and E. Williams, and won by 20.26. Boston started for 1.5.

**Elite 5:**
1. Fightin Ferrets (Troz): 37-11 all-play, best in either tier, 1010.88 points lead Lower; 4-2 with three straight wins, best start since 2016.
2. Mike Vicks Dog Sitting Co. (Braiden): 5-1, best Upper all-play at 46-20, four straight wins; beat Marco by 0.48 with 17.34 on the bench.
3. Jake's Jagoffs (Jake): 42-24 all-play, 921.40 points, back in the win column; 5-1 and the top seed.
4. Tommy Phamclub (Sam): 4-2 and first in Lower's seeds on credits, 30-18 all-play, 986.64 points.
5. The Best in The 'Burgh (Ben): 4-2, 29-19 all-play, 0.64 from Survivor's last cut; 2nd in Lower's seeds.

**Coach of the Week:**
- Upper: Southside Shooters (Fetrow), 0.0 left on the bench (145.94 of 145.94). Runners-up: The Prodigal Sons 0.1, Happy Valley Hammer Time 1.1.
- Lower: The V-Unit (Johnson), 0.0 left on the bench (144.18 of 144.18). Runners-up: Steel City Champyinz 0.5, Sarge's Squad 1.4.
- Note: Reilly's Reindeer (Joe) left 40.28 on the bench, including Penix's 28.1 for Darnold's 9.02, and lost by 25.76.
- Could have won: Reilly's Reindeer (lost by 25.76, 40.28 bench); Tony's Talented Team (lost by 6.75, 12.42); Marco Clair Kardiac Attack (lost by 0.48, 12.3).

**Survivor:** Upper: Hadley's Comets out (100.30). Lower: Tony's Talented Team out (134.44). Nine left of 21.
**Credit Tracker:** One lead changed hands. Bad Attitude Gang (Mike) took Upper points at 958.26, while Reilly's Reindeer's 69.74 blowout and both Individual High marks held.

**Results** (one line each):
- Upper: Bad Attitude Gang 167.96 def. Southside Shooters 145.94: Shough's 32.96 and Allen's 22.3 carried Mike; Fetrow had a perfect lineup and Lawrence's 34.34 and still lost by 22.02.
- Upper: The Prodigal Sons 160.32 def. Reilly's Reindeer 134.56: Young's 23.84 and Cook's 21.3; Joe left 40.28 on the bench, including Penix's 28.1.
- Upper: Mike Vicks Dog Sitting Co. 151.06 def. Marco Clair Kardiac Attack 150.58: Maye's 29.8 and Walker's 25.9 held on by 0.48; 12.3 sat on Dave's bench.
- Upper: Jake's Jagoffs 135.52 def. Happy Valley Hammer Time 121.78: Daniels' 25.0, Jake's first win over Tony since 2024.
- Upper: South Hills FunShiners 134.20 def. Hadley's Comets 100.30: BJ's career win No. 150; Brian/Ron out of Survivor with Pitts' 18.0 on the bench.
- Upper: The Big Bang Theory 125.86 def. Turkey Hat Conglomerate 107.68: Dan's career win No. 100 and first over Ed since 2023.
- Lower: Sarge's Squad 178.70 def. Camp Kes 122.90: Stroud's 27.98 and McCaffrey's 20.7; first meeting ever, Bo started two inactive players.
- Lower: Fightin Ferrets 171.50 def. Tommy Phamclub 151.24: Maye's 29.8 and Walker's 25.9; first meeting ever; Sam left Diggs' 10.4 on the bench.
- Lower: The V-Unit 144.18 def. Portly Primates 141.98: Lawrence's 34.34 and a perfect lineup; first meeting ever.
- Lower: MAFFL Ghost 141.19 def. Tony's Talented Team 134.44: Brooks lost by 6.75 with Shough's 32.96; McKee's 14.6 on the bench; out of Survivor.
- Lower: The Best in The 'Burgh 135.08 def. Steel City Champyinz 128.18: Cousins' 21.52 and Purdy's 19.36; Ben is 2-0 in the series.

**Week 7 featured games:**
- Upper: Marco Clair Kardiac Attack at The Prodigal Sons: 7th vs 8th seed, both 3-3, 24 credits to 12 is the gap; Dave won the last regular-season meeting, Jon/Rick the 2013 semifinal.
- Upper: South Hills FunShiners at Happy Valley Hammer Time: two division leaders, BJ 2nd seed, Tony 3rd; Tony has won the last four regular-season meetings.
- Upper: Reilly's Reindeer at Southside Shooters: both 1-5 in the two relegation spots; Joe has never lost to Fetrow, including the 2024 championship, 129.66 to 81.88.
- Lower: Tony's Talented Team at Sarge's Squad: Brooks won the last meeting by 35.78 but is 2-4 and out of Survivor; Nick has the week's top score and is one of three left.
- Lower: Steel City Champyinz at Fightin Ferrets: first meeting ever; Troz has the best all-play in either tier but 1 credit leaves him 3rd, a spot off the promotion line.
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
