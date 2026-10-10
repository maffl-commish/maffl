#!/usr/bin/env python3
"""Audit gold matchups (data/MAFFL_Matchups_Clean.csv) against the ESPN raw archive.

Read-only. Compares every gold game to ESPN's schedule for the same season/week:
missing or extra games, score mismatches, winner flips, and team-name mismatches.
Also checks gold season W-L (data/MAFFL_Owner_Seasons.csv) against ESPN's regular-season record.

Usage: python3 _ops/scripts/audit_gold_vs_espn.py [raw_dir] [--out report.md]
raw_dir defaults to _ops/inbox/MAFFL_ESPN_raw (from maffl_espn_inventory.py).
"""
import csv, json, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
argv = sys.argv[1:]
OUT = argv[argv.index('--out') + 1] if '--out' in argv else None
args = [a for i, a in enumerate(argv) if not a.startswith('--') and not (i and argv[i - 1] == '--out')]
RAW = args[0] if args else os.path.join(ROOT, '_ops', 'inbox', 'MAFFL_ESPN_raw')
TOL = 0.011  # score tolerance
LAST_YEAR = 2025  # 2026 is checked every week by the ESPN pull; the raw archive is a 9/29 snapshot

def norm(s):
    return ''.join(ch for ch in (s or '').lower() if ch.isalnum())

def load_season(tier, year):
    p = os.path.join(RAW, tier, f'{year}_season.json')
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None

def team_maps(d):
    members = {m['id']: f"{m.get('firstName','')} {m.get('lastName','')}".strip() for m in d.get('members', [])}
    teams = {}
    for t in d['teams']:
        name = t.get('name') or f"{t.get('location','')} {t.get('nickname','')}".strip()
        owners = [members.get(o, o) for o in t.get('owners', [])]
        teams[t['id']] = {'name': name, 'owners': owners, 'rec': t.get('record', {}).get('overall', {})}
    return teams


def draft_audit(path):
    """Pick-level draft check from _ops/inbox/MAFFL_ESPN_Drafts.json (maffl_espn_drafts.py)."""
    import re, unicodedata, difflib
    def nn(x):
        x = unicodedata.normalize('NFKD', x or '').encode('ascii', 'ignore').decode().lower()
        x = re.sub(r'\b(jr|sr|ii|iii|iv|v)\b\.?', '', x)
        return re.sub(r'[^a-z]', '', x)
    canon = {}
    for r in csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Owner_Registry.csv'), encoding='utf-8-sig')):
        for a in [r['canonical_name']] + r['aliases'].split('|'):
            canon[nn(a)] = r['canonical_name']
    C = lambda o: canon.get(nn(o), o)
    seasons = json.load(open(path, encoding='utf-8'))['seasons']
    gold = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Draft_History_Clean_v3.csv'), encoding='utf-8-sig')))
    team_owner = collections.defaultdict(dict)
    for g in csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Matchups_Clean.csv'), encoding='utf-8-sig')):
        for sd in ('Winner', 'Loser'):
            team_owner[g['Year']][nn(g[sd + '_Team'])] = C(g[sd + '_Owner'])
    def sim(a, b):
        r = difflib.SequenceMatcher(None, nn(a), nn(b)).ratio()
        la, lb = a.split()[-1:], b.split()[-1:]
        return max(r, 0.8) if la and lb and nn(la[0]) == nn(lb[0]) else r
    def same_first(a, b):
        fa, fb = nn(a.split()[0]) if a.split() else '', nn(b.split()[0]) if b.split() else ''
        return fa[:1] == fb[:1]
    R = collections.defaultdict(list); st = collections.Counter()
    for y in sorted(seasons):
        if int(y) > LAST_YEAR:
            continue
        ep = []
        for tier, v in seasons[y].items():
            for pk in v['picks']:
                if pk['playerId'] <= 0:
                    st[f'empty {y}'] += 1; continue
                t = nn(pk['team'])
                o = team_owner[y].get(t) or next((ow for tn, ow in team_owner[y].items() if t.endswith(tn) or tn.endswith(t)), None)
                ep.append(dict(pk, owner=o or pk['team']))
        gr = [dict(r, owner=C(r['Owner'])) for r in gold if r['Year'] == y]
        used, left = set(), []
        for pk in ep:
            c = [i for i, r in enumerate(gr) if i not in used and nn(r['Player']) == nn(pk['player'])]
            if c:
                i = next((i for i in c if gr[i]['owner'] == pk['owner']), c[0]); used.add(i); pk['m'] = i; st['exact'] += 1
            else:
                left.append(pk)
        still = []
        for pk in left:
            c = sorted(((sim(gr[i]['Player'], pk['player']), i) for i, r in enumerate(gr) if i not in used and r['owner'] == pk['owner']), reverse=True)
            if c and c[0][0] >= 0.75:
                i = c[0][1]; used.add(i); pk['m'] = i
                line = f"{y} {pk['owner']}: gold '{gr[i]['Player']}' → ESPN '{pk['player']}' ({pk['pos']})"
                if same_first(gr[i]['Player'], pk['player']):
                    R['Draft: spelling differs from ESPN'].append(line); st['spelling'] += 1
                else:
                    R['Draft: probably the wrong player in gold'].append(line); st['wrongish'] += 1
            else:
                still.append(pk)
        gl = [i for i in range(len(gr)) if i not in used]
        for pk in ep:
            if 'm' in pk:
                r = gr[pk['m']]
                if r['owner'] != pk['owner']:
                    R['Draft: pick credited to a different owner'].append(f"{y} {pk['player']}: gold {r['owner']} vs ESPN {pk['owner']}")
                if int(y) >= 2020 and abs(float(r['Price'] or 0) - pk['bid']) > 0.5:
                    R['Draft: price differs (2020+)'].append(f"{y} {pk['player']} ({r['owner']}): gold ${r['Price']} vs ESPN ${pk['bid']}")
        for pk in still:
            same = [i for i in gl if gr[i]['owner'] == pk['owner']]
            if same:
                for i in same: used.add(i)
                R['Draft: probably the wrong player in gold'].append(
                    f"{y} {pk['owner']}: ESPN R{pk['round']} {pk['player']} ({pk['pos']}) · gold unmatched: " +
                    '; '.join(f"{gr[i]['Player']} ({gr[i]['Position_Actual']}) ${gr[i]['Price']}" for i in same))
            else:
                R['Draft: on ESPN, missing from gold'].append(f"{y} {pk['owner']}: R{pk['round']} {pk['player']} ({pk['pos']})")
        for i in range(len(gr)):
            if i not in used:
                R['Draft: in gold, not on ESPN'].append(f"{y} {gr[i]['owner']}: {gr[i]['Player']} ({gr[i]['Position_Actual']}) ${gr[i]['Price']}")
    return R, st

def main():
    gold = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Matchups_Clean.csv'), encoding='utf-8-sig')))
    issues = collections.defaultdict(list)  # category -> rows
    checked = matched = 0
    gold = [g for g in gold if int(g['Year']) <= LAST_YEAR]
    seasons = sorted({(g['Tier'], int(g['Year'])) for g in gold})
    espn_teams_by_season = {}
    for tier, year in seasons:
        d = load_season(tier, year)
        if not d:
            issues['No ESPN data for season'].append(f'{tier} {year}')
            continue
        teams = team_maps(d)
        espn_teams_by_season[(tier, year)] = teams
        by_name = {norm(t['name']): tid for tid, t in teams.items()}
        by_owner = {}
        for tid, t in teams.items():
            for o in t['owners']:
                by_owner.setdefault(norm(o), tid)
        # ESPN games keyed by (week, frozenset(teamIds))
        eg = {}
        for m in d['schedule']:
            if 'away' not in m or 'home' not in m:
                continue  # bye
            wk = m['matchupPeriodId']
            a, h = m['away'], m['home']
            eg[(wk, frozenset((a['teamId'], h['teamId'])))] = m
        used = set()
        for g in (x for x in gold if x['Tier'] == tier and int(x['Year']) == year):
            checked += 1
            wk = int(g['Week'])
            ids = []
            for side in ('Winner', 'Loser'):
                tid = by_name.get(norm(g[f'{side}_Team'])) or by_owner.get(norm(g[f'{side}_Owner_ESPN']))
                ids.append(tid)
            label = f"{tier} {year} Wk{wk:>2} · {g['Winner_Team']} {g['Winner_Score']} def. {g['Loser_Team']} {g['Loser_Score']} ({g['Game_Type']})"
            if None in ids:
                issues['Team not found on ESPN for that season'].append(label)
                continue
            m = eg.get((wk, frozenset(ids)))
            if not m:
                # same pair in a different week?
                other = [k[0] for k in eg if k[1] == frozenset(ids)]
                issues['Game not on ESPN that week'].append(label + (f' — pair plays ESPN wk {other}' if other else ' — pair never meets on ESPN'))
                continue
            used.add((wk, frozenset(ids)))
            matched += 1
            sc = {m['away']['teamId']: m['away']['totalPoints'], m['home']['teamId']: m['home']['totalPoints']}
            ws, ls = float(g['Winner_Score']), float(g['Loser_Score'])
            ew, el = sc[ids[0]], sc[ids[1]]
            if abs(ws - ew) > TOL or abs(ls - el) > TOL:
                if abs(ws - el) <= TOL and abs(ls - ew) <= TOL:
                    issues['Winner/loser swapped'].append(f"{label} — ESPN {teams[ids[1]]['name']} {el} beat {teams[ids[0]]['name']} {ew}" if el > ew else f"{label} — ESPN has scores reversed")
                else:
                    issues['Score mismatch'].append(f"{label} — ESPN {ew} – {el}")
            elif ew < el:
                issues['Winner/loser swapped'].append(f"{label} — ESPN {ew} – {el}")
            for side, tid in zip(('Winner', 'Loser'), ids):
                if norm(g[f'{side}_Team']) != norm(teams[tid]['name']):
                    issues['Team name differs from ESPN'].append(f"{tier} {year}: gold '{g[f'{side}_Team']}' vs ESPN '{teams[tid]['name']}'")
            ptype = m.get('playoffTierType', 'NONE')
            if (ptype == 'NONE') != (g['Game_Type'] == 'Regular') and g['Game_Type'] != 'Ghost':
                issues['Game type differs'].append(f"{label} — ESPN {ptype}")
        for k, m in eg.items():
            if k in used:
                continue
            a, h = m['away'], m['home']
            issues['On ESPN but not in gold'].append(
                f"{tier} {year} Wk{k[0]:>2} · {teams[a['teamId']]['name']} {a['totalPoints']} vs {teams[h['teamId']]['name']} {h['totalPoints']} ({m.get('playoffTierType')})")

    # Season records: gold Owner_Seasons W/L vs ESPN regular-season record
    os_rows = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Owner_Seasons.csv'), encoding='utf-8-sig')))
    rec_checked = 0
    for r in os_rows:
        y = int(r['YEAR'])
        if y > LAST_YEAR:
            continue
        tid = teams = None
        for tier in ('Upper', 'Lower'):
            tt = espn_teams_by_season.get((tier, y)) or {}
            hit = next((t for t, v in tt.items() if norm(v['name']) == norm(r['TEAM']) or norm(v['name']).endswith(norm(r['TEAM']))), None)
            if hit is not None:
                tid, teams = hit, tt
                break
        if not espn_teams_by_season.get(('Upper', y)):
            continue
        if tid is None:
            issues['Season record: team not found on ESPN'].append(f"{y} {r['Owner']} '{r['TEAM']}'")
            continue
        rec_checked += 1
        e = teams[tid]['rec']
        gw, gl, gt = int(r['W'] or 0), int(r['L'] or 0), int(r['T'] or 0)
        if (gw, gl, gt) != (e.get('wins'), e.get('losses'), e.get('ties')):
            issues['Season W-L differs'].append(f"{y} {r['Owner']} ({r['TEAM']}): gold {gw}-{gl}-{gt} vs ESPN {e.get('wins')}-{e.get('losses')}-{e.get('ties')}")

    # Draft: pick counts per season and owner (ESPN has prices only from 2020; no player names in the archive)
    dr = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Draft_History_Clean_v3.csv'), encoding='utf-8-sig')))
    for (tier, y), teams in sorted(espn_teams_by_season.items()):
        d = load_season(tier, y)
        picks = d.get('draftDetail', {}).get('picks', [])
        names = {norm(v['name']) for v in teams.values()}
        espn_n, espn_bid = len(picks), sum(p.get('bidAmount', 0) for p in picks)
        tiers_in_year = [t for (t, yy) in espn_teams_by_season if yy == y]
        if len(tiers_in_year) > 1:
            espn_n = sum(len(load_season(t, y).get('draftDetail', {}).get('picks', [])) for t in tiers_in_year)
            espn_bid = sum(sum(p.get('bidAmount', 0) for p in load_season(t, y).get('draftDetail', {}).get('picks', [])) for t in tiers_in_year)
            if tier != tiers_in_year[0]:
                continue
        rows = [r for r in dr if int(r['Year']) == y]
        gold_bid = sum(float(r['Price'] or 0) for r in rows)
        if len(rows) != espn_n:
            issues['Draft pick count differs'].append(f'{y}: gold {len(rows)} picks vs ESPN {espn_n}')
        if y >= 2020 and abs(gold_bid - espn_bid) > 0.5:
            issues['Draft $ total differs'].append(f'{y}: gold ${gold_bid:.0f} vs ESPN ${espn_bid}')

    dj = os.path.join(ROOT, '_ops', 'inbox', 'MAFFL_ESPN_Drafts.json')
    dstats = None
    if os.path.exists(dj):
        dR, dstats = draft_audit(dj)
        for k, v in dR.items():
            issues[k].extend(v)

    order = ['No ESPN data for season', 'Team not found on ESPN for that season', 'Game not on ESPN that week',
             'On ESPN but not in gold', 'Winner/loser swapped', 'Score mismatch', 'Game type differs',
             'Season W-L differs', 'Season record: team not found on ESPN', 'Draft pick count differs', 'Draft $ total differs',
             'Draft: on ESPN, missing from gold', 'Draft: in gold, not on ESPN', 'Draft: probably the wrong player in gold',
             'Draft: pick credited to a different owner', 'Draft: price differs (2020+)', 'Draft: spelling differs from ESPN',
             'Team name differs from ESPN']
    lines = ['# Gold vs ESPN audit', '', f'Seasons 2005–{LAST_YEAR}. Read-only; generated by _ops/scripts/audit_gold_vs_espn.py from the ESPN raw archive.', '',
             f'Gold games checked: {checked} · matched to an ESPN game: {matched} · season records checked: {rec_checked}', '']
    if dstats:
        empties = ', '.join(f"{k.split()[1]}: {v}" for k, v in sorted(dstats.items()) if k.startswith('empty'))
        lines += [f"Draft picks: {dstats['exact']} exact name match · {dstats['spelling']} spelling-only · ESPN empty picks (no player) {empties}", '']
    lines.append('| Check | Count |\n|---|---|')
    for k in order:
        lines.append(f'| {k} | {len(set(issues.get(k, [])))} |')
    for k in order:
        rows = sorted(set(issues.get(k, [])))
        if not rows:
            continue
        lines += ['', f'## {k} ({len(rows)})', ''] + [f'- {x}' for x in rows]
    text = '\n'.join(lines) + '\n'
    if OUT:
        open(OUT, 'w', encoding='utf-8').write(text)
    print(text)

if __name__ == '__main__':
    main()
