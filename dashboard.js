// 📊 معالجة لوحة المشرفين

// متغيرات عامة
let allReports = [];
let filteredReports = [];
let chart = null;

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 تم تحميل لوحة المشرفين');
    
    // تحميل البيانات
    loadReports();
    
    // إضافة مستمعين للأزرار
    const applyBtn = document.querySelector('[onclick="applyFilters()"]');
    const clearBtn = document.querySelector('[onclick="clearFilters()"]');
    const refreshBtn = document.querySelector('[onclick="loadReports()"]');
    
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (refreshBtn) refreshBtn.addEventListener('click', loadReports);
});

// 📥 دالة لتحميل التقارير (من Google Sheets أولاً ثم محلياً)
async function loadReports() {
    console.log('📥 جاري تحميل التقارير...');
    
    // إخفاء رسالة الخطأ
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    
    // عرض رسالة التحميل
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) {
        loadingMsg.style.display = 'block';
        loadingMsg.innerHTML = '<i class="fas fa-sync fa-spin"></i> جاري جلب البيانات من Google Sheets...';
    }
    
    try {
        // 1. محاولة جلب البيانات من Google Sheets
        let reportsFromSheets = await fetchFromGoogleSheets();
        
        if (reportsFromSheets && reportsFromSheets.length > 0) {
            allReports = reportsFromSheets;
            console.log('✅ تم جلب البيانات من Google Sheets:', allReports.length);
        } else {
            // 2. إذا فشل أو كان فارغاً، نستخدم البيانات المحلية
            allReports = getAllReports();
            console.log('⚠️ تم استخدام البيانات المحلية:', allReports.length);
        }
        
        filteredReports = allReports;
        
        // إخفاء رسالة التحميل
        if (loadingMsg) loadingMsg.style.display = 'none';
        
        // عرض الإحصائيات
        displayStatistics();
        
        // عرض الجدول
        displayReportsTable();
        
        // عرض الرسم البياني
        displayChart();
        
    } catch (error) {
        console.error('❌ خطأ في تحميل التقارير:', error);
        if (errorMsg) {
            errorMsg.textContent = 'حدث خطأ في تحميل البيانات. تأكد من اتصالك بالإنترنت.';
            errorMsg.style.display = 'block';
        }
        
        // محاولة أخيرة باستخدام البيانات المحلية في حالة الخطأ
        allReports = getAllReports();
        filteredReports = allReports;
        displayStatistics();
        displayReportsTable();
        displayChart();
    }
}

// 🎯 دالة لعرض الإحصائيات
function displayStatistics() {
    const stats = calculateStatistics(filteredReports);
    const container = document.getElementById('statsCards');
    
    if (!container) return;
    
    const statsHTML = `
        <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
                <div class="stat-label">إجمالي التقارير</div>
                <div class="stat-value">${stats.totalReports}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
                <div class="stat-label">الزيارات المنفذة</div>
                <div class="stat-value">${stats.totalCompletedVisits}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
                <div class="stat-label">نسبة الإنجاز</div>
                <div class="stat-value">${stats.completionRate}%</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
                <div class="stat-label">التقارير الناجحة</div>
                <div class="stat-value">${stats.successfulReports}</div>
            </div>
        </div>
    `;
    
    container.innerHTML = statsHTML;
    console.log('✅ تم عرض الإحصائيات');
}

// 📋 دالة لعرض جدول التقارير
function displayReportsTable() {
    const tableContainer = document.getElementById('reportsTable');
    
    if (!tableContainer) return;
    
    if (filteredReports.length === 0) {
        tableContainer.innerHTML = '<div class="empty-state">لا توجد تقارير</div>';
        return;
    }
    
    let tableHTML = '<div class="table-wrapper"><table class="reports-table">';
    
    // رؤوس الجدول
    tableHTML += `
        <thead>
            <tr>
                <th>التاريخ</th>
                <th>الباحث</th>
                <th>المسندة</th>
                <th>المنفذة</th>
                <th>النسبة</th>
                <th>المشاكل</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // صفوف البيانات
    filteredReports.forEach(report => {
        const completionRate = ((parseInt(report.completedVisits) / parseInt(report.assignedVisits)) * 100).toFixed(0);
        const status = getReportStatus(report);
        
        tableHTML += `
            <tr class="report-row">
                <td>${report.date}</td>
                <td>${report.researcherName}</td>
                <td>${report.assignedVisits}</td>
                <td>${report.completedVisits}</td>
                <td>${completionRate}%</td>
                <td>
                    <span class="technical-issues ${parseInt(report.technicalIssues) > 0 ? 'has-issues' : ''}">
                        ${parseInt(report.technicalIssues) > 0 ? '❌' : '✅'}
                    </span>
                </td>
                <td>
                    <span class="status-badge" style="background-color: ${status.color}">
                        ${status.label}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table></div>';
    
    tableContainer.innerHTML = tableHTML;
    console.log('✅ تم عرض جدول التقارير');
}

// 📊 دالة لعرض الرسم البياني
function displayChart() {
    const canvas = document.getElementById('performanceChart');
    
    if (!canvas) return;
    
    // تحضير البيانات
    const researchers = {};
    filteredReports.forEach(report => {
        if (!researchers[report.researcherName]) {
            researchers[report.researcherName] = {
                completed: 0,
                assigned: 0,
                technicalIssues: 0
            };
        }
        researchers[report.researcherName].completed += parseInt(report.completedVisits);
        researchers[report.researcherName].assigned += parseInt(report.assignedVisits);
        researchers[report.researcherName].technicalIssues += parseInt(report.technicalIssues);
    });
    
    const labels = Object.keys(researchers);
    const completedData = labels.map(name => researchers[name].completed);
    const assignedData = labels.map(name => researchers[name].assigned);
    
    // إزالة الرسم البياني القديم
    if (chart) {
        chart.destroy();
    }
    
    // إنشاء رسم بياني جديد
    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'الزيارات المنفذة',
                    data: completedData,
                    backgroundColor: '#00ff00',
                    borderColor: '#00ff00',
                    borderWidth: 2
                },
                {
                    label: 'الزيارات المسندة',
                    data: assignedData,
                    backgroundColor: '#00d4ff',
                    borderColor: '#00d4ff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#00d4ff',
                        font: {
                            size: 12,
                            family: "'Arial', sans-serif"
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#00d4ff'
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#00d4ff'
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    console.log('✅ تم عرض الرسم البياني');
}

// 🔍 دالة لتطبيق التصفية
function applyFilters() {
    const dateInput = document.getElementById('filterDate');
    const researcherInput = document.getElementById('filterResearcher');
    
    const date = dateInput ? dateInput.value : null;
    const researcher = researcherInput ? researcherInput.value : null;
    
    console.log('🔍 تطبيق التصفية - التاريخ:', date, 'الباحث:', researcher);
    
    filteredReports = filterReports(allReports, date, researcher);
    
    // تحديث العرض
    displayStatistics();
    displayReportsTable();
    displayChart();
    
    console.log('✅ تم تطبيق التصفية. النتائج:', filteredReports.length);
}

// 🔄 دالة لإعادة تعيين التصفية
function clearFilters() {
    const dateInput = document.getElementById('filterDate');
    const researcherInput = document.getElementById('filterResearcher');
    
    if (dateInput) dateInput.value = '';
    if (researcherInput) researcherInput.value = '';
    
    filteredReports = allReports;
    
    // تحديث العرض
    displayStatistics();
    displayReportsTable();
    displayChart();
    
    console.log('✅ تم إعادة تعيين التصفية');
}

// 🎯 دالة لتحديد حالة التقرير
function getReportStatus(reportData) {
    const completionRate = (parseInt(reportData.completedVisits) / parseInt(reportData.assignedVisits)) * 100;
    
    if (parseInt(reportData.technicalIssues) > 0) {
        return {
            status: 'warning',
            label: 'مشكلة ❌',
            color: '#ff0000',
            icon: '❌'
        };
    }
    
    if (completionRate >= 90) {
        return {
            status: 'success',
            label: 'محقق',
            color: '#00ff00',
            icon: '✅'
        };
    }
    
    return {
        status: 'normal',
        label: 'عادي',
        color: '#ffff00',
        icon: '⚠️'
    };
}

// 📥 دالة لتصدير البيانات
function exportReports() {
    const reports = filteredReports.length > 0 ? filteredReports : allReports;
    
    if (reports.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }
    
    // إنشاء رؤوس الأعمدة
    const headers = [
        'التاريخ',
        'اليوم',
        'اسم الباحث',
        'الزيارات المسندة',
        'الزيارات المنفذة',
        'التعذرات',
        'المتبقية',
        'المؤجلة',
        'المشاكل التقنية',
        'خارج النطاق',
        'الملاحظات'
    ];
    
    // إنشاء صفوف البيانات
    const rows = reports.map(r => [
        r.date,
        r.day,
        r.researcherName,
        r.assignedVisits,
        r.completedVisits,
        r.excuses,
        r.remainingVisits,
        r.postponedVisits,
        r.technicalIssues,
        r.outOfScope,
        r.notes
    ]);
    
    // إنشاء محتوى CSV
    let csvContent = '\uFEFF'; // BOM
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // تحميل الملف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `التقارير_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📥 تم تصدير', reports.length, 'تقرير');
}

// 🔄 دالة للتحديث التلقائي
function setupAutoRefresh(interval = 30000) {
    setInterval(() => {
        console.log('🔄 تحديث تلقائي للبيانات...');
        loadReports();
    }, interval);
}

// بدء التحديث التلقائي كل 30 ثانية
setupAutoRefresh(30000);

console.log('✅ تم تحميل سكريبت لوحة المشرفين بنجاح');
