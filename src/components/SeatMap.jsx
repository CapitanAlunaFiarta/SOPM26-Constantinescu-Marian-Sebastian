import React from "react";
import { getSeatMeta } from "../utils/validation";
import { SEAT_ROWS, SEAT_COLS } from "../utils/tickets";

const FORMAT_TITLES = {
  IMAX: "SALA IMAX LASER 3D — SELECTARE LOCURI",
  "4DX": "SALA 4DX EXTREME MOTION — SELECTARE LOCURI",
  VIP: "SALA VIP LUXURY LOUNGE — SELECTARE LOCURI"
};

export default function SeatMap({
  format = "IMAX",
  occupiedSeats = [],
  selectedSeats = [],
  onToggleSeat,
  onSelectSweetSpot,
  screenTransform = "rotateX(-35deg)",
  screenLabel = "ECRAN IMAX LASER",
  formatPrice = (ron) => `${ron} RON`
}) {
  const stdPrice = getSeatMeta(0, format).price;
  const prmPrice = getSeatMeta(2, format).price;
  const vipPrice = getSeatMeta(5, format).price;

  return (
    <div className="cinema-section">
      <div className="auditorium-header">
        <h2>{FORMAT_TITLES[format] || FORMAT_TITLES.VIP}</h2>
        <p>
          <i className="fa-solid fa-eye" aria-hidden="true" /> Click pe un loc sau folosește AI-ul pentru poziția ideală!
        </p>
        {onSelectSweetSpot && (
          <button
            type="button"
            className="btn-ai-sweetspot"
            onClick={onSelectSweetSpot}
          >
            ✨ Alege Locurile Ideale (AI Sweet-Spot)
          </button>
        )}
      </div>

      <ul className="legend">
        <li>
          <div className="seat standard" aria-hidden="true" /> Standard ({formatPrice(stdPrice)})
        </li>
        <li>
          <div className="seat premium" aria-hidden="true" /> Premium ({formatPrice(prmPrice)})
        </li>
        <li>
          <div className="seat vip" aria-hidden="true" /> VIP Ultra ({formatPrice(vipPrice)})
        </li>
        <li>
          <div className="seat occupied" aria-hidden="true" /> Ocupat
        </li>
        <li>
          <div className="seat selected" aria-hidden="true" /> Locul Tău
        </li>
      </ul>

      <div className="screen-wrapper">
        <div
          className="cinema-screen"
          style={{ transform: screenTransform }}
        />
        <div className="screen-text">{screenLabel}</div>
      </div>

      <div className="seats-container" role="group" aria-label="Harta locurilor din sală">
        {Array.from({ length: SEAT_ROWS }).map((_, r) => {
          const meta = getSeatMeta(r, format);
          return (
            <div key={r} className="row" role="group" aria-label={`Rândul ${r + 1}`}>
              {Array.from({ length: SEAT_COLS }).map((__, c) => {
                const seatId = `R${r + 1}L${c + 1}`;
                const isOccupied = occupiedSeats.includes(seatId);
                const isSelected = selectedSeats.some((s) => s.id === seatId);
                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={isOccupied}
                    aria-label={`Loc ${seatId} ${meta.label} ${meta.price} RON ${
                      isOccupied ? "ocupat" : isSelected ? "selectat" : "disponibil"
                    }`}
                    aria-pressed={isSelected}
                    className={`seat ${meta.type} ${isSelected ? "selected" : ""} ${
                      isOccupied ? "occupied" : ""
                    }`}
                    style={{ border: "none" }}
                    onClick={() =>
                      onToggleSeat({
                        id: seatId,
                        row: r + 1,
                        col: c + 1,
                        price: meta.price,
                        category: meta.label
                      })
                    }
                    title={`${seatId} — ${meta.label} (${formatPrice(meta.price)})`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
