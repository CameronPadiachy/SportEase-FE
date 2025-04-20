// src/pages/AdminUM.test.js

// Stub your Firebase config so getFirestore() never runs
jest.mock('../firebase/config', () => ({
    db: {},
  }));
  
  import React from 'react';
  import { renderWithRouter } from '../../test-utils';
  import AdminUM from './AdminUM';
  import { getDocs, updateDoc, doc } from 'firebase/firestore';
  import userEvent from '@testing-library/user-event';
  import { screen, waitFor } from '@testing-library/react';
  
  // Mock only the Firestore methods your component uses
  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    doc: jest.fn(),
  }));
  
  describe('AdminUM', () => {
    const fakeDocs = [
      { id: '1', data: () => ({ displayName: 'Alice', role: 'resident', access: 1 }) },
      { id: '2', data: () => ({ displayName: 'Bob',   role: 'staff',    access: 1 }) },
      { id: '3', data: () => ({ displayName: 'Carol', role: 'resident', access: 0 }) },
    ];
  
    beforeEach(() => {
      // getDocs returns a snapshot whose forEach invokes our fakeDocs
      getDocs.mockResolvedValue({
        forEach: (cb) => fakeDocs.forEach(docSnap => cb({ id: docSnap.id, data: docSnap.data })),
      });
      // Stub doc() to return a dummy reference object
      doc.mockImplementation(() => ({ _path: 'users/any' }));
      updateDoc.mockResolvedValue();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('renders Staff, Residents, and Revoked Users sections with correct names and buttons', async () => {
      renderWithRouter(<AdminUM />);
  
      // Section headings
      expect(await screen.findByText('Staff')).toBeInTheDocument();
      expect(screen.getByText('Residents')).toBeInTheDocument();
      expect(screen.getByText('Revoked Users')).toBeInTheDocument();
  
      // Wait for user names to appear
      expect(await screen.findByText('Alice')).toBeInTheDocument();
      expect(await screen.findByText('Bob')).toBeInTheDocument();
      expect(await screen.findByText('Carol')).toBeInTheDocument();
  
      // Action buttons
      expect(screen.getByRole('button', { name: 'Promote' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Revoke' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Demote' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grant Access' })).toBeInTheDocument();
    });
  
    test('clicking Promote calls updateDoc with { role: "staff" }', async () => {
      renderWithRouter(<AdminUM />);
      const btn = await screen.findByRole('button', { name: 'Promote' });
      userEvent.click(btn);
  
      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), { role: 'staff' });
      });
    });
  
    test('clicking Revoke calls updateDoc with { access: 0 }', async () => {
      renderWithRouter(<AdminUM />);
      const btn = await screen.findByRole('button', { name: 'Revoke' });
      userEvent.click(btn);
  
      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), { access: 0 });
      });
    });
  
    test('clicking Demote calls updateDoc with { role: "resident" }', async () => {
      renderWithRouter(<AdminUM />);
      const btn = await screen.findByRole('button', { name: 'Demote' });
      userEvent.click(btn);
  
      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), { role: 'resident' });
      });
    });
  
    test('clicking Grant Access calls updateDoc with { access: 1 }', async () => {
      renderWithRouter(<AdminUM />);
      const btn = await screen.findByRole('button', { name: 'Grant Access' });
      userEvent.click(btn);
  
      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), { access: 1 });
      });
    });
  });
  