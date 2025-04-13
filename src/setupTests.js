import '@testing-library/jest-dom';
// Fix for JSDOM environment
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));