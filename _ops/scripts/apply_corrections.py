# ============================================================
# MAFFL stat corrections: apply ESPN's in-season score changes to gold (CE-1a, robot path)
# VERSION: 0.1.0 (2026-10-06): first version
#
# Usage (repo root):  python _ops/scripts/apply_corrections.py 4
# Reads  _ops/inbox/MAFFL_2026_WeekNN_espn.md (must end STATUS: READY TO INGEST), OUTPUT 4
# Edits  data/MAFFL_Matchups_Clean.csv: score fields only (a flipped winner swaps the two sides),
#        2026 weeks < N only. Never adds or removes rows. Keeps line endings + trailing newline.
# Writes _ops/inbox/MAFFL_2026_WeekNN_corrections.md (only when the report lists corrections).
# Derived files are NOT touched here: run build\generate-matchups-data.ps1 -CorrectSeason 2026 next.
# Exit 0 = applied (or none); 3 = applied and a winner flipped; 2 = refused (nothing written).
# ============================================================
import os, re, sys
from decimal import Decimal

# Windows runners print with a legacy code page that can't show 👻 or →; force UTF-8 output.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

YEAR = 2026
GHOST = "MAFFL Ghost"
CLEAN = os.path.join("data", "MAFFL_Matchups_Clean.csv")

def refuse(msg):
    print("REFUSED: " + msg); sys.exit(2)

def section(text, heading):
    i = text.find(heading)
    if i < 0: return ""
    j = text.find("\n## ", i + len(heading))
    return text[i: j if j > 0 else len(text)]

def key(f):
    return (int(f[1]), f[2], frozenset((f[7], f[11])))

def winner(f):
    return f[7]

def main(week):
    rep = os.path.join("_ops", "inbox", f"MAFFL_{YEAR}_Week{week:02d}_espn.md")
    if not os.path.exists(rep): refuse(f"{rep} not found")
    text = open(rep, encoding="utf-8").read()
    last = [l for l in text.strip().splitlines() if l.strip()][-1]
    if last.strip() != "STATUS: READY TO INGEST": refuse(f"report status is '{last.strip()}'")

    out4 = section(text, "## OUTPUT 4")
    if not out4: refuse("OUTPUT 4 (prior-week score audit) not found")
    m = re.search(r"Stat corrections vs gold: (\S+)", out4)
    if not m: refuse("'Stat corrections vs gold:' line not found in OUTPUT 4")
    if m.group(1) == "none":
        print("No stat corrections."); return 0

    # Audit blocks: "Week K" line, then a fenced block of 13-field rows.
    audit = {}
    for wk, body in re.findall(r"^Week (\d+)\s*\n```\n(.*?)\n```", out4, re.S | re.M):
        rows = [l.split(",") for l in body.splitlines() if l.strip()]
        k = int(wk)
        if k >= week: refuse(f"audit block for week {k} is not an earlier week")
        for f in rows:
            if len(f) != 13 or f[0] != str(YEAR) or f[1] != wk:
                refuse(f"malformed audit row in Week {wk}: {','.join(f)}")
        audit[k] = rows
    if not audit: refuse("no audit row blocks found in OUTPUT 4")
    sm = re.search(r"AUDIT · weeks .*? · score_sum ([0-9.]+)", out4)
    if not sm: refuse("AUDIT checksum line not found")
    total = sum(Decimal(f[8]) + Decimal(f[12]) for rows in audit.values() for f in rows)
    if total != Decimal(sm.group(1)):
        refuse(f"audit score sum {total} doesn't match the report's {sm.group(1)}")

    raw = open(CLEAN, "rb").read()
    nl = b"\r\n" if b"\r\n" in raw else b"\n"
    trailing = raw.endswith(nl)
    bom = raw.startswith(b"\xef\xbb\xbf")
    lines = raw.decode("utf-8-sig").split(nl.decode())
    if trailing: lines = lines[:-1]

    gold_idx = {}   # key -> line index, 2026 weeks < W
    counts = {}
    for i, line in enumerate(lines[1:], start=1):
        f = line.split(",")
        if len(f) != 13 or f[0] != str(YEAR): continue
        wk = int(f[1])
        if wk >= week: continue
        counts[wk] = counts.get(wk, 0) + 1
        k = key(f)
        if k in gold_idx: refuse(f"duplicate gold game: week {wk} {f[2]} {f[7]} vs {f[11]}")
        gold_idx[k] = i

    for wk in sorted(set(counts) | set(audit)):
        if wk not in audit: refuse(f"gold has week {wk} but the audit has no block for it")
        if counts.get(wk, 0) != len(audit[wk]):
            refuse(f"week {wk}: gold has {counts.get(wk, 0)} rows, audit has {len(audit[wk])}")

    new_lines = list(lines)
    bullets, ghost_notes = [], []
    changes = rows_changed = flips = 0
    for wk in sorted(audit):
        for a in audit[wk]:
            k = key(a)
            if k not in gold_idx: refuse(f"no gold row for week {wk} {a[2]}: {a[7]} vs {a[11]}")
            i = gold_idx[k]
            g = lines[i].split(",")
            old = {g[7]: g[8], g[11]: g[12]}
            new = {a[7]: a[8], a[11]: a[12]}
            if all(Decimal(old[t]) == Decimal(new[t]) for t in old): continue
            flipped = winner(g) != winner(a)
            if flipped:
                # Swap sides, keeping each side's gold owner/ESPN/team strings.
                n = g[:5] + g[9:12] + [a[8]] + g[5:8] + [a[12]]
                flips += 1
            else:
                n = g[:8] + [new[g[7]]] + g[9:12] + [new[g[11]]]
            new_lines[i] = ",".join(n)
            rows_changed += 1
            for t, opp in ((g[7], g[11]), (g[11], g[7])):
                if Decimal(old[t]) == Decimal(new[t]): continue
                changes += 1
                if t == GHOST:
                    ghost_notes.append(f"Week {wk} {Decimal(old[t]):.2f} → {Decimal(new[t]):.2f} — LM: re-enter in ESPN")
                bullets.append(f"- Week {wk} · {g[2]} · {t} {Decimal(old[t]):.2f} → {Decimal(new[t]):.2f}"
                               f" (vs {opp}, result {'CHANGED' if flipped else 'unchanged'})")
            if flipped:
                bullets.append(f"- ⚠️ Week {wk} · {g[2]} · WINNER FLIPPED: {winner(g)} → {winner(a)}")

    if rows_changed:
        body = nl.join(l.encode("utf-8") for l in new_lines) + (nl if trailing else b"")
        out = (b"\xef\xbb\xbf" if bom else b"") + body
        with open(CLEAN, "wb") as fh: fh.write(out)
        # Re-read and confirm every 2026 week < W now matches the audit.
        chk = {}
        for line in open(CLEAN, encoding="utf-8-sig"):
            f = line.rstrip("\r\n").split(",")
            if len(f) == 13 and f[0] == str(YEAR) and int(f[1]) < week: chk[key(f)] = f
        bad = [a for rows in audit.values() for a in rows
               if key(a) not in chk or winner(chk[key(a)]) != winner(a)
               or Decimal(chk[key(a)][8]) != Decimal(a[8]) or Decimal(chk[key(a)][12]) != Decimal(a[12])]
        if bad:
            with open(CLEAN, "wb") as fh: fh.write(raw)
            refuse(f"post-write check failed on {len(bad)} row(s); gold restored")

    report = [f"# Week {week} — stat corrections applied to gold (robot)",
              f"Applied: {changes} score change(s) in {rows_changed} row(s) · winner flips: {flips}"]
    report += bullets
    report.append("👻 par changes: " + ("; ".join(ghost_notes) if ghost_notes else "none"))
    msg = "\n".join(report) + "\n"
    cf = os.path.join("_ops", "inbox", f"MAFFL_{YEAR}_Week{week:02d}_corrections.md")
    with open(cf, "w", encoding="utf-8", newline="\n") as fh: fh.write(msg)
    print(msg, end="")
    return 3 if flips else 0

if __name__ == "__main__":
    if len(sys.argv) < 2: raise SystemExit("Usage: python _ops/scripts/apply_corrections.py <week>")
    sys.exit(main(int(sys.argv[1])))
