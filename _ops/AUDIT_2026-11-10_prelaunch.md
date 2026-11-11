# REEL pre-launch review (2026-11-10) — findings, fixes, and the commish's action list

Reviewed against `main` at `d133407` (backend v0.64). Fixes shipped the same night as backend **v0.65 → v0.68**.
Earlier audit: `AUDIT_2026-11-07_reel_readiness.md` (its fixes were re-checked; the gaps found are B2, B4, B5 below).

## Verdict

**Ready with fixes → the code fixes are in.** What's left is in "Your action list" (about 30 minutes of clicks, plus
reissuing passphrases). Load is not the problem: 21 owners fit inside the Apps Script quotas.

## Findings and status

| ID | Sev | Finding | Status |
|---|---|---|---|
| B1 | Critical | Reaction emoji written into chat HTML unescaped (`lab/index.html` msgHTML): stored XSS, could steal device tokens | ✅ Fixed (app `esc()`; backend refuses `<`/`>` in reactions) |
| B2 | Critical | Chat `reply_to`, Feedback `kind`, TapLog fields skipped the formula guard: `=Owners!D2` read any tab | ✅ Fixed v0.65 (`cells_()` on every row; `reply_to` must be a message id) |
| B3 | High | Seed tools (Tag as staged / Wipe) had no server guard and Wipe cleared before rewriting | ✅ Fixed v0.66 (refused when `CREDIT_SYNC=live`, hidden at go-live, write-then-clear) |
| B4 | High | A part with a syntax error was cached as "last good" and took sign-in down | ✅ Fixed v0.66 (compile check before caching; last good copy + email). Probed on the mock |
| B5 | High | Regression gate failed on a clean `main` (live data drifted), no CI | ✅ Fixed (frozen fixture, `backend-check.yml`, desk notice on red) |
| B6 | High | Old two-word passphrases (6,969 combos) still verify | ✅ Code ready: `LEGACY_PINS` switch + desk list. **You:** reissue, then flip (action list) |
| B7 | High | Pulse robot (Claude + Bash) could commit `_ops/apps-script/` and auto-merge = deploy | ✅ Fixed (allowlist `weekly.html`, `_ops/inbox/`; else revert, no merge, desk card) |
| F1 | High | Approve wrote status before the ledger mode; a half-write never reached the ledger | ✅ Fixed v0.67 (mode first; nightly check flags mode-less rows) |
| F2 | High | One script lock serialized reads too | ✅ Fixed v0.67 (login, board, settings, desk, react lock-free) |
| F3 | High | Alerts only on the desk; non-beta app errors never left the phone | ✅ Fixed v0.67 (alert emails, max 5 per 6 h; 🐞 desk notes from every phone) |
| F4 | High | 📣 alerts could exhaust the 100/day mail quota silently | ✅ Fixed v0.67 (quota on the desk; owner mail stops at 10 left; alerts skip email below 35) |
| F5 | High | 21 owners' emails public in `rules.html` and `data/MAFFL_Owners_Sheet_revised.csv` | ⏸ **Your decision** (action list #7) |
| F6 | High | 60 anonymous wrong guesses paused every new sign-in | ✅ Fixed v0.67 (app falls back to name + passphrase, 3 tries/hour/owner) |
| F7 | High | A mis-tapped Approve couldn't be undone | ✅ Fixed v0.67 (↩️ Reverse: offsetting ledger rows `L-…R`, net zero) |
| F8 | High | App scrapes 6 data blocks from classic pages with no contract | ✅ Fixed (`_ops/tests/contract.js` in CI, Pulse robot, credit sync) |
| — | Obs. | No way to know from the phone that the backend is down | ✅ `?action=health` (public, no private data). **You:** add the uptime monitor (#4) |
| L | Later | Made-up group DMs; announce pinned "last row"; `maffl_lab_api` override; update check inside the main script; TICK_SENT 60-day memory | ✅ Fixed v0.68 |
| L | Later | Tail-read Chat/Events; 2027 season constants; device-token expiry; `live` branch for the loader; seed code out of `mod_desk.js` | Deferred: not needed for this season's launch (see below) |

## Your action list

Do 1–6 this week, before the beta crew starts. 7 is a decision. 8–10 are go-live day.

1. **Confirm the `tick` trigger.** Apps Script editor → ⏰ Triggers. You should see `tick` · Time-driven · every 15 minutes.
   If it's missing: Add Trigger → `tick` → Head → Time-driven → Minutes timer → Every 15 minutes.
2. **Check `DESK_KEY` is long.** Apps Script → ⚙️ Project settings → Script properties → `DESK_KEY`. It should be 32+
   random characters. If it's short, make a new one and paste the same value into GitHub → Settings → Secrets → Actions → `DESK_KEY`.
3. **Check the `GITHUB_TOKEN` scope and expiry.** GitHub → your avatar → Settings → Developer settings → Fine-grained tokens.
   It should be: only repository `maffl-commish/maffl`, only **Contents: Read and write** (no Workflows, no Administration).
   Note the expiry date in your calendar; rotate a week before.
4. **Add an uptime monitor** (free; this is your "is it broken?" alarm). UptimeRobot (or Better Stack) → New monitor →
   type **Keyword** → URL = the app's `API_URL` + `?action=health` → keyword `"healthy":true` → alert when the keyword is
   **missing** → every 5 minutes → alert contact: the UptimeRobot phone app (push) or SMS.
5. **Name a Sheet version before anything else.** MAFFL HQ App Sheet → File → Version history → Name current version →
   "pre-launch 11/10". Do it again right before you Wipe seed and before go-live. That's your data rollback.
6. **Reissue passphrases.** App → 📥 desk → 🔑 Owner access shows "⚠️ N on an old passphrase". Tap **New passphrase** for each
   (beta crew first) and text it. When the count is 0, ask Claude: "REEL: set LEGACY_PINS to false".
7. **Decide F5 (emails in the public repo).** Options: (a) keep as is (they're league-mates and the classic Rules page has
   always had them); (b) remove the copy-email buttons from `rules.html` (owners get contacts in the app now, signed in);
   (c) also drop the Email column from the gold Owners CSV (needs a `build\` check run). Git history keeps old copies either way.
   Recommended: (b) now, (c) in the off-season.
8. **Go-live flips** (one prompt to Claude): `CREDIT_SYNC=live` (Script property, you), `OWNER_EMAILS = "live"`,
   `LEGACY_PINS = false`, `STAGE = "live"`. Seed tools disappear by themselves once credits are LIVE.
9. **Launch night:** keep Apps Script → Executions open on a laptop for the first hour; the desk and email cover the rest.
   Unverified: whether the Sheet's **MAFFL** menu shows in the Sheets phone app (probably not; use a browser).
10. **Clean-up:** delete the merged branches `fix/chat-reaction-xss` and `fix/backend-input-guards` (GitHub → Branches; the
    chat session's GitHub access couldn't delete them).

## Deferred (and why)

- **Tail-reads of Chat / Events:** at 21 owners the full reads stay well under a second this season. Revisit if desk
  "Updated" times or chat feel slow, or in the off-season with an archive tab.
- **2027 constants** (`TRADE_DEADLINE`, `INSURANCE_CLOSES`, `perkDeadline_`, `SEASON`, ledger `season: 2026`): an off-season job.
- **Device tokens never expire:** a new passphrase is the revoke. Add an expiry in the off-season.
- **A `live` branch for the loader** (CI fast-forwards it after `backend-check` passes; rollback = move the branch): the real
  gate for "push = deploy". Needs `Code.gs` re-pasted (you) — the top maintainability step after launch.
- **Seed code** (~10 KB of `mod_desk.js`): move to a lazy module or delete after the beta.
- Approve / negate still hold the script lock during the 2–3 s GitHub ledger push. Fine at this size.

## Load (launch night, 21 owners)

Polls: inbox 30 s, open thread 8 s, live 60 s → about 2 requests a second at peak, 5–10 running at once (limit 30).
Properties reads now ≈ 0 per poll (pepper cached; one read per request otherwise; limit 50,000/day). UrlFetch a few
thousand a day (limit 20,000). Triggers ≈ 20–25 min/day (limit 90). Email: see F4 (limit 100 recipients/day).
First thing to strain: the script lock during a chat burst + an approval; F2 took most reads off it.
