// ============================================
// نظام إدارة التعذرات مع Google Apps Script للتزامن
// ============================================

const PASSWORD = "Emdad@2025";
const MAX_EXCUSES = 25;

// رابط Google Apps Script للتزامن
// تأكد من تحديث هذا الرابط برابط الـ Web App الخاص بك بعد نشره
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5n07N4VGC7_8jY0pdilUdJVPXKHxPVMyJvzXdFVvL8Mj2Qt4sRMqtmwSHfzTVcts1/exec";


let isUnlocked = false;
let editingId = null;

// التعذرات الافتراضية
const defaultExcuses = [
    { id: "1", text: "تعذر خطأ نقي" },
    { id: "2", text: "تعذر مستقل مخالف لشروط الاستقلالية" },
    { id: "3", text: "تعذر صلة قرابة" },
    { id: "4", text: "تعذر الزيارة من قبل الباحث" },
    { id: "5", text: "تعذر البيانات المقدمة من المستفيد غير صحيحة" },
];

// ============================================
// دوال Google Apps Script للتزامن
// ============================================

/**
 * تحميل البيانات من Google Apps Script
 */
async function loadFromGoogleAppsScript() {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL + "?action=get", {
            method: "GET",
            mode: "cors"
        });
        
        if (!response.ok) {
            console.warn("خطأ في الاتصال بـ Google Apps Script، سيتم استخدام البيانات المحلية");
            return loadFromLocalStorage();
        }

        const data = await response.json();
        
        if (data && data.excuses) {
            // حفظ البيانات محلياً كنسخة احتياطية
            saveToLocalStorage(data.excuses);
            return data;
        }
        
        return loadFromLocalStorage();
    } catch (error) {
        console.error("خطأ في تحميل البيانات من Google Apps Script:", error);
        return loadFromLocalStorage();
    }
}

/**
 * حفظ البيانات في Google Apps Script
 */
async function saveToGoogleAppsScript(excuses) {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "save",
                data: JSON.stringify(excuses)
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log("تم حفظ البيانات بنجاح:", result);
            // حفظ محلي أيضاً كنسخة احتياطية
            saveToLocalStorage(excuses);
            return true;
        }
        
        console.warn("فشل حفظ البيانات في Google Apps Script");
        // حفظ محلي في حالة الفشل
        saveToLocalStorage(excuses);
        return false;
    } catch (error) {
        console.error("خطأ في حفظ البيانات في Google Apps Script:", error);
        // حفظ محلي في حالة الفشل
        saveToLocalStorage(excuses);
        return false;
    }
}

/**
 * حفظ البيانات في localStorage كنسخة احتياطية
 */
function saveToLocalStorage(excuses) {
    localStorage.setItem("excuses", JSON.stringify(excuses));
    localStorage.setItem("lastSync", new Date().toISOString());
}

/**
 * تحميل البيانات من localStorage
 */
function loadFromLocalStorage() {
    const excuses = localStorage.getItem("excuses");
    return {
        excuses: excuses ? JSON.parse(excuses) : defaultExcuses
    };
}

// ============================================
// دوال التعذرات
// ============================================

/**
 * عرض قائمة التعذرات
 */
async function renderExcuses() {
    const data = await loadFromGoogleAppsScript();
    const excuses = data.excuses || defaultExcuses;
    const list = document.getElementById("excuses-list");
    const countSpan = document.getElementById("count");
    const statusText = document.getElementById("status-text");
    
    list.innerHTML = "";
    countSpan.textContent = excuses.length;

    excuses.forEach((excuse) => {
        const li = document.createElement("li");
        li.className = "excuse-item";
        li.innerHTML = `
            <span class="excuse-text">${escapeHtml(excuse.text)}</span>
            ${isUnlocked ? `
                <div class="excuse-actions">
                    <button class="edit-btn" onclick="openEditDialog(\'${excuse.id}\', \'${escapeHtml(excuse.text).replace(/\'/g, "&#39;")}\')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExcuse(\'${excuse.id}\')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ""}
        `;
        list.appendChild(li);
    });

    const addBtn = document.getElementById("add-btn");
    if (isUnlocked) {
        addBtn.style.display = "block";
    } else {
        addBtn.style.display = "none";
    }

    const lockBtn = document.getElementById("lock-btn");
    if (isUnlocked) {
        lockBtn.classList.add("unlocked");
        lockBtn.innerHTML = \'<i class="fas fa-unlock"></i>\';
        statusText.textContent = "مفتوح";
        statusText.classList.add("unlocked");
    } else {
        lockBtn.classList.remove("unlocked");
        lockBtn.innerHTML = \'<i class="fas fa-lock"></i>\';
        statusText.textContent = "مقفول";
        statusText.classList.remove("unlocked");
    }
}

// ============================================
// دوال المصادقة
// ============================================

/**
 * فتح نافذة إدخال كلمة السر
 */
function togglePasswordDialog() {
    if (isUnlocked) {
        isUnlocked = false;
        renderExcuses();
    } else {
        openPasswordDialog();
    }
}

function openPasswordDialog() {
    document.getElementById("password-modal").style.display = "flex";
    document.getElementById("password-input").focus();
    document.getElementById("password-input").value = "";
}

function closePasswordDialog() {
    document.getElementById("password-modal").style.display = "none";
    document.getElementById("password-input").value = "";
}

function handlePasswordKeyPress(event) {
    if (event.key === "Enter") {
        checkPassword();
    }
}

/**
 * التحقق من كلمة السر
 */
function checkPassword() {
    const password = document.getElementById("password-input").value;
    if (password === PASSWORD) {
        isUnlocked = true;
        closePasswordDialog();
        renderExcuses();
    } else {
        alert("كلمة السر غير صحيحة!");
        document.getElementById("password-input").value = "";
        document.getElementById("password-input").focus();
    }
}

// ============================================
// دوال إضافة التعذرات
// ============================================

function openAddDialog() {
    document.getElementById("add-modal").style.display = "flex";
    document.getElementById("new-excuse-input").focus();
    document.getElementById("new-excuse-input").value = "";
}

function closeAddDialog() {
    document.getElementById("add-modal").style.display = "none";
    document.getElementById("new-excuse-input").value = "";
}

function handleAddKeyPress(event) {
    if (event.key === "Enter") {
        addExcuse();
    }
}

/**
 * إضافة تعذر جديد
 */
async function addExcuse() {
    const text = document.getElementById("new-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    const data = await loadFromGoogleAppsScript();
    const excuses = data.excuses || defaultExcuses;

    if (excuses.length >= MAX_EXCUSES) {
        alert(`لا يمكن إضافة أكثر من ${MAX_EXCUSES} تعذر`);
        return;
    }

    const newExcuse = {
        id: Date.now().toString(),
        text: text
    };

    excuses.push(newExcuse);
    
    // حفظ في Google Apps Script
    const saved = await saveToGoogleAppsScript(excuses);
    
    if (saved) {
        closeAddDialog();
        renderExcuses();
        showNotification("تم إضافة التعذر بنجاح وسيتم تزامنه مع جميع الأجهزة");
    } else {
        alert("تم إضافة التعذر محلياً، لكن قد يكون هناك تأخير في التزامن");
        closeAddDialog();
        renderExcuses();
    }
}

// ============================================
// دوال تعديل التعذرات
// ============================================

function openEditDialog(id, text) {
    editingId = id;
    document.getElementById("edit-modal").style.display = "flex";
    document.getElementById("edit-excuse-input").value = text;
    document.getElementById("edit-excuse-input").focus();
}

function closeEditDialog() {
    document.getElementById("edit-modal").style.display = "none";
    document.getElementById("edit-excuse-input").value = "";
    editingId = null;
}

function handleEditKeyPress(event) {
    if (event.key === "Enter") {
        saveEditExcuse();
    }
}

/**
 * حفظ التعديل على التعذر
 */
async function saveEditExcuse() {
    const text = document.getElementById("edit-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    const data = await loadFromGoogleAppsScript();
    const excuses = data.excuses || defaultExcuses;
    const excuse = excuses.find(e => e.id === editingId);
    
    if (excuse) {
        excuse.text = text;
        
        // حفظ في Google Apps Script
        const saved = await saveToGoogleAppsScript(excuses);
        
        if (saved) {
            closeEditDialog();
            renderExcuses();
            showNotification("تم تعديل التعذر بنجاح وسيتم تزامنه مع جميع الأجهزة");
        } else {
            alert("تم تعديل التعذر محلياً، لكن قد يكون هناك تأخير في التزامن");
            closeEditDialog();
            renderExcuses();
        }
    }
}

// ============================================
// دوال حذف التعذرات
// ============================================

/**
 * حذف تعذر
 */
async function deleteExcuse(id) {
    if (confirm("هل أنت متأكد من حذف هذا التعذر؟")) {
        const data = await loadFromGoogleAppsScript();
        const excuses = (data.excuses || defaultExcuses).filter(e => e.id !== id);
        
        // حفظ في Google Apps Script
        const saved = await saveToGoogleAppsScript(excuses);
        
        if (saved) {
            renderExcuses();
            showNotification("تم حذف التعذر بنجاح وسيتم تزامنه مع جميع الأجهزة");
        } else {
            alert("تم حذف التعذر محلياً، لكن قد يكون هناك تأخير في التزامن");
            renderExcuses();
        }
    }
}

// ============================================
// دوال مساعدة
// ============================================

/**
 * تجنب XSS بتنظيف النصوص
 */
function escapeHtml(text) {
    const div = document.createElement(\'div\');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * إظهار إشعار للمستخدم
 */
function showNotification(message) {
    const notification = document.createElement(\'div\');
    notification.className = \'notification\';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = \'slideOut 0.3s ease\';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * إغلاق النوافذ عند الضغط خارجها
 */
document.addEventListener("click", function(event) {
    const modals = [
        { modal: document.getElementById("password-modal"), close: closePasswordDialog },
        { modal: document.getElementById("add-modal"), close: closeAddDialog },
        { modal: document.getElementById("edit-modal"), close: closeEditDialog }
    ];

    modals.forEach(({ modal, close }) => {
        if (event.target === modal) {
            close();
        }
    });
});

/**
 * إضافة أنماط الرسوم المتحركة
 */
const style = document.createElement(\'style\');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .excuse-item {
        transition: all 0.3s ease;
    }
    
    .excuse-item:hover {
        background-color: #f5f5f5;
    }
`;
document.head.appendChild(style);

/**
 * تحميل البيانات عند تحميل الصفحة
 */
document.addEventListener("DOMContentLoaded", async function() {
    await renderExcuses();
    
    // تحديث البيانات كل 5 ثوان للتزامن الفوري
    setInterval(async () => {
        if (!isUnlocked) {
            await renderExcuses();
        }
    }, 5000);
});

