const ADMIN_PASSWORD = "Oxd2003"; // كلمة سر افتراضية
let currentEditingRow = null; // لتتبع الصف الذي يتم تعديله
let isAdminAuthenticated = false; // لتتبع حالة المشرف
let pendingAction = null; // لتخزين الإجراء المعلق
let pendingData = null; // لتخزين البيانات المعلقة

// ============ دوال التحقق من كلمة السر ============

function checkAdminStatus() {
    // التحقق من حالة المشرف من sessionStorage
    const adminStatus = sessionStorage.getItem('adminAuthenticated');
    isAdminAuthenticated = adminStatus === 'true';
    return isAdminAuthenticated;
}

function setAdminStatus(status) {
    // حفظ حالة المشرف في sessionStorage
    sessionStorage.setItem('adminAuthenticated', status ? 'true' : 'false');
    isAdminAuthenticated = status;
}

function openPasswordModal(action, data = null) {
    // إذا كان المشرف مصرح به بالفعل، قم بتنفيذ الإجراء مباشرة
    if (isAdminAuthenticated) {
        executeAction(action, data);
        return;
    }

    // حفظ الإجراء والبيانات المعلقة
    pendingAction = action;
    pendingData = data;

    // إظهار نافذة كلمة السر
    const modal = document.getElementById('password-modal');
    modal.style.display = 'flex';
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
}

function closePasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.style.display = 'none';
    pendingAction = null;
    pendingData = null;
}

function handlePasswordKeyPress(event) {
    if (event.key === 'Enter') {
        confirmPassword();
    }
}

function confirmPassword() {
    const password = document.getElementById('password-input').value;
    if (password === ADMIN_PASSWORD) {
        setAdminStatus(true); // حفظ حالة المشرف
        closePasswordModal();
        
        // تنفيذ الإجراء المعلق
        if (pendingAction) {
            executeAction(pendingAction, pendingData);
            pendingAction = null;
            pendingData = null;
        }
    } else {
        alert('كلمة السر غير صحيحة. الرجاء المحاولة مرة أخرى.');
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

function executeAction(action, data) {
    if (action === 'add') {
        performAddExcuse();
    } else if (action === 'edit') {
        performEditExcuse();
    } else if (action === 'delete') {
        performDeleteExcuse(data);
    } else if (action === 'showSettings') {
        showSettings();
    } else if (action === 'testAndSave') {
        testAndSaveAppScript();
    }
}

// ============ دوال حفظ وتحميل الرابط ============
function saveAppScriptUrl() {
    const url = document.getElementById('appScriptUrl').value.trim();
    const sheetUrl = document.getElementById('sheetUrl').value;
    const sheetName = document.getElementById('sheetName').value;
    
    localStorage.setItem('appScriptUrl', url);
    localStorage.setItem('sheetUrl', sheetUrl);
    localStorage.setItem('sheetName', sheetName);
}

function loadSavedAppScriptUrl() {
    const savedUrl = localStorage.getItem('appScriptUrl');
    // تثبيت رابط Sheet الجديد
    const savedSheetUrl = 'https://docs.google.com/spreadsheets/d/1mw5z6UWdk3GZHiprpr6-oFSVTAje3bE8KADSf3SMnaM/edit';
    const savedSheetName = localStorage.getItem('sheetName');
    
    if (savedUrl) {
        document.getElementById('appScriptUrl').value = savedUrl;
    }
    document.getElementById('sheetUrl').value = savedSheetUrl; // تعيين الرابط المثبت
    
    if (savedSheetName) {
        document.getElementById('sheetName').value = savedSheetName;
    }
}

// ============ دوال اختبار الاتصال ============

async function testAndSaveAppScript() {
    // يجب أن يطلب كلمة السر أولاً
    if (!isAdminAuthenticated) {
        openPasswordModal('testAndSave');
        return;
    }
    
    const url = document.getElementById('appScriptUrl').value.trim();
    const statusDiv = document.getElementById('connection-status');
    
    if (!url) {
        statusDiv.innerHTML = '<div class="status-message status-error"><i class="fas fa-times-circle"></i> الرجاء إدخال رابط Google App Script</div>';
        return;
    }
    
    if (!url.includes('/exec')) {
        statusDiv.innerHTML = '<div class="status-message status-error"><i class="fas fa-times-circle"></i> الرابط غير صحيح. يجب أن ينتهي بـ /exec</div>';
        return;
    }
    
    statusDiv.innerHTML = '<div class="status-message status-info"><i class="fas fa-spinner fa-spin"></i> جاري اختبار الاتصال...</div>';
    
    try {
        const testUrl = url + '?action=testConnection';
        const response = await fetch(testUrl, { method: 'GET' });
        
        if (response.ok) {
            const result = await response.json();
            if (result && result.status === 'success' && result.message === 'Connection successful') {
                saveAppScriptUrl();
                statusDiv.innerHTML = '<div class="status-message status-success"><i class="fas fa-check-circle"></i> تم اختبار الاتصال بنجاح! تم حفظ الإعدادات.</div>';
                // تحديث البيانات في الصفحة
                loadExcusesFromSheet();
            } else {
                statusDiv.innerHTML = '<div class="status-message status-error"><i class="fas fa-times-circle"></i> فشل اختبار الاتصال. تأكد من نشر السكربت بشكل صحيح.</div>';
            }
        } else {
            statusDiv.innerHTML = '<div class="status-message status-error"><i class="fas fa-times-circle"></i> فشل الاتصال. رمز الحالة: ' + response.status + '</div>';
        }
    } catch (error) {
        console.error('خطأ في اختبار الاتصال:', error);
        statusDiv.innerHTML = '<div class="status-message status-error"><i class="fas fa-times-circle"></i> حدث خطأ أثناء الاتصال. تحقق من الرابط والإنترنت.</div>';
    }
}

// ============ دوال جلب التعذرات ============

async function loadExcusesFromSheet() {
    const appScriptUrl = localStorage.getItem('appScriptUrl');
    const sheetName = localStorage.getItem('sheetName') || 'الورقة1';
    
    if (!appScriptUrl) {
        console.log('لا يوجد رابط Google App Script محفوظ.');
        document.getElementById('excuses-list').innerHTML = '<div class="no-excuses"><i class="fas fa-exclamation-triangle"></i><br>لم يتم ربط Google App Script بعد</div>';
        return;
    }
    
    try {
        const url = appScriptUrl + '?action=getExcuses&sheetName=' + encodeURIComponent(sheetName);
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('البيانات المستقبلة من Code.gs:', result);
        
        if (result.status === 'success') {
            const excuses = result.data;
            console.log('عدد التعذرات:', excuses.length);
            
            displayExcuses(excuses);
            localStorage.setItem('adminExcuses', JSON.stringify(excuses));
            console.log('تم تحديث البيانات بنجاح من Google App Script');
        } else {
            console.error('خطأ في جلب البيانات:', result.message);
            document.getElementById('excuses-list').innerHTML = '<div class="no-excuses"><i class="fas fa-exclamation-triangle"></i><br>خطأ في جلب البيانات: ' + result.message + '</div>';
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        document.getElementById('excuses-list').innerHTML = '<div class="no-excuses"><i class="fas fa-exclamation-triangle"></i><br>حدث خطأ أثناء تحميل البيانات</div>';
    }
}

// ============ دوال عرض التعذرات ============

function displayExcuses(excuses) {
    const excusesList = document.getElementById('excuses-list');
    
    if (!excuses || excuses.length === 0) {
        excusesList.innerHTML = '<div class="no-excuses"><i class="fas fa-inbox"></i><br>لا توجد تعذرات حالياً</div>';
        return;
    }
    
    excusesList.innerHTML = '';
    excuses.forEach((excuse, index) => {
        if (excuse.text && excuse.text.trim()) {
            const excuseItem = document.createElement('div');
            excuseItem.className = 'excuse-item';
            excuseItem.innerHTML = `
                <span class="excuse-text">${escapeHtml(excuse.text)}</span>
                <div class="excuse-actions">
                    <button class="btn-edit" onclick="openEditExcuseModal(${index + 2}, '${escapeHtml(excuse.text).replace(/'/g, "\\'")}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn-delete" onclick="requestDeleteExcuse(${index + 2})">
                        <i class="fas fa-trash-alt"></i> حذف
                    </button>
                </div>
            `;
            excusesList.appendChild(excuseItem);
        }
    });
}

// دالة لتجنب XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ دوال نوافذ التعديل والإضافة ============

function openAddExcuseModal() {
    // يجب أن يكون المشرف مصرح به بالفعل للوصول إلى هذه الدالة
    if (!isAdminAuthenticated) {
        // لا تفتح openPasswordModal هنا، بل يجب أن يكون الزر نفسه يطلب كلمة السر
        alert('الرجاء إدخال كلمة السر أولاً لإدارة التعذرات.');
        return;
    }
    
    currentEditingRow = null;
    document.getElementById('excuse-modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> إضافة تعذر جديد';
    document.getElementById('excuse-input').value = '';
    document.getElementById('excuse-modal').style.display = 'flex';
    document.getElementById('excuse-input').focus();
}

function openEditExcuseModal(row, text) {
    // يجب أن يكون المشرف مصرح به بالفعل للوصول إلى هذه الدالة
    if (!isAdminAuthenticated) {
        // لا تفتح openPasswordModal هنا، بل يجب أن يكون الزر نفسه يطلب كلمة السر
        alert('الرجاء إدخال كلمة السر أولاً لإدارة التعذرات.');
        return;
    }
    
    currentEditingRow = row;
    document.getElementById('excuse-modal-title').innerHTML = '<i class="fas fa-edit"></i> تعديل التعذر';
    document.getElementById('excuse-input').value = text;
    document.getElementById('excuse-modal').style.display = 'flex';
    document.getElementById('excuse-input').focus();
}

function closeExcuseModal() {
    document.getElementById('excuse-modal').style.display = 'none';
    currentEditingRow = null;
}

// ============ دوال الإضافة والتعديل والحذف ============

function saveExcuse() {
    const text = document.getElementById('excuse-input').value.trim();
    
    if (!text) {
        alert('الرجاء إدخال نص التعذر');
        return;
    }
    
    // إغلاق نافذة التعذر أولاً
    closeExcuseModal();
    
    // تنفيذ الإجراء مباشرة لأننا نعتمد على التحقق المسبق في openAddExcuseModal/openEditExcuseModal
    // ولكن لضمان الأمان، سنقوم بطلب كلمة السر إذا لم يكن مصرح به
    if (!isAdminAuthenticated) {
        // في هذه الحالة، يجب أن يكون الإجراء المعلق هو 'add' أو 'edit'
        openPasswordModal(currentEditingRow === null ? 'add' : 'edit');
    } else {
        executeAction(currentEditingRow === null ? 'add' : 'edit');
    }
}

async function performAddExcuse() {
    const text = document.getElementById('excuse-input').value.trim();
    const appScriptUrl = localStorage.getItem('appScriptUrl');
    
    if (!appScriptUrl) {
        alert('لم يتم ربط Google App Script بعد');
        return;
    }
    
    try {
        // استخدام FormData لإرسال البيانات كـ POST
        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('field1', text);
        
        const response = await fetch(appScriptUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('✅ ' + result.message);
            loadExcusesFromSheet(); // إعادة تحميل البيانات
        } else {
            alert('❌ خطأ: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في حفظ التعذر:', error);
        alert('❌ حدث خطأ أثناء حفظ التعذر');
    }
}

async function performEditExcuse() {
    const text = document.getElementById('excuse-input').value.trim();
    const appScriptUrl = localStorage.getItem('appScriptUrl');
    
    if (!appScriptUrl) {
        alert('لم يتم ربط Google App Script بعد');
        return;
    }
    
    try {
        // استخدام FormData لإرسال البيانات كـ POST
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('row', currentEditingRow);
        formData.append('field1', text);
        
        const response = await fetch(appScriptUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('✅ ' + result.message);
            loadExcusesFromSheet(); // إعادة تحميل البيانات
        } else {
            alert('❌ خطأ: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في تعديل التعذر:', error);
        alert('❌ حدث خطأ أثناء تعديل التعذر');
    }
}

function requestDeleteExcuse(row) {
    if (!confirm('هل أنت متأكد من حذف هذا التعذر؟')) {
        return;
    }
    
    // طلب كلمة السر قبل الحذف (إذا لم يكن مصرح بالفعل)
    if (!isAdminAuthenticated) {
        openPasswordModal('delete', row);
    } else {
        performDeleteExcuse(row);
    }
}

async function performDeleteExcuse(row) {
    const appScriptUrl = localStorage.getItem('appScriptUrl');
    
    if (!appScriptUrl) {
        alert('لم يتم ربط Google App Script بعد');
        return;
    }
    
    try {
        // استخدام FormData لإرسال البيانات كـ POST
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('row', row);
        
        const response = await fetch(appScriptUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('✅ ' + result.message);
            loadExcusesFromSheet(); // إعادة تحميل البيانات
        } else {
            alert('❌ خطأ: ' + result.message);
        }
    } catch (error) {
        console.error('خطأ في حذف التعذر:', error);
        alert('❌ حدث خطأ أثناء حذف التعذر');
    }
}

// ============ دوال إظهار وإخفاء الإعدادات ============

function showSettings() {
    document.getElementById('settings-content').style.display = 'block';
    document.getElementById('password-prompt').style.display = 'none';
    loadSavedAppScriptUrl(); // تحميل الرابط المحفوظ
    loadExcusesFromSheet(); // تحميل التعذرات
}

function hideSettings() {
    document.getElementById('settings-content').style.display = 'none';
    document.getElementById('password-prompt').style.display = 'flex';
}

// ============ تهيئة الصفحة ============

document.addEventListener('DOMContentLoaded', () => {
    checkAdminStatus(); // التحقق من حالة المشرف
    
    // إذا كان مصرح به، أظهر الإعدادات مباشرة
    if (isAdminAuthenticated) {
        showSettings();
    } else {
            hideSettings();
    }
});
