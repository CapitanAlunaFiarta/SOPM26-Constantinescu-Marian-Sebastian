import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";
import { MOVIES_DATA } from "../data/moviesData";
import { useSavedState } from "../hooks/useSavedState";
import {
  FALLBACK_RATES,
  buildFutureDates,
  fetchLiveTime,
  fetchBrasovWeather,
  fetchExchangeRates,
  fetchTmdbMoviesOrFallback
} from "../services/api";
import { generateOccupiedSeats, mergeSeatLists } from "../utils/tickets";

const CinemaContext = createContext(null);

const EMPTY_TICKETS = [];
const EMPTY_OCCUPIED = {};
const isArray = (value) => Array.isArray(value);
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isTheme = (value) => value === "dark" || value === "light";

export function CinemaProvider({ children }) {
  const [theme, setTheme] = useSavedState("cinema_theme", "dark", isTheme);
  const [currency, setCurrency] = useState("RON");
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES);
  const [weatherTemp, setWeatherTemp] = useState("--°C");
  const [movies, setMovies] = useState(MOVIES_DATA);

  const [initialDates] = useState(() => buildFutureDates(new Date()));
  const [availableDates, setAvailableDates] = useState(initialDates.dates);
  const [liveDateLabel, setLiveDateLabel] = useState(initialDates.todayLabel);

  const [tickets, setTickets] = useSavedState("cinema_tickets", EMPTY_TICKETS, isArray);
  const [revenue, setRevenue] = useSavedState("cinema_revenue", 0, isFiniteNumber);
  const [occupiedBySlot, setOccupiedBySlot] = useSavedState(
    "cinema_occupied_slots",
    EMPTY_OCCUPIED,
    isPlainObject
  );

  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [forceVipJackpot, setForceVipJackpot] = useState(false);
  const [fxClass, setFxClass] = useState("");
  const [isZooming, setIsZooming] = useState(false);
  const fxTimerRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("zooming-in", isZooming);
    return () => document.body.classList.remove("zooming-in");
  }, [isZooming]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchLiveTime(signal)
      .then((liveDate) => {
        const built = buildFutureDates(liveDate);
        setAvailableDates(built.dates);
        setLiveDateLabel(built.todayLabel);
      })
      .catch(() => {});

    fetchBrasovWeather(signal)
      .then((temp) => setWeatherTemp(temp))
      .catch(() => {
        if (!signal.aborted) setWeatherTemp("16°C");
      });

    fetchExchangeRates(signal)
      .then((rates) => setExchangeRates(rates))
      .catch(() => {});

    fetchTmdbMoviesOrFallback(MOVIES_DATA, signal)
      .then((loaded) => {
        if (!signal.aborted) setMovies(loaded);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => () => clearTimeout(fxTimerRef.current), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const formatPrice = useCallback(
    (ronAmount) => {
      const rate = exchangeRates[currency] ?? 1;
      const converted = ronAmount * rate;
      return `${currency === "RON" ? Math.round(converted) : converted.toFixed(2)} ${currency}`;
    },
    [currency, exchangeRates]
  );

  const getOccupiedForSlot = useCallback(
    (slotKey) => mergeSeatLists(generateOccupiedSeats(slotKey), occupiedBySlot[slotKey] || []),
    [occupiedBySlot]
  );

  const recordBooking = useCallback(
    (ticketObj, slotKey, newSeatIds) => {
      setTickets((prev) => [ticketObj, ...prev]);
      setRevenue((prev) => Number((Number(prev) + Number(ticketObj.price)).toFixed(2)));
      setOccupiedBySlot((prev) => ({
        ...prev,
        [slotKey]: mergeSeatLists(prev[slotKey] || [], newSeatIds)
      }));
    },
    [setTickets, setRevenue, setOccupiedBySlot]
  );

  const resetAllData = useCallback(() => {
    setTickets([]);
    setRevenue(0);
    setOccupiedBySlot({});
  }, [setTickets, setRevenue, setOccupiedBySlot]);

  const triggerFx = useCallback((className, durationMs = 2000) => {
    clearTimeout(fxTimerRef.current);
    setFxClass(className);
    fxTimerRef.current = setTimeout(() => setFxClass(""), durationMs);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      currency,
      setCurrency,
      exchangeRates,
      formatPrice,
      weatherTemp,
      availableDates,
      liveDateLabel,
      movies,
      tickets,
      revenue,
      getOccupiedForSlot,
      recordBooking,
      resetAllData,
      isWheelOpen,
      setIsWheelOpen,
      forceVipJackpot,
      setForceVipJackpot,
      fxClass,
      triggerFx,
      isZooming,
      setIsZooming
    }),
    [
      theme,
      toggleTheme,
      currency,
      exchangeRates,
      formatPrice,
      weatherTemp,
      availableDates,
      liveDateLabel,
      movies,
      tickets,
      revenue,
      getOccupiedForSlot,
      recordBooking,
      resetAllData,
      isWheelOpen,
      forceVipJackpot,
      fxClass,
      triggerFx,
      isZooming
    ]
  );

  return <CinemaContext.Provider value={value}>{children}</CinemaContext.Provider>;
}

export function useCinema() {
  const ctx = useContext(CinemaContext);
  if (!ctx) throw new Error("useCinema trebuie folosit în interiorul CinemaProvider");
  return ctx;
}
