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

// دالة لتحويل التاريخ الميلادي إلى هجري (أرقام فقط)
function getHijriDate(date) {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date).replace(/هـ/g, '').trim();
}

// دالة لجلب التاريخ من الإنترنت (WorldTimeAPI) لضمان الدقة
async function fetchInternetDate() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Riyadh');
        const data = await response.json();
        if (data && data.datetime) {
            currentDate = new Date(data.datetime);
            console.log('تم جلب التاريخ من الإنترنت بنجاح:', currentDate);
        }
    } catch (error) {
        console.error('فشل جلب التاريخ من الإنترنت، سيتم استخدام تاريخ الجهاز:', error);
        currentDate = new Date();
    }
    updateDateTime();
}

// تحديث التاريخ واسم اليوم
function updateDateTime() {
    // الحصول على اسم اليوم من التاريخ الحالي المتحكم به
    const dayIndex = currentDate.getDay();
    const dayName = daysInArabic[dayIndex];
    
    // تحويل التاريخ إلى هجري (أرقام فقط)
    const hijriDateString = getHijriDate(currentDate);
    
    // تحديث العناصر في الصفحة
    document.getElementById('dayName').textContent = dayName;
    document.getElementById('dateDisplay').textContent = hijriDateString;
    
    // تحديث الرسائل المخفية بالتاريخ واليوم الجديد
    updateHiddenMessages(dayName, hijriDateString);
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

// تحديث الرسائل المخفية بالتاريخ واليوم واسم الباحث
function updateHiddenMessages(dayName, dateString) {
    const researcherName = document.getElementById('researcherNameInput')?.value || '……..';
    const researcherGender = document.getElementById('researcherGender')?.value || 'male';
    
    // جملة المحرم تظهر فقط إذا كان المختار "باحث" (male)
    const mahramNote = researcherGender === 'male' ? '\n* الزامي حضور محرم للنساء .' : '';
    
    // تحديث رسالة الضمان (message1)
    const message1 = document.getElementById('message1');
    let messageText1 = `السلام عليكم ورحمة الله وبركاته ...

عزيزي/تي المستفيد/ة :

معك (الباحث /ــه الإجتماعية) : ${researcherName}••

وزارة الموارد البشرية والتنمية الإجتماعيه...

(الضمان الاجتماعي)

لديكم موعد زياره يوم (${dayName})

بتاريخ : ${dateString}

* آمل منكم ارسال موقع المنزل وصوره للمنزل من الخارج فقط...

🔹ملاحظه مهمه جدا :

وتجنباً للتأخير على المستفيدين الآخرين يجب تجهيز الطلبات التاليه وتكون بحوزة المستفيد اثناء الزياره :

* الهويه الوطنيه او كرت العائله.
* رخصة السير (الاستماره) للمستفيد او احد التابعين في حال امتلاك سيارة.
* عقد الايجار / او صك الملك في حال كان البيت ملك/صك الورثه.
* العنوان الوطني موثق من سبل  او توكلنا مهم جداً.
* صك الطلاق/ صك الحضانة .
* التقرير الطبي اذا كان هناك مرض اواعاقة لاسمح الله.
* وجود جميع التابعين فالمنزل لمن لديه تابع ماعادا الطلاب.${mahramNote}

🔸 يتم تحديد وقت الزيارة حسب جدول الزيارات، وسيتم الإبلاغ قبل القدوم بنصف ساعة.

شكراً لكم ....`;
    message1.textContent = messageText1;
    
    // تحديث رسالة حساب المواطن (message2)
    const message2 = document.getElementById('message2');
    let messageText2 = `السلام عليكم ورحمة الله وبركاته .

عزيزي المستفيد /  

معك ( الباحثـ.   / ــه  الإجتماعي) : ${researcherName} -
        
وزارة الموارد البشرية والتنمية الإجتماعيه.
(حساب المواطن)

لديكم موعد زياره يوم (${dayName})

بتاريخ : ${dateString}

      
آمل منكم ارسال موقع المنزل وصوره للمنزل من الخارج  فقط..

🔸🔸🔸ملاحظه مهمه جدا وتجنبا للتأخير  على المستفيدين الآخرين يجب تجهيز الطلبات التاليه وتكون بحوزة المستفيد اثناء الزياره .

1- الهويه الوطنيه .
2- عقد الايجار / او صك الملك في حال كان البيت ملك/صك الورثه.
3- العنوان الوطني موثق من سبل  او توكلنا مهم جداً.
4- فاتورة الكهرباء .${mahramNote}

🔸 يتم تحديد وقت الزيارة حسب جدول الزيارات، وسيتم الإبلاغ قبل القدوم بنصف ساعة.

شكراً لكم ....`;
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
    fetchInternetDate();
    
    // حفظ اسم الباحث وجنسه في localStorage وتحديثهما عند التغيير
    const researcherInput = document.getElementById('researcherNameInput');
    const researcherGenderSelect = document.getElementById('researcherGender');
    
    if (researcherInput) {
        researcherInput.value = localStorage.getItem('researcherName') || '';
        researcherInput.addEventListener('input', () => {
            localStorage.setItem('researcherName', researcherInput.value);
            updateDateTime();
        });
    }
    
    if (researcherGenderSelect) {
        researcherGenderSelect.value = localStorage.getItem('researcherGender') || 'male';
        researcherGenderSelect.addEventListener('change', () => {
            localStorage.setItem('researcherGender', researcherGenderSelect.value);
            updateDateTime();
        });
    }

    // تحديث الوقت كل ساعة للتأكد من أن التاريخ يعود لليوم الفعلي عند بداية يوم جديد
    setInterval(fetchInternetDate, 60000 * 60); // كل ساعة
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
        image: 'images/1.jpg',
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
        image: 'images/3.jpg',
        pdf: 'pdf/S4.pdf'
    },
   {
        id: 5,
        title: 'الدليل  ',
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
// 📝 معالجة نموذج إدخال التقارير

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 تم تحميل صفحة إدخال التقارير');

    // عنصر التاريخ
    const dateInput = document.getElementById('date');

    if (dateInput) {
        // تعيين تاريخ اليوم
        dateInput.valueAsDate = new Date();

        // تحديث اليوم عند تغيير التاريخ
        if (typeof updateDay === 'function') {
            dateInput.addEventListener('change', updateDay);
            updateDay(); // تحديث عند التحميل
        }
    }

    // زر الإرسال
    const submitBtn = document.getElementById('submitBtn');

    if (submitBtn && typeof handleSubmit === 'function') {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            handleSubmit(e);
        });
    }
});
// إضافة مستمع لتحديث اليوم عند التحميل
updateDay();

// 📆 دالة لتحديث اليوم تلقائياً
function updateDay() {
    const dateInput = document.getElementById('date');
    const daySelect = document.getElementById('day');
    
    if (dateInput && daySelect && dateInput.value) {
        const dayName = getDayName(dateInput.value);
        daySelect.value = dayName;
        console.log('📆 تم تحديث اليوم إلى:', dayName);
    }
}

// 📤 دالة معالجة إرسال النموذج
function handleSubmit(event) {
    event.preventDefault();
    
    console.log('📤 جاري معالجة إرسال التقرير...');
    
    // جمع البيانات من النموذج
    const formData = {
        date: document.getElementById('date').value,
        day: document.getElementById('day').value,
        researcherName: document.getElementById('researcherName').value,
        assignedVisits: document.getElementById('assignedVisits').value,
        completedVisits: document.getElementById('completedVisits').value,
        excuses: document.getElementById('excuses').value,
        remainingVisits: document.getElementById('remainingVisits').value,
        postponedVisits: document.getElementById('postponedVisits').value,
        technicalIssues: document.getElementById('technicalIssues').value,
        outOfScope: document.getElementById('outOfScope').value,
        notes: document.getElementById('notes').value
    };
    
    // التحقق من صحة البيانات
    const validation = validateReportData(formData);
    if (!validation.isValid) {
        showError(validation.errors.join('\n'));
        return;
    }
    
    // حفظ البيانات
    try {
        const report = saveReport(formData);
        showSuccess('✅ تم حفظ التقرير بنجاح!');
        
        // إرسال إشعار لحظي لـ Firebase
        if (typeof triggerInstantNotification === 'function') {
            triggerInstantNotification(formData.researcherName, formData.region || '');
        }
        
        // إعادة تعيين النموذج
        resetForm();
        
        // تحديث اليوم
        updateDay();
        
        console.log('✅ تم حفظ التقرير:', report);
    } catch (error) {
        console.error('❌ خطأ في حفظ التقرير:', error);
        showError('حدث خطأ في حفظ التقرير. الرجاء المحاولة مرة أخرى.');
    }
}

// 🔄 دالة لإعادة تعيين النموذج
function resetForm() {
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('day').value = '';
    document.getElementById('researcherName').value = '';
    document.getElementById('assignedVisits').value = '';
    document.getElementById('completedVisits').value = '';
    document.getElementById('excuses').value = '';
    document.getElementById('remainingVisits').value = '';
    document.getElementById('postponedVisits').value = '';
    document.getElementById('technicalIssues').value = '';
    document.getElementById('outOfScope').value = '';
    document.getElementById('notes').value = '';
    
    updateDay();
}

// ✅ دالة لعرض رسالة النجاح
function showSuccess(message) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'message success';
        messageDiv.style.display = 'block';
        
        // إخفاء الرسالة بعد 3 ثوان
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// ❌ دالة لعرض رسالة الخطأ
function showError(message) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        
        // إخفاء الرسالة بعد 5 ثوان
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// 📊 دالة لعرض ملخص البيانات
function showDataSummary() {
    const reports = getAllReports();
    const stats = calculateStatistics(reports);
    
    console.log('📊 ملخص البيانات:');
    console.log('عدد التقارير:', stats.totalReports);
    console.log('إجمالي الزيارات المسندة:', stats.totalAssignedVisits);
    console.log('إجمالي الزيارات المنفذة:', stats.totalCompletedVisits);
    console.log('نسبة الإنجاز:', stats.completionRate + '%');
    console.log('التقارير الناجحة:', stats.successfulReports);
    console.log('التقارير بها مشاكل:', stats.problemReports);
}

// 🔍 دالة للبحث عن تقرير محدد
function searchReport(date, researcher) {
    const results = filterReports(date, researcher);
    console.log('🔍 نتائج البحث:', results);
    return results;
}

// 📥 دالة لتصدير البيانات إلى CSV
function exportToCSV() {
    const reports = getAllReports();
    
    if (reports.length === 0) {
        showError('لا توجد بيانات للتصدير');
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
        'الملاحظات',
        'الوقت'
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
        r.notes,
        r.timestamp
    ]);
    
    // إنشاء محتوى CSV
    let csvContent = '\uFEFF'; // BOM للتعامل مع الأحرف العربية
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
    
    showSuccess('✅ تم تصدير البيانات بنجاح');
    console.log('📥 تم تصدير', reports.length, 'تقرير');
}

// 🗑️ دالة لحذف جميع البيانات
function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        removeFromLocalStorage('reports');
        showSuccess('✅ تم حذف جميع البيانات');
        console.log('🗑️ تم حذف جميع البيانات');
    }
}

// 📊 دالة لعرض إحصائيات مفصلة
function showDetailedStatistics() {
    const reports = getAllReports();
    const stats = calculateStatistics(reports);
    
    console.log('📊 إحصائيات مفصلة:');
    console.table(stats);
    
    // عرض الإحصائيات حسب الباحث
    const researcherStats = {};
    reports.forEach(r => {
        if (!researcherStats[r.researcherName]) {
            researcherStats[r.researcherName] = {
                count: 0,
                totalAssigned: 0,
                totalCompleted: 0,
                totalTechnicalIssues: 0
            };
        }
        researcherStats[r.researcherName].count++;
        researcherStats[r.researcherName].totalAssigned += parseInt(r.assignedVisits);
        researcherStats[r.researcherName].totalCompleted += parseInt(r.completedVisits);
        researcherStats[r.researcherName].totalTechnicalIssues += parseInt(r.technicalIssues);
    });
    
    console.log('📊 إحصائيات حسب الباحث:');
    console.table(researcherStats);
}

// 🔐 دالة لحماية البيانات
function backupData() {
    const reports = getAllReports();
    const backup = {
        timestamp: new Date().toISOString(),
        data: reports
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `نسخة_احتياطية_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('✅ تم إنشاء نسخة احتياطية');
    console.log('🔐 تم إنشاء نسخة احتياطية بـ', reports.length, 'تقرير');
}

// 📲 دالة لمشاركة البيانات
function shareData() {
    const reports = getAllReports();
    const stats = calculateStatistics(reports);
    
    const shareText = `
📊 ملخص التقارير اليومية
━━━━━━━━━━━━━━━━━━━━━━
📝 عدد التقارير: ${stats.totalReports}
📍 الزيارات المسندة: ${stats.totalAssignedVisits}
✅ الزيارات المنفذة: ${stats.totalCompletedVisits}
📈 نسبة الإنجاز: ${stats.completionRate}%
🎯 التقارير الناجحة: ${stats.successfulReports}
⚠️ التقارير بها مشاكل: ${stats.problemReports}
━━━━━━━━━━━━━━━━━━━━━━
تم إنشاؤه: ${new Date().toLocaleString('ar-SA')}
    `;
    
    if (navigator.share) {
        navigator.share({
            title: 'ملخص التقارير اليومية',
            text: shareText
        }).catch(err => console.log('❌ خطأ في المشاركة:', err));
    } else {
        // نسخ إلى الحافظة
        navigator.clipboard.writeText(shareText).then(() => {
            showSuccess('✅ تم نسخ الملخص إلى الحافظة');
        });
    }
}

// دالة إرسال الإشارة لـ Firebase فور إتمام التقرير
async function triggerInstantNotification(name, region) {
    const researcherName = name || "باحث";
    // نستخدم POST لإنشاء سجل جديد تماماً، مما يضمن تنبيه Firebase لجميع المشتركين
    const url = "https://notificationsfirebase-9a183-default-rtdb.firebaseio.com/notifications.json";
    const payload = {
        name: researcherName,
        region: region || "",
        timestamp: Date.now(),
        message: `أتم الباحث ${researcherName} تقريره اليومي وأرسله بنجاح ✅`
    };
    
    try {
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        console.log("✅ تم إرسال إشارة الإشعار اللحظي");
    } catch (e) {
        console.error("❌ فشل إرسال إشارة الإشعار:", e);
    }
}

console.log('✅ تم تحميل سكريبت الإدخال بنجاح');
