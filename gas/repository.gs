// ============================================================
// repository.gs — Google Sheets 讀寫
// ============================================================

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

// ---------- 通用：把 sheet 資料轉成物件陣列 ----------

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// ---------- Config ----------

function getConfig() {
  var rows = sheetToObjects(getSheet('config'));
  var cfg = {};
  rows.forEach(function(r) { cfg[r.key] = r.value; });
  return cfg;
}

// ---------- Categories ----------

function getAllCategories() {
  return sheetToObjects(getSheet('categories'))
    .filter(function(r) { return r.is_active === true || r.is_active === 'TRUE'; })
    .sort(function(a, b) { return Number(a.sort_order) - Number(b.sort_order); });
}

function categoryKeyExists(key) {
  return getAllCategories().some(function(c) { return c.key === key; });
}

// ---------- Posts：讀 ----------

function getAllPostRows() {
  return sheetToObjects(getSheet('posts'));
}

function getPostById(id) {
  return getAllPostRows().find(function(r) { return r.id === id; }) || null;
}

// ---------- Posts：找到列號（1-based，含標題列）----------

function findPostRowIndex(id) {
  var sheet = getSheet('posts');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i + 1; // 1-based
  }
  return -1;
}

function getPostsHeaders() {
  var sheet = getSheet('posts');
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

// ---------- Posts：新增 ----------

function insertPost(row) {
  var sheet = getSheet('posts');
  var headers = getPostsHeaders();
  var values = headers.map(function(h) { return row[h] !== undefined ? row[h] : ''; });
  sheet.appendRow(values);
}

// ---------- Posts：更新單欄或多欄 ----------

function updatePostFields(id, fields) {
  var sheet = getSheet('posts');
  var headers = getPostsHeaders();
  var rowIndex = findPostRowIndex(id);
  if (rowIndex === -1) return false;

  Object.keys(fields).forEach(function(key) {
    var col = headers.indexOf(key) + 1;
    if (col > 0) sheet.getRange(rowIndex, col).setValue(fields[key]);
  });
  return true;
}

// ---------- Posts：刪除 ----------

function deletePostRow(id) {
  var sheet = getSheet('posts');
  var rowIndex = findPostRowIndex(id);
  if (rowIndex === -1) return false;
  sheet.deleteRow(rowIndex);
  return true;
}
