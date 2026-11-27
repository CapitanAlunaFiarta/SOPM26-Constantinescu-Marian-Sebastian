import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  parseRomanianDateTime,
  createGoogleCalendarUrl,
  downloadICSFile,
  safeFileName
} from "../utils/calendarUtils";
import { scheduleShowReminder } from "../utils/reminders";
import { useModalA11y } from "../hooks/useModalA11y";

const CALENDAR_LOCATION =
  "Cinema NIII7, Corpul N, Universitatea Transilvania, Bulevardul Eroilor, Brașov";

export default function TicketSuccessModal({ ticket, onClose }) {
  const ticketRef = useRef(null);
  const [reminderSet, setReminderSet] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const dialogRef = useModalA11y(Boolean(ticket), onClose);

  if (!ticket) return null;

  const calendarTitle = `${ticket.movieTitle} (${ticket.format})`;
  const calendarDesc = `Bilet Cinema NIII7 Brașov\nBilet: ${ticket.id}\nLocuri: ${ticket.seats}\nFormat: ${ticket.format}\nVizionare plăcută!`;

  async function handleDownloadPng() {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    setStatusMessage("");
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#0b0c10",
        scale: 2,
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = `Bilet_NIII7_${safeFileName(ticket.movieTitle)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setStatusMessage("Nu am putut genera imaginea biletului. Încearcă din nou sau fă o captură de ecran.");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleGoogleCalendar() {
    const { startDate, endDate } = parseRomanianDateTime(ticket.date, ticket.time);
    const url = createGoogleCalendarUrl(
      calendarTitle,
      calendarDesc,
      CALENDAR_LOCATION,
      startDate,
      endDate
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleAppleCalendar() {
    const { startDate, endDate } = parseRomanianDateTime(ticket.date, ticket.time);
    downloadICSFile(calendarTitle, calendarDesc, CALENDAR_LOCATION, startDate, endDate, {
      uid: `${ticket.id}@cinema-niii7.local`
    });
  }

  async function handleEnableReminder() {
    if (typeof Notification === "undefined") {
      setStatusMessage("Browserul tău nu suportă notificări. Folosește butoanele de calendar.");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      setStatusMessage("Pentru a primi remindere, permite notificările din browser.");
      return;
    }

    const { startDate } = parseRomanianDateTime(ticket.date, ticket.time);
    const result = scheduleShowReminder(ticket.id, startDate, () => {
      new Notification("🎬 Cinema NIII7 Reminder", {
        body: `Filmul "${ticket.movieTitle}" începe la ora ${ticket.time} (${ticket.date}). Pregătește-te de plecare spre Corpul N!`
      });
    });

    if (result.status === "scheduled" || result.status === "sent-now" || result.status === "already") {
      setReminderSet(true);
      setStatusMessage(
        result.status === "sent-now"
          ? "Filmul începe în mai puțin de o oră — notificarea a fost trimisă acum."
          : "Vei primi o notificare cu o oră înainte, cât timp această pagină rămâne deschisă. Pentru siguranță adaugă și evenimentul în calendar."
      );
    } else if (result.status === "past") {
      setStatusMessage("Proiecția a început deja, nu mai poate fi setat un reminder.");
    } else {
      setStatusMessage("Proiecția este prea departe în timp pentru un reminder din browser. Folosește calendarul.");
    }
  }

  return (
    <div className="modal modal-open">
      <div
        className="modal-content"
        style={{ maxWidth: "520px" }}
        role="dialog"
        aria-modal="true"
        aria-label="Bilet emis cu succes"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header-cc">
          <h2 style={{ color: "#2ecc71" }}>
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> BILET EMIS CU SUCCES!
          </h2>
          <p>Scanează codul QR sau adaugă evenimentul în calendar/reminder</p>
        </div>

        <div ref={ticketRef} id="ticket-to-download" className="vip-ticket-pass">
          <div className="ticket-top">
            <span className="ticket-brand">
              CINEMA <b>NIII7</b> BRAȘOV
            </span>
            <span className="ticket-type">{ticket.format} PASS</span>
          </div>
          <div className="ticket-body">
            <h3>{ticket.movieTitle}</h3>
            <p className="ticket-meta">
              {ticket.date} | Ora {ticket.time}
            </p>
            <div className="ticket-seats-box">
              <span>
                LOCURI ({ticket.format}): {ticket.seats}
              </span>
            </div>
            <p className="ticket-snacks" style={{ marginTop: "8px", color: "#9ba1b0" }}>
              {ticket.snacksText}
            </p>
            <p className="ticket-code" data-testid="ticket-code">
              Cod bilet: {ticket.id}
            </p>
          </div>
          <div className="ticket-divider" />
          <div className="ticket-bottom">
            <div className="qr-container">
              <img
                id="qr-code-img"
                src={ticket.qrUrl}
                alt={`Cod QR pentru ${ticket.movieTitle}`}
                crossOrigin="anonymous"
              />
            </div>
            <span className="scan-hint">CORPUL N — ACCES PE BAZĂ DE SCANARE QR</span>
          </div>
        </div>

        <div className="calendar-buttons">
          <button
            type="button"
            className="calendar-btn google-cal-btn"
            onClick={handleGoogleCalendar}
          >
            <i className="fa-brands fa-google" aria-hidden="true" /> Google Calendar
          </button>
          <button
            type="button"
            className="calendar-btn apple-cal-btn"
            onClick={handleAppleCalendar}
          >
            <i className="fa-solid fa-calendar-plus" aria-hidden="true" /> Apple / iCal
          </button>
        </div>

        <div className="notification-box" style={{ marginTop: "10px", width: "100%" }}>
          <button
            type="button"
            className="calendar-btn reminder-btn"
            disabled={reminderSet}
            style={{ width: "100%" }}
            onClick={handleEnableReminder}
          >
            <i
              className={reminderSet ? "fa-solid fa-check" : "fa-regular fa-bell"}
              aria-hidden="true"
            />{" "}
            {reminderSet ? "Reminder Setat (Activ)" : "Setează Reminder Push (1h înainte)"}
          </button>
        </div>

        <p role="status" className="status-note">
          {statusMessage}
        </p>

        <div className="modal-buttons" style={{ flexDirection: "column", gap: "12px", marginTop: "15px" }}>
          <button
            type="button"
            className="btn-cinema"
            disabled={isDownloading}
            onClick={handleDownloadPng}
          >
            <i className="fa-solid fa-download" aria-hidden="true" />{" "}
            {isDownloading ? "SE GENEREAZĂ IMAGINEA..." : "DESCARCĂ BILETUL CA POZĂ (.PNG)"}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
