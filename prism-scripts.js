// أسماء الأيام بالعربية
const daysInArabic = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت'
];

// متغير لتتبع التاريخ الذي يتم عرضه وتحديثه
let currentDate = new Date();

// تحديث التاريخ واسم اليوم
function updateDateTime() {
    
    // الحصول على اسم اليوم من التاريخ الحالي المتحكم به
    const dayIndex = currentDate.getDay();
    const dayName = daysInArabic[dayIndex];
    
    // تنسيق التاريخ (DD/MM/YYYY)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const dateString = `${day}/${month}/${year}`;
    
    // تحديث العناصر في الصفحة
    document.getElementById('dayName').textContent = dayName;
    document.getElementById('dateDisplay').textContent = dateString;
    
    // تحديث الرسائل المخفية بالتاريخ واليوم الجديد
    updateHiddenMessages(dayName, dateString);
}

// دالة للانتقال إلى اليوم التالي
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateTime();
}

// دالة للانتقال إلى اليوم السابق
function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateTime();
}

// دالة لإعادة تعيين التاريخ إلى اليوم الفعلي
function resetDate() {
    currentDate = new Date();
    updateDateTime();
}

// تحديث الرسائل المخفية بالتاريخ واليوم
function updateHiddenMessages(dayName, dateString) {
    // تحديث رسالة الضمان (message1)
    const message1 = document.getElementById('message1');
    let messageText1 = message1.textContent;
    // استبدال اليوم مع الأقواس
    messageText1 = messageText1.replace(/لديكم موعد زياره يوم \([^)]*\)/g, `لديكم موعد زياره يوم (${dayName})`);
    // استبدال التاريخ
    messageText1 = messageText1.replace(/بتاريخ : \d{2}\/\d{2}\/\d{4}/g, `بتاريخ : ${dateString}`);
    message1.textContent = messageText1;
    
    // تحديث رسالة حساب المواطن (message2)
    const message2 = document.getElementById('message2');
    let messageText2 = message2.textContent;
    // استبدال اليوم مع الأقواس
    messageText2 = messageText2.replace(/لديكم موعد زياره يوم \([^)]*\)/g, `لديكم موعد زياره يوم (${dayName})`);
    // استبدال التاريخ
    messageText2 = messageText2.replace(/بتاريخ : \d{2}\/\d{2}\/\d{4}/g, `بتاريخ : ${dateString}`);
    message2.textContent = messageText2;
}

// دالة نسخ الرسالة
function copyMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    const text = messageElement.textContent;
    
    // نسخ النص إلى الحافظة
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {
        // في حالة الفشل، استخدم الطريقة القديمة
        fallbackCopyMessage(text);
    });
}

// دالة بديلة للنسخ (للمتصفحات القديمة)
function fallbackCopyMessage(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('فشل نسخ الرسالة:', err);
    }
    
    document.body.removeChild(textarea);
}

// إظهار رسالة النجاح
function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

// تحديث التاريخ والوقت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    
    // تحديث الوقت كل دقيقة للتأكد من أن التاريخ يعود لليوم الفعلي عند بداية يوم جديد
    setInterval(resetDate, 60000 * 60); // كل ساعة
});

// تحديث الوقت عند استعادة الصفحة من الذاكرة المؤقتة
window.addEventListener('pageshow', () => {
    resetDate();
});

/* وظيفة لفتح وإغلاق الشريط الجانبي */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

/* إغلاق الشريط الجانبي عند الضغط على أي رابط */
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleSidebar();
        });
    });
});


/* ============================================
   وظائف الشخصية المسلية (Character Interactions)
   ============================================ */

// رسائل تحفيزية عشوائية للشخصية
const characterMessages = [
    'مرحباً! كيف حالك اليوم؟ 😊',
    'هل تحتاج إلى مساعدة؟ أنا هنا! 🤝',
    'رائع! أنت تقوم بعمل رائع! 👍',
    'استمر في المحاولة، أنت تقترب! 💪',
    'أنا هنا لمساعدتك في كل خطوة! 🎯',
    'تذكر أن تأخذ فترات راحة! ☕',
    'أنت تفعل عملاً رائعاً! 🌟',
    'هل تريد نصيحة؟ اطلب مني! 💡'
];

// دالة لعرض رسالة عشوائية من الشخصية
function showCharacterMessage() {
    const randomIndex = Math.floor(Math.random() * characterMessages.length);
    const message = characterMessages[randomIndex];
    
    const speechBox = document.getElementById('characterSpeech');
    const speechText = document.getElementById('speechText');
    
    speechText.textContent = message;
    speechBox.style.display = 'block';
    
    // إخفاء الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
        speechBox.style.display = 'none';
    }, 3000);
}

// دالة لتحريك الشخصية
function animateCharacter() {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    // إضافة تأثير الحركة
    characterImg.style.transform = 'scale(1.15) rotate(-5deg)';
    
    setTimeout(() => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

// دالة لتحريك الشخصية نحو الزر المضغوط
function moveCharacterToButton(buttonElement) {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    // الحصول على موقع الزر
    const buttonRect = buttonElement.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    
    // حساب المسافة والاتجاه
    const moveX = buttonRect.left - characterRect.left;
    const moveY = buttonRect.top - characterRect.top;
    
    // تطبيق الحركة
    characterImg.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px) scale(1.1)`;
    
    // إرجاع الشخصية إلى مكانها الأصلي
    setTimeout(() => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    }, 500);
}

// إضافة مستمعات الأحداث للأزرار الرئيسية
document.addEventListener('DOMContentLoaded', () => {
    // الأزرار الرئيسية
    const buttons = document.querySelectorAll('.message-btn, .date-control-btn, .link-item, .sidebar-link');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // تحريك الشخصية
            moveCharacterToButton(this);
            
            // عرض رسالة عشوائية
            setTimeout(() => {
                showCharacterMessage();
            }, 300);
            
            // تحريك الشخصية
            animateCharacter();
        });
    });
    
    // الضغط على الشخصية نفسها
    const character = document.getElementById('character');
    character.addEventListener('click', () => {
        animateCharacter();
        showCharacterMessage();
    });
});

// تأثير عند تمرير الفأرة على الشخصية
document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const characterImg = character.querySelector('.character-img');
    
    character.addEventListener('mouseenter', () => {
        characterImg.style.transform = 'scale(1.15) rotate(5deg)';
    });
    
    character.addEventListener('mouseleave', () => {
        characterImg.style.transform = 'scale(1) rotate(0deg)';
    });
});


// ============ دوال ربط جوجل شيت ============

let autoRefreshInterval = null;

// دالة تحميل التعذرات من جوجل شيت
async function loadExcusesFromSheet() {
    const sheetId = document.getElementById('sheetId').value;
    const sheetName = document.getElementById('sheetName').value;
    
    if (!sheetId.trim()) {
        alert('الرجاء إدخال معرف جوجل شيت');
        return;
    }
    
    try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        
        const response = await fetch(url);
        const text = await response.text();
        
        // إزالة البادئة من الاستجابة
        const jsonText = text.substring(47).slice(0, -2);
        const json = JSON.parse(jsonText);
        
        const table = json.table;
        const rows = table.rows;
        
        // تحديث قائمة التعذرات
        const feedsList = document.getElementById('feeds-list');
        feedsList.innerHTML = '';
        
        rows.forEach((row, index) => {
            const text = row.c[0]?.v?.toString() || '';
            if (text.trim()) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="excuse-text">${text}</span>`;
                feedsList.appendChild(li);
            }
        });
        
        console.log('تم تحميل التعذرات بنجاح من جوجل شيت');
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        alert('فشل تحميل البيانات. تأكد من أن الملف منشور للعامة');
    }
}

// دالة تفعيل/إيقاف التحديث التلقائي
function toggleAutoRefresh() {
    const btn = document.getElementById('autoRefreshBtn');
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        btn.textContent = 'تفعيل التحديث التلقائي';
        btn.style.background = 'rgba(255,255,255,0.2)';
    } else {
        loadExcusesFromSheet();
        autoRefreshInterval = setInterval(() => {
            loadExcusesFromSheet();
        }, 5000); // تحديث كل 5 ثواني
        btn.textContent = 'إيقاف التحديث التلقائي';
        btn.style.background = 'rgba(255,0,0,0.3)';
    }
}

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadExcusesFromSheet();
});

// تحديث - تحميل البيانات من localStorage إن وجدت
(function() {
    const originalDOMContentLoaded = document.addEventListener;
    const listeners = [];
    
    document.addEventListener = function(type, listener, options) {
        if (type === 'DOMContentLoaded') {
            listeners.push(listener);
        }
        return originalDOMContentLoaded.call(this, type, listener, options);
    };
    
    // إعادة تعريف الدالة
    document.addEventListener('DOMContentLoaded', () => {
        const savedExcuses = localStorage.getItem('adminExcuses');
        if (savedExcuses) {
            try {
                const excuses = JSON.parse(savedExcuses);
                const feedsList = document.getElementById('feeds-list');
                if (feedsList) {
                    feedsList.innerHTML = '';
                    excuses.forEach(excuse => {
                        const li = document.createElement('li');
                        li.innerHTML = '<span class="excuse-text">' + excuse.text + '</span>';
                        feedsList.appendChild(li);
                    });
                }
            } catch(e) {
                console.log('استخدام البيانات الافتراضية');
                loadExcusesFromSheet();
            }
        } else {
            loadExcusesFromSheet();
        }
    });
})()
// بيانات عناصر Carousel
// يمكنك تعديل هذه البيانات حسب احتياجاتك
const carouselData = [
    {
        id: 1,
        title: ' حلول المشاكل التقنية ',
        description: '  حل المشاكل التالية:: (فشل المزامنة) (فشلت) (تم تخزين البيانات) .',
        image: 'images/4.jpg',
        pdf: 'pdf/S1.pdf' 
    },
    {
        id: 2,
        title: 'أسباب التعذر  ',
        description: '       طريقة الاعتذار وشرح سبب كل تعذر .',
        image: 'images/2.jpg',
        pdf: 'pdf/S2.pdf'
    },
    {
      id: 3,
        title: 'الدليل الإرشادي الثالث',
        description: 'مرجع شامل للباحثين يتضمن أفضل الممارسات والإجراءات الموصى بها.',
        image: 'images/3.jpg',
        pdf: 'pdf/S3.pdf'
    },
    {
        id: 4,
        title: 'الدليل الإرشادي الرابع',
        description: 'مرجع شامل للباحثين يتضمن أفضل الممارسات والإجراءات الموصى بها.',
        image: 'images/4.jpg',
        pdf: 'pdf/S4.pdf'
    },
   
];

// دالة إنشاء عنصر Carousel
function createCarouselItem(data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;
    
    // إنشاء زر PDF إذا كان موجوداً
    const pdfButton = data.pdf 
        ? `<button class="card-cta" onclick="openPDF('${data.pdf}')">
               <i class="fas fa-file-pdf"></i>
               فتح ملف PDF
           </button>`
        : '';
    
    item.innerHTML = `
        <div class="card">
            <div class="card-number">0${data.id}</div>
            <div class="card-image">
                <img src="${data.image}" alt="${data.title}">
            </div>
            <h3 class="card-title">${data.title}</h3>
            <p class="card-description">${data.description}</p>
            ${pdfButton}
        </div>
    `;
    
    return item;
}

// دالة تهيئة Carousel
function initCarousel(carouselId, indicatorsId, prevBtnId, nextBtnId, isSidebar = false) {
    let currentIndex = 0;
    const carousel = document.getElementById(carouselId);
    const indicatorsContainer = document.getElementById(indicatorsId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!carousel) return; // الخروج إذا لم يتم العثور على العنصر

    // دالة تحديث موضع عناصر Carousel
    function updateCarousel() {
        const items = carousel.querySelectorAll('.carousel-item');
        const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.indicator') : [];
        const totalItems = items.length;
        
        if (isSidebar) {
            // تنسيق خاص للشريط الجانبي (عرض عنصر واحد فقط)
            items.forEach((item, index) => {
                if (index === currentIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        } else {
            // تنسيق 3D Carousel الرئيسي
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024;
            
            // تحديد نصف قطر الدائرة حسب حجم الشاشة
            let radius;
            if (isMobile) {
                radius = 350;
            } else if (isTablet) {
                radius = 450;
            } else {
                radius = 550;
            }
            
            const angleStep = (2 * Math.PI) / totalItems;
            
            items.forEach((item, index) => {
                // حساب الزاوية النسبية
                const relativeIndex = (index - currentIndex + totalItems) % totalItems;
                const angle = relativeIndex * angleStep;
                
                // حساب الموضع
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius - radius;
                
                // حساب الحجم والشفافية
                const scale = 0.6 + (Math.cos(angle) * 0.4);
                const opacity = 0.3 + (Math.cos(angle) * 0.7);
                
                // تطبيق التحويلات
                item.style.transform = `
                    translateX(-50%) 
                    translateY(-50%) 
                    translateX(${x}px) 
                    translateZ(${z}px) 
                    scale(${scale})
                `;
                item.style.opacity = opacity;
                item.style.zIndex = Math.round(scale * 100);
                
                // إضافة/إزالة كلاس active
                if (relativeIndex === 0) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        // تحديث المؤشرات (إذا كانت موجودة)
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // دالة الانتقال للشريحة التالية
    function nextSlide() {
        currentIndex = (currentIndex + 1) % carouselData.length;
        updateCarousel();
    }

    // دالة الانتقال للشريحة السابقة
    function prevSlide() {
        currentIndex = (currentIndex - 1 + carouselData.length) % carouselData.length;
        updateCarousel();
    }

    // دالة الانتقال لشريحة محددة
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    // إنشاء عناصر Carousel
    carouselData.forEach((data, index) => {
        const item = createCarouselItem(data, index);
        carousel.appendChild(item);
        
        // إنشاء مؤشر (إذا كانت المؤشرات موجودة)
        if (indicatorsContainer) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        }
    });
    
    updateCarousel();

    // ربط أزرار التحكم
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // التدوير التلقائي (فقط للـ Carousel الرئيسي)
    if (!isSidebar) {
        let autoRotate = setInterval(nextSlide, 5000);
        
        // إيقاف التدوير التلقائي عند التفاعل
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoRotate);
        });
        
        // استئناف التدوير التلقائي عند مغادرة المؤشر
        carousel.addEventListener('mouseleave', () => {
            autoRotate = setInterval(nextSlide, 5000);
        });

        // التنقل بلوحة المفاتيح (فقط للـ Carousel الرئيسي)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') nextSlide();
            if (e.key === 'ArrowRight') prevSlide();
        });
    }

    // تحديث Carousel عند تغيير حجم النافذة (فقط للـ Carousel الرئيسي)
    if (!isSidebar) {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCarousel();
            }, 250);
        });
    }
}

// دالة فتح ملف PDF في تبويب جديد
function openPDF(pdfPath) {
    window.open(pdfPath, '_blank');
}

// تهيئة Carousel عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    // تهيئة Carousel الرئيسي
    initCarousel('carousel', 'indicators', 'prevBtn', 'nextBtn', false);
    
    // تهيئة Carousel الشريط الجانبي
    initCarousel('sidebar-carousel', 'sidebar-indicators', 'sidebar-prevBtn', 'sidebar-nextBtn', true);
});
function createCarouselItem(data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;
    
    // إنشاء زر PDF إذا كان موجوداً
    const pdfButton = data.pdf 
        ? `<button class="card-cta" onclick="openPDF('${data.pdf}')">
               <i class="fas fa-file-pdf"></i>
               فتح ملف PDF
           </button>`
        : '';
    
    item.innerHTML = `
        <div class="card">
            <div class="card-number">0${data.id}</div>
            <div class="card-image">
                <img src="${data.image}" alt="${data.title}">
            </div>
            <h3 class="card-title">${data.title}</h3>
            <p class="card-description">${data.description}</p>
            ${pdfButton}
        </div>
    `;
    
    return item;
}

// تم نقل الدوال إلى دالة initCarousel لتجنب التعارض بين مثيلين
// دالة فتح ملف PDF في تبويب جديد
function openPDF(pdfPath) {
    window.open(pdfPath, '_blank');
}
;
