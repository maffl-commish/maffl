# ============================================================
# MAFFL ingest: append one ESPN-pulled week to the gold CSVs (CE-1, gold part only)
# VERSION: 0.1.1 (2026-09-29): UTF-8 console output for Windows runners
#
# Usage (repo root):  python _ops/scripts/ingest_week.py 4
# Reads  _ops/inbox/MAFFL_2026_WeekNN_espn.md (must end STATUS: READY TO INGEST)
# Appends OUTPUT 1 rows -> data/MAFFL_Matchups_Clean.csv
#         OUTPUT 2a rows -> data/MAFFL_Top_Performers_2026.csv
# Keeps each file's line endings (CRLF today) and trailing newline. Refuses if the week is
# already there. Derived files are NOT touched here: run build\generate-matchups-data.ps1 next.
# Exit 0 = appended; 2 = refused (nothing written).
# ============================================================
import os, re, sys
from decimal import Decimal

# Windows runners print with a legacy code page that can't show 👻 or →; force UTF-8 output.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

YEAR = 2026

def refuse(msg):
    print("REFUSED: " + msg); sys.exit(2)

def blocks_after(text, heading):
    """Fenced ``` blocks that follow a heading, up to the next '## ' heading."""
    i = text.find(heading)
    if i < 0: return []
    j = text.find("\n## ", i + len(heading))
    section = text[i: j if j > 0 else len(text)]
    return re.findall(r"```\n(.*?)\n```", section, re.S)

def append_rows(path, rows):
    raw = open(path, "rb").read()
    nl = b"\r\n" if b"\r\n" in raw else b"\n"
    if raw and not raw.endswith(nl):
        raw += nl
    add = nl.join(r.encode("utf-8") for r in rows) + nl
    with open(path, "wb") as fh:
        fh.write(raw + add)
    return "CRLF" if nl == b"\r\n" else "LF"

def main(week):
    rep = os.path.join("_ops", "inbox", f"MAFFL_{YEAR}_Week{week:02d}_espn.md")
    if not os.path.exists(rep): refuse(f"{rep} not found")
    text = open(rep, encoding="utf-8").read()
    last = [l for l in text.strip().splitlines() if l.strip()][-1]
    if last.strip() != "STATUS: READY TO INGEST": refuse(f"report status is '{last.strip()}'")

    b1 = blocks_after(text, "## OUTPUT 1")
    rows = [l for l in (b1[0].splitlines() if b1 else []) if l.strip()]
    if len(rows) != 11 or not all(r.startswith(f"{YEAR},{week},") and r.count(",") == 12 for r in rows):
        refuse(f"expected 11 matchup rows for week {week}, got {len(rows)}")

    b2 = blocks_after(text, "### 2a")
    t3 = [l for l in (b2[0].splitlines() if b2 else []) if l.strip() and not l.startswith("Year,")]
    if not all(r.startswith(f"{YEAR},{week},") and r.count(",") == 8 for r in t3):
        refuse("top-performer rows are malformed")

    clean = os.path.join("data", "MAFFL_Matchups_Clean.csv")
    top = os.path.join("data", "MAFFL_Top_Performers_2026.csv")
    if any(l.startswith(f"{YEAR},{week},") for l in open(clean, encoding="utf-8-sig")):
        refuse(f"week {week} is already in {clean}")
    if os.path.exists(top) and any(l.startswith(f"{YEAR},{week},") for l in open(top, encoding="utf-8-sig")):
        refuse(f"week {week} is already in {top}")

    m = re.search(r"score_sum ([0-9.]+)", text)
    s = sum(Decimal(r.split(",")[8]) + Decimal(r.split(",")[12]) for r in rows)
    if m and Decimal(m.group(1)) != s:
        refuse(f"score sum {s} doesn't match the report's CHECKSUM {m.group(1)}")

    e1 = append_rows(clean, rows)
    e2 = append_rows(top, t3) if t3 else "skipped"
    corr = re.search(r"Stat corrections vs gold: (\S+)", text)
    print(f"Appended week {week}: {len(rows)} matchup rows ({e1}) · {len(t3)} top-performer rows ({e2}) · score_sum {s}")
    print(f"Stat corrections reported for earlier weeks: {corr.group(1) if corr else 'unknown'}"
          + ("  → NOT applied automatically (CE-1a needs the commissioner)" if corr and corr.group(1) != "none" else ""))

if __name__ == "__main__":
    if len(sys.argv) < 2: raise SystemExit("Usage: python _ops/scripts/ingest_week.py <week>")
    main(int(sys.argv[1]))
