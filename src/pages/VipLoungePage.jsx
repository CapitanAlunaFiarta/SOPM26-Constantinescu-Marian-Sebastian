import React from "react";
import { useNavigate } from "react-router-dom";

export default function VipLoungePage() {
  const navigate = useNavigate();

  return (
    <main className="view-page">
      <div className="exp-hero vip-hero">
        <span className="tag-imax" style={{ background: "#ffb700" }}>
          ALL-INCLUSIVE LUXURY
        </span>
        <h1>
          EXPERIENȚA <span>VIP LOUNGE</span>
        </h1>
        <p>Fotolii din piele complet rabatabile, măsuță individuală și bufet nelimitat înainte de film.</p>
      </div>

      <div className="exp-grid">
        <div className="exp-card">
          <h3>
            <i className="fa-solid fa-crown" aria-hidden="true" /> CONFORT DE CLASA ÎNTÂI
          </h3>
          <p>
            Acces exclusiv în lounge-ul VIP cu 30 de minute înainte de proiecție, popcorn, nachos și băuturi răcoritoare incluse în suplimentul VIP (+15 RON / bilet).
          </p>
          <button type="button" className="btn-cinema" onClick={() => navigate("/")}>
            VEZI FILMELE ÎN VIP
          </button>
        </div>
      </div>
    </main>
  );
}
