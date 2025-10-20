// ============================================
// نظام إدارة التعذرات والـ PDF مع Google Apps Script
// ============================================

const PASSWORD = "Emdad@2025";
const MAX_EXCUSES = 25;
const MAX_PDFS = 25;

// استبدل هذا الرابط برابط Google Apps Script الفعلي الخاص بك
// Replace this with your actual Google Apps Script deployment URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyVAbJYJGQoMzGUSbqq0_9o-j77yEW3K89j7utmHzhw98zmTN9m4yNHhTFU3uygN91Ytw/exec";

let isUnlocked = false;
let isPdfUnlocked = false;
let editingId = null;
let editingPdfId = null;

// التعذرات الافتراضية
const defaultExcuses = [
    { id: "1", text: "تعذر خطأ نقي" },
    { id: "2", text: "تعذر مستقل مخالف لشروط الاستقلالية" },
    { id: "3", text: "تعذر صلة قرابة" },
    { id: "4", text: "تعذر الزيارة من قبل الباحث" },
    { id: "5", text: "تعذر البيانات المقدمة من المستفيد غير صحيحة" },
];

const defaultPdfs = [
    { id: "1", name: "أسباب التعذر والاجراءات والشرح_المحدث", url: "pdf/أسباب التعذر والاجراءات والشرح_المحدث.pdf" },
    { id: "2", name: "كيفية عمل الزيارة في وضع عدم الاتصال بالاترنت", url: "pdf/كيفية عمل الزيارة في وضع عدم الاتصال بالاترنت.pdf" },
];

// ============================================
// دوال Google Apps Script
// ============================================

async function callGoogleAppsScript(action, data = {}) {
    try {
        const payload = {
            action: action,
            password: data.password || "",
            ...data
        };
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("خطأ في الاتصال بـ Google Apps Script:", error);
        // Fallback to localStorage if API fails
        return { success: false, error: error.toString() };
    }
}

// تحميل البيانات من Google Apps Script
async function loadFromGoogleAppsScript() {
    try {
        const excusesResult = await callGoogleAppsScript("getExcuses");
        const pdfsResult = await callGoogleAppsScript("getPdfs");
        
        return {
            excuses: excusesResult.success ? excusesResult.data : defaultExcuses,
            pdfs: pdfsResult.success ? pdfsResult.data : defaultPdfs
        };
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        return { excuses: defaultExcuses, pdfs: defaultPdfs };
    }
}

// حفظ البيانات في localStorage كنسخة احتياطية
function saveToLocalStorage(excuses, pdfs) {
    localStorage.setItem("excuses", JSON.stringify(excuses));
    localStorage.setItem("pdfs", JSON.stringify(pdfs));
}

// تحميل البيانات من localStorage
function loadFromLocalStorage() {
    const excuses = localStorage.getItem("excuses");
    const pdfs = localStorage.getItem("pdfs");
    
    return {
        excuses: excuses ? JSON.parse(excuses) : defaultExcuses,
        pdfs: pdfs ? JSON.parse(pdfs) : defaultPdfs
    };
}

// ============================================
// دوال التعذرات
// ============================================

async function renderExcuses() {
    const data = await loadFromGoogleAppsScript();
    const excuses = data.excuses;
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

    const addBtn = document.getElementById("add-btn");
    if (isUnlocked) {
        addBtn.style.display = "block";
    } else {
        addBtn.style.display = "none";
    }

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

async function renderPdfs() {
    const data = await loadFromGoogleAppsScript();
    const pdfs = data.pdfs;
    const content = document.getElementById("pdf-content");
    const pdfLockBtn = document.getElementById("pdf-lock-btn");
    
    if (!content) return; // If PDF section doesn't exist, skip
    
    content.innerHTML = "";

    pdfs.forEach((pdf) => {
        const card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = `
            <div class="project-image">
                <img src="images/pdf-icon.png" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22%3EPDF%3C/text%3E%3C/svg%3E'" />
            </div>
            <div class="project-info">
                <strong class="project-title">
                    <span>${escapeHtml(pdf.name)}</span>
                    <div class="pdf-actions">
                        <a href="${pdf.url}" class="more-details" target="_blank">OPEN</a>
                        ${isPdfUnlocked ? `
                            <button class="edit-pdf-btn" onclick="openEditPdfDialog('${pdf.id}', '${escapeHtml(pdf.name)}', '${escapeHtml(pdf.url)}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-pdf-btn" onclick="deletePdf('${pdf.id}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ""}
                    </div>
                </strong>
            </div>
        `;
        content.appendChild(card);
    });

    const addPdfBtn = document.getElementById("add-pdf-btn");
    if (isPdfUnlocked && addPdfBtn) {
        addPdfBtn.style.display = "block";
        if (pdfLockBtn) pdfLockBtn.style.display = "flex";
    } else if (addPdfBtn) {
        addPdfBtn.style.display = "none";
        if (pdfLockBtn) pdfLockBtn.style.display = "none";
    }

    if (pdfLockBtn) {
        if (isPdfUnlocked) {
            pdfLockBtn.classList.add("unlocked");
            pdfLockBtn.innerHTML = '<i class="fas fa-unlock"></i>';
        } else {
            pdfLockBtn.classList.remove("unlocked");
            pdfLockBtn.innerHTML = '<i class="fas fa-lock"></i>';
        }
    }
}

// ============================================
// دوال التعذرات - Dialogs
// ============================================

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

async function addExcuse() {
    const text = document.getElementById("new-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    const data = await loadFromGoogleAppsScript();
    const excuses = data.excuses;

    if (excuses.length >= MAX_EXCUSES) {
        alert(`لا يمكن إضافة أكثر من ${MAX_EXCUSES} تعذر`);
        return;
    }

    // Call Google Apps Script to add excuse
    const result = await callGoogleAppsScript("addExcuse", {
        text: text,
        password: PASSWORD
    });

    if (result.success) {
        closeAddDialog();
        renderExcuses();
    } else {
        alert("خطأ في إضافة التعذر: " + (result.error || "حدث خطأ غير معروف"));
    }
}

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

async function saveEditExcuse() {
    const text = document.getElementById("edit-excuse-input").value.trim();
    if (!text) {
        alert("يرجى إدخال نص التعذر");
        return;
    }

    // Call Google Apps Script to update excuse
    const result = await callGoogleAppsScript("updateExcuse", {
        id: editingId,
        text: text,
        password: PASSWORD
    });

    if (result.success) {
        closeEditDialog();
        renderExcuses();
    } else {
        alert("خطأ في تعديل التعذر: " + (result.error || "حدث خطأ غير معروف"));
    }
}

async function deleteExcuse(id) {
    if (confirm("هل أنت متأكد من حذف هذا التعذر؟")) {
        // Call Google Apps Script to delete excuse
        const result = await callGoogleAppsScript("deleteExcuse", {
            id: id,
            password: PASSWORD
        });

        if (result.success) {
            renderExcuses();
        } else {
            alert("خطأ في حذف التعذر: " + (result.error || "حدث خطأ غير معروف"));
        }
    }
}

// ============================================
// دوال ملفات PDF - Dialogs
// ============================================

function togglePdfPasswordDialog() {
    if (isPdfUnlocked) {
        isPdfUnlocked = false;
        renderPdfs();
    } else {
        openPdfPasswordDialog();
    }
}

function openPdfPasswordDialog() {
    const modal = document.getElementById("pdf-password-modal");
    if (modal) {
        modal.style.display = "flex";
        const input = document.getElementById("pdf-password-input");
        if (input) {
            input.focus();
            input.value = "";
        }
    }
}

function closePdfPasswordDialog() {
    const modal = document.getElementById("pdf-password-modal");
    if (modal) {
        modal.style.display = "none";
    }
    const input = document.getElementById("pdf-password-input");
    if (input) {
        input.value = "";
    }
}

function handlePdfPasswordKeyPress(event) {
    if (event.key === "Enter") {
        checkPdfPassword();
    }
}

function checkPdfPassword() {
    const password = document.getElementById("pdf-password-input").value;
    if (password === PASSWORD) {
        isPdfUnlocked = true;
        closePdfPasswordDialog();
        renderPdfs();
    } else {
        alert("كلمة السر غير صحيحة!");
        document.getElementById("pdf-password-input").value = "";
        document.getElementById("pdf-password-input").focus();
    }
}

function openAddPdfDialog() {
    const modal = document.getElementById("add-pdf-modal");
    if (modal) {
        modal.style.display = "flex";
        const input = document.getElementById("pdf-name-input");
        if (input) {
            input.focus();
            input.value = "";
        }
        const urlInput = document.getElementById("pdf-url-input");
        if (urlInput) {
            urlInput.value = "";
        }
    }
}

function closeAddPdfDialog() {
    const modal = document.getElementById("add-pdf-modal");
    if (modal) {
        modal.style.display = "none";
    }
    const input = document.getElementById("pdf-name-input");
    if (input) {
        input.value = "";
    }
    const urlInput = document.getElementById("pdf-url-input");
    if (urlInput) {
        urlInput.value = "";
    }
}

function handleAddPdfKeyPress(event) {
    if (event.key === "Enter") {
        addPdf();
    }
}

async function addPdf() {
    const name = document.getElementById("pdf-name-input").value.trim();
    const url = document.getElementById("pdf-url-input").value.trim();

    if (!name || !url) {
        alert("يرجى إدخال اسم الملف والرابط");
        return;
    }

    const data = await loadFromGoogleAppsScript();
    const pdfs = data.pdfs;

    if (pdfs.length >= MAX_PDFS) {
        alert(`لا يمكن إضافة أكثر من ${MAX_PDFS} ملف`);
        return;
    }

    // Call Google Apps Script to add PDF
    const result = await callGoogleAppsScript("addPdf", {
        name: name,
        url: url,
        password: PASSWORD
    });

    if (result.success) {
        closeAddPdfDialog();
        renderPdfs();
    } else {
        alert("خطأ في إضافة الملف: " + (result.error || "حدث خطأ غير معروف"));
    }
}

function openEditPdfDialog(id, name, url) {
    editingPdfId = id;
    const modal = document.getElementById("edit-pdf-modal");
    if (modal) {
        modal.style.display = "flex";
        const nameInput = document.getElementById("edit-pdf-name-input");
        const urlInput = document.getElementById("edit-pdf-url-input");
        if (nameInput) {
            nameInput.value = name;
            nameInput.focus();
        }
        if (urlInput) {
            urlInput.value = url;
        }
    }
}

function closeEditPdfDialog() {
    const modal = document.getElementById("edit-pdf-modal");
    if (modal) {
        modal.style.display = "none";
    }
    const nameInput = document.getElementById("edit-pdf-name-input");
    if (nameInput) {
        nameInput.value = "";
    }
    const urlInput = document.getElementById("edit-pdf-url-input");
    if (urlInput) {
        urlInput.value = "";
    }
    editingPdfId = null;
}

function handleEditPdfKeyPress(event) {
    if (event.key === "Enter") {
        saveEditPdf();
    }
}

async function saveEditPdf() {
    const name = document.getElementById("edit-pdf-name-input").value.trim();
    const url = document.getElementById("edit-pdf-url-input").value.trim();

    if (!name || !url) {
        alert("يرجى إدخال اسم الملف والرابط");
        return;
    }

    // Call Google Apps Script to update PDF
    const result = await callGoogleAppsScript("updatePdf", {
        id: editingPdfId,
        name: name,
        url: url,
        password: PASSWORD
    });

    if (result.success) {
        closeEditPdfDialog();
        renderPdfs();
    } else {
        alert("خطأ في تعديل الملف: " + (result.error || "حدث خطأ غير معروف"));
    }
}

async function deletePdf(id) {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
        // Call Google Apps Script to delete PDF
        const result = await callGoogleAppsScript("deletePdf", {
            id: id,
            password: PASSWORD
        });

        if (result.success) {
            renderPdfs();
        } else {
            alert("خطأ في حذف الملف: " + (result.error || "حدث خطأ غير معروف"));
        }
    }
}

// ============================================
// دوال مساعدة
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openChatbot() {
    window.open('https://chatgpt.com/g/g-67fa231bdeb88191a5c6e7909176dce2-lms-d-lftrdy-llbhth-ljtm-y', '_blank');
}

// إغلاق النوافذ عند الضغط خارجها
document.addEventListener("click", function(event) {
    const modals = [
        { modal: document.getElementById("password-modal"), close: closePasswordDialog },
        { modal: document.getElementById("add-modal"), close: closeAddDialog },
        { modal: document.getElementById("edit-modal"), close: closeEditDialog },
        { modal: document.getElementById("pdf-password-modal"), close: closePdfPasswordDialog },
        { modal: document.getElementById("add-pdf-modal"), close: closeAddPdfDialog },
        { modal: document.getElementById("edit-pdf-modal"), close: closeEditPdfDialog }
    ];

    modals.forEach(({ modal, close }) => {
        if (modal && event.target === modal) {
            close();
        }
    });
});

// تحميل البيانات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async function() {
    await renderExcuses();
    await renderPdfs();
    
    // تحديث البيانات كل 5 ثوان للتزامن الفوري
    setInterval(async () => {
        if (!isUnlocked && !isPdfUnlocked) {
            await renderExcuses();
            await renderPdfs();
        }
    }, 5000);
});

