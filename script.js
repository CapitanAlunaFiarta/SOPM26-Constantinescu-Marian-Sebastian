const API_CONFIG = {
    WEBSITE_BASE_URL: window.location.origin,
    QR_API_URL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=",
    SIMULATE_STRIPE_DELAY: 1500,
    EMAILJS_SERVICE_ID: "YOUR_SERVICE_ID",
    EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
    EMAILJS_PUBLIC_KEY: "YOUR_PUBLIC_KEY"
};
const availableDates = ["14 Octombrie 2026", "15 Octombrie 2026", "16 Octombrie 2026", "17 Octombrie 2026"];
const movies = [
    { id: 1, title: "Dune: Part Two", desc: "Paul Atreides se unește cu Chani pe calea răzbunării.", trailer: "dune.mp4", poster: "dune.jpg", times: ["14:00", "16:30", "19:00", "21:30"] },
    { id: 2, title: "Interstellar", desc: "O echipă călătorește printr-o gaură de vierme.", trailer: "interstellar.mp4", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 3, title: "The Dark Knight", desc: "Când amenințarea Joker face ravagii în Gotham.", trailer: "batman_dk.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 4, title: "Inception", desc: "Un hoț plantează o idee în mintea unui CEO.", trailer: "inception.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 5, title: "Avatar: The Way of Water", desc: "Jake Sully trăiește pe Pandora.", trailer: "avatar.mp4", poster: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_FMjpg_UX1000_.jpg", times: ["12:00", "16:30", "18:00", "20:30"] },
    { id: 6, title: "Oppenheimer", desc: "Dezvoltarea bombei atomice.", trailer: "oppenheimer.mp4", poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_FMjpg_UX1000_.jpg", times: ["14:00", "18:00", "19:00", "21:30"] },
    { id: 7, title: "Spider-Man: Across the Spider-Verse", desc: "Miles Morales în Multivers.", trailer: "spiderman.mp4", poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", times: ["12:00", "14:00", "16:30", "19:00"] },
    { id: 8, title: "The Batman", desc: "Batman investighează lumea interlopă.", trailer: "the_batman.mp4", poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", times: ["16:30", "18:00", "20:30", "21:30"] }
];
const homeView = document.getElementById('home-view');
const movieView = document.getElementById('movie-view');
const ticketsView = document.getElementById('my-tickets-view');
const adminView = document.getElementById('admin-view');
const moviesGrid = document.getElementById('movies-grid');
const seatsContainer = document.getElementById('seats-container');
const movieTitleEl = document.getElementById('movie-title');
const movieDescEl = document.getElementById('movie-desc');
const movieTrailerEl = document.getElementById('movie-trailer'); 
const bookingDateSelect = document.getElementById('booking-date');
const bookingTimeSelect = document.getElementById('booking-time');
let ticketsTotal = 0;
let snacksTotal = 0;
let finalTotal = 0;
let discountApplied = false;
let currentMovieTitle = "";
document.getElementById('back-btn').addEventListener('click', () => { showView(homeView); movieTrailerEl.pause(); });
document.getElementById('my-tickets-btn').addEventListener('click', () => { showView(ticketsView); renderMyTickets(); });
document.getElementById('back-to-home-btn').addEventListener('click', () => showView(homeView));
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        showView(adminView);
        renderAdminPanel();
    }
});
document.getElementById('admin-back-btn').addEventListener('click', () => showView(homeView));
function showView(viewEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    viewEl.classList.add('active');
    window.scrollTo(0,0);
}
function renderMovies() {
    const selectedTime = document.getElementById('time-filter').value;
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        if(selectedTime === 'all' || movie.times.includes(selectedTime)) {
            const card = document.createElement('div');
            card.className = 'movie-card';
            let timeBadgesHtml = movie.times.map(t => `<span class="time-badge">${t}</span>`).join('');
            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="time-badges">${timeBadgesHtml}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                document.body.classList.add('zooming-in');
                setTimeout(() => {
                    showView(movieView);
                    currentMovieTitle = movie.title;
                    movieTitleEl.innerText = movie.title;
                    movieDescEl.innerText = movie.desc;
                    movieTrailerEl.src = movie.trailer;
                    movieTrailerEl.play().catch(e=>e);
                    populateBookingOptions(movie);
                    generateSeats();
                    resetSelection();
                    document.body.classList.remove('zooming-in');
                }, 600);
            });
            moviesGrid.appendChild(card);
        }
    });
}
document.getElementById('time-filter').addEventListener('change', renderMovies);
function populateBookingOptions(movie) {
    bookingDateSelect.innerHTML = ''; bookingTimeSelect.innerHTML = '';
    availableDates.forEach(d => bookingDateSelect.appendChild(new Option(d, d)));
    movie.times.forEach(t => bookingTimeSelect.appendChild(new Option(t, t)));
}
bookingDateSelect.addEventListener('change', () => { generateSeats(); resetSelection(); });
bookingTimeSelect.addEventListener('change', () => { generateSeats(); resetSelection(); });
function generateSeats() {
    seatsContainer.innerHTML = '';
    for (let r = 0; r < 7; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        let seatClass = r < 2 ? 'standard' : (r < 5 ? 'premium' : 'vip');
        let seatPrice = r < 2 ? 30 : (r < 5 ? 45 : 60);
        for (let c = 0; c < 12; c++) {
            const seat = document.createElement('div');
            seat.className = `seat ${seatClass}`;
            seat.dataset.price = seatPrice;
            seat.dataset.id = `R${r+1}L${c+1}`; 
            if (Math.random() < 0.3) seat.classList.add('occupied');
            rowDiv.appendChild(seat);
        }
        seatsContainer.appendChild(rowDiv);
    }
}
seatsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        e.target.classList.toggle('selected');
        updateSelection();
    }
});
function updateSelection() {
    const selected = document.querySelectorAll('.row .seat.selected');
    ticketsTotal = Array.from(selected).reduce((sum, seat) => sum + parseInt(seat.dataset.price), 0);
    document.getElementById('count').innerText = selected.length;
    document.getElementById('total-tickets').innerText = ticketsTotal;
    document.getElementById('continue-to-snacks-btn').disabled = selected.length === 0;
}
function resetSelection() {
    ticketsTotal = 0; snacksTotal = 0; finalTotal = 0; discountApplied = false;
    document.getElementById('count').innerText = '0';
    document.getElementById('total-tickets').innerText = '0';
    document.getElementById('continue-to-snacks-btn').disabled = true;
    document.querySelectorAll('.snack-input').forEach(inp => inp.value = 0);
    document.getElementById('promo-input').value = '';
}
const snacksModal = document.getElementById('snacks-modal');
const paymentModal = document.getElementById('payment-modal');
document.getElementById('continue-to-snacks-btn').addEventListener('click', () => {
    updateSnacksTotal();
    snacksModal.style.display = 'flex';
});
document.getElementById('cancel-snacks-btn').addEventListener('click', () => {
    snacksModal.style.display = 'none';
});
document.querySelectorAll('.snack-input').forEach(input => {
    input.addEventListener('input', updateSnacksTotal);
});
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
    if (discountApplied) { alert("Ai aplicat deja o reducere!"); return; }
    if (code === 'STUDENT20' || code === 'CORPULN') {
        const discount = finalTotal * 0.20;
        finalTotal = finalTotal - discount;
        document.getElementById('modal-total').innerText = finalTotal.toFixed(2);
        discountApplied = true;
        alert(`Cod aplicat cu succes! Ai redus cu ${discount.toFixed(2)} RON.`);
    } else {
        alert("Cod invalid!");
    }
});
document.getElementById('card-number').addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').substring(0, 16); this.classList.remove('error'); });
document.getElementById('card-cvv').addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').substring(0, 3); this.classList.remove('error'); });
document.getElementById('card-expiry').addEventListener('input', function() {
    let val = this.value.replace(/[^\d/]/g, '');
    if (val.length === 2 && !val.includes('/')) val += '/';
    this.value = val.substring(0, 5);
    this.classList.remove('error');
    document.getElementById('expiry-error').style.display = 'none';
});
function isExpiryValid(exp) {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    let [m, y] = exp.split('/'); m = parseInt(m); y = parseInt(y) + 2000;
    if (m < 1 || m > 12) return false;
    let d = new Date();
    if (y < d.getFullYear()) return false;
    if (y === d.getFullYear() && m < (d.getMonth() + 1)) return false;
    return true;
}
document.getElementById('confirm-btn').addEventListener('click', async () => {
    const email = document.getElementById('email-input').value.trim();
    if (!email.includes('@')) { alert("Email invalid!"); return; }
    if (document.getElementById('card-number').value.length !== 16) { document.getElementById('card-number').classList.add('error'); return; }
    if (document.getElementById('card-cvv').value.length !== 3) { document.getElementById('card-cvv').classList.add('error'); return; }
    if (!isExpiryValid(document.getElementById('card-expiry').value)) { 
        document.getElementById('card-expiry').classList.add('error'); 
        document.getElementById('expiry-error').style.display = 'block'; return; 
    }
    const selectedSeats = Array.from(document.querySelectorAll('.row .seat.selected')).map(s => s.dataset.id).join(', ');
    const date = bookingDateSelect.value;
    const time = bookingTimeSelect.value;
    let snacksStr = [];
    if(document.getElementById('snack-popcorn').value > 0) snacksStr.push(document.getElementById('snack-popcorn').value + " Popcorn");
    if(document.getElementById('snack-nachos').value > 0) snacksStr.push(document.getElementById('snack-nachos').value + " Nachos");
    if(document.getElementById('snack-soda').value > 0) snacksStr.push(document.getElementById('snack-soda').value + " Suc");
    let snacksText = snacksStr.length > 0 ? "Extra: " + snacksStr.join(', ') : "";
    const btn = document.getElementById('confirm-btn');
    btn.innerText = "Se procesează..."; btn.classList.add('loading');
    await new Promise(r => setTimeout(r, API_CONFIG.SIMULATE_STRIPE_DELAY));
    let currentUrl = window.location.href;
    let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    if(baseUrl.endsWith('.html')) {
        baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
    }
    const validateUrl = `${baseUrl}/validare.html?film=${encodeURIComponent(currentMovieTitle)}&data=${encodeURIComponent(date)}&ora=${encodeURIComponent(time)}&locuri=${encodeURIComponent(selectedSeats)}`;
    const qrUrl = `${API_CONFIG.QR_API_URL}${encodeURIComponent(validateUrl)}`;
    document.getElementById('qr-code-img').src = qrUrl;
    document.getElementById('ticket-movie-name').innerText = currentMovieTitle;
    document.getElementById('ticket-datetime').innerText = `${date} | Ora ${time}`;
    document.getElementById('ticket-seats-info').innerText = `Locuri: ${selectedSeats}`;
    document.getElementById('ticket-snacks-info').innerText = snacksText;
    saveTicketToLocal(currentMovieTitle, date, time, selectedSeats, qrUrl, finalTotal);
    try {
        emailjs.init(API_CONFIG.EMAILJS_PUBLIC_KEY); 
        emailjs.send(API_CONFIG.EMAILJS_SERVICE_ID, API_CONFIG.EMAILJS_TEMPLATE_ID, {
            to_email: email, 
            movie: currentMovieTitle, 
            date: date, 
            time: time, 
            seats: selectedSeats,
            qr_link: qrUrl
        }).then(
          (response) => { console.log(response.status, response.text); },
          (error) => { console.log(error); }
        );
    } catch(e) {}
    btn.innerText = "Plătește"; btn.classList.remove('loading');
    document.getElementById('payment-form-content').style.display = 'none';
    document.getElementById('ticket-success-content').style.display = 'block';
    document.querySelectorAll('.row .seat.selected').forEach(s => { s.classList.remove('selected'); s.classList.add('occupied'); });
    resetSelection();
});
document.getElementById('download-ticket-btn').addEventListener('click', () => {
    const ticketDiv = document.getElementById('ticket-to-download');
    html2canvas(ticketDiv, { backgroundColor: '#12121a', scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bilet_${currentMovieTitle.replace(/\s+/g, '_')}.png`;
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
    if(tickets.length === 0) {
        container.innerHTML = "<p style='color:#ccc;'>Nu ai rezervat niciun bilet încă.</p>";
        return;
    }
    tickets.reverse().forEach(t => {
        const div = document.createElement('div');
        div.className = 'ticket-card';
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.padding = '20px'; div.style.borderRadius = '15px'; div.style.width = '300px';
        div.innerHTML = `
            <h3 style="color:#00f2fe; margin-bottom:10px;">${t.movie}</h3>
            <p>${t.date} | ${t.time}</p>
            <p style="color:#ff0844; margin-top:5px; font-weight:bold;">Locuri: ${t.seats}</p>
            <img src="${t.qrUrl}" style="width:100px; height:100px; margin-top:15px; border-radius:5px; background:white; padding:5px;">
        `;
        container.appendChild(div);
    });
}
function renderAdminPanel() {
    const rev = parseFloat(localStorage.getItem('cinema_revenue') || 0);
    document.getElementById('admin-revenue').innerText = rev.toFixed(2);
    const list = document.getElementById('admin-tickets-list');
    list.innerHTML = '';
    const tickets = JSON.parse(localStorage.getItem('cinema_tickets')) || [];
    tickets.reverse().forEach(t => {
        list.innerHTML += `<div style="border-bottom: 1px solid #333; padding: 10px 0;">
            <strong style="color:#00f2fe">${t.movie}</strong> - ${t.date} ${t.time} <br>
            <span style="color:#ccc">Locuri: ${t.seats} | Încasat: ${t.price} RON</span>
        </div>`;
    });
}
renderMovies();
