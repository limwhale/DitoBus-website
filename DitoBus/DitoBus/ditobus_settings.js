function show(id) {
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    const targetPanel = document.getElementById(id);
    if (targetPanel) targetPanel.style.display = 'block';
}

function initSettingsModule() {
    const accountPfp = document.getElementById('account-pfp');
    const nameVal = document.getElementById('name-val');
    if (!accountPfp && !nameVal) return; // exit if not on Settings page

    if (currentUser) {
        const storedUserData = localStorage.getItem(currentUser);
        if (storedUserData) {
            const user = JSON.parse(storedUserData);

            // load saved gender into the dropdown
            const genderSelect = document.getElementById('gender-val');
            if (genderSelect) genderSelect.value = user.gender || 'prefer-not';

            const roleAvatar = defaultPfps[user.gender] || defaultPfps['prefer-not'];
            accountPfp.src = user.pfp || roleAvatar;
            if (nameVal) nameVal.textContent = user.name || 'Not Set';

            const pwdVal = document.getElementById('password-val');
            if (pwdVal && user.password) pwdVal.textContent = '•'.repeat(user.password.length);
        }

        const gmailVal = document.getElementById('gmail-val');
        if (gmailVal) gmailVal.textContent = currentUser;

        const roleVal = document.getElementById('role-val');
        if (roleVal && userRole) roleVal.textContent = userRole.toUpperCase();
    } else {
        // guests cannot change the profile picture
        const changePfpBtn = document.querySelector('label[for="pfp-upload"]');
        const pfpUpload = document.getElementById('pfp-upload');
        if (changePfpBtn) changePfpBtn.style.display = 'none';
        if (pfpUpload) pfpUpload.disabled = true;
    }
}

function previewFile(event) {
    const file = event.target.files[0];
    if (file && currentUser) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            const accountPfp = document.getElementById('account-pfp');
            const pfpImg = document.getElementById('pfp');
            if (accountPfp) accountPfp.src = base64Image;
            if (pfpImg) pfpImg.src = base64Image;

            let stored = JSON.parse(localStorage.getItem(currentUser)) || {};
            stored.pfp = base64Image;
            localStorage.setItem(currentUser, JSON.stringify(stored));
        };
        reader.readAsDataURL(file);
    }
}

function toggleEdit(field) {
    if (!currentUser) return;

    const valElement = document.getElementById(`${field}-val`);
    const btnElement = event.target;
    const stored = localStorage.getItem(currentUser);
    if (!stored) return;

    let user = JSON.parse(stored);

    if (btnElement.textContent === 'Edit') {
        const currentValue = field === 'password' ? user.password : (user[field] || valElement.textContent);
        valElement.innerHTML = `<input type="${field === 'password' ? 'password' : 'text'}" id="${field}-input" value="${currentValue}" style="background: #1a1a1a; color: #fff; border: 1px solid #444; padding: 4px; border-radius: 4px; font-size: 14px; width: 100%;">`;
        btnElement.textContent = 'Save';
        btnElement.style.color = '#28cf19';
    } else {
        const inputElement = document.getElementById(`${field}-input`);
        if (!inputElement) return;
        const inputVal = inputElement.value.trim();
        
        if (inputVal !== '') {
            user[field] = inputVal;
            localStorage.setItem(currentUser, JSON.stringify(user));

            if (field === 'password') {
                valElement.textContent = '•'.repeat(inputVal.length);
            } else {
                valElement.textContent = inputVal;
                if (field === 'name') {
                    const welcomeTitle = document.getElementById('welcomeTitle');
                    if (welcomeTitle) welcomeTitle.textContent = `Hello, ${inputVal}`;
                }
            }
        }

        btnElement.textContent = 'Edit';
        btnElement.style.color = '#38bdf8';
    }
}

function saveGender() {
    if (!currentUser) return;

    const storedUserData = localStorage.getItem(currentUser);
    if (!storedUserData) return;

    const user = JSON.parse(storedUserData);

    const genderSelect = document.getElementById('gender-val');
    const gender = genderSelect.value;

    user.gender = gender;
    // default avatar follows gender through defaultPfps, only uploaded pfp is saved

    localStorage.setItem(currentUser, JSON.stringify(user));

    location.reload();
}

// PERSONALIZATION CONTROLS
// set by initPersonalizationModule so the preview follows theme changes
let refreshPersonalization = null;

function initPersonalizationModule() {
    const busColorInput = document.getElementById('busColorInput');
    const routeColorInput = document.getElementById('routeColorInput');
    const routeStyleInput = document.getElementById('routeStyleInput');
    const resetMapStyleBtn = document.getElementById('resetMapStyleBtn');
    const busPreview = document.getElementById('busPreview');
    const routePreview = document.getElementById('routePreview');
    if (!busColorInput || !routeColorInput || !routeStyleInput) return; // Exit if not on Settings page

    if (busPreview) busPreview.innerHTML = BUS_SVG;

    function showStyle(style) {
        busColorInput.value = style.busColor;
        routeColorInput.value = style.routeColor;
        routeStyleInput.value = style.routeStyle;
        if (routePreview) {
            routePreview.style.borderTop = `4px ${style.routeStyle} ${style.routeColor}`;
        }
    }

    function saveStyle(field, value) {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem('mapStyle')) || {};
        } catch (error) {
            saved = {};
        }
        saved[field] = value;
        localStorage.setItem('mapStyle', JSON.stringify(saved));
        applyMapStyle();
        showStyle(getMapStyle());
    }

    showStyle(getMapStyle());
    refreshPersonalization = () => showStyle(getMapStyle());

    busColorInput.addEventListener('input', () => saveStyle('busColor', busColorInput.value));
    routeColorInput.addEventListener('input', () => saveStyle('routeColor', routeColorInput.value));
    routeStyleInput.addEventListener('change', () => saveStyle('routeStyle', routeStyleInput.value));

    if (resetMapStyleBtn) {
        resetMapStyleBtn.addEventListener('click', () => {
            localStorage.removeItem('mapStyle');
            applyMapStyle();
            showStyle(getMapStyle());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSettingsModule();
    initPersonalizationModule();
});