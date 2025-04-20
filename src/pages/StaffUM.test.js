// src/pages/StaffUM.test.js

// Suppress React “unique key” warnings for this test suite
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Each child in a list should have a unique "key"')
    ) {
      return;
    }
    console.error(...args);
  });
});

// Stub your Firebase config so getFirestore() never runs
jest.mock('../firebase/config', () => ({
  db: {}, // dummy Firestore instance
}));

import React from 'react';
import { renderWithRouter } from '../../test-utils';
import StaffUM from './StaffUM';
import { getDocs, updateDoc, doc } from 'firebase/firestore';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

// Mock only the Firestore methods your component uses
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('StaffUM', () => {
  const fakeDocs = [
    { id: '1', data: () => ({ displayName: 'Alice', role: 'resident', access: 1 }) },
    { id: '2', data: () => ({ displayName: 'Bob',   role: 'staff',    access: 1 }) },
    { id: '3', data: () => ({ displayName: 'Carol', role: 'resident', access: 0 }) },
  ];

  beforeEach(() => {
    getDocs.mockResolvedValue({
      forEach: cb => fakeDocs.forEach(docSnap => cb({ id: docSnap.id, data: docSnap.data })),
    });
    doc.mockImplementation(() => ({}));
    updateDoc.mockResolvedValue();
    useNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Active Users and Revoked Users with the correct names and buttons', async () => {
    renderWithRouter(<StaffUM />);

    // Sections
    expect(await screen.findByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Revoked Users')).toBeInTheDocument();

    // User entries (Alice & Carol), Bob should be filtered out
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).toBeNull();

    // Buttons
    expect(await screen.findByRole('button', { name: 'Revoke' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Grant Access' })).toBeInTheDocument();
  });

  test('clicking Revoke calls updateDoc with { access: 0 }', async () => {
    renderWithRouter(<StaffUM />);
    const revokeBtn = await screen.findByRole('button', { name: 'Revoke' });
    userEvent.click(revokeBtn);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { access: 0 });
    });
  });

  test('clicking Grant Access calls updateDoc with { access: 1 }', async () => {
    renderWithRouter(<StaffUM />);
    const grantBtn = await screen.findByRole('button', { name: 'Grant Access' });
    userEvent.click(grantBtn);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { access: 1 });
    });
  });

  test('back button calls navigate("/staff")', async () => {
    renderWithRouter(<StaffUM />);
    const backBtn = await screen.findByRole('button', { name: /Back to Staff Home/i });
    userEvent.click(backBtn);

    // useNavigate is a jest.fn(), so just assert it was called
    expect(useNavigate).toHaveBeenCalledWith('/staff');
  });
});
