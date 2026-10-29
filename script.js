/**
 * CINEMA NIII7 BRAȘOV - MOTORUL PRINCIPAL AL APLICAȚIEI
 * Arhitectură:
 * 1. Sincronizare Live Scaune (Firebase + BroadcastChannel local între tab-uri)
 * 2. Trailere HTML5 Video la Hover (fără erori de embed YouTube)
 * 3. Calendar dinamic până la sfârșitul lunii curente
 * 4. Geometrie variabilă a sălilor: Sala 6 IMAX (12x16), Sălile 4-5 4DX (6x8), Sălile 1-3 Standard (8x12)
 * 5. Checkout în 3 pași cu Configurator Snack Bar (Popcorn cu arome, Nachos cu pudră/sos, Băuturi)
 * 6. Sistem Card Membru (înregistrare cu Nume/Email, start de la 0 puncte, 1 punct la fiecare 3 RON)
 * 7. Roata Norocului securizată în Closure
 * 8. Asistent AI Concierge (Căutare spațială matriceală, Memorie Membru, Upsell contextual & NLP)
 */

// ==================== 1. CONFIGURARE FIREBASE & SINCRONIZARE LIVE ====================
const firebaseConfig = {
    apiKey: "DEMO_KEY",
    authDomain: "cinema-niii7.firebaseapp.com",
    databaseURL: "https://cinema-niii7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cinema-niii7",
    storageBucket: "cinema-niii7.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:000000000000"
};

let db = null;
let isFirebaseLive = false;
const realtimeChannel = new BroadcastChannel('niii7_live_seats_sync');
const sessionUserId = 'CLIENT_' + Math.random().toString(36).substring(2, 8).toUpperCase();
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute blocare temporară

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "DEMO_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        isFirebaseLive = true;
    }
} catch (e) {
    console.info("Sincronizare locală în timp real activă (BroadcastChannel).");
}

// ==================== 2. CONFIGURAȚIA CELOR 6 SĂLI & PREȚURI ====================
const HALL_CONFIGS = {
    'IMAX': {
        rows: 12,
        cols: 16,
        price: 45,
        label: 'Sala 6 • Amfiteatru IMAX Laser 70mm (192 locuri) • Bilet: 45 RON'
    },
    '4DX': {
        rows: 6,
        cols: 8,
        price: 50,
        label: 'Sală 4DX Motion • Module Mecanice 3G (48 locuri) • Bilet: 50 RON'
    },
    '2D': {
        rows: 8,
        cols: 12,
        price: 35,
        label: 'Sală Standard 2D • Proiecție Digitală (96 locuri) • Bilet: 35 RON'
    }
};

// Catalogul intern pentru AI și căutare rapidă
const MOVIES_CATALOG = [
    { id: 'opp_imax_1600', key: 'oppenheimer', title: 'Oppenheimer', time: '16:00', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 180, mood: 'profound' },
    { id: 'opp_2d_2030', key: 'oppenheimer', title: 'Oppenheimer', time: '20:30', hall: 'Sala 2 - Standard', format: '2D', duration: 180, mood: 'profound' },
    { id: 'int_imax_1245', key: 'interstellar', title: 'Interstellar', time: '12:45', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 169, mood: 'profound' },
    { id: 'int_2d_1930', key: 'interstellar', title: 'Interstellar', time: '19:30', hall: 'Sala 1 - Standard', format: '2D', duration: 169, mood: 'profound' },
    { id: 'inc_2d_1615', key: 'inception', title: 'Inception', time: '16:15', hall: 'Sala 1 - Standard', format: '2D', duration: 148, mood: 'action' },
    { id: 'inc_4dx_1730', key: 'inception', title: 'Inception', time: '17:30', hall: 'Sala 4 - 4DX', format: '4DX', duration: 148, mood: 'action' },
    { id: 'inc_2d_1830', key: 'inception', title: 'Inception', time: '18:30', hall: 'Sala 3 - Standard', format: '2D', duration: 148, mood: 'action' },
    { id: 'ody_imax_1000', key: 'odyssey', title: '2001: A Space Odyssey', time: '10:00', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 149, mood: 'profound' },
    { id: 'ody_2d_1300', key: 'odyssey', title: '2001: A Space Odyssey', time: '13:00', hall: 'Sala 1 - Standard', format: '2D', duration: 149, mood: 'profound' },
    { id: 'ava_2d_1700', key: 'avatar', title: 'Avatar: Fire and Ash', time: '17:00', hall: 'Sala 2 - Standard', format: '2D', duration: 190, mood: 'visual' },
    { id: 'ava_4dx_2030', key: 'avatar', title: 'Avatar: Fire and Ash', time: '20:30', hall: 'Sala 4 - 4DX', format: '4DX', duration: 190, mood: 'visual' },
    { id: 'ava_imax_2145', key: 'avatar', title: 'Avatar: Fire and Ash', time: '21:45', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 190, mood: 'visual' },
    { id: 'spv_2d_1400', key: 'spiderverse', title: 'Spider-Man: Across the Spider-Verse', time: '14:00', hall: 'Sala 2 - Standard', format: '2D', duration: 140, mood: 'visual' },
    { id: 'spv_4dx_1430', key: 'spiderverse', title: 'Spider-Man: Across the Spider-Verse', time: '14:30', hall: 'Sala 4 - 4DX', format: '4DX', duration: 140, mood: 'visual' },
    { id: 'spv_4dx_2115', key: 'spiderverse', title: 'Spider-Man: Across the Spider-Verse', time: '21:15', hall: 'Sala 5 - 4DX', format: '4DX', duration: 140, mood: 'visual' },
    { id: 'bnd_4dx_1500', key: 'spidermanbnd', title: 'Spider-Man: Brand New Day', time: '15:00', hall: 'Sala 5 - 4DX', format: '4DX', duration: 138, mood: 'action' },
    { id: 'bnd_2d_1530', key: 'spidermanbnd', title: 'Spider-Man: Brand New Day', time: '15:30', hall: 'Sala 3 - Standard', format: '2D', duration: 138, mood: 'action' },
    { id: 'bnd_imax_1915', key: 'spidermanbnd', title: 'Spider-Man: Brand New Day', time: '19:15', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 138, mood: 'action' },
    { id: 'doom_4dx_1800', key: 'doomsday', title: 'Avengers: Doomsday', time: '18:00', hall: 'Sala 5 - 4DX', format: '4DX', duration: 160, mood: 'action' },
    { id: 'doom_2d_2130', key: 'doomsday', title: 'Avengers: Doomsday', time: '21:30', hall: 'Sala 3 - Standard', format: '2D', duration: 160, mood: 'action' },
    { id: 'doom_imax_2245', key: 'doomsday', title: 'Avengers: Doomsday', time: '22:45', hall: 'Sala 6 - IMAX', format: 'IMAX', duration: 160, mood: 'action' }
];

// Starea globală a comenzii în curs
let currentBooking = {
    showId: null,
    movieTitle: '',
    time: '',
    hall: '',
    format: 'IMAX',
    duration: 160,
    dateISO: '',
    dateLabel: '',
    selectedSeats: [],
    snacksCart: [],
    appliedDiscountPercent: 0,
    appliedPromoCode: null
};

// ==================== 3. SEIF SECURIZAT ROATA NOROCULUI (CLOSURE) ====================
const PromoSecurityVault = (function () {
    let _hasSpunToday = false;
    let _wonCode = null;
    let _wonPercent = 0;

    return {
        registerSpinResult: function (code, percent) {
            if (_hasSpunToday) return false;
            _hasSpunToday = true;
            _wonCode = code;
            _wonPercent = percent;
            return true;
        },
        validateCode: function (inputCode) {
            if (!_hasSpunToday || !_wonCode || _wonPercent <= 0) {
                return {
                    valid: false,
                    message: "Nu există niciun cod câștigător activ. Învârte mai întâi Roata Norocului."
                };
            }
            if (inputCode.trim().toUpperCase() === _wonCode.toUpperCase()) {
                return { valid: true, percent: _wonPercent, code: _wonCode };
            }
            return {
                valid: false,
                message: "Codul introdus nu corespunde cu cel generat la Roata Norocului."
            };
        },
        hasSpun: function () {
            return _hasSpunToday;
        }
    };
})();

// ==================== 4. INIȚIALIZARE LA ÎNCĂRCAREA PAGINII ====================
document.addEventListener('DOMContentLoaded', () => {
    initMonthCalendar();
    initFormatFilters();
    initHTML5VideoTrailers();
    initWheelOfFortune();
    initMemberSystem();
    initCheckoutListeners();
    initOSIntegrations();
    initAIConcierge();
});

// ==================== 5. CALENDAR DINAMIC PÂNĂ LA SFÂRȘITUL LUNII CURENTE ====================
function initMonthCalendar() {
    const container = document.getElementById('calendar-days-container');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dayNamesShort = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const monthNamesShort = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let d = today.getDate(); d <= lastDayOfMonth; d++) {
        const dateObj = new Date(currentYear, currentMonth, d);
        const isoDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = (d === today.getDate());
        const isTomorrow = (d === today.getDate() + 1);

        let topLabel = dayNamesShort[dateObj.getDay()];
        if (isToday) topLabel = 'Azi';
        else if (isTomorrow) topLabel = 'Mâine';

        const bottomLabel = `${d} ${monthNamesShort[currentMonth]}`;
        const fullReadable = `${topLabel}, ${bottomLabel} ${currentYear}`;

        const btn = document.createElement('button');
        btn.className = 'date-btn' + (isToday ? ' active' : '');
        btn.setAttribute('data-iso', isoDate);
        btn.setAttribute('data-readable', fullReadable);
        btn.innerHTML = `
            <span class="day-name">${topLabel}</span>
            <span class="day-num">${bottomLabel}</span>
        `;

        if (isToday) {
            currentBooking.dateISO = isoDate;
            currentBooking.dateLabel = fullReadable;
        }

        btn.addEventListener('click', () => {
            container.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBooking.dateISO = isoDate;
            currentBooking.dateLabel = fullReadable;
        });

        container.appendChild(btn);
    }
}

// ==================== 6. FILTRARE FORMATE & TRAILERE HTML5 VIDEO LA HOVER ====================
function initFormatFilters() {
    const formatBtns = document.querySelectorAll('.format-btn');
    const movieCards = document.querySelectorAll('.movie-card');

    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const format = btn.getAttribute('data-format');
            movieCards.forEach(card => {
                card.classList.remove('ai-highlight');
                const cardFormats = card.getAttribute('data-formats').split(',');
                if (format === 'all' || cardFormats.includes(format)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function initHTML5VideoTrailers() {
    const cards = document.querySelectorAll('.movie-card');

    cards.forEach(card => {
        const video = card.querySelector('.trailer-video');
        if (!video) return;

        let hoverTimer = null;

        card.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                card.classList.add('preview-active');
                video.muted = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Fallback silențios dacă fișierul local nu este prezent
                    });
                }
            }, 220);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            card.classList.remove('preview-active');
            video.pause();
            video.currentTime = 0;
        });
    });
}

// ==================== 7. ROATA NOROCULUI (CANVAS & VALIDARE STRICTĂ) ====================
const wheelSegments = [
    { label: "-15% COMANDĂ", percent: 15, code: "NIII7-15", color: "#ff6600" },
    { label: "MAI ÎNCEARCĂ", percent: 0, code: null, color: "#141414" },
    { label: "-10% COMANDĂ", percent: 10, code: "NIII7-10", color: "#262626" },
    { label: "-20% IMAX VIP", percent: 20, code: "NIII7-20", color: "#ff6600" },
    { label: "NECÂȘTIGĂTOR", percent: 0, code: null, color: "#141414" },
    { label: "-5% STANDARD", percent: 5, code: "NIII7-05", color: "#262626" }
];

function initWheelOfFortune() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('btn-spin-wheel');

    drawWheelCanvas(ctx, canvas.width, canvas.height);

    spinBtn.addEventListener('click', () => {
        if (PromoSecurityVault.hasSpun()) return;

        spinBtn.disabled = true;
        const statusText = document.getElementById('wheel-status-text');
        statusText.textContent = "Roata se învârte...";

        // Selectăm aleatoriu un segment
        const winningIndex = [0, 2, 3, 5, 1][Math.floor(Math.random() * 5)];
        const sliceDeg = 360 / wheelSegments.length;
        const targetAngle = 270 - (winningIndex * sliceDeg) - (sliceDeg / 2);
        const totalRotation = (360 * 6) + targetAngle;

        canvas.style.transition = "transform 4.2s cubic-bezier(0.15, 0.85, 0.25, 1)";
        canvas.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            const seg = wheelSegments[winningIndex];
            const randomPin = Math.floor(100 + Math.random() * 900);
            const generatedCode = seg.code ? `${seg.code}-${randomPin}` : null;

            PromoSecurityVault.registerSpinResult(generatedCode, seg.percent);

            if (seg.percent > 0) {
                statusText.textContent = `Ai câștigat ${seg.percent}% reducere! Codul a fost deblocat pentru coșul tău.`;
                document.getElementById('generated-promo-code').textContent = generatedCode;
                document.getElementById('won-code-display').classList.remove('hidden');

                const promoInput = document.getElementById('input-promo-code');
                if (promoInput) promoInput.value = generatedCode;
            } else {
                statusText.textContent = "Rotire necâștigătoare astăzi. Te așteptăm mâine pentru o nouă încercare!";
            }
            spinBtn.textContent = "Rotire Utilizată Astăzi";
        }, 4300);
    });
}

function drawWheelCanvas(ctx, width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 8;
    const arcRad = (2 * Math.PI) / wheelSegments.length;

    ctx.clearRect(0, 0, width, height);

    wheelSegments.forEach((seg, index) => {
        const start = index * arcRad;
        const end = start + arcRad;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arcRad / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Oswald', sans-serif";
        ctx.fillText(seg.label, radius - 18, 5);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff6600";
    ctx.stroke();
}

// ==================== 8. GESTIUNE REZERVARE ÎN 3 PAȘI & HĂRȚI SĂLI ====================
function getShowStorageKey(showId, dateISO) {
    return `niii7_hall_${showId}_${dateISO}`;
}

function getDefaultOccupiedForFormat(format) {
    if (format === 'IMAX') {
        return ['R6-L8', 'R6-L9', 'R7-L7', 'R7-L8', 'R7-L9', 'R7-L10', 'R8-L5', 'R8-L6'];
    } else if (format === '4DX') {
        return ['R3-L4', 'R3-L5', 'R4-L3', 'R4-L4'];
    }
    return ['R4-L6', 'R4-L7', 'R5-L5', 'R5-L6'];
}

function getHallSeatsState(showId, dateISO, format) {
    const key = getShowStorageKey(showId, dateISO);
    const raw = localStorage.getItem(key);
    let state = raw ? JSON.parse(raw) : {};
    const now = Date.now();

    if (Object.keys(state).length === 0) {
        const defaults = getDefaultOccupiedForFormat(format);
        defaults.forEach(seat => {
            state[seat] = { status: 'occupied', lockedBy: 'SYSTEM', timestamp: now };
        });
        localStorage.setItem(key, JSON.stringify(state));
    }

    // Eliberăm automat scaunele blocate temporar care au expirat (> 5 min)
    let changed = false;
    Object.keys(state).forEach(seatId => {
        if (state[seatId].status === 'locked' && (now - state[seatId].timestamp > LOCK_TIMEOUT_MS)) {
            delete state[seatId];
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(key, JSON.stringify(state));
    }
    return state;
}

function setSeatStatusLive(showId, dateISO, seatId, status) {
    const now = Date.now();
    const key = getShowStorageKey(showId, dateISO);

    if (isFirebaseLive && db) {
        const ref = db.ref(`bookings/${dateISO}/${showId}/${seatId}`);
        if (status === 'available') ref.remove();
        else ref.set({ status, lockedBy: sessionUserId, timestamp: now });
    } else {
        const state = getHallSeatsState(showId, dateISO, currentBooking.format);
        if (status === 'available') {
            delete state[seatId];
        } else {
            state[seatId] = { status, lockedBy: sessionUserId, timestamp: now };
        }
        localStorage.setItem(key, JSON.stringify(state));
        realtimeChannel.postMessage({ showId, dateISO });
    }
}

realtimeChannel.onmessage = (e) => {
    if (
        e.data &&
        e.data.showId === currentBooking.showId &&
        e.data.dateISO === currentBooking.dateISO
    ) {
        renderHallMap();
        updateStep1Footer();
    }
};

function openBookingModal(showId, title, time, hall, format, duration = 160, preselectedSeats = [], preconfiguredSnacks = []) {
    // Dacă existau scaune blocate anterior și neconfirmate, le eliberăm
    releaseCurrentLockedSeats();

    currentBooking.showId = showId;
    currentBooking.movieTitle = title;
    currentBooking.time = time;
    currentBooking.hall = hall;
    currentBooking.format = format || '2D';
    currentBooking.duration = duration;
    currentBooking.selectedSeats = [];
    currentBooking.snacksCart = [...preconfiguredSnacks];
    currentBooking.appliedDiscountPercent = 0;
    currentBooking.appliedPromoCode = null;

    document.getElementById('booking-movie-title').textContent = title;
    document.getElementById('booking-movie-meta').textContent =
        `${hall} (${currentBooking.format}) | ${currentBooking.dateLabel} • Ora ${time}`;

    const hallCfg = HALL_CONFIGS[currentBooking.format] || HALL_CONFIGS['2D'];
    document.getElementById('hall-dimension-info').textContent = hallCfg.label;

    // Adaptăm vizual ecranul dacă este Sala 6 IMAX
    const screenContainer = document.getElementById('screen-container');
    const screenElement = document.getElementById('screen-element');
    if (currentBooking.format === 'IMAX') {
        screenContainer.classList.add('imax-screen-wrap');
        screenElement.classList.add('imax-screen');
        screenElement.textContent = 'ECRAN CURBAT IMAX LASER 70MM (SALA 6)';
    } else {
        screenContainer.classList.remove('imax-screen-wrap');
        screenElement.classList.remove('imax-screen');
        screenElement.textContent = `ECRAN PROIECȚIE (${hall.toUpperCase()})`;
    }

    // Dacă AI-ul a trimis scaune pre-selectate, le blocăm acum
    if (preselectedSeats.length > 0) {
        const state = getHallSeatsState(showId, currentBooking.dateISO, currentBooking.format);
        preselectedSeats.forEach(seatId => {
            if (!state[seatId]) {
                currentBooking.selectedSeats.push(seatId);
                setSeatStatusLive(showId, currentBooking.dateISO, seatId, 'locked');
            }
        });
    }

    renderHallMap();
    updateStep1Footer();
    renderSnacksCart();
    updateContextualAISnackBanner();
    goToCheckoutStep(1);

    document.getElementById('booking-modal').classList.remove('hidden');
}
window.openBookingModal = openBookingModal;

function releaseCurrentLockedSeats() {
    if (currentBooking.showId && currentBooking.selectedSeats.length > 0) {
        currentBooking.selectedSeats.forEach(seatId => {
            setSeatStatusLive(currentBooking.showId, currentBooking.dateISO, seatId, 'available');
        });
        currentBooking.selectedSeats = [];
    }
}

function closeBookingModal() {
    releaseCurrentLockedSeats();
    document.getElementById('booking-modal').classList.add('hidden');
}
window.closeBookingModal = closeBookingModal;

function renderHallMap() {
    const grid = document.getElementById('seats-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const cfg = HALL_CONFIGS[currentBooking.format] || HALL_CONFIGS['2D'];
    const state = getHallSeatsState(currentBooking.showId, currentBooking.dateISO, currentBooking.format);

    for (let r = 1; r <= cfg.rows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row' + (currentBooking.format === '4DX' ? ' row-4dx' : '');

        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = `R${r}`;
        rowDiv.appendChild(label);

        for (let c = 1; c <= cfg.cols; c++) {
            const seatId = `R${r}-L${c}`;
            const btn = document.createElement('button');
            btn.className = 'seat';
            if (currentBooking.format === 'IMAX') btn.classList.add('seat-imax');
            if (currentBooking.format === '4DX' && c === 4) btn.classList.add('seat-4dx-gap');

            btn.textContent = c;
            const seatInfo = state[seatId];

            if (seatInfo) {
                if (seatInfo.status === 'occupied') {
                    btn.classList.add('occupied');
                    btn.disabled = true;
                } else if (seatInfo.status === 'locked') {
                    if (seatInfo.lockedBy === sessionUserId) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.add('locked');
                        btn.disabled = true;
                        btn.title = 'Loc blocat în timp real de un alt utilizator';
                    }
                }
            } else {
                btn.classList.add('available');
            }

            btn.addEventListener('click', () => toggleSeat(seatId));
            rowDiv.appendChild(btn);
        }

        grid.appendChild(rowDiv);
    }
}

function toggleSeat(seatId) {
    const state = getHallSeatsState(currentBooking.showId, currentBooking.dateISO, currentBooking.format);
    const existing = state[seatId];
    if (existing && existing.lockedBy !== sessionUserId) return;

    const idx = currentBooking.selectedSeats.indexOf(seatId);
    if (idx > -1) {
        currentBooking.selectedSeats.splice(idx, 1);
        setSeatStatusLive(currentBooking.showId, currentBooking.dateISO, seatId, 'available');
    } else {
        if (currentBooking.selectedSeats.length >= 10) {
            alert("Poți selecta maximum 10 locuri la o singură rezervare.");
            return;
        }
        currentBooking.selectedSeats.push(seatId);
        setSeatStatusLive(currentBooking.showId, currentBooking.dateISO, seatId, 'locked');
    }

    renderHallMap();
    updateStep1Footer();
}

function updateStep1Footer() {
    const seatsText = document.getElementById('step1-selected-seats');
    const pricePreview = document.getElementById('step1-price-preview');
    const nextBtn = document.getElementById('btn-to-step-2');
    const cfg = HALL_CONFIGS[currentBooking.format] || HALL_CONFIGS['2D'];

    if (currentBooking.selectedSeats.length === 0) {
        seatsText.textContent = 'Niciun loc selectat';
        pricePreview.textContent = '(0 RON)';
        nextBtn.disabled = true;
    } else {
        seatsText.textContent = currentBooking.selectedSeats.join(', ');
        const totalSeatsCost = currentBooking.selectedSeats.length * cfg.price;
        pricePreview.textContent = `(${totalSeatsCost} RON)`;
        nextBtn.disabled = false;
    }
}

function goToCheckoutStep(stepNum) {
    if (stepNum > 1 && currentBooking.selectedSeats.length === 0) return;

    [1, 2, 3].forEach(n => {
        document.getElementById(`checkout-step-${n}`).classList.toggle('hidden', n !== stepNum);
        document.getElementById(`step-indicator-${n}`).classList.toggle('active', n === stepNum);
    });

    if (stepNum === 2) {
        updateContextualAISnackBanner();
        renderSnacksCart();
    } else if (stepNum === 3) {
        populateFinalStepSummary();
    }
}
window.goToCheckoutStep = goToCheckoutStep;

// ==================== 9. PASUL 2: CONFIGURATOR SNACK BAR ====================
function addConfiguredSnack(category) {
    let item = null;

    if (category === 'popcorn') {
        const sizeEl = document.getElementById('popcorn-size');
        const flavorEl = document.getElementById('popcorn-flavor');
        const size = sizeEl.value;
        const price = parseInt(sizeEl.options[sizeEl.selectedIndex].getAttribute('data-price'), 10);
        const flavor = flavorEl.value; // Sare / Aromă de brânză / Aromă de sweet chili

        item = {
            id: 'SNK_' + Date.now() + Math.random().toString(36).substring(2, 5),
            category: 'Popcorn',
            title: `Popcorn ${size}`,
            details: `Cu ${flavor}`,
            price: price
        };
    } else if (category === 'nachos') {
        const sizeEl = document.getElementById('nachos-size');
        const powderEl = document.getElementById('nachos-powder');
        const sauceEl = document.getElementById('nachos-sauce');
        const size = sizeEl.value;
        const price = parseInt(sizeEl.options[sizeEl.selectedIndex].getAttribute('data-price'), 10);
        const powder = powderEl.value;
        const sauce = sauceEl.value;

        item = {
            id: 'SNK_' + Date.now() + Math.random().toString(36).substring(2, 5),
            category: 'Nachos',
            title: `Nachos ${size}`,
            details: `${powder} + ${sauce}`,
            price: price
        };
    } else if (category === 'drink') {
        const typeEl = document.getElementById('drink-type');
        const sizeEl = document.getElementById('drink-size');
        const type = typeEl.value;
        const size = sizeEl.value;
        const price = parseInt(sizeEl.options[sizeEl.selectedIndex].getAttribute('data-price'), 10);

        item = {
            id: 'SNK_' + Date.now() + Math.random().toString(36).substring(2, 5),
            category: 'Băutură',
            title: `${type} (${size})`,
            details: 'Răcoritoare Bar NIII7',
            price: price
        };
    }

    if (item) {
        currentBooking.snacksCart.push(item);
        renderSnacksCart();
    }
}
window.addConfiguredSnack = addConfiguredSnack;

function removeSnackFromCart(snackId) {
    currentBooking.snacksCart = currentBooking.snacksCart.filter(item => item.id !== snackId);
    renderSnacksCart();
}
window.removeSnackFromCart = removeSnackFromCart;

function renderSnacksCart() {
    const listEl = document.getElementById('snacks-cart-list');
    const subtotalEl = document.getElementById('snacks-subtotal-val');
    if (!listEl || !subtotalEl) return;

    if (currentBooking.snacksCart.length === 0) {
        listEl.innerHTML = '<p class="text-muted">Nu ai adăugat încă produse de la bar.</p>';
        subtotalEl.textContent = '0 RON';
        return;
    }

    listEl.innerHTML = currentBooking.snacksCart.map(item => `
        <div class="snack-cart-item">
            <div>
                <div class="snack-cart-item-title">${item.title} — <span class="text-orange">${item.price} RON</span></div>
                <div class="snack-cart-item-sub">${item.details}</div>
            </div>
            <button class="btn-remove-snack" onclick="removeSnackFromCart('${item.id}')" title="Elimină produsul">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    const snacksTotal = currentBooking.snacksCart.reduce((acc, s) => acc + s.price, 0);
    subtotalEl.textContent = `${snacksTotal} RON`;
}

function updateContextualAISnackBanner() {
    const banner = document.getElementById('ai-snack-upsell-banner');
    if (!banner) return;

    const hour = parseInt((currentBooking.time || '19:00').split(':')[0], 10);
    const numSeats = currentBooking.selectedSeats.length;
    let suggestionHTML = '';

    if (currentBooking.duration >= 165) {
        suggestionHTML = `
            <strong>Recomandare AI (Durată ${currentBooking.duration} min):</strong> Filmul <em>${currentBooking.movieTitle}</em> are o durată extinsă. Pentru ${numSeats} ${numSeats === 1 ? 'persoană' : 'persoane'}, îți recomandăm mărimea <strong>Mare</strong> la Popcorn sau Nachos.
        `;
    } else if (hour >= 21) {
        suggestionHTML = `
            <strong>Recomandare AI (Proiecție de seară ${currentBooking.time}):</strong> Pentru orele târzii, mulți membri aleg <strong>Pepsi Zero</strong> sau <strong>Apă Plată</strong> alături de Nachos cu sos de brânză.
        `;
    }

    if (suggestionHTML) {
        banner.innerHTML = suggestionHTML;
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

// ==================== 10. PASUL 3: SUMAR, DISCOUNT & PUNCTE MEMBRU (1 PCT / 3 RON) ====================
function populateFinalStepSummary() {
    const cfg = HALL_CONFIGS[currentBooking.format] || HALL_CONFIGS['2D'];
    const ticketsSubtotal = currentBooking.selectedSeats.length * cfg.price;
    const snacksSubtotal = currentBooking.snacksCart.reduce((acc, s) => acc + s.price, 0);
    const rawTotal = ticketsSubtotal + snacksSubtotal;
    const discountAmount = Math.round((rawTotal * currentBooking.appliedDiscountPercent) / 100);
    const finalTotal = rawTotal - discountAmount;

    // 1 punct pentru fiecare 3 RON cheltuiți
    const earnedPoints = Math.floor(finalTotal / 3);

    document.getElementById('sum-movie').textContent = currentBooking.movieTitle;
    document.getElementById('sum-hall').textContent = `${currentBooking.hall} (Format ${currentBooking.format})`;
    document.getElementById('sum-datetime').textContent = `${currentBooking.dateLabel}, Ora ${currentBooking.time}`;
    document.getElementById('sum-seats').textContent = currentBooking.selectedSeats.join(', ');

    const sumSnacksEl = document.getElementById('sum-snacks-items');
    if (currentBooking.snacksCart.length === 0) {
        sumSnacksEl.textContent = 'Fără produse de la bar.';
    } else {
        sumSnacksEl.innerHTML = currentBooking.snacksCart
            .map(s => `<div>• ${s.title} (${s.details}) — ${s.price} RON</div>`)
            .join('');
    }

    document.getElementById('final-tickets-subtotal').textContent = `${ticketsSubtotal} RON`;
    document.getElementById('final-snacks-subtotal').textContent = `${snacksSubtotal} RON`;

    const discountRow = document.getElementById('final-discount-row');
    if (currentBooking.appliedDiscountPercent > 0) {
        discountRow.classList.remove('hidden');
        document.getElementById('final-discount-val').textContent =
            `-${discountAmount} RON (-${currentBooking.appliedDiscountPercent}%)`;
    } else {
        discountRow.classList.add('hidden');
    }

    document.getElementById('final-total-pay').textContent = `${finalTotal} RON`;

    const memberProfile = getMemberProfile();
    const loyaltyMsgEl = document.getElementById('loyalty-checkout-msg');
    if (memberProfile) {
        loyaltyMsgEl.innerHTML = `Card Membru Activ (<strong>${memberProfile.name}</strong>): Vei primi <strong class="text-orange">${earnedPoints} PCT</strong> pentru această comandă (1 punct / 3 RON).`;
    } else {
        loyaltyMsgEl.innerHTML = `Această comandă valorează <strong class="text-orange">${earnedPoints} PCT</strong> (1 punct / 3 RON). Creează-ți un Card de Membru din meniu pentru a acumula punctele!`;
    }
}

function initCheckoutListeners() {
    const applyPromoBtn = document.getElementById('btn-apply-promo');
    const promoInput = document.getElementById('input-promo-code');
    const promoFeedback = document.getElementById('promo-feedback');
    const confirmBtn = document.getElementById('btn-confirm-booking');

    applyPromoBtn.addEventListener('click', () => {
        const res = PromoSecurityVault.validateCode(promoInput.value);
        if (res.valid) {
            currentBooking.appliedDiscountPercent = res.percent;
            currentBooking.appliedPromoCode = res.code;
            promoFeedback.textContent = `Cod validat! Reducere de ${res.percent}% aplicată întregii comenzi.`;
            promoFeedback.style.color = '#ff6600';
        } else {
            currentBooking.appliedDiscountPercent = 0;
            currentBooking.appliedPromoCode = null;
            promoFeedback.textContent = res.message;
            promoFeedback.style.color = '#cccccc';
        }
        populateFinalStepSummary();
    });

    confirmBtn.addEventListener('click', () => {
        if (currentBooking.selectedSeats.length === 0) return;

        // Marcăm scaunele definitiv ca 'occupied' (vândute)
        currentBooking.selectedSeats.forEach(seatId => {
            setSeatStatusLive(currentBooking.showId, currentBooking.dateISO, seatId, 'occupied');
        });

        const cfg = HALL_CONFIGS[currentBooking.format] || HALL_CONFIGS['2D'];
        const ticketsSubtotal = currentBooking.selectedSeats.length * cfg.price;
        const snacksSubtotal = currentBooking.snacksCart.reduce((acc, s) => acc + s.price, 0);
        const rawTotal = ticketsSubtotal + snacksSubtotal;
        const discountAmount = Math.round((rawTotal * currentBooking.appliedDiscountPercent) / 100);
        const finalTotal = rawTotal - discountAmount;
        const earnedPoints = Math.floor(finalTotal / 3);

        // Actualizăm Cardul de Membru (dacă utilizatorul s-a înregistrat)
        const member = getMemberProfile();
        if (member) {
            member.points += earnedPoints;
            member.bookingsCount += 1;
            member.snacksCount += currentBooking.snacksCart.length;
            if (currentBooking.snacksCart.length > 0) {
                member.lastSnacks = [...currentBooking.snacksCart];
            }
            saveMemberProfile(member);
            refreshMemberUI();
        }

        // Salvăm și în memoria AI-ului ultima gustare comandată
        if (currentBooking.snacksCart.length > 0) {
            localStorage.setItem('niii7_last_snacks_memory', JSON.stringify(currentBooking.snacksCart));
        }

        const confirmedSeats = [...currentBooking.selectedSeats];
        const confirmedSnacks = [...currentBooking.snacksCart];

        // Golește lista curentă ca să nu fie eliberată la închiderea modalului
        currentBooking.selectedSeats = [];
        document.getElementById('booking-modal').classList.add('hidden');

        generateMasterTicket(confirmedSeats, confirmedSnacks, finalTotal);
    });
}

// ==================== 11. BILETUL DIGITAL MASTER & CALENDAR OS ====================
function generateMasterTicket(seats, snacks, finalTotal) {
    const bookingId = 'N7-' + Math.floor(100000 + Math.random() * 900000);

    document.getElementById('ticket-movie-name').textContent = currentBooking.movieTitle;
    document.getElementById('ticket-hall-time').textContent =
        `${currentBooking.hall} | ${currentBooking.dateLabel} • Ora ${currentBooking.time}`;
    document.getElementById('ticket-seats-confirmed').textContent = seats.join(', ');

    const snacksText = snacks.length > 0
        ? snacks.map(s => `${s.title} (${s.details})`).join('; ')
        : 'Fără produse de la bar';
    document.getElementById('ticket-snacks-confirmed').textContent = snacksText;
    document.getElementById('ticket-total-paid').textContent = `${finalTotal} RON`;
    document.getElementById('ticket-booking-id').textContent = `#${bookingId}`;

    const qrBox = document.getElementById('ticket-qr-code');
    qrBox.innerHTML = '';
    new QRCode(qrBox, {
        text: JSON.stringify({
            id: bookingId,
            film: currentBooking.movieTitle,
            sala: currentBooking.hall,
            data: currentBooking.dateISO,
            ora: currentBooking.time,
            locuri: seats,
            bar: snacks.map(s => s.title),
            total: `${finalTotal} RON`
        }),
        width: 120,
        height: 120,
        colorDark: "#000000",
        colorLight: "#ffffff"
    });

    // Salvăm biletul pentru butonul "Biletele Mele"
    localStorage.setItem('niii7_saved_ticket', JSON.stringify({
        bookingSnapshot: { ...currentBooking },
        seats,
        snacks,
        finalTotal
    }));

    document.getElementById('ticket-modal').classList.remove('hidden');
}

function closeTicketModal() {
    document.getElementById('ticket-modal').classList.add('hidden');
}
window.closeTicketModal = closeTicketModal;

function initOSIntegrations() {
    document.getElementById('btn-google-cal').addEventListener('click', () => {
        const { startISO, endISO } = buildEventTimestamps(currentBooking.dateISO, currentBooking.time, currentBooking.duration);
        const title = encodeURIComponent(`Cinema NIII7: ${currentBooking.movieTitle}`);
        const details = encodeURIComponent(`Sală: ${currentBooking.hall}. Prezintă codul QR la intrare și la Snack Bar.`);
        const loc = encodeURIComponent("Cinema NIII7, Strada Zaharia Stancu Nr. 1, Brașov");
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${loc}`, '_blank');
    });

    document.getElementById('btn-apple-ics').addEventListener('click', () => {
        const { startISO, endISO } = buildEventTimestamps(currentBooking.dateISO, currentBooking.time, currentBooking.duration);
        const icsLines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Cinema NIII7 Brasov//RO",
            "BEGIN:VEVENT",
            `DTSTART:${startISO}`,
            `DTEND:${endISO}`,
            `SUMMARY:Cinema NIII7 - ${currentBooking.movieTitle}`,
            `DESCRIPTION:Proiecție în ${currentBooking.hall}.`,
            "LOCATION:Cinema NIII7, Brașov",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Bilet_NIII7_${currentBooking.movieTitle.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    const pushBtn = document.getElementById('btn-push-notify');
    pushBtn.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("Browserul tău nu suportă notificări native.");
            return;
        }
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                new Notification("Reminder Activat — Cinema NIII7 Brașov", {
                    body: `Rezervare confirmată la ${currentBooking.movieTitle} (${currentBooking.hall}, ora ${currentBooking.time}).`
                });
                pushBtn.textContent = "Alertă Activă";
                pushBtn.disabled = true;
            }
        });
    });

    document.getElementById('btn-my-tickets').addEventListener('click', () => {
        const saved = localStorage.getItem('niii7_saved_ticket');
        if (!saved) {
            alert("Nu ai niciun bilet salvat în această sesiune. Alege o oră din program pentru a rezerva.");
            return;
        }
        const data = JSON.parse(saved);
        currentBooking = data.bookingSnapshot;
        generateMasterTicket(data.seats, data.snacks, data.finalTotal);
    });
}

function buildEventTimestamps(dateISO, timeStr, durationMin = 150) {
    const [year, month, day] = (dateISO || '2026-10-29').split('-').map(Number);
    const [hours, minutes] = (timeStr || '19:30').split(':').map(Number);
    const start = new Date(year, month - 1, day, hours, minutes, 0);
    const end = new Date(start.getTime() + durationMin * 60000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return { startISO: fmt(start), endISO: fmt(end) };
}

// ==================== 12. SISTEM CARD DE MEMBRU NIII7 (START DE LA 0 PCT) ====================
function getMemberProfile() {
    const raw = localStorage.getItem('niii7_member_profile');
    return raw ? JSON.parse(raw) : null;
}

function saveMemberProfile(profile) {
    localStorage.setItem('niii7_member_profile', JSON.stringify(profile));
}

function initMemberSystem() {
    const navBtn = document.getElementById('btn-member-nav');
    const regForm = document.getElementById('member-registration-form');

    navBtn.addEventListener('click', () => {
        refreshMemberUI();
        document.getElementById('member-modal').classList.remove('hidden');
    });

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('member-input-name').value.trim();
        const email = document.getElementById('member-input-email').value.trim();
        if (!name || !email) return;

        const newProfile = {
            id: 'N7-' + Math.floor(10000 + Math.random() * 90000),
            name: name.toUpperCase(),
            email: email.toLowerCase(),
            points: 0, // Începe strict de la 0 puncte
            bookingsCount: 0,
            snacksCount: 0,
            lastSnacks: []
        };

        saveMemberProfile(newProfile);
        refreshMemberUI();
        updateAIWelcomeForMember();
    });

    init3DCardTiltEffect();
    refreshMemberUI();
}

function refreshMemberUI() {
    const profile = getMemberProfile();
    const navText = document.getElementById('member-nav-text');
    const modalTitle = document.getElementById('member-modal-title');
    const regView = document.getElementById('member-register-view');
    const cardView = document.getElementById('member-card-view');

    if (!profile) {
        navText.textContent = 'Devino Membru';
        modalTitle.textContent = 'Înregistrare Card Membru NIII7';
        regView.classList.remove('hidden');
        cardView.classList.add('hidden');
    } else {
        navText.textContent = `Card Membru (${profile.points} PCT)`;
        modalTitle.textContent = 'Cardul Tău de Membru NIII7';
        regView.classList.add('hidden');
        cardView.classList.remove('hidden');

        document.getElementById('card-display-id').textContent = `ID: ${profile.id}`;
        document.getElementById('card-display-name').textContent = profile.name;
        document.getElementById('card-display-email').textContent = profile.email;
        document.getElementById('member-points-val').textContent = profile.points;
        document.getElementById('member-stat-bookings').textContent = profile.bookingsCount;
        document.getElementById('member-stat-snacks').textContent = profile.snacksCount;

        const progressPct = Math.min(100, profile.points);
        document.getElementById('loyalty-progress-text').textContent = `${profile.points} / 100 PCT`;
        document.getElementById('loyalty-progress-bar').style.width = `${progressPct}%`;
    }
}

function init3DCardTiltEffect() {
    const area = document.getElementById('card-3d-area');
    const card = document.getElementById('member-card-element');
    const glare = document.getElementById('card-glare');
    if (!area || !card) return;

    area.addEventListener('mousemove', (e) => {
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotX = ((y - cy) / cy) * -14;
        const rotY = ((x - cx) / cx) * 14;
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        if (glare) {
            const gx = (x / rect.width) * 100;
            const gy = (y / rect.height) * 100;
            glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22), transparent 60%)`;
        }
    });

    area.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        if (glare) glare.style.background = 'none';
    });
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.add('hidden');
}
window.closeMemberModal = closeMemberModal;

// ==================== 13. ASISTENT AI CONCIERGE AVANSAT ====================
function initAIConcierge() {
    const toggleBtn = document.getElementById('ai-toggle-btn');
    const panel = document.getElementById('ai-chat-panel');
    const chevron = document.getElementById('ai-chevron');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-user-input');

    toggleBtn.addEventListener('click', () => {
        const isHidden = panel.classList.toggle('hidden');
        chevron.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    });

    updateAIWelcomeForMember();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        appendAIMessage(text, true);
        input.value = '';
        processNaturalLanguageQuery(text);
    });
}

function updateAIWelcomeForMember() {
    const profile = getMemberProfile();
    const welcomeEl = document.getElementById('ai-welcome-msg');
    if (!welcomeEl || !profile) return;

    let msg = `Salutare, <strong>${profile.name}</strong>! Ai <strong>${profile.points} puncte</strong> pe cardul NIII7. `;
    if (profile.lastSnacks && profile.lastSnacks.length > 0) {
        const lastNames = profile.lastSnacks.map(s => `${s.title} (${s.details})`).join(' + ');
        msg += `Îmi amintesc că la ultima vizită ai comandat <em>${lastNames}</em>. Scrie-mi câte locuri dorești și la ce film, sau apasă pe "Repetă Ultimul Meniu".`;
    } else {
        msg += `Scrie-mi în limbaj natural ce dorești (ex: "3 locuri la Interstellar și un popcorn mare cu aromă de brânză").`;
    }
    welcomeEl.innerHTML = msg;
}

function appendAIMessage(htmlContent, isUser = false) {
    const box = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-msg' + (isUser ? ' ai-msg-user' : '');
    div.innerHTML = htmlContent;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

/**
 * Algoritm Matriceal de Căutare Spațială (Spatial Seating Matrix)
 * Caută `count` locuri libere consecutive cât mai aproape de centrul acustic al sălii.
 */
function findOptimalConsecutiveSeats(showId, dateISO, format, count) {
    const cfg = HALL_CONFIGS[format] || HALL_CONFIGS['2D'];
    const state = getHallSeatsState(showId, dateISO, format);
    const idealRow = Math.ceil(cfg.rows * 0.58); // Zona acustică optimă (~60% distanță de ecran)
    const idealColCenter = (cfg.cols + 1) / 2;

    // Ordonăm rândurile după apropierea față de rândul ideal
    const rowOrder = [];
    for (let r = 1; r <= cfg.rows; r++) rowOrder.push(r);
    rowOrder.sort((a, b) => Math.abs(a - idealRow) - Math.abs(b - idealRow));

    for (const r of rowOrder) {
        let bestBlock = null;
        let bestDistance = Infinity;

        for (let startCol = 1; startCol <= cfg.cols - count + 1; startCol++) {
            const candidate = [];
            let allFree = true;
            for (let k = 0; k < count; k++) {
                const seatId = `R${r}-L${startCol + k}`;
                if (state[seatId]) {
                    allFree = false;
                    break;
                }
                candidate.push(seatId);
            }

            if (allFree) {
                const blockCenter = startCol + (count - 1) / 2;
                const dist = Math.abs(blockCenter - idealColCenter);
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestBlock = candidate;
                }
            }
        }

        if (bestBlock) return bestBlock;
    }

    // Fallback: dacă sala este foarte plină, luăm primele `count` locuri libere individuale
    const fallbackSeats = [];
    for (const r of rowOrder) {
        for (let c = 1; c <= cfg.cols; c++) {
            const seatId = `R${r}-L${c}`;
            if (!state[seatId]) {
                fallbackSeats.push(seatId);
                if (fallbackSeats.length === count) return fallbackSeats;
            }
        }
    }
    return fallbackSeats;
}

function triggerAIQuickAction(actionType) {
    if (actionType === 'find_2_seats' || actionType === 'find_4_seats') {
        const count = actionType === 'find_2_seats' ? 2 : 4;
        const targetMovie = MOVIES_CATALOG.find(m => m.id === 'doom_imax_2245') || MOVIES_CATALOG[0];
        const seats = findOptimalConsecutiveSeats(targetMovie.id, currentBooking.dateISO, targetMovie.format, count);

        appendAIMessage(`
            Am scanat live <strong>${targetMovie.hall}</strong> pentru <em>${targetMovie.title}</em> (ora ${targetMovie.time}) și am găsit ${count} locuri libere consecutive în centrul acustic: <strong class="text-orange">${seats.join(', ')}</strong>.
            <button class="btn-primary btn-sm btn-block mt-2" onclick='openBookingModal("${targetMovie.id}", "${targetMovie.title}", "${targetMovie.time}", "${targetMovie.hall}", "${targetMovie.format}", ${targetMovie.duration}, ${JSON.stringify(seats)})'>
                Rezervă Locurile ${seats.join(', ')}
            </button>
        `);
    } else if (actionType === 'mood_imax') {
        document.querySelectorAll('.movie-card').forEach(card => {
            const formats = card.getAttribute('data-formats') || '';
            card.classList.toggle('ai-highlight', formats.includes('IMAX'));
        });
        appendAIMessage(`
            Am evidențiat în grilă filmele disponibile în <strong>Sala 6 - IMAX Laser 70mm</strong>: <em>Oppenheimer, Interstellar, 2001: A Space Odyssey, Avatar: Fire and Ash, Spider-Man: Brand New Day</em> și <em>Avengers: Doomsday</em>.
        `);
    } else if (actionType === 'repeat_last_snack') {
        const profile = getMemberProfile();
        const savedMem = localStorage.getItem('niii7_last_snacks_memory');
        const snacksToRepeat = (profile && profile.lastSnacks && profile.lastSnacks.length > 0)
            ? profile.lastSnacks
            : (savedMem ? JSON.parse(savedMem) : null);

        if (!snacksToRepeat || snacksToRepeat.length === 0) {
            appendAIMessage(`Nu am găsit încă o comandă anterioară la Snack Bar. Poți scrie direct în chat, de exemplu: <em>"2 locuri la Interstellar și un popcorn mare cu aromă de brânză"</em>.`);
            return;
        }

        const targetMovie = MOVIES_CATALOG[0];
        const seats = findOptimalConsecutiveSeats(targetMovie.id, currentBooking.dateISO, targetMovie.format, 2);
        const summaryNames = snacksToRepeat.map(s => `${s.title} (${s.details})`).join(', ');

        appendAIMessage(`
            Am pregătit meniul tău preferat (<strong>${summaryNames}</strong>) alături de 2 locuri centrale (<strong class="text-orange">${seats.join(', ')}</strong>) la <em>${targetMovie.title}</em>.
            <button class="btn-primary btn-sm btn-block mt-2" onclick='openBookingModal("${targetMovie.id}", "${targetMovie.title}", "${targetMovie.time}", "${targetMovie.hall}", "${targetMovie.format}", ${targetMovie.duration}, ${JSON.stringify(seats)}, ${JSON.stringify(snacksToRepeat)})'>
                Deschide Comanda Pre-configurată
            </button>
        `);
    }
}
window.triggerAIQuickAction = triggerAIQuickAction;

/**
 * Procesare Limbaj Natural (Keyword Extraction pentru Film, Număr Locuri și Configurare Snack Bar)
 */
function processNaturalLanguageQuery(query) {
    const q = query.toLowerCase();

    // 1. Extragem numărul de locuri (implicit 2)
    const numMatch = q.match(/\b([1-8])\s*(loc|locuri|bilet|bilete|persoane)?\b/);
    const seatCount = numMatch ? parseInt(numMatch[1], 10) : 2;

    // 2. Identificăm filmul și formatul preferat
    let wantsIMAX = q.includes('imax');
    let wants4DX = q.includes('4dx');

    let matchedShow = MOVIES_CATALOG.find(m => {
        if (q.includes('interstellar') && m.key === 'interstellar') return true;
        if (q.includes('oppenheimer') && m.key === 'oppenheimer') return true;
        if (q.includes('inception') && m.key === 'inception') return true;
        if ((q.includes('odyssey') || q.includes('2001')) && m.key === 'odyssey') return true;
        if (q.includes('avatar') && m.key === 'avatar') return true;
        if (q.includes('verse') && m.key === 'spiderverse') return true;
        if ((q.includes('brand new') || q.includes('spider')) && m.key === 'spidermanbnd') return true;
        if ((q.includes('avengers') || q.includes('doomsday')) && m.key === 'doomsday') return true;
        return false;
    });

    if (matchedShow && (wantsIMAX || wants4DX)) {
        const preferredFormat = wantsIMAX ? 'IMAX' : '4DX';
        const exactFormatMatch = MOVIES_CATALOG.find(m => m.key === matchedShow.key && m.format === preferredFormat);
        if (exactFormatMatch) matchedShow = exactFormatMatch;
    }

    if (!matchedShow) {
        matchedShow = wantsIMAX
            ? MOVIES_CATALOG.find(m => m.format === 'IMAX')
            : (wants4DX ? MOVIES_CATALOG.find(m => m.format === '4DX') : MOVIES_CATALOG[0]);
    }

    // 3. Extragem produsele de la Snack Bar menționate în text
    const parsedSnacks = [];
    const size = q.includes('mic') ? 'Mic' : (q.includes('mediu') ? 'Mediu' : 'Mare');

    if (q.includes('popcorn')) {
        const priceMap = { 'Mic': 18, 'Mediu': 24, 'Mare': 30 };
        let flavor = 'Sare';
        if (q.includes('branza') || q.includes('brânză')) flavor = 'Aromă de brânză';
        else if (q.includes('chili')) flavor = 'Aromă de sweet chili';

        parsedSnacks.push({
            id: 'AI_POP_' + Date.now(),
            category: 'Popcorn',
            title: `Popcorn ${size}`,
            details: `Cu ${flavor}`,
            price: priceMap[size]
        });
    }

    if (q.includes('nachos')) {
        const priceMap = { 'Mic': 21, 'Mediu': 27, 'Mare': 33 };
        const powder = (q.includes('chili')) ? 'Pudră de sweet chili' : 'Pudră de brânză';
        const sauce = (q.includes('salsa')) ? 'Sos Salsa' : 'Sos de brânză';

        parsedSnacks.push({
            id: 'AI_NAC_' + Date.now(),
            category: 'Nachos',
            title: `Nachos ${size}`,
            details: `${powder} + ${sauce}`,
            price: priceMap[size]
        });
    }

    if (q.includes('pepsi') || q.includes('lipton') || q.includes('apa') || q.includes('apă') || q.includes('suc')) {
        const priceMap = { 'Mic': 9, 'Mediu': 12, 'Mare': 15 };
        let drinkType = 'Pepsi';
        if (q.includes('zero')) drinkType = 'Pepsi Zero';
        else if (q.includes('lipton')) drinkType = 'Lipton';
        else if (q.includes('mineral')) drinkType = 'Apă Minerală';
        else if (q.includes('plat') || q.includes('apa') || q.includes('apă')) drinkType = 'Apă Plată';

        parsedSnacks.push({
            id: 'AI_DRK_' + Date.now(),
            category: 'Băutură',
            title: `${drinkType} (${size})`,
            details: 'Răcoritoare Bar NIII7',
            price: priceMap[size]
        });
    }

    // 4. Căutăm spațial locurile libere consecutive
    const optimalSeats = findOptimalConsecutiveSeats(
        matchedShow.id,
        currentBooking.dateISO,
        matchedShow.format,
        seatCount
    );

    const snacksSummary = parsedSnacks.length > 0
        ? `<br>• Snack Bar pre-configurat: <strong>${parsedSnacks.map(s => `${s.title} (${s.details})`).join(' + ')}</strong>`
        : '';

    appendAIMessage(`
        Configurație generată:<br>
        • Film: <strong>${matchedShow.title}</strong> (${matchedShow.hall}, ${matchedShow.time})<br>
        • Locuri consecutive libere: <strong class="text-orange">${optimalSeats.join(', ')}</strong>
        ${snacksSummary}
        <button class="btn-primary btn-sm btn-block mt-2" onclick='openBookingModal("${matchedShow.id}", "${matchedShow.title}", "${matchedShow.time}", "${matchedShow.hall}", "${matchedShow.format}", ${matchedShow.duration}, ${JSON.stringify(optimalSeats)}, ${JSON.stringify(parsedSnacks)})'>
            Aplică și Deschide Rezervarea
        </button>
    `);
}
