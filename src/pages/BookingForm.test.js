import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from './BookingForm';

describe('BookingForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "created" })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders date and time fields', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/what is the date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what time/i)).toBeInTheDocument();
  });

  test('shows time slots when date is selected', () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/what is the date/i), {
      target: { value: '2025-05-05' }
    });
    expect(screen.getByText('10:00 - 12:00')).toBeVisible();
  });

  /*test('submits booking on form submit', async () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/what is the date/i), {
      target: { value: '2025-05-05' }
    });
    fireEvent.click(screen.getByText('10:00 - 12:00'));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });*/
});
