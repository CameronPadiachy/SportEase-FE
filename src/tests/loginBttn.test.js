import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login'; // adjust if path is different
import * as firebaseAuth from 'firebase/auth';

// Mock signInWithPopup to prevent real Firebase auth popup
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
}));

test('renders login button and handles click', () => {
  render(<Login />);

  const loginButton = screen.getByRole('button', { name: /sign in with google/i });
  expect(loginButton).toBeInTheDocument();

  fireEvent.click(loginButton);
  expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
});
