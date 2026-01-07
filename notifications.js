/**
 * نظام الإشعارات اللحظية الجماعي للدليل الإرشادي للباحثين
 * يقوم بفحص التغييرات في Google Sheets وعرض تنبيه لجميع المستخدمين عند إرسال تقرير جديد
 */

const NOTIFICATION_CONFIG = {
    checkInterval: 15000, // فحص كل 15 ثانية لضمان السرعة
    lastReportCount: parseInt(localStorage.getItem('lastReportCount')) || 0
};

// دالة لإنشاء وعرض الإشعار في الواجهة
function showToastNotification(message, isGlobal = false) {
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
        border-right: 4px solid ${isGlobal ? '#00d4ff' : '#00ff88'};
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
        <div style="background: rgba(0, 212, 255, 0.1); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${isGlobal ? '#00d4ff' : '#00ff88'};">
            <i class="fas ${isGlobal ? 'fa-users' : 'fa-check-circle'}"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: bold; color: ${isGlobal ? '#00d4ff' : '#00ff88'}; margin-bottom: 3px; font-size: 0.9em;">${isGlobal ? 'تحديث ميداني' : 'تم الإرسال'}</div>
            <div style="font-size: 0.95em; line-height: 1.4;">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 18px;">&times;</button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // تشغيل صوت التنبيه القديم
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.volume = 0.4;
        audio.play();
    } catch (e) { console.log('Audio play blocked'); }

    setTimeout(() => {
        toast.style.transform = 'translateX(-120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 8000);
}

// دالة لفحص التقارير الجديدة وتنبيه الجميع
async function syncGlobalNotifications() {
    if (typeof fetchFromGoogleSheets !== 'function') return;

    try {
        const reports = await fetchFromGoogleSheets();
        if (reports && reports.length > 0) {
            // إذا زاد عدد التقارير عن آخر مرة، يعني هناك تقرير جديد
            if (NOTIFICATION_CONFIG.lastReportCount > 0 && reports.length > NOTIFICATION_CONFIG.lastReportCount) {
                const newReport = reports[0]; // آخر تقرير مضاف
                const name = newReport.researcherName || newReport['اسم الباحث'] || 'باحث';
                const region = newReport.region || newReport['المنطقة'] || '';
                
                showToastNotification(`قام الباحث ${name} بإرسال تقريره اليومي   ${region} 🚀`, true);
                
                // تحديث لوحة البيانات تلقائياً للجميع
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
            
            // تحديث العدد في الذاكرة
            NOTIFICATION_CONFIG.lastReportCount = reports.length;
            localStorage.setItem('lastReportCount', reports.length);
        }
    } catch (error) {
        console.error('Notification Sync Error:', error);
    }
}

// بدء الفحص الدوري
document.addEventListener('DOMContentLoaded', () => {
    // تعيين العدد الأولي دون تنبيه
    setTimeout(async () => {
        if (typeof fetchFromGoogleSheets === 'function') {
            const reports = await fetchFromGoogleSheets();
            NOTIFICATION_CONFIG.lastReportCount = reports ? reports.length : 0;
            localStorage.setItem('lastReportCount', NOTIFICATION_CONFIG.lastReportCount);
        }
    }, 2000);

    // فحص كل 15 ثانية
    setInterval(syncGlobalNotifications, NOTIFICATION_CONFIG.checkInterval);
});
