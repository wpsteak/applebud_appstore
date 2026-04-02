// ============================================================
// utils.gs — 共用工具函式
// ============================================================

var SPREADSHEET_ID = '1drF7WEFBs7oxCGMOw2pCAEfGZRO5Utx7E35DkSFu84A';

// ---------- 回應格式 ----------

function ok(data) {
  return HtmlService
    .createHtmlOutput(JSON.stringify({ success: true, data: data, error: null }))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function fail(code, message) {
  return HtmlService
    .createHtmlOutput(JSON.stringify({ success: false, data: null, error: { code: code, message: message } }))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------- 時間 ----------

function nowISO() {
  var d = new Date();
  var offset = '+08:00';
  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
  return d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth() + 1) + '-' +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours() + 8) + ':' +
    pad(d.getUTCMinutes()) + ':' +
    pad(d.getUTCSeconds()) + offset;
}

// ---------- ID 產生 ----------

function generatePostId() {
  var d = new Date();
  var dateStr = d.getUTCFullYear().toString() +
    ('0' + (d.getUTCMonth() + 1)).slice(-2) +
    ('0' + d.getUTCDate()).slice(-2);
  var rand = Math.random().toString(36).slice(2, 7);
  return 'post_' + dateStr + '_' + rand;
}
