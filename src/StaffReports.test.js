jest.mock('./firebase/config.js', () => ({
  db: {},
}));

import React from 'react';
import { renderWithRouter } from './admin-test-utils.js'; // ✅ custom router-aware test renderer
import StaffReports from './pages/StaffReports.js';
import { getDocs, updateDoc, doc } from 'firebase/firestore';
import { screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('StaffReports', () => {
  const mockDocs = [
    {
      id: 'abc123',
      data: () => ({
        createdBy: 'John Tester',
        reportMessage: 'Leaking pipe in kitchen',
        status: 'submitted',
        createdAt: { toDate: () => new Date('2025-05-01T08:00:00Z') }
      })
    }
  ];

  beforeEach(() => {
    getDocs.mockResolvedValue({ docs: mockDocs });
    updateDoc.mockResolvedValue();
    doc.mockImplementation((db, col, id) => ({ db, col, id }));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders reports fetched from firestore', async () => {
    renderWithRouter(<StaffReports />);
    expect(screen.getByText(/Manage Maintenance Reports/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Leaking pipe in kitchen/i)).toBeInTheDocument();

      // ✅ Traverse from <strong>Reported By:</strong> to <p> and assert full content
      const strongLabel = screen.getByText("Reported By:");
      const fullPara = strongLabel.closest("p");
      expect(fullPara).toBeInTheDocument();
      expect(fullPara.textContent).toContain("Reported By:");
      expect(fullPara.textContent).toContain("John Tester");
    });
  });

  test('can change report status', async () => {
    renderWithRouter(<StaffReports />);
    await waitFor(() => {
      const strongLabel = screen.getByText("Reported By:");
      const fullPara = strongLabel.closest("p");
      expect(fullPara).toBeInTheDocument();
      expect(fullPara.textContent).toContain("Reported By:");
      expect(fullPara.textContent).toContain("John Tester");
    });

    // ✅ Match the visible label text exactly
    const dropdown = screen.getByDisplayValue('Submitted');
    fireEvent.change(dropdown, { target: { value: 'resolved' } });

    const button = screen.getByRole('button', { name: /update status/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        { db: {}, col: 'maintenance_reports', id: 'abc123' },
        { status: 'resolved' }
      );
      expect(window.alert).toHaveBeenCalledWith('Status updated successfully!');
    });
  });

  test('shows no reports fallback message', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    renderWithRouter(<StaffReports />);
    await waitFor(() => {
      expect(screen.getByText(/No reports available/i)).toBeInTheDocument();
    });
  });
});
