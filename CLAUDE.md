# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-step wizard application built with Next.js 14+ that uses AI-powered chat to gather requirements and generate documents at each step. Currently, Step 1 (One-Pager) is fully functional, with Steps 2-4 (Dev Spec, Checklist, Agents.md) implemented as placeholder configurations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (requires ANTHROPIC_API_KEY in .env.local)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Setup

The application requires an Anthropic API key:

1. Copy `.env.example` to `.env.local`
2. Set `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart dev server after changing environment variables

## Architecture Overview

### Three-Phase Workflow Per Step

Each wizard step follows this pattern:

1. **Chat Phase**: User converses with AI assistant via streaming chat
2. **Generation Phase**: System generates markdown document from chat history
3. **Approval Phase**: User reviews, can regenerate, then approves to unlock next step

### State Management

**Global State** (`app/store.ts`):
- Uses Zustand with localStorage persistence (key: `wizard-storage`)
- State persists across page refreshes and browser sessions
- Contains `currentStep` and `steps` object with 4 step keys: `onePager`, `devSpec`, `checklist`, `agentsMd`

**Step State Structure** (`app/types.ts`):
```typescript
StepData {
  chatHistory: Message[]      // All chat messages for this step
  generatedDoc: string | null // Generated markdown document
  approved: boolean           // Whether step is complete
}
```

**Critical State Mapping**:
- `app/wizard/page.tsx` line 18: `stepKeyMap` maps step numbers (1-4) to step keys
- Navigation is disabled until current step is approved
- Step configs are imported and stored in `stepConfigs` array (line 11)

### Component Hierarchy

```
WizardPage (app/wizard/page.tsx)
├── Progress indicator (shows 1-4 steps)
├── WizardStep component (per-step orchestrator)
│   ├── ChatInterface (before document generation)
│   │   └── Custom streaming implementation (not using @ai-sdk/react hooks)
│   └── DocumentPreview (after generation)
│       └── ReactMarkdown renderer
└── Navigation buttons (Previous/Next)
```

### API Routes

**`/api/chat` (Edge Runtime)**:
- Accepts `{ messages, systemPrompt }`
- Uses Vercel AI SDK `streamText()` with Claude Sonnet 3.5
- Returns text stream response
- System prompt controls AI behavior per step

**`/api/generate-doc` (Edge Runtime)**:
- Accepts `{ chatHistory, stepName, documentInputs }`
- `documentInputs` contains previously generated documents for context (e.g., Step 2 receives Step 1's doc)
- Uses `generateText()` (non-streaming) to create markdown document
- Returns JSON with `{ document: string }`

### Chat Implementation Details

`ChatInterface` (`app/wizard/components/ChatInterface.tsx`) implements manual streaming:
- Does NOT use `@ai-sdk/react`'s `useChat` hook
- Manually fetches from `/api/chat` and reads stream chunks
- Parses text stream format: looks for lines starting with `0:`
- Updates message state incrementally as chunks arrive
- This approach was necessary due to SDK version compatibility

## Adding New Steps

To implement Steps 2-4 (currently placeholders):

1. **Edit step config** in `app/wizard/steps/stepN-config.ts`:
   - `userInstructions`: Tell user what to discuss with assistant
   - `systemPrompt`: Define AI assistant's role and questioning strategy
   - `documentInputs`: Array of previous step keys (e.g., `["onePager"]` for Step 2)

2. **Example**:
```typescript
export const step2Config: StepConfig = {
  stepNumber: 2,
  stepName: "Dev Spec",
  userInstructions: "Discuss technical requirements with the assistant...",
  systemPrompt: "You are creating a development specification. Ask about...",
  generateButtonText: "Generate Dev Spec",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["onePager"], // Will receive Step 1's document as context
};
```

3. **No component changes needed** - `WizardStep` component handles all steps generically

## Key Technical Constraints

- **Edge Runtime**: Both API routes use Edge Runtime (not Node.js)
- **Model**: Currently hardcoded to `claude-3-5-sonnet-20241022` in both API routes
- **Tailwind v3**: Using Tailwind CSS v3.4, not v4 (due to PostCSS plugin compatibility)
- **Step Count**: Adding/removing steps requires updating:
  - `stepKeyMap` in `app/wizard/page.tsx`
  - `steps` object type in `app/types.ts`
  - `initialStepData` structure in `app/store.ts`

## State Debugging

To inspect wizard state:
1. Open browser DevTools → Application → Local Storage
2. Look for key `wizard-storage`
3. Value is JSON with current wizard state

To reset state:
- Click "Reset Wizard" button in UI
- Or delete `wizard-storage` from localStorage
