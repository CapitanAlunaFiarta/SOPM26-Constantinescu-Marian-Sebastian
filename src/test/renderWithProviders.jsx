import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CinemaProvider } from "../context/CinemaContext";

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE}>
      <CinemaProvider>{ui}</CinemaProvider>
    </MemoryRouter>
  );
}
