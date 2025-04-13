import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  getAuth: jest.fn(() => ({
    currentUser: null,
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));