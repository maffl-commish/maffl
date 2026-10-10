# ============================================================
# MAFFL ESPN draft history pull
# VERSION: 0.1 (2026-10-09)
#
# READ-ONLY on ESPN. Pulls every past draft (both tiers) with player NAMES and writes
#   _ops/inbox/MAFFL_ESPN_Drafts.json   (picks: round, pick, team, player, position, $)
#   _ops/inbox/MAFFL_ESPN_Drafts_log.md (which name lookup worked per season, anything missing)
# No message-board or member data is saved (the repo is public).
# The comparison with gold runs separately: _ops/scripts/audit_gold_vs_espn.py --drafts
#
# Runs in the "ESPN draft history pull" GitHub Action (needs secrets ESPN_S2 + SWID).
# Env: MAFFL_YEARS (optional, e.g. "2005-2025" or "2011,2016").
# ============================================================
import os, sys, json, time
from datetime import datetime
from zoneinfo import ZoneInfo
from espn_api.requests.espn_requests import EspnFantasyRequests

LEAGUES = {"Upper": 34467, "Lower": 1587593698}
FIRST_LOWER = 2025
ET = ZoneInfo("America/New_York")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_JSON = os.path.join(ROOT, "_ops", "inbox", "MAFFL_ESPN_Drafts.json")
OUT_LOG = os.path.join(ROOT, "_ops", "inbox", "MAFFL_ESPN_Drafts_log.md")
POS = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 7: "P", 9: "DT", 10: "DE", 11: "LB", 12: "CB", 13: "S", 14: "HC", 16: "D/ST"}

def years_from_env():
    s = (os.environ.get("MAFFL_YEARS") or "2005-2025").replace(" ", "")
    out = set()
    for part in s.split(","):
        if "-" in part:
            a, b = part.split("-"); out |= set(range(int(a), int(b) + 1))
        elif part:
            out.add(int(part))
    return sorted(out)

COOKIES = {"espn_s2": os.environ["ESPN_S2"], "SWID": os.environ["SWID"]}
LOG, NOTES = [], []

def req(year, lid):
    return EspnFantasyRequests(sport="nfl", year=year, league_id=lid, cookies=COOKIES)

def norm_players(data):
    """players_wl rows are flat; kona rows wrap the player under 'player'."""
    rows = data.get("players", data) if isinstance(data, dict) else data
    out = {}
    for p in rows or []:
        p = p.get("player", p) if isinstance(p, dict) else {}
        if p.get("id") is not None and p.get("fullName"):
            out[int(p["id"])] = {"name": p["fullName"], "pos": POS.get(p.get("defaultPositionId"), str(p.get("defaultPositionId"))),
                                 "proTeamId": p.get("proTeamId")}
    return out

def lookup(year, lid, ids):
    """Try season player list, then the league's player view, then the current season."""
    found, used = {}, []
    tries = [
        ("season players_wl", lambda miss: req(year, lid).get(extend="/players", params={"view": "players_wl"},
            headers={"x-fantasy-filter": json.dumps({"filterIds": {"value": miss}})})),
        ("league kona_player_info", lambda miss: req(year, lid).league_get(params={"view": "kona_player_info"},
            headers={"x-fantasy-filter": json.dumps({"players": {"filterIds": {"value": miss}, "limit": len(miss)}})})),
        ("2026 players_wl", lambda miss: req(2026, LEAGUES["Upper"]).get(extend="/players", params={"view": "players_wl"},
            headers={"x-fantasy-filter": json.dumps({"filterIds": {"value": miss}})})),
    ]
    for label, fn in tries:
        miss = [i for i in ids if i not in found]
        if not miss:
            break
        try:
            got = norm_players(fn(miss))
            got = {k: v for k, v in got.items() if k in set(miss)}
            if got:
                used.append(f"{label} ({len(got)})")
            found.update(got)
        except Exception as e:
            used.append(f"{label} failed: {type(e).__name__} {str(e)[:80]}")
        time.sleep(0.5)
    return found, used

def pull(tier, year):
    lid = LEAGUES[tier]
    base = req(year, lid).league_get(params={"view": ["mTeam", "mDraftDetail"]})
    teams = {}
    for t in base.get("teams") or []:
        teams[str(t["id"])] = t.get("name") or f"{t.get('location', '')} {t.get('nickname', '')}".strip()
    picks = (base.get("draftDetail") or {}).get("picks") or []
    ids = sorted({int(p["playerId"]) for p in picks if p.get("playerId", -1) >= 0})
    names, used = lookup(year, lid, ids)
    rows = []
    for p in picks:
        pid = int(p.get("playerId", -1))
        info = names.get(pid, {})
        rows.append({"overall": p.get("overallPickNumber"), "round": p.get("roundId"), "pick": p.get("roundPickNumber"),
                     "teamId": p.get("teamId"), "team": teams.get(str(p.get("teamId")), "?"),
                     "playerId": pid, "player": info.get("name", ""), "pos": info.get("pos", ""),
                     "bid": p.get("bidAmount", 0), "keeper": bool(p.get("keeper"))})
    missing = [i for i in ids if i not in names]
    LOG.append(f"| {tier} | {year} | {len(picks)} | {len(ids) - len(missing)}/{len(ids)} | {'; '.join(used) or '—'} |")
    if missing:
        NOTES.append(f"- {tier} {year}: no name for player IDs {missing[:20]}{' …' if len(missing) > 20 else ''}")
    return {"teams": teams, "picks": rows}

def main():
    out = {}
    if os.path.exists(OUT_JSON):
        out = json.load(open(OUT_JSON, encoding="utf-8")).get("seasons", {})
    for year in years_from_env():
        for tier in ("Upper", "Lower"):
            if tier == "Lower" and year < FIRST_LOWER:
                continue
            try:
                out.setdefault(str(year), {})[tier] = pull(tier, year)
            except Exception as e:
                LOG.append(f"| {tier} | {year} | — | — | FAILED: {type(e).__name__} {str(e)[:100]} |")
            time.sleep(0.5)
    stamp = datetime.now(ET).strftime("%Y-%m-%d %I:%M %p ET")
    json.dump({"source": "ESPN via maffl_espn_drafts.py v0.1", "pulled": stamp, "seasons": out},
              open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
    log = [f"# MAFFL ESPN draft pull", f"maffl_espn_drafts.py v0.1 · run {stamp} · read-only", "",
           "| Tier | Year | Picks | Names found | Lookup used |", "|---|---|---|---|---|"] + LOG
    if NOTES:
        log += ["", "## Unnamed players", ""] + NOTES
    open(OUT_LOG, "w", encoding="utf-8").write("\n".join(log) + "\n")
    print("\n".join(log))
    gh = os.environ.get("GITHUB_STEP_SUMMARY")
    if gh:
        open(gh, "a", encoding="utf-8").write("\n".join(log) + "\n")

if __name__ == "__main__":
    main()
