// 📊 Google Apps Script لربط الموقع بـ Google Sheets
// معرّف الجدول
const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

// 📝 دالة لمعالجة طلبات POST
function doPost(e) {
  try {
    // الحصول على البيانات من الطلب
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      // إذا كانت البيانات نصية عادية
      data = JSON.parse(e.postData.contents);
    }
    
    console.log('📥 تم استقبال البيانات:', data);
    
    // الحصول على الجدول
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // الحصول على التاريخ الحالي
    const today = new Date();
    const dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const sheetName = 'التقارير_' + dateString;
    
    // إنشاء ورقة جديدة إذا لم تكن موجودة
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      
      // إضافة رؤوس الأعمدة
      const headers = [
        'التاريخ',
        'اليوم',
        'اسم الباحث',
        'الزيارات المسندة',
        'الزيارات المنفذة',
        'التعذرات',
        'المتبقية',
        'المؤجلة',
        'المشاكل التقنية',
        'خارج النطاق',
        'الملاحظات',
        'الوقت'
      ];
      
      sheet.appendRow(headers);
      
      // تنسيق رؤوس الأعمدة
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00d4ff');
      headerRange.setFontColor('#000000');
      headerRange.setFontWeight('bold');
      
      console.log('✅ تم إنشاء ورقة جديدة: ' + sheetName);
    }
    
    // إضافة البيانات الجديدة
    const row = [
      data.date || '',
      data.day || '',
      data.researcherName || '',
      data.assignedVisits || '',
      data.completedVisits || '',
      data.excuses || '',
      data.remainingVisits || '',
      data.postponedVisits || '',
      data.technicalIssues || '',
      data.outOfScope || '',
      data.notes || '',
      new Date().toLocaleTimeString('ar-SA')
    ];
    
    sheet.appendRow(row);
    console.log('✅ تم إضافة البيانات إلى الورقة');
    
    // إضافة البيانات إلى ورقة "الرئيسية" أيضاً
    let masterSheet = spreadsheet.getSheetByName('الرئيسية');
    if (!masterSheet) {
      masterSheet = spreadsheet.insertSheet('الرئيسية', 0);
      
      // إضافة رؤوس الأعمدة
      const masterHeaders = [
        'التاريخ',
        'اليوم',
        'اسم الباحث',
        'الزيارات المسندة',
        'الزيارات المنفذة',
        'النسبة المئوية',
        'المشاكل التقنية',
        'الحالة',
        'الملاحظات',
        'الوقت'
      ];
      
      masterSheet.appendRow(masterHeaders);
      
      // تنسيق رؤوس الأعمدة
      const masterHeaderRange = masterSheet.getRange(1, 1, 1, masterHeaders.length);
      masterHeaderRange.setBackground('#7c3aed');
      masterHeaderRange.setFontColor('#ffffff');
      masterHeaderRange.setFontWeight('bold');
      
      console.log('✅ تم إنشاء ورقة الرئيسية');
    }
    
    // حساب النسبة المئوية
    const assigned = parseInt(data.assignedVisits) || 1;
    const completed = parseInt(data.completedVisits) || 0;
    const completionRate = (completed / assigned * 100).toFixed(1);
    
    // تحديد الحالة
    let status = 'عادي';
    let statusColor = '#ffff00'; // أصفر
    
    if (parseInt(data.technicalIssues) > 0) {
      status = 'مشكلة ❌';
      statusColor = '#ff0000'; // أحمر
    } else if (completionRate >= 90) {
      status = 'محقق ✅';
      statusColor = '#00ff00'; // أخضر
    }
    
    // إضافة البيانات إلى الورقة الرئيسية
    const masterRow = [
      data.date || '',
      data.day || '',
      data.researcherName || '',
      data.assignedVisits || '',
      data.completedVisits || '',
      completionRate + '%',
      data.technicalIssues || '',
      status,
      data.notes || '',
      new Date().toLocaleTimeString('ar-SA')
    ];
    
    masterSheet.appendRow(masterRow);
    
    // تلوين صفوف الحالة
    const lastRow = masterSheet.getLastRow();
    masterSheet.getRange(lastRow, 8).setBackground(statusColor);
    
    console.log('✅ تم إضافة البيانات إلى الورقة الرئيسية');
    
    // إضافة إشعار جديد
    let notificationsSheet = spreadsheet.getSheetByName('الإشعارات');
    if (!notificationsSheet) {
      notificationsSheet = spreadsheet.insertSheet('الإشعارات');
      notificationsSheet.appendRow(['الوقت', 'اسم الباحث', 'الرسالة']);
    }
    notificationsSheet.appendRow([
      new Date().toISOString(),
      data.researcherName || 'باحث',
      `أتم الباحث (${data.researcherName}) تقريره اليومي وارسله بنجاح! ✨`
    ]);

    // إرجاع استجابة النجاح
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'تم حفظ التقرير بنجاح',
      sheetName: sheetName,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ خطأ:', error.toString());
    
    // إرجاع استجابة الخطأ
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 📥 دالة للحصول على البيانات (التقارير أو الإشعارات)
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // إذا كان الطلب للحصول على الإشعارات
    if (e.parameter.type === 'notifications') {
      const notificationsSheet = spreadsheet.getSheetByName('الإشعارات');
      if (!notificationsSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, notifications: [] })).setMimeType(ContentService.MimeType.JSON);
      }
      const lastRow = notificationsSheet.getLastRow();
      if (lastRow <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, notifications: [] })).setMimeType(ContentService.MimeType.JSON);
      }
      const data = notificationsSheet.getRange(lastRow, 1, 1, 3).getValues()[0];
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        notifications: [{
          timestamp: data[0],
          researcherName: data[1],
          message: data[2]
        }]
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const masterSheet = spreadsheet.getSheetByName('الرئيسية');
    
    if (!masterSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'لم يتم العثور على ورقة البيانات'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // الحصول على جميع البيانات
    const data = masterSheet.getDataRange().getValues();
    
    // تحويل البيانات إلى JSON
    const headers = data[0];
    const reports = [];
    
    for (let i = 1; i < data.length; i++) {
      const report = {};
      for (let j = 0; j < headers.length; j++) {
        report[headers[j]] = data[i][j];
      }
      reports.push(report);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      reports: reports,
      count: reports.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 🔄 دالة لإنشاء ورقة جديدة لكل يوم تلقائياً
function createDailySheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const today = new Date();
    const dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const sheetName = 'التقارير_' + dateString;
    
    // التحقق من وجود الورقة
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      
      // إضافة رؤوس الأعمدة
      const headers = [
        'التاريخ',
        'اليوم',
        'اسم الباحث',
        'الزيارات المسندة',
        'الزيارات المنفذة',
        'التعذرات',
        'المتبقية',
        'المؤجلة',
        'المشاكل التقنية',
        'خارج النطاق',
        'الملاحظات',
        'الوقت'
      ];
      
      sheet.appendRow(headers);
      
      // تنسيق رؤوس الأعمدة
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00d4ff');
      headerRange.setFontColor('#000000');
      headerRange.setFontWeight('bold');
      
      Logger.log('✅ تم إنشاء ورقة جديدة: ' + sheetName);
    }
    
  } catch (error) {
    Logger.log('❌ خطأ: ' + error.toString());
  }
}

// 🗑️ دالة لحذف الأوراق القديمة (أكثر من 30 يوم)
function deleteOldSheets() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      
      // تخطي الأوراق الخاصة
      if (sheetName === 'الرئيسية' || sheetName === 'Sheet1') {
        return;
      }
      
      // استخراج التاريخ من اسم الورقة
      const dateMatch = sheetName.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const sheetDate = new Date(dateMatch[1], parseInt(dateMatch[2]) - 1, dateMatch[3]);
        
        // حذف الورقة إذا كانت أقدم من 30 يوم
        if (sheetDate < thirtyDaysAgo) {
          spreadsheet.deleteSheet(sheet);
          Logger.log('✅ تم حذف الورقة: ' + sheetName);
        }
      }
    });
    
  } catch (error) {
    Logger.log('❌ خطأ: ' + error.toString());
  }
}

// ⏰ دالة لجدولة المهام
function setupTriggers() {
  // حذف المشغلات القديمة
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // إنشاء مشغل جديد لإنشاء ورقة يومية في منتصف الليل
  ScriptApp.newTrigger('createDailySheet')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();
  
  // إنشاء مشغل لحذف الأوراق القديمة كل أسبوع
  ScriptApp.newTrigger('deleteOldSheets')
    .timeBased()
    .atHour(1)
    .everyWeeks(1)
    .create();
  
  Logger.log('✅ تم إعداد المشغلات بنجاح');
}

console.log('✅ تم تحميل Google Apps Script بنجاح');
