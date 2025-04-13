import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'; // for toBeInTheDocument()

jest.mock('react-router-dom');
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');


import Login from "./Login";

describe("Login Page", () => {
  test("Login button displays correctly", () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /sign in with google/i });
    expect(loginButton).toBeInTheDocument();
  });
});

