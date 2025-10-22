
// التعذرات الافتراضية
const defaultExcuses = [
    { id: "1", text: "تعذر خطأ نقي" },
    { id: "2", text: "تعذر مستقل مخالف لشروط الاستقلالية" },
    { id: "3", text: "تعذر صلة قرابة" },
    { id: "4", text: "تعذر الزيارة من قبل الباحث" },
    { id: "5", text: "تعذر البيانات المقدمة من المستفيد غير صحيحة" },
    { id: "5", text: " يمنع زيارة المستفيدين من الجنس الآخر (المستقلين) دون وجود المحرم الشرعي." },
    { id: "5", text: " يحظر إتمام الزيارة عن بعد دون توجيه رسمي وخطي من إدارة المشروع." },
    { id: "5", text: " يمنع توقيع الباحث بدلًا عن المستفيد أو في غير الحقل المخصص لتوقيعه" },
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

// تحديث عرض التعذرات في قسم الأكثر شيوعاً كرسائل
function renderExcuses() {
    const excuses = loadExcuses();
    const feedsList = document.getElementById("feeds-list");
    if (!feedsList) return;
    
    feedsList.innerHTML = "";

    excuses.forEach((excuse) => {
        const li = document.createElement("li");
        li.textContent = excuse.text;
        feedsList.appendChild(li);
    });
}

// فتح chatbot
function openChatbot() {
    window.open('https://chatgpt.com/g/g-67fa231bdeb88191a5c6e7909176dce2-lms-d-lftrdy-llbhth-ljtm-y', '_blank');
}

// تحميل التعذرات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    renderExcuses();
});


;

