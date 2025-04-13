import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'; // for toBeInTheDocument()
import Login from "./Login";

describe("Login Page", () => {
  test("Login button displays correctly", () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /sign in with google/i });
    expect(loginButton).toBeInTheDocument();
  });
});

