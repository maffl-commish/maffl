# REEL card series — the catalog

Last updated: 2026-11-09 (chat) · v2.1 · Owner: commissioner (Mike)

The reel is built from **series** (a family of cards with one job) delivered in **drops** (a set of cards published together at a set time, then kept as published). This page is the source of truth for both: every series, when it drops, how long it lives, who writes it, and how it should look. The app follows this page (`lab/index.html` → `SERIES`, `BUDGET`, `FEED_ORDER`). Visual review with screenshots: [REEL card review](https://claude.ai/artifact/PgqKUhjxQo7DEH7wxsDt6k) (11/9, private to the commissioner).

## The weekly rhythm (drops, ET)

The backend runs at 5 AM and 5 PM. A drop goes out with the run that first sees its trigger. Target: about 20 cards a week, spread so the reel has something new almost every day, with Tuesday as the big day.

| When | Drop | Trigger / what it is | Cards |
|---|---|---|---|
| TUE 5 AM | 🗞️ The Edition | Week goes final in both tiers (robot writes the week's lines once) | 8–9 |
| TUE 5 PM | 🎯 Play | Vote + one quiz on the week that just ended | 2 |
| WED 5 AM | 🗄️ Vault | History, one bite (rotating) | 2 |
| WED–THU | 💰 Waivers | The run that first sees the waiver claims | 1 |
| THU 5 PM | ⏭️ Preview | Your next game + this week in history | 2 |
| FRI 5 PM | 💡 Weekend | An insight, a milestone if one is close | 1–2 |
| MON 5 PM | 🧮 Tonight's math | Only if your game is still alive for Monday night | 0–1 |
| ANYTIME | ⚡ Instant | Trade offers, chats, polls, dues, key dates, commish alerts, perk news | as they happen |

### Order inside a drop

**You → your tier → the league → play → the Vault.** The Tuesday Edition in order: 🏁 Your result · 🛟 Survivor (if it's about you) · 🛡️ Division / promotion race · 📣 Tier headline · 💳 Credit races · 🏅 Week awards (Coach + High score) · ⭐ Elite 5 · 🌎 The other tier.

**Built (11/9):** the app holds each card until its drop (`DROP_OF` / `DROP_H` in `lab/index.html`, counted from the Tuesday after the week: Week 1 → Tue Sep 15, 2026). Instant cards go out when they happen. The reel runs newest drop first; inside a drop, you → your tier → the league → play → the Vault. Off-season: no waiting. Testers can pin "now" with localStorage `maffl_lab_now` (ms). Budget per week: you 7 · league 10 · play 3 · vault 4.

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
8. Owners are named by @handle on every card (tappable → their profile); teams by team name (11/9).
7. Every card links into the app wherever it can (commish 11/9): players open their profile, owners their profile, games your matchup on Match, history the Vault. The main button goes to the place the card is about.

## The catalog

Status after the 11/9 build: 🛠️ fixed 11/9 · ✅ kept as is.

### Needs you

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| ⚡ Trade offer | `offers` | me | Instant | Until you answer | data | Built | ✅ Keep | Strong: the trade itself + Decline / Counter / Accept. Several offers fold into one card. |
| 💬 Trade talk | `dm` | me | Instant | Until read / answered | data | Built | ✅ Keep | The offer and its latest message on one card (already one card per trade). |
| 💵 Dues | `dues` | me | Instant (while owed) | Until paid | data | Built | ✅ Keep | Not in the test league. Big $ amount + due date. |

### Your week

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🧮 Tonight's math | `math` | me | MON 5 PM | Until noon Tue | data (story) | Built | 🛠️ Fixed 11/9 | Fixed 11/9: the score bar is the hero, the story sits under it in body size, then who's left. |
| 🏁 Your result | `result` | me | TUE 5 AM | Until next Tuesday | data + robot line | Built | ✅ Keep | The model card: hero, score box, one story line, four facts. |
| 🛟 Survivor | `surv` | me | TUE 5 AM | Until next Tuesday | data | Built | ✅ Keep | Only when it's about you. Not in the test league this week. |
| 🛡️ Division / 📈 Promotion race | `div` | me | TUE 5 AM | Until next Tuesday | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: says what it means ('You're 1 game behind BJ in Division A'); this week's rival results under it. |
| 💳 Credit races | `credits` | tier | TUE 5 AM | Until next Tuesday | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: headline is the races ('3 credit races'); 'You lead…' moved to the line under it. |
| ⏭️ Up next | `next` | me | THU 5 PM | Until kickoff | data + robot line | Built | ✅ Keep | Great matchup hero. Now drops Thursday with the preview. |
| 💬 Chats | `msgs` | me | Instant | Until read | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: several conversations = one compact list, one row each (who, last message, unread count). |
| 💰 Waiver auction | `wire` | tier | When waivers run | 4 days | data (drop) | Built | ✅ Keep | Add the biggest overpay / steal as a story line once real bids flow. |

### League week

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 📣 Commish alert | `alert` | league | Instant | 7 days | commish | Built 11/9 | 🛠️ Fixed 11/9 | New 11/9: in the reel AND chat (pinned) AND the Board. |
| 💳 Perk news | `perk` | league | Instant | 3 days | data | Built 11/9 | 🛠️ Fixed 11/9 | New 11/9: every approved perk (up to 3 at a time) as a reel card, plus the League chat post. |
| 📣 Tier headline | `tier` | tier | TUE 5 AM | Until next Tuesday | robot (once a week) | Built | 🛠️ Fixed 11/9 | Fixed 11/9: the robot's recipe now bans the top score from the headline (Week awards owns it). Test data still shows an old line. |
| 🏅 Week awards (Coach + High score) | `awards` | league | TUE 5 AM | Until next Tuesday | data | Built 11/9 | 🛠️ Fixed 11/9 | New 11/9: Coach of the Week and High score merged, both tiers, one card. A team that won both shows once. |
| ⭐ Elite 5 | `elite5` | league | TUE 5 AM | Until next Tuesday | robot + data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: headline 'The Elite 5'; your line ('You're #4: …') under it, your row highlighted. |
| 🌎 The other tier | `other` | league | TUE 5 AM | Until next Tuesday | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: no top score (Week awards has it); leader, 2nd, hottest; top 5 teams with their 2 best players. |
| 📈 Records watch | `records` | league | FRI 5 PM (only when close) | Until next Tuesday | data | Built | ✅ Keep | Good tension card. |
| ⏰ Key date | `deadline` | league | Instant (lead window) | Until the date | data (Key Dates CSV) | Built | 🛠️ Fixed 11/9 | Fixed 11/9: ⏰ in the eyebrow like every other series. |

### Play

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🗳️ Game of the Week | `gotw` | league | TUE 5 PM | Vote closes Thu | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: three compact tiles (tag + teams + scores); the long write-ups are gone. |
| 🧠 Quiz | `quiz` | league | TUE 5 PM | Until next Tuesday | data | Built | 🛠️ Fixed 11/9 | Fixed 11/9: one a week, only about facts no other card shows (bench blunder, Survivor, bench beat, bid). Top-score and leader quizzes are out. |
| 📊 Poll | `poll` | league or tier | Instant (commish posts) | Until it closes | commish | Built | ✅ Keep | Not in the test league. Results after you vote. |
| 💸 What would you pay? | `pay` | league | WED 5 AM (even weeks) | Until next Tuesday | data | Built | ✅ Keep | Great format: clue chips + three prices. |
| 🏷️ Name that team | `names` | league | WED 5 AM (odd weeks) | Until next Tuesday | data | Built | ✅ Keep | Not this week (odd weeks only). |

### Vault

| Series | id | Audience | Drop | Lives | Writer | Status | Verdict | Format notes |
|---|---|---|---|---|---|---|---|---|
| 🗄️ Throwback | `throwback` | league | WED 5 AM | Until next Tuesday | commish line + data | Built | ✅ Keep | Beautiful; the season chips earn their space. |
| 📅 This week in MAFFL history | `history` | league | THU 5 PM | Until next Tuesday | data | Built | ✅ Keep | Drops with the preview: it's about the coming week number. |
| 👋 Meet the owner | `owner` | league | FRI 5 PM (odd weeks) | Until next Tuesday | data | Built | ✅ Keep | Not this week (odd weeks only). |
| 💡 Auction Draft Insights | `tidbit` | league | FRI 5 PM | Until next Tuesday | commish (CSV) + data | Built | ✅ Keep | Best-looking card in the reel. |

## Build plan (from the review) — done 11/9

1. ✅ Release times: each series drops on its slot in the rhythm above (app holds cards until their drop; the Tuesday Edition gets its lines from the robot first).
2. ✅ One fact, one card: Coach + High score → 🏅 Week awards; the robot's tier headline stops repeating the top score; quizzes skip anything another card shows; one quiz a week.
3. ✅ Rule 3 fixes: Elite 5 and Credit races headlines stop saying "you".
4. ✅ Anatomy pass: one tag row everywhere (⏰ Key date gets its emoji), Tonight's math leads with the score bar, Division says what it means, Game of the Week and The other tier fit one screen, chats as one compact list.
5. Commissioner's calls (11/9): 📣 Commish alerts and 💳 perk news go in the reel AND chat; no Sunday Game day card for now.

## Rules of thumb (kept from v1)

- A new series needs: an id, a group, a drop, an audience, a lifespan and a writer. Add it here first.
- Hand-written lines live in a CSV in `data/` (like `MAFFL_Throwbacks.csv`), never in code.
- Player names aren't unique (two Josh Allens): anything keyed on a player uses name + position.
- No rule explanations on cards. Everyone knows the rules.
