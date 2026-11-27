import emailjs from "@emailjs/browser";
import { signTicketFields } from "../utils/tickets";

export const API_CONFIG = {
  QR_API_URL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=",
  WEATHER_API: "https://api.open-meteo.com/v1/forecast?latitude=45.655&longitude=25.595&current_weather=true",
  CURRENCY_API: "https://open.er-api.com/v6/latest/RON",
  TIME_API: "https://worldtimeapi.org/api/timezone/Europe/Bucharest",
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || "",
  EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID",
  EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY",
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL || "",
  REQUEST_TIMEOUT_MS: 6000,
  EMAIL_TIMEOUT_MS: 8000,
  SIMULATE_STRIPE_DELAY: 1200
};

export const FALLBACK_RATES = { RON: 1, EUR: 0.2, USD: 0.22 };

const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

const DAYS_RO = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

export function buildFutureDates(refDate = new Date()) {
  const base = refDate instanceof Date && !Number.isNaN(refDate.getTime()) ? refDate : new Date();
  const dates = [];
  for (let i = 1; i <= 4; i++) {
    const future = new Date(base);
    future.setDate(base.getDate() + i);
    dates.push(
      `${DAYS_RO[future.getDay()]}, ${future.getDate()} ${MONTHS_RO[future.getMonth()]} ${future.getFullYear()}`
    );
  }
  const todayLabel = `Azi: ${base.getDate()} ${MONTHS_RO[base.getMonth()]} ${base.getFullYear()}`;
  return { dates, todayLabel };
}

function withTimeout(parentSignal, timeoutMs = API_CONFIG.REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();

  if (parentSignal) {
    if (parentSignal.aborted) controller.abort();
    else parentSignal.addEventListener("abort", forwardAbort);
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      if (parentSignal) parentSignal.removeEventListener("abort", forwardAbort);
    }
  };
}

export async function fetchJson(url, signal, timeoutMs) {
  const guard = withTimeout(signal, timeoutMs);
  try {
    const res = await fetch(url, { signal: guard.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    guard.cleanup();
  }
}

export async function fetchLiveTime(signal) {
  const data = await fetchJson(API_CONFIG.TIME_API, signal);
  const parsed = data?.datetime ? new Date(data.datetime) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) throw new Error("Time API invalid");
  return parsed;
}

export async function fetchBrasovWeather(signal) {
  const data = await fetchJson(API_CONFIG.WEATHER_API, signal);
  const temp = data?.current_weather?.temperature;
  if (typeof temp !== "number" || Number.isNaN(temp)) throw new Error("Weather API invalid");
  return `${Math.round(temp)}°C`;
}

export async function fetchExchangeRates(signal) {
  const data = await fetchJson(API_CONFIG.CURRENCY_API, signal);
  const eur = data?.rates?.EUR;
  const usd = data?.rates?.USD;
  if (typeof eur === "number" && eur > 0 && typeof usd === "number" && usd > 0) {
    return { RON: 1, EUR: eur, USD: usd };
  }
  throw new Error("Currency API invalid");
}

export async function fetchWikipediaSummary(wikiSlug, signal) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`;
  const data = await fetchJson(url, signal);
  return data.extract || "Nu există rezumat disponibil.";
}

export async function fetchTmdbMoviesOrFallback(fallbackMovies, signal) {
  if (!API_CONFIG.TMDB_API_KEY) {
    return fallbackMovies;
  }
  try {
    const data = await fetchJson(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${encodeURIComponent(API_CONFIG.TMDB_API_KEY)}&language=ro-RO&page=1`,
      signal
    );
    if (!Array.isArray(data.results) || data.results.length === 0) return fallbackMovies;

    const formats = ["IMAX", "4DX", "VIP"];
    const genres = ["Sci-Fi", "Acțiune", "Thriller", "Biografic", "Animație"];
    return data.results.slice(0, 8).map((item, idx) => ({
      id: item.id,
      title: item.title,
      genre: genres[idx % genres.length],
      wiki: item.original_title?.replace(/\s+/g, "_") || item.title.replace(/\s+/g, "_"),
      imdb: `https://www.imdb.com/find/?q=${encodeURIComponent(item.title)}`,
      format: formats[idx % formats.length],
      rating: (item.vote_average || 8.5).toFixed(1),
      desc: item.overview || "Proiecție specială la Cinema NIII7 Brașov.",
      trailer: fallbackMovies[idx % fallbackMovies.length].trailer,
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : fallbackMovies[idx % fallbackMovies.length].poster,
      times: fallbackMovies[idx % fallbackMovies.length].times
    }));
  } catch {
    return fallbackMovies;
  }
}

export async function sendTicketEmail(payload) {
  if (
    !API_CONFIG.EMAILJS_PUBLIC_KEY ||
    API_CONFIG.EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY"
  ) {
    return { simulated: true };
  }
  try {
    emailjs.init(API_CONFIG.EMAILJS_PUBLIC_KEY);
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("EmailJS timeout")), API_CONFIG.EMAIL_TIMEOUT_MS);
    });
    try {
      await Promise.race([
        emailjs.send(API_CONFIG.EMAILJS_SERVICE_ID, API_CONFIG.EMAILJS_TEMPLATE_ID, payload),
        timeout
      ]);
    } finally {
      clearTimeout(timer);
    }
    return { simulated: false, sent: true };
  } catch (err) {
    console.warn("EmailJS fallback:", err);
    return { simulated: true };
  }
}

export function buildQrValidationUrl({ ticketId, movieTitle, date, time, seats, format }) {
  const origin = (API_CONFIG.PUBLIC_URL || window.location.origin).replace(/\/+$/, "");
  const fields = {
    id: ticketId,
    film: movieTitle,
    data: date,
    ora: time,
    locuri: seats,
    format
  };
  const params = new URLSearchParams({ ...fields, sig: signTicketFields(fields) });
  const validateUrl = `${origin}/validare?${params.toString()}`;
  return {
    validateUrl,
    qrUrl: `${API_CONFIG.QR_API_URL}${encodeURIComponent(validateUrl)}`
  };
}
