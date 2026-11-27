const API_CONFIG = {
    WEBSITE_BASE_URL: window.location.origin,
    QR_API_URL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=",
    WEATHER_API: "https://api.open-meteo.com/v1/forecast?latitude=45.655&longitude=25.595&current_weather=true",
    CURRENCY_API: "https://open.er-api.com/v6/latest/RON",
    TIME_API: "https://worldtimeapi.org/api/timezone/Europe/Bucharest",
    SIMULATE_STRIPE_DELAY: 1400,
    API_TIMEOUT_MS: 4000,
    STRICT_CARD_CHECK: false,
    EMAILJS_SERVICE_ID: "YOUR_SERVICE_ID",
    EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
    EMAILJS_PUBLIC_KEY: "YOUR_PUBLIC_KEY"
};

let availableDates = [];
let baseSystemDate = new Date();

const movies = [
    { id: 1, title: "Dune: Part Two", genre: "Sci-Fi", wiki: "Dune:_Part_Two", imdb: "https://www.imdb.com/title/tt15239678/", format: "IMAX", rating: "9.4", desc: "Paul Atreides se unește cu Chani și fremenii pe calea răzbunării împotriva conspiratorilor care i-au distrus familia.", trailer: "media/dune.mp4", poster: "media/dune.jpg", times: ["14:00", "16:30", "19:00", "21:30"] },
    { id: 2, title: "Interstellar", genre: "Sci-Fi", wiki: "Interstellar_(film)", imdb: "https://www.imdb.com/title/tt0816692/", format: "IMAX", rating: "9.2", desc: "O echipă de exploratori călătorește printr-o gaură de vierme în spațiu pentru a asigura supraviețuirea umanității.", trailer: "media/interstellar.mp4", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 3, title: "The Dark Knight", genre: "Acțiune", wiki: "The_Dark_Knight", imdb: "https://www.imdb.com/title/tt0468569/", format: "VIP", rating: "9.5", desc: "Când amenințarea cunoscută sub numele de Joker face ravagii în Gotham, Batman trece prin cel mai mare test.", trailer: "media/batman_dk.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 4, title: "Inception", genre: "Thriller", wiki: "Inception", imdb: "https://www.imdb.com/title/tt1375666/", format: "4DX", rating: "9.0", desc: "Un hoț care fură secrete corporative prin tehnologia viselor primește sarcina de a planta o idee în mintea unui CEO.", trailer: "media/inception.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 5, title: "Avatar: The Way of Water", genre: "Sci-Fi", wiki: "Avatar:_The_Way_of_Water", imdb: "https://www.imdb.com/title/tt1630029/", format: "4DX", rating: "8.7", desc: "Jake Sully trăiește cu noua sa familie pe planeta Pandora și luptă pentru a-și proteja tribul în adâncurile oceanului.", trailer: "media/avatar.mp4", poster: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 6, title: "Oppenheimer", genre: "Biografic", wiki: "Oppenheimer_(film)", imdb: "https://www.imdb.com/title/tt15398776/", format: "IMAX", rating: "9.1", desc: "Povestea fizicianului J. Robert Oppenheimer și rolul său decisiv în dezvoltarea primei bombe atomice.", trailer: "media/oppenheimer.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 7, title: "Spider-Man: Across the Spider-Verse", genre: "Animație", wiki: "Spider-Man:_Across_the_Spider-Verse", imdb: "https://www.imdb.com/title/tt9362722/", format: "4DX", rating: "9.3", desc: "Miles Morales călătorește prin Multivers, unde întâlnește o nouă echipă de Oameni-Păianjen.", trailer: "media/spiderman.mp4", poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 8, title: "The Batman", genre: "Acțiune", wiki: "The_Batman_(film)", imdb: "https://www.imdb.com/title/tt1877830/", format: "VIP", rating: "8.8", desc: "Când un criminal sadic lasă în urmă indicii criptice, Batman investighează lumea interlopă din Gotham.", trailer: "media/the_batman.mp4", poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", times: ["16:30", "18:00", "20:30", "21:30"] }
];

const homeView = document.getElementById('home-view');
const movieView = document.getElementById('movie-view');
const imaxView = document.getElementById('imax-view');
const dxView = document.getElementById('4dx-view');
const vipView = document.getElementById('vip-view');
const ticketsView = document.getElementById('my-tickets-view');
const adminView = document.getElementById('admin-view');

const moviesGrid = document.getElementById('movies-grid');
const seatsContainer = document.getElementById('seats-container');
const movieTitleEl = document.getElementById('movie-title');
const movieDescEl = document.getElementById('movie-desc');
const movieTrailerEl = document.getElementById('movie-trailer');
const bookingDateSelect = document.getElementById('booking-date');
const bookingTimeSelect = document.getElementById('booking-time');
const bookingFormatSelect = document.getElementById('booking-format');

let ticketsTotal = 0;
let snacksTotal = 0;
let finalTotal = 0;
let discountApplied = false;
let currentMovie = movies[0];
let selectedGenre = "all";
let exchangeRates = { RON: 1, EUR: 0.20, USD: 0.22 };
let currentCurrency = "RON";
let forceVipJackpot = false;
let wheelRotation = 0;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}
function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

const TICKET_SALT = "niii7-demo-2026";
function ticketSignature(film, data, ora, locuri, id) {
    const text = [film, data, ora, locuri, id, TICKET_SALT].join('|');
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36);
}

function passesLuhn(num) {
    let sum = 0, dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let d = parseInt(num[i], 10);
        if (dbl) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
        dbl = !dbl;
    }
    return sum % 10 === 0;
}

(function setupTheme() {
    const btn = document.getElementById('theme-toggle-btn');
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (!btn) return;
    function apply(isLight) {
        document.body.classList.toggle('light-mode', isLight);
        if (icon) icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (label) label.innerText = isLight ? 'Light' : 'Dark';
    }
    let saved = 'dark';
    try { saved = localStorage.getItem('cinema_theme') || 'dark'; } catch (e) {}
    apply(saved === 'light');
    btn.addEventListener('click', () => {
        const isLight = !document.body.classList.contains('light-mode');
        apply(isLight);
        try { localStorage.setItem('cinema_theme', isLight ? 'light' : 'dark'); } catch (e) {}
    });
})();

const MONTHS_RO = { "Ianuarie": 0, "Februarie": 1, "Martie": 2, "Aprilie": 3, "Mai": 4, "Iunie": 5, "Iulie": 6, "August": 7, "Septembrie": 8, "Octombrie": 9, "Noiembrie": 10, "Decembrie": 11 };
const CINEMA_LOCATION = "Cinema NIII7, Corpul N, Universitatea Transilvania, Bulevardul Eroilor, Brașov";

function parseDateTime(dateStr, timeStr) {
    const parts = dateStr.split(', ')[1].split(' ');
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
    const startDate = new Date(parseInt(parts[2], 10), MONTHS_RO[parts[1]], parseInt(parts[0], 10), hours, minutes);
    const endDate = new Date(startDate.getTime() + (2 * 60 + 30) * 60 * 1000);
    return { startDate, endDate };
}

function formatICSDate(date) {
    return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function icsEscape(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function createGoogleCalendarUrl(title, desc, location, startDate, endDate) {
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: `🎬 Cinema NIII7: ${title}`,
        dates: `${formatICSDate(startDate)}/${formatICSDate(endDate)}`,
        details: desc,
        location: location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadICSFile(title, desc, location, startDate, endDate, uid) {
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Cinema NIII7 Brasov//RO",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${uid}@cinema-niii7`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `SUMMARY:${icsEscape('🎬 Cinema NIII7: ' + title)}`,
        `DESCRIPTION:${icsEscape(desc)}`,
        `LOCATION:${icsEscape(location)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Filmul începe într-o oră",
        "TRIGGER:-PT1H",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Vizionare_${title.replace(/[^\w]+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const reminderTimers = {};

function showReminderNotification(r) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("🎬 Cinema NIII7 — reminder", {
        body: `„${r.movie}" începe la ${r.time} (${r.date}). Pleacă spre Corpul N!`,
        icon: "https://img.icons8.com/color/96/clapperboard.png"
    });
}

function scheduleReminder(r) {
    const delay = (r.startMs - 60 * 60 * 1000) - Date.now();
    if (delay < -60 * 60 * 1000 || r.startMs < Date.now()) return false;
    clearTimeout(reminderTimers[r.id]);
    reminderTimers[r.id] = setTimeout(() => showReminderNotification(r), Math.max(0, delay));
    return true;
}

function restoreReminders() {
    readStorage('cinema_reminders', []).forEach(scheduleReminder);
}

function setupPushReminder(ticketId, movieTitle, dateStr, timeStr, startDate) {
    const btn = document.getElementById('enable-reminder-btn');
    const hint = document.getElementById('reminder-hint');
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-regular fa-bell"></i> Setează reminder (cu 1h înainte)';
    btn.onclick = async () => {
        if (!("Notification" in window)) { alert("Browserul tău nu suportă notificări."); return; }
        let permission = Notification.permission;
        if (permission === "default") permission = await Notification.requestPermission();
        if (permission !== "granted") {
            if (hint) hint.innerText = "Ca să primești remindere, permite notificările din setările browserului.";
            return;
        }
        const reminder = { id: ticketId, movie: movieTitle, date: dateStr, time: timeStr, startMs: startDate.getTime() };
        if (!scheduleReminder(reminder)) {
            if (hint) hint.innerText = "Filmul a început deja — nu se mai poate seta un reminder.";
            return;
        }
        const all = readStorage('cinema_reminders', []).filter(x => x.id !== ticketId);
        all.push(reminder);
        writeStorage('cinema_reminders', all);
        btn.innerHTML = '<i class="fa-solid fa-check" style="color:#2ecc71;"></i> Reminder setat';
        btn.disabled = true;
        if (hint) hint.innerText = "Vei primi o notificare cu o oră înainte, cât timp site-ul este deschis.";
    };
}

function buildFutureDates(refDate) {
    const months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    const days = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
    availableDates = [];
    for (let i = 1; i <= 4; i++) {
        const future = new Date(refDate);
        future.setDate(refDate.getDate() + i);
        const dayName = days[future.getDay()];
        const dayNum = future.getDate();
        const monthName = months[future.getMonth()];
        const yearNum = future.getFullYear();
        availableDates.push(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);
    }
    const todayStr = `${refDate.getDate()} ${months[refDate.getMonth()]} ${refDate.getFullYear()}`;
    document.getElementById('live-date-label').innerText = `Azi: ${todayStr}`;
}

async function fetchJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_CONFIG.API_TIMEOUT_MS);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

async function initLiveAPIs() {
    buildFutureDates(new Date());
    const [time, weather, currency] = await Promise.allSettled([
        fetchJson(API_CONFIG.TIME_API),
        fetchJson(API_CONFIG.WEATHER_API),
        fetchJson(API_CONFIG.CURRENCY_API)
    ]);

    if (time.status === 'fulfilled' && time.value && time.value.datetime) {
        const apiDate = new Date(time.value.datetime);
        if (!isNaN(apiDate)) baseSystemDate = apiDate;
    }
    const datesBefore = availableDates.join('|');
    buildFutureDates(baseSystemDate);
    if (datesBefore !== availableDates.join('|') && movieView.classList.contains('active')) {
        populateBookingOptions(currentMovie);
        generateSeats();
        resetSelection();
    }

    const tempEl = document.getElementById('weather-temp');
    if (weather.status === 'fulfilled' && weather.value && weather.value.current_weather) {
        tempEl.innerText = `${Math.round(weather.value.current_weather.temperature)}°C`;
    } else {
        tempEl.innerText = "16°C";
    }

    if (currency.status === 'fulfilled' && currency.value && currency.value.rates) {
        exchangeRates.EUR = currency.value.rates.EUR || exchangeRates.EUR;
        exchangeRates.USD = currency.value.rates.USD || exchangeRates.USD;
        updateLegendPrices();
        updateSelection();
    }
}

function updateLegendPrices() {
    const fmt = bookingFormatSelect.value;
    const surcharge = fmt === '4DX' ? 10 : (fmt === 'VIP' ? 15 : 0);
    const stdRon = 30 + surcharge;
    const prmRon = 45 + surcharge;
    const vipRon = 60 + surcharge;
    document.getElementById('leg-std').dataset.ron = stdRon;
    document.getElementById('leg-prm').dataset.ron = prmRon;
    document.getElementById('leg-vip').dataset.ron = vipRon;
    const rate = exchangeRates[currentCurrency];
    document.querySelectorAll('.price-convert').forEach(el => {
        const ron = parseFloat(el.dataset.ron);
        el.innerText = `${(ron * rate).toFixed(currentCurrency === 'RON' ? 0 : 2)} ${currentCurrency}`;
    });
}

document.getElementById('currency-switcher').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    updateLegendPrices();
    document.querySelectorAll('.curr-label').forEach(el => el.innerText = currentCurrency);
    updateSelection();
});

function showView(viewEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    viewEl.classList.add('active');
    window.scrollTo(0, 0);
}

document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-nav]').forEach(b => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
        movieTrailerEl.pause();
        const target = btn.dataset.nav;
        if (target === 'home') showView(homeView);
        if (target === 'imax') showView(imaxView);
        if (target === '4dx') showView(dxView);
        if (target === 'vip') showView(vipView);
    });
});

document.getElementById('filter-imax-movies-btn').addEventListener('click', () => {
    document.getElementById('format-filter').value = 'IMAX';
    document.querySelector('[data-nav="home"]').click();
    renderMovies();
});

document.getElementById('filter-4dx-movies-btn').addEventListener('click', () => {
    document.getElementById('format-filter').value = '4DX';
    document.querySelector('[data-nav="home"]').click();
    renderMovies();
});

document.getElementById('filter-vip-movies-btn').addEventListener('click', () => {
    document.getElementById('format-filter').value = 'VIP';
    document.querySelector('[data-nav="home"]').click();
    renderMovies();
});

document.getElementById('nav-logo').addEventListener('click', () => document.querySelector('[data-nav="home"]').click());
document.getElementById('hero-imax-btn').addEventListener('click', () => document.querySelector('[data-nav="imax"]').click());

document.querySelectorAll('.genre-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedGenre = tab.dataset.genre;
        renderMovies();
    });
});

const trailerFallbackEl = document.getElementById('trailer-fallback');
function loadTrailer(movie) {
    trailerFallbackEl.style.display = 'none';
    movieTrailerEl.style.display = '';
    movieTrailerEl.muted = true;
    movieTrailerEl.src = movie.trailer;
    movieTrailerEl.load();
    movieTrailerEl.play().catch(() => {});
}
movieTrailerEl.addEventListener('error', () => {
    if (!movieTrailerEl.getAttribute('src')) return;
    movieTrailerEl.style.display = 'none';
    trailerFallbackEl.style.display = 'flex';
});

function openMoviePage(movie) {
    currentMovie = movie;
    document.body.classList.add('zooming-in');
    setTimeout(() => {
        showView(movieView);
        movieTitleEl.innerText = movie.title;
        movieDescEl.innerText = movie.desc;
        bookingFormatSelect.value = movie.format;
        document.getElementById('detail-format').innerText = `${movie.format} EXPERIENCE`;
        document.getElementById('detail-genre').innerText = movie.genre.toUpperCase();
        document.getElementById('detail-rating').innerHTML = `<i class="fa-solid fa-star" style="color:#ffb700;"></i> ${movie.rating} / 10`;
        document.getElementById('imdb-link').href = movie.imdb;
        document.getElementById('letterboxd-link').href = `https://letterboxd.com/search/${encodeURIComponent(movie.title)}/`;
        document.getElementById('wiki-api-box').style.display = 'none';
        loadTrailer(movie);
        populateBookingOptions(movie);
        applyAuditoriumFormatStyle();
        generateSeats();
        resetSelection();
        document.body.classList.remove('zooming-in');
    }, 450);
}

function applyAuditoriumFormatStyle() {
    const fmt = bookingFormatSelect.value;
    const titleEl = document.getElementById('auditorium-title');
    const screenLabel = document.getElementById('screen-perspective-label');
    if (fmt === 'IMAX') {
        titleEl.innerText = "SALA IMAX LASER 3D — SELECTARE LOCURI";
        screenLabel.innerText = "ECRAN GIGANT IMAX 24M (PERSPECTIVĂ CENTRALĂ)";
    } else if (fmt === '4DX') {
        titleEl.innerText = "SALA 4DX EXTREME MOTION — SELECTARE LOCURI";
        screenLabel.innerText = "ECRAN 4DX + EFECTE VÂNT, APĂ & MIȘCARE HIDRAULICĂ";
    } else {
        titleEl.innerText = "SALA VIP LUXURY LOUNGE — SELECTARE LOCURI";
        screenLabel.innerText = "ECRAN VIP + BUFET POPCORN & NACHOS NELIMITAT INCLUS";
    }
    updateLegendPrices();
}

bookingFormatSelect.addEventListener('change', () => {
    applyAuditoriumFormatStyle();
    generateSeats();
    resetSelection();
});

document.getElementById('wiki-api-btn').addEventListener('click', async () => {
    const box = document.getElementById('wiki-api-box');
    box.style.display = 'block';
    box.innerHTML = "Se interoghează Wikipedia REST API...";
    const requested = currentMovie;
    try {
        const data = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(requested.wiki)}`);
        if (requested !== currentMovie) return;
        box.innerHTML = `<strong><i class="fa-brands fa-wikipedia-w"></i> Wikipedia Live API:</strong> ${escapeHtml(data.extract || requested.desc)}`;
    } catch (e) {
        if (requested !== currentMovie) return;
        box.innerHTML = `<strong>Info Live:</strong> ${escapeHtml(requested.desc)}`;
    }
});

document.getElementById('hero-book-btn').addEventListener('click', () => openMoviePage(movies[0]));
document.getElementById('back-btn').addEventListener('click', () => { showView(homeView); movieTrailerEl.pause(); });
document.getElementById('my-tickets-btn').addEventListener('click', () => { showView(ticketsView); renderMyTickets(); });
document.getElementById('back-to-home-btn').addEventListener('click', () => showView(homeView));

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        showView(adminView);
        renderAdminPanel();
        return;
    }
    const t = e.target;
    const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'g' || e.key === 'G')) {
        forceVipJackpot = true;
        if (document.getElementById('wheel-modal').style.display === 'flex') spinWheel(true);
    }
});

document.getElementById('admin-back-btn').addEventListener('click', () => showView(homeView));

const POSTER_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">' +
    '<rect width="300" height="420" fill="#12131a"/><rect x="12" y="12" width="276" height="396" fill="none" stroke="#ff6600" stroke-width="3"/>' +
    '<text x="150" y="205" font-family="Arial" font-size="26" font-weight="700" fill="#ff6600" text-anchor="middle">CINEMA NIII7</text>' +
    '<text x="150" y="240" font-family="Arial" font-size="15" fill="#9ba1b0" text-anchor="middle">Poster indisponibil</text></svg>');
function posterFallback(img) {
    img.onerror = null;
    img.src = POSTER_FALLBACK;
}

function renderMovies() {
    const selectedTime = document.getElementById('time-filter').value;
    const selectedFormat = document.getElementById('format-filter').value;
    const searchQuery = document.getElementById('movie-search').value.toLowerCase();
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const matchTime = selectedTime === 'all' || movie.times.includes(selectedTime);
        const matchFormat = selectedFormat === 'all' || movie.format === selectedFormat;
        const matchGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
        const matchSearch = movie.title.toLowerCase().includes(searchQuery);
        if (matchTime && matchFormat && matchGenre && matchSearch) {
            const card = document.createElement('div');
            card.className = 'movie-card';
            let timeBadgesHtml = movie.times.map(t => `<span class="time-badge">${t}</span>`).join('');
            card.innerHTML = `
                <span class="card-format-tag">${movie.format}</span>
                <span class="card-genre-tag">${movie.genre}</span>
                <span class="card-rating-tag">★ ${movie.rating}</span>
                <img src="${escapeHtml(movie.poster)}" onerror="posterFallback(this)" alt="Poster ${escapeHtml(movie.title)}" loading="lazy">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="time-badges">${timeBadgesHtml}</div>
                </div>
            `;
            card.addEventListener('click', () => openMoviePage(movie));
            moviesGrid.appendChild(card);
        }
    });
}

document.getElementById('time-filter').addEventListener('change', renderMovies);
document.getElementById('format-filter').addEventListener('change', renderMovies);
document.getElementById('movie-search').addEventListener('input', renderMovies);

document.getElementById('btn-imax-ratio').addEventListener('click', () => {
    document.getElementById('aspect-demo-box').classList.add('imax-expanded');
});
document.getElementById('btn-std-ratio').addEventListener('click', () => {
    document.getElementById('aspect-demo-box').classList.remove('imax-expanded');
});

document.getElementById('test-imax-sound-btn').addEventListener('click', () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 2.2);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.4);
    } catch (e) {}
    const bars = document.querySelectorAll('.eq-bar');
    let count = 0;
    const interval = setInterval(() => {
        bars.forEach(b => b.style.height = `${Math.floor(Math.random() * 85) + 15}%`);
        count++;
        if (count > 18) {
            clearInterval(interval);
            bars.forEach(b => b.style.height = '20%');
        }
    }, 120);
});

document.querySelectorAll('.dx-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const fx = btn.dataset.fx;
        const seatModel = document.getElementById('dx-seat-model');
        const overlay = document.getElementById('fx-overlay');
        const status = document.getElementById('dx-status-text');
        seatModel.className = 'dx-seat-3d';
        overlay.className = 'fx-overlay';
        if (fx === 'motion') {
            seatModel.classList.add('seat-shaking');
            status.innerText = "Hidraulică activă: Înclinare Pitch & Roll 4DX!";
            setTimeout(() => seatModel.classList.remove('seat-shaking'), 2000);
        } else if (fx === 'wind') {
            seatModel.style.transform = "rotateY(-25deg) scale(1.08)";
            status.innerText = "Turbine de vânt pornite la 100 km/h!";
            setTimeout(() => seatModel.style.transform = "none", 1500);
        } else if (fx === 'lightning') {
            overlay.classList.add('fx-lightning');
            status.innerText = "Stroboscop LED 4DX declanșat!";
        } else if (fx === 'rain') {
            overlay.classList.add('fx-rain');
            status.innerText = "Pulverizare apă și ceață activată în sală!";
            setTimeout(() => overlay.classList.remove('fx-rain'), 2200);
        }
    });
});

document.getElementById('recline-slider').addEventListener('input', (e) => {
    const angle = parseInt(e.target.value);
    document.getElementById('angle-val').innerText = angle;
    const tilt = (angle - 95) * 0.7;
    document.getElementById('chair-back').style.transform = `rotate(-${tilt}deg)`;
    document.getElementById('chair-foot').style.transform = `rotate(${75 - tilt}deg)`;
});

const wheelModal = document.getElementById('wheel-modal');
document.getElementById('open-wheel-btn').addEventListener('click', () => {
    document.getElementById('wheel-result').innerText = "";
    wheelModal.style.display = 'flex';
});
document.getElementById('close-wheel-btn').addEventListener('click', () => wheelModal.style.display = 'none');

function spinWheel(triggeredByGKey = false) {
    const wheel = document.getElementById('wheel-circle');
    const resultText = document.getElementById('wheel-result');
    resultText.innerText = "Se învârte roata...";
    const isVipWin = triggeredByGKey || forceVipJackpot || (Math.random() < 0.03);
    forceVipJackpot = false;
    wheelRotation += 1800;
    if (isVipWin) {
        const remainder = wheelRotation % 360;
        wheelRotation += (360 - remainder) + 45;
        wheel.style.transform = `rotate(${wheelRotation}deg)`;
        setTimeout(() => {
            resultText.innerHTML = `👑 JACKPOT 3%! Ai câștigat <b>2 BILETE FULL VIP GRATIS</b>! Codul <b>FREEVIP2</b> a fost activat!`;
            document.getElementById('promo-input').value = "FREEVIP2";
        }, 3200);
    } else {
        const regularPrizes = [
            { code: "STUDENT20", angle: 315, label: "20% Reducere Studenți" },
            { code: "CORPULN", angle: 225, label: "20% Reducere Corpul N" },
            { code: "VIP15", angle: 135, label: "20% Reducere VIP" }
        ];
        const chosen = regularPrizes[Math.floor(Math.random() * regularPrizes.length)];
        const remainder = wheelRotation % 360;
        wheelRotation += (360 - remainder) + chosen.angle;
        wheel.style.transform = `rotate(${wheelRotation}deg)`;
        setTimeout(() => {
            resultText.innerText = `🎉 Ai câștigat codul: ${chosen.code} (${chosen.label})!`;
            document.getElementById('promo-input').value = chosen.code;
        }, 3200);
    }
}

document.getElementById('spin-wheel-btn').addEventListener('click', () => spinWheel(false));

function populateBookingOptions(movie) {
    bookingDateSelect.innerHTML = '';
    bookingTimeSelect.innerHTML = '';
    if (availableDates.length === 0) buildFutureDates(new Date());
    availableDates.forEach(d => bookingDateSelect.appendChild(new Option(d, d)));
    movie.times.forEach(t => bookingTimeSelect.appendChild(new Option(t, t)));
}

bookingDateSelect.addEventListener('change', () => { generateSeats(); resetSelection(); });
bookingTimeSelect.addEventListener('change', () => { generateSeats(); resetSelection(); });

function showingKey() {
    return [currentMovie.id, bookingDateSelect.value, bookingTimeSelect.value, bookingFormatSelect.value].join('|');
}

function seededRandom(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
        h ^= seedStr.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return function () {
        h = (h + 0x6D2B79F5) | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function getBookedSeats(key) {
    return readStorage('cinema_booked', {})[key] || [];
}

function bookSeats(key, seatIds) {
    const all = readStorage('cinema_booked', {});
    all[key] = Array.from(new Set([...(all[key] || []), ...seatIds]));
    writeStorage('cinema_booked', all);
}

function generateSeats() {
    seatsContainer.innerHTML = '';
    const fmt = bookingFormatSelect.value;
    const surcharge = fmt === '4DX' ? 10 : (fmt === 'VIP' ? 15 : 0);
    const key = showingKey();
    const rand = seededRandom(key);
    const booked = getBookedSeats(key);
    for (let r = 0; r < 7; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        rowDiv.setAttribute('role', 'group');
        rowDiv.setAttribute('aria-label', `Rândul ${r + 1}`);
        const seatClass = r < 2 ? 'standard' : (r < 5 ? 'premium' : 'vip');
        const basePrice = r < 2 ? 30 : (r < 5 ? 45 : 60);
        const seatPrice = basePrice + surcharge;
        for (let c = 0; c < 12; c++) {
            const seat = document.createElement('div');
            const id = `R${r + 1}L${c + 1}`;
            seat.className = `seat ${seatClass}`;
            seat.dataset.price = seatPrice;
            seat.dataset.row = r + 1;
            seat.dataset.col = c + 1;
            seat.dataset.id = id;
            const randomlyTaken = rand() < 0.24 && !(r === 3 && (c === 5 || c === 6));
            const taken = randomlyTaken || booked.includes(id);
            if (taken) seat.classList.add('occupied');
            seat.setAttribute('role', 'checkbox');
            seat.setAttribute('aria-checked', 'false');
            seat.setAttribute('aria-label', `Rândul ${r + 1}, locul ${c + 1}, ${seatPrice} RON${taken ? ', ocupat' : ''}`);
            if (taken) seat.setAttribute('aria-disabled', 'true');
            else seat.tabIndex = 0;
            rowDiv.appendChild(seat);
        }
        seatsContainer.appendChild(rowDiv);
    }
}

function update3DScreenPerspective(r, c, isAi = false) {
    const dynScreen = document.getElementById('dynamic-screen');
    const rotX = -50 + (r * 4);
    const rotY = (6.5 - c) * 2.8;
    const scale = 1.12 - (r * 0.03);
    dynScreen.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    const label = document.getElementById('screen-perspective-label');
    if (isAi) {
        label.innerText = `✨ AI SWEET-SPOT ACTIVAT: R${r}L${c} & R${r}L${c+1} (ACUSTICĂ IMAX 99.8%)`;
    } else {
        label.innerText = `UNGHI VIZIONARE SIMULAT DE PE LOCUL R${r}L${c}`;
    }
}

document.getElementById('ai-sweetspot-btn').addEventListener('click', () => {
    document.querySelectorAll('.row .seat.selected').forEach(s => s.classList.remove('selected'));
    const preferredRows = [4, 5, 3, 6];
    const preferredCols = [6, 5, 7, 4];
    let found = false;
    for (let r of preferredRows) {
        for (let c of preferredCols) {
            const s1 = document.querySelector(`.seat[data-row="${r}"][data-col="${c}"]:not(.occupied)`);
            const s2 = document.querySelector(`.seat[data-row="${r}"][data-col="${c+1}"]:not(.occupied)`);
            if (s1 && s2) {
                s1.classList.add('selected');
                s2.classList.add('selected');
                update3DScreenPerspective(r, c, true);
                found = true;
                break;
            }
        }
        if (found) break;
    }
    updateSelection();
});

function toggleSeat(seat) {
    if (!seat.classList.contains('seat') || seat.classList.contains('occupied')) return;
    seat.classList.toggle('selected');
    update3DScreenPerspective(parseInt(seat.dataset.row), parseInt(seat.dataset.col), false);
    updateSelection();
}

seatsContainer.addEventListener('click', (e) => toggleSeat(e.target));

seatsContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSeat(e.target);
    }
});

function updateSelection() {
    document.querySelectorAll('.row .seat').forEach(s => s.setAttribute('aria-checked', s.classList.contains('selected') ? 'true' : 'false'));
    const selected = document.querySelectorAll('.row .seat.selected');
    ticketsTotal = Array.from(selected).reduce((sum, seat) => sum + parseInt(seat.dataset.price), 0);
    const rate = exchangeRates[currentCurrency];
    const displayVal = currentCurrency === 'RON' ? ticketsTotal : (ticketsTotal * rate).toFixed(2);
    document.getElementById('count').innerText = selected.length;
    document.getElementById('total-tickets').innerText = displayVal;
    document.getElementById('continue-to-snacks-btn').disabled = selected.length === 0;
}

function resetSelection() {
    ticketsTotal = 0;
    snacksTotal = 0;
    finalTotal = 0;
    discountApplied = false;
    document.getElementById('count').innerText = '0';
    document.getElementById('total-tickets').innerText = '0';
    document.getElementById('continue-to-snacks-btn').disabled = true;
    document.querySelectorAll('.snack-input').forEach(inp => inp.value = 0);
}

const snacksModal = document.getElementById('snacks-modal');
const paymentModal = document.getElementById('payment-modal');

document.getElementById('continue-to-snacks-btn').addEventListener('click', () => {
    updateSnacksTotal();
    snacksModal.style.display = 'flex';
});

document.getElementById('cancel-snacks-btn').addEventListener('click', () => snacksModal.style.display = 'none');
document.querySelectorAll('.snack-input').forEach(input => input.addEventListener('input', updateSnacksTotal));

function updateSnacksTotal() {
    const popcorn = parseInt(document.getElementById('snack-popcorn').value) || 0;
    const nachos = parseInt(document.getElementById('snack-nachos').value) || 0;
    const soda = parseInt(document.getElementById('snack-soda').value) || 0;
    snacksTotal = (popcorn * 25) + (nachos * 22) + (soda * 12);
    document.getElementById('snacks-total-display').innerText = snacksTotal + " RON";
}

document.getElementById('proceed-to-pay-btn').addEventListener('click', () => {
    snacksModal.style.display = 'none';
    finalTotal = ticketsTotal + snacksTotal;
    discountApplied = false;
    document.getElementById('summary-tickets').innerText = ticketsTotal;
    document.getElementById('summary-snacks').innerText = snacksTotal;
    document.getElementById('modal-total').innerText = finalTotal;
    document.getElementById('payment-form-content').style.display = 'block';
    document.getElementById('ticket-success-content').style.display = 'none';
    paymentModal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => paymentModal.style.display = 'none');

document.getElementById('apply-promo-btn').addEventListener('click', () => {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    if (discountApplied) { alert("Ai aplicat deja un cod la această comandă!"); return; }
    if (code === 'FREEVIP2') {
        const vipFreeValue = Math.min(ticketsTotal, 150);
        finalTotal = Math.max(0, finalTotal - vipFreeValue);
        document.getElementById('modal-total').innerText = finalTotal.toFixed(2);
        discountApplied = true;
        alert(`👑 JACKPOT ACTIVAT: 2 Bilete Full VIP sunt GRATUITE (-${vipFreeValue} RON)!`);
    } else if (code === 'STUDENT20' || code === 'CORPULN' || code === 'VIP15' || code === 'NIII7PRO') {
        const discount = finalTotal * 0.20;
        finalTotal = finalTotal - discount;
        document.getElementById('modal-total').innerText = finalTotal.toFixed(2);
        discountApplied = true;
        alert(`Cod promoțional activat! Reducere: ${discount.toFixed(2)} RON.`);
    } else {
        alert("Cod promoțional invalid!");
    }
});

document.getElementById('card-number').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 16);
    this.classList.remove('error');
});

document.getElementById('card-cvv').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 3);
    this.classList.remove('error');
});

document.getElementById('card-expiry').addEventListener('input', function() {
    let val = this.value.replace(/[^\d/]/g, '');
    if (val.length === 2 && !val.includes('/')) val += '/';
    this.value = val.substring(0, 5);
    this.classList.remove('error');
    document.getElementById('expiry-error').style.display = 'none';
});

function isExpiryValid(exp) {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    let [m, y] = exp.split('/');
    m = parseInt(m);
    y = parseInt(y) + 2000;
    if (m < 1 || m > 12) return false;
    let d = baseSystemDate || new Date();
    if (y < d.getFullYear()) return false;
    if (y === d.getFullYear() && m < (d.getMonth() + 1)) return false;
    return true;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function flagError(inputId) {
    const el = document.getElementById(inputId);
    el.classList.add('error');
    el.focus();
}

['email-input', 'card-name'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () { this.classList.remove('error'); });
});

let paymentInProgress = false;

document.getElementById('confirm-btn').addEventListener('click', async () => {
    if (paymentInProgress) return;

    const email = document.getElementById('email-input').value.trim();
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value;

    if (!isValidEmail(email)) { flagError('email-input'); alert("Introdu o adresă de email validă!"); return; }
    if (cardName.length < 3) { flagError('card-name'); alert("Introdu numele de pe card."); return; }
    if (cardNumber.length !== 16 || (API_CONFIG.STRICT_CARD_CHECK && !passesLuhn(cardNumber))) { flagError('card-number'); return; }
    if (!isExpiryValid(document.getElementById('card-expiry').value)) {
        document.getElementById('card-expiry').classList.add('error');
        document.getElementById('expiry-error').style.display = 'block';
        return;
    }
    if (document.getElementById('card-cvv').value.length !== 3) { flagError('card-cvv'); return; }

    const selectedEls = Array.from(document.querySelectorAll('.row .seat.selected'));
    if (selectedEls.length === 0) { alert("Nu ai selectat niciun loc."); return; }

    const key = showingKey();
    const alreadyBooked = getBookedSeats(key);
    if (selectedEls.some(s => alreadyBooked.includes(s.dataset.id))) {
        alert("Unul dintre locurile alese tocmai a fost ocupat. Alege din nou locurile.");
        paymentModal.style.display = 'none';
        generateSeats();
        resetSelection();
        return;
    }

    const seatIds = selectedEls.map(s => s.dataset.id);
    const selectedSeats = seatIds.join(', ');
    const date = bookingDateSelect.value;
    const time = bookingTimeSelect.value;
    const fmt = bookingFormatSelect.value;
    const movie = currentMovie;

    const snackParts = [];
    [['snack-popcorn', 'Popcorn'], ['snack-nachos', 'Nachos'], ['snack-soda', 'Suc']].forEach(([id, label]) => {
        const n = parseInt(document.getElementById(id).value) || 0;
        if (n > 0) snackParts.push(`${n}x ${label}`);
    });
    const snacksText = snackParts.length ? "Bar & Snacks: " + snackParts.join(', ') : "";

    const btn = document.getElementById('confirm-btn');
    paymentInProgress = true;
    btn.disabled = true;
    btn.innerText = "SE PROCESEAZĂ...";
    btn.classList.add('loading');
    await new Promise(r => setTimeout(r, API_CONFIG.SIMULATE_STRIPE_DELAY));

    const ticketId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const filmLabel = `${movie.title} (${fmt})`;
    const vUrl = new URL('validare.html', window.location.href);
    vUrl.search = new URLSearchParams({
        film: filmLabel, data: date, ora: time, locuri: selectedSeats, id: ticketId,
        sig: ticketSignature(filmLabel, date, time, selectedSeats, ticketId)
    }).toString();
    const validateUrl = vUrl.toString();
    const qrUrl = `${API_CONFIG.QR_API_URL}${encodeURIComponent(validateUrl)}`;
    const price = Math.round(finalTotal * 100) / 100;

    document.getElementById('qr-code-img').src = qrUrl;
    document.getElementById('ticket-format-badge').innerText = `${fmt} PASS`;
    document.getElementById('ticket-movie-name').innerText = movie.title;
    document.getElementById('ticket-datetime').innerText = `${date} | Ora ${time}`;
    document.getElementById('ticket-seats-info').innerText = `LOCURI (${fmt}): ${selectedSeats}`;
    document.getElementById('ticket-snacks-info').innerText = snacksText;

    bookSeats(key, seatIds);
    saveTicketToLocal({ id: ticketId, movie: `${movie.title} [${fmt}]`, date, time, seats: selectedSeats, qrUrl, validateUrl, price });

    const { startDate, endDate } = parseDateTime(date, time);
    const calTitle = `${movie.title} (${fmt})`;
    const calDesc = `Bilet Cinema NIII7 Brașov\nLocuri: ${selectedSeats}\nFormat: ${fmt}\nBilet: ${ticketId}\nVizionare plăcută!`;
    document.getElementById('add-google-calendar-btn').onclick = () =>
        window.open(createGoogleCalendarUrl(calTitle, calDesc, CINEMA_LOCATION, startDate, endDate), '_blank', 'noopener');
    document.getElementById('add-apple-calendar-btn').onclick = () =>
        downloadICSFile(calTitle, calDesc, CINEMA_LOCATION, startDate, endDate, ticketId);
    setupPushReminder(ticketId, movie.title, date, time, startDate);
    document.getElementById('reminder-hint').innerText = "Notificarea apare cât timp site-ul rămâne deschis în browser.";

    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Rezervare confirmată la Cinema N 3 7 în sala ${fmt} pentru filmul ${movie.title}. Vizionare plăcută!`);
        msg.lang = 'ro-RO';
        window.speechSynthesis.speak(msg);
    }

    if (typeof emailjs !== 'undefined' && !API_CONFIG.EMAILJS_PUBLIC_KEY.startsWith('YOUR_')) {
        try {
            emailjs.init(API_CONFIG.EMAILJS_PUBLIC_KEY);
            emailjs.send(API_CONFIG.EMAILJS_SERVICE_ID, API_CONFIG.EMAILJS_TEMPLATE_ID, {
                to_email: email, movie: filmLabel, date, time, seats: selectedSeats, qr_link: qrUrl
            }).catch(() => {});
        } catch (e) {}
    }

    ['card-number', 'card-cvv', 'card-expiry', 'card-name'].forEach(id => { document.getElementById(id).value = ''; });

    paymentInProgress = false;
    btn.disabled = false;
    btn.innerText = "CONFIRMĂ PLATA";
    btn.classList.remove('loading');
    document.getElementById('payment-form-content').style.display = 'none';
    document.getElementById('ticket-success-content').style.display = 'block';
    generateSeats();
    resetSelection();
});

document.getElementById('download-ticket-btn').addEventListener('click', () => {
    if (typeof html2canvas === 'undefined') { alert("Biblioteca de export nu s-a încărcat (verifică conexiunea la internet)."); return; }
    const ticketDiv = document.getElementById('ticket-to-download');
    html2canvas(ticketDiv, { backgroundColor: '#0b0c10', scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bilet_NIII7_${currentMovie.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

document.getElementById('close-success-btn').addEventListener('click', () => paymentModal.style.display = 'none');

function saveTicketToLocal(ticket) {
    const tickets = readStorage('cinema_tickets', []);
    tickets.push(ticket);
    writeStorage('cinema_tickets', tickets);
    const revenue = parseFloat(readStorage('cinema_revenue', 0)) || 0;
    writeStorage('cinema_revenue', Math.round((revenue + ticket.price) * 100) / 100);
}

function renderMyTickets() {
    const container = document.getElementById('tickets-history-container');
    container.innerHTML = '';
    const tickets = readStorage('cinema_tickets', []);
    if (tickets.length === 0) {
        container.innerHTML = "<p style='color:#9ba1b0;'>Nu ai niciun bilet activ în acest moment.</p>";
        return;
    }
    tickets.slice().reverse().forEach(t => {
        const div = document.createElement('div');
        div.className = 'vip-ticket-pass';
        div.style.width = '310px';
        div.innerHTML = `
            <div class="ticket-top"><span>CINEMA <b>NIII7</b></span><span>PASS</span></div>
            <div class="ticket-body">
                <h3 style="font-size:1.35rem;">${escapeHtml(t.movie)}</h3>
                <p class="ticket-meta">${escapeHtml(t.date)} | ${escapeHtml(t.time)}</p>
                <div class="ticket-seats-box">Locuri: ${escapeHtml(t.seats)}</div>
            </div>
            <div class="ticket-divider"></div>
            <div class="ticket-bottom">
                <div class="qr-container"><img src="${escapeHtml(t.qrUrl)}" alt="QR bilet ${escapeHtml(t.movie)}" style="width:110px; height:110px; display:block;"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderAdminPanel() {
    const rev = parseFloat(readStorage('cinema_revenue', 0)) || 0;
    document.getElementById('admin-revenue').innerText = rev.toFixed(2);
    const list = document.getElementById('admin-tickets-list');
    list.innerHTML = '';
    const tickets = readStorage('cinema_tickets', []);
    if (tickets.length === 0) {
        list.innerHTML = "<p style='color:#9ba1b0; padding:12px 0;'>Niciun bilet vândut încă.</p>";
        return;
    }
    tickets.slice().reverse().forEach(t => {
        list.innerHTML += `<div style="border-bottom: 1px solid #25262b; padding: 12px 0; text-align:left;">
            <strong style="color:#ff6600; font-size:1.1rem;">${escapeHtml(t.movie)}</strong> — ${escapeHtml(t.date)} (${escapeHtml(t.time)}) <br>
            <span style="color:#9ba1b0;">Locuri: ${escapeHtml(t.seats)} | Total încasat: <b>${escapeHtml(t.price)} RON</b></span>
        </div>`;
    });
}

document.getElementById('admin-reset-btn').addEventListener('click', () => {
    if (!confirm("Ștergi toate biletele, încasările, locurile cumpărate și reminderele demo?")) return;
    ['cinema_tickets', 'cinema_revenue', 'cinema_booked', 'cinema_reminders'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
    });
    Object.values(reminderTimers).forEach(clearTimeout);
    renderAdminPanel();
});

renderMovies();
restoreReminders();
initLiveAPIs();
