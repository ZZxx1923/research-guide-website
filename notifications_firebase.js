/**
 * نظام الإشعارات اللحظية المطور (Firebase Edition)
 * تم التحديث بروابط المستخدم النهائية
 */

const FIREBASE_WEB_CONFIG = {
    databaseURL: "https://notificationsfirebase-9a183-default-rtdb.firebaseio.com/"
};

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
            <div style="font-weight: bold; color: ${isGlobal ? '#00d4ff' : '#00ff88'}; margin-bottom: 3px; font-size: 0.9em;">تحديث ميداني جديد</div>
            <div style="font-size: 0.95em; line-height: 1.4;">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 18px;">&times;</button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

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

function initRealtimeNotifications() {
    // نراقب مسار الإشعارات بالكامل
    const url = FIREBASE_WEB_CONFIG.databaseURL + "notifications.json?orderBy=\"timestamp\"&limitToLast=1";
    
    let lastTimestamp = Date.now(); // نركز فقط على ما يحدث بعد فتح الصفحة

    async function checkForUpdates() {
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data) {
                // Firebase يعيد كائن عند استخدام orderBy، نحتاج لجلب آخر عنصر
                const keys = Object.keys(data);
                const lastItem = data[keys[0]];
                
                if (lastItem && lastItem.timestamp > lastTimestamp) {
                    showToastNotification(lastItem.message, true);
                    lastTimestamp = lastItem.timestamp;
                    
                    if (typeof loadDashboardData === 'function') {
                        loadDashboardData();
                    }
                }
            }
        } catch (error) {
            console.error('Firebase Sync Error:', error);
        }
    }

    setInterval(checkForUpdates, 5000);
    checkForUpdates();
}

document.addEventListener('DOMContentLoaded', initRealtimeNotifications);

// دوال بديلة لضمان عدم حدوث أخطاء في حال استدعاء مسميات قديمة
function showNotification(message, type) {
    showToastNotification(message, type === 'error');
}

// دالة فحص الاتصال للتأكد من عمل النظام
async function testFirebaseConnection() {
    const url = FIREBASE_WEB_CONFIG.databaseURL + ".json";
    try {
        const response = await fetch(url);
        if (response.ok) {
            console.log("✅ Firebase Connection Active");
        }
    } catch (e) {
        console.error("❌ Firebase Connection Failed:", e);
    }
}
testFirebaseConnection();

// دالة إرسال الإشارة لـ Firebase (متاحة لجميع الصفحات)
async function triggerInstantNotification(name, region) {
    const researcherName = name || "باحث";
    const url = FIREBASE_WEB_CONFIG.databaseURL + "notifications.json";
    const payload = {
        name: researcherName,
        region: region || "",
        timestamp: Date.now(),
        message: `أتم الباحث ${researcherName} تقريره اليومي وأرسله بنجاح ✅`
    };
    
    try {
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        console.log("✅ تم إرسال إشارة الإشعار اللحظي باسم: " + researcherName);
    } catch (e) {
        console.error("❌ فشل إرسال إشارة الإشعار:", e);
    }
}
