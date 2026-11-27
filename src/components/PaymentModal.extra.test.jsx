import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PaymentModal, { computeDiscount } from "./PaymentModal";

async function fillValidCard(user) {
  await user.type(screen.getByLabelText(/Adresa de Email/i), "sebi@unitbv.ro");
  await user.type(screen.getByLabelText(/Numele de pe card/i), "Sebi Constantinescu");
  await user.type(screen.getByLabelText(/Număr Card/i), "4521123456789010");
  await user.type(screen.getByLabelText(/Expirare/i), "12/39");
  await user.type(screen.getByLabelText(/CVV/i), "123");
}

describe("computeDiscount", () => {
  it("aplică 20% pe total și plafonează FREEVIP2 la 150 RON", () => {
    expect(computeDiscount("STUDENT20", 100, 50)).toBe(30);
    expect(computeDiscount("FREEVIP2", 400, 0)).toBe(150);
    expect(computeDiscount("FREEVIP2", 90, 0)).toBe(90);
    expect(computeDiscount(null, 100, 0)).toBe(0);
  });
});

describe("PaymentModal - comportament avansat", () => {
  it("nu permite trimiterea dublă și ține butonul blocat până se termină confirmarea", async () => {
    const user = userEvent.setup();
    let resolveConfirm;
    const onConfirm = vi.fn(() => new Promise((resolve) => { resolveConfirm = resolve; }));

    render(
      <PaymentModal
        isOpen
        ticketsTotal={60}
        snacksTotal={0}
        onClose={() => {}}
        onConfirmPayment={onConfirm}
        processingDelayMs={0}
      />
    );

    await fillValidCard(user);
    const submit = screen.getByRole("button", { name: /CONFIRMĂ PLATA/i });
    await user.click(submit);

    await waitFor(() => expect(screen.getByRole("button", { name: /SE PROCESEAZĂ/i })).toBeDisabled());
    await user.click(screen.getByRole("button", { name: /SE PROCESEAZĂ/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    resolveConfirm();
    await waitFor(() => expect(screen.getByRole("button", { name: /CONFIRMĂ PLATA/i })).toBeEnabled());
  });

  it("recalculează reducerea când se schimbă totalul comenzii", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PaymentModal isOpen ticketsTotal={100} snacksTotal={0} onClose={() => {}} onConfirmPayment={() => {}} />
    );

    await user.type(screen.getByLabelText(/Cod promoțional/i), "STUDENT20");
    await user.click(screen.getByRole("button", { name: /APLICĂ/i }));
    expect(screen.getByTestId("payment-final-total")).toHaveTextContent("80 RON");

    rerender(
      <PaymentModal isOpen ticketsTotal={100} snacksTotal={50} onClose={() => {}} onConfirmPayment={() => {}} />
    );
    expect(screen.getByTestId("payment-final-total")).toHaveTextContent("120 RON");
  });

  it("șterge datele cardului când fereastra se închide și se redeschide", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen((v) => !v)}>comută</button>
          <PaymentModal
            isOpen={open}
            ticketsTotal={60}
            snacksTotal={0}
            onClose={() => setOpen(false)}
            onConfirmPayment={() => {}}
          />
        </>
      );
    }

    render(<Harness />);
    await fillValidCard(user);
    expect(screen.getByLabelText(/Număr Card/i)).toHaveValue("4521123456789010");

    await user.click(screen.getByRole("button", { name: "comută" }));
    expect(screen.queryByLabelText(/Număr Card/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "comută" }));

    expect(screen.getByLabelText(/Număr Card/i)).toHaveValue("");
    expect(screen.getByLabelText(/CVV/i)).toHaveValue("");
    expect(screen.getByLabelText(/Adresa de Email/i)).toHaveValue("");
  });

  it("se închide cu tasta Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PaymentModal isOpen ticketsTotal={60} snacksTotal={0} onClose={onClose} onConfirmPayment={() => {}} />
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("afișează eroarea dacă finalizarea comenzii eșuează", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error("Locurile au fost ocupate"));
    render(
      <PaymentModal
        isOpen
        ticketsTotal={60}
        snacksTotal={0}
        onClose={() => {}}
        onConfirmPayment={onConfirm}
        processingDelayMs={0}
      />
    );
    await fillValidCard(user);
    await user.click(screen.getByRole("button", { name: /CONFIRMĂ PLATA/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Locurile au fost ocupate/);
  });
});
