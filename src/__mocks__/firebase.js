import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDash from './AdminDash';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})), // constructor mock
}));

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AdminDash', () => {
  test('renders admin dashboard content', () => {
    render(
      <Router>
        <AdminDash />
      </Router>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage Bookings')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('calls signOut and redirects on logout', async () => {
    render(
      <Router>
        <AdminDash />
      </Router>
    );

    fireEvent.click(screen.getByText('Log Out'));

    await waitFor(() => {
      const { signOut } = require('firebase/auth');
      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
