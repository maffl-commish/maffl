#!/usr/bin/env python3
"""Rebuild gold draft player identities from ESPN (one-off, 2026-10-09; re-runnable, idempotent).

Reads  data/MAFFL_Draft_History_Clean_v3.csv (gold) + _ops/inbox/MAFFL_ESPN_Drafts.json
       (from the "ESPN draft history pull" Action, maffl_espn_drafts.py v0.2+).
Writes the gold CSV in place, editing only changed fields of changed rows (other bytes untouched),
and a change log (--log, default _ops/AUDIT_2026-10-09_draft_rebuild.md).

Per season 2005-2025, except 2006 (ESPN lost 37 of that year's picks; gold is the better record):
  * Player          <- ESPN's name for every pick matched to a gold row whose name differs beyond
                       punctuation/case/suffix (fixes spellings and the surname guesses, e.g. "Reed" ->
                       Ed Reed when it was Jeff Reed). Gold's style ("Marion Barber III") is kept otherwise.
  * Position_Actual <- ESPN's position when gold has FLX (a slot, not a position); when the player was
                       wrong (different person) and the group differs; or, for the same player, when gold
                       puts him on the wrong side of the ball (ESPN's position is the player's latest, so
                       DE<->LB style drift between seasons is left alone).
                       Written in that season's gold style (DE/DT/CB/S if the season uses them, else DL/DB).
  * Owner           <- the ESPN drafting team's owner, when gold credits someone else.
  * Missing picks   -> appended to that season (Player_Raw = ESPN name, Draft_Slot blank,
                       Price = ESPN bid 2020+ else blank, NFL_Team = ESPN pro team that season).
Player_Raw, Draft_Slot, NFL_Team and Price of existing rows are never changed.
Rows it can't pair confidently are listed in the log for the commissioner, not changed.
"""
import csv, io, json, os, re, sys, unicodedata, difflib, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GOLD = os.path.join(ROOT, 'data', 'MAFFL_Draft_History_Clean_v3.csv')
ESPN = os.path.join(ROOT, '_ops', 'inbox', 'MAFFL_ESPN_Drafts.json')
LOG = sys.argv[sys.argv.index('--log') + 1] if '--log' in sys.argv else os.path.join(ROOT, '_ops', 'AUDIT_2026-10-09_draft_rebuild.md')
DRY = '--dry-run' in sys.argv
SKIP_YEARS = {2006}
LAST_YEAR = 2025
SIDE = {'QB': 'O', 'RB': 'O', 'WR': 'O', 'TE': 'O', 'K': 'K', 'DL': 'D', 'LB': 'D', 'DB': 'D'}
GROUP = {'QB': 'QB', 'RB': 'RB', 'WR': 'WR', 'TE': 'TE', 'K': 'K', 'DL': 'DL', 'DE': 'DL', 'DT': 'DL',
         'LB': 'LB', 'DB': 'DB', 'CB': 'DB', 'S': 'DB'}
PRO = {1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET', 9: 'GB', 10: 'TEN',
       11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN', 17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ',
       21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC', 25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX',
       33: 'BAL', 34: 'HOU'}

def pro_team(pk, yi):
    team = PRO.get(pk.get('proTeamId'), '')
    if team == 'LV' and yi < 2020: team = 'OAK'
    if team == 'LAR' and yi < 2016: team = 'STL'
    if team == 'LAC' and yi < 2017: team = 'SD'
    if team == 'WSH': team = 'WAS'
    return team

def nn(x):
    x = unicodedata.normalize('NFKD', x or '').encode('ascii', 'ignore').decode().lower()
    x = re.sub(r'\b(jr|sr|ii|iii|iv|v)\b\.?', '', x)
    return re.sub(r'[^a-z]', '', x)

def sim(a, b):
    r = difflib.SequenceMatcher(None, nn(a), nn(b)).ratio()
    la, lb = a.split()[-1:], b.split()[-1:]
    return max(r, 0.8) if la and lb and nn(la[0]) == nn(lb[0]) else r

def main():
    raw = open(GOLD, 'rb').read()
    bom = raw.startswith(b'\xef\xbb\xbf')
    text = raw.decode('utf-8-sig')
    nl = '\r\n' if '\r\n' in text else '\n'
    lines = text.split(nl)
    trailing = lines[-1] == ''
    if trailing:
        lines = lines[:-1]
    hdr = next(csv.reader([lines[0]]))
    rows = [next(csv.reader([ln])) for ln in lines[1:]]   # gold has no embedded newlines (checked below)
    assert all(len(r) == len(hdr) for r in rows), 'unexpected field count (embedded newline?)'
    H = {h: i for i, h in enumerate(hdr)}

    # owner canon (registry) and the spelling gold's draft file uses per canonical owner
    canon = {}
    for r in csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Owner_Registry.csv'), encoding='utf-8-sig')):
        for a in [r['canonical_name']] + r['aliases'].split('|'):
            canon[nn(a)] = r['canonical_name']
    C = lambda o: canon.get(nn(o), o)
    spell = collections.defaultdict(collections.Counter)
    for r in rows:
        spell[(r[H['Year']], C(r[H['Owner']]))][r[H['Owner']]] += 1
    spell_any = collections.defaultdict(collections.Counter)
    for r in rows:
        spell_any[C(r[H['Owner']])][r[H['Owner']]] += 1
    def gold_spelling(year, owner):
        c = spell.get((year, owner)) or spell_any.get(owner)
        return c.most_common(1)[0][0] if c else owner

    team_owner = collections.defaultdict(dict)
    for g in csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Matchups_Clean.csv'), encoding='utf-8-sig')):
        for sd in ('Winner', 'Loser'):
            team_owner[g['Year']][nn(g[sd + '_Team'])] = C(g[sd + '_Owner'])

    seasons = json.load(open(ESPN, encoding='utf-8'))['seasons']
    log = collections.defaultdict(list)
    changed_rows = set()
    appended = []   # (year, row)

    for y in sorted(seasons):
        yi = int(y)
        if yi > LAST_YEAR:
            continue
        idx = [i for i, r in enumerate(rows) if r[H['Year']] == y]
        if yi in SKIP_YEARS:
            log['Skipped seasons'].append(f'{y}: ESPN lost {sum(1 for t in seasons[y].values() for p in t["picks"] if p["playerId"] <= 0)} picks; gold left as is')
            continue
        specific = any(rows[i][H['Position_Actual']] in ('DE', 'DT', 'CB', 'S') for i in idx)
        def style(pos):
            if specific or pos not in ('DE', 'DT', 'CB', 'S'):
                return pos
            return 'DL' if pos in ('DE', 'DT') else 'DB'
        ep = []
        for v in seasons[y].values():
            for pk in v['picks']:
                if pk['playerId'] <= 0:
                    continue
                t = nn(pk['team'])
                o = team_owner[y].get(t) or next((ow for tn, ow in team_owner[y].items() if t.endswith(tn) or tn.endswith(t)), None)
                ep.append(dict(pk, owner=o))
        used = set()
        pairs = []
        left = []
        for pk in ep:   # exact name, same owner first
            c = [i for i in idx if i not in used and nn(rows[i][H['Player']]) == nn(pk['player'])]
            if c:
                i = next((i for i in c if C(rows[i][H['Owner']]) == pk['owner']), c[0]); used.add(i); pairs.append((pk, i, 'exact'))
            else:
                left.append(pk)
        still = []
        for pk in left:   # fuzzy within the same owner
            c = sorted(((sim(rows[i][H['Player']], pk['player']), i) for i in idx if i not in used and C(rows[i][H['Owner']]) == pk['owner']), reverse=True)
            if c and c[0][0] >= 0.75:
                used.add(c[0][1]); pairs.append((pk, c[0][1], 'fuzzy'))
            else:
                still.append(pk)
        # leftovers: pair one-to-one within owner by position group when unambiguous
        missing = []
        by_owner = collections.defaultdict(list)
        for pk in still:
            by_owner[pk['owner']].append(pk)
        for owner, pks in by_owner.items():
            gl = [i for i in idx if i not in used and C(rows[i][H['Owner']]) == owner]
            if not gl:
                missing.extend(pks); continue
            def plausible(i, pk):
                # a full first+last name in Player_Raw that looks nothing like ESPN's is a real
                # disagreement (maybe a roster, not draft, screenshot): don't overwrite it.
                rawn = rows[i][H['Player_Raw']]
                full = len(rawn.split()) >= 2 and len(re.sub(r'[^A-Za-z]', '', rawn.split()[0])) > 2
                if pro_team(pk, yi) and pro_team(pk, yi) == rows[i][H['NFL_Team']]:
                    return True   # same position group and same NFL team ("Big Ben" = Roethlisberger, PIT)
                return not (full and sim(rawn, pk['player']) < 0.6)
            for pk in list(pks):
                same = [i for i in gl if GROUP.get(rows[i][H['Position_Actual']]) == GROUP.get(pk['pos'])]
                if len(gl) == 1 and len(pks) == 1:
                    same = gl
                same = [i for i in same if plausible(i, pk)]
                if len(same) == 1:
                    i = same[0]; used.add(i); gl.remove(i); pks.remove(pk); pairs.append((pk, i, 'leftover'))
            for pk in pks:
                if gl:
                    log['Not changed: couldn\'t pair (commissioner check)'].append(
                        f"{y} {owner}: ESPN {pk['player']} ({pk['pos']}) · gold unpaired: " +
                        '; '.join(f"{rows[i][H['Player']]} ({rows[i][H['Position_Actual']]}) ${rows[i][H['Price']]}" for i in gl))
                else:
                    missing.append(pk)

        for pk, i, how in pairs:
            r = rows[i]; before = list(r); notes = []
            renamed = bool(pk['player']) and nn(r[H['Player']]) != nn(pk['player'])
            first = lambda x: nn(x.split()[0])[:1] if x.split() else ''
            other_person = renamed and (how == 'leftover' or first(r[H['Player']]) != first(pk['player']))
            if renamed:
                notes.append(f"player '{r[H['Player']]}' → '{pk['player']}'")
                r[H['Player']] = pk['player']
            gpos = r[H['Position_Actual']]
            epos = pk['pos']
            fix_pos = epos in GROUP and GROUP.get(gpos) != GROUP[epos] and (
                gpos not in GROUP or other_person or SIDE.get(GROUP.get(gpos)) != SIDE[GROUP[epos]])
            if fix_pos:
                newpos = style(pk['pos'])
                notes.append(f"position {gpos} → {newpos}")
                r[H['Position_Actual']] = newpos
            if pk['owner'] and C(r[H['Owner']]) != pk['owner']:
                newo = gold_spelling(y, pk['owner'])
                notes.append(f"owner {r[H['Owner']]} → {newo}")
                r[H['Owner']] = newo
            if notes:
                changed_rows.add(i)
                kind = 'Wrong player (or nickname) replaced' if other_person else (
                    'Spelling fixed' if renamed else 'Position fixed (FLX or wrong side of the ball)')
                if any(n.startswith('owner') for n in notes):
                    kind = 'Owner fixed'
                log[kind].append(f"{y} {C(before[H['Owner']])} (raw '{before[H['Player_Raw']]}'): " + '; '.join(notes))
        for pk in missing:
            o = gold_spelling(y, pk['owner'])
            team = pro_team(pk, yi)
            price = str(float(pk['bid'])) if yi >= 2020 else ''
            row = ['' for _ in hdr]
            row[H['Year']] = y; row[H['Owner']] = o; row[H['Player_Raw']] = pk['player']; row[H['Player']] = pk['player']
            row[H['Position_Actual']] = style(pk['pos']); row[H['Draft_Slot']] = ''; row[H['NFL_Team']] = team; row[H['Price']] = price
            appended.append((y, row))
            log['Added (on ESPN, missing from gold)'].append(f"{y} {pk['owner']}: R{pk['round']} {pk['player']} ({row[H['Position_Actual']]}, {team}) price {'$' + price if price else 'unknown'}")

    # team abbreviations: use gold's own spelling for WSH/WAS etc.
    teams_used = collections.Counter(r[H['NFL_Team']] for r in rows)
    for _, row in appended:
        if row[H['NFL_Team']] == 'WSH' and teams_used['WAS'] > teams_used['WSH']:
            row[H['NFL_Team']] = 'WAS'
        if row[H['NFL_Team']] == 'LAR' and teams_used['LA'] > teams_used['LAR']:
            row[H['NFL_Team']] = 'LA'

    def fmt(r):
        b = io.StringIO(); csv.writer(b, lineterminator='').writerow(r); return b.getvalue()
    out = [lines[0]]
    by_year_last = {}
    for k, r in enumerate(rows):
        by_year_last[r[H['Year']]] = k
    add_after = collections.defaultdict(list)
    for y, row in appended:
        add_after[by_year_last[y]].append(row)
    for k, r in enumerate(rows):
        out.append(fmt(r) if k in changed_rows else lines[k + 1])
        for row in add_after.get(k, []):
            out.append(fmt(row))
    new_text = nl.join(out) + (nl if trailing else '')
    if not DRY:
        open(GOLD, 'wb').write((b'\xef\xbb\xbf' if bom else b'') + new_text.encode('utf-8'))

    order = ['Wrong player (or nickname) replaced', 'Owner fixed', 'Added (on ESPN, missing from gold)',
             'Spelling fixed', 'Position fixed (FLX or wrong side of the ball)', "Not changed: couldn't pair (commissioner check)", 'Skipped seasons']
    md = ['# Draft rebuild from ESPN — 2026-10-09', '',
          'Generated by `_ops/scripts/rebuild_draft_from_espn.py` from `_ops/inbox/MAFFL_ESPN_Drafts.json`. '
          'Gold `data/MAFFL_Draft_History_Clean_v3.csv` edited in place; Player_Raw, Draft_Slot, NFL_Team and Price of existing rows untouched.', '',
          f'Rows changed: {len(changed_rows)} · rows added: {len(appended)}', '', '| Change | Count |', '|---|---|']
    md += [f'| {k} | {len(log.get(k, []))} |' for k in order]
    for k in order:
        if log.get(k):
            md += ['', f'## {k} ({len(log[k])})', ''] + [f'- {x}' for x in log[k]]
    open(LOG, 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print('\n'.join(md[:14]))

if __name__ == '__main__':
    main()
