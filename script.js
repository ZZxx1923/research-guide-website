// ============================================
// نظام إدارة التعذرات والـ PDF مع Google Sheets
// ============================================

const PASSWORD = "Emdad@2025";
const MAX_EXCUSES = 25;
const MAX_PDFS = 25;

// Google Sheets Configuration
const SHEET_ID = "1qK29NCrGAFiPaqyab0ytyk8trUoBc66oNMUVShzy4z0";
const API_KEY = "AIzaSyDxT8Z8vZ8Z8vZ8Z8vZ8Z8vZ8Z8vZ8Z8vZ8"; // سيتم استخدام Sheets API
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;

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
// دوال Google Sheets
// ============================================

// تحميل البيانات من Google Sheets
async function loadFromGoogleSheets() {
    try {
        const response = await fetch(`${SHEET_URL}?tqx=out:json`);
        const text = await response.text();
        
        // معالجة الرد من Google Sheets
        const jsonStart = text.indexOf('{');
        const json = JSON.parse(text.substring(jsonStart));
        
        if (!json.table || !json.table.rows) {
            return { excuses: defaultExcuses, pdfs: defaultPdfs };
        }

        let excuses = defaultExcuses;
        let pdfs = defaultPdfs;

        // معالجة الصفوف
        for (let row of json.table.rows) {
            if (row.c && row.c.length >= 2) {
                const type = row.c[0]?.v || "";
                const data = row.c[1]?.v || "";

                try {
                    if (type === "excuses" && data) {
                        excuses = JSON.parse(data);
                    } else if (type === "pdfs" && data) {
                        pdfs = JSON.parse(data);
                    }
                } catch (e) {
                    console.error("خطأ في تحليل البيانات:", e);
                }
            }
        }

        return { excuses, pdfs };
    } catch (error) {
        console.error("خطأ في تحميل البيانات من Google Sheets:", error);
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
    const data = await loadFromGoogleSheets();
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
    const data = await loadFromGoogleSheets();
    const pdfs = data.pdfs;
    const content = document.getElementById("pdf-content");
    const pdfLockBtn = document.getElementById("pdf-lock-btn");
    
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
    if (isPdfUnlocked) {
        addPdfBtn.style.display = "block";
        pdfLockBtn.style.display = "flex";
    } else {
        addPdfBtn.style.display = "none";
        pdfLockBtn.style.display = "none";
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

    const data = await loadFromGoogleSheets();
    const excuses = data.excuses;

    if (excuses.length >= MAX_EXCUSES) {
        alert(`لا يمكن إضافة أكثر من ${MAX_EXCUSES} تعذر`);
        return;
    }

    const newExcuse = {
        id: Date.now().toString(),
        text: text
    };

    excuses.push(newExcuse);
    saveToLocalStorage(excuses, data.pdfs);
    closeAddDialog();
    renderExcuses();
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

    const data = await loadFromGoogleSheets();
    const excuses = data.excuses;
    const excuse = excuses.find(e => e.id === editingId);
    
    if (excuse) {
        excuse.text = text;
        saveToLocalStorage(excuses, data.pdfs);
        closeEditDialog();
        renderExcuses();
    }
}

async function deleteExcuse(id) {
    if (confirm("هل أنت متأكد من حذف هذا التعذر؟")) {
        const data = await loadFromGoogleSheets();
        const excuses = data.excuses.filter(e => e.id !== id);
        saveToLocalStorage(excuses, data.pdfs);
        renderExcuses();
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
    document.getElementById("pdf-password-modal").style.display = "flex";
    document.getElementById("pdf-password-input").focus();
    document.getElementById("pdf-password-input").value = "";
}

function closePdfPasswordDialog() {
    document.getElementById("pdf-password-modal").style.display = "none";
    document.getElementById("pdf-password-input").value = "";
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
    document.getElementById("add-pdf-modal").style.display = "flex";
    document.getElementById("pdf-name-input").focus();
    document.getElementById("pdf-name-input").value = "";
    document.getElementById("pdf-url-input").value = "";
}

function closeAddPdfDialog() {
    document.getElementById("add-pdf-modal").style.display = "none";
    document.getElementById("pdf-name-input").value = "";
    document.getElementById("pdf-url-input").value = "";
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

    const data = await loadFromGoogleSheets();
    const pdfs = data.pdfs;

    if (pdfs.length >= MAX_PDFS) {
        alert(`لا يمكن إضافة أكثر من ${MAX_PDFS} ملف`);
        return;
    }

    const newPdf = {
        id: Date.now().toString(),
        name: name,
        url: url
    };

    pdfs.push(newPdf);
    saveToLocalStorage(data.excuses, pdfs);
    closeAddPdfDialog();
    renderPdfs();
}

function openEditPdfDialog(id, name, url) {
    editingPdfId = id;
    document.getElementById("edit-pdf-modal").style.display = "flex";
    document.getElementById("edit-pdf-name-input").value = name;
    document.getElementById("edit-pdf-url-input").value = url;
    document.getElementById("edit-pdf-name-input").focus();
}

function closeEditPdfDialog() {
    document.getElementById("edit-pdf-modal").style.display = "none";
    document.getElementById("edit-pdf-name-input").value = "";
    document.getElementById("edit-pdf-url-input").value = "";
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

    const data = await loadFromGoogleSheets();
    const pdfs = data.pdfs;
    const pdf = pdfs.find(p => p.id === editingPdfId);

    if (pdf) {
        pdf.name = name;
        pdf.url = url;
        saveToLocalStorage(data.excuses, pdfs);
        closeEditPdfDialog();
        renderPdfs();
    }
}

async function deletePdf(id) {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
        const data = await loadFromGoogleSheets();
        const pdfs = data.pdfs.filter(p => p.id !== id);
        saveToLocalStorage(data.excuses, pdfs);
        renderPdfs();
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
        if (event.target === modal) {
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

