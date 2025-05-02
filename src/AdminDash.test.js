// src/AdminDash.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import Admin from './pages/AdminDash';

describe('Admin Dashboard (basic rendering only)', () => {
  test('renders static dashboard UI content', () => {
    render(<Admin />);

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/You can manage users, events, and facility data./i)).toBeInTheDocument();

    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
  });
});
