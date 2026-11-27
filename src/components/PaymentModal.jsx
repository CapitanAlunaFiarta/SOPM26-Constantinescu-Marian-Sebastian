import React, { useState, useEffect, useRef, useCallback } from "react";
import { validatePaymentForm } from "../utils/validation";
import { useModalA11y } from "../hooks/useModalA11y";

const PERCENT_CODES = ["STUDENT20", "CORPULN", "VIP15", "NIII7PRO"];
const PERCENT_DISCOUNT = 0.2;
const FREE_VIP_CAP = 150;

export function computeDiscount(promo, ticketsTotal, snacksTotal) {
  if (!promo) return 0;
  if (promo === "FREEVIP2") return Math.min(ticketsTotal, FREE_VIP_CAP);
  if (PERCENT_CODES.includes(promo)) {
    return Number(((ticketsTotal + snacksTotal) * PERCENT_DISCOUNT).toFixed(2));
  }
  return 0;
}

export default function PaymentModal({
  isOpen,
  ticketsTotal,
  snacksTotal,
  onClose,
  onConfirmPayment,
  processingDelayMs = 1200
}) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoFeedback, setPromoFeedback] = useState(null);

  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) return;
    setPromoCode("");
    setAppliedPromo(null);
    setPromoFeedback(null);
    setEmail("");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setErrors({});
    setIsProcessing(false);
    submittingRef.current = false;
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (submittingRef.current) return;
    onClose?.();
  }, [onClose]);

  const dialogRef = useModalA11y(isOpen, handleClose);

  if (!isOpen) return null;

  const rawTotal = ticketsTotal + snacksTotal;
  const discountAmount = computeDiscount(appliedPromo, ticketsTotal, snacksTotal);
  const finalTotal = Math.max(0, Number((rawTotal - discountAmount).toFixed(2)));

  function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (appliedPromo) {
      setPromoFeedback({ ok: false, text: "Ai aplicat deja un cod la această comandă!" });
      return;
    }
    if (code === "FREEVIP2") {
      const vipFreeValue = computeDiscount(code, ticketsTotal, snacksTotal);
      setAppliedPromo(code);
      setPromoFeedback({
        ok: true,
        text: `👑 JACKPOT ACTIVAT: 2 Bilete Full VIP GRATUITE (-${vipFreeValue} RON)!`
      });
    } else if (PERCENT_CODES.includes(code)) {
      const discount = computeDiscount(code, ticketsTotal, snacksTotal);
      setAppliedPromo(code);
      setPromoFeedback({
        ok: true,
        text: `Cod promoțional activat! Reducere aplicată: -${discount.toFixed(2)} RON.`
      });
    } else {
      setPromoFeedback({ ok: false, text: "Cod promoțional invalid!" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validatePaymentForm({
      email,
      cardName,
      cardNumber,
      cardExpiry,
      cardCvv
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setIsProcessing(true);
    try {
      if (processingDelayMs > 0) {
        await new Promise((r) => setTimeout(r, processingDelayMs));
      }
      await onConfirmPayment({
        email: email.trim(),
        cardName: cardName.trim(),
        finalTotal
      });
    } catch (err) {
      if (mountedRef.current) {
        setErrors({ submit: err?.message || "Plata nu a putut fi finalizată. Încearcă din nou." });
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setIsProcessing(false);
    }
  }

  function clearError(field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const firstError = Object.values(errors).find(Boolean);

  return (
    <div className="modal modal-open">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label="Finalizare Plată"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header-cc">
          <h2>
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> FINALIZARE PLATĂ
          </h2>
        </div>

        <div className="order-summary-box">
          <div className="summary-line">
            <span>Bilete:</span>
            <strong>{ticketsTotal} RON</strong>
          </div>
          <div className="summary-line">
            <span>Bar & Snacks:</span>
            <strong>{snacksTotal} RON</strong>
          </div>

          <div className="promo-box">
            <input
              type="text"
              aria-label="Cod promoțional"
              placeholder="Cod (STUDENT20 / CORPULN / FREEVIP2)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="button" className="btn-promo" onClick={handleApplyPromo}>
              APLICĂ
            </button>
          </div>

          {promoFeedback && (
            <p className={`promo-feedback ${promoFeedback.ok ? "ok" : "err"}`}>
              {promoFeedback.text}
            </p>
          )}

          <div className="summary-total">
            <span>TOTAL DE PLATĂ:</span>
            <strong className="highlight-text" data-testid="payment-final-total">
              {finalTotal} RON
            </strong>
          </div>
        </div>

        {firstError && (
          <div role="alert" className="form-error-msg">
            {firstError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="input-group">
            <label htmlFor="email-input">Adresa de Email</label>
            <input
              id="email-input"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              className={errors.email ? "input-error" : ""}
              placeholder="nume@student.unitbv.ro"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="card-name">Numele de pe card</label>
            <input
              id="card-name"
              type="text"
              autoComplete="cc-name"
              aria-invalid={Boolean(errors.cardName)}
              className={errors.cardName ? "input-error" : ""}
              placeholder="Ex: POPESCU ION"
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                clearError("cardName");
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="card-number">Număr Card (16 cifre)</label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              aria-invalid={Boolean(errors.cardNumber)}
              className={errors.cardNumber ? "input-error" : ""}
              placeholder="0000000000000000"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16));
                clearError("cardNumber");
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="card-expiry">Expirare (LL/AA)</label>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                aria-invalid={Boolean(errors.cardExpiry)}
                className={errors.cardExpiry ? "input-error" : ""}
                placeholder="12/28"
                value={cardExpiry}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                  const val = digits.length > 2
                    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                    : digits;
                  setCardExpiry(val);
                  clearError("cardExpiry");
                }}
              />
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="card-cvv">CVV</label>
              <input
                id="card-cvv"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                aria-invalid={Boolean(errors.cardCvv)}
                className={errors.cardCvv ? "input-error" : ""}
                placeholder="123"
                value={cardCvv}
                onChange={(e) => {
                  setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
                  clearError("cardCvv");
                }}
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              disabled={isProcessing}
              onClick={handleClose}
            >
              Anulează
            </button>
            <button type="submit" className="btn-cinema" disabled={isProcessing}>
              {isProcessing ? "SE PROCESEAZĂ..." : "CONFIRMĂ PLATA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
