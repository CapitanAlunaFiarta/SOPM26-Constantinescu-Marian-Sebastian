import React from "react";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import WheelModal from "./WheelModal";
import Navbar from "./Navbar";
import { renderWithProviders } from "../test/renderWithProviders";

function setup() {
  return renderWithProviders(
    <>
      <Navbar />
      <input aria-label="câmp text" />
      <WheelModal />
    </>
  );
}

describe("WheelModal", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("nu se deschide când apeși G în timp ce scrii într-un câmp de text", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText("câmp text"), "gigi");
    expect(screen.queryByRole("dialog", { name: /Roata Norocului/i })).not.toBeInTheDocument();
  });

  it("se deschide cu tasta G și dă JACKPOT când apeși G a doua oară", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup();

    await user.keyboard("g");
    expect(screen.getByRole("dialog", { name: /Roata Norocului/i })).toBeInTheDocument();

    await user.keyboard("g");
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(screen.getByRole("status")).toHaveTextContent(/FREEVIP2/);
  });

  it("anulează jackpotul armat cu G dacă ruleta este închisă fără învârtire", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup();

    await user.keyboard("g");
    await user.click(screen.getByRole("button", { name: "Închide" }));
    expect(screen.queryByRole("dialog", { name: /Roata Norocului/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ROATA NOROCULUI/i }));
    await user.click(screen.getByRole("button", { name: /ÎNVÂRTE ROATA/i }));
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(screen.getByRole("status")).not.toHaveTextContent(/FREEVIP2/);
    expect(screen.getByRole("status")).toHaveTextContent(/20% REDUCERE/);
  });

  it("se închide cu Escape", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /ROATA NOROCULUI/i }));
    expect(screen.getByRole("dialog", { name: /Roata Norocului/i })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /Roata Norocului/i })).not.toBeInTheDocument();
  });
});
