/**
 * SOFT Events & Classes back end (Google Apps Script, attached to a Google Sheet).
 *
 * The Sheet needs a tab called "Events" with these headings in row 1:
 *   type | title | date | time | place | price | details | status | visible
 * Sign-ups are saved to a tab called "Signups" (created automatically).
 * See backend/SETUP.md for the steps.
 */
var EVENTS_TAB = 'Events';
var SIGNUPS_TAB = 'Signups';

/** The website asks for the list of upcoming events. Only the Events tab is shared, never the sign-ups. */
function doGet() {
  var sh = SpreadsheetApp.getActive().getSheetByName(EVENTS_TAB);
  var out = [];
  if (sh && sh.getLastRow() > 1) {
    var rows = sh.getDataRange().getValues();
    var head = rows.shift().map(function (h) { return String(h).trim().toLowerCase(); });
    var tz = Session.getScriptTimeZone();
    rows.forEach(function (r) {
      var o = {};
      head.forEach(function (h, i) {
        var v = r[i];
        if (v instanceof Date) v = (h === 'time') ? Utilities.formatDate(v, tz, 'h:mm a') : Utilities.formatDate(v, tz, 'yyyy-MM-dd');
        o[h] = String(v == null ? '' : v).trim();
      });
      if (!o.title) return;
      if ((o.visible || '').toLowerCase() === 'no') return;
      out.push({ type: o.type, title: o.title, date: o.date, time: o.time, place: o.place, price: o.price, details: o.details, status: o.status });
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ events: out })).setMimeType(ContentService.MimeType.JSON);
}

/** The website sends a sign-up. It is added as a new row in the Signups tab. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ContentService.createTextOutput('ok');          // hidden trap field: real people leave it empty
  var name = clean(p.name, 120), phone = clean(p.phone, 40), email = clean(p.email, 120);
  if (!name || (!phone && !email)) return ContentService.createTextOutput('missing');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(SIGNUPS_TAB);
    if (!sh) { sh = ss.insertSheet(SIGNUPS_TAB); sh.appendRow(['Time', 'Name', 'Phone / WhatsApp', 'Email', 'Interested in', 'Message']); sh.setFrozenRows(1); }
    sh.appendRow([new Date(), name, phone, email, clean(p.interest, 160), clean(p.message, 600)]);
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput('ok');
}

/** Stops a spreadsheet from running a typed-in "=formula" and keeps each answer a sensible length. */
function clean(v, max) {
  v = String(v == null ? '' : v).trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
