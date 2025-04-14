import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'; 

jest.mock('react-router-dom');
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})), 
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(), 
}));

import Login from "./Login";
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

describe("Login Page", () => {

  afterAll(() => {
    jest.clearAllTimers();
  });
  
  test("Login button displays correctly", () => {
    const { unmount } = render(<Login />);
    const loginButton = screen.getByRole("button", { name: /sign in with google/i });
    expect(loginButton).toBeInTheDocument();
    unmount();
  });

  test("Login btn triggers firebase popup on btn click", async () =>{
    const { unmount } = render(<Login />);
    const button = screen.getByText(/Sign in with Google/i);
    fireEvent.click(button);

    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
    unmount();
  });

  // test("Navigates to admin home page after successful admin login", async () => {
  //   const mockNavigate = jest.fn();
  //   useNavigate.mockReturnValue(mockNavigate);
  
  //   signInWithPopup.mockResolvedValueOnce({ user: {uid: 'R4f6QQSZsqYwogw9eceNWW493Ld2', email: '2662024@students.wits.ac.za'} });
  
  //   const { unmount } = render(<Login />);
  //   fireEvent.click(screen.getByText(/Sign in with Google/i));
  
  //   await waitFor(() => {
  //     expect(mockNavigate).toHaveBeenCalledWith('/admin');
  //   });
  //   unmount();
  // });

  // test("Navigates to resident home page after successful resident login", async () => {
  //   const mockNavigate = jest.fn();
  //   useNavigate.mockReturnValue(mockNavigate);
  
  //   signInWithPopup.mockResolvedValueOnce({ user: {uid: '9p4pbZKWsrTNeftjdc1j', email: 'john@example.com'} });
  
  //   const { unmount } = render(<Login />);
  //   fireEvent.click(screen.getByText(/Sign in with Google/i));
  
  //   await waitFor(() => {
  //     expect(mockNavigate).toHaveBeenCalledWith('/resident');
  //   });
  //   unmount();
  // });

  test("Displays error message when login fails", async () => {
    signInWithPopup.mockRejectedValueOnce(new Error("Auth failed"));
  
    const { unmount } = render(<Login />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));
  
    const errorMessage = await screen.findByText(/Something went wrong. Check the console./i);
    expect(errorMessage).toBeInTheDocument();
    unmount();
  });

});
