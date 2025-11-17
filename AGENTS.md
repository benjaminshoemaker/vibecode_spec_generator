# AGENTS.md

**Purpose**: This file orients automated agents (Claude Code, GitHub Copilot, Cursor, etc.) to the repository structure, architecture, testing requirements, and expectations for automated work.

Keep this file minimal, readable, and authoritative. If something here conflicts with other docs, stop and ask a human.

---

## Project Overview

**VibeCODE Spec Generator** is a Next.js 16.0.3 application that implements a multi-step wizard interface for generating technical specification documents using AI-powered chat conversations.

### Core Concept
Users progress through 4 sequential steps, each involving:
1. **Chat Phase**: Interactive conversation with AI to gather requirements
2. **Generation Phase**: AI synthesizes chat history into a structured markdown document
3. **Approval Phase**: User reviews and approves before proceeding to next step

### Document Flow
1. **Step 1 - One Pager**: High-level product vision and requirements
2. **Step 2 - Dev Spec**: Technical specification and architecture details
3. **Step 3 - Prompt Plan**: Implementation checklist and staged development plan
4. **Step 4 - AGENTS.md**: Agent guidance and workflow documentation

---

## Key Files & Structure

### Configuration & State
- `app/store.ts` — Zustand store with localStorage persistence (key: `wizard-storage`)
- `app/types.ts` — TypeScript interfaces for state, steps, and configs
- `app/wizard/steps/step{1-4}-config.ts` — Step configurations (instructions, prompts, document inputs)

### Components
- `app/wizard/page.tsx` — Main wizard orchestrator with navigation and state management
- `app/wizard/components/WizardStep.tsx` — Per-step component handling chat/preview/generation
- `app/wizard/components/ChatInterface.tsx` — Custom streaming chat implementation (not using @ai-sdk/react hooks)
- `app/wizard/components/DocumentPreview.tsx` — Markdown renderer with raw/rendered toggle

### API Routes (Edge Runtime)
- `app/api/chat/route.ts` — Streaming chat endpoint using Vercel AI SDK `streamText()`
- `app/api/generate-doc/route.ts` — Non-streaming document generation using `generateText()`

### Utilities
- `app/wizard/utils/sampleDocs.ts` — Sample documents for quick testing/development

### Tests
- `tests/` — Vitest test suite with 73 tests (see `tests/README.md`)
- `tests/unit/` — Unit tests (store, utilities)
- `tests/integration/api/` — API integration tests

---

## Architecture Deep Dive

### State Management
**Zustand** with localStorage persistence ensures state survives page refreshes:
- Key: `wizard-storage`
- Each step stores: `chatHistory`, `generatedDoc`, `approved` status
- Navigation locked until current step approved
- State mapping in `app/wizard/page.tsx` line 18: `stepKeyMap`

**Step State Structure** (`app/types.ts`):
```typescript
StepData {
  chatHistory: Message[]      // All chat messages for this step
  generatedDoc: string | null // Generated markdown document
  approved: boolean           // Whether step is complete
}
```

### Chat Implementation
Custom streaming implementation (not using `useChat` hook due to version compatibility):
- Manual fetch from `/api/chat` and reads streamed text chunks
- Appends streamed chunks directly to the latest assistant message
- Implementation in `app/wizard/components/ChatInterface.tsx`

**Stream Handling Logic**:
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
// Read chunks and append to assistant message
const chunk = decoder.decode(value);
assistantMessage = {
  ...assistantMessage,
  content: assistantMessage.content + chunk,
};
setMessages([...updatedMessages, assistantMessage]);
```
**Note**: This assumes API returns plain text chunks; if streaming format changes, update this code.

### Document Generation
- `/api/generate-doc` receives: `chatHistory`, `stepName`, `documentInputs` (previous docs for context)
- Step 2+ can reference earlier documents (e.g., Step 2 receives Step 1's one-pager)
- Non-streaming generation for complete document creation
- Document context passed via step config's `documentInputs` array

**Document Context Passing** (`app/wizard/components/WizardStep.tsx:28-35`):
```typescript
const documentInputsForChat: Record<string, string> = {};
if (config.documentInputs.length > 0) {
  for (const inputKey of config.documentInputs) {
    const key = inputKey as keyof typeof steps;
    if (steps[key]?.generatedDoc) {
      documentInputsForChat[inputKey] = steps[key].generatedDoc!;
    }
  }
}
```
**Important**: Empty string values are NOT passed (only non-null documents).

### Model & API Configuration
- Uses OpenAI models via the Vercel AI SDK (`@ai-sdk/openai`)
- Model configured via `OPENAI_MODEL` environment variable (defaults to `gpt-4o`)
- Both API routes use **Edge Runtime** (not Node.js)
- Requires `OPENAI_API_KEY` in `.env.local`

### Component Hierarchy
```
WizardPage (app/wizard/page.tsx)
├── Progress indicator (shows 1-4 steps)
├── WizardStep component (per-step orchestrator)
│   ├── ChatInterface (before document generation)
│   │   └── Custom streaming implementation
│   └── DocumentPreview (after generation)
│       └── ReactMarkdown renderer
└── Navigation buttons (Previous/Next)
```

---

## Agent Responsibilities

### When Modifying Code

1. **Understand the Three-Phase Pattern**
   - Chat → Generation → Approval
   - Don't break this flow when adding features

2. **Respect State Structure**
   - Never add fields to `StepData` without updating `app/types.ts`
   - Always consider localStorage persistence implications
   - Test state hydration after changes

3. **Step Configuration Changes**
   - Update step configs in `app/wizard/steps/stepN-config.ts`
   - Step configs are the source of truth for AI behavior
   - `documentInputs` array controls which previous docs are passed to generation

4. **API Route Modifications**
   - Both routes use Edge Runtime (no Node.js APIs)
   - Maintain streaming for chat, non-streaming for generation
   - Always validate `OPENAI_API_KEY` presence

5. **UI Changes**
   - Maintain responsive grid: `lg:grid-cols-[70%_30%]` (chat/sidebar layout)
   - Keep sidebar sticky: `lg:sticky lg:top-20`
   - Preserve download functionality (individual + ZIP)

---

## Testing Requirements

**Test Framework**: Vitest 4.0.10 with @testing-library/react

### Current Test Coverage (73 tests)
- ✅ Unit tests: Store (24 tests), Utilities (17 tests)
- ✅ Integration tests: Chat API (13 tests), Generate Doc API (19 tests)

### Testing Commands
```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:ui       # Visual test UI
npm run test:coverage # Generate coverage report
```

### Required Tests Before Merging Code

1. **Always write tests for new features**
   - Unit tests for pure functions and utilities
   - Integration tests for API routes
   - Component tests for React components (when applicable)

2. **Run full test suite before committing**
   ```bash
   npm test
   ```
   All 73 tests must pass.

3. **Test Coverage Requirements**
   - New business logic must have unit tests
   - New API routes must have integration tests
   - Maintain or improve overall coverage

### Manual Testing Checklist

Before considering work complete, verify:

1. **Chat Flow**
   - Start chat, send messages, verify streaming works
   - Test with/without API key (error handling)

2. **Generation Flow**
   - Generate document from chat history
   - Verify previous document context is passed (Step 2+)
   - Test regeneration functionality

3. **State Persistence**
   - Generate document, refresh page, verify state intact
   - Test "Reset Wizard" clears all state
   - Test "Load Sample Docs" populates all steps

4. **Download Features**
   - Individual document download (verify ALL_CAPS_UNDERSCORES.md naming)
   - Download All as ZIP (verify all docs included)
   - Test with partial state (some steps incomplete)

5. **Navigation**
   - Previous/Next buttons enable/disable correctly
   - Can't proceed without approval
   - Can navigate back to completed steps

---

## Guardrails for Agents

### Never Do This ❌
- Don't introduce breaking changes to step configs without migration plan
- Don't change localStorage key (`wizard-storage`) — will lose all user data
- Don't use Node.js APIs in Edge Runtime routes
- Don't remove existing step configs (breaks state mapping)
- Don't change the OpenAI model default without testing all endpoints
- Don't skip writing tests for new features
- Don't commit code with failing tests

### Always Do This ✅
- Write tests before or alongside implementation (TDD approach)
- Run `npm test` before committing
- Test full wizard flow after changes (all 4 steps)
- Verify localStorage persistence after state changes
- Check both API routes if changing AI SDK usage
- Update this file (AGENTS.md) if architecture changes significantly
- Test with and without sample docs loaded

### When Uncertain
- Ask before changing state structure
- Ask before modifying streaming implementation
- Ask before changing step count (currently hardcoded to 4)
- Ask before major UI layout changes
- Ask before adding new dependencies

---

## File Naming Convention

**CRITICAL**: All generated document filenames MUST use:
- `toUpperCase()` for case
- `replace(/\s+/g, '_')` for spaces → underscores
- Example: "One Pager" → `ONE_PAGER.md`

This applies to:
- Individual downloads (`app/wizard/page.tsx:59`)
- ZIP file contents (`app/wizard/page.tsx:90`)

---

## Common Modifications

### Adding a New Feature to All Steps

1. Update `app/types.ts` → add field to `StepData` or `StepConfig`
2. Update `app/store.ts` → handle new field in actions
3. **Write tests** in `tests/unit/store.test.ts`
4. Update `app/wizard/components/WizardStep.tsx` → use new field
5. Test localStorage migration if needed
6. Run `npm test` to verify

### Changing AI Behavior for a Step

1. Edit `app/wizard/steps/stepN-config.ts`
2. Modify `systemPrompt` for chat behavior
3. Modify `generationPrompt` for document generation (if exists)
4. Test: chat → generate → verify output quality
5. No tests needed for prompt changes (unless adding new fields)

### Adding Context from Previous Steps

1. Edit step config's `documentInputs` array
2. Add keys of previous steps (e.g., `["onePager", "devSpec"]`)
3. API route automatically passes these to generation
4. Test manually to verify context is used

### Customizing Document Format

1. Modify the `generationPrompt` in step config
2. Or update `/api/generate-doc/route.ts` for global changes
3. Test regeneration on existing chat history
4. Add integration test if changing route behavior

### Adding a New API Route

1. Create route file in `app/api/`
2. Use Edge Runtime: `export const runtime = "edge";`
3. **Write integration tests** in `tests/integration/api/`
4. Mock external dependencies (OpenAI, etc.)
5. Test error handling
6. Run `npm test` to verify

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your OPENAI_API_KEY (and optionally OPENAI_MODEL)

# Start dev server
npm run dev

# Run tests in watch mode (recommended)
npm run test:watch
```

### Testing Changes
1. Use "Load Sample Docs" button for quick state population
2. Test individual step flows
3. Test full 4-step progression
4. Test download features
5. Verify state persistence (refresh browser)
6. Run automated tests: `npm test`

### Common Commands
```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build (tests TypeScript compilation)
npm run lint         # ESLint check
npm start            # Production server
npm test             # Run all tests
npm run test:watch   # Test watch mode
```

---

## Key Technical Constraints

- **Edge Runtime**: Both API routes use Edge Runtime (not Node.js)
- **Model**: Configured via `OPENAI_MODEL` (defaults to `gpt-4o`) in both API routes
- **Tailwind v3**: Using Tailwind CSS v3.4, not v4 (due to PostCSS plugin compatibility)
- **Step Count**: Adding/removing steps requires updating:
  - `stepKeyMap` in `app/wizard/page.tsx` (line 18)
  - `steps` object type in `app/types.ts`
  - `initialStepData` structure in `app/store.ts`
- **No useChat Hook**: Custom streaming implementation (version compatibility issue)

---

## Critical Implementation Details

### Step Key Mapping
```typescript
// app/wizard/page.tsx:18
const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;
```
**Don't change without updating:**
- `app/types.ts` → `WizardState["steps"]`
- `app/store.ts` → `initialStepData` structure

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (defaults shown)
OPENAI_MODEL=gpt-4o
```

### State Debugging
To inspect wizard state:
1. Open browser DevTools → Application → Local Storage
2. Look for key `wizard-storage`
3. Value is JSON with current wizard state

To reset state:
- Click "Reset Wizard" button in UI
- Or delete `wizard-storage` from localStorage

---

## When to Ask for Human Input

Ask the human if:
- Changing the number of steps (currently hardcoded to 4)
- Modifying localStorage persistence structure (data migration needed)
- Changing AI model or API provider
- Major UI/UX changes that affect the three-phase workflow
- Adding new dependencies that increase bundle size significantly
- Changing file naming conventions (affects existing user workflows)
- Modifying Edge Runtime routes in ways that might not be compatible
- Unsure whether to add tests for a particular change
- Test coverage drops below current level (73 tests)

---

## Quick Reference: File Purposes

| File | Purpose | Tests? |
|------|---------|--------|
| `app/wizard/page.tsx` | Main wizard, navigation, downloads, state orchestration | Not yet |
| `app/wizard/components/WizardStep.tsx` | Per-step logic: chat ↔ preview ↔ generation | Not yet |
| `app/wizard/components/ChatInterface.tsx` | Streaming chat UI and manual stream parsing | Not yet |
| `app/wizard/components/DocumentPreview.tsx` | Markdown rendering with raw/rendered toggle | Not yet |
| `app/api/chat/route.ts` | Streaming chat endpoint (Edge Runtime) | ✅ 13 tests |
| `app/api/generate-doc/route.ts` | Document generation endpoint (Edge Runtime) | ✅ 19 tests |
| `app/store.ts` | Zustand + localStorage state management | ✅ 24 tests |
| `app/types.ts` | TypeScript interfaces for entire app | — |
| `app/wizard/steps/stepN-config.ts` | Step-specific configuration and prompts | Not yet |
| `app/wizard/utils/sampleDocs.ts` | Sample documents for testing | ✅ 17 tests |

---

## Adding New Steps (Step 5+)

To add a new step beyond the current 4:

1. **Update step key mapping** in `app/wizard/page.tsx`:
   ```typescript
   const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd", "newStep"] as const;
   ```

2. **Add to type definitions** in `app/types.ts`:
   ```typescript
   steps: {
     onePager: StepData;
     devSpec: StepData;
     checklist: StepData;
     agentsMd: StepData;
     newStep: StepData; // Add this
   }
   ```

3. **Initialize in store** in `app/store.ts`:
   ```typescript
   steps: {
     // ... existing steps
     newStep: { ...initialStepData },
   }
   ```

4. **Create step config** `app/wizard/steps/step5-config.ts`:
   ```typescript
   export const step5Config: StepConfig = {
     stepNumber: 5,
     stepName: "New Step",
     userInstructions: "...",
     systemPrompt: "...",
     generateButtonText: "Generate New Step",
     approveButtonText: "Approve Draft & Save",
     documentInputs: ["onePager", "devSpec"], // Previous steps for context
   };
   ```

5. **Import in main wizard** `app/wizard/page.tsx`:
   ```typescript
   import { step5Config } from "./steps/step5-config";
   const stepConfigs = [step1Config, step2Config, step3Config, step4Config, step5Config];
   ```

6. **Write tests** for any new logic introduced

**No component changes needed** - `WizardStep` component handles all steps generically.

---

## Testing Best Practices

### Writing Good Tests

1. **Follow the AAA Pattern**
   ```typescript
   it('should do something specific', () => {
     // Arrange
     const input = "test";

     // Act
     const result = functionUnderTest(input);

     // Assert
     expect(result).toBe("expected");
   });
   ```

2. **Use Descriptive Test Names**
   - ✅ Good: `it('should return 400 when messages are missing', ...)`
   - ❌ Bad: `it('test validation', ...)`

3. **Mock External Dependencies**
   ```typescript
   vi.mock("ai", () => ({
     streamText: vi.fn(() => ({ ... })),
   }));
   ```

4. **Test Error Cases**
   - Don't just test happy paths
   - Verify error handling works correctly

5. **Keep Tests Isolated**
   - Use `beforeEach(() => vi.clearAllMocks())`
   - Don't rely on test execution order

### Mocking Strategy

See `tests/setup.ts` for global mocks:
- localStorage is mocked globally
- Console methods are mocked to reduce noise
- Clear all mocks before each test

For API tests, mock the AI SDK:
```typescript
vi.mock("ai", () => ({ ... }));
vi.mock("@ai-sdk/openai", () => ({ ... }));
```

---

## End of File

For more detailed testing documentation, see `tests/README.md`.
For user-facing documentation, see `README.md`.
