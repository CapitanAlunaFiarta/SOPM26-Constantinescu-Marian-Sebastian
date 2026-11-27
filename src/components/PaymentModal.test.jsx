import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PaymentModal from "./PaymentModal";

describe("PaymentModal", () => {
  it("respinge numărul de card cu mai puțin de 16 cifre", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <PaymentModal
        isOpen={true}
        ticketsTotal={90}
        snacksTotal={25}
        onClose={() => {}}
        onConfirmPayment={onConfirm}
        processingDelayMs={0}
      />
    );

    await user.type(screen.getByLabelText(/Adresa de Email/i), "student@unitbv.ro");
    await user.type(screen.getByLabelText(/Numele de pe card/i), "Popescu Ion");
    await user.type(screen.getByLabelText(/Număr Card/i), "123456");
    await user.type(screen.getByLabelText(/Expirare/i), "12/29");
    await user.type(screen.getByLabelText(/CVV/i), "123");
    await user.click(screen.getByRole("button", { name: /CONFIRMĂ PLATA/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/exact 16 cifre/i);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("respinge o dată de expirare din trecut", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <PaymentModal
        isOpen={true}
        ticketsTotal={60}
        snacksTotal={0}
        onClose={() => {}}
        onConfirmPayment={onConfirm}
        processingDelayMs={0}
      />
    );

    await user.type(screen.getByLabelText(/Adresa de Email/i), "adi@unitbv.ro");
    await user.type(screen.getByLabelText(/Numele de pe card/i), "Adi Seniuc");
    await user.type(screen.getByLabelText(/Număr Card/i), "4521123456789010");
    await user.type(screen.getByLabelText(/Expirare/i), "01/20");
    await user.type(screen.getByLabelText(/CVV/i), "999");
    await user.click(screen.getByRole("button", { name: /CONFIRMĂ PLATA/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/invalidă sau în trecut/i);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("aplică reducerea STUDENT20 (20%) și confirmă plata cu date valide", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <PaymentModal
        isOpen={true}
        ticketsTotal={100}
        snacksTotal={0}
        onClose={() => {}}
        onConfirmPayment={onConfirm}
        processingDelayMs={0}
      />
    );

    await user.type(screen.getByLabelText(/Cod promoțional/i), "STUDENT20");
    await user.click(screen.getByRole("button", { name: /APLICĂ/i }));
    expect(screen.getByTestId("payment-final-total")).toHaveTextContent("80 RON");

    await user.type(screen.getByLabelText(/Adresa de Email/i), "sebi@unitbv.ro");
    await user.type(screen.getByLabelText(/Numele de pe card/i), "Sebi Constantinescu");
    await user.type(screen.getByLabelText(/Număr Card/i), "4521123456789010");
    await user.type(screen.getByLabelText(/Expirare/i), "12/29");
    await user.type(screen.getByLabelText(/CVV/i), "123");
    await user.click(screen.getByRole("button", { name: /CONFIRMĂ PLATA/i }));

    expect(onConfirm).toHaveBeenCalledWith({
      email: "sebi@unitbv.ro",
      cardName: "Sebi Constantinescu",
      finalTotal: 80
    });
  });
});
