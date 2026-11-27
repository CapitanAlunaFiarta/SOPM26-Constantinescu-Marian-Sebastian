import React from "react";
import { useNavigate } from "react-router-dom";
import { useCinema } from "../context/CinemaContext";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { tickets } = useCinema();

  return (
    <main className="view-page">
      <div className="section-top-bar">
        <button type="button" className="back-btn" onClick={() => navigate("/")}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Înapoi la Program
        </button>
        <h1 className="section-heading">
          <i className="fa-solid fa-ticket" aria-hidden="true" /> BILETELE MELE REZERVATE
        </h1>
      </div>

      <div className="tickets-grid">
        {tickets.length === 0 ? (
          <p className="empty-note">Nu ai niciun bilet activ în acest moment.</p>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="vip-ticket-pass" style={{ width: "310px" }}>
              <div className="ticket-top">
                <span>
                  CINEMA <b>NIII7</b>
                </span>
                <span>{t.format || "PASS"}</span>
              </div>
              <div className="ticket-body">
                <h3 style={{ fontSize: "1.35rem" }}>{t.movie}</h3>
                <p className="ticket-meta">
                  {t.date} | {t.time}
                </p>
                <div className="ticket-seats-box">Locuri: {t.seats}</div>
                <p className="ticket-code">Cod bilet: {t.id}</p>
              </div>
              <div className="ticket-divider" />
              <div className="ticket-bottom">
                <div className="qr-container">
                  <img
                    src={t.qrUrl}
                    alt={`QR bilet ${t.movie}`}
                    style={{ width: "115px", height: "115px", display: "block" }}
                  />
                </div>
                <span className="scan-hint">{t.price} RON</span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
