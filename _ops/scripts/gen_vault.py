#!/usr/bin/env python3
"""Build lab/vault-data.js: the REEL Vault (league history) in one compact file for the app.

DERIVED file. Never hand-edit lab/vault-data.js; edit the gold CSVs (or the editorial throwback lines in
data/MAFFL_Throwbacks.csv) and re-run:

    python3 _ops/scripts/gen_vault.py          # writes lab/vault-data.js
    python3 _ops/scripts/gen_vault.py --check  # exit 1 if lab/vault-data.js is out of date

The "Vault data" GitHub Action runs it whenever a data/*.csv file changes on main.

Reads (gold, MAFFL_HQ_DATA_GOVERNANCE.md §2):
  MAFFL_Owner_Registry.csv            canonical owner names (every name resolves through its aliases)
  MAFFL_Matchups_NoConsolation.csv    every game 2005+ (scores, playoffs, title games)
  MAFFL_Division_History_2005_2025.csv division standings by season
  MAFFL_Owner_Seasons.csv             owner seasons 2005+ (team name, record only: its finish flags are NOT used)
  MAFFL_Seasons_2002_2004.csv         the founding seasons (no scores kept; champion / runner-up flags)
  prize.csv                           Lower-Tier 1st (finish flags come from title games + prize.csv, governance §2)
  MAFFL_Draft_History_Clean_v3.csv    every auction pick
  MAFFL_Throwbacks.csv                editorial: the commissioner's one-line story per season (+ optional note)
  MAFFL_Tidbits.csv                   editorial: the 8 Ball reborn (hook + one line + the player and position whose price history the card draws)

Eras match history.html (ERAS / DRAFT_ERAS).
"""
import csv, json, os, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = lambda f: os.path.join(ROOT, "data", f)
OUT = os.path.join(ROOT, "lab", "vault-data.js")

ERAS = [  # league structure eras (history.html ERAS)
    ("founding", "Founding", "2002–2004", 2002, 2004),
    ("12team", "12-Team Conference", "2005", 2005, 2005),
    ("original", "16-Team Era I · Original Divisions", "2006–2009", 2006, 2009),
    ("kardashian", "16-Team Era II · Kardashian / Lautner", "2010–2012", 2010, 2012),
    ("popstar", "16-Team Era III · Pop-Star Divisions", "2013", 2013, 2013),
    ("cuoco", "16-Team Era IV · Cuoco / Kunis / Stone / Upton", "2014–2024", 2014, 2024),
    ("2tier", "2-Tier Era", "2025+", 2025, 2099),
]
DRAFT_ERAS = [  # auction eras (history.html DRAFT_ERAS)
    ("Snake Draft", 2002, 2004), ("Wild West", 2005, 2010), ("Golden Wiggins", 2011, 2019),
    ("Remote / Online", 2020, 2024), ("Modern Superflex", 2025, 2099),
]


def rows(f):
    with open(D(f), newline="", encoding="utf-8-sig") as fh:
        return list(csv.DictReader(fh))


def num(x, d=0.0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return d


ALIAS = {}
for r in rows("MAFFL_Owner_Registry.csv"):
    for a in (r["aliases"] or "").split("|") + [r["canonical_name"]]:
        if a.strip():
            ALIAS[a.strip().lower()] = r["canonical_name"]
UNKNOWN = set()


def who(name):
    n = (name or "").strip()
    if not n or "ghost" in n.lower():
        return None
    c = ALIAS.get(n.lower())
    if not c:
        UNKNOWN.add(n)
        return n
    return c


def era_of(y):
    for e in ERAS:
        if e[3] <= y <= e[4]:
            return e[0]
    return ""


def draft_era_of(y):
    for e in DRAFT_ERAS:
        if e[1] <= y <= e[2]:
            return e[0]
    return ""


def build():
    S = defaultdict(lambda: {"teams": {}, "games": [], "divs": defaultdict(list), "spends": []})
    seasons_of = defaultdict(set)

    for r in rows("MAFFL_Seasons_2002_2004.csv") + rows("MAFFL_Owner_Seasons.csv"):
        y, o = int(r["YEAR"]), who(r["Owner"])
        if not o:
            continue
        s = S[y]
        s["teams"][o] = {"team": r["TEAM"].strip(), "w": r["W"], "l": r["L"], "champ": r["Champ"] == "1", "ru": r["Runner"] == "1"}
        seasons_of[o].add(y)

    for r in rows("MAFFL_Matchups_NoConsolation.csv"):
        y = int(r["Year"])
        w, l = who(r["Winner_Owner"]), who(r["Loser_Owner"])
        S[y]["games"].append({"wk": int(r["Week"]), "tier": r["Tier"][:1], "type": r["Game_Type"], "w": w, "wt": r["Winner_Team"].strip(),
                              "ws": num(r["Winner_Score"]), "l": l, "lt": r["Loser_Team"].strip(), "ls": num(r["Loser_Score"])})

    for r in rows("MAFFL_Division_History_2005_2025.csv"):
        y = int(r["Year"])
        conf = r["Conference"] if r["Conference"] not in ("", "N/A") else ""
        key = (r["Tier"], conf, r["Division"])
        S[y]["divs"][key].append({"rank": int(num(r["Division_Rank"])), "o": who(r["Owner"]), "team": r["Team"].strip(), "w": int(num(r["W"])), "l": int(num(r["L"]))})

    for r in rows("MAFFL_Draft_History_Clean_v3.csv"):
        p = num(r["Price"], -1)
        if p > 0:
            S[int(r["Year"])]["spends"].append({"o": who(r["Owner"]), "p": (r["Player"] or r["Player_Raw"]).strip(), "pos": r["Position_Actual"], "$": int(round(p)), "tm": (r.get("NFL_Team") or "").strip()})

    lower1 = defaultdict(list)
    for r in rows("prize.csv"):
        if r["Prize Category"] == "Placement" and r["League/Tier"] == "Lower-Tier" and r["Place"] == "1" and who(r["Owner"]) not in lower1[int(r["Year"])]:
            lower1[int(r["Year"])].append(who(r["Owner"]))
    lines = {}
    if os.path.exists(D("MAFFL_Throwbacks.csv")):
        for r in rows("MAFFL_Throwbacks.csv"):
            if r.get("Year", "").strip():
                lines[int(r["Year"])] = {"line": (r.get("Line") or "").strip(), "note": (r.get("Note") or "").strip()}

    first = {o: min(ys) for o, ys in seasons_of.items()}
    last = {o: max(ys) for o, ys in seasons_of.items()}
    years = sorted(y for y in S if S[y]["teams"])

    champ_of, ru_of = {}, {}
    for y in years:  # title game winner (2005+), founding flags before that
        tg = next((x for x in S[y]["games"] if x["type"] == "Championship" and x["tier"] == "U"), None)
        champ_of[y] = [tg["w"]] if tg else ([o for o, t in S[y]["teams"].items() if t["champ"]] if y < 2005 else [])
        ru_of[y] = [tg["l"]] if tg else ([o for o, t in S[y]["teams"].items() if t["ru"]] if y < 2005 else [])

    latest_complete = max(y for y in years if champ_of[y])
    out = {}
    for y in years:
        s = S[y]
        rec = {"y": y, "era": era_of(y), "draftEra": draft_era_of(y), "n": len(s["teams"])}
        g = s["games"]
        title = next((x for x in g if x["type"] == "Championship" and x["tier"] == "U"), None)
        cs = champ_of[y]
        if title:
            rec["final"] = {"w": title["w"], "wt": title["wt"], "ws": title["ws"], "l": title["l"], "lt": title["lt"], "ls": title["ls"], "wk": title["wk"]}
        rec["champ"] = cs
        rec["ru"] = ru_of[y]
        tp = next((x for x in g if x["type"] == "ThirdPlace" and x["tier"] == "U"), None)
        if tp:
            rec["third"] = tp["w"]
        if lower1.get(y):
            rec["lowerChamp"] = lower1[y]
        # back-to-back / repeat titles
        if len(cs) == 1:
            c = cs[0]
            if champ_of.get(y + 1) == [c]:
                rec["streak"] = "first of back-to-back" if champ_of.get(y - 1) != [c] else "middle of a three-peat"
            elif champ_of.get(y - 1) == [c]:
                rec["streak"] = "three-peat" if champ_of.get(y - 2) == [c] else "repeat"
            rec["titleNo"] = sum(1 for yy in years if yy <= y and c in champ_of[yy])
        # teams that season
        rec["teams"] = {o: t["team"] for o, t in s["teams"].items()}
        # divisions (Upper first, by conference/division name)
        divs = []
        for (tier, conf, name), ts in sorted(s["divs"].items(), key=lambda kv: (kv[0][0] != "Upper", kv[0][1], kv[0][2])):
            ts.sort(key=lambda t: t["rank"])
            divs.append({"tier": tier[:1], "conf": conf, "name": name, "t": [[t["o"], t["team"], t["w"], t["l"]] for t in ts]})
        if divs:
            rec["divs"] = divs
        # playoffs (Upper bracket + Lower tier), in order
        order = {"Quarterfinal": 1, "Semifinal": 2, "ThirdPlace": 3, "Championship": 4}
        po = [x for x in g if x["type"] in order]
        po.sort(key=lambda x: (x["tier"] != "U", x["wk"], order[x["type"]]))
        if po:
            rec["playoffs"] = [[x["tier"], x["wk"], x["type"], x["w"], x["ws"], x["l"], x["ls"]] for x in po]
        # superlatives
        real = [x for x in g if x["w"] and x["l"]]
        if real:
            sc = []
            for x in real:
                sc.append((x["ws"], x["w"], x["wt"], x["wk"]))
                sc.append((x["ls"], x["l"], x["lt"], x["wk"]))
            top = max(sc)
            rec["top"] = {"o": top[1], "team": top[2], "s": top[0], "wk": top[3]}
            bl = max(real, key=lambda x: x["ws"] - x["ls"])
            rec["blowout"] = {"w": bl["w"], "l": bl["l"], "m": round(bl["ws"] - bl["ls"], 2), "wk": bl["wk"]}
            close = min((x for x in real if x["type"] == "Regular" and x["ws"] > x["ls"]), key=lambda x: x["ws"] - x["ls"], default=None)
            if close:
                rec["closest"] = {"w": close["w"], "l": close["l"], "m": round(close["ws"] - close["ls"], 2), "wk": close["wk"]}
        recs = [(int(num(t["w"])), -int(num(t["l"])), o) for o, t in s["teams"].items() if t["w"] not in ("", None)]
        if recs:
            b = max(recs)
            rec["best"] = {"o": b[2], "w": b[0], "l": -b[1]}
        # draft: top 10 spends, and the biggest buy per owner (spreads the wealth across owners)
        sp = sorted(s["spends"], key=lambda x: -x["$"])
        if sp:
            rec["spends"] = [[x["o"], x["p"], x["pos"], x["$"]] for x in sp[:10]]
            seen, per = set(), []
            for x in sp:
                if x["o"] not in seen:
                    seen.add(x["o"]); per.append([x["o"], x["p"], x["pos"], x["$"]])
            rec["topBuy"] = per
        # comings and goings
        rec["rookies"] = sorted(o for o in s["teams"] if first.get(o) == y and y > 2002)
        rec["farewells"] = sorted(o for o in s["teams"] if last.get(o) == y and y < latest_complete)
        if y in lines:
            rec.update({k: v for k, v in lines[y].items() if v})
        out[str(y)] = rec

    # ---- owners: career lines for the Vault's Owners list (regular season = 2005+ games; titles include 2002-04)
    reg = defaultdict(lambda: [0, 0, 0.0, 0])  # w, l, points for, games
    po_years = defaultdict(set)
    for y in years:
        for x in S[y]["games"]:
            if x["type"] == "Regular":
                if x["w"]: reg[x["w"]][0] += 1; reg[x["w"]][2] += x["ws"]; reg[x["w"]][3] += 1
                if x["l"]: reg[x["l"]][1] += 1; reg[x["l"]][2] += x["ls"]; reg[x["l"]][3] += 1
            elif x["tier"] == "U" and x["type"] in ("Quarterfinal", "Semifinal", "Championship", "ThirdPlace"):
                for o in (x["w"], x["l"]):
                    if o: po_years[o].add(y)
    owners = {}
    for o in seasons_of:
        r = reg[o]
        owners[o] = {"first": first[o], "last": last[o], "seasons": len(seasons_of[o]),
                     "titles": [y for y in years if o in champ_of[y]], "ru": [y for y in years if o in ru_of[y]],
                     "lowerTitles": [y for y in years if o in lower1.get(y, [])],
                     "divTitles": [y for y in years for d in out[str(y)].get("divs", []) if d["tier"] == "U" and d["t"] and d["t"][0][0] == o],
                     "playoffs": sorted(po_years[o]), "w": r[0], "l": r[1], "pf": round(r[2], 2),
                     "teams": [[y, S[y]["teams"][o]["team"]] for y in sorted(seasons_of[o])]}
        buys = [(x["$"], y, x["p"], x["pos"]) for y in sorted(S) for x in S[y]["spends"] if x["o"] == o]
        if buys:
            big = max(buys); owners[o]["bigBuy"] = [big[1], big[2], big[3], big[0]]
            cnt = defaultdict(int)
            for b_ in buys:
                if b_[3] in ("QB", "RB", "WR", "TE"): cnt[(b_[2], b_[3])] += 1  # skill players: the ones people remember
            if cnt:
                fav = max(cnt.items(), key=lambda kv: (kv[1], kv[0][0]))
                if fav[1] >= 3: owners[o]["fav"] = [fav[0][0], fav[0][1], fav[1]]
    # ---- records
    all_games = [dict(x, y=y) for y in years for x in S[y]["games"] if x["w"] and x["l"]]
    sc = [(x["ws"], x["y"], x["wk"], x["w"], x["wt"], x["l"]) for x in all_games] + [(x["ls"], x["y"], x["wk"], x["l"], x["lt"], x["w"]) for x in all_games]
    sc.sort(key=lambda t: -t[0])
    bl = sorted(all_games, key=lambda x: -(x["ws"] - x["ls"]))[:10]
    buys = sorted(((b["$"], y, b["o"], b["p"], b["pos"]) for y in years for b in S[y]["spends"]), key=lambda t: -t[0])[:15]
    act = [o for o in owners if owners[o]["last"] >= max(years) - 0]
    records = {
        "titles": sorted(([o, len(v["titles"]), v["titles"], len(v["ru"])] for o, v in owners.items() if v["titles"] or v["ru"]), key=lambda t: (-t[1], -t[3], t[0])),
        "wins": sorted(([o, v["w"], v["l"], round(v["w"] / max(1, v["w"] + v["l"]), 3)] for o, v in owners.items() if v["w"] + v["l"] >= 39), key=lambda t: -t[3]),
        "points": sorted(([o, v["pf"], v["w"] + v["l"]] for o, v in owners.items() if v["pf"]), key=lambda t: -t[1])[:12],
        "scores": [[t[0], t[1], t[2], t[3], t[4], t[5]] for t in sc[:12]],
        "blowouts": [[round(x["ws"] - x["ls"], 2), x["y"], x["wk"], x["w"], x["l"], x["ws"], x["ls"]] for x in bl],
        "buys": [list(t) for t in buys],
        "playoffs": sorted(([o, len(v["playoffs"])] for o, v in owners.items() if v["playoffs"]), key=lambda t: -t[1])[:12],
        "active": sorted(act),
    }
    # ---- 🎱 tidbits (editorial) + each tidbit player's auction price history (all years, every owner)
    tidbits = []
    if os.path.exists(D("MAFFL_Tidbits.csv")):
        hist = defaultdict(list)
        for y in sorted(S):  # every auction, the current season's included
            for x in S[y]["spends"]:
                hist[(x["p"], x["pos"])].append([y, x["o"], x["$"]])
        for r in rows("MAFFL_Tidbits.csv"):
            if not (r.get("Key") or "").strip():
                continue
            pl, ps = (r.get("Player") or "").strip(), (r.get("Pos") or "").strip()  # name + position: two Josh Allens (QB, DL)
            if pl and (pl, ps) not in hist:
                print("Tidbit %s: no auction history for %r" % (r["Key"], pl), file=sys.stderr); sys.exit(1)
            tidbits.append({"key": r["Key"].strip(), "hook": r["Hook"].strip(), "line": r["Line"].strip(), "player": pl,
                            "pos": ps, "w": int(num(r.get("Weight"), 1)) or 1, "hist": sorted(hist.get((pl, ps), []))})
    # ---- 📅 this week in MAFFL history: for each week number, the standout games across every season (2005+)
    weekly = defaultdict(list)
    for wk in range(1, 18):
        g = [x for x in all_games if x["wk"] == wk]
        if not g:
            continue
        reg = [x for x in g if x["type"] == "Regular"]
        pick = []
        if reg:
            hi = max(reg, key=lambda x: x["ws"]); pick.append(("high", hi))
            bl = max(reg, key=lambda x: x["ws"] - x["ls"]); pick.append(("blowout", bl))
            cl = min((x for x in reg if x["ws"] > x["ls"]), key=lambda x: x["ws"] - x["ls"], default=None)
            if cl: pick.append(("thriller", cl))
        for x in g:
            if x["type"] == "Championship" and x["tier"] == "U": pick.append(("final", x))
        seen = set()
        for kind, x in pick:
            k = (x["y"], x["w"], x["l"])
            if k in seen: continue
            seen.add(k)
            weekly[str(wk)].append([kind, x["y"], x["w"], x["wt"], x["ws"], x["l"], x["lt"], x["ls"], x["type"]])
    # ---- 💸 "What would you pay?" pool: every $40+ buy, with clues so it isn't a wild guess (all from league data)
    pay = []
    for y in years:
        sp = sorted(S[y]["spends"], key=lambda x: -x["$"])
        if not sp:
            continue
        top = sp[0]
        for x in sp:
            if x["$"] < 40:
                continue
            k = (x["p"], x["pos"])
            prev = [z for z in S.get(y - 1, {"spends": []})["spends"] if (z["p"], z["pos"]) == k]
            posr = [z for z in sp if z["pos"] == x["pos"]].index(x) + 1
            # [year, owner, player, pos, NFL team, price, rank in auction, rank at position, nth time bought, last year's price,
            #  that auction's top buy [player, pos, price] or null, buyer won the title 1/0]
            pay.append([y, x["o"], x["p"], x["pos"], x["tm"], x["$"], sp.index(x) + 1, posr,
                        sum(1 for yy in sorted(S) if yy <= y and any((z["p"], z["pos"]) == k for z in S[yy]["spends"])),
                        max((z["$"] for z in prev), default=None), None if top is x else [top["p"], top["pos"], top["$"]], 1 if x["o"] in champ_of[y] else 0])
    return {"v": 1, "tidbits": tidbits, "weekly": weekly, "pay": pay, "eras": [{"id": e[0], "title": e[1], "range": e[2], "from": e[3], "to": e[4]} for e in ERAS],
            "draftEras": [{"name": e[0], "from": e[1], "to": e[2]} for e in DRAFT_ERAS],
            "owners": owners, "records": records, "seasons": out}


def main():
    data = build()
    if UNKNOWN:
        print("Owner names not in MAFFL_Owner_Registry.csv (add them as aliases):", sorted(UNKNOWN), file=sys.stderr)
        sys.exit(1)
    js = ("// DERIVED by _ops/scripts/gen_vault.py from the gold CSVs in data/ (+ data/MAFFL_Throwbacks.csv). Do not hand-edit.\n"
          "window.MAFFL_VAULT = " + json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + ";\n")
    if "--check" in sys.argv:
        cur = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if cur != js:
            print("lab/vault-data.js is out of date: run python3 _ops/scripts/gen_vault.py"); sys.exit(1)
        print("lab/vault-data.js is current"); return
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(js)
    print("wrote lab/vault-data.js · %d seasons · %d KB" % (len(data["seasons"]), len(js.encode()) // 1024))


if __name__ == "__main__":
    main()
