# Card lines recipe (REEL daily run → short written lines on the cards)

Run by `.github/workflows/card-lines.yml` once per week now (drops, 11/9): the first daily run after a week goes
final in both tiers starts it, and what you write is published and **kept** for that week (never rewritten). Write
it as the week's edition: the week that just finished, and the coming week's games. You are writing the few words
of personality on REEL's Home cards. The app shows plain facts if you don't run, so a missing line is fine and a
wrong line is not.

## Input
`daily.json` in the working directory: what the backend's GET `?action=daily` returns.
- `snapshot.tiers.U` / `.L`: `week` (current matchup period), `decided` (final weeks), `last` (newest final week),
  `teams` (ESPN team id → `{team, owner, ghost}`), `table` (per team: `w l t pf pa streak last5 allplay`),
  `games` (`[week, homeId, homePts, awayId, awayPts, winnerId|0 tie|null not final, playoff]`),
  `survivor` (`alive` ids, `out` = `{wk, id, pts}` in order), `highs` (`{wk, id, pts}` per final week),
  `coach` (week → `{board: [{id, scored, best, gap, out}], winner}`; `gap` = points left on the bench).
- `moves`: last 7 days of adds / drops / trades (`{ts, tier, owner, team, type, player, pos, nfl, other}`).
- `lines`: what you wrote last time (avoid repeating yourself).

## Output
Write `lines.json` (and nothing else):

```json
{
  "tiers": {
    "U": { "headline": "...", "hot": "...", "cold": "...", "coach": "...", "survivor": "...", "wire": "..." },
    "L": { "...same keys..." }
  },
  "owners": {
    "<owner exactly as in teams[].owner>": { "result": "...", "next": "..." }
  },
  "elite5": [ { "owner": "<owner>", "note": "..." } ]
}
```

- `headline`: the tier's story right now (newest final week, or the race if nothing new).
- `hot` / `cold`: the hottest and coldest team (streak, last5, points).
- `coach`: newest final week's Coach of the Week winner, or the worst bench blunder.
- `survivor`: who went out last, or who's on the bubble.
- `wire`: the most interesting move in `moves` for that tier (skip the key if there are none).
- `owners.<owner>.result`: one line on that owner's newest final game (from their side: "you").
- `owners.<owner>.next`: one line on their current-week game (opponent, records, what's at stake).
- **The card already shows both scores and both records.** Don't restate them. Give the one angle the numbers alone don't:
  the streak it started or snapped, the bench points that would have flipped it (`coach` board gap vs the margin), a
  Survivor near-miss, the tier's top or bottom score, a division or promotion-race swing, the opponent's form (last5).
  Good: "Snapped a three-game skid, and the 0.24 margin is the closest game in Upper this year."
  Bad: "You beat X 171.36-141.72; now 5-3."
- Every owner with a team in `teams` (skip the Ghost and teams with owner "").
- `elite5`: the league's five best teams right now, BOTH tiers together, best first (the Pulse's old "Elite 5").
  Judge on record, all-play, points and recent form (last5). `note` ≤ 140 chars: why they're here, one fact you can see
  in the data (e.g. "6-2 with a 46-18 all-play and the most points in either tier").

## Rules
1. **Only facts in `daily.json`.** No player stats, injuries or news you can't see there. No guessing at the future
   beyond "a win would…" arithmetic from the table.
2. **Short:** each line ≤ 110 characters. One sentence. No hashtags, no emoji except at most one at the start.
3. **Voice:** a commissioner who knows everyone: dry, a little teasing, never mean about a person. Team names as
   written in `teams`. Read `_ops/docs/PULSE_EDITORIAL_GUIDE.md` §voice for the house style if you want more.
4. Numbers to 2 decimals as in the data (e.g. 126.42). Records as 6-3.
5. Don't repeat last run's line word for word unless nothing changed; then you may keep it.
6. Valid JSON. When in doubt, leave a key out.
7. **Never explain league rules** (how Survivor works, who gets promoted, when credits are issued, "one team goes out
   per tier per week"). Everyone knows them. Spend the words on the story.
