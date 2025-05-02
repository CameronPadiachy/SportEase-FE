// src/Resident.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import Resident from './pages/Resident';

// Optional: suppress console errors to keep output clean
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

describe('Resident Page (basic rendering only)', () => {
  test('renders key static UI elements', () => {
    render(<Resident />);

    // Verify headers and static buttons are in the DOM
    expect(screen.getByText(/Logged in as/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
    expect(screen.getByText(/Book padel/i)).toBeInTheDocument();
    expect(screen.getByText(/Book tennis/i)).toBeInTheDocument();
    expect(screen.getByText(/Book soccer/i)).toBeInTheDocument();
    expect(screen.getByText(/Report a Maintenance Issue/i)).toBeInTheDocument();
  });
});
