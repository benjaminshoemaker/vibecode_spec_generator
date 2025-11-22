# Analytics Testing

This document describes the comprehensive test suite for Google Analytics event tracking.

## Test Files

### 1. `tests/unit/utils/analytics.test.ts`
**Purpose:** Unit tests for the analytics utility functions
**Tests:** 21 tests covering all analytics functions

**Coverage:**
- ✅ `trackStepView()` - Tests step navigation tracking
- ✅ `trackChatMessage()` - Tests chat message submission tracking
- ✅ `trackDocumentGenerate()` - Tests document generation success/failure tracking
- ✅ `trackDocumentDownload()` - Tests individual document download tracking
- ✅ `trackBulkDownload()` - Tests bulk ZIP download tracking
- ✅ `trackWizardReset()` - Tests wizard reset tracking
- ✅ `trackWizardComplete()` - Tests wizard completion tracking
- ✅ Edge cases when `window.gtag` is undefined
- ✅ Multiple events in sequence

### 2. `tests/unit/components/ChatInterface.test.tsx`
**Purpose:** Integration tests for ChatInterface analytics tracking
**Tests:** 8 tests covering chat interaction scenarios

**Coverage:**
- ✅ Tracking when user submits message via Enter key
- ✅ Tracking when user submits message via button click
- ✅ Tracking with different step names (ONE_PAGER, DEV_SPEC, etc.)
- ✅ Not tracking when stepName is undefined
- ✅ Not tracking empty or whitespace-only messages
- ✅ Tracking multiple messages in sequence
- ✅ Tracking even when fetch API fails (error handling)

### 3. `tests/unit/components/WizardStep.test.tsx`
**Purpose:** Integration tests for WizardStep document generation analytics
**Tests:** 6 tests covering document generation scenarios

**Coverage:**
- ✅ Tracking successful document generation
- ✅ Tracking failed document generation
- ✅ Tracking with correct step name for different steps
- ✅ Tracking multiple regenerations
- ✅ Tracking when API response is not ok
- ✅ Tracking when response body is missing

### 4. `tests/unit/store-analytics.test.ts`
**Purpose:** Integration tests for Zustand store analytics
**Tests:** 4 tests covering store-level analytics

**Coverage:**
- ✅ Tracking wizard reset when `resetWizard()` is called
- ✅ Tracking reset even with existing data
- ✅ Tracking multiple resets
- ✅ Verifying state is reset after tracking

## Running the Tests

Run all analytics tests:
```bash
npm test -- tests/unit/utils/analytics.test.ts tests/unit/components/ChatInterface.test.tsx tests/unit/components/WizardStep.test.tsx tests/unit/store-analytics.test.ts
```

Run specific test file:
```bash
npm test -- tests/unit/utils/analytics.test.ts
```

Run with watch mode:
```bash
npm run test:watch
```

Run with coverage:
```bash
npm run test:coverage
```

## Test Statistics

- **Total Test Files:** 4
- **Total Tests:** 39
- **All Tests:** ✅ Passing

## Key Testing Patterns

### Mocking Google Analytics
```typescript
vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackEventName: vi.fn(),
  },
}));
```

### Testing Event Tracking
```typescript
expect(analytics.trackEventName).toHaveBeenCalledTimes(1);
expect(analytics.trackEventName).toHaveBeenCalledWith("EXPECTED_VALUE");
```

### Testing Without gtag
```typescript
delete (window as any).gtag;
analytics.trackEventName("value");
expect(gtagMock).not.toHaveBeenCalled();
```

## What's Tested

✅ All 7 analytics events are tracked correctly
✅ Events are tracked with correct parameters
✅ Events gracefully handle missing `window.gtag`
✅ User interactions trigger appropriate analytics events
✅ Failed operations are tracked correctly
✅ Multiple sequential events are tracked
✅ Edge cases (empty input, undefined values, errors)

## What's NOT Tested

These items are not unit tested but work in production:
- Actual Google Analytics integration (requires real GA_ID)
- Network requests to Google Analytics servers
- Real browser environment behavior
- Page view tracking (handled by Next.js and GA automatically)

## Future Improvements

Potential areas for additional testing:
- E2E tests using Playwright or Cypress to verify actual GA events
- Testing analytics in production environment
- Performance impact of analytics tracking
- Analytics data validation in GA dashboard
