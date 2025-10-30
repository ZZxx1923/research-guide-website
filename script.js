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

// متغير لتتبع التاريخ الذي يتم عرضه وتحديثه
let currentDate = new Date();

// تحديث التاريخ واسم اليوم
function updateDateTime() {
    
    // الحصول على اسم اليوم من التاريخ الحالي المتحكم به
    const dayIndex = currentDate.getDay();
    const dayName = daysInArabic[dayIndex];
    
    // تنسيق التاريخ (DD/MM/YYYY)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const dateString = `${day}/${month}/${year}`;
    
    // تحديث العناصر في الصفحة
    document.getElementById('dayName').textContent = dayName;
    document.getElementById('dateDisplay').textContent = dateString;
    
    // تحديث الرسائل المخفية بالتاريخ واليوم الجديد
    updateHiddenMessages(dayName, dateString);
}

// دالة للانتقال إلى اليوم التالي
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateTime();
}

// دالة للانتقال إلى اليوم السابق
function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateTime();
}

// دالة لإعادة تعيين التاريخ إلى اليوم الفعلي
function resetDate() {
    currentDate = new Date();
    updateDateTime();
}

// تحديث الرسائل المخفية بالتاريخ واليوم
function updateHiddenMessages(dayName, dateString) {
    // تحديث رسالة الضمان (message1)
    const message1 = document.getElementById('message1');
    let messageText1 = message1.textContent;
    // استبدال اليوم مع الأقواس
    messageText1 = messageText1.replace(/لديكم موعد زياره يوم \([^)]*\)/g, `لديكم موعد زياره يوم (${dayName})`);
    // استبدال التاريخ
    messageText1 = messageText1.replace(/بتاريخ : \d{2}\/\d{2}\/\d{4}/g, `بتاريخ : ${dateString}`);
    message1.textContent = messageText1;
    
    // تحديث رسالة حساب المواطن (message2)
    const message2 = document.getElementById('message2');
    let messageText2 = message2.textContent;
    // استبدال اليوم مع الأقواس
    messageText2 = messageText2.replace(/لديكم موعد زياره يوم \([^)]*\)/g, `لديكم موعد زياره يوم (${dayName})`);
    // استبدال التاريخ
    messageText2 = messageText2.replace(/بتاريخ : \d{2}\/\d{2}\/\d{4}/g, `بتاريخ : ${dateString}`);
    message2.textContent = messageText2;
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
    
    // تحديث الوقت كل دقيقة للتأكد من أن التاريخ يعود لليوم الفعلي عند بداية يوم جديد
    setInterval(resetDate, 60000 * 60); // كل ساعة
});

// تحديث الوقت عند استعادة الصفحة من الذاكرة المؤقتة
window.addEventListener('pageshow', () => {
    resetDate();
});

/* وظيفة لفتح وإغلاق الشريط الجانبي */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

/* إغلاق الشريط الجانبي عند الضغط على أي رابط */
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleSidebar();
        });
    });
});


/* ============================================
   وظائف الشخصية المسلية (Character Interactions)
   ============================================ */

// رسائل تحفيزية عشوائية للشخصية
const characterMessages = [
    'مرحباً! كيف حالك اليوم؟ 😊',
    'هل تحتاج إلى مساعدة؟ أنا هنا! 🤝',
    'رائع! أنت تقوم بعمل رائع! 👍',
    'استمر في المحاولة، أنت تقترب! 💪',
    'أنا هنا لمساعدتك في كل خطوة! 🎯',
    'تذكر أن تأخذ فترات راحة! ☕',
    'أنت تفعل عملاً رائعاً! 🌟',
    'هل تريد نصيحة؟ اطلب مني! 💡'
];

// دالة لعرض رسالة عشوائية من الشخصية
function showCharacterMessage() {
    const randomIndex = Math.floor(Math.random() * characterMessages.length);
    const message = characterMessages[randomIndex];
    
    const speechBox = document.getElementById('characterSpeech');
    const speechText = document.getElementById('speechText');
    
    speechText.textContent = message;
    speechBox.style.display = 'block';
    
    // إخفاء الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
        speechBox.style.display = 'none';
    }, 3000);
}

// دالة لتحريك الشخصية
function animateCharacter() {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    // إضافة تأثير الحركة
    characterImg.style.transform = 'scale(1.15) rotate(-5deg)';
    
    setTimeout(() => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

// دالة لتحريك الشخصية نحو الزر المضغوط
function moveCharacterToButton(buttonElement) {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    // الحصول على موقع الزر
    const buttonRect = buttonElement.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    
    // حساب المسافة والاتجاه
    const moveX = buttonRect.left - characterRect.left;
    const moveY = buttonRect.top - characterRect.top;
    
    // تطبيق الحركة
    characterImg.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px) scale(1.1)`;
    
    // إرجاع الشخصية إلى مكانها الأصلي
    setTimeout(() => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    }, 500);
}

// إضافة مستمعات الأحداث للأزرار الرئيسية
document.addEventListener('DOMContentLoaded', () => {
    // الأزرار الرئيسية
    const buttons = document.querySelectorAll('.message-btn, .date-control-btn, .link-item, .sidebar-link');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // تحريك الشخصية
            moveCharacterToButton(this);
            
            // عرض رسالة عشوائية
            setTimeout(() => {
                showCharacterMessage();
            }, 300);
            
            // تحريك الشخصية
            animateCharacter();
        });
    });
    
    // الضغط على الشخصية نفسها
    const character = document.getElementById('character');
    character.addEventListener('click', () => {
        animateCharacter();
        showCharacterMessage();
    });
});

// تأثير عند تمرير الفأرة على الشخصية
document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    character.addEventListener('mouseenter', () => {
        characterImg.style.transform = 'scale(1.15) rotate(5deg)';
    });
    
    character.addEventListener('mouseleave', () => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    });
});
