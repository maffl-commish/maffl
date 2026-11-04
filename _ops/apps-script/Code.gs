/** @OnlyCurrentDoc */
/**
 * MAFFL HQ App — backend LOADER (Google Apps Script, bound to the "MAFFL HQ App" Sheet).
 *
 * This file should never need to change again. It fetches the real logic from the repo
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
  var cache = CacheService.getScriptCache(), src = fresh ? null : cache.get("logic");
  if (!src) {
    var res = UrlFetchApp.fetch(LOGIC_URL + "?t=" + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error("Couldn't load logic.js (" + res.getResponseCode() + ")");
    src = res.getContentText();
    if (src.length < 95000) cache.put("logic", src, 300);
  }
  var M = {};
  (new Function("M", src))(M);
  return M;
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
