/**
 * 🚀 Google Apps Script المطور لـ PRISM FLUX (نسخة القائمة المنسدلة والأنيميشن)
 * يدعم: الأرشفة اليومية، جلب قائمة الأيام المتاحة، وسجل التقارير
 */

const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

/**
 * 📝 معالجة طلبات POST (إرسال التقارير)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let masterSheet = spreadsheet.getSheetByName('الرئيسية');
    
    if (!masterSheet) {
      masterSheet = spreadsheet.insertSheet('الرئيسية', 0);
      const headers = ['التاريخ', 'اليوم', 'اسم الباحث', 'الزيارات المسندة', 'الزيارات المنفذة', 'التعذرات', 'المتبقية', 'المؤجلة', 'خارج النطاق', 'المشاكل التقنية', 'الملاحظات', 'وقت الإرسال'];
      masterSheet.appendRow(headers);
    }
    
    const row = [
      data.date || '',
      data.day || '',
      data.researcherName || '',
      data.assignedVisits || 0,
      data.completedVisits || 0,
      data.excuses || 0,
      data.remainingVisits || 0,
      data.postponedVisits || 0,
      data.outOfScope || 0,
      data.technicalIssues || 0,
      data.notes || '',
      new Date().toISOString()
    ];
    
    masterSheet.appendRow(row);
    return createJsonResponse({ status: 'success' });
  } catch (error) {
    return createJsonResponse({ status: 'error', error: error.toString() });
  }
}

/**
 * 📥 معالجة طلبات GET
 */
function doGet(e) {
  try {
    const type = e.parameter.type;
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. جلب قائمة الأيام المتاحة (للأرشيف)
    if (type === 'getArchiveDays') {
      const sheets = spreadsheet.getSheets();
      const archiveDays = sheets
        .map(s => s.getName())
        .filter(name => name.startsWith('Archive_'))
        .map(name => name.replace('Archive_', ''))
        .sort()
        .reverse(); // الأحدث أولاً
      return createJsonResponse({ status: 'success', days: archiveDays });
    }

    // 2. جلب التقارير (الحالية أو المؤرشفة)
    const date = e.parameter.date;
    let sheetName = 'الرئيسية';
    if (date && date !== 'today') {
      sheetName = 'Archive_' + date;
    }
    
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      return createJsonResponse({ status: 'success', reports: [], message: 'No data' });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ status: 'success', reports: [] });
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    const reports = data.map(row => ({
      researcherName: row[2],
      'اسم الباحث': row[2],
      assignedVisits: row[3],
      'الزيارات المسندة': row[3],
      completedVisits: row[4],
      'الزيارات المنفذة': row[4],
      postponedVisits: row[7],
      'المؤجلة': row[7],
      remainingVisits: row[6],
      'المتبقية': row[6],
      technicalIssues: row[9],
      'المشاكل التقنية': row[9]
    })).reverse();

    return createJsonResponse({ status: 'success', reports: reports });
  } catch (error) {
    return createJsonResponse({ status: 'error', error: error.toString() });
  }
}

/**
 * ⏰ وظيفة الأرشفة التلقائية (3 فجراً)
 */
function autoArchiveDaily() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const masterSheet = spreadsheet.getSheetByName('الرئيسية');
  if (!masterSheet || masterSheet.getLastRow() <= 1) return;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = Utilities.formatDate(yesterday, "GMT+3", "yyyy-MM-dd");
  
  const archiveName = 'Archive_' + dateStr;
  let archiveSheet = spreadsheet.getSheetByName(archiveName);
  
  if (!archiveSheet) {
    archiveSheet = spreadsheet.insertSheet(archiveName);
    const headers = masterSheet.getRange(1, 1, 1, 12).getValues();
    archiveSheet.getRange(1, 1, 1, 12).setValues(headers);
  }
  
  const lastRow = masterSheet.getLastRow();
  const dataRange = masterSheet.getRange(2, 1, lastRow - 1, 12);
  const data = dataRange.getValues();
  archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, data.length, 12).setValues(data);
  dataRange.clearContent();
}

function createTimeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'autoArchiveDaily') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('autoArchiveDaily').timeBased().atHour(3).everyDays(1).create();
}

function createJsonResponse(data) {
  const output = JSON.stringify(data);
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
