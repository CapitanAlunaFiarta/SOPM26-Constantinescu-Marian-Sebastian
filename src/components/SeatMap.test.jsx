import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import SeatMap from "./SeatMap";

describe("SeatMap", () => {
  it("calculează corect prețul locurilor în funcție de categorie și formatul 4DX (+10 RON)", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <SeatMap
        format="4DX"
        occupiedSeats={["R1L1"]}
        selectedSeats={[]}
        onToggleSeat={onToggle}
      />
    );

    expect(screen.getByRole("button", { name: "Loc R1L1 Standard 40 RON ocupat" })).toBeDisabled();

    const vipSeat = screen.getByRole("button", { name: /Loc R6L5/i });
    await user.click(vipSeat);

    expect(onToggle).toHaveBeenCalledWith({
      id: "R6L5",
      row: 6,
      col: 5,
      price: 70,
      category: "VIP Ultra"
    });
  });
});
