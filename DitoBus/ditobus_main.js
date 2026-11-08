const userRole = sessionStorage.getItem('userRole');
const currentUser = sessionStorage.getItem('currentUser');

// google sign in
const GOOGLE_CLIENT_ID = '';
const defaultPfps = {
    male: 'https://cdn-icons-png.flaticon.com/512/236/236831.png',
    female: 'https://cdn-icons-png.flaticon.com/512/6997/6997658.png',
    'prefer-not': 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
};

if (currentUser) {
    const oldUserData = localStorage.getItem(currentUser);
    if (oldUserData) {
        const oldUser = JSON.parse(oldUserData);
        if (oldUser.pfp && Object.values(defaultPfps).includes(oldUser.pfp)) {
            delete oldUser.pfp;
            localStorage.setItem(currentUser, JSON.stringify(oldUser));
        }
    }
}

//nav bar
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyMapStyle();
    const profileBtn = document.getElementById('profileBtn');
    const authPopup = document.getElementById('authPopup');
    const loggedOutView = document.getElementById('loggedOutView');
    const loggedInView = document.getElementById('loggedInView');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const welcomeTitle = document.getElementById('welcomeTitle');

    if (userRole && currentUser) {
        if (loggedOutView) loggedOutView.style.display = 'none';
        if (loggedInView) loggedInView.style.display = 'block';
        if (userEmailDisplay) userEmailDisplay.textContent = currentUser;

        const storedUserData = localStorage.getItem(currentUser);
        const user = storedUserData ? JSON.parse(storedUserData) : {};
        const displayName = user.name || userRole;

        if (welcomeTitle) welcomeTitle.textContent = `Hello, ${displayName}`;

        if (profileBtn) {
            const roleAvatar = defaultPfps[user.gender] || defaultPfps['prefer-not'];
            const finalAvatar = user.pfp || roleAvatar;
            profileBtn.innerHTML = `<img src="${finalAvatar}" alt="Profile" id="pfp">`;
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.clear();
                location.reload();
            });
        }

        if (userRole === 'employee') {
            checkEmployeeShift();
        }
    } else {
        if (loggedOutView) loggedOutView.style.display = 'block';
        if (loggedInView) loggedInView.style.display = 'none';

        if (profileBtn) {
            profileBtn.innerHTML = 'Log In / Sign Up';
        }

        // Login / Sign Up Form Toggle & Logic
        let isLogin = true;
        const toggleAuth = document.getElementById('toggleAuth');
        const formTitle = document.getElementById('formTitle');
        const submitBtn = document.getElementById('submitBtn');
        const toggleMsg = document.getElementById('toggleMsg');
        const authError = document.getElementById('authError');
        const genderInput = document.getElementById('genderInput');
        const passwordInput = document.getElementById('passwordInput');
        const forgotLink = document.getElementById('forgotPassword');
        const googleBtn = document.getElementById('googleBtn');
        let isReset = false; // true while the reset password form is showing

        function showAuthError(message) {
            if (authError) {
                authError.textContent = message;
                authError.style.display = 'block';
            }
        }

        // back to the normal login form
        function exitReset() {
            isReset = false;
            isLogin = true;
            passwordInput.value = '';
            passwordInput.placeholder = 'Password';
            formTitle.textContent = 'Login';
            submitBtn.textContent = 'Log In';
            toggleMsg.textContent = "Don't have an account?";
            toggleAuth.textContent = 'Sign Up';
            if (forgotLink) forgotLink.style.display = 'block';
            if (googleBtn) googleBtn.style.display = 'flex';
            if (authError) authError.style.display = 'none';
        }

        if (toggleAuth && submitBtn) {
            toggleAuth.addEventListener('click', (e) => {
                e.preventDefault();
                if (isReset) {
                    exitReset();
                    return;
                }
                isLogin = !isLogin;
                // gender dropdown only shows on sign up
                if (genderInput) genderInput.style.display = isLogin ? 'none' : 'block';
                // forgot password only shows on log in
                if (forgotLink) forgotLink.style.display = isLogin ? 'block' : 'none';
                formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
                submitBtn.textContent = isLogin ? 'Log In' : 'Sign Up';
                toggleMsg.textContent = isLogin ? "Don't have an account?" : 'Already have an account?';
                toggleAuth.textContent = isLogin ? 'Sign Up' : 'Log In';
                if (authError) authError.style.display = 'none';
            });

            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('emailInput').value.trim();
                const pass = document.getElementById('passwordInput').value.trim();

                if (!email || !pass) {
                    if (authError) {
                        authError.textContent = 'Please fill in both fields.';
                        authError.style.display = 'block';
                    }
                    return;
                }

                if (isReset) {
                    const savedAccount = localStorage.getItem(email);
                    if (!savedAccount) {
                        showAuthError('No account found with that email.');
                        return;
                    }

                    const account = JSON.parse(savedAccount);
                    if (account.google) {
                        showAuthError('This account uses Google sign-in.');
                        return;
                    }

                    account.password = pass;
                    localStorage.setItem(email, JSON.stringify(account));
                    alert('Password updated! Please log in.');
                    exitReset();
                    return;
                }

                if (!isLogin) {
                    let role = email.endsWith('@ditobus.gmail.com') ? 'employee' : 'viewer';
                    const gender = genderInput ? genderInput.value : 'prefer-not';

                    localStorage.setItem(email, JSON.stringify({
                        password: pass, role, gender
                    }));
                    
                    alert(`Signed up successfully as ${role}! Please log in.`);
                    isLogin = true;
                    if (genderInput) genderInput.style.display = 'none';
                    if (forgotLink) forgotLink.style.display = 'block';
                    formTitle.textContent = 'Login';
                    submitBtn.textContent = 'Log In';
                    toggleMsg.textContent = "Don't have an account?";
                    toggleAuth.textContent = 'Sign Up';
                    if (authError) authError.style.display = 'none';
                } else {
                    let saved = localStorage.getItem(email);
                    if (!saved || JSON.parse(saved).password !== pass) {
                        if (authError) {
                            authError.textContent = 'Invalid email or password.';
                            authError.style.display = 'block';
                        }
                        return;
                    }

                    let user = JSON.parse(saved);
                    sessionStorage.setItem('userRole', user.role);
                    sessionStorage.setItem('currentUser', email);

                    if (authPopup) authPopup.classList.remove('active');
                    location.reload();
                }
            });
        }

        // forgot password, switches the form to reset the password
        if (forgotLink && toggleAuth && submitBtn) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                isReset = true;
                passwordInput.placeholder = 'New Password';
                formTitle.textContent = 'Reset Password';
                submitBtn.textContent = 'Reset Password';
                toggleMsg.textContent = '';
                toggleAuth.textContent = 'Back to Log In';
                forgotLink.style.display = 'none';
                if (googleBtn) googleBtn.style.display = 'none';
                if (authError) authError.style.display = 'none';
            });
        }

        // continue with Google
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                if (!GOOGLE_CLIENT_ID || !window.google) {
                    console.warn('Google sign-in needs GOOGLE_CLIENT_ID in ditobus_main.js and the page must be opened from http, not from a file.');
                    showAuthError('Google sign-in is not available right now.');
                    return;
                }

                google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'openid email profile',
                    callback: async (tokenResponse) => {
                        if (!tokenResponse.access_token) return;

                        try {
                            // ask Google who signed in
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                            });
                            const profile = await res.json();
                            if (!profile.email) throw new Error('no email');

                            if (!localStorage.getItem(profile.email)) {
                                localStorage.setItem(profile.email, JSON.stringify({
                                    password: '', role: 'viewer', gender: 'prefer-not',
                                    name: profile.name, pfp: profile.picture, google: true
                                }));
                            }

                            const user = JSON.parse(localStorage.getItem(profile.email));
                            sessionStorage.setItem('userRole', user.role);
                            sessionStorage.setItem('currentUser', profile.email);
                            location.reload();
                        } catch (error) {
                            showAuthError('Could not sign in with Google.');
                        }
                    }
                }).requestAccessToken();
            });
        }
    }

    // Profile Dropdown Popup Toggle
    if (profileBtn && authPopup) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authPopup.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (authPopup.classList.contains('active') && !e.target.closest('.profile-container') && !e.target.closest('.auth-popup')) {
                authPopup.classList.remove('active');
            }
        });
    }

    // guest view
    const guestBtn = document.getElementById('guestBtn');
    if (guestBtn && authPopup) {
        guestBtn.addEventListener('click', () => {
            sessionStorage.setItem('isGuest', 'true');
            authPopup.classList.remove('active');
            location.reload();
        });
    }

    const isGuest = sessionStorage.getItem('isGuest');
    if (!userRole && !isGuest && authPopup) {
        authPopup.classList.add('active');
    }

    initMapModule();
    initBusScheduleModule();
    initShiftModule();
});


// map part
const phBounds = [
    [15.1, 120.3], //southwest coords
    [15.9, 121.4]  //northeast coords
];

let map, activeBusMarkers = [], activeRouteLines = [];

const terminalCoords = {
    'Cabanatuan Central Transport Terminal (Cabanatuan City)': [15.4724379, 120.9690401],
    'San Jose City Central Terminal (San Jose City)': [15.7892, 120.9856],
    'Gapan Central Terminal (Gapan City)': [15.3055, 120.9472],
    'Science City of Muñoz Integrated Terminal (Muñoz)': [15.7175, 120.9025],
    'Guimba Public Transport Terminal (Guimba)': [15.6575, 120.7686],
    'Talavera Public Market & Transport Hub (Talavera)': [15.6242, 120.9328]
};

const destinationCoords = {
    'Cabanatuan City': [15.4724379, 120.9690401],
    'San Jose City': [15.7892, 120.9856],
    'Gapan City': [15.3055, 120.9472],
    'Science City of Muñoz': [15.7175, 120.9025],
    'Talavera': [15.6242, 120.9328],
    'Guimba': [15.6575, 120.7686],
    'Rizal and Pantabangan': [15.7067, 121.1028],
    'Palayan City': [15.5453, 121.0906]
};

function initMapModule() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') return;

    map = L.map('map', {
        minZoom: 10.0, //zooom out restriction
        maxBounds: phBounds,
        maxBoundsViscosity: 1.0,
    }).setView([15.4724379, 120.9690401], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, //zoom in
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    if (userRole === 'employee') {
        loadActiveBusesOnMap();
    }

    // Set Maps as active tab by default on the map page
    const mapsButton = document.getElementById('M');
    if (mapsButton) {
        mapsButton.classList.add('active');
    }

    // Bus schedule modal toggle & tab highlight
    const busScheduleNav = document.getElementById('BS');
    const busScheduleModal = document.getElementById('busScheduleModal');
    const closeScheduleModal = document.getElementById('closeScheduleModal');

if (busScheduleNav && busScheduleModal) {
    busScheduleNav.addEventListener('click', (e) => {
        e.preventDefault();
        loadBusSchedule();
        busScheduleModal.style.display = 'flex';

        if (mapsButton) mapsButton.classList.remove('active');
        busScheduleNav.classList.add('active');
    });
}

    if (closeScheduleModal && busScheduleModal) {
        closeScheduleModal.addEventListener('click', () => {
            busScheduleModal.style.display = 'none';

            if (busScheduleNav) 
                busScheduleNav.classList.remove('active');
            if (mapsButton) 
                mapsButton.classList.add('active');
        });
    }


    if (busScheduleModal) {
        busScheduleModal.addEventListener('click', (e) => {
            if (e.target === busScheduleModal) {
                busScheduleModal.style.display = 'none';
 
                if (busScheduleNav) busScheduleNav.classList.remove('active');
                if (mapsButton) mapsButton.classList.add('active');
            }
        });
    }
}

async function fetchAndShowRoute(startCoords, destCoords) {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            let routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            routeCoords.unshift(startCoords);
            routeCoords.push(destCoords);
            
            const routeLine = L.polyline(routeCoords, getRouteLineOptions()).addTo(map);

            activeRouteLines.push(routeLine);
            return routeLine;
        }
    } catch (error) {
        console.warn("OSRM single-route fetch failed, using fallback straight line.", error);
    }
    
    const fallbackLine = L.polyline([startCoords, destCoords], getRouteLineOptions()).addTo(map);
    activeRouteLines.push(fallbackLine);
    return fallbackLine;
}

// bus follows its schedule
const BUS_SPEED_KMH = 40; 
const BUS_TIME_SCALE = 1; // 1 = real time, higher numbers speed it up
const BUS_ROAD_FACTOR = 1.3; // roads are longer than the straight line between two places
const BUS_TURNAROUND_MIN = 10; // minutes the bus waits after arriving before it drives back

// distance in meters between two coord points
function getDistanceMeters(a, b) {
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

function formatClock(ms) {
    const date = new Date(ms);
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

// where a bus is right now, the map and the bus schedule both use this so they always match
function getTripState(departure, startCoords, destCoords) {
    // time for one trip at the average bus speed (at least 1 minute)
    const distance = getDistanceMeters(startCoords, destCoords) * BUS_ROAD_FACTOR;
    const travelMs = Math.max((distance / (BUS_SPEED_KMH * 1000 / 3600)) * 1000, 60000);
    const periodMs = travelMs + BUS_TURNAROUND_MIN * 60000;

    // departure time today
    const departureDate = new Date();
    const [hours, minutes] = String(departure || '').split(':').map(Number);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) departureDate.setHours(hours, minutes, 0, 0);
    const departureMs = departureDate.getTime();

    // time since departure
    const elapsed = (Date.now() - departureMs) * BUS_TIME_SCALE;

    let leg = 0, status = 'scheduled', along = 0;
    if (elapsed > 0) {
        leg = Math.floor(elapsed / periodMs);
        const inLeg = elapsed - leg * periodMs;
        if (inLeg < travelMs) {
            status = 'enroute';
            along = inLeg / travelMs;
        } else {
            status = 'arrived'; // waiting at the end of the trip
            along = 1;
        }
    }

    // even trips go start -> destination, odd trips go back
    const forward = leg % 2 === 0;
    const legDepartMs = departureMs + (leg * periodMs) / BUS_TIME_SCALE;

    return {
        status,
        forward,
        progress: forward ? along : 1 - along, // 0 = start of the line, 1 = end of the line
        departMs: legDepartMs,
        arriveMs: legDepartMs + travelMs / BUS_TIME_SCALE
    };
}

// bus drawn as svg so it shows even if the device has no emoji font
const BUS_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`;

function animateBusAlongRoute(marker, routeLine, departure, startCoords, destCoords) {
    const points = routeLine.getLatLngs();
    if (points.length < 2) return;

    // distance from the start of the line to each point
    const cumulative = [0];
    for (let i = 1; i < points.length; i++) {
        cumulative.push(cumulative[i - 1] + map.distance(points[i - 1], points[i]));
    }
    const total = cumulative[cumulative.length - 1];
    if (!total) return;

    function step() {
        // stop when the marker is removed from the map (reload / focus on another bus)
        if (!map.hasLayer(marker)) return;

        const progress = getTripState(departure, startCoords, destCoords).progress;
        const target = progress * total;

        // find the segment the bus is currently on
        let low = 1, high = cumulative.length - 1;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (cumulative[mid] < target) low = mid + 1;
            else high = mid;
        }

        const segLength = cumulative[low] - cumulative[low - 1] || 1;
        const ratio = (target - cumulative[low - 1]) / segLength;
        const a = points[low - 1];
        const b = points[low];
        marker.setLatLng([a.lat + (b.lat - a.lat) * ratio, a.lng + (b.lng - a.lng) * ratio]);

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

async function loadActiveBusesOnMap() {
    if (!map) return;
    activeBusMarkers.forEach(marker => map.removeLayer(marker));
    activeBusMarkers = [];
    activeRouteLines.forEach(line => map.removeLayer(line));
    activeRouteLines = [];

    const activeBuses = JSON.parse(localStorage.getItem('activeBuses')) || {};

    const busIcon = L.divIcon({
        className: 'custom-bus-pin',
        html: `<div class="bus-pin-badge">${BUS_SVG}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `<div class="dest-pin-badge">🏁</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });

    for (const bus of Object.values(activeBuses)) {
        const startCoords = terminalCoords[bus.location] || terminalCoords['Cabanatuan Central Transport Terminal (Cabanatuan City)'];
        const destCoords = destinationCoords[bus.destination] || destinationCoords['Cabanatuan City'];

        if (startCoords && destCoords) {
            const routeLine = await fetchAndShowRoute(startCoords, destCoords);

            const startMarker = L.marker(startCoords, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
            // popup content is built when it opens, so it shows the current trip
            startMarker.bindPopup(() => {
                const state = getTripState(bus.departure, startCoords, destCoords);
                const origin = state.forward ? bus.location : bus.destination;
                const destination = state.forward ? bus.destination : bus.location;
                const statusText = state.status === 'arrived' ? '● Arrived' : state.status === 'enroute' ? '● Live Active Shift' : '● Waiting at terminal';
                return `
                <div class="map-popup-container">
                    <h4 class="map-popup-title">🚌 Bus Plate: ${bus.plate}</h4>
                    <p class="map-popup-row"><b>Origin:</b> ${origin}</p>
                    <p class="map-popup-row"><b>Destination:</b> ${destination}</p>
                    <p class="map-popup-row"><b>Departure:</b> ${formatClock(state.departMs)}</p>
                    <span class="map-popup-status">${statusText}</span>
                </div>
            `;
            });
            activeBusMarkers.push(startMarker);
            animateBusAlongRoute(startMarker, routeLine, bus.departure, startCoords, destCoords);

            const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
            activeBusMarkers.push(destMarker);
        }
    }
}

async function focusOnBusRoute(plateNumber) {
    if (!map) return;
    activeRouteLines.forEach(line => map.removeLayer(line));
    activeRouteLines = [];
    activeBusMarkers.forEach(marker => map.removeLayer(marker));
    activeBusMarkers = [];

    let startCoords, destCoords, departure;
    const activeBuses = JSON.parse(localStorage.getItem('activeBuses')) || {};
    const liveBus = Object.values(activeBuses).find(b => b.plate === plateNumber);

    if (liveBus) {
        startCoords = terminalCoords[liveBus.location] || terminalCoords['Cabanatuan Central Transport Terminal (Cabanatuan City)'];
        destCoords = destinationCoords[liveBus.destination] || destinationCoords['Cabanatuan City'];
        departure = liveBus.departure;
    } else {
        const staticSchedule = [
            { plate: 'XYZ-9876', location: 'Cabanatuan Central Transport Terminal (Cabanatuan City)', destination: 'San Jose City', departure: '06:00' },
            { plate: 'ABC-5544', location: 'Gapan Central Terminal (Gapan City)', destination: 'Cabanatuan City', departure: '07:30' },
            { plate: 'DEF-1122', location: 'Science City of Muñoz Integrated Terminal (Muñoz)', destination: 'Guimba', departure: '09:00' },
            { plate: 'GHI-3321', location: 'Guimba Public Transport Terminal (Guimba)', destination: 'Palayan City', departure: '10:15' },
            { plate: 'JKL-7788', location: 'San Jose City Central Terminal (San Jose City)', destination: 'Rizal and Pantabangan', departure: '11:00' },
            { plate: 'MNO-4455', location: 'Talavera Public Market & Transport Hub (Talavera)', destination: 'Science City of Muñoz', departure: '01:30' }
        ];
        const foundStatic = staticSchedule.find(s => s.plate === plateNumber);
        if (foundStatic) {
            startCoords = terminalCoords[foundStatic.location];
            destCoords = destinationCoords[foundStatic.destination];
            departure = foundStatic.departure;
        }
    }

    if (startCoords && destCoords) {
        const routeLine = await fetchAndShowRoute(startCoords, destCoords);

        const busIcon = L.divIcon({
            className: 'custom-bus-pin',
            html: `<div class="bus-pin-badge">${BUS_SVG}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        const targetMarker = L.marker(startCoords, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
        activeBusMarkers.push(targetMarker);
        animateBusAlongRoute(targetMarker, routeLine, departure, startCoords, destCoords);

        const bounds = L.latLngBounds([startCoords, destCoords]);
        map.fitBounds(bounds, { padding: [60, 60] });
        targetMarker.openPopup();

        const busScheduleModal = document.getElementById('busScheduleModal');
        if (busScheduleModal) busScheduleModal.style.display = 'none';
        
        const busScheduleNav = document.getElementById('BS');
        if (busScheduleNav) busScheduleNav.classList.remove('active');
    }
}


// bus sched part
function loadBusSchedule() {

    let staticSchedule = [
        { plate: 'XYZ-9876', location: 'Cabanatuan Central Transport Terminal (Cabanatuan City)', destination: 'San Jose City', departure: '06:00', isLive: false },
        { plate: 'ABC-5544', location: 'Gapan Central Terminal (Gapan City)', destination: 'Cabanatuan City', departure: '07:30', isLive: false },
        { plate: 'DEF-1122', location: 'Science City of Muñoz Integrated Terminal (Muñoz)', destination: 'Guimba', departure: '09:00', isLive: false },
        { plate: 'GHI-3321', location: 'Guimba Public Transport Terminal (Guimba)', destination: 'Palayan City', departure: '10:15', isLive: false },
        { plate: 'JKL-7788', location: 'San Jose City Central Terminal (San Jose City)', destination: 'Rizal and Pantabangan', departure: '11:00', isLive: false },
        { plate: 'MNO-4455', location: 'Talavera Public Market & Transport Hub (Talavera)', destination: 'Science City of Muñoz', departure: '01:30', isLive: false }
    ];

    const activeBuses = JSON.parse(localStorage.getItem('activeBuses')) || {};
    let liveSchedules = Object.values(activeBuses).map(bus => ({
        plate: bus.plate,
        location: bus.location,
        destination: bus.destination,
        departure: bus.departure,
        isLive: true
    }));

    let combinedSchedule = [...liveSchedules, ...staticSchedule];
    const scheduleContainer = document.getElementById('scheduleContainer');

    if (scheduleContainer) {
        if (combinedSchedule.length === 0) {
            scheduleContainer.innerHTML = `<p class="schedule-empty-msg">No active or scheduled buses available.</p>`;
            return;
        }

        let tableHTML = `
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Bus Info</th>
                        <th>Route</th>
                        <th>Departure</th>
                    </tr>
                </thead>
                <tbody>
        `;

        combinedSchedule.forEach(item => {
            // status, current trip direction and times follow the clock, same as the bus on the map
            const itemStart = terminalCoords[item.location];
            const itemDest = destinationCoords[item.destination];
            let badgeClass = item.isLive ? 'badge-live' : 'badge-scheduled';
            let badgeText = item.isLive ? '● Live' : 'Scheduled';
            let fromText = item.location;
            let toText = item.destination;
            let timeHTML = item.departure;

            if (itemStart && itemDest) {
                const state = getTripState(item.departure, itemStart, itemDest);

                // on the way back the origin and destination swap
                fromText = state.forward ? item.location : item.destination;
                toText = state.forward ? item.destination : item.location;

                if (state.status === 'enroute') {
                    badgeClass = 'badge-live';
                    badgeText = item.isLive ? '● Live' : 'En Route';
                } else if (state.status === 'arrived') {
                    badgeClass = 'badge-arrived';
                    badgeText = 'Arrived';
                } else {
                    badgeClass = 'badge-scheduled';
                    badgeText = 'Scheduled';
                }

                const etaLabel = state.status === 'arrived' ? 'Arrived ' : 'ETA ';
                timeHTML = `${formatClock(state.departMs)}<div class="schedule-eta">${etaLabel}${formatClock(state.arriveMs)}</div>`;
            }

            tableHTML += `
                <tr onclick="focusOnBusRoute('${item.plate}')">
                    <td>
                        <div class="schedule-plate">${item.plate}</div>
                        <span class="schedule-badge ${badgeClass}">${badgeText}</span>
                    </td>
                    <td>
                        <div class="schedule-route"><b>From:</b> ${fromText}</div>
                        <div class="schedule-route dest-text"><b>To:</b> ${toText}</div>
                    </td>
                    <td class="schedule-time">${timeHTML}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        scheduleContainer.innerHTML = tableHTML;
        const searchInput = document.getElementById('scheduleSearch');

        if (searchInput) {
            searchInput.oninput = filterSchedule;
            filterSchedule(); // keep the search filter after a refresh
        }
    }
}

function filterSchedule() {
    const searchInput = document.getElementById('scheduleSearch');
    const rows = document.querySelectorAll('.schedule-table tbody tr');

    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();

        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function initBusScheduleModule() {
    const busScheduleNav = document.getElementById('BS');
    const busScheduleModal = document.getElementById('busScheduleModal');
    const closeScheduleModal = document.getElementById('closeScheduleModal');

    if (busScheduleNav && busScheduleModal) {
        busScheduleNav.addEventListener('click', (e) => {
            e.preventDefault();
            loadBusSchedule();
            busScheduleModal.style.display = 'flex';
        });
    }

    if (closeScheduleModal && busScheduleModal) {
        closeScheduleModal.addEventListener('click', () => {
            busScheduleModal.style.display = 'none';
        });
    }

    if (busScheduleModal) {
        busScheduleModal.addEventListener('click', (e) => {
            if (e.target === busScheduleModal) {
                busScheduleModal.style.display = 'none';
            }
        });

        // refresh the table while it is open so statuses change on their own
        setInterval(() => {
            if (busScheduleModal.style.display === 'flex') loadBusSchedule();
        }, 15000);
    }
}


// employee part
function checkEmployeeShift() {
    const role = sessionStorage.getItem('userRole');
    const lastShiftDate = localStorage.getItem('conductorShiftDate');
    const today = new Date().toDateString();
    const shiftPromptModal = document.getElementById('shiftPromptModal');
    const conductorModal = document.getElementById('conductorModal');

    if (role === 'employee' && lastShiftDate !== today) {
        if (shiftPromptModal) {
            shiftPromptModal.style.display = 'flex';
        } else if (conductorModal) {
            conductorModal.style.display = 'flex';
        }
    }
}

function initShiftModule() {
    const startShiftBtn = document.getElementById('startShiftBtn');
    if (startShiftBtn) {
        startShiftBtn.addEventListener('click', () => {
            const shiftPromptModal = document.getElementById('shiftPromptModal');
            const conductorModal = document.getElementById('conductorModal');
            if (shiftPromptModal) shiftPromptModal.style.display = 'none';
            if (conductorModal) conductorModal.style.display = 'flex';
        });
    }

    const closeConductorModal = document.getElementById('closeConductorModal');
    if (closeConductorModal) {
        closeConductorModal.addEventListener('click', () => {
            const conductorModal = document.getElementById('conductorModal');
            if (conductorModal) conductorModal.style.display = 'none';
        });
    }

    const closeShiftPromptModal = document.getElementById('closeShiftPromptModal');
    if (closeShiftPromptModal) {
        closeShiftPromptModal.addEventListener('click', () => {
            const shiftPromptModal = document.getElementById('shiftPromptModal');
            if (shiftPromptModal) shiftPromptModal.style.display = 'none';
        });
    }

    const conductorForm = document.getElementById('conductorForm');
    if (conductorForm) {
        conductorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const plate = document.getElementById('busPlate').value.trim();
            const location = document.getElementById('busLocation').value;
            const destination = document.getElementById('busDestination').value;
            const departure = document.getElementById('departureTime').value;

            if (location === destination) {
                alert('Starting location and destination cannot be the same!');
                return;
            }

            sessionStorage.setItem('busPlate', plate);
            sessionStorage.setItem('busLocation', location);
            sessionStorage.setItem('busDestination', destination);
            sessionStorage.setItem('departureTime', departure);
            localStorage.setItem('conductorShiftDate', new Date().toDateString());

            const activeBuses = JSON.parse(localStorage.getItem('activeBuses')) || {};
            activeBuses[currentUser || plate] = {
                plate: plate,
                location: location,
                destination: destination,
                departure: departure,
                updatedAt: new Date().toLocaleTimeString()
            };
            localStorage.setItem('activeBuses', JSON.stringify(activeBuses));

            const conductorModal = document.getElementById('conductorModal');
            if (conductorModal) conductorModal.style.display = 'none';
            
            if (typeof loadActiveBusesOnMap === 'function' && map) {
                loadActiveBusesOnMap();
            }
            loadBusSchedule();
            alert(`Shift registered! Bus ${plate} (${location} to ${destination}) is now live.`);
        });
    }

    const editShiftBtn = document.getElementById('editShiftBtn');
    if (editShiftBtn) {
        if (userRole === 'employee') {
            editShiftBtn.style.display = 'block';
        }

        editShiftBtn.addEventListener('click', () => {
            const authPopup = document.getElementById('authPopup');
            if (authPopup) authPopup.classList.remove('active');
            
            const plateInput = document.getElementById('busPlate');
            const locInput = document.getElementById('busLocation');
            const destInput = document.getElementById('busDestination');
            const timeInput = document.getElementById('departureTime');

            if (plateInput) plateInput.value = sessionStorage.getItem('busPlate') || '';
            if (locInput) locInput.value = sessionStorage.getItem('busLocation') || '';
            if (destInput) destInput.value = sessionStorage.getItem('busDestination') || '';
            if (timeInput) timeInput.value = sessionStorage.getItem('departureTime') || '';

            const conductorModal = document.getElementById('conductorModal');
            if (conductorModal) conductorModal.style.display = 'flex';
        });
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');

    const btn = document.getElementById('themeToggleBtn');

    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');

        if (btn) {
            btn.textContent = 'Switch to Dark Mode';
        }
    } else {
        localStorage.setItem('theme', 'dark');

        if (btn) {
            btn.textContent = 'Switch to Light Mode';
        }
    }

    // keep the map settings preview in sync with the new theme
    if (typeof refreshPersonalization === 'function') refreshPersonalization();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('themeToggleBtn');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');

        if (btn) {
            btn.textContent = 'Switch to Dark Mode';
        }
    }
});

function applyTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

// PERSONALIZATION PART

const defaultMapStyle = {
    busColor: '#38bdf8',
    routeColor: '#38bdf8',
    routeStyle: 'dashed'
};

// the route line default follows the theme: light blue on dark, deeper blue on light
function getDefaultMapStyle() {
    const isLight = localStorage.getItem('theme') === 'light';
    return { ...defaultMapStyle, routeColor: isLight ? '#0284c7' : '#38bdf8' };
}

function getMapStyle() {
    const defaults = getDefaultMapStyle();
    try {
        const saved = JSON.parse(localStorage.getItem('mapStyle')) || {};
        const style = { ...defaults, ...saved };
        // fall back to defaults if a saved value is not valid
        if (!/^#[0-9a-f]{6}$/i.test(style.busColor)) style.busColor = defaults.busColor;
        if (!/^#[0-9a-f]{6}$/i.test(style.routeColor)) style.routeColor = defaults.routeColor;
        if (style.routeStyle !== 'solid' && style.routeStyle !== 'dashed') style.routeStyle = defaults.routeStyle;
        return style;
    } catch (error) {
        return defaults;
    }
}

function getRouteLineOptions() {
    const style = getMapStyle();
    const isLight = localStorage.getItem('theme') === 'light';
    return {
        color: style.routeColor,
        weight: isLight ? 5 : 4, // a little thicker in light mode
        opacity: isLight ? 0.9 : 0.8,
        dashArray: style.routeStyle === 'dashed' ? '6, 8' : null
    };
}

function applyMapStyle() {
    const style = getMapStyle();

    // dark or white bus symbol so it stays readable on any color
    const r = parseInt(style.busColor.slice(1, 3), 16);
    const g = parseInt(style.busColor.slice(3, 5), 16);
    const b = parseInt(style.busColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    document.documentElement.style.setProperty('--bus-color', style.busColor);
    document.documentElement.style.setProperty('--bus-icon-color', brightness > 150 ? '#0f172a' : '#ffffff');
}