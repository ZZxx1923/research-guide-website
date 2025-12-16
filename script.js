// Current active tab
let activeTab = 'new-account';

// Form data
let formData = {
    'new-account': {
        name: '',
        idNumber: '',
        phone: '',
        scope: '',
        city: '',
        platform: ''
    },
    'reset': {
        name: '',
        idNumber: '',
        phone: '',
        scope: '',
        city: '',
        platform: ''
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add input listeners
    document.getElementById('name').addEventListener('input', handleInput);
    document.getElementById('idNumber').addEventListener('input', handleIdInput);
    document.getElementById('phone').addEventListener('input', handlePhoneInput);
    document.getElementById('scope').addEventListener('input', handleInput);
    document.getElementById('city').addEventListener('input', handleInput);
    document.getElementById('platform').addEventListener('change', handleInput);
});

// Handle regular input
function handleInput(e) {
    const fieldId = e.target.id;
    const value = e.target.value;
    formData[activeTab][fieldId] = value;
    updateMessage();
}

// Handle ID number input (only digits, max 10)
function handleIdInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    const idError = document.getElementById('idError');
    const idCounterContainer = document.getElementById('idCounterContainer');
    
    if (value.length > 10) {
        idError.style.display = 'block';
        idCounterContainer.style.display = 'none';
        value = value.slice(0, 10);
    } else if (value.length === 10) {
        idError.style.display = 'none';
        idCounterContainer.style.display = 'block';
    } else {
        idError.style.display = 'none';
        idCounterContainer.style.display = 'none';
    }
    
    e.target.value = value;
    document.getElementById('idCounter').textContent = value.length;
    formData[activeTab]['idNumber'] = value;
    updateMessage();
}

// Handle phone input (only digits, max 10)
function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    const phoneError = document.getElementById('phoneError');
    const phoneCounterContainer = document.getElementById('phoneCounterContainer');
    
    if (value.length > 10) {
        phoneError.style.display = 'block';
        phoneCounterContainer.style.display = 'none';
        value = value.slice(0, 10);
    } else if (value.length === 10) {
        phoneError.style.display = 'none';
        phoneCounterContainer.style.display = 'block';
    } else {
        phoneError.style.display = 'none';
        phoneCounterContainer.style.display = 'none';
    }
    
    e.target.value = value;
    document.getElementById('phoneCounter').textContent = value.length;
    formData[activeTab]['phone'] = value;
    updateMessage();
}

// Switch between tabs
function switchTab(tabName) {
    activeTab = tabName;
    
    // Update tab buttons
    const resetTab = document.getElementById('resetTab');
    const newAccountTab = document.getElementById('newAccountTab');
    
    if (tabName === 'reset') {
        resetTab.classList.add('active-tab');
        newAccountTab.classList.remove('active-tab');
    } else {
        newAccountTab.classList.add('active-tab');
        resetTab.classList.remove('active-tab');
    }
    
    // Update form fields
    updateFormFields();
    
    // Update message
    updateMessage();
}

// Update form fields based on active tab
function updateFormFields() {
    const data = formData[activeTab];
    
    document.getElementById('name').value = data.name;
    document.getElementById('idNumber').value = data.idNumber;
    document.getElementById('phone').value = data.phone;
    document.getElementById('scope').value = data.scope;
    document.getElementById('city').value = data.city;
    document.getElementById('platform').value = data.platform;
    
    // Update counters
    document.getElementById('idCounter').textContent = data.idNumber.length;
    document.getElementById('phoneCounter').textContent = data.phone.length;
    
    // Update required stars visibility
    updateRequiredStars();
}

// Update required stars based on active tab
function updateRequiredStars() {
    if (activeTab === 'new-account') {
        document.getElementById('nameRequired').style.display = 'inline';
        document.getElementById('idRequired').style.display = 'inline';
        document.getElementById('phoneRequired').style.display = 'inline';
        document.getElementById('scopeRequired').style.display = 'inline';
        document.getElementById('cityRequired').style.display = 'inline';
    } else {
        document.getElementById('nameRequired').style.display = 'none';
        document.getElementById('idRequired').style.display = 'none';
        document.getElementById('phoneRequired').style.display = 'none';
        document.getElementById('scopeRequired').style.display = 'none';
        document.getElementById('cityRequired').style.display = 'none';
    }
}

// Check if form is valid
function isFormValid() {
    const data = formData[activeTab];
    
    if (activeTab === 'new-account') {
        // All fields required for new account
        return data.name.trim() !== '' &&
               data.idNumber.trim() !== '' &&
               data.phone.trim() !== '' &&
               data.scope.trim() !== '' &&
               data.city.trim() !== '' &&
               data.platform.trim() !== '';
    } else {
        // Any field filled for reset password
        return data.name.trim() !== '' ||
               data.idNumber.trim() !== '' ||
               data.phone.trim() !== '' ||
               data.scope.trim() !== '' ||
               data.city.trim() !== '' ||
               data.platform.trim() !== '';
    }
}

// Generate formatted message
function generateMessage() {
    const data = formData[activeTab];
    const requestType = activeTab === 'new-account' 
        ? 'طلب إنشاء حساب جديد'
        : 'طلب إعادة تفعيل الحساب / تعيين كلمة المرور';
    
    let message = `${requestType}\n\n`;
    
    if (data.name) message += `اسم الباحث: ${data.name}\n`;
    if (data.idNumber) message += `رقم الهوية: ${data.idNumber}\n`;
    if (data.phone) message += `رقم الجوال: ${data.phone}\n`;
    if (data.scope) message += `النطاق: ${data.scope}\n`;
    if (data.city) message += `المدينة: ${data.city}\n`;
    if (data.platform) message += `المنصة: ${data.platform}\n`;
    
    return message.trim();
}

// Update message display
function updateMessage() {
    const messageSection = document.getElementById('messageSection');
    const messageContent = document.getElementById('messageContent');
    
    if (isFormValid()) {
        messageSection.classList.add('show');
        messageContent.textContent = generateMessage();
    } else {
        messageSection.classList.remove('show');
    }
}

// Copy message to clipboard
function copyMessage() {
    const message = generateMessage();
    navigator.clipboard.writeText(message).then(() => {
        const copyBtn = document.getElementById('copyBtnText');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ تم النسخ بنجاح!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Send email via Outlook
function sendEmail() {
    const message = generateMessage();
    const subject = activeTab === 'new-account' 
        ? 'طلب إنشاء حساب جديد'
        : 'طلب إعادة تفعيل الحساب / تعيين كلمة المرور';
    
    const email = 'hsd@ek.com.sa';
    const body = encodeURIComponent(message);
    const subjectEncoded = encodeURIComponent(subject);
    
    // Open Outlook (if available) or default email client
    // Try Outlook first
    const outlookUrl = `mailto:${email}?subject=${subjectEncoded}&body=${body}`;
    window.location.href = outlookUrl;
}

// Initialize on page load
window.addEventListener('load', function() {
    updateRequiredStars();
});

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}
