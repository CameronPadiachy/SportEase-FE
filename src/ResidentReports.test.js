//  Mock Firestore before any imports
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(), // Will patch return in test/beforeEach
  }));
  
  jest.mock('./firebase/config.js', () => ({
    db: {},
  }));
  
  import React from 'react';
  import { renderWithRouter } from './admin-test-utils.js';
  import ResidentsReports from './pages/ResidentsReports.js';
  import {
    getDocs,
    addDoc,
    collection,
    serverTimestamp,
  } from 'firebase/firestore';
  import { screen, fireEvent, waitFor } from '@testing-library/react';
  
  describe('ResidentsReports', () => {
    const mockDocs = [
      {
        id: 'r1',
        data: () => ({
          createdBy: 'Alice',
          reportMessage: 'Broken pipe',
          status: 'submitted',
          createdAt: { toDate: () => new Date('2025-05-02T10:00:00Z') },
        }),
      },
    ];
  
    beforeEach(() => {
      getDocs.mockResolvedValue({ docs: mockDocs });
      addDoc.mockResolvedValue({ id: 'new-report-id' });
      serverTimestamp.mockReturnValue('fake-timestamp'); // ✅ ensures createdAt is set
      jest.spyOn(window, 'alert').mockImplementation(() => {});
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('renders reports fetched from Firestore', async () => {
      renderWithRouter(<ResidentsReports />);
      expect(screen.getByText(/Maintenance Issues/i)).toBeInTheDocument();
  
      await waitFor(() => {
        expect(screen.getByText(/Alice/i)).toBeInTheDocument();
        expect(screen.getByText(/Broken pipe/i)).toBeInTheDocument();
        expect(screen.getByText(/submitted/i)).toBeInTheDocument();
      });
    });
  
    test('shows fallback when no reports exist', async () => {
      getDocs.mockResolvedValueOnce({ docs: [] });
      renderWithRouter(<ResidentsReports />);
      await waitFor(() => {
        expect(screen.getByText(/No reports yet/i)).toBeInTheDocument();
      });
    });
  
    test('can toggle form and submit a new report', async () => {
      renderWithRouter(<ResidentsReports />);
      const toggleButton = screen.getByRole('button', { name: /Add New Report/i });
      fireEvent.click(toggleButton);
  
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'Bob' } }); // name
      fireEvent.change(inputs[1], { target: { value: 'Leaking ceiling' } }); // message
  
      const submitButton = screen.getByRole('button', { name: /Submit Report/i });
      fireEvent.click(submitButton);
  
      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(
          collection({}, 'maintenance_reports'),
          {
            createdBy: 'Bob',
            reportMessage: 'Leaking ceiling',
            createdAt: 'fake-timestamp',
            status: 'submitted',
          }
        );
        expect(window.alert).toHaveBeenCalledWith('Report submitted successfully!');
      });
    });
  });
  