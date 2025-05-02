import React from 'react' ;
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminBooking from './AdminBooking' ;
import '@testing-library/jest-dom';


beforeEach(()=> {
  global.fetch = jest.fn((url, options) => {
   
    if (options?.method=== 'PATCH') {
      const body= JSON.parse(options.body);
      return Promise.resolve({
        json: ()=>
          Promise.resolve({
            booking_id: 1,
            status: body.status,
          }),

      });
    }

  
    return Promise.resolve({
      json: ()=>
        Promise.resolve([
          {
            booking_id: 1,
            facility_id: 3,
            start_time: '2025-04-25T10:00:00Z',
            end_time: '2025-04-25T11:00:00Z' ,
            status: 'pending' ,
            editing: true,
          },

        ]),

    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});


test('renders the heading', ()=> {
  render(<AdminBooking />);
  expect(screen.getByText(/Manage Booking Requests/i)).toBeInTheDocument();
});


test('shows Edit button after clicking Accept or Decline', async () => {
  render(<AdminBooking />);


  const acceptBtn= await screen.findByText('Accept');
  const declineBtn= await screen.findByText('Decline');
  expect(acceptBtn).toBeInTheDocument();
  expect(declineBtn).toBeInTheDocument();


  fireEvent.click(acceptBtn);

 
  await waitFor(()=> {
    const editBtn =screen.getByText('Edit');
    expect(editBtn).toBeInTheDocument();
  });
  
});


test('renders booking info in table', async ()=> {
  render(<AdminBooking />);
  const facility = await screen.findByText(/Facility 3/) ;
  expect(facility).toBeInTheDocument();


});
