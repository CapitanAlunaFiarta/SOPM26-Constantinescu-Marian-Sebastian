import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CinemaProvider } from "./context/CinemaContext";
import App from "./App.jsx";
import "./styles/cinema.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CinemaProvider>
        <App />
      </CinemaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
