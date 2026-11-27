import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCinema } from "../context/CinemaContext";

export default function AdminPage() {
  const navigate = useNavigate();
  const { tickets, revenue, resetAllData } = useCinema();
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleReset() {
    resetAllData();
    setConfirmingReset(false);
  }

  return (
    <main className="view-page">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Înapoi la Cinema
      </button>

      <section className="admin-dashboard">
        <h2>
          <i className="fa-solid fa-chart-line" aria-hidden="true" /> PANOU ADMINISTRATOR — CINEMA NIII7
        </h2>
        <div className="admin-stats">
          <span>ÎNCASĂRI TOTALE ({tickets.length} comenzi):</span>
          <strong>{Number(revenue).toFixed(2)} RON</strong>
        </div>

        <h3 style={{ marginBottom: "14px" }}>Istoric Bilete Vândute:</h3>
        <div className="admin-list">
          {tickets.length === 0 ? (
            <p className="empty-note">Nicio comandă înregistrată momentan.</p>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="admin-row">
                <strong className="admin-movie">{t.movie}</strong> — {t.date} ({t.time})
                <br />
                <span className="admin-meta">
                  Bilet: {t.id} | Locuri: {t.seats} | Email: {t.email || "N/A"} | Total încasat:{" "}
                  <b>{t.price} RON</b>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="admin-actions">
          {confirmingReset ? (
            <>
              <span role="alert" className="admin-warning">
                Sigur ștergi toate comenzile, încasările și locurile rezervate? Acțiunea nu poate fi anulată.
              </span>
              <button type="button" className="btn-cancel" onClick={() => setConfirmingReset(false)}>
                Renunță
              </button>
              <button type="button" className="btn-danger" onClick={handleReset}>
                Da, șterge tot
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-danger"
              disabled={tickets.length === 0 && Number(revenue) === 0}
              onClick={() => setConfirmingReset(true)}
            >
              <i className="fa-solid fa-trash" aria-hidden="true" /> Resetează datele
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
