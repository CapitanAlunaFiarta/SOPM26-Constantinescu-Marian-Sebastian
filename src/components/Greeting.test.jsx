import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
  it("afișează mesajul de întâmpinare", () => {
    render(<Greeting />);
    expect(screen.getByRole("heading", { name: "Salut, React!" })).toBeInTheDocument();
  });
});
