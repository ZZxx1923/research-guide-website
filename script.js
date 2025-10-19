// ============================================
// نظام إدارة التعذرات التفاعلي المتقدم
// ============================================

const PASSWORD = "Emdad@2025";
const MAX_EXCUSES = 25;
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

// تحميل البيانات من localStorage
function loadExcuses() {
    const saved = localStorage.getItem("excuses");
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load excuses from localStorage");
            return defaultExcuses;
        }
    }
    return defaultExcuses;
}

// حفظ البيانات في localStorage
function saveExcuses(excuses) {
    localStorage.setItem("excuses", JSON.stringify(excuses));
}

// تحديث عرض التعذرات
function renderExcuses() {
    const excuses = loadExcuses();
    const list = document.getElementById("excuses-list");
    const countSpan = document.getElementById("count");
    const statusText = document.getElementById("status-text");
    
    list.innerHTML = "";
    countSpan.textContent = excuses.length;

    excuses.forEach((excuse) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="excuse-text">${escapeHtml(excuse.text)}</span>
            ${isUnlocked ? `
                <div class="excuse-actions">
                    <button class="edit-btn" onclick="openEditDialog('${excuse.id}', '${escapeHtml(excuse.text)}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExcuse('${excuse.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ""}
        `;
        list.appendChild(li);
    });

    // تحديث عرض زر الإضافة
    const addBtn = document.getElementById("add-btn");
    if (isUnlocked) {
        addBtn.style.display = "block";
    } else {
        addBtn.style.display = "none";
    }

    // تحديث حالة زر القفل
    const lockBtn = document.getElementById("lock-btn");
    if (isUnlocked) {
        lockBtn.classList.add("unlocked");
        lockBtn.innerHTML = '<i class="fas fa-unlock"></i>';
        statusText.textContent = "مفتوح";
        statusText.classList.add("unlocked");
    } else {
        lockBtn.classList.remove("unlocked");
        lockBtn.innerHTML = '<i class="fas fa-lock"></i>';
        statusText.textContent = "مقفول";
        statusText.classList.remove("unlocked");
    }
}

// دالة لتجنب XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// فتح نافذة كلمة السر
function togglePasswordDialog() {
    if (isUnlocked) {
        // إغلاق التعديل
        isUnlocked = false;
        renderExcuses();
    } else {
        // فتح نافذة كلمة السر
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

// فتح نافذة إضافة تعذر جديد
function openAddDialog() {
    const excuses = loadExcuses();
    if (excuses.length >= MAX_EXCUSES) {
        alert(`لا يمكن إضافة أكثر من ${MAX_EXCUSES} تعذر`);
        return;
    }
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

function addExcuse() {
    const text = document.getElementById("new-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    const excuses = loadExcuses();
    if (excuses.length >= MAX_EXCUSES) {
        alert(`لا يمكن إضافة أكثر من ${MAX_EXCUSES} تعذر`);
        return;
    }

    const newExcuse = {
        id: Date.now().toString(),
        text: text
    };

    excuses.push(newExcuse);
    saveExcuses(excuses);
    closeAddDialog();
    renderExcuses();
}

// فتح نافذة تعديل تعذر
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

function saveEditExcuse() {
    const text = document.getElementById("edit-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    const excuses = loadExcuses();
    const excuse = excuses.find(e => e.id === editingId);
    if (excuse) {
        excuse.text = text;
        saveExcuses(excuses);
        closeEditDialog();
        renderExcuses();
    }
}

// حذف تعذر
function deleteExcuse(id) {
    if (confirm("هل أنت متأكد من حذف هذا التعذر؟")) {
        const excuses = loadExcuses();
        const filtered = excuses.filter(e => e.id !== id);
        saveExcuses(filtered);
        renderExcuses();
    }
}

// إغلاق النوافذ عند الضغط على X أو خارج النافذة
document.addEventListener("click", function(event) {
    const passwordModal = document.getElementById("password-modal");
    const addModal = document.getElementById("add-modal");
    const editModal = document.getElementById("edit-modal");

    if (event.target === passwordModal) {
        closePasswordDialog();
    }
    if (event.target === addModal) {
        closeAddDialog();
    }
    if (event.target === editModal) {
        closeEditDialog();
    }
});

// فتح chatbot
function openChatbot() {
    window.open('https://chatgpt.com/g/g-67fa231bdeb88191a5c6e7909176dce2-lms-d-lftrdy-llbhth-ljtm-y', '_blank');
}

// تحميل التعذرات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    renderExcuses();
});

