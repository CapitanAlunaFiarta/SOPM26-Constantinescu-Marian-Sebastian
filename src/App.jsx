import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useCinema } from "./context/CinemaContext";
import Navbar from "./components/Navbar";
import WheelModal from "./components/WheelModal";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import ImaxPage from "./pages/ImaxPage";
import FourDxPage from "./pages/FourDxPage";
import VipLoungePage from "./pages/VipLoungePage";
import MyTicketsPage from "./pages/MyTicketsPage";
import ValidateTicketPage from "./pages/ValidateTicketPage";
import AdminPage from "./pages/AdminPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const navigate = useNavigate();
  const { fxClass } = useCinema();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        navigate("/admin");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <>
      <div className={`fx-overlay ${fxClass}`} aria-hidden="true" />
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/film/:id" element={<MovieDetailPage />} />
        <Route path="/imax" element={<ImaxPage />} />
        <Route path="/4dx" element={<FourDxPage />} />
        <Route path="/vip" element={<VipLoungePage />} />
        <Route path="/biletele-mele" element={<MyTicketsPage />} />
        <Route path="/validare" element={<ValidateTicketPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <WheelModal />
    </>
  );
}
