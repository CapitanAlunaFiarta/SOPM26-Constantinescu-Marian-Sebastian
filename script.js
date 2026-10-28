const API_CONFIG = {
    WEBSITE_BASE_URL: window.location.origin,
    QR_API_URL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=",
    WEATHER_API: "https://api.open-meteo.com/v1/forecast?latitude=45.655&longitude=25.595&current_weather=true",
    CURRENCY_API: "https://open.er-api.com/v6/latest/RON",
    TIME_API: "https://worldtimeapi.org/api/timezone/Europe/Bucharest",
    SIMULATE_STRIPE_DELAY: 1400,
    EMAILJS_SERVICE_ID: "YOUR_SERVICE_ID",
    EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
    EMAILJS_PUBLIC_KEY: "YOUR_PUBLIC_KEY"
};

let availableDates = [];
let baseSystemDate = new Date();

// Lista de filme cu posterele corectate de pe TMDB
const movies = [
    { id: 1, title: "Dune: Part Two", genre: "Sci-Fi", wiki: "Dune:_Part_Two", imdb: "https://www.imdb.com/title/tt15239678/", format: "IMAX", rating: "9.4", desc: "Paul Atreides se unește cu Chani și fremenii pe calea răzbunării împotriva conspiratorilor care i-au distrus familia.", trailer: "dune.mp4", poster: "dune.jpg", times: ["14:00", "16:30", "19:00", "21:30"] },
    { id: 2, title: "Interstellar", genre: "Sci-Fi", wiki: "Interstellar_(film)", imdb: "https://www.imdb.com/title/tt0816692/", format: "IMAX", rating: "9.2", desc: "O echipă de exploratori călătorește printr-o gaură de vierme în spațiu pentru a asigura supraviețuirea umanității.", trailer: "interstellar.mp4", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 3, title: "The Dark Knight", genre: "Acțiune", wiki: "The_Dark_Knight", imdb: "https://www.imdb.com/title/tt0468569/", format: "VIP", rating: "9.5", desc: "Când amenințarea cunoscută sub numele de Joker face ravagii în Gotham, Batman trece prin cel mai mare test.", trailer: "batman_dk.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 4, title: "Inception", genre: "Thriller", wiki: "Inception", imdb: "https://www.imdb.com/title/tt1375666/", format: "4DX", rating: "9.0", desc: "Un hoț care fură secrete corporative prin tehnologia viselor primește sarcina de a planta o idee în mintea unui CEO.", trailer: "inception.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 5, title: "Avatar: The Way of Water", genre: "Sci-Fi", wiki: "Avatar:_The_Way_of_Water", imdb: "https://www.imdb.com/title/tt1630029/", format: "4DX", rating: "8.7", desc: "Jake Sully trăiește cu noua sa familie pe planeta Pandora și luptă pentru a-și proteja tribul în adâncurile oceanului.", trailer: "avatar.mp4", poster: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 6, title: "Oppenheimer", genre: "Biografic", wiki: "Oppenheimer_(film)", imdb: "https://www.imdb.com/title/tt15398776/", format: "IMAX", rating: "9.1", desc: "Povestea fizicianului J. Robert Oppenheimer și rolul său decisiv în dezvoltarea primei bombe atomice.", trailer: "oppenheimer.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 7, title: "Spider-Man: Across the Spider-Verse", genre: "Animație", wiki: "Spider-Man:_Across_the_Spider-Verse", imdb: "https://www.imdb.com/title/tt9362722/", format: "4DX", rating: "9.3", desc: "Miles Morales călătorește prin Multivers, unde întâlnește o nouă echipă de Oameni-Păianjen.", trailer: "spiderman.mp4", poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 8, title: "The Batman", genre: "Acțiune", wiki: "The_Batman_(film)", imdb: "https://www.imdb.com/title/tt1877830/", format: "VIP", rating: "8.8", desc: "Când un criminal sadic lasă în urmă indicii criptice, Batman investighează lumea interlopă din Gotham.", trailer: "the_batman.mp4", poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", times: ["16:30", "18:00", "20:30", "21:30"] }
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

// === 1. LOGICĂ DARK / LIGHT MODE ===
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('cinema_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
        if (themeLabel) themeLabel.innerText = "Light";
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        if (isLight) {
            if (themeIcon) themeIcon.className = "fa-solid fa-sun";
            if (themeLabel) themeLabel.innerText = "Light";
            localStorage.setItem('cinema_theme', 'light');
        } else {
            if (themeIcon) themeIcon.className = "fa-solid fa-moon";
            if (themeLabel) themeLabel.innerText = "Dark";
            localStorage.setItem('cinema_theme', 'dark');
        }
    });
}

// === 2. LOGICĂ NOTIFICĂRI PUSH / REMINDER ===
function setupPushReminder(movieTitle, dateStr, timeStr) {
    const reminderBtn = document.getElementById('enable-reminder-btn');
    if (!reminderBtn) return;

    reminderBtn.onclick = async () => {
        if (!("Notification" in window)) {
            alert("Browserul tău nu suportă notificări push.");
            return;
        }
        let permission = Notification.permission;
        if (permission === "default") {
            permission = await Notification.requestPermission();
        }
        if (permission === "granted") {
            alert("🔔 Reminder setat cu succes! Vei primi o notificare pe ecran înainte de începerea filmului.");
            reminderBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#2ecc71;"></i> Reminder Setat';
            reminderBtn.style.borderColor = "#2ecc71";
            reminderBtn.disabled = true;

            setTimeout(() => {
                new Notification("🎬 Cinema NIII7 Reminder", {
                    body: `Filmul "${movieTitle}" începe la ora ${timeStr} (${dateStr}). Pregătește-te de plecare spre Corpul N!`,
                    icon: "https://img.icons8.com/color/96/clapperboard.png"
                });
            }, 8000); // Test demonstrativ după 8 secunde
        } else {
            alert("Pentru a primi remindere, trebuie să permiți notificările din browser.");
        }
    };
}

// === 3. FUNCȚII AUXILIARE PENTRU GOOGLE & APPLE CALENDAR ===
function parseDateTime(dateStr, timeStr) {
    const monthsMap = {
        "Ianuarie": 0, "Februarie": 1, "Martie": 2, "Aprilie": 3,
        "Mai": 4, "Iunie": 5, "Iulie": 6, "August": 7,
        "Septembrie": 8, "Octombrie": 9, "Noiembrie": 10, "Decembrie": 11
    };
    const parts = dateStr.split(', ')[1].split(' ');
    const day = parseInt(parts[0], 10);
    const month = monthsMap[parts[1]];
    const year = parseInt(parts[2], 10);
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));

    const startDate = new Date(year, month, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + (2 * 60 + 30) * 60 * 1000); // Durată estimată 2h 30m
    return { startDate, endDate };
}

function formatICSDate(date) {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

function createGoogleCalendarUrl(title, desc, location, startDate, endDate) {
    const fmtStart = formatICSDate(startDate);
    const fmtEnd = formatICSDate(endDate);
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: `🎬 Cinema NIII7: ${title}`,
        dates: `${fmtStart}/${fmtEnd}`,
        details: desc,
        location: location
    });
    return `${baseUrl}?${params.toString()}`;
}

function downloadICSFile(title, desc, location, startDate, endDate) {
    const fmtStart = formatICSDate(startDate);
    const fmtEnd = formatICSDate(endDate);
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Cinema NIII7 Brașov//RO",
        "BEGIN:VEVENT",
        `SUMMARY:🎬 Cinema NIII7: ${title}`,
        `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        `DTSTART:${fmtStart}`,
        `DTEND:${fmtEnd}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `Vizionare_${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// === 4. PERSPECTIVĂ ECRAN CINEMA 3D ===
function update3DScreenPerspective(r, c, isAi = false) {
    const dynScreen = document.getElementById('dynamic-screen');
    if (!dynScreen) return;
    
    const rotX = -50 + (r * 4);
    const rotY = (6.5 - c) * 2.8;
    const scale = 1.12 - (r * 0.03);
    dynScreen.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    
    const label = document.getElementById('screen-perspective-label');
    if (label) {
        if (isAi) {
            label.innerText = `✨ AI SWEET-SPOT ACTIVAT: R${r}L${c} & R${r}L${c+1} (ACUSTICĂ IMAX 99.8%)`;
        } else {
            label.innerText = `UNGHI VIZIONARE SIMULAT DE PE LOCUL R${r}L${c}`;
        }
    }
}

// Generare date calendar viitoare
function buildFutureDates(refDate) {
    const months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    const days = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
    availableDates = [];
    for (let i = 1; i <= 4; i++) {
        const future = new Date(refDate);
        future.setDate(refDate.getDate() + i);
        availableDates.push(`${days[future.getDay()]}, ${future.getDate()} ${months[future.getMonth()]} ${future.getFullYear()}`);
    }
    const label = document.getElementById('live-date-label');
    if (label) label.innerText = `Azi: ${refDate.getDate()} ${months[refDate.getMonth()]} ${refDate.getFullYear()}`;
}

async function initLiveAPIs() {
    buildFutureDates(new Date());
    try {
        const tRes = await fetch(API_CONFIG.TIME_API);
        const tData = await tRes.json();
        if (tData && tData.datetime) {
            baseSystemDate = new Date(tData.datetime);
            buildFutureDates(baseSystemDate);
        }
    } catch (e) {}
    try {
        const wRes = await fetch(API_CONFIG.WEATHER_API);
        const wData = await wRes.json();
        if (wData.current_weather) {
            const wEl = document.getElementById('weather-temp');
            if (wEl) wEl.innerText = `${Math.round(wData.current_weather.temperature)}°C`;
        }
    } catch (e) {
        const wEl = document.getElementById('weather-temp');
        if (wEl) wEl.innerText = "16°C";
    }
}

function updateLegendPrices() {
    const fmt = bookingFormatSelect.value;
    const surcharge = fmt === '4DX' ? 10 : (fmt === 'VIP' ? 15 : 0);
    const legStd = document.getElementById('leg-std');
    const legPrm = document.getElementById('leg-prm');
    const legVip = document.getElementById('leg-vip');
    if (legStd) legStd.dataset.ron = 30 + surcharge;
    if (legPrm) legPrm.dataset.ron = 45 + surcharge;
    if (legVip) legVip.dataset.ron = 60 + surcharge;
    
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
        if (movieTrailerEl) movieTrailerEl.pause();
        const target = btn.dataset.nav;
        if (target === 'home') showView(homeView);
        if (target === 'imax') showView(imaxView);
        if (target === '4dx') showView(dxView);
        if (target === 'vip') showView(vipView);
    });
});

document.getElementById('nav-logo').addEventListener('click', () => document.querySelector('[data-nav="home"]').click());

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
        if (movieTrailerEl) {
            movieTrailerEl.src = movie.trailer;
            movieTrailerEl.play().catch(e => e);
        }
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
        if (titleEl) titleEl.innerText = "SALA IMAX LASER 3D — SELECTARE LOCURI";
        if (screenLabel) screenLabel.innerText = "ECRAN GIGANT IMAX 24M (PERSPECTIVĂ CENTRALĂ)";
    } else if (fmt === '4DX') {
        if (titleEl) titleEl.innerText = "SALA 4DX EXTREME MOTION — SELECTARE LOCURI";
        if (screenLabel) screenLabel.innerText = "ECRAN 4DX + EFECTE VÂNT & APĂ";
    } else {
        if (titleEl) titleEl.innerText = "SALA VIP LUXURY LOUNGE — SELECTARE LOCURI";
        if (screenLabel) screenLabel.innerText = "ECRAN VIP + BUFET NELIMITAT";
    }
    updateLegendPrices();
}

bookingFormatSelect.addEventListener('change', () => { applyAuditoriumFormatStyle(); generateSeats(); resetSelection(); });

document.getElementById('hero-book-btn').addEventListener('click', () => openMoviePage(movies[0]));
document.getElementById('back-btn').addEventListener('click', () => { showView(homeView); if (movieTrailerEl) movieTrailerEl.pause(); });
document.getElementById('my-tickets-btn').addEventListener('click', () => { showView(ticketsView); renderMyTickets(); });
document.getElementById('back-to-home-btn').addEventListener('click', () => showView(homeView));

// AI Sweet-Spot pentru selectarea automată a celor mai bune locuri + rotire ecran
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

// Randare filme în pagină
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
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
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

// Generare scaune & mișcare ecran la click
function populateBookingOptions(movie) {
    bookingDateSelect.innerHTML = '';
    bookingTimeSelect.innerHTML = '';
    if (availableDates.length === 0) buildFutureDates(new Date());
    availableDates.forEach(d => bookingDateSelect.appendChild(new Option(d, d)));
    movie.times.forEach(t => bookingTimeSelect.appendChild(new Option(t, t)));
}

function generateSeats() {
    seatsContainer.innerHTML = '';
    const fmt = bookingFormatSelect.value;
    const surcharge = fmt === '4DX' ? 10 : (fmt === 'VIP' ? 15 : 0);
    for (let r = 0; r < 7; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        let seatClass = r < 2 ? 'standard' : (r < 5 ? 'premium' : 'vip');
        let seatPrice = (r < 2 ? 30 : (r < 5 ? 45 : 60)) + surcharge;
        for (let c = 0; c < 12; c++) {
            const seat = document.createElement('div');
            seat.className = `seat ${seatClass}`;
            seat.dataset.price = seatPrice;
            seat.dataset.row = r + 1;
            seat.dataset.col = c + 1;
            seat.dataset.id = `R${r+1}L${c+1}`;
            if (Math.random() < 0.24 && !(r === 3 && (c === 5 || c === 6))) {
                seat.classList.add('occupied');
            }
            rowDiv.appendChild(seat);
        }
        seatsContainer.appendChild(rowDiv);
    }
}

seatsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        e.target.classList.toggle('selected');
        const r = parseInt(e.target.dataset.row);
        const c = parseInt(e.target.dataset.col);
        update3DScreenPerspective(r, c, false); // Mișcă ecranul 3D
        updateSelection();
    }
});

function updateSelection() {
    const selected = document.querySelectorAll('.row .seat.selected');
    ticketsTotal = Array.from(selected).reduce((sum, seat) => sum + parseInt(seat.dataset.price), 0);
    const rate = exchangeRates[currentCurrency];
    document.getElementById('count').innerText = selected.length;
    document.getElementById('total-tickets').innerText = currentCurrency === 'RON' ? ticketsTotal : (ticketsTotal * rate).toFixed(2);
    document.getElementById('continue-to-snacks-btn').disabled = selected.length === 0;
}

function resetSelection() {
    ticketsTotal = 0; snacksTotal = 0; finalTotal = 0;
    document.getElementById('count').innerText = '0';
    document.getElementById('total-tickets').innerText = '0';
    document.getElementById('continue-to-snacks-btn').disabled = true;
    document.querySelectorAll('.snack-input').forEach(inp => inp.value = 0);
}

const snacksModal = document.getElementById('snacks-modal');
const paymentModal = document.getElementById('payment-modal');

document.getElementById('continue-to-snacks-btn').addEventListener('click', () => { snacksModal.style.display = 'flex'; });
document.getElementById('cancel-snacks-btn').addEventListener('click', () => snacksModal.style.display = 'none');

document.querySelectorAll('.snack-input').forEach(input => input.addEventListener('input', () => {
    const p = parseInt(document.getElementById('snack-popcorn').value) || 0;
    const n = parseInt(document.getElementById('snack-nachos').value) || 0;
    const s = parseInt(document.getElementById('snack-soda').value) || 0;
    snacksTotal = (p * 25) + (n * 22) + (s * 12);
    document.getElementById('snacks-total-display').innerText = snacksTotal + " RON";
}));

document.getElementById('proceed-to-pay-btn').addEventListener('click', () => {
    snacksModal.style.display = 'none';
    finalTotal = ticketsTotal + snacksTotal;
    document.getElementById('summary-tickets').innerText = ticketsTotal;
    document.getElementById('summary-snacks').innerText = snacksTotal;
    document.getElementById('modal-total').innerText = finalTotal;
    document.getElementById('payment-form-content').style.display = 'block';
    document.getElementById('ticket-success-content').style.display = 'none';
    paymentModal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => paymentModal.style.display = 'none');

// Procesare Plată și Generare Bilet
document.getElementById('confirm-btn').addEventListener('click', async () => {
    const email = document.getElementById('email-input').value.trim();
    if (!email.includes('@')) { alert("Introdu o adresă de email validă!"); return; }

    const selectedSeats = Array.from(document.querySelectorAll('.row .seat.selected')).map(s => s.dataset.id).join(', ');
    const date = bookingDateSelect.value;
    const time = bookingTimeSelect.value;
    const fmt = bookingFormatSelect.value;

    const btn = document.getElementById('confirm-btn');
    btn.innerText = "SE PROCESEAZĂ...";
    await new Promise(r => setTimeout(r, API_CONFIG.SIMULATE_STRIPE_DELAY));

    const qrUrl = `${API_CONFIG.QR_API_URL}${encodeURIComponent("Cinema NIII7 - " + currentMovie.title)}`;
    document.getElementById('qr-code-img').src = qrUrl;
    document.getElementById('ticket-format-badge').innerText = `${fmt} PASS`;
    document.getElementById('ticket-movie-name').innerText = currentMovie.title;
    document.getElementById('ticket-datetime').innerText = `${date} | Ora ${time}`;
    document.getElementById('ticket-seats-info').innerText = `LOCURI (${fmt}): ${selectedSeats}`;

    // === ACTIVARE BUTOANE GOOGLE & APPLE CALENDAR ===
    const { startDate, endDate } = parseDateTime(date, time);
    const calendarTitle = `${currentMovie.title} (${fmt})`;
    const calendarDesc = `Bilet Cinema NIII7 Brașov\\nLocuri: ${selectedSeats}\\nFormat: ${fmt}`;
    const calendarLocation = "Cinema NIII7, Corpul N, Universitatea Transilvania, Brașov";

    const gBtn = document.getElementById('add-google-calendar-btn');
    if (gBtn) {
        gBtn.onclick = () => {
            window.open(createGoogleCalendarUrl(calendarTitle, calendarDesc, calendarLocation, startDate, endDate), '_blank');
        };
    }
    const aBtn = document.getElementById('add-apple-calendar-btn');
    if (aBtn) {
        aBtn.onclick = () => {
            downloadICSFile(calendarTitle, calendarDesc, calendarLocation, startDate, endDate);
        };
    }

    // === ACTIVARE REMINDER PUSH NOTIFICĂRI ===
    setupPushReminder(currentMovie.title, date, time);

    saveTicketToLocal(`${currentMovie.title} [${fmt}]`, date, time, selectedSeats, qrUrl, finalTotal);

    btn.innerText = "CONFIRMĂ PLATA";
    document.getElementById('payment-form-content').style.display = 'none';
    document.getElementById('ticket-success-content').style.display = 'block';
    document.querySelectorAll('.row .seat.selected').forEach(s => { s.classList.remove('selected'); s.classList.add('occupied'); });
    resetSelection();
});

document.getElementById('download-ticket-btn').addEventListener('click', () => {
    html2canvas(document.getElementById('ticket-to-download'), { backgroundColor: '#0b0c10', scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bilet_NIII7_${currentMovie.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

document.getElementById('close-success-btn').addEventListener('click', () => paymentModal.style.display = 'none');

function saveTicketToLocal(movie, date, time, seats, qrUrl, price) {
    let tickets = JSON.parse(localStorage.getItem('cinema_tickets')) || [];
    tickets.push({ id: Date.now(), movie, date, time, seats, qrUrl, price });
    localStorage.setItem('cinema_tickets', JSON.stringify(tickets));
    let adminRev = parseFloat(localStorage.getItem('cinema_revenue') || 0);
    localStorage.setItem('cinema_revenue', adminRev + price);
}

function renderMyTickets() {
    const container = document.getElementById('tickets-history-container');
    container.innerHTML = '';
    const tickets = JSON.parse(localStorage.getItem('cinema_tickets')) || [];
    if (tickets.length === 0) {
        container.innerHTML = "<p style='color:#9ba1b0;'>Nu ai niciun bilet activ în acest moment.</p>";
        return;
    }
    tickets.reverse().forEach(t => {
        container.innerHTML += `
            <div class="vip-ticket-pass" style="width: 310px;">
                <div class="ticket-top"><span>CINEMA <b>NIII7</b></span><span>PASS</span></div>
                <div class="ticket-body">
                    <h3 style="font-size:1.35rem;">${t.movie}</h3>
                    <p class="ticket-meta">${t.date} | ${t.time}</p>
                    <div class="ticket-seats-box">Locuri: ${t.seats}</div>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-bottom"><div class="qr-container"><img src="${t.qrUrl}" style="width:110px; height:110px; display:block;"></div></div>
            </div>`;
    });
}

renderMovies();
initLiveAPIs();