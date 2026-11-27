import React from "react";
import { SNACKS_PRICES } from "../data/moviesData";
import { useModalA11y } from "../hooks/useModalA11y";

const SNACK_ITEMS = [
  { key: "popcorn", emoji: "🍿", title: "Meniu Popcorn Mare", label: "Cantitate Popcorn" },
  { key: "nachos", emoji: "🌮", title: "Nachos Jalapeño & Cheese", label: "Cantitate Nachos" },
  { key: "soda", emoji: "🥤", title: "Băutură Răcoritoare 0.5L", label: "Cantitate Băutură" }
];

const MAX_QTY = 20;

export default function SnacksModal({
  isOpen,
  snacks,
  onChangeSnacks,
  onBack,
  onProceed
}) {
  const dialogRef = useModalA11y(isOpen, onBack);

  if (!isOpen) return null;

  const snacksTotal =
    snacks.popcorn * SNACKS_PRICES.popcorn +
    snacks.nachos * SNACKS_PRICES.nachos +
    snacks.soda * SNACKS_PRICES.soda;

  function updateQty(key, val) {
    const qty = Math.min(MAX_QTY, Math.max(0, parseInt(val, 10) || 0));
    onChangeSnacks((prev) => ({ ...prev, [key]: qty }));
  }

  return (
    <div className="modal modal-open">
      <div
        className="modal-content"
        style={{ maxWidth: "620px" }}
        role="dialog"
        aria-modal="true"
        aria-label="Cinema Bar și Snacks"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header-cc">
          <h2>
            <i className="fa-solid fa-bowl-food" aria-hidden="true" /> CINEMA BAR & SNACKS
          </h2>
          <p>Adaugă gustări proaspete la rezervarea ta</p>
        </div>

        <div className="snacks-grid">
          {SNACK_ITEMS.map((item) => (
            <div className="snack-item" key={item.key}>
              <div className="snack-details">
                <span className="snack-emoji" aria-hidden="true">{item.emoji}</span>
                <div>
                  <h4>{item.title}</h4>
                  <small>{SNACKS_PRICES[item.key]} RON</small>
                </div>
              </div>
              <div className="snack-price-ctrl">
                <input
                  aria-label={item.label}
                  type="number"
                  min="0"
                  max={MAX_QTY}
                  value={snacks[item.key]}
                  onChange={(e) => updateQty(item.key, e.target.value)}
                  className="snack-input"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="snacks-summary">
          Total Snacks: <strong>{snacksTotal} RON</strong>
        </div>

        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Înapoi la Sală
          </button>
          <button type="button" className="btn-cinema" onClick={onProceed}>
            MERGI LA PLATĂ <i className="fa-solid fa-credit-card" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
