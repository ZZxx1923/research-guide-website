// ⚙️ إعدادات التطبيق المحدثة للربط الكامل مع Google Sheets

// معرّف Google Sheets
const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

// رابط Google Apps Script Web App (تأكد من نشر السكريبت كـ Web App ومنح صلاحية الوصول للجميع Anyone)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_0k6aqf8gAMZK0-j1KrVK8aSaoIfw42ZEv_2KiC0Q7dFOerukg6WCqXWJBO4dI5qG9g/exec';

// ⚙️ إعدادات التطبيق العامة
const APP_CONFIG = {
    DAILY_TARGET: 10,
    COLORS: {
        success: '#00ff00',
        warning: '#ff0000',
        normal: '#ffff00',
        info: '#00d4ff'
    },
    STATUS: {
        ACHIEVED: 'محقق',
        TECHNICAL_ISSUE: 'مشكلة تقنية',
        NORMAL: 'عادي'
    }
};

// 📝 دالة للتحقق من صحة بيانات التقرير
function validateReportData(data) {
    const errors = [];
    
    if (!data.date) errors.push('التاريخ مطلوب');
    if (!data.researcherName) errors.push('اسم الباحث مطلوب');
    if (data.assignedVisits === undefined || parseInt(data.assignedVisits) < 0) errors.push('عدد الزيارات المسندة غير صحيح');
    if (data.completedVisits === undefined || parseInt(data.completedVisits) < 0) errors.push('عدد الزيارات المنفذة غير صحيح');
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// 💾 دالة لحفظ التقرير محلياً وإرساله لـ Google Sheets
async function saveReport(reportData) {
    // 1. حفظ محلي للنسخ الاحتياطي
    const reports = getAllReports();
    const newReport = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...reportData
    };
    
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    localStorage.setItem('lastResearcherName', reportData.researcherName);
    
    console.log('✅ تم حفظ التقرير محلياً');
    
    // 2. إرسال إلى Google Sheets
    if (GOOGLE_APPS_SCRIPT_URL && !GOOGLE_APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
        const success = await saveToGoogleSheets(newReport);
        return { report: newReport, synced: success };
    }
    
    return { report: newReport, synced: false };
}

// 📤 دالة لإرسال البيانات إلى Google Sheets
async function saveToGoogleSheets(reportData) {
    try {
        console.log('📤 جاري إرسال البيانات إلى Google Sheets...');
        
        // حساب النسبة المئوية قبل الإرسال لضمان دقتها
        const assigned = parseInt(reportData.assignedVisits) || 1;
        const completed = parseInt(reportData.completedVisits) || 0;
        reportData.completionRate = ((completed / assigned) * 100).toFixed(1) + '%';
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // مهم لتجنب مشاكل CORS مع Google Apps Script
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(reportData)
        });
        
        console.log('✅ تم إرسال الطلب إلى Google Sheets (no-cors mode)');
        return true;
    } catch (error) {
        console.error('❌ خطأ في الاتصال بـ Google Sheets:', error);
        return false;
    }
}

// 📥 دالة لجلب البيانات من Google Sheets (للمشرفين)
async function fetchFromGoogleSheets() {
    try {
        console.log('📥 جاري جلب البيانات من Google Sheets...');
        
        // إضافة timestamp لمنع الكاش (Cache Busting)
        const url = `${GOOGLE_APPS_SCRIPT_URL}?type=reports&t=${Date.now()}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data && data.success && Array.isArray(data.reports)) {
            console.log('✅ تم جلب البيانات بنجاح من Google Sheets:', data.reports.length, 'تقرير');
            // تخزين نسخة محلية محدثة للطوارئ
            localStorage.setItem('reports_backup', JSON.stringify(data.reports));
            return data.reports;
        }
        
        console.warn('⚠️ استجابة Google Sheets غير متوقعة:', data);
        return null;
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات من Google Sheets:', error);
        // محاولة استعادة النسخة الاحتياطية إذا فشل الجلب
        const backup = localStorage.getItem('reports_backup');
        if (backup) {
            console.log('ℹ️ تم استخدام النسخة الاحتياطية المزامنة مسبقاً');
            return JSON.parse(backup);
        }
        return null;
    }
}

// 📋 دالة لاسترجاع جميع التقارير من التخزين المحلي
function getAllReports() {
    try {
        const reportsJSON = localStorage.getItem('reports');
        return reportsJSON ? JSON.parse(reportsJSON) : [];
    } catch (error) {
        console.error('❌ خطأ في جلب التقارير المحلية:', error);
        return [];
    }
}

// 🔍 دالة لتصفية التقارير
function filterReports(reports, date = null, researcher = null) {
    return reports.filter(report => {
        const dateMatch = !date || report.date === date;
        const researcherMatch = !researcher || (report.researcherName && report.researcherName.toLowerCase().includes(researcher.toLowerCase()));
        
        return dateMatch && researcherMatch;
    });
}

// 📊 دالة لحساب الإحصائيات
function calculateStatistics(reports) {
    if (!reports || reports.length === 0) {
        return {
            totalReports: 0,
            totalAssignedVisits: 0,
            totalCompletedVisits: 0,
            completionRate: 0,
            successfulReports: 0,
            problemReports: 0
        };
    }
    
    const totalAssignedVisits = reports.reduce((sum, r) => sum + parseInt(r.assignedVisits || 0), 0);
    const totalCompletedVisits = reports.reduce((sum, r) => sum + parseInt(r.completedVisits || 0), 0);
    
    const successfulReports = reports.filter(r => {
        const assigned = parseInt(r.assignedVisits) || 1;
        const completed = parseInt(r.completedVisits) || 0;
        const rate = (completed / assigned) * 100;
        return rate >= 90 && parseInt(r.technicalIssues || 0) === 0;
    }).length;
    
    const problemReports = reports.filter(r => parseInt(r.technicalIssues || 0) > 0).length;
    const completionRate = totalAssignedVisits > 0 ? ((totalCompletedVisits / totalAssignedVisits) * 100).toFixed(1) : 0;
    
    return {
        totalReports: reports.length,
        totalAssignedVisits,
        totalCompletedVisits,
        completionRate,
        successfulReports,
        problemReports
    };
}

console.log('✅ تم تحديث إعدادات الربط بنجاح');
