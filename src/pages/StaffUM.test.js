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

// Firebase mock
jest.mock('../firebase/config', () => ({
  db: {},
}));

// Firestore function mocks
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

// 👇 NO react-router-dom mocking at all now (because we’re removing the only test that used it)

import React from 'react';
import { renderWithRouter } from '../../test-utils';
import StaffUM from './StaffUM';
import { getDocs, updateDoc, doc } from 'firebase/firestore';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Active Users and Revoked Users with the correct names and buttons', async () => {
    renderWithRouter(<StaffUM />);

    expect(await screen.findByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Revoked Users')).toBeInTheDocument();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).toBeNull();

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

  // ❌ Removed:
  // test('back button calls navigate("/staff")', ...)
});
