// ⚙️ إعدادات التطبيق

// معرّف Google Sheets
const SPREADSHEET_ID = '1op4xbVAqVUEfcrY301PXk3kyDNllP47fF1bGhPkAywE';

// رابط Google Apps Script Web App
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaNSSVrb5qcR4U_3RMfiicZsIxYkwX79X0XHruvnxqNmlplU6RjsBfVkqV3LnT6S-aGQ/exec';

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
    if (!data.assignedVisits || parseInt(data.assignedVisits) < 0) errors.push('عدد الزيارات المسندة غير صحيح');
    if (!data.completedVisits || parseInt(data.completedVisits) < 0) errors.push('عدد الزيارات المنفذة غير صحيح');
    if (parseInt(data.completedVisits) > parseInt(data.assignedVisits)) errors.push('الزيارات المنفذة لا يمكن أن تكون أكثر من المسندة');
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// 💾 دالة لحفظ التقرير
function saveReport(reportData) {
    const reports = getAllReports();
    
    const newReport = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...reportData
    };
    
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    
    console.log('✅ تم حفظ التقرير بنجاح');
    
    // محاولة الحفظ إلى Google Sheets
    if (GOOGLE_APPS_SCRIPT_URL && !GOOGLE_APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
        saveToGoogleSheets(newReport);
    }
    
    return newReport;
}

// 📤 دالة لحفظ التقرير في Google Sheets
async function saveToGoogleSheets(reportData) {
    try {
        console.log('📤 جاري حفظ التقرير في Google Sheets...');
        
        // استخدام fetch مع mode: 'no-cors' لتجنب CORB
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(reportData)
        });
        
        console.log('✅ تم إرسال التقرير إلى Google Sheets');
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ التقرير في Google Sheets:', error);
        return false;
    }
}

// 📋 دالة لاسترجاع جميع التقارير
function getAllReports() {
    try {
        const reportsJSON = localStorage.getItem('reports');
        return reportsJSON ? JSON.parse(reportsJSON) : [];
    } catch (error) {
        console.error('❌ خطأ في جلب التقارير:', error);
        return [];
    }
}

// 🔍 دالة لتصفية التقارير
function filterReports(date = null, researcher = null) {
    const reports = getAllReports();
    
    return reports.filter(report => {
        const dateMatch = !date || report.date === date;
        const researcherMatch = !researcher || report.researcherName.toLowerCase().includes(researcher.toLowerCase());
        
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
        const rate = (parseInt(r.completedVisits || 0) / parseInt(r.assignedVisits || 1)) * 100;
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

// 📆 دالة للحصول على اسم اليوم
function getDayName(dateString) {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

// 💾 دالة لحفظ البيانات في localStorage
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
        return false;
    }
}

// 📥 دالة لجلب البيانات من localStorage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات:', error);
        return null;
    }
}

// 🗑️ دالة لحذف البيانات من localStorage
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف البيانات:', error);
        return false;
    }
}

// 🎯 دالة لتحديد حالة الأداء
function getPerformanceStatus(completedVisits, technicalIssues) {
    if (technicalIssues > 0) {
        return {
            status: 'مشكلة تقنية',
            color: '#ff0000',
            icon: '❌'
        };
    }
    
    if (completedVisits >= APP_CONFIG.DAILY_TARGET) {
        return {
            status: 'محقق',
            color: '#00ff00',
            icon: '✅'
        };
    }
    
    return {
        status: 'عادي',
        color: '#ffff00',
        icon: '⚠️'
    };
}

console.log('✅ تم تحميل إعدادات التطبيق بنجاح');
