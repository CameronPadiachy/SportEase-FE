import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'; 

jest.mock('react-router-dom');
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})), 
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(), 
}));

import Login from "./Login";
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

