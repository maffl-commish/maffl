#!/usr/bin/env python3
"""Regenerate the per-owner draft summary from gold (added 2026-10-09).

GOLD:    data/MAFFL_Draft_History_Clean_v3.csv
DERIVED: data/MAFFL_Draft_Summary_ByOwner.csv and draft-summary-data.js (power-rankings Draft tab)

  python3 _ops/scripts/gen_draft_summary.py           # check-only: exit 0 = both files match gold
  python3 _ops/scripts/gen_draft_summary.py --write   # rewrite whichever differs (exit 1 when written)
  python3 _ops/scripts/gen_draft_summary.py --gold <csv>   # check against another gold copy (round-trip proof)

Owners are resolved through data/MAFFL_Owner_Registry.csv (canonical name + short name). The file
header comment of the .js is kept verbatim except the "(N picks, YYYY-YYYY)" count.
"""
import csv, io, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GOLD = sys.argv[sys.argv.index('--gold') + 1] if '--gold' in sys.argv else os.path.join(ROOT, 'data', 'MAFFL_Draft_History_Clean_v3.csv')
CSV_OUT = os.path.join(ROOT, 'data', 'MAFFL_Draft_Summary_ByOwner.csv')
JS_OUT = os.path.join(ROOT, 'draft-summary-data.js')
IDP = {'LB', 'DL', 'DE', 'DT', 'DB', 'CB', 'S'}
POS_KEYS = ['QB', 'RB', 'WR', 'TE', 'IDP']

def money(x):
    return f'{x:.0f}' if float(x).is_integer() else f'{x:g}'

def build(gold_path):
    rows = list(csv.DictReader(open(gold_path, encoding='utf-8-sig')))
    reg = {}
    for r in csv.DictReader(open(os.path.join(ROOT, 'data', 'MAFFL_Owner_Registry.csv'), encoding='utf-8-sig')):
        for a in [r['canonical_name']] + r['aliases'].split('|'):
            if a:
                reg.setdefault(a, (r['canonical_name'], r['short_name']))
    by = collections.defaultdict(list)
    short = {}
    for r in rows:
        name, sh = reg.get(r['Owner'], (r['Owner'], ''))
        by[name].append(r); short[name] = sh
    P = lambda r: float(r['Price'] or 0)
    out = []
    for owner in sorted(by, key=lambda s: s.lower()):
        rs = by[owner]
        n = len(rs); tot = sum(P(r) for r in rs)
        mx = max(rs, key=P)
        spend = collections.Counter()
        for r in rs:
            spend[r['Position_Actual']] += P(r)
        yrs = sorted({int(r['Year']) for r in rs})
        last = yrs[-1]
        lr = [r for r in rs if int(r['Year']) == last]
        lmx = max(lr, key=P)
        top = {}
        for k in POS_KEYS:
            cand = [r for r in rs if (r['Position_Actual'] in IDP if k == 'IDP' else r['Position_Actual'] == k)]
            if cand:
                b = max(cand, key=P)
                top[k] = (b['Player'], P(b), int(b['Year']))
        cnt = collections.Counter(r['Player'] for r in rs)
        pspend = collections.Counter()
        for r in rs:
            pspend[r['Player']] += P(r)
        # most-drafted player; ties go to the one the owner spent the most on
        mp = max(cnt, key=lambda k: (cnt[k], pspend[k]))
        most = (mp, cnt[mp])
        pc = collections.Counter(r['Position_Actual'] for r in rs)
        fav = pc.most_common(1)[0]
        out.append(dict(owner=owner, picks=n, spent=tot, avg=tot / n, maxPlayer=mx['Player'], maxPrice=P(mx), maxYear=int(mx['Year']),
                        topPos=spend.most_common(1)[0][0], topSpend=spend.most_common(1)[0][1], years=f'{yrs[0]}-{yrs[-1]}', short=short[owner],
                        last=last, lastPicks=len(lr), lastSpent=sum(P(r) for r in lr), lastTop=lmx['Player'], lastTopPrice=P(lmx),
                        top=top, most=most, fav=fav))
    return rows, out

def render_csv(out, nl='\n'):
    hdr = ['Owner', 'Total_Picks', 'Total_Spent', 'Avg_Price', 'Most_Expensive_Player', 'Most_Expensive_Price', 'Most_Expensive_Year',
           'Top_Position_By_Spend', 'Draft_Years', 'Short_Name', 'Last_Season', 'Last_Season_Picks', 'Last_Season_Spent',
           'Last_Season_Top_Player', 'Last_Season_Top_Price']
    b = io.StringIO(); w = csv.writer(b, quoting=csv.QUOTE_ALL, lineterminator=nl)
    w.writerow(hdr)
    for o in out:
        w.writerow([o['owner'], o['picks'], money(o['spent']), f"{o['avg']:.2f}", o['maxPlayer'], money(o['maxPrice']), o['maxYear'],
                    o['topPos'], o['years'], o['short'], o['last'], o['lastPicks'], money(o['lastSpent']), o['lastTop'], money(o['lastTopPrice'])])
    return b.getvalue()

def js_str(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

def render_js(rows, out, old_js):
    head = old_js.split('window.DRAFT_SUMMARY = [')[0]
    years = sorted({int(r['Year']) for r in rows})
    head = re.sub(r'\([\d,]+ picks, \d{4}-\d{4}\)', f'({len(rows):,} picks, {years[0]}-{years[-1]})', head)
    nl = '\r\n' if '\r\n' in old_js else '\n'
    lines = []
    for o in out:
        tp = ','.join(f"{k}:{{player:{js_str(v[0])},price:{money(v[1])},year:{v[2]}}}" for k, v in o['top'].items())
        lines.append(f"{{ owner:{js_str(o['owner'])}, picks:{o['picks']}, spent:{money(o['spent'])}, avg:{o['avg']:.2f}, "
                     f"maxPlayer:{js_str(o['maxPlayer'])}, maxPrice:{money(o['maxPrice'])}, maxYear:{o['maxYear']}, topPos:{js_str(o['topPos'])}, "
                     f"years:{js_str(o['years'])}, topByPos:{{{tp}}}, mostPlayer:{js_str(o['most'][0])}, mostPlayerCount:{o['most'][1]}, "
                     f"favPos:{js_str(o['topPos'])}, favPosPct:{round(100 * o['topSpend'] / o['spent']) if o['spent'] else 0}, "
                     f"lastSeason:{{year:{o['last']},picks:{o['lastPicks']},spent:{money(o['lastSpent'])},topPlayer:{js_str(o['lastTop'])},topPrice:{money(o['lastTopPrice'])}}} }}")
    return head + 'window.DRAFT_SUMMARY = [' + nl + ''.join(l + ',' + nl for l in lines) + '];' + nl

def main():
    rows, out = build(GOLD)
    old_csv = open(CSV_OUT, 'rb').read()
    old_js_b = open(JS_OUT, 'rb').read()
    old_js = old_js_b.decode('utf-8-sig')
    new_csv = b'\xef\xbb\xbf' + render_csv(out, '\r\n' if b'\r\n' in old_csv else '\n').encode('utf-8')
    new_js = (b'\xef\xbb\xbf' if old_js_b.startswith(b'\xef\xbb\xbf') else b'') + render_js(rows, out, old_js).encode('utf-8')
    changed = 0
    for label, path, old, new in (('MAFFL_Draft_Summary_ByOwner.csv', CSV_OUT, old_csv, new_csv), ('draft-summary-data.js', JS_OUT, old_js_b, new_js)):
        if old == new:
            print(f'[{label}] ROUND-TRIP EXACT')
            continue
        changed += 1
        print(f'[{label}] DIFFERS')
        if '--write' in sys.argv:
            open(path, 'wb').write(new); print(f'[{label}] WROTE')
    sys.exit(1 if changed else 0)

if __name__ == '__main__':
    main()
