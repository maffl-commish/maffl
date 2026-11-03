#!/usr/bin/env python3
"""
apply_credit_ledger.py v0.1 -- credit sync robot, gold step.

Reads the app backend's credit ledger (pushed by logic.js to _ops/inbox/credit_ledger.json, or
credit_ledger_test.json in test mode) and brings gold into line with it:

  1. Appends every ledger row not yet in data/Credit_Log.csv (matched by its id, kept in Notes as
     "[app L-xxxxxxxx]"), just above the blank template rows. Approved?=Y (the commish approved it in the app).
  2. Recomputes "Current Credit Balance" in data/MAFFL_Owners_Sheet_revised.csv for every owner the
     log touches (sum of approved Credit_Log rows; the Pulse and validate Gate 4 read this column).

Then the workflow runs build\\gen-credits.ps1 -Write (credits.html balances + registry) and validate.ps1.
Owner names resolve only through data/MAFFL_Owner_Registry.csv aliases; an unknown name stops the run.
Never deletes or edits an existing Credit_Log row. Safe to re-run (idempotent).

  python3 _ops/scripts/apply_credit_ledger.py <ledger.json>           # write gold
  python3 _ops/scripts/apply_credit_ledger.py <ledger.json> --check   # report only
Exit: 0 = nothing to do, 10 = gold changed (or would change with --check), 1 = error.
"""
import csv, io, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LOG = os.path.join(ROOT, "data", "Credit_Log.csv")
SHEET = os.path.join(ROOT, "data", "MAFFL_Owners_Sheet_revised.csv")
REG = os.path.join(ROOT, "data", "MAFFL_Owner_Registry.csv")


def key(s):
    return re.sub(r"\s*/\s*", "/", re.sub(r"\s+", " ", str(s or ""))).strip().lower()


def registry():
    out = {}
    for r in csv.DictReader(open(REG, encoding="utf-8-sig")):
        for a in [r["canonical_name"]] + (r.get("aliases") or "").split("|"):
            if a.strip():
                out[key(a)] = r["canonical_name"]
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    if not args:
        print(__doc__); return 1
    ledger = json.load(open(args[0], encoding="utf-8"))
    rows = ledger.get("rows", ledger) if isinstance(ledger, dict) else ledger
    canon = registry()

    raw = open(LOG, encoding="utf-8", newline="").read()
    nl = "\r\n" if "\r\n" in raw else "\n"
    have = set(re.findall(r"\[app (L-[A-Z0-9]+)\]", raw))

    # Owners Sheet: canonical name -> team (for the Team column)
    sraw = open(SHEET, encoding="utf-8", newline="").read()
    snl = "\r\n" if "\r\n" in sraw else "\n"
    sheet = list(csv.reader(io.StringIO(sraw)))
    head = sheet[0]
    iO, iB, iT = head.index("Owners"), head.index("Current Credit Balance"), head.index("Current Team")
    team_of = {canon.get(key(r[iO]), r[iO]): r[iT] for r in sheet[1:] if r and r[iO].strip()}

    new_lines, added = [], []
    for e in rows:
        lid = str(e.get("id", ""))
        if not re.fullmatch(r"L-[A-Z0-9]+", lid):
            print(f"ERROR: bad ledger id {lid!r}"); return 1
        if lid in have:
            continue
        who = canon.get(key(e.get("owner")))
        if not who:
            print(f"ERROR: owner {e.get('owner')!r} is not in MAFFL_Owner_Registry.csv aliases (add it there, then re-run)"); return 1
        amt = int(e.get("amount"))
        if amt == 0 or abs(amt) > 100:
            print(f"ERROR: {lid} amount {amt} out of range"); return 1
        cat = e.get("category") or ("Spend" if amt < 0 else "Earn")
        if cat not in ("Spend", "Trade", "Earn"):
            print(f"ERROR: {lid} category {cat!r}"); return 1
        notes = (str(e.get("notes") or "").strip() + f" [app {lid}]").strip()
        buf = io.StringIO()
        csv.writer(buf, lineterminator="").writerow([str(e.get("season") or 2026), who, team_of.get(who, ""), cat,
                                                     str(e.get("type") or ""), str(amt), "Y", notes])
        new_lines.append(buf.getvalue()); added.append((lid, who, amt, e.get("type")))
        have.add(lid)

    # Insert above the first blank template row (Season empty), i.e. right after the real data.
    if new_lines:
        lines = raw.split(nl)
        rdr = csv.reader(io.StringIO(raw.replace(nl, "\n"))); last_end = 1
        for rec in rdr:
            if rdr.line_num == 1:
                continue
            if rec and rec[0].strip() == "":
                break
            last_end = rdr.line_num  # physical line where this record ends (multi-line quoted names count)
        lines[last_end:last_end] = new_lines
        raw2 = nl.join(lines)
    else:
        raw2 = raw

    # Balances from the (new) log: approved rows, sentinels are 0 anyway.
    bal = {}
    for r in csv.DictReader(io.StringIO(raw2)):
        if (r.get("Approved?") or "").strip() != "Y" or not (r.get("Season") or "").strip():
            continue
        who = canon.get(key(r["Owner"]))
        if not who:
            continue
        try:
            bal[who] = bal.get(who, 0) + int(float(r["Credit +/-"]))
        except ValueError:
            pass
    changed_bal = []
    for r in sheet[1:]:
        if not r or not r[iO].strip():
            continue
        who = canon.get(key(r[iO]), r[iO])
        if r[iB].strip() == "" and who not in {a[1] for a in added}:
            continue
        want = f"{float(bal.get(who, 0)):.1f}"
        if r[iB].strip() != want:
            changed_bal.append((who, r[iB], want)); r[iB] = want
    out = io.StringIO(); csv.writer(out, lineterminator=snl).writerows(sheet)
    sraw2 = out.getvalue()

    for a in added:
        print(f"ADD  {a[0]}  {a[1]}  {a[2]:+d}  {a[3]}")
    for b in changed_bal:
        print(f"BAL  {b[0]}: {b[1] or '—'} -> {b[2]}")
    if not added and not changed_bal:
        print("Credit ledger: gold already in sync."); return 0
    if not check:
        open(LOG, "w", encoding="utf-8", newline="").write(raw2)
        open(SHEET, "w", encoding="utf-8", newline="").write(sraw2)
        print(f"Wrote {len(added)} Credit_Log row(s), {len(changed_bal)} balance(s).")
    else:
        print("--check: nothing written.")
    return 10


if __name__ == "__main__":
    sys.exit(main())
