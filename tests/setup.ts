import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  // Keep error for debugging failing tests
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
