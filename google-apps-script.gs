// ============================================
// Google Apps Script للتزامن بين الأجهزة (مع دعم CORS)
// ============================================

// معرف جدول البيانات الخاص بك (تم تضمينه تلقائياً)
const SPREADSHEET_ID = "1qK29NCrGAFiPaqyab0ytyk8trUoBc66oNMUVShzy4z0";
const SHEET_NAME = "Excuses";

/**
 * دالة doGet - لمعالجة طلبات GET (للحصول على البيانات)
 * يتم استدعاء هذه الدالة عندما يقوم المتصفح بطلب البيانات من الويب App.
 */
function doGet(e) {
  const result = {};
  try {
    const sheet = getSheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const excuses = [];
    // تخطي الصف الأول (العناوين) إذا كان موجودًا
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][1]) { // تأكد أن الصف يحتوي على ID و Text
        excuses.push({
          id: values[i][0].toString(), // تحويل ID إلى نص
          text: values[i][1].toString()
        });
      }
    }
    
    // إذا لم يكن هناك تعذرات مخزنة، أرجع الافتراضية
    if (excuses.length === 0) {
      result.excuses = getDefaultExcuses();
    } else {
      result.excuses = excuses;
    }
    result.success = true;

  } catch (error) {
    Logger.log("خطأ في doGet: " + error.toString());
    result.error = error.toString();
    result.excuses = getDefaultExcuses(); // إرجاع الافتراضية عند الخطأ
    result.success = false;
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

/**
 * دالة doPost - لمعالجة طلبات POST (لحفظ البيانات)
 * يتم استدعاء هذه الدالة عندما يقوم المتصفح بإرسال بيانات لتعديلها.
 */
function doPost(e) {
  const result = {};
  try {
    const requestBody = e.postData.contents;
    const params = getParamsFromUrlEncoded(requestBody);
    
    if (params.action === "save") {
      const excuses = JSON.parse(params.data);
      saveExcusesToSheet(excuses);
      
      result.success = true;
      result.message = "تم حفظ البيانات بنجاح";
      result.timestamp = new Date().toISOString();
    } else {
      result.success = false;
      result.message = "إجراء غير معروف";
    }

  } catch (error) {
    Logger.log("خطأ في doPost: " + error.toString());
    result.success = false;
    result.message = error.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

/**
 * دالة مساعدة للحصول على الورقة أو إنشائها إذا لم تكن موجودة.
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "Text"]); // إضافة رؤوس الأعمدة
    // إضافة التعذرات الافتراضية عند إنشاء الورقة لأول مرة
    getDefaultExcuses().forEach(excuse => {
      sheet.appendRow([excuse.id, excuse.text]);
    });
  }
  return sheet;
}

/**
 * دالة مساعدة لحفظ قائمة التعذرات في جدول البيانات.
 */
function saveExcusesToSheet(excuses) {
  const sheet = getSheet();
  
  // مسح جميع البيانات باستثناء الصف الأول (العناوين)
  // تأكد من أن هناك صفوف لحذفها قبل محاولة الحذف
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  // إضافة البيانات الجديدة
  if (excuses && excuses.length > 0) {
    const values = excuses.map(excuse => [excuse.id, excuse.text]);
    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
  }
}

/**
 * دالة مساعدة للحصول على التعذرات الافتراضية.
 */
function getDefaultExcuses() {
  return [
    { id: "1", text: "تعذر خطأ نقي" },
    { id: "2", text: "تعذر مستقل مخالف لشروط الاستقلالية" },
    { id: "3", text: "تعذر صلة قرابة" },
    { id: "4", text: "تعذر الزيارة من قبل الباحث" },
    { id: "5", text: "تعذر البيانات المقدمة من المستفيد غير صحيحة" },
  ];
}

/**
 * دالة مساعدة لتحليل بيانات POST من نوع application/x-www-form-urlencoded.
 */
function getParamsFromUrlEncoded(body) {
  const params = {};
  body.split("&").forEach(pair => {
    const parts = pair.split("=");
    if (parts.length === 2) {
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
  });
  return params;
}

/**
 * دالة لمعالجة طلبات OPTIONS (لـ CORS Preflight)
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

