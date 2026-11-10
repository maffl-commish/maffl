# REEL card series — the catalog

Last updated: 2026-11-09 (chat) · v2.0 · Owner: commissioner (Mike)

The reel is built from **series** (a family of cards with one job) delivered in **drops** (a set of cards published together at a set time, then kept as published). This page is the source of truth for both: every series, when it drops, how long it lives, who writes it, and how it should look. The app follows this page (`lab/index.html` → `SERIES`, `BUDGET`, `FEED_ORDER`). Visual review with screenshots: [REEL card review](https://claude.ai/artifact/PgqKUhjxQo7DEH7wxsDt6k) (11/9, private to the commissioner).

## The weekly rhythm (drops, ET)

The backend runs at 5 AM and 5 PM. A drop goes out with the run that first sees its trigger. Target: about 20 cards a week, spread so the reel has something new almost every day, with Tuesday as the big day.

| When | Drop | Trigger / what it is | Cards |
|---|---|---|---|
| TUE 5 AM | 🗞️ The Edition | Week goes final in both tiers (robot writes the week's lines once) | 8–9 |
| TUE 5 PM | 🎯 Play | Vote + one quiz on the week that just ended | 2 |
| WED 5 AM | 🗄️ Vault | History, one bite (rotating) | 2 |
| WED–THU | 💰 Waivers | The run that first sees the waiver claims | 1 |
| THU 5 PM | ⏭️ Preview | Your next game + this week in history + Game of the Week result | 2–3 |
| FRI 5 PM | 💡 Weekend | An insight, a milestone if one is close | 1–2 |
| MON 5 PM | 🧮 Tonight's math | Only if your game is still alive for Monday night | 0–1 |
| ANYTIME | ⚡ Instant | Trade offers, chats, polls, dues, key dates, commish alerts | as they happen |

### Order inside a drop

**You → your tier → the league → play → the Vault.** The Tuesday Edition in order: 🏁 Your result · 🛟 Survivor (if it's about you) · 🛡️ Division / promotion race · 📣 Tier headline · 💳 Credit races · 🏅 Week awards (Coach + High score) · ⭐ Elite 5 · 🌎 The other tier.

**Status (11/9):** drops are built for the robot's lines (once per week), 💰 Waiver auction and 🧮 Tonight's math. Every other series still shows as soon as the week's data is in. Next build: each series gets a release time from this table, and the app holds a card until its drop.

## Card anatomy (every card, same order)

- **1 · Tag row:** Who it's for (your team tag, Upper/Lower, or League crest) + the series eyebrow: emoji · name · Week N. Same on every card.
- **2 · Hero:** One of three: a number (23 days, $48, 2010), a matchup (two teams and scores), or a headline (2 lines max). Never a paragraph.
- **3 · Story:** One or two sentences in body size that say what it means. This is where the voice lives.
- **4 · Detail:** Up to 5 rows, or one chart. More than that belongs behind a tap.
- **5 · One action:** At most one main button (Box score, Open trades, Vote).
- **6 · Reactions:** Shared cards only (tier and league). Your own cards don't get them.

## Rules

1. One fact, one card. A number appears on one card per drop (the top score lives on Week awards only).
2. Quizzes ask about what no other card has shown yet.
3. League and tier cards never say "you" in the headline; your angle is a highlighted row or chip.
4. Every card fits one phone screen at 390 px. Longer = cut or move behind a tap.
5. Published words don't change (drops). Numbers can't change either once a week is final.
6. Each drop opens with your cards, then your tier, then the league, then play, then the Vault.

## The catalog

Verdicts from the 11/9 review: ✅ keep · 🛠️ fix · 🔀 merge · ❓ commissioner's call · ✨ new.

### Needs you

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| ⚡ Trade offer | `offers` | me | Instant | Until you answer | data | Built | ✅ Keep | Strong: the trade itself + Decline / Counter / Accept. Several offers fold into one card. Keep it pinned to the top. |
| 💬 Trade talk | `dm` | me | Instant | Until read / answered | data | Built | 🛠️ Fix | Good, but it overlaps the Trade offer card when the chat is about an offer. One card per trade: the offer card should carry the latest message and the chat button. |
| 💵 Dues | `dues` | me | Instant (while owed) | Until paid | data | Built | ✅ Keep | Not in the test league. Heads-up style: big $ amount + due date. |

### Your week

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🧮 Tonight's math | `math` | me | MON 5 PM | Until noon Tue | data (story) | Built | 🛠️ Fix | The story is right, the stage isn't: lead with the score bar (You 149.40 · Braiden 151.32) as the hero, then the story in body size, then who's left. Today the story is set as a giant headline and the score sits below it. |
| 🏁 Your result | `result` | me | TUE 5 AM | 7 days | data + robot line | Built | ✅ Keep | The model card: hero ('You won by 29.64'), the score box, one story line, four facts. Every card should look like this. |
| 🛟 Survivor | `surv` | me | TUE 5 AM | 7 days | data | Built | ✅ Keep | Only when it's about you (alive or just knocked out). Not in the test league this week. |
| 🛡️ Division / 📈 Promotion race | `div` | me | TUE 5 AM | 7 days | data | Built | 🛠️ Fix | Headline '1 of 2 division rivals won' is a fact, not a story. Say what it means: 'You're tied for the division lead with BJ.' Rows are good. |
| ⏭️ Up next | `next` | me | THU 5 PM | Until kickoff | data + robot line | Built | ✅ Keep | Great matchup hero. Move to the Thursday preview drop (today it lands Tuesday with the results). |
| 💬 Chats | `msgs` | me | Instant | Until read | data | Built | 🛠️ Fix | Three chats stacked in one card runs two screens long. One card per conversation, newest first, max 2 lines each, or a compact list that opens Chat. |
| 💰 Waiver auction | `wire` | tier | When waivers run | 4 days | data (drop) | Built | ✅ Keep | Clear and new. Add the biggest overpay / steal as the story line once real bids flow. |
| 💳 Credit races | `credits` | tier | TUE 5 AM | 7 days | data | Built | 🛠️ Fix | Headline says 'You lead…' on a tier card (breaks rule 3, and it reads wrong to everyone else). Headline = the race ('Most Points: Mike by 41'); your angle as a chip. |
| 🏈 Game day check | `gameday` | me | SUN 5 AM | Until kickoff | data | New | ✨ New | Starters on bye, out or doubtful, and the best bench swap. The one card that saves you points. |

### League week

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 📣 Tier headline | `tier` | tier | TUE 5 AM | 7 days | robot (once a week) | Built | 🛠️ Fix | Headline repeats the High score card word for word (Turkey Hat 186.58), and the 🔥 emoji doubles up. The robot's headline must be the tier's story (race, streak, upset), never the top score. |
| 🏆 Coach of the Week | `coach` | league | TUE 5 AM | 7 days | data | Built | 🔀 Merge | Solid. Merge with High score into one '🏅 Week N awards' card: Coach + High score, both tiers, one place. |
| 🚀 High score | `high` | league | TUE 5 AM | 7 days | data | Built | 🔀 Merge | Thin card (two numbers) and the same fact as the tier headline and a quiz. Fold into Week awards. |
| ⭐ Elite 5 | `elite5` | league | TUE 5 AM | 7 days | robot + data | Built | 🛠️ Fix | Headline 'You made the Elite 5' breaks rule 3 on a league card. Headline: 'The Elite 5 · Week 8'; your line (#4) as the highlighted row, as it already is. |
| 🌎 The other tier | `other` | league | TUE 5 AM | 7 days | data | Built | 🛠️ Fix | Too dense: standings + three player chips per team. Cut to: leader, top score, hottest team, one line of story. |
| 📈 Records watch | `records` | league | FRI 5 PM (only when close) | 7 days | data | Built | ✅ Keep | Good tension card. Fine as is. |
| ⏰ Key date | `deadline` | league | Instant at 14, 3 and 1 days out | Until the date | data (Key Dates CSV) | Built | ✅ Keep | Strong hero number. Add the emoji to the eyebrow ('⏰ Key date') like every other series. |
| 📣 Commish alert (card) | `alert` | league | Instant | Until swiped | commish | New | ❓ Your call | Today alerts live in chat (pinned) and on the Board. Should they also drop into everyone's reel as a card? |
| 💳 Perk news (card) | `perk` | league | Instant | 3 days | data | New | ❓ Your call | Today perk approvals post to League chat. A card ('Mike doubled Josh Allen vs Joe for Week 10') would be fun in the reel. |

### Play

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🗳️ Game of the Week | `gotw` | league | TUE 5 PM (vote) · THU 5 PM (result) | Vote closes Thu | data | Built | 🛠️ Fix | Three full game write-ups make it two screens long. Show three tappable game tiles (teams + score + one tag); the write-up opens on tap. |
| 🧠 Quizzes (top score, bench blunder, Survivor…) | `quiz` | league | TUE 5 PM | 7 days | data | Built | 🛠️ Fix | 'Who put up the top score?' gives nothing away only if no other card says it, but the tier headline, High score and Elite 5 all do. Quizzes must ask about facts no other card in that week's cards shows (bench blunder ✅, Survivor ✅, top score ❌). One quiz a week, not three. |
| 📊 Poll | `poll` | league or tier | Instant (commish posts) | Until it closes | commish | Built | ✅ Keep | Not in the test league. Results after you vote. |
| 💸 What would you pay? | `pay` | league | WED 5 AM (even weeks) | 7 days | data | Built | ✅ Keep | Great format: clue chips + three prices. Keep. |
| 🏷️ Name that team | `names` | league | WED 5 AM (odd weeks) | 7 days | data | Built | ✅ Keep | Not this week (odd weeks only). |

### Vault

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🗄️ Throwback | `throwback` | league | WED 5 AM | 7 days | commish line + data | Built | ✅ Keep | Beautiful. The season chips (16-team era, divisions, Wild West draft) earn their space. |
| 📅 This week in MAFFL history | `history` | league | THU 5 PM (with the preview) | 7 days | data | Built | ✅ Keep | Belongs with the preview: it's about the coming week number. |
| 👋 Meet the owner | `owner` | league | FRI 5 PM (odd weeks) | 7 days | data | Built | ✅ Keep | Not this week (odd weeks only). |
| 💡 Auction Draft Insights | `tidbit` | league | FRI 5 PM | 7 days | commish (CSV) + data | Built | ✅ Keep | Best-looking card in the reel: big hook, one paragraph, the price chart. |

## Build plan (from the review)

1. Release times: each series drops on its slot in the rhythm above (app holds cards until their drop; the Tuesday Edition gets its lines from the robot first).
2. One fact, one card: Coach + High score → 🏅 Week awards; the robot's tier headline stops repeating the top score; quizzes skip anything another card shows; one quiz a week.
3. Rule 3 fixes: Elite 5 and Credit races headlines stop saying "you".
4. Anatomy pass: one tag row everywhere (⏰ Key date gets its emoji), Tonight's math leads with the score bar, Division says what it means, Game of the Week and The other tier fit one screen, chats one card per conversation, trade talk folds into the offer card.
5. Your calls: 📣 Commish alert as a reel card? 💳 Perk news as a reel card? ✨ 🏈 Game day check (Sunday 5 AM)?

## Rules of thumb (kept from v1)

- A new series needs: an id, a group, a drop, an audience, a lifespan and a writer. Add it here first.
- Hand-written lines live in a CSV in `data/` (like `MAFFL_Throwbacks.csv`), never in code.
- Player names aren't unique (two Josh Allens): anything keyed on a player uses name + position.
- No rule explanations on cards. Everyone knows the rules.
