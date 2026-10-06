# Weekly Pulse — Editorial Guide (Week 3 onward)

<!-- Migrated from claude.ai Project doc claude/PULSE_EDITORIAL_GUIDE.md on 2026-09-27. This repo copy is now canonical. -->

Standing content rules for writing each week's Pulse object. Paste this into the
**MAFFL Weekly Results Engine** project instructions (or attach it) so every weekly draft is
written to it. Requires `weekly.html` v5.0 (`PROMPT_pulse_v5_upgrades.md`).

---

## 1. Ground truths (don't write around these)

- **Player scoring is identical in both tiers.** The two auctions are separate, so the same NFL
  player can be on one roster in each tier, and he scores the same number in both. Never
  present that as a coincidence, a feat, or "both tiers at once." It's fine to mention a
  player inside a tier-specific story ("Todd had Allen's 46.82 and still lost by ten").
- **👻 is just an opponent from Week 3 on.** Don't use `ghost: true`, a `👻 Ghost` tag or
  `highlight: true` because the Ghost is involved. Mention a Ghost game only if it's actually
  news, like a real team losing to the Ghost or the Ghost's first win.
- **Credit balances don't move in-season.** The tracker shows who's *leading*, not who's been paid.

## 2. Naming, the one rule

**First mention in any item: `Team Name (Short)`. After that in the same item: `Short` only.**

- Short names come from `SHORT_NAMES` in `weekly.html`: Mike, Dave, BJ, Jake, Jon/Rick, Braiden,
  Tony, Dan, Joe, Brian/Ron, Ed, Fetrow, Sam, Ben, Troz, Brooks, Charlie, Johnson, Nick, Dom, Bo.
- Never use full owner names ("Dan Reilly") in news, headline, subhead, results or preview notes.
- Write team names exactly as they appear in standings. That's what makes the renderer's
  highlighter find them. Don't abbreviate ("Hadley's", "the Jagoffs") on first mention.
- The Ghost is `👻` in prose, never "MAFFL Ghost".

## 3. Headline + subhead (the collapsed News card)

- `headline`: **one sentence, ≤ 110 characters.** The week's single biggest story.
- `subhead`: optional, **one sentence, ≤ 150 characters.** A second beat or the stakes.
- Neither one repeats in the news reel. They're their own message.
- No stat dumps. If the sentence needs a semicolon, it's two stories.

## 4. News reel

- **5–6 items total. Hard cap 6.**
- **2–4 sections a week**, each with 1–3 items. Only use a section if you have something
  real for it. Never pad one.
- Each item ≤ ~40 words, one idea, and it ends on the punch.

### Section menu

| Section | Icon | What qualifies |
|---|---|---|
| Can You Believe This? | 🤯 | The absurd: a bench outscoring the lineup, a win by 0.4, a 200 in a loss |
| Big Spenders | 💸 | FAAB waiver bids. Top 1–3 by dollars and what they returned. Include $0 steals if notable |
| Hot & Not | 🔥 | Streaks, best/worst stretches, all-play extremes |
| Survivor Watch | 💀 | Who went out, who survived by less than a point, who's next on the bubble |
| Credit Watch | 🪙 | A credit lead changed hands, or a 🔒 Highest Weekly got locked in |
| Playoff Race | 🏟️ | Movement across the 6/7 playoff line, the 9/10 showdown line, or the Lower 2/3 promotion line |
| Trade Desk | 🤝 | Only when a trade happened (deadline is Dec 2) |
| Rivalry Corner | ⚔️ | A real history-backed rivalry game (use `rivalry.html` data) |

**Waiver times (added 2026-09-29).** ESPN stamps every claim in a waiver run with the run's
*processing* time (e.g. Thursday 3:12 a.m.). That is not when an owner bid or picked anyone up,
so never write it as one ("paid $10 at 3:12 a.m." is wrong). Say "on Thursday's waivers" instead.
Free-agent adds and drops carry their real times, so "cut him less than three hours after the
claim went through" is fine. The ESPN pull report lists waiver runs and real-time moves separately.

### Data shape

```js
newsReel: [
  { section: "Can You Believe This?", icon: "🤯", items: ["…"] },
  { section: "Big Spenders",          icon: "💸", items: ["…", "…"] },
  { section: "Playoff Race",          icon: "🏟️", items: ["…", "…"] }
]
```

## 4a. Spread the wealth (added 2026-10-06, commish ruling)

Twenty-one teams pay the same dues. Through Week 4 the Pulse kept landing on the same four Upper
teams while five teams (three of them Lower) never made a headline or the news reel. The facts file
now carries two sections that fix this; use both every week.

- **Coverage** (facts file) lists teams nobody wrote about in the last 3 Pulses, teams already
  mentioned 3+ times, and teams in the last 2 headlines.
  - **At least 2 news items go to "not written about" teams.** The Story hooks always have something.
  - **Max 2 headline/news mentions per team per week.**
  - **Headline rotation:** don't lead with a team that was in either of the last 2 headlines/subheads
    unless it's a league record, a first-ever, or the title race itself.
  - **At least 2 news items mention a Lower team.** Lower is half the league.
  - **Commissioner's team (Bad Attitude Gang):** in the reel only for a record-level fact, and never
    the headline two weeks running. Readers notice when the commish writes about himself.
- **Story hooks** (facts file) give every team history-backed material: series vs this week's
  opponent, streaks snapped, best/worst start in years, top-10 scores of the current scoring era
  (2025 on), career-win milestones, trophy case, old Coach of the Week totals. **Use history only from
  the hooks or the gold CSVs, never from memory.** One hook per item; don't stack three.
- Good uses: "Jake's Jagoffs (Jake) is 4-0 for the first time since 2005", "Portly Primates
  (Charlie) beat Ben for the first time", "Happy Valley Hammer Time (Tony) is 11-2 all-time against Fetrow."
- `check_pulse_week.py` prints a ⚠️ for each rule above that the draft misses. Fix them unless the
  week's story truly demands otherwise, and say why under "Needs your OK".

## 5. Credit Tracker

Every `creditTracker` item gets two new fields:

- `status: "leading"` for all six season-long awards (Most Points, Largest Blowout, Individual High).
  Use `"locked"` **only** if the award can't mathematically change. In practice that means after Week 14.
- `since`: the week the current leader took the lead. If the leader is the same as last week,
  carry last week's `since` forward. If the leader changed, set `since` to this week.

`highestWeekly` needs no status field. Each finished week's entry is always shown 🔒 Locked.

`latestChange` stays the collapsed line. Lead with the biggest change, like
"Two leads changed hands; Ed's blowout mark survived."

## 6. Elite 5 — how to rank

The goal is a list people argue about, not a formula. But every pick has to hold up against the
stat line the page now shows under each team (`W-L · PF · All-play W-L`).

**Primary (weigh these most)**

1. **All-play record.** How the team would do against every team in its tier, every week. It strips
   out schedule luck. This is the best single measure.
2. **Season points for,** ranked within tier.

**Secondary**

3. Actual record.
4. Quality wins: beat a team currently in the top half of its tier.
5. Recent form: last 2 weeks.

**Rules of thumb**

- Rank within tier first, then merge. Lower has 9 real teams against Upper's 12, so Lower rosters
  are deeper and raw points run a little hotter. Don't let raw PF alone push a Lower team over a
  comparable Upper team.
- A team 1-1 with an all-play near .500 doesn't go #1 because of one big week.
  Mention the big week in its note instead.
- No commissioner bump, either direction. Bad Attitude Gang earns #1 only if the rubric clearly puts it there — with several unbeaten teams, it usually won't. Don't lean on the commissioner's team for headlines or featured games either.
- Notes: one or two sentences, and they should explain the rank ("17-5 all-play — nobody has been
  better week-in, week-out").

**Worked example, Week 2 (all-play through two weeks)**

| Upper | Rec | PF | All-play | · | Lower | Rec | PF | All-play |
|---|---|---|---|---|---|---|---|---|
| Jake's Jagoffs | 2-0 | 324.9 | **17-5** | · | Tommy Phamclub | 2-0 | 357.2 | **13-3** |
| Mike Vicks Dog Sitting Co. | 1-1 | 283.3 | 14-8 | · | Fightin Ferrets | 1-1 | 332.3 | 13-3 |
| Turkey Hat Conglomerate | 1-1 | 315.4 | 13-9 | · | The Best in The 'Burgh | 2-0 | 307.9 | 11-5 |
| Hadley's Comets | 2-0 | 317.3 | 13-9 | · | Tony's Talented Team | 1-1 | 315.5 | 8-8 |
| Bad Attitude Gang | 1-1 | 340.0 | 12-10 | · | Portly Primates | 1-1 | 294.9 | 8-8 |

Under this rubric, Week 2's #1 is **Tommy Phamclub** or **Jake's Jagoffs**. Bad Attitude Gang
has the most Upper points and the only 200, but a 12-10 all-play puts it around #4–5.

## 7. Post-Season Picture

The card builds itself from standings. You only supply:

- `postseasonNote` (optional, one sentence): the most interesting line race, e.g.
  "Fightin Ferrets have the 2nd-most points in Lower and sit 7th — one credit is the whole story."
- `relegationInsurance: ["Team", …]` once any owner declares it (deadline Week 4, max 3).

Seeding follows the rulebook's General tiebreaker: **record → credit balance → points.**
Early in the season, credit balance decides most of the order. That's a good storyline, so use it.

## 8. Results and Preview notes

- One sentence each (two at most). Same naming rule.
- Preview: **5 featured games (`highlight: true`): 3 Upper + 2 Lower** (commish ruling 2026-09-29;
  matches v6.2). Pick for stakes:
  a real rivalry (the page shows the all-time series automatically), a division lead, playoff/relegation
  lines, unbeaten vs unbeaten. Being the Ghost game isn't a reason.
- A featured `note` is the whole case for the game, in 2–3 sentences: weave the rivalry fact
  (streak, playoff history, first meeting), the standings context, and the stakes together. The
  `⚔️ … leads X–Y →` link is added by the page; don't repeat the bare series score.
- Every other game renders as a compact "Rest of the slate" row; its note doesn't show.
- **Pairings come from a schedule, never a guess.** Upper: `data/MAFFL_Schedule_2026_Upper.csv`.
  Lower: ESPN's League Schedule page (the Week 2 preview derived Lower from a rotation and got
  4 of 5 wrong). If the Lower schedule isn't in hand, ask for it.

## 8a. Top performers (from Week 3)

Capture v2.1 now gives the top 3 scorers on every team, and HQ keeps them for the season.
Use them to say *who* won the game, not just by how much.

- **Results notes:** name the player who decided it when one did ("Chase's 38.4 was the
  margin"). One player per note, two at most. Don't list all three.
- **Can You Believe This?:** a team's #1 outscoring the whole opposing lineup's top 3, or
  a loss with the tier's individual high.
- **Hot & Not:** once there are 3+ weeks, a player in his team's top 3 every week, or a
  high-priced auction buy who hasn't made it once.
- **Credit Watch:** the Individual High line quotes the player and points from capture.
- The cross-tier rule in §1 still applies: the same player on one roster per tier is normal,
  not a story.

## 8b. Coach of the Week (from Week 4)

A MAFFL classic, revived 2026-09-30 (commish ruling). Bragging rights only: no money, no credits.

- **The measure:** points left on the bench = the best legal lineup a team could have started from
  that week's roster (flex, OP and DP spots included) minus what it actually started. Lowest wins;
  0.0 is a perfect lineup.
- **Out of contention:** a starter on bye, an empty starting slot, or a starter who scored 0.
- **One winner per tier.** Tie → higher team score. The ESPN pull computes all of it (OUTPUT 2e);
  copy the numbers, never recompute them.
- **Voice:** a short, warm nod to the old award. The winner line reads like
  "Jake's Jagoffs (Jake) left 0.0 on the bench — a perfect lineup." The `note` (optional, one
  sentence) can name the worst miss in the tier ("Brooks sat Gibbs' 34.4").
- **🔄 Could have won:** a team that lost by less than it left on the bench ("lost by 15.1, left 17.4
  on the bench"). The 👻 par counts as the winner's score. It's flagged whether or not the team was in
  contention for the award. The card lists every one; the best (biggest bench, smallest margin) is
  also fair game for Can You Believe This?
- A team knocked out for a bye starter is fair game for Can You Believe This? if it would have won.
- Never mention the Ghost here; it has no lineup.

## 9. Pre-publish checklist

- [ ] Headline ≤ 110 chars, subhead ≤ 150, neither one repeated in the reel
- [ ] News reel has 5–6 items across 2–4 sections
- [ ] Every first mention reads `Team Name (Short)`, and no full owner names anywhere
- [ ] No "both tiers" or "same player, same score" framing
- [ ] No Ghost tag, `ghost: true` or Ghost-driven highlight
- [ ] Every `creditTracker` item has `status` + `since`, with `since` carried forward correctly
- [ ] Elite 5 order holds up against the stat lines (all-play + PF lead)
- [ ] `coachOfWeek` copied from OUTPUT 2e (both tiers), if the report has it
- [ ] §4a: 2+ items on uncovered teams, 2+ Lower items, no team in 3+ items, headline rotated
- [ ] `python3 _ops/scripts/check_pulse_week.py W` → ✅ (no ❌ lines)
- [ ] `grep -n "NEEDS COMMISH\|CONFIRM\|placeholder"` → zero hits in the new week object
