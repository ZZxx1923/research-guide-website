// معرّف الشيت
const SHEET_ID = '1mw5z6UWdk3GZHiprpr6-oFSVTAje3bE8KADSf3SMnaM';
const EXCUSES_SHEET_NAME = 'الورقة1';
const VIDEOS_SHEET_NAME = 'Videos';

// 🟢 الدالة الرئيسية لمعالجة طلبات GET
function doGet(e) {
  const action = e.parameter.action;

  // اختبار الاتصال
  if (action === 'testConnection') {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Connection successful' 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // جلب التعذرات من الشيت
  if (action === 'getExcuses') {
    try {
      const sheetName = e.parameter.sheetName || EXCUSES_SHEET_NAME;
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'error', 
          message: 'Sheet not found: ' + sheetName 
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // جلب البيانات من الصف الثاني فما فوق (الصف الأول للعناوين)
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'success', 
          data: [] 
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // جلب البيانات من العمود الأول (A) - حيث يتم تخزين نص التعذر
      const range = sheet.getRange(2, 1, lastRow - 1, 1);
      const values = range.getValues();
      
      const excuses = values.map(function(row) { 
        return { text: row[0] }; 
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'success', 
        data: excuses 
      }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // جلب الفيديوهات من الشيت
  if (action === 'getVideos') {
    try {
      const sheetName = e.parameter.sheetName || VIDEOS_SHEET_NAME;
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'error', 
          message: 'Sheet not found: ' + sheetName 
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // جلب البيانات من الصف الثاني فما فوق (الصف الأول للعناوين)
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'success', 
          data: [] 
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // جلب البيانات من الأعمدة A (العنوان), B (الرابط), C (الوصف)
      const range = sheet.getRange(2, 1, lastRow - 1, 3);
      const values = range.getValues();
      
      const videos = values.map(function(row) { 
        return { 
          title: row[0],
          url: row[1],
          description: row[2]
        }; 
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'success', 
        data: videos 
      }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // عرض البيانات في المتصفح (واجهة بسيطة)
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    let html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; direction: rtl; text-align: right; padding: 20px; }
        h2 { color: #333; text-align: center; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .success { color: green; text-align: center; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>📋 البيانات من الورقة1</h2>
      <table>
        <tr>
          <th>رقم الصف</th>
          <th>التعذر</th>
          <th>تاريخ التعديل</th>
        </tr>`;

    for (let i = 1; i < data.length; i++) {
      html += "<tr>";
      html += "<td>" + (i + 1) + "</td>";
      // العمود الأول: التعذر
      html += "<td>" + data[i][0] + "</td>";
      // العمود الثاني: تاريخ التعديل
      html += "<td>" + data[i][1] + "</td>";
      html += "</tr>";
    }

    html += `
      </table>
      <p class="success">✅ تم الاتصال بالشيت بنجاح.</p>
    </body>
    </html>`;

    return HtmlService.createHtmlOutput(html)
      .setTitle("عرض البيانات من Google Sheets")
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } catch (error) {
    return HtmlService.createHtmlOutput("<h2>❌ حدث خطأ: " + error.message + "</h2>");
  }
}

// 🟢 الدالة الرئيسية لمعالجة طلبات POST (إضافة / تعديل / حذف)
function doPost(e) {
  try {
    // الحصول على البيانات من الطلب
    const params = e.parameter || {};
    const action = params.action;

    if (!action) {
      return createJsonResponse('error', 'لم يتم إرسال بيانات صحيحة.');
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    if (action === "add") {
      // ➕ إضافة تعذر جديد
      const sheet = ss.getSheetByName(EXCUSES_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة التعذرات.');
      
      // العمود الأول (A): نص التعذر (field1)
      // العمود الثاني (B): تاريخ التعديل
      sheet.appendRow([
        params.field1 || "",
        new Date()
      ]);
      return createJsonResponse('success', 'تمت الإضافة بنجاح.');

    } else if (action === "update") {
      // ✏️ تعديل تعذر محدد
      const sheet = ss.getSheetByName(EXCUSES_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة التعذرات.');
      
      const row = parseInt(params.row);
      if (isNaN(row) || row < 2) {
        return createJsonResponse('error', 'رقم الصف غير صالح للتعديل.');
      }

      // تعديل العمود الأول (A) - نص التعذر
      sheet.getRange(row, 1).setValue(params.field1 || "");
      // تحديث العمود الثاني (B) - تاريخ التعديل
      sheet.getRange(row, 2).setValue(new Date());
      return createJsonResponse('success', 'تم التعديل بنجاح.');

    } else if (action === "delete") {
      // 🗑️ حذف تعذر محدد
      const sheet = ss.getSheetByName(EXCUSES_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة التعذرات.');
      
      const row = parseInt(params.row);
      if (isNaN(row) || row < 2) {
        return createJsonResponse('error', 'رقم الصف غير صالح للحذف.');
      }

      sheet.deleteRow(row);
      return createJsonResponse('success', 'تم الحذف بنجاح.');
      
    } else if (action === "addVideo") {
      // ➕ إضافة فيديو جديد
      const sheet = ss.getSheetByName(VIDEOS_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة الفيديوهات.');
      
      // الأعمدة: A (العنوان), B (الرابط), C (الوصف), D (تاريخ الإضافة)
      sheet.appendRow([
        params.title || "",
        params.url || "",
        params.description || "",
        new Date()
      ]);
      return createJsonResponse('success', 'تمت إضافة الفيديو بنجاح.');
      
    } else if (action === "updateVideo") {
      // ✏️ تعديل فيديو محدد
      const sheet = ss.getSheetByName(VIDEOS_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة الفيديوهات.');
      
      const row = parseInt(params.row);
      if (isNaN(row) || row < 2) {
        return createJsonResponse('error', 'رقم الصف غير صالح للتعديل.');
      }

      // تعديل الأعمدة: A (العنوان), B (الرابط), C (الوصف), D (تاريخ التعديل)
      sheet.getRange(row, 1).setValue(params.title || "");
      sheet.getRange(row, 2).setValue(params.url || "");
      sheet.getRange(row, 3).setValue(params.description || "");
      sheet.getRange(row, 4).setValue(new Date());
      return createJsonResponse('success', 'تم تعديل الفيديو بنجاح.');
      
    } else if (action === "deleteVideo") {
      // 🗑️ حذف فيديو محدد
      const sheet = ss.getSheetByName(VIDEOS_SHEET_NAME);
      if (!sheet) return createJsonResponse('error', 'لم يتم العثور على ورقة الفيديوهات.');
      
      const row = parseInt(params.row);
      if (isNaN(row) || row < 2) {
        return createJsonResponse('error', 'رقم الصف غير صالح للحذف.');
      }

      sheet.deleteRow(row);
      return createJsonResponse('success', 'تم حذف الفيديو بنجاح.');
    }

    return createJsonResponse('error', 'نوع العملية غير معروف.');

  } catch (error) {
    return createJsonResponse('error', 'حدث خطأ: ' + error.message);
  }
}

// دالة مساعدة لإنشاء استجابة JSON
function createJsonResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: status, 
    message: message 
  }))
    .setMimeType(ContentService.MimeType.JSON);
}
