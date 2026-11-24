#!/usr/bin/env python3
"""📰 Swap the commish's headline pick into the Week W Pulse (commish 11/24).

    python3 _ops/scripts/pulse_headline.py W PICK      # PICK = option number, 1-based (1 = the robot's own)

Reads _ops/inbox/MAFFL_2026_WeekWW_headlines.json (written by the Pulse robot) and replaces the `headline:` and
`subhead:` lines of the Week W object in weekly.html. Touches nothing else. Exit 1 with a reason on any problem.
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def fail(msg):
    print("❌ " + msg); sys.exit(1)

def main():
    if len(sys.argv) != 3: fail("usage: pulse_headline.py WEEK PICK")
    w, pick = int(sys.argv[1]), int(sys.argv[2])
    hp = os.path.join(ROOT, "_ops", "inbox", "MAFFL_2026_Week%02d_headlines.json" % w)
    if not os.path.exists(hp): fail("no headlines file for Week %d" % w)
    d = json.load(open(hp, encoding="utf-8"))
    opts = d.get("options") or []
    if int(d.get("week", w)) != w: fail("headlines file is for Week %s" % d.get("week"))
    if not 1 <= pick <= len(opts): fail("pick %d isn't one of the %d options" % (pick, len(opts)))
    o = opts[pick - 1]
    head, sub = str(o.get("headline") or "").strip(), str(o.get("subhead") or "").strip()
    if not head: fail("option %d has no headline" % pick)
    wp = os.path.join(ROOT, "weekly.html")
    s = open(wp, encoding="utf-8").read()
    m = re.search(r"\n\s*weekNumber:\s*%d\s*,\s*\n" % w, s)
    if not m: fail("Week %d isn't in weekly.html" % w)
    start = m.end()
    nxt = re.search(r"\n\s*weekNumber:\s*\d+\s*,", s[start:])
    end = start + nxt.start() if nxt else len(s)
    block = s[start:end]
    js = lambda t: json.dumps(t, ensure_ascii=False)
    new, n1 = re.subn(r'(?m)^(\s*headline:\s*)".*?"(\s*,\s*)$', lambda x: x.group(1) + js(head) + x.group(2), block, count=1)
    if not n1: fail("no headline line in Week %d" % w)
    if sub:
        new, n2 = re.subn(r'(?m)^(\s*subhead:\s*)".*?"(\s*,\s*)$', lambda x: x.group(1) + js(sub) + x.group(2), new, count=1)
        if not n2: fail("no subhead line in Week %d" % w)
    if new == block: print("✅ Week %d already shows option %d" % (w, pick)); return
    open(wp, "w", encoding="utf-8").write(s[:start] + new + s[end:])
    print("✅ Week %d headline → option %d: %s" % (w, pick, head))

if __name__ == "__main__":
    main()
