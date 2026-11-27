import React from "react";

export const POSTER_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#1b1d26"/><stop offset="1" stop-color="#070709"/></linearGradient></defs>' +
      '<rect width="500" height="750" fill="url(#g)"/>' +
      '<text x="250" y="360" fill="#ff6600" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle">CINEMA NIII7</text>' +
      '<text x="250" y="410" fill="#9ba1b0" font-family="Arial, sans-serif" font-size="26" text-anchor="middle">Poster indisponibil</text>' +
      "</svg>"
  );

export default function MovieCard({ movie, onOpenMovie }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenMovie(movie.id);
    }
  }

  return (
    <article
      className="movie-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenMovie(movie.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Deschide detalii pentru ${movie.title}`}
    >
      <span className="card-format-tag">{movie.format}</span>
      <span className="card-genre-tag">{movie.genre}</span>
      <span className="card-rating-tag">★ {movie.rating}</span>
      <img
        src={movie.poster}
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallback === "1") return;
          img.dataset.fallback = "1";
          img.src = POSTER_PLACEHOLDER;
        }}
      />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="time-badges">
          {movie.times.map((time) => (
            <span key={time} className="time-badge">
              {time}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
