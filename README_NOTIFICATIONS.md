# دليل إعداد نظام الإشعارات اللحظية المنفصل 🚀

لقد قمت بإنشاء نظام إشعارات جديد يعمل بشكل منفصل تماماً عن نظام التقارير الحالي، لضمان السرعة والعزل.

## المكونات الجديدة:
1.  **`new_notifications_script.gs`**: كود Google Apps Script يوضع في جدول البيانات الجديد المخصص للإشعارات.
2.  **`notifications_firebase.js`**: ملف JavaScript جديد لموقعك يستبدل الملف القديم ويوفر سرعة فائقة.

---

## خطوات الإعداد:

### أولاً: إعداد Firebase (مجاني)
1.  اذهب إلى [Firebase Console](https://console.firebase.google.com/).
2.  أنشئ مشروعاً جديداً باسم "Research Guide Notifications".
3.  من القائمة الجانبية، اختر **Build** ثم **Realtime Database**.
4.  أنشئ قاعدة بيانات واختر الموقع (مثلاً us-central1).
5.  في تبويب **Rules**، اجعل القواعد كالتالي للسماح بالقراءة للجميع والكتابة بالسر فقط:
    ```json
    {
      "rules": {
        ".read": true,
        ".write": "auth != null"
      }
    }
    ```
6.  اذهب إلى **Project Settings** (أيقونة الترس) -> **Service Accounts** -> **Database Secrets** وانسخ السر (Secret).
7.  انسخ رابط قاعدة البيانات (ينتهي بـ `.firebaseio.com/`).

### ثانياً: إعداد Google Sheets و Apps Script
1.  أنشئ جدول بيانات جديد للإشعارات.
2.  من القائمة: **Extensions** -> **Apps Script**.
3.  انسخ محتوى ملف `new_notifications_script.gs` والصقه هناك.
4.  استبدل `YOUR_PROJECT_ID` و `YOUR_FIREBASE_SECRET` بالبيانات التي نسختها من Firebase.
5.  احفظ المشروع وأعطه اسماً.
6.  أضف "Trigger" (أيقونة الساعة) ليعمل عند إرسال النموذج (On form submit) أو عند التعديل.

### ثالثاً: تحديث الموقع
1.  في ملف `notifications_firebase.js` في موقعك، استبدل `YOUR_PROJECT_ID` برابط قاعدة بياناتك.
2.  في ملف `index.html` (وجميع الصفحات التي تريد ظهور الإشعارات فيها)، تأكد من استدعاء الملف الجديد:
    ```html
    <script src="notifications_firebase.js"></script>
    ```
    بدلاً من:
    ```html
    <script src="notifications.js"></script>
    ```

---

## مميزات هذا الحل:
*   **منفصل تماماً:** لا يؤثر على نظام التقارير الحالي.
*   **لحظي:** يظهر الإشعار في أقل من ثانية لجميع المستخدمين.
*   **متوافق مع GitHub:** يعمل بسلاسة على GitHub Pages.
*   **خفيف:** لا يستهلك موارد المتصفح مثل نظام الفحص الدوري القديم.
