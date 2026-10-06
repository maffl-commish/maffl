# ============================================================
# MAFFL Pulse week checker
# VERSION: 0.1 (2026-10-06)
#
# Mechanical check of the Week W object in weekly.html, so a missing section can't slip
# through on the robot's say-so (Week 4 2026: the PR summary listed Coach of the Week but
# the page never got the coachOfWeek object).
#
# Two kinds of findings:
#   ERROR   a required piece is missing or malformed → exit 1. The workflow flags the PR.
#   WARN    an editorial balance issue (editorial guide §4a "Spread the wealth") → exit 0.
#
# Usage (repo root):  python _ops/scripts/check_pulse_week.py 4
#   -> prints a markdown report and writes _ops/inbox/MAFFL_2026_Week04_check.md
# Needs node (to evaluate the WEEKS array exactly as the browser would).
# ============================================================
import json, os, re, subprocess, sys, tempfile
from collections import Counter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

YEAR = 2026
GHOST = "MAFFL Ghost"
COMMISH_TEAM = "Bad Attitude Gang"


def extract_array(src, anchor):
    """Return the text of the JS array literal that starts at `anchor` (string- and comment-aware)."""
    i = src.index(anchor) + len(anchor) - 1          # at the '['
    depth, j, n = 0, i, len(src)
    while j < n:
        c = src[j]
        if c in "\"'`":
            q = c; j += 1
            while j < n and src[j] != q:
                j += 2 if src[j] == "\\" else 1
        elif src.startswith("//", j):
            j = src.index("\n", j)
        elif src.startswith("/*", j):
            j = src.index("*/", j) + 1
        elif c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return src[i:j + 1]
        j += 1
    raise ValueError("WEEKS array never closes")


def load_weeks(html_path):
    src = open(html_path, encoding="utf-8").read()
    arr = extract_array(src, "const WEEKS = [")
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as fh:
        fh.write("const WEEKS = " + arr + ";\nprocess.stdout.write(JSON.stringify(WEEKS));\n")
        tmp = fh.name
    try:
        out = subprocess.run(["node", tmp], capture_output=True, text=True, encoding="utf-8")
    finally:
        os.unlink(tmp)
    if out.returncode != 0:
        raise SystemExit("ERROR: the WEEKS array doesn't evaluate in node:\n" + out.stderr)
    return json.loads(out.stdout)


def team_list(week):
    u = week.get("upperTier") or {}
    out = {r["team"]: "U" for d in ("divA", "divB", "divC", "divD") for r in (u.get(d) or []) if r.get("team")}
    out.update({r["team"]: "L" for r in (week.get("lowerTier") or []) if r.get("team") and r["team"] != GHOST})
    return out


def story_text(week):
    parts = [week.get("headline") or "", week.get("subhead") or ""]
    for sec in week.get("newsReel") or []:          # v5+ = sections; Weeks 0–1 = flat strings
        parts += (sec.get("items") or []) if isinstance(sec, dict) else [str(sec)]
    return parts


def mentions(texts, teams):
    c = Counter()
    for t in texts:
        for team in teams:
            if team in t:
                c[team] += 1
    return c


def main(w):
    root = os.getcwd()
    weeks = load_weeks(os.path.join(root, "weekly.html"))
    by_num = {wk.get("weekNumber"): wk for wk in weeks}
    errors, warns = [], []
    wk = by_num.get(w)
    if not wk:
        errors.append(f"No Week {w} object in weekly.html.")
        return report(w, errors, warns, {})
    if weeks[0].get("weekNumber") != w:
        errors.append(f"Week {w} isn't the first element of WEEKS (found Week {weeks[0].get('weekNumber')}).")

    espn_path = os.path.join(root, "_ops", "inbox", f"MAFFL_{YEAR}_Week{w:02d}_espn.md")
    espn = open(espn_path, encoding="utf-8").read() if os.path.exists(espn_path) else ""
    m1 = re.search(r"## OUTPUT 1.*?```(.*?)```", espn, re.S)
    games_expected = len(re.findall(rf"^{YEAR},{w},", m1.group(1), re.M)) if m1 else 11

    # ---------------- required pieces (ERROR) ----------------
    for key in ("dateString", "headline", "upperTier", "lowerTier", "results", "survivor",
                "creditTracker", "highestWeekly", "elite5", "newsReel", "matchupPreviews"):
        if not wk.get(key):
            errors.append(f"`{key}` is missing or empty.")
    u = wk.get("upperTier") or {}
    for d in ("divA", "divB", "divC", "divD"):
        if len(u.get(d) or []) != 3:
            errors.append(f"upperTier.{d} should have 3 teams, has {len(u.get(d) or [])}.")
    if len(wk.get("results") or []) != games_expected:
        errors.append(f"results has {len(wk.get('results') or [])} games; the ESPN report has {games_expected}.")
    if len(wk.get("elite5") or []) != 5:
        errors.append(f"elite5 has {len(wk.get('elite5') or [])} entries, needs 5.")
    if "### 2e." in espn:
        c = wk.get("coachOfWeek")
        if not c:
            errors.append("The ESPN report has Coach of the Week (OUTPUT 2e) but the page has no `coachOfWeek` object.")
        else:
            for tier in ("upper", "lower"):
                m = re.search(rf"COACH OF THE WEEK — {tier.capitalize()}: (.+?), left ([\d.]+) on the bench", espn)
                t = c.get(tier)
                if m and not t:
                    errors.append(f"coachOfWeek.{tier} is empty but the report names {m.group(1)}.")
                elif m and t and (t.get("team") != m.group(1) or float(t.get("leftOnBench", -1)) != float(m.group(2))):
                    errors.append(f"coachOfWeek.{tier} = {t.get('team')} {t.get('leftOnBench')}; report says {m.group(1)} {m.group(2)}.")
            n_rows = len(re.findall(r"^\| (?!Team \|)(?!---).+\| [\d.]+ \| [\d.]+ \| [\d.]+ \|", espn[espn.find("### 2e."):], re.M))
            if n_rows and len(c.get("board") or []) != n_rows:
                errors.append(f"coachOfWeek.board has {len(c.get('board') or [])} rows; the report's 2e tables have {n_rows}.")
            n_could = len(re.findall(r"\| YES: lost to", espn))
            if len(c.get("couldHaveWon") or []) != n_could:
                errors.append(f"coachOfWeek.couldHaveWon has {len(c.get('couldHaveWon') or [])} rows; the report marks {n_could}.")
    prev = wk.get("matchupPreviews") or []
    hu = sum(1 for p in prev if p.get("highlight") and p.get("tier") == "U")
    hl = sum(1 for p in prev if p.get("highlight") and p.get("tier") == "L")
    if prev and (hu, hl) != (3, 2):
        errors.append(f"Featured previews are {hu} Upper + {hl} Lower; the guide says 3 + 2.")
    if len(wk.get("headline") or "") > 110:
        errors.append(f"Headline is {len(wk['headline'])} characters (max 110).")
    if len(wk.get("subhead") or "") > 150:
        errors.append(f"Subhead is {len(wk['subhead'])} characters (max 150).")
    reel = wk.get("newsReel") or []
    n_items = sum(len(s.get("items") or []) for s in reel)
    if reel and not (5 <= n_items <= 6):
        errors.append(f"News reel has {n_items} items (needs 5–6).")
    if reel and not (2 <= len(reel) <= 4):
        errors.append(f"News reel has {len(reel)} sections (needs 2–4).")
    blob = json.dumps(wk, ensure_ascii=False)
    for bad in ("NEEDS COMMISH", "CONFIRM", "TODO", "placeholder"):
        if bad in blob:
            errors.append(f"Found `{bad}` in the Week {w} object.")

    # ---------------- spread the wealth (WARN, editorial §4a) ----------------
    teams = team_list(wk)
    lower_teams = {t for t, tier in teams.items() if tier == "L"}
    this = mentions(story_text(wk), teams)
    recent = Counter()
    for k in (w - 1, w - 2, w - 3):
        if k in by_num:
            recent.update(mentions(story_text(by_num[k]), teams))
    head_now = mentions([wk.get("headline") or "", wk.get("subhead") or ""], teams)
    for k in (w - 1, w - 2):
        if k in by_num:
            head_prev = mentions([by_num[k].get("headline") or "", by_num[k].get("subhead") or ""], teams)
            rep = sorted(set(head_now) & set(head_prev))
            if rep:
                warns.append(f"Headline/subhead features {', '.join(rep)} again (also in Week {k}'s). §4a: rotate unless it's a record or a first-ever.")
    for team, n in this.items():
        if n >= 3:
            warns.append(f"{team} is in {n} headline/news items this week (max 2).")
    items = [it for s in reel for it in (s.get("items") or [])]
    lower_items = sum(1 for it in items if any(t in it for t in lower_teams))
    if items and lower_items < 2:
        warns.append(f"Only {lower_items} news item(s) mention a Lower team (aim for at least 2).")
    cold = sorted(t for t in teams if recent[t] == 0)
    cold_hit = sorted(t for t in cold if this[t])
    if cold and len(cold_hit) < 2:
        warns.append(f"Only {len(cold_hit)} of the teams nobody wrote about in the last 3 Pulses got a story this week "
                     f"(aim for 2+). Untouched: {', '.join(cold)}.")
    if this[COMMISH_TEAM] and recent[COMMISH_TEAM] >= 2:
        warns.append(f"{COMMISH_TEAM} (the commissioner's team) is in the news again after {recent[COMMISH_TEAM]} mentions in the last 3 Pulses. Keep it only if it's record-level.")
    return report(w, errors, warns, {"this": this, "recent": recent, "teams": teams})


def report(w, errors, warns, cov):
    L = [f"## Pulse check — Week {w}", ""]
    L.append("**Result:** " + ("❌ " + f"{len(errors)} problem(s) must be fixed" if errors else "✅ all required pieces present")
             + (f" · ⚠️ {len(warns)} balance note(s)" if warns else ""))
    for e in errors: L.append(f"- ❌ {e}")
    for x in warns: L.append(f"- ⚠️ {x}")
    if cov:
        L.append("\n**Headline + news mentions** (this week / previous 3 Pulses):")
        rows = sorted(cov["teams"], key=lambda t: (-(cov["this"][t]), -(cov["recent"][t]), t))
        L.append("; ".join(f"{t} ({cov['teams'][t]}) {cov['this'][t]}/{cov['recent'][t]}" for t in rows))
    out = "\n".join(L) + "\n"
    dest = os.path.join(os.getcwd(), "_ops", "inbox", f"MAFFL_{YEAR}_Week{w:02d}_check.md")
    open(dest, "w", encoding="utf-8").write(out)
    print(out)
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python _ops/scripts/check_pulse_week.py <week>")
    sys.exit(main(int(sys.argv[1])))
