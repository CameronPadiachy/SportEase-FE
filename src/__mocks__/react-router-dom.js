// src/__mocks__/react-router-dom.js
import React from 'react';

// A single mock navigate function we can inspect in tests
export const mockNavigate = jest.fn();

// useNavigate returns our mockNavigate
export const useNavigate = () => mockNavigate;

// Stub for MemoryRouter so <MemoryRouter>{ui}</MemoryRouter> renders children
export const MemoryRouter = ({ children }) => <>{children}</>;

// Other router hooks/components
export const useLocation = jest.fn(() => ({}));
export const Link = ({ children }) => <>{children}</>;
export const Navigate = ({ children }) => <>{children}</>;
export const Outlet = () => <></>;
export const useParams = jest.fn(() => ({}));
