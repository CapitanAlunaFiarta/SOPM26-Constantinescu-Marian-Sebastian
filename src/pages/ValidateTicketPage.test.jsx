import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ValidateTicketPage from "./ValidateTicketPage";
import { buildQrValidationUrl } from "../services/api";

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderAt(url) {
  return render(
    <MemoryRouter initialEntries={[url]} future={ROUTER_FUTURE}>
      <Routes>
        <Route path="/validare" element={<ValidateTicketPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function signedPath(overrides = {}) {
  const { validateUrl } = buildQrValidationUrl({
    ticketId: "NIII7-TEST-ABCDE",
    movieTitle: "Dune: Part Two",
    date: "Sâmbătă, 28 Noiembrie 2026",
    time: "19:00",
    seats: "R4L6, R4L7",
    format: "IMAX",
    ...overrides
  });
  const url = new URL(validateUrl);
  return `${url.pathname}${url.search}`;
}

describe("ValidateTicketPage", () => {
  it("afișează BILET VALID pentru un cod QR semnat corect", () => {
    renderAt(signedPath());

    expect(screen.getByRole("heading", { name: /BILET VALID/i })).toBeInTheDocument();
    expect(screen.getByText("Dune: Part Two")).toBeInTheDocument();
    expect(screen.getByText("NIII7-TEST-ABCDE")).toBeInTheDocument();
    expect(screen.getByText(/LOCURI: R4L6, R4L7/i)).toBeInTheDocument();
  });

  it("respinge un cod în care locurile au fost modificate", () => {
    const tampered = signedPath().replace(/locuri=[^&]*/, "locuri=R1L1%2C+R1L2%2C+R1L3");
    renderAt(tampered);

    expect(screen.getByRole("heading", { name: /BILET INVALID/i })).toBeInTheDocument();
    expect(screen.getByText(/modificat sau este fals/i)).toBeInTheDocument();
  });

  it("respinge un cod fără semnătură", () => {
    renderAt("/validare?id=X1&film=Dune&data=15%20Noiembrie&ora=19:00&locuri=R4L6&format=IMAX");

    expect(screen.getByRole("heading", { name: /BILET INVALID/i })).toBeInTheDocument();
    expect(screen.getByText(/nu are semnătura/i)).toBeInTheDocument();
  });

  it("afișează BILET INVALID când lipsesc parametrii", () => {
    renderAt("/validare");

    expect(screen.getByRole("heading", { name: /BILET INVALID/i })).toBeInTheDocument();
  });

  it("nu interpretează HTML din parametri ca markup", () => {
    const payload = "<img src=x onerror=alert(1)>";
    const path = signedPath({ movieTitle: payload });
    const { container } = renderAt(path);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(payload)).toBeInTheDocument();
  });
});

describe("adresa din QR", () => {
  it("înlocuiește localhost cu IP-ul din rețea ca telefonul să poată deschide link-ul", async () => {
    const { resolveQrOrigin } = await import("../services/api");
    const local = { protocol: "http:", hostname: "localhost", port: "5173", origin: "http://localhost:5173" };

    expect(resolveQrOrigin({ location: local, lanIp: "192.168.1.20" })).toBe("http://192.168.1.20:5173");
    expect(resolveQrOrigin({ location: local, lanIp: "" })).toBe("http://localhost:5173");
    expect(resolveQrOrigin({ location: local, lanIp: "192.168.1.20", publicUrl: "https://cinema.example.ro/" })).toBe(
      "https://cinema.example.ro"
    );
    const remote = { protocol: "http:", hostname: "192.168.1.20", port: "5173", origin: "http://192.168.1.20:5173" };
    expect(resolveQrOrigin({ location: remote, lanIp: "10.0.0.5" })).toBe("http://192.168.1.20:5173");
  });
});
