// أسماء الأيام بالعربية
const daysInArabic = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت'
];

// تحديث التاريخ واسم اليوم
function updateDateTime() {
    const now = new Date();
    
    // الحصول على اسم اليوم
    const dayIndex = now.getDay();
    const dayName = daysInArabic[dayIndex];
    
    // تنسيق التاريخ (DD/MM/YYYY)
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}/${month}/${year}`;
    
    // تحديث العناصر في الصفحة
    document.getElementById('dayName').textContent = dayName;
    document.getElementById('dateDisplay').textContent = dateString;
    
    // تحديث الرسائل المخفية بالتاريخ واليوم الجديد
    updateHiddenMessages(dayName, dateString);
}

// تحديث الرسائل المخفية بالتاريخ واليوم
function updateHiddenMessages(dayName, dateString) {
    // تحديث رسالة الضمان
    const message1 = document.getElementById('message1');
    let messageText1 = message1.textContent;
    messageText1 = messageText1.replace(/لديكم موعد زياره يوم \S+/g, `لديكم موعد زياره يوم ${dayName}`);
    messageText1 = messageText1.replace(/بتاريخ : \d{2}\/\d{2}\/\d{4}/g, `بتاريخ : ${dateString}`);
    message1.textContent = messageText1;
}

// دالة نسخ الرسالة
function copyMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    const text = messageElement.textContent;
    
    // نسخ النص إلى الحافظة
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {
        // في حالة الفشل، استخدم الطريقة القديمة
        fallbackCopyMessage(text);
    });
}

// دالة بديلة للنسخ (للمتصفحات القديمة)
function fallbackCopyMessage(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('فشل نسخ الرسالة:', err);
    }
    
    document.body.removeChild(textarea);
}

// إظهار رسالة النجاح
function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

// تحديث التاريخ والوقت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    
    // تحديث الوقت كل دقيقة
    setInterval(updateDateTime, 60000);
});

// تحديث الوقت عند استعادة الصفحة من الذاكرة المؤقتة
window.addEventListener('pageshow', () => {
    updateDateTime();
});
