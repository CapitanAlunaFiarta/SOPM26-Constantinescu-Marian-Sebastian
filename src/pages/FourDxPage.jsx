import React from "react";
import { useCinema } from "../context/CinemaContext";

export default function FourDxPage() {
  const { triggerFx } = useCinema();

  return (
    <main className="view-page">
      <div className="exp-hero dx-hero">
        <span className="tag-imax" style={{ background: "#00d2ff" }}>
          CINEMA ABSOLUT 4D
        </span>
        <h1>
          SIMULATORUL <span>4DX® EXTREME</span>
        </h1>
        <p>Efecte ambientale sincronizate la milisecundă și scaune hidraulice active.</p>
      </div>

      <div className="exp-grid">
        <div className="exp-card">
          <h3>
            <i className="fa-solid fa-bolt" aria-hidden="true" /> TESTEAZĂ EFECTELE AMBIENTALE 4DX
          </h3>
          <p>Declanșează direct în browser simularea efectelor din sala 4DX Corpul N:</p>
          <div className="sim-controls" style={{ flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-cinema"
              onClick={() => triggerFx("fx-lightning", 700)}
            >
              ⚡ Fulger Stroboscopic
            </button>
            <button
              type="button"
              className="btn-cinema"
              style={{ background: "linear-gradient(90deg, #00d2ff, #1971c2)" }}
              onClick={() => triggerFx("fx-rain", 2400)}
            >
              🌧️ Ploaie & Ceață
            </button>
          </div>
        </div>

        <div className="exp-card">
          <h3>
            <i className="fa-solid fa-chair" aria-hidden="true" /> SCAUNE HIDRAULICE 3-AXIS
          </h3>
          <p>
            Fiecare loc din sala 4DX oferă mișcări Pitch, Roll și Heave combinate cu jeturi de aer și vibrații pentru o imersiune totală (+10 RON / bilet).
          </p>
        </div>
      </div>
    </main>
  );
}
