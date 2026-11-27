import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GENRES, TIME_SLOTS } from "../data/moviesData";
import { useCinema } from "../context/CinemaContext";
import MovieCard from "../components/MovieCard";

const ZOOM_DURATION_MS = 420;

export default function HomePage() {
  const navigate = useNavigate();
  const { movies, setIsZooming } = useCinema();

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const zoomTimerRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(zoomTimerRef.current);
      setIsZooming(false);
    },
    [setIsZooming]
  );

  function handleOpenMovie(movieId) {
    if (zoomTimerRef.current) return;
    setIsZooming(true);
    zoomTimerRef.current = setTimeout(() => {
      zoomTimerRef.current = null;
      setIsZooming(false);
      navigate(`/film/${movieId}`);
    }, ZOOM_DURATION_MS);
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMovies = movies.filter((movie) => {
    const matchGenre = selectedGenre === "all" || movie.genre === selectedGenre;
    const matchFormat = selectedFormat === "all" || movie.format === selectedFormat;
    const matchTime = selectedTime === "all" || movie.times.includes(selectedTime);
    const matchSearch = movie.title.toLowerCase().includes(normalizedQuery);
    return matchGenre && matchFormat && matchTime && matchSearch;
  });

  return (
    <main className="view-page">
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-tags">
            <span className="tag-imax">EXCLUSIV ÎN IMAX LASER 3D</span>
            <span className="tag-imax" style={{ background: "#ff3366", color: "#fff" }}>
              SALA 4DX EXTREME
            </span>
            <span className="tag-imax" style={{ background: "#1b1d26", color: "#ffb700" }}>
              <i className="fa-solid fa-circle-dot fa-beat" aria-hidden="true" /> SUNET 12.1 CANALE
            </span>
          </div>
          <h1 className="hero-title">DUNE: PART TWO</h1>
          <p className="hero-subtitle">
            Trăiește experiența supremă în Corpul N Brașov. Cel mai mare ecran curbat, efecte ambientale 4DX și fotolii VIP din piele complet rabatabile.
          </p>
          <div className="hero-btns">
            <button
              type="button"
              className="btn-cinema"
              onClick={() => handleOpenMovie(movies[0]?.id || 1)}
            >
              <i className="fa-solid fa-play" aria-hidden="true" /> REZERVĂ BILETE ACUM
            </button>
            <button
              type="button"
              className="btn-outline-cc"
              onClick={() => navigate("/imax")}
            >
              <i className="fa-solid fa-expand" aria-hidden="true" /> DESCOPERĂ SALA IMAX
            </button>
          </div>
        </div>
      </section>

      <div className="genre-tabs-bar" role="tablist" aria-label="Filtrare după gen">
        {GENRES.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={selectedGenre === g.id}
            className={`genre-tab ${selectedGenre === g.id ? "active" : ""}`}
            onClick={() => setSelectedGenre(g.id)}
          >
            <i className={`fa-solid ${g.icon}`} aria-hidden="true" /> {g.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-title">
          <i className="fa-solid fa-fire" aria-hidden="true" /> FILTREAZĂ EXPERIENȚA CINEMA ({filteredMovies.length})
        </div>
        <div className="filters-container">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="text"
              aria-label="Caută film"
              placeholder="Caută film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Filtrează după sală"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
          >
            <option value="all">Toate Sălile (IMAX / 4DX / VIP)</option>
            <option value="IMAX">Sala IMAX 3D Laser</option>
            <option value="4DX">Sala 4DX Extreme Motion</option>
            <option value="VIP">Sala VIP Luxury Lounge</option>
          </select>

          <select
            aria-label="Filtrează după oră"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="all">Toate Orele</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="location-section" style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "1.1rem", color: "#9ba1b0" }}>
            Nu există filme care să corespundă filtrelor selectate.
          </p>
        </div>
      ) : (
        <section className="movies-grid" aria-label="Lista de filme">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onOpenMovie={handleOpenMovie} />
          ))}
        </section>
      )}

      <section className="location-section">
        <div className="location-header">
          <div>
            <h2>
              <i className="fa-solid fa-map-location-dot" aria-hidden="true" /> LOCAȚIE CINEMA NIII7 BRAȘOV
            </h2>
            <p>Corpul N — Universitatea Transilvania (Lângă Modarom, Bulevardul Eroilor)</p>
          </div>
          <div className="external-links">
            <a
              href="https://www.google.com/maps/dir//Corpul+N+Universitatea+Transilvania+Brasov"
              target="_blank"
              rel="noreferrer"
              className="ext-btn"
            >
              <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" /> Navighează cu Google Maps
            </a>
          </div>
        </div>
        <div className="map-container">
          <iframe
            src="https://maps.google.com/maps?q=Corpul%20N%20Universitatea%20Transilvania%20Brasov&t=&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Harta Locație Cinema NIII7 Corpul N Brașov"
          />
        </div>
      </section>
    </main>
  );
}
