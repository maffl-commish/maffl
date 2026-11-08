/** @OnlyCurrentDoc */
/**
 * MAFFL HQ App — backend LOADER (Google Apps Script, bound to the "MAFFL HQ App" Sheet).
 *
 * Changes rarely (last: 2026-11-07, last-good fallback). After pasting a new copy: Deploy → Manage deployments → ✏️ → New version.
 * Otherwise it never needs to change. It fetches the real logic from the repo
 * (_ops/apps-script/logic.js on main), caches it for 5 minutes, and runs it. Claude ships
 * backend changes by pushing logic.js; nobody re-pastes or redeploys.
 *
 * Deployed once as: Deploy → Web app · Execute as: Me · Who has access: Anyone.
 * Updating THIS file (rare): paste, save, Deploy → Manage deployments → ✏️ → New version.
 *
 * Safety: @OnlyCurrentDoc limits Sheet access to this one spreadsheet. The logic can only use
 * the services referenced below (this Sheet, email to/from you, cache, lock, web fetch).
 * Only the commissioner's GitHub account (and Claude sessions he starts) can push to main.
 */
var LOGIC_URL = "https://raw.githubusercontent.com/maffl-commish/maffl/main/_ops/apps-script/logic.js";

function logic_(fresh) {
  // Fresh copy every 5 minutes; a 6-hour last-good copy covers a GitHub hiccup or a push that won't compile.
  var cache = CacheService.getScriptCache(), src = fresh ? null : cache.get("logic"), M, res = null, got = false;
  if (!src) {
    try { res = UrlFetchApp.fetch(LOGIC_URL + "?t=" + Date.now(), { muteHttpExceptions: true }); } catch (e) {}
    if (res && res.getResponseCode() === 200) { src = res.getContentText(); got = true; }
  }
  if (src) {
    try { M = {}; (new Function("M", src))(M); if (!M.doPost) throw new Error("no doPost");
      if (got && src.length < 95000) { cache.put("logic", src, 300); cache.put("logic_last", src, 21600); } return M; }
    catch (e) { cache.remove("logic"); }
  }
  var last = cache.get("logic_last");
  if (!last) throw new Error("Couldn't load logic.js" + (res ? " (" + res.getResponseCode() + ")" : ""));
  M = {}; (new Function("M", last))(M); return M;
}

function doGet(e) { return logic_().doGet(e); }
function doPost(e) { return logic_().doPost(e); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu("MAFFL")
    .addItem("Set / reset a passphrase", "menuSetPin")
    .addItem("Mark request done (select its row first)", "menuRequestDone")
    .addItem("Unlock an owner", "menuUnlock")
    .addSeparator()
    .addItem("Load latest logic now", "menuReload")
    .addToUi();
}
function menuSetPin() { logic_().menuSetPin(); }
function menuRequestDone() { logic_().menuRequestDone(); }
function menuUnlock() { logic_().menuUnlock(); }
// The 15-minute robot (reminders, ESPN trade check, nightly credit check). Run by a time trigger:
// Apps Script → Triggers (⏰) → Add Trigger → tick · Head · Time-driven · Minutes timer · Every 15 minutes.
function tick() { logic_().tick(); }
function menuReload() {
  CacheService.getScriptCache().remove("logic");
  SpreadsheetApp.getUi().alert("Loaded logic v" + logic_(true).VERSION + " from the repo.");
}

// Never called. Listing the services here lets Google ask for these permissions once,
// because code loaded at runtime can't be scanned for them.
function scopes_() {
  SpreadsheetApp.getActive(); MailApp.sendEmail("", "", ""); Session.getEffectiveUser().getEmail();
  CacheService.getScriptCache(); LockService.getScriptLock(); UrlFetchApp.fetch("");
  ContentService.createTextOutput(""); Utilities.getUuid();
}
