const mockAuth = () => ({
    signInWithPopup: jest.fn(),
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve('mock-token'))
    }
  });
  
  const mockFirebase = {
    initializeApp: jest.fn(),
    auth: mockAuth,
    firestore: jest.fn(),
    GoogleAuthProvider: jest.fn()
  };
  
  module.exports = mockFirebase;