import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from './BookingForm'; // adjust if needed

describe('BookingForm Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'success' })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders form inputs', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/what is the date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('displays time slots when a date is selected', () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/what is the date/i), {
      target: { value: '2025-05-05' }
    });
    expect(screen.getByText('08:00 - 10:00')).toBeVisible();
  });

  test('submits booking data when form is completed', async () => {
    render(<BookingForm />);

    // fill in date
    fireEvent.change(screen.getByLabelText(/what is the date/i), {
      target: { value: '2025-05-05' }
    });

    // select time slot
    fireEvent.click(screen.getByText('10:00 - 12:00'));

    // submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);

      const payload = JSON.parse(fetch.mock.calls[0][1].body);
      expect(payload).toEqual({
        facility_id: 1,
        start_time: expect.stringContaining('2025-05-05T10:00'),
        end_time: expect.stringContaining('2025-05-05T12:00'),
        status: 'pending',
        approved: false
      });
    });
  });
});
