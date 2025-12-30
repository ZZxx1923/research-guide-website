/**
 * نظام الإشعارات اللحظية لـ PRISM FLUX
 * يقوم بفحص التغييرات في Google Sheets وعرض تنبيه عند إرسال تقرير جديد
 */

const NOTIFICATION_CONFIG = {
    checkInterval: 30000, // فحص كل 30 ثانية لتجنب تجاوز حدود Google Script
    lastNotificationTime: localStorage.getItem('lastNotificationTime') || new Date().toISOString()
};

// دالة لإنشاء وعرض الإشعار في الواجهة
function showToastNotification(message) {
    // إنشاء عنصر الإشعار إذا لم يكن موجوداً
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(18, 18, 18, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        border-right: 4px solid #00ff88;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 15px;
        transform: translateX(-120%);
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
        backdrop-filter: blur(10px);
        min-width: 300px;
        max-width: 450px;
    `;

    toast.innerHTML = `
        <div style="background: rgba(0, 255, 136, 0.1); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #00ff88;">
            <i class="fas fa-bell"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: bold; color: #00ff88; margin-bottom: 3px; font-size: 0.9em;">تنبيه جديد</div>
            <div style="font-size: 0.95em; line-height: 1.4;">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 18px;">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // تحريك الإشعار للداخل
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // تشغيل صوت تنبيه بسيط (اختياري)
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.volume = 0.3;
        audio.play();
    } catch (e) { console.log('Audio play blocked'); }

    // إخفاء الإشعار بعد 8 ثوانٍ
    setTimeout(() => {
        toast.style.transform = 'translateX(-120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 8000);
}

// دالة لفحص الإشعارات الجديدة من Google Script
async function checkForNewNotifications() {
    if (!GOOGLE_APPS_SCRIPT_URL) return;

    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=notifications`);
        const data = await response.json();

        if (data.success && data.notifications && data.notifications.length > 0) {
            const latest = data.notifications[0];
            
            // التحقق مما إذا كان الإشعار جديداً
            if (new Date(latest.timestamp) > new Date(NOTIFICATION_CONFIG.lastNotificationTime)) {
                showToastNotification(latest.message);
                
                // تحديث وقت آخر إشعار
                NOTIFICATION_CONFIG.lastNotificationTime = latest.timestamp;
                localStorage.setItem('lastNotificationTime', latest.timestamp);
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// بدء الفحص الدوري عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // فحص أول مرة بعد 5 ثوانٍ من التحميل
    setTimeout(checkForNewNotifications, 5000);
    
    // ضبط الفحص الدوري
    setInterval(checkForNewNotifications, NOTIFICATION_CONFIG.checkInterval);
});
