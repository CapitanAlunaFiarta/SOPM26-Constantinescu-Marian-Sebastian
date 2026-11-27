export function isCardExpiryValid(exp, referenceDate = new Date()) {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const [mStr, yStr] = exp.split("/");
  const month = parseInt(mStr, 10);
  const year = 2000 + parseInt(yStr, 10);
  if (month < 1 || month > 12) return false;
  const curYear = referenceDate.getFullYear();
  const curMonth = referenceDate.getMonth() + 1;
  if (year < curYear) return false;
  if (year === curYear && month < curMonth) return false;
  return true;
}

export function validatePaymentForm({ email, cardName, cardNumber, cardExpiry, cardCvv }) {
  const errors = {};
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Introdu o adresă de email validă.";
  }
  if (!cardName.trim()) {
    errors.cardName = "Numele titularului de card este obligatoriu.";
  }
  if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = "Numărul cardului trebuie să conțină exact 16 cifre.";
  }
  if (!isCardExpiryValid(cardExpiry)) {
    errors.cardExpiry = "Data expirării (LL/AA) este invalidă sau în trecut.";
  }
  if (!/^\d{3}$/.test(cardCvv)) {
    errors.cardCvv = "Codul CVV trebuie să aibă exact 3 cifre.";
  }
  return errors;
}

export function getSeatMeta(rowIndex, format = "IMAX") {
  const surcharge = format === "4DX" ? 10 : format === "VIP" ? 15 : 0;
  if (rowIndex < 2) {
    return { type: "standard", label: "Standard", price: 30 + surcharge };
  }
  if (rowIndex < 5) {
    return { type: "premium", label: "Premium", price: 45 + surcharge };
  }
  return { type: "vip", label: "VIP Ultra", price: 60 + surcharge };
}
