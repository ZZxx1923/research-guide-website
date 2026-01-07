/**
 * الدليل الإرشادي للباحثين - Google Apps Script (Final Version V4)
 * يدعم: حفظ التقارير، جلب البيانات، ونظام عداد المتصلين الحقيقي (آخر 5 دقائق)
 */

const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. معالجة نبضة النشاط (Ping) لعداد المتصلين
    if (data.action === 'ping') {
      return handlePing(ss, data);
    }
    
    // 2. معالجة حفظ التقرير
    return handleSaveReport(ss, data);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = e.parameter.action;
    
    // 1. جلب عدد المتصلين الحقيقي
    if (action === 'getOnlineCount') {
      const count = getActiveUsersCount(ss);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: count }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. جلب التقارير (الوضع الافتراضي)
    const todayStr = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
    const masterSheet = ss.getSheetByName('الرئيسية');
    
    if (!masterSheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', reports: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = masterSheet.getDataRange().getValues();
    const headers = values[0];
    const reports = [];
    
    const fieldMap = {
      'التاريخ': 'date',
      'اليوم': 'day',
      'اسم الباحث': 'researcherName',
      'الزيارات المسندة': 'assignedVisits',
      'الزيارات المنفذة': 'completedVisits',
      'النسبة المئوية': 'completionRate',
      'المشاكل التقنية': 'technicalIssues',
      'الزيارات المؤجلة': 'postponedVisits',
      'المتبقي بالسلة': 'remainingVisits',
      'الأعذار': 'excuses',
      'خارج النطاق': 'outOfScope',
      'الحالة': 'status',
      'الملاحظات': 'notes',
      'الوقت': 'time'
    };
    
    for (let i = 1; i < values.length; i++) {
      let report = {};
      for (let j = 0; j < headers.length; j++) {
        let fieldName = fieldMap[headers[j]] || headers[j];
        report[fieldName] = values[i][j];
      }
      
      let reportDate = "";
      if (values[i][0] instanceof Date) {
        reportDate = Utilities.formatDate(values[i][0], "GMT+3", "yyyy-MM-dd");
      } else {
        reportDate = values[i][0].toString();
      }
      
      if (reportDate === todayStr) {
        reports.push(report);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', reports: reports.reverse(), serverDate: todayStr }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- وظائف مساعدة ---

function handlePing(ss, data) {
  let pingSheet = ss.getSheetByName('ActiveUsers');
  if (!pingSheet) {
    pingSheet = ss.insertSheet('ActiveUsers');
    pingSheet.appendRow(['UserID', 'LastSeen']);
  }
  
  const userId = data.userId;
  const now = new Date();
  const values = pingSheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      pingSheet.getRange(i + 1, 2).setValue(now);
      found = true;
      break;
    }
  }
  
  if (!found) {
    pingSheet.appendRow([userId, now]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getActiveUsersCount(ss) {
  const pingSheet = ss.getSheetByName('ActiveUsers');
  if (!pingSheet) return 1;
  
  const values = pingSheet.getDataRange().getValues();
  const now = new Date().getTime();
  const fiveMinutes = 5 * 60 * 1000;
  let activeCount = 0;
  
  for (let i = 1; i < values.length; i++) {
    const lastSeen = new Date(values[i][1]).getTime();
    if (now - lastSeen < fiveMinutes) {
      activeCount++;
    }
  }
  
  return activeCount || 1;
}

function handleSaveReport(ss, data) {
  const now = new Date();
  const dateString = Utilities.formatDate(now, "GMT+3", "yyyy-MM-dd");
  const timeString = Utilities.formatDate(now, "GMT+3", "HH:mm:ss");
  
  // 1. الورقة اليومية
  const dailySheetName = 'التقارير_' + dateString;
  let dailySheet = ss.getSheetByName(dailySheetName);
  if (!dailySheet) {
    dailySheet = ss.insertSheet(dailySheetName);
    const headers = ['التاريخ', 'اليوم', 'اسم الباحث', 'الزيارات المسندة', 'الزيارات المنفذة', 'الأعذار', 'المتبقي بالسلة', 'الزيارات المؤجلة', 'المشاكل التقنية', 'خارج النطاق', 'الملاحظات', 'الوقت'];
    dailySheet.appendRow(headers);
    dailySheet.getRange(1, 1, 1, headers.length).setBackground('#00d4ff').setFontWeight('bold');
  }
  
  dailySheet.appendRow([
    dateString, data.day, data.researcherName, data.assignedVisits, data.completedVisits,
    data.excuses, data.remainingVisits, data.postponedVisits, data.technicalIssues,
    data.outOfScope, data.notes, timeString
  ]);
  
  // 2. الورقة الرئيسية
  let masterSheet = ss.getSheetByName('الرئيسية');
  if (!masterSheet) {
    masterSheet = ss.insertSheet('الرئيسية', 0);
    const masterHeaders = ['التاريخ', 'اليوم', 'اسم الباحث', 'الزيارات المسندة', 'الزيارات المنفذة', 'النسبة المئوية', 'المشاكل التقنية', 'الزيارات المؤجلة', 'المتبقي بالسلة', 'الأعذار', 'خارج النطاق', 'الحالة', 'الملاحظات', 'الوقت'];
    masterSheet.appendRow(masterHeaders);
    masterSheet.getRange(1, 1, 1, masterHeaders.length).setBackground('#7c3aed').setFontColor('#ffffff').setFontWeight('bold');
  }
  
  const assigned = parseInt(data.assignedVisits) || 1;
  const completed = parseInt(data.completedVisits) || 0;
  const rate = ((completed / assigned) * 100).toFixed(1);
  
  masterSheet.appendRow([
    dateString, data.day, data.researcherName, assigned, completed, rate + '%',
    data.technicalIssues, data.postponedVisits, data.remainingVisits, data.excuses,
    data.outOfScope, 'مرسل', data.notes, timeString
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
