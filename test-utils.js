import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// This replaces the standard 'render' in your tests
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  
  return {
    ...render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>),
  };
}