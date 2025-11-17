# Test Suite Documentation

This directory contains the test suite for the Wizard App, built with Vitest.

## Overview

**Total Test Coverage: 73 tests across 4 test files**

- **Unit Tests**: 41 tests
- **Integration Tests**: 32 tests

## Test Framework

- **Runner**: Vitest 4.0.10
- **Testing Library**: @testing-library/react 16.3.0
- **Environment**: happy-dom (for DOM simulation)
- **Mocking**: Vitest built-in mocking

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- store.test.ts
```

## Test Structure

```
tests/
├── setup.ts                          # Global test setup and mocks
├── unit/                             # Unit tests
│   ├── store.test.ts                # Zustand store tests (24 tests)
│   └── utils/
│       └── sampleDocs.test.ts       # Sample docs utility tests (17 tests)
└── integration/                      # Integration tests
    └── api/
        ├── chat.test.ts             # Chat API route tests (13 tests)
        └── generate-doc.test.ts     # Generate doc API route tests (19 tests)
```

## Test Files

### Unit Tests

#### `store.test.ts` (24 tests)
Tests the Zustand state management store:
- Initial state validation
- State mutation functions (setCurrentStep, setIsGenerating, updateStepChat, updateStepDoc, approveStep)
- Reset functions (resetWizard, loadSampleDocs)
- Complex workflows and state isolation

#### `sampleDocs.test.ts` (17 tests)
Tests the sample documentation utility:
- Structure validation
- Content validation (markdown format, key sections)
- Data integrity checks

### Integration Tests

#### `chat.test.ts` (13 tests)
Tests the `/api/chat` route:
- Request validation
- System prompt construction
- Document context injection
- Model selection
- Error handling
- Message processing

#### `generate-doc.test.ts` (19 tests)
Tests the `/api/generate-doc` route:
- Request validation
- Prompt generation
- Chat history formatting
- Document inputs handling
- Model selection
- Error handling

## Mocking Strategy

### AI SDK Mocking
The OpenAI SDK is mocked in integration tests to avoid actual API calls:

```typescript
vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: vi.fn(() => new Response("Mocked stream response")),
  })),
  generateText: vi.fn(async () => ({
    text: "# Generated Document\n\nThis is a mocked document.",
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mocked-openai-model"),
}));
```

### localStorage Mocking
Global localStorage is mocked in `setup.ts` to support Zustand persistence tests:

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

## Writing New Tests

### Test Naming Convention
- Test files: `*.test.ts` or `*.test.tsx`
- Test suites: Use descriptive `describe()` blocks
- Test cases: Use `it('should...')` or `test('does...')`

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  describe("Specific Behavior", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test";

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

## Coverage Goals

Current coverage areas:
- ✅ State management (Zustand store)
- ✅ Utility functions (sampleDocs)
- ✅ API routes (/api/chat, /api/generate-doc)

Not yet covered (future work):
- React components (ChatInterface, WizardStep, DocumentPreview)
- Step configurations
- End-to-end user flows

## Notes

- **Console errors in test output**: Some tests intentionally trigger error conditions. The stderr output showing "Chat API error" or "Generate doc API error" is expected behavior when testing error handling.
- **Fast execution**: The entire test suite runs in ~400ms, providing rapid feedback during development.
- **No production code changes**: All tests were added without modifying existing application code.

## Troubleshooting

### Tests fail with "module not found"
Ensure the path alias `@/` is configured in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./"),
  },
}
```

### localStorage errors
The global localStorage mock should be set up in `setup.ts`. Verify it's imported in `vitest.config.ts`:
```typescript
setupFiles: ["./tests/setup.ts"]
```

### Mocks not working
Clear mocks between tests using `beforeEach(() => vi.clearAllMocks())` to avoid test pollution.
