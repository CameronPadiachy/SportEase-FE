// src/Staff.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import Staff from './pages/Staff';

describe('Staff Dashboard (basic rendering only)', () => {
  test('renders static staff dashboard content', () => {
    render(<Staff />);

    expect(screen.getByText(/Staff Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/You can view and update maintenance reports here/i)).toBeInTheDocument();

    expect(screen.getByText(/Manage Maintenance Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
  });
});
