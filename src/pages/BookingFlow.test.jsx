import React from "react";
import { screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import MovieDetailPage from "./MovieDetailPage";
import MyTicketsPage from "./MyTicketsPage";
import AdminPage from "./AdminPage";
import Navbar from "../components/Navbar";
import { renderWithProviders } from "../test/renderWithProviders";
import { generateOccupiedSeats } from "../utils/tickets";
import { verifyTicketParams } from "../utils/tickets";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/film/:id" element={<MovieDetailPage />} />
        <Route path="/biletele-mele" element={<MyTicketsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

async function payFor(user) {
  await user.click(screen.getByRole("button", { name: /CONTINUĂ SPRE SNACKS/i }));
  await user.click(screen.getByRole("button", { name: /MERGI LA PLATĂ/i }));
  const dialog = screen.getByRole("dialog", { name: /Finalizare Plată/i });
  await user.type(within(dialog).getByLabelText(/Adresa de Email/i), "sebi@unitbv.ro");
  await user.type(within(dialog).getByLabelText(/Numele de pe card/i), "Sebi Constantinescu");
  await user.type(within(dialog).getByLabelText(/Număr Card/i), "4521123456789010");
  await user.type(within(dialog).getByLabelText(/Expirare/i), "12/39");
  await user.type(within(dialog).getByLabelText(/CVV/i), "123");
  await user.click(within(dialog).getByRole("button", { name: /CONFIRMĂ PLATA/i }));
}

describe("fluxul de rezervare", () => {
  it("locurile ocupate diferă de la o proiecție la alta", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/film/1" });

    const occupiedNow = () =>
      screen.getAllByRole("button", { name: /ocupat$/ }).map((b) => b.getAttribute("aria-label").split(" ")[1]);

    const first = occupiedNow();
    await user.selectOptions(screen.getByLabelText(/ORA PROIECȚIEI/i), "16:30");
    const second = occupiedNow();

    expect(first.length).toBeGreaterThanOrEqual(10);
    expect(second.length).toBeGreaterThanOrEqual(10);
    expect(second).not.toEqual(first);
  });

  it("emite un bilet cu cod unic, QR semnat, salvează locurile și actualizează încasările", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/film/1" });

    await user.click(screen.getByRole("button", { name: /AI Sweet-Spot/i }));
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(2);
    await payFor(user);

    const success = await screen.findByRole("dialog", { name: /Bilet emis cu succes/i }, { timeout: 4000 });
    const code = within(success).getByTestId("ticket-code").textContent.replace("Cod bilet: ", "");
    expect(code).toMatch(/^NIII7-/);

    const qr = within(success).getByAltText(/Cod QR/i).getAttribute("src");
    const qrTarget = new URL(decodeURIComponent(qr.split("data=")[1]));
    expect(qrTarget.pathname).toBe("/validare");
    expect(verifyTicketParams(qrTarget.searchParams).valid).toBe(true);
    expect(qrTarget.searchParams.get("id")).toBe(code);

    const stored = JSON.parse(localStorage.getItem("cinema_tickets"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(code);
    expect(JSON.parse(localStorage.getItem("cinema_revenue"))).toBe(stored[0].price);

    await user.click(within(success).getByRole("button", { name: "Închide" }));
    expect(screen.getByRole("button", { name: "Loc R4L6 Premium 45 RON ocupat" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Loc R4L7 Premium 45 RON ocupat" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Biletele Mele \(1\)/ })).toBeInTheDocument();
  });

  it("limitează o comandă la 8 locuri", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/film/1" });

    const slotOccupied = generateOccupiedSeats(
      `1_IMAX_${screen.getByLabelText(/DATA VIITOARE/i).value}_14:00`
    );
    const free = screen
      .getAllByRole("button", { name: /disponibil$/ })
      .filter((b) => !slotOccupied.includes(b.getAttribute("aria-label").split(" ")[1]))
      .slice(0, 9);

    for (const seat of free) await user.click(seat);

    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(8);
    expect(screen.getByText(/cel mult 8 locuri/i)).toBeInTheDocument();
  });

  it("afișează mesaj de rezervă dacă trailerul nu se poate reda", async () => {
    renderWithProviders(<App />, { route: "/film/1" });
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    act(() => {
      video.dispatchEvent(new Event("error"));
    });
    expect(await screen.findByText(/nu este disponibil momentan/i)).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });

  it("arată pagină de eroare pentru un film inexistent", () => {
    renderWithProviders(<App />, { route: "/film/9999" });
    expect(screen.getByRole("heading", { name: /Film negăsit/i })).toBeInTheDocument();
  });

  it("panoul de admin poate reseta comenzile după confirmare", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "cinema_tickets",
      JSON.stringify([
        { id: "NIII7-A-1", movie: "Dune [IMAX]", date: "Luni, 1 Decembrie 2026", time: "19:00", seats: "R1L1", price: 45, email: "a@b.ro" }
      ])
    );
    localStorage.setItem("cinema_revenue", "45");
    renderWithProviders(<App />, { route: "/admin" });

    expect(screen.getByText(/45.00 RON/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Resetează datele/i }));
    await user.click(screen.getByRole("button", { name: /Da, șterge tot/i }));

    expect(screen.getByText(/Nicio comandă înregistrată/i)).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem("cinema_tickets"))).toEqual([]));
    expect(JSON.parse(localStorage.getItem("cinema_revenue"))).toBe(0);
  });

  it("ignoră datele corupte din localStorage fără să crape aplicația", () => {
    localStorage.setItem("cinema_tickets", JSON.stringify({ nu: "o listă" }));
    localStorage.setItem("cinema_revenue", JSON.stringify("abc"));
    renderWithProviders(<App />, { route: "/biletele-mele" });
    expect(screen.getByText(/Nu ai niciun bilet activ/i)).toBeInTheDocument();
  });
});
