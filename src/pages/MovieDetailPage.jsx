import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SNACKS_PRICES } from "../data/moviesData";
import { useCinema } from "../context/CinemaContext";
import {
  fetchWikipediaSummary,
  buildQrValidationUrl,
  sendTicketEmail
} from "../services/api";
import { getSeatMeta } from "../utils/validation";
import { createTicketId, MAX_SEATS_PER_ORDER } from "../utils/tickets";
import SeatMap from "../components/SeatMap";
import SnacksModal from "../components/SnacksModal";
import PaymentModal from "../components/PaymentModal";
import TicketSuccessModal from "../components/TicketSuccessModal";

const SCREEN_LABELS = {
  IMAX: "ECRAN GIGANT IMAX 24M (PERSPECTIVĂ CENTRALĂ)",
  "4DX": "ECRAN 4DX + EFECTE VÂNT & APĂ",
  VIP: "ECRAN VIP + BUFET NELIMITAT"
};

const EMPTY_SNACKS = { popcorn: 0, nachos: 0, soda: 0 };

export default function MovieDetailPage() {
  const { id } = useParams();
  const { movies } = useCinema();
  const lastFoundRef = useRef(null);

  const found = movies.find((m) => String(m.id) === String(id));
  if (found) lastFoundRef.current = found;
  const movie =
    found || (lastFoundRef.current && String(lastFoundRef.current.id) === String(id)
      ? lastFoundRef.current
      : null);

  if (!movie) return <MovieNotFound />;
  return <MovieBooking key={movie.id} movie={movie} />;
}

function MovieNotFound() {
  const navigate = useNavigate();
  return (
    <main className="view-page">
      <div className="location-section" style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Oswald, sans-serif", marginBottom: "12px" }}>Film negăsit</h1>
        <p style={{ color: "#9ba1b0", marginBottom: "20px" }}>
          Filmul căutat nu există în programul curent.
        </p>
        <button type="button" className="btn-cinema" onClick={() => navigate("/")}>
          Înapoi la Program
        </button>
      </div>
    </main>
  );
}

function MovieBooking({ movie }) {
  const navigate = useNavigate();
  const {
    availableDates,
    currency,
    exchangeRates,
    formatPrice,
    getOccupiedForSlot,
    recordBooking
  } = useCinema();

  const [bookingFormat, setBookingFormat] = useState(movie.format);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingTime, setBookingTime] = useState(movie.times[0] || "19:00");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [screenTransform, setScreenTransform] = useState("rotateX(-35deg)");
  const [screenLabelOverride, setScreenLabelOverride] = useState("");
  const [seatNotice, setSeatNotice] = useState("");

  const [wikiText, setWikiText] = useState("");
  const [wikiLoading, setWikiLoading] = useState(false);
  const wikiControllerRef = useRef(null);

  const [trailerFailed, setTrailerFailed] = useState(false);

  const [snacks, setSnacks] = useState(EMPTY_SNACKS);
  const [isSnacksOpen, setIsSnacksOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const bookingDate = availableDates.includes(selectedDate)
    ? selectedDate
    : availableDates[0] || "";

  useEffect(() => () => wikiControllerRef.current?.abort(), []);

  const screenLabel = screenLabelOverride || SCREEN_LABELS[bookingFormat] || SCREEN_LABELS.VIP;

  const slotKey = `${movie.id}_${bookingFormat}_${bookingDate}_${bookingTime}`;
  const occupiedSeats = getOccupiedForSlot(slotKey);

  function resetSelection() {
    setSelectedSeats([]);
    setSeatNotice("");
    setScreenLabelOverride("");
    setScreenTransform("rotateX(-35deg)");
  }

  function update3DScreen(row, col, isAi = false) {
    const rotX = -50 + row * 4;
    const rotY = (6.5 - col) * 2.8;
    const scale = 1.12 - row * 0.03;
    setScreenTransform(`rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`);
    if (isAi) {
      setScreenLabelOverride(
        `✨ AI SWEET-SPOT ACTIVAT: R${row}L${col} & R${row}L${col + 1} (ACUSTICĂ IMAX 99.8%)`
      );
    } else {
      setScreenLabelOverride(`UNGHI VIZIONARE SIMULAT DE PE LOCUL R${row}L${col}`);
    }
  }

  function handleToggleSeat(seatObj) {
    const alreadySelected = selectedSeats.some((s) => s.id === seatObj.id);
    if (!alreadySelected && selectedSeats.length >= MAX_SEATS_PER_ORDER) {
      setSeatNotice(`Poți rezerva cel mult ${MAX_SEATS_PER_ORDER} locuri într-o comandă.`);
      return;
    }
    setSeatNotice("");
    update3DScreen(seatObj.row, seatObj.col, false);
    setSelectedSeats((prev) =>
      alreadySelected ? prev.filter((s) => s.id !== seatObj.id) : [...prev, seatObj]
    );
  }

  function handleAiSweetSpot() {
    const preferredRows = [4, 5, 3, 6];
    const preferredCols = [6, 5, 7, 4];
    for (const r of preferredRows) {
      for (const c of preferredCols) {
        const id1 = `R${r}L${c}`;
        const id2 = `R${r}L${c + 1}`;
        if (!occupiedSeats.includes(id1) && !occupiedSeats.includes(id2)) {
          const meta = getSeatMeta(r - 1, bookingFormat);
          setSelectedSeats([
            { id: id1, row: r, col: c, price: meta.price, category: meta.label },
            { id: id2, row: r, col: c + 1, price: meta.price, category: meta.label }
          ]);
          setSeatNotice("");
          update3DScreen(r, c, true);
          return;
        }
      }
    }
    setSeatNotice("Nu mai există două locuri alăturate libere în această proiecție.");
  }

  async function handleLoadWikipedia() {
    wikiControllerRef.current?.abort();
    const controller = new AbortController();
    wikiControllerRef.current = controller;
    setWikiLoading(true);
    try {
      const summary = await fetchWikipediaSummary(movie.wiki, controller.signal);
      if (!controller.signal.aborted) setWikiText(summary);
    } catch {
      if (!controller.signal.aborted) {
        setWikiText("Nu s-au putut încărca datele live de pe Wikipedia în acest moment.");
      }
    } finally {
      if (wikiControllerRef.current === controller) setWikiLoading(false);
    }
  }

  const ticketsTotalRon = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const snacksTotalRon =
    snacks.popcorn * SNACKS_PRICES.popcorn +
    snacks.nachos * SNACKS_PRICES.nachos +
    snacks.soda * SNACKS_PRICES.soda;

  const rate = exchangeRates[currency] ?? 1;
  const displayedTicketsTotal =
    currency === "RON" ? ticketsTotalRon : (ticketsTotalRon * rate).toFixed(2);

  async function handleConfirmPayment({ email, finalTotal }) {
    const seatIds = selectedSeats.map((s) => s.id);
    const currentlyOccupied = getOccupiedForSlot(slotKey);
    const conflicts = seatIds.filter((seat) => currentlyOccupied.includes(seat));
    if (conflicts.length > 0) {
      setSelectedSeats((prev) => prev.filter((s) => !conflicts.includes(s.id)));
      setIsPaymentOpen(false);
      setSeatNotice(
        `Locurile ${conflicts.join(", ")} au fost ocupate între timp. Alege alte locuri.`
      );
      return;
    }

    const seatsStr = seatIds.join(", ");
    const snacksArr = [];
    if (snacks.popcorn > 0) snacksArr.push(`${snacks.popcorn}x Popcorn`);
    if (snacks.nachos > 0) snacksArr.push(`${snacks.nachos}x Nachos`);
    if (snacks.soda > 0) snacksArr.push(`${snacks.soda}x Suc`);
    const snacksText = snacksArr.length > 0 ? `Snacks: ${snacksArr.join(", ")}` : "Fără snacks-uri";

    const ticketId = createTicketId();
    const { qrUrl } = buildQrValidationUrl({
      ticketId,
      movieTitle: movie.title,
      date: bookingDate,
      time: bookingTime,
      seats: seatsStr,
      format: bookingFormat
    });

    const ticketObj = {
      id: ticketId,
      movie: `${movie.title} [${bookingFormat}]`,
      movieTitle: movie.title,
      format: bookingFormat,
      date: bookingDate,
      time: bookingTime,
      seats: seatsStr,
      snacksText,
      qrUrl,
      price: finalTotal,
      email,
      createdAt: new Date().toISOString()
    };

    recordBooking(ticketObj, slotKey, seatIds);

    setIsPaymentOpen(false);
    setConfirmedTicket(ticketObj);
    setSelectedSeats([]);
    setSnacks(EMPTY_SNACKS);
    setSeatNotice("");

    sendTicketEmail({
      to_email: email,
      movie: movie.title,
      date: bookingDate,
      time: bookingTime,
      seats: seatsStr,
      ticket_id: ticketId,
      qr_link: qrUrl
    });
  }

  return (
    <main className="view-page">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Înapoi la Program
      </button>

      <section className="movie-showcase">
        <div className="movie-header">
          <div className="showcase-badges">
            <span className="badge-orange">{bookingFormat} EXPERIENCE</span>
            <span className="badge-dark">{movie.genre.toUpperCase()}</span>
            <span className="badge-dark">
              <i className="fa-solid fa-star" style={{ color: "#ffb700" }} aria-hidden="true" />{" "}
              {movie.rating} / 10
            </span>
            <span className="badge-gold">CORPUL N BRAȘOV</span>
          </div>
          <h1 id="movie-title">{movie.title}</h1>
          <p className="movie-description">{movie.desc}</p>

          <div className="movie-api-bar">
            <a href={movie.imdb} target="_blank" rel="noreferrer" className="api-pill imdb-btn">
              <i className="fa-brands fa-imdb" aria-hidden="true" /> Pagina IMDb
            </a>
            <a
              href={`https://letterboxd.com/search/${encodeURIComponent(movie.title)}/`}
              target="_blank"
              rel="noreferrer"
              className="api-pill lb-btn"
            >
              <i className="fa-solid fa-film" aria-hidden="true" /> Letterboxd
            </a>
            <button
              type="button"
              className="api-pill wiki-btn"
              onClick={handleLoadWikipedia}
              disabled={wikiLoading}
            >
              <i className="fa-solid fa-globe" aria-hidden="true" />{" "}
              {wikiLoading ? "Se încarcă..." : "Date Live Wikipedia API"}
            </button>
          </div>

          {wikiText && (
            <div className="wiki-box" role="status">
              {wikiText}
            </div>
          )}
        </div>

        <div className="trailer-container">
          {trailerFailed ? (
            <div className="trailer-fallback" role="status">
              <i className="fa-solid fa-film" aria-hidden="true" />
              <p>Trailerul pentru „{movie.title}” nu este disponibil momentan.</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${movie.title} official trailer`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="api-pill wiki-btn"
              >
                Caută trailerul pe YouTube
              </a>
            </div>
          ) : (
            <video
              src={movie.trailer}
              width="100%"
              controls
              preload="metadata"
              poster={movie.poster}
              onError={() => setTrailerFailed(true)}
            >
              Browser-ul tău nu suportă redarea video.
            </video>
          )}
        </div>
      </section>

      <section className="booking-options" aria-label="Opțiuni proiecție">
        <div className="input-group">
          <label htmlFor="booking-format">
            <i className="fa-solid fa-sliders" aria-hidden="true" /> ALEGE FORMATUL & SALA
          </label>
          <select
            id="booking-format"
            value={bookingFormat}
            onChange={(e) => {
              setBookingFormat(e.target.value);
              resetSelection();
            }}
          >
            <option value="IMAX">Sala IMAX 3D Laser (+0 RON)</option>
            <option value="4DX">Sala 4DX Extreme Motion (+10 RON/loc)</option>
            <option value="VIP">Sala VIP Luxury All-Inclusive (+15 RON/loc)</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="booking-date">
            <i className="fa-regular fa-calendar-days" aria-hidden="true" /> DATA VIITOARE (TIME API)
          </label>
          <select
            id="booking-date"
            value={bookingDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              resetSelection();
            }}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="booking-time">
            <i className="fa-regular fa-clock" aria-hidden="true" /> ORA PROIECȚIEI
          </label>
          <select
            id="booking-time"
            value={bookingTime}
            onChange={(e) => {
              setBookingTime(e.target.value);
              resetSelection();
            }}
          >
            {movie.times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </section>

      <SeatMap
        format={bookingFormat}
        occupiedSeats={occupiedSeats}
        selectedSeats={selectedSeats}
        onToggleSeat={handleToggleSeat}
        onSelectSweetSpot={handleAiSweetSpot}
        screenTransform={screenTransform}
        screenLabel={screenLabel}
        formatPrice={formatPrice}
      />

      <p role="status" className="seat-notice">
        {seatNotice}
      </p>

      <div className="booking-bar">
        <div className="info">
          <div className="info-item">
            <span className="info-label">LOCURI SELECTATE</span>
            <span className="info-val">{selectedSeats.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">TOTAL BILETE</span>
            <span className="info-val">
              {displayedTicketsTotal} <small>{currency}</small>
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn-cinema"
          disabled={selectedSeats.length === 0}
          onClick={() => setIsSnacksOpen(true)}
        >
          CONTINUĂ SPRE SNACKS <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <SnacksModal
        isOpen={isSnacksOpen}
        snacks={snacks}
        onChangeSnacks={setSnacks}
        onBack={() => setIsSnacksOpen(false)}
        onProceed={() => {
          setIsSnacksOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        ticketsTotal={ticketsTotalRon}
        snacksTotal={snacksTotalRon}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      <TicketSuccessModal
        ticket={confirmedTicket}
        onClose={() => setConfirmedTicket(null)}
      />
    </main>
  );
}
