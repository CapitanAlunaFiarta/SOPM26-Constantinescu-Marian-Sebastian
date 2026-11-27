import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCinema } from "../context/CinemaContext";

const PILL_LINKS = [
  { to: "/imax", label: "IMAX", extraClass: "imax-pill" },
  { to: "/4dx", label: "4DX", extraClass: "dx-pill" },
  { to: "/vip", label: "VIP LOUNGE", extraClass: "vip-pill" }
];

export default function Navbar() {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    weatherTemp,
    liveDateLabel,
    tickets,
    setIsWheelOpen
  } = useCinema();

  function handleLogoKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/");
    }
  }

  return (
    <nav className="navbar" aria-label="Navigare principală">
      <div className="nav-container">
        <div
          className="logo"
          role="link"
          tabIndex={0}
          aria-label="Cinema NIII7 — pagina principală"
          onClick={() => navigate("/")}
          onKeyDown={handleLogoKeyDown}
        >
          <i className="fa-solid fa-film" aria-hidden="true" /> CINEMA <span>NIII7</span>
        </div>

        <div className="nav-badges">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `format-pill nav-link-clean ${isActive ? "active-pill" : ""}`
            }
          >
            <i className="fa-solid fa-clapperboard" aria-hidden="true" /> PROGRAM
          </NavLink>
          {PILL_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `format-pill ${link.extraClass} nav-link-clean ${isActive ? "active-pill" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="format-pill wheel-pill"
            onClick={() => setIsWheelOpen(true)}
          >
            <i className="fa-solid fa-dharmachakra fa-spin" aria-hidden="true" /> ROATA NOROCULUI (3% VIP)
          </button>
        </div>

        <div className="nav-actions">
          <div className="weather-widget" title="Dată sincronizată prin Time API">
            <i className="fa-regular fa-calendar-check" aria-hidden="true" />{" "}
            <span>{liveDateLabel}</span>
          </div>

          <div className="weather-widget" title="Meteo Live Corpul N Brașov (Open-Meteo API)">
            <i className="fa-solid fa-cloud-sun" aria-hidden="true" />{" "}
            <span>{weatherTemp}</span> Brașov
          </div>

          <select
            aria-label="Schimbă moneda"
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            title="Conversie Live ExchangeRate-API"
          >
            <option value="RON">RON</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>

          <button
            type="button"
            className="weather-widget theme-toggle"
            aria-label={theme === "light" ? "Comută pe modul întuneric" : "Comută pe modul luminos"}
            onClick={toggleTheme}
            title="Schimbă între Modul Întuneric și Luminos"
          >
            <i
              className={`fa-solid ${theme === "light" ? "fa-sun" : "fa-moon"}`}
              aria-hidden="true"
            />{" "}
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>

          <button
            type="button"
            className="nav-ticket-btn"
            onClick={() => navigate("/biletele-mele")}
          >
            <i className="fa-solid fa-ticket" aria-hidden="true" /> Biletele Mele ({tickets.length})
          </button>
        </div>
      </div>
    </nav>
  );
}
