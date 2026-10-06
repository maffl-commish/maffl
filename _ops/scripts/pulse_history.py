# ============================================================
# MAFFL Pulse history hooks + coverage
# VERSION: 0.1 (2026-10-06)
#
# Called by pulse_facts.py; appends two sections to the facts file:
#   "Coverage"     who the last 3 Pulses wrote about, and who they skipped (editorial §4a)
#   "Story hooks"  for EVERY team, history-backed facts about this week's game, its start,
#                  milestones and trophies — so a quiet team always has a story waiting.
# Every number is computed from gold. The drafter copies; it never recalls history from memory.
#
# Sources: data/MAFFL_Matchups_Clean.csv (all games 2005→), data/MAFFL_Owner_Registry.csv,
#          data/MAFFL_Division_History_2005_2025.csv, data/prize.csv (Coach of the Week ledger 2013–22),
#          weekly.html (earlier Pulses, for coverage).
# Scoring changed in 2025 (season averages jumped from ~105 to ~147), so score rankings only
# compare 2025-on games ("the current scoring era"). Records, series and streaks use all years.
# ============================================================
import csv, os, re
from collections import Counter, defaultdict

GHOST = "MAFFL Ghost"
ERA_START = 2025
PLAYOFF_TYPES = ("Quarterfinal", "Semifinal", "Championship")


def _load(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def _ordinal(n):
    return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def history_sections(root, year, week, owner_key, short_of=None):
    games_all = _load(os.path.join(root, "data", "MAFFL_Matchups_Clean.csv"))
    ok = owner_key
    key = lambda r: (int(r["Year"]), int(r["Week"]))
    reg_all = [r for r in games_all if r["Game_Type"] == "Regular"]
    this_wk = [r for r in games_all if int(r["Year"]) == year and int(r["Week"]) == week
               and r["Game_Type"] in ("Regular", "Ghost")]
    team_owner, team_tier = {}, {}
    for r in this_wk:
        for s in ("Winner", "Loser"):
            team_owner[r[s + "_Team"]] = r[s + "_Owner"]; team_tier[r[s + "_Team"]] = r["Tier"]
    teams = sorted(t for t in team_owner if t != GHOST)

    # ---------- per-owner season records (regular season) ----------
    by_owner_season = defaultdict(list)          # (owner_id, year) -> [(week, 'W'/'L'/'T')]
    for r in reg_all:
        y, w = int(r["Year"]), int(r["Week"])
        tie = r["Winner_Score"] == r["Loser_Score"]
        by_owner_season[(ok(r["Winner_Owner"]), y)].append((w, "T" if tie else "W"))
        by_owner_season[(ok(r["Loser_Owner"]), y)].append((w, "T" if tie else "L"))
    for r in [g for g in games_all if g["Game_Type"] == "Ghost"]:   # the Ghost game counts on the real team's record
        y, w = int(r["Year"]), int(r["Week"])
        for s, res in (("Winner", "W"), ("Loser", "L")):
            if r[s + "_Team"] != GHOST:
                by_owner_season[(ok(r[s + "_Owner"]), y)].append((w, res))

    def start_through(oid, y, k):
        res = [x for w, x in sorted(by_owner_season.get((oid, y), [])) if w <= k]
        return res.count("W"), res.count("L"), len(res)

    # ---------- career totals and streaks per owner ----------
    seq = defaultdict(list)
    for r in sorted(reg_all, key=key):
        if r["Winner_Score"] == r["Loser_Score"]:
            continue
        seq[ok(r["Winner_Owner"])].append("W"); seq[ok(r["Loser_Owner"])].append("L")
    def longest(oid, ch):
        best = cur = 0
        for x in seq.get(oid, []):
            cur = cur + 1 if x == ch else 0; best = max(best, cur)
        return best
    def current(oid):
        s = seq.get(oid, [])
        if not s: return ("", 0)
        n = 0
        for x in reversed(s):
            if x == s[-1]: n += 1
            else: break
        return (s[-1], n)

    titles = defaultdict(list)
    for r in games_all:
        if r["Game_Type"] == "Championship":
            titles[ok(r["Winner_Owner"])].append(int(r["Year"]))
    prize_path = os.path.join(root, "data", "prize.csv")
    lower_titles = defaultdict(list)
    cotw = Counter()
    if os.path.exists(prize_path):
        for r in _load(prize_path):
            if r["Prize Category"] == "Placement" and r["Place"] == "1" and r["League/Tier"] == "Lower-Tier":
                lower_titles[ok(r["Owner"])].append(int(r["Year"]))
            if r["Prize Category"] == "Coach (COTW)":
                try: cotw[ok(r["Owner"])] += int(float(r["Amount"])) // 10
                except ValueError: pass
    div_titles = defaultdict(list)
    dh = os.path.join(root, "data", "MAFFL_Division_History_2005_2025.csv")
    if os.path.exists(dh):
        for r in _load(dh):
            if r["Tier"] == "Upper" and r["Division_Rank"] == "1":
                div_titles[ok(r["Owner"])].append(int(r["Year"]))

    # ---------- scoring-era ranks ----------
    era_scores = []
    for r in games_all:
        if int(r["Year"]) >= ERA_START and r["Game_Type"] in ("Regular", "Ghost"):
            for s in ("Winner", "Loser"):
                if r[s + "_Team"] != GHOST:
                    era_scores.append((float(r[s + "_Score"]), r["Tier"]))
    def era_rank(score, tier, high=True):
        pool = sorted((s for s, t in era_scores if t == tier), reverse=high)
        return (pool.index(score) + 1 if score in pool else None), len(pool)

    # ---------- coverage of the last 3 Pulses ----------
    cov_lines = coverage(root, week, teams, team_tier)

    # ---------- story hooks ----------
    H = ["\n## Story hooks (history from gold; every team has some, so quiet teams get a turn)",
         "_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. "
         f"Score ranks compare only {ERA_START}-on games (scoring changed in {ERA_START}). "
         "Owner history follows the person across team names. Copy wording loosely, numbers exactly._"]
    for team in teams:
        oid = ok(team_owner[team]); tier = team_tier[team]
        g = next(r for r in this_wk if team in (r["Winner_Team"], r["Loser_Team"]))
        won = g["Winner_Team"] == team
        opp = g["Loser_Team"] if won else g["Winner_Team"]
        my = float(g["Winner_Score" if won else "Loser_Score"])
        hooks = []

        # series with this week's opponent (by owner, regular + playoffs, as of after this game)
        if opp != GHOST:
            oo = ok(team_owner[opp])
            rows = sorted([r for r in games_all if r["Game_Type"] in ("Regular",) + PLAYOFF_TYPES
                           and {ok(r["Winner_Owner"]), ok(r["Loser_Owner"])} == {oid, oo}], key=key)
            prior = [r for r in rows if key(r) < (year, week)]
            mine = sum(ok(r["Winner_Owner"]) == oid for r in rows)
            if not prior:
                hooks.append(f"first-ever meeting with {opp}")
            else:
                hooks.append(f"all-time series with {opp} (by owner, regular + playoffs) now {mine}–{len(rows) - mine}")
                prior_wins = [r for r in prior if ok(r["Winner_Owner"]) == oid]
                if won and ok(prior[-1]["Winner_Owner"]) != oid:
                    n = 0
                    for r in reversed(prior):
                        if ok(r["Winner_Owner"]) != oid: n += 1
                        else: break
                    if not prior_wins:
                        hooks.append(f"first win over them ever, after {'a loss' if n == 1 else f'{n} losses'}")
                    elif n >= 2:
                        hooks.append(f"snapped a {n}-game losing run against them; first win over them since {prior_wins[-1]['Year']}")
                if not won and ok(prior[-1]["Winner_Owner"]) == oid:
                    n = 0
                    for r in reversed(prior):
                        if ok(r["Winner_Owner"]) == oid: n += 1
                        else: break
                    if n >= 2: hooks.append(f"loss ended a {n}-game winning run against them")
                po = [r for r in prior if r["Game_Type"] in PLAYOFF_TYPES]
                if po:
                    hooks.append("playoff history: " + "; ".join(f"{r['Year']} {r['Game_Type']} won by {r['Winner_Team']}" for r in po[-3:]))

        # start through this week vs the owner's own history
        w_, l_, n_ = start_through(oid, year, week)
        same = [y for (o, y) in by_owner_season if o == oid and y < year and start_through(oid, y, week)[2] == n_]
        if same:
            better = [y for y in same if start_through(oid, y, week)[0] >= w_]
            worse = [y for y in same if start_through(oid, y, week)[0] <= w_]
            if w_ > l_ and len(better) == 0:
                hooks.append(f"{w_}-{l_} is this owner's best start through Week {week} in {len(same) + 1} seasons")
            elif w_ > l_ and better and max(better) < year - 3:
                hooks.append(f"best start through Week {week} since {max(better)}")
            if l_ > 0 and w_ == 0 and len(worse) == 0:
                hooks.append(f"0-{l_} is this owner's worst start through Week {week} in {len(same) + 1} seasons")
            elif w_ == 0 and worse and max(worse) < year - 3:
                hooks.append(f"first 0-{l_} start since {max([y for y in worse if start_through(oid, y, week)[0] == 0] or worse)}")

        # this week's score in the current era
        hi, tot = era_rank(my, tier, True)
        lo, _ = era_rank(my, tier, False)
        if hi and hi <= 10:
            hooks.append(f"{my:.2f} is the {_ordinal(hi)}-highest {tier} score of {tot} since {ERA_START}")
        elif lo and lo <= 10:
            hooks.append(f"{my:.2f} is the {_ordinal(lo)}-lowest {tier} score of {tot} since {ERA_START}")

        # career wins milestone + streaks
        cw = seq.get(oid, []).count("W"); cl = seq.get(oid, []).count("L")
        if cw and (cw % 25 == 0) and won:
            hooks.append(f"that was career regular-season win No. {cw} (career {cw}-{cl})")
        elif cw and (cw + 1) % 25 == 0:
            hooks.append(f"one win from career regular-season win No. {cw + 1} (career {cw}-{cl})")
        ch, n = current(oid)
        if n >= 3:
            rec = longest(oid, ch)
            hooks.append(f"{'won' if ch == 'W' else 'lost'} {n} straight regular-season games (career long: {rec})")

        # trophies
        t = titles.get(oid, []); lt = lower_titles.get(oid, []); dv = div_titles.get(oid, [])
        trophy = []
        if t: trophy.append(f"{len(t)} title{'s' if len(t) > 1 else ''} (last {max(t)})")
        if lt: trophy.append(f"Lower-Tier title {', '.join(map(str, lt))}")
        if dv: trophy.append(f"{len(dv)} Upper division title{'s' if len(dv) > 1 else ''} (last {max(dv)})")
        if trophy: hooks.append("trophy case: " + "; ".join(trophy))
        else: hooks.append("no MAFFL title yet")
        if cotw.get(oid):
            n = cotw[oid]
            hooks.append(f"won Coach of the Week {'once' if n == 1 else f'{n} times'} in 2013–22 (prize ledger, $10 per award)")

        H.append(f"- **{team}** ({'U' if tier == 'Upper' else 'L'}, {'W' if won else 'L'} vs {'👻' if opp == GHOST else opp}): " + " · ".join(hooks))
    return "\n".join(cov_lines + H) + "\n"


def coverage(root, week, teams, team_tier):
    """Mentions per team in the last 3 published Pulses (headline + subhead + news reel)."""
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("cpw", os.path.join(os.path.dirname(__file__), "check_pulse_week.py"))
        cpw = importlib.util.module_from_spec(spec); spec.loader.exec_module(cpw)
        weeks = {w.get("weekNumber"): w for w in cpw.load_weeks(os.path.join(root, "weekly.html"))}
    except BaseException as e:            # node missing, page unreadable: say so, don't fail the facts
        return ["\n## Coverage (spread the wealth)", f"(couldn't read earlier Pulses: {str(e)[:120]})"]
    recent, heads = Counter(), Counter()
    for k in (week - 1, week - 2, week - 3):
        if k in weeks:
            wk = weeks[k]
            texts = [wk.get("headline") or "", wk.get("subhead") or ""]
            for sec in wk.get("newsReel") or []:
                texts += (sec.get("items") or []) if isinstance(sec, dict) else [str(sec)]
            for t in teams:
                recent[t] += sum(t in x for x in texts)
                if k >= week - 2: heads[t] += sum(t in x for x in texts[:2])
    tag = lambda t: f"{t} ({'U' if team_tier[t] == 'Upper' else 'L'})"
    cold = [tag(t) for t in teams if recent[t] == 0]
    warm = [f"{tag(t)} ×{recent[t]}" for t in sorted(teams, key=lambda t: -recent[t]) if recent[t] >= 3]
    L = ["\n## Coverage (spread the wealth — editorial §4a)",
         f"_Headline + subhead + news reel mentions in Weeks {max(week - 3, 0)}–{week - 1}._",
         "- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** " + (", ".join(cold) or "none"),
         "- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** " + (", ".join(warm) or "none"),
         "- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** " +
         (", ".join(tag(t) for t in teams if heads[t]) or "none")]
    return L
