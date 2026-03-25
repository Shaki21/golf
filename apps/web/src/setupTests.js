import '@testing-library/jest-dom';

// Mock react-day-picker to avoid ESM issues with date-fns
jest.mock('react-day-picker', () => ({
  DayPicker: ({ children }) => <div data-testid="day-picker">{children}</div>,
}));

// Mock the shadcn calendar component
jest.mock('./components/shadcn/calendar', () => ({
  Calendar: ({ children }) => <div data-testid="calendar">{children}</div>,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
