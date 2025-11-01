// visitor-counter.js

// دالة لزيادة عدد الزوار وحفظه في LocalStorage
function trackVisitor() {
    let visitorCount = localStorage.getItem('visitorCount');
    
    // إذا لم يكن هناك عدد، ابدأ من 1
    if (visitorCount === null) {
        visitorCount = 1;
    } else {
        // زيادة العدد وتحويله إلى رقم
        visitorCount = parseInt(visitorCount) + 1;
    }
    
    // حفظ العدد الجديد
    localStorage.setItem('visitorCount', visitorCount);
    
    return visitorCount;
}

// دالة لعرض عدد الزوار في عنصر معين
function displayVisitorCount(elementId) {
    const countElement = document.getElementById(elementId);
    if (countElement) {
        const visitorCount = localStorage.getItem('visitorCount') || 0;
        countElement.textContent = visitorCount;
    }
}

// تتبع الزائر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // نتأكد من أننا لا نزيد العدد إلا في الصفحة الرئيسية (index.html)
    // أو يمكننا زيادة العدد في كل صفحة حسب الرغبة، لكن سنفترض الصفحة الرئيسية حاليًا
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        trackVisitor();
    }
    
    // يمكن استدعاء displayVisitorCount في أي صفحة تحتاج لعرض العدد
});

// تصدير الدالة لاستخدامها في settings.html
window.displayVisitorCount = displayVisitorCount;
