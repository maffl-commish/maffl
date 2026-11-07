# _ops/tests — check the app and its backend without the real Google Sheet or ESPN

Cloud sessions can't reach the Apps Script backend or ESPN, so these run the **real** backend code locally against
stand-ins. Use them before every push that touches `lab/` or `_ops/apps-script/`.

| File | What it does |
|---|---|
| `mock.js` | A stand-in backend. Runs the real `logic.js` (+ its `mod_*.js` parts + `daily.js`) with in-memory Google services (Sheet, cache, properties, mail) and a fake ESPN built from repo data: 2026 teams, rosters from the draft CSV, Weeks 1–8 real scores, Week 9 live. Seeds owners, chat, offers, trade block, perks, desk. `node mock.js 8765` serves it on a port; `require("./mock.js").create()` uses it in-process. |
| `regress.js` | Calls every backend action once and prints normalized results. Compare with `regress_expected.txt`. |
| `regress_expected.txt` | The expected output. Refresh it (in the same commit) only when a behavior change is intended. |
| `shoot.py` | Phone screenshots (390×844 @2x, iPhone) of `lab/index.html` against the mock, signed in as Mike (commish). Prints JS errors. |

```
node _ops/tests/regress.js > /tmp/out.txt 2>/dev/null && diff _ops/tests/regress_expected.txt /tmp/out.txt && echo "backend OK"
python3 _ops/tests/shoot.py home --tab home            # → /tmp/maffl-shots/home.png
python3 _ops/tests/shoot.py trades --tab team --js 'click("#tseg [data-sub=trades]")'
python3 _ops/tests/shoot.py tour --tab team --tour     # let the first-time tour run
```

Lessons (keep them): test taps by position as well as by code (`document.elementFromPoint`): a hidden layer once ate
every tap while code-level `.click()` tests passed. `--js` with a `;` runs as a function body, so `return` your promise.
