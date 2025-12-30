// 📊 Google Apps Script - النسخة النهائية المحلولة
// انسخ هذا الكود كاملاً إلى Google Apps Script

const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

// ✅ دالة POST لاستقبال البيانات من الموقع
function doPost(e) {
  try {
    // استخراج البيانات من الطلب
    const postData = e.postData.contents;
    const data = JSON.parse(postData);
    
    Logger.log('📥 تم استقبال البيانات: ' + JSON.stringify(data));
    
    // فتح الجدول
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // الحصول على التاريخ الحالي
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = year + '-' + month + '-' + day;
    
    // اسم الورقة اليومية
    const dailySheetName = 'التقارير_' + dateString;
    
    // ✅ إنشاء أو الحصول على الورقة اليومية
    let dailySheet = ss.getSheetByName(dailySheetName);
    if (!dailySheet) {
      dailySheet = ss.insertSheet(dailySheetName);
      Logger.log('✅ تم إنشاء ورقة جديدة: ' + dailySheetName);
      
      // إضافة الرؤوس
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
      dailySheet.appendRow(headers);
      
      // تنسيق الرؤوس
      const headerRange = dailySheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00d4ff');
      headerRange.setFontColor('#000000');
      headerRange.setFontWeight('bold');
    }
    
    // إضافة البيانات إلى الورقة اليومية
    const dailyRow = [
      data.date || dateString,
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
    
    dailySheet.appendRow(dailyRow);
    Logger.log('✅ تم إضافة البيانات إلى الورقة اليومية');
    
    // ✅ إضافة البيانات إلى ورقة "الرئيسية"
    let masterSheet = ss.getSheetByName('الرئيسية');
    if (!masterSheet) {
      masterSheet = ss.insertSheet('الرئيسية', 0);
      Logger.log('✅ تم إنشاء ورقة الرئيسية');
      
      // إضافة الرؤوس
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
      
      // تنسيق الرؤوس
      const masterHeaderRange = masterSheet.getRange(1, 1, 1, masterHeaders.length);
      masterHeaderRange.setBackground('#7c3aed');
      masterHeaderRange.setFontColor('#ffffff');
      masterHeaderRange.setFontWeight('bold');
    }
    
    // حساب النسبة المئوية والحالة
    const assigned = parseInt(data.assignedVisits) || 1;
    const completed = parseInt(data.completedVisits) || 0;
    const technicalIssues = parseInt(data.technicalIssues) || 0;
    const completionRate = ((completed / assigned) * 100).toFixed(1);
    
    let status = 'عادي';
    let statusColor = '#ffff00'; // أصفر
    
    if (technicalIssues > 0) {
      status = 'مشكلة ❌';
      statusColor = '#ff0000'; // أحمر
    } else if (completionRate >= 90) {
      status = 'محقق ✅';
      statusColor = '#00ff00'; // أخضر
    }
    
    // إضافة البيانات إلى الورقة الرئيسية
    const masterRow = [
      data.date || dateString,
      data.day || '',
      data.researcherName || '',
      data.assignedVisits || '',
      data.completedVisits || '',
      completionRate + '%',
      technicalIssues,
      status,
      data.notes || '',
      new Date().toLocaleTimeString('ar-SA')
    ];
    
    masterSheet.appendRow(masterRow);
    
    // تلوين صف الحالة
    const lastRow = masterSheet.getLastRow();
    masterSheet.getRange(lastRow, 8).setBackground(statusColor);
    
    Logger.log('✅ تم إضافة البيانات إلى الورقة الرئيسية');
    
    // إرجاع رسالة نجاح
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'تم حفظ التقرير بنجاح ✅',
      sheetName: dailySheetName,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ خطأ: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ دالة GET للتحقق من أن السكريبت يعمل
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    const sheetNames = [];
    
    for (let i = 0; i < sheets.length; i++) {
      sheetNames.push(sheets[i].getName());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'السكريبت يعمل بشكل صحيح ✅',
      spreadsheetId: SPREADSHEET_ID,
      sheets: sheetNames,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ دالة لإنشاء ورقة جديدة يومياً
function createDailySheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = year + '-' + month + '-' + day;
    const sheetName = 'التقارير_' + dateString;
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
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
      
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#00d4ff');
      headerRange.setFontColor('#000000');
      headerRange.setFontWeight('bold');
      
      Logger.log('✅ تم إنشاء ورقة يومية جديدة: ' + sheetName);
    }
  } catch (error) {
    Logger.log('❌ خطأ: ' + error.toString());
  }
}

// ✅ دالة لحذف الأوراق القديمة
function deleteOldSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetName = sheet.getName();
      
      if (sheetName === 'الرئيسية' || sheetName === 'Sheet1') {
        continue;
      }
      
      const dateMatch = sheetName.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const sheetDate = new Date(dateMatch[1], parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
        
        if (sheetDate < thirtyDaysAgo) {
          ss.deleteSheet(sheet);
          Logger.log('✅ تم حذف الورقة القديمة: ' + sheetName);
        }
      }
    }
  } catch (error) {
    Logger.log('❌ خطأ: ' + error.toString());
  }
}

// ✅ دالة لإعداد المشغلات
function setupTriggers() {
  try {
    // حذف المشغلات القديمة
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    
    // إنشاء مشغل لإنشاء ورقة يومية في الساعة 12:01 صباحاً
    ScriptApp.newTrigger('createDailySheet')
      .timeBased()
      .atHour(0)
      .everyDays(1)
      .create();
    
    // إنشاء مشغل لحذف الأوراق القديمة يوم الجمعة
    ScriptApp.newTrigger('deleteOldSheets')
      .timeBased()
      .onWeeksDay(ScriptApp.WeekDay.FRIDAY)
      .atHour(1)
      .create();
    
    Logger.log('✅ تم إعداد المشغلات بنجاح');
  } catch (error) {
    Logger.log('❌ خطأ في إعداد المشغلات: ' + error.toString());
  }
}

Logger.log('✅ تم تحميل السكريبت بنجاح');
