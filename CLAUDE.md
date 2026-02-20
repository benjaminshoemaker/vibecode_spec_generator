# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build (TypeScript check + cleanup)
npm run lint         # ESLint check
npm test             # Run all tests once
npm run test:watch   # Watch mode
npm run test:ui      # Visual test UI
npm run test:coverage
```

Run a single test file:
```bash
npx vitest run tests/unit/store.test.ts
```

## Environment Setup

```bash
cp .env.example .env.local
```

Provider is selected via `AI_PROVIDER` (`openai` | `local` | `openrouter`, default: `openai`). The shared helper `app/utils/ai-provider.ts` exports `getModel(modelName)` and `getOptionsModel()` — all three API routes use these instead of calling `openai()` directly.

Key env vars per provider:

| Provider | Required | Model name var |
|---|---|---|
| `openai` | `OPENAI_API_KEY` | `OPENAI_MODEL` (default: `gpt-4o`) |
| `local` | `LOCAL_AI_BASE_URL` | `OPENAI_MODEL` (e.g. `llama3.2:latest`) |
| `openrouter` | `OPENROUTER_API_KEY` | `OPENAI_MODEL` (e.g. `openai/gpt-4o`) |

Options generation (`/api/generate-options`) uses structured output (JSON schema) and can use a separate provider via `OPTIONS_PROVIDER` + dedicated model vars `OPENAI_OPTIONS_MODEL`, `LOCAL_OPTIONS_MODEL`, `OPENROUTER_OPTIONS_MODEL`. See `.env.example` for recommended models.

## Architecture

**Vibe Scaffold** is a 4-step wizard that uses AI chat to gather product requirements and synthesize them into technical specification documents.

### Three-Phase Pattern (per step)
Each of the 4 steps follows: **Chat → Generation → Approval**
1. User chats with AI to gather requirements (`/api/chat` — streaming)
2. AI synthesizes chat into a markdown document (`/api/generate-doc` — streaming)
3. User reviews and approves to unlock the next step

### State Management
Zustand store with localStorage persistence (key: `wizard-storage`). Each step stores `chatHistory`, `generatedDoc`, and `approved`. The step key mapping (`stepKeyMap` in `app/wizard/page.tsx:18`) connects step numbers to state keys: `["onePager", "devSpec", "checklist", "agentsMd"]`.

**Changing state structure requires updating in sync:** `app/types.ts` → `app/store.ts` → `app/wizard/page.tsx` (`stepKeyMap`).

### Document Context Flow
Step configs declare `documentInputs` — the keys of previous steps whose generated docs are passed as context. Step 1 has none; Step 4 receives all three prior docs. This is the mechanism for coherent, context-aware generation across steps.

### Step Configuration
`app/wizard/steps/step{1-4}-config.ts` is the source of truth for AI behavior. Each config defines `systemPrompt` (chat behavior), `generationPrompt` (document generation), `documentInputs` (context from prior steps), and UI text. Modify step AI behavior here only — no component changes needed.

### Custom Streaming (No `useChat` Hook)
`ChatInterface.tsx` manually fetches `/api/chat` and reads the stream via `TextDecoder`, appending chunks to the assistant message. The `@ai-sdk/react` `useChat` hook is intentionally not used (version compatibility issue). Both API routes use **Edge Runtime** — no Node.js APIs allowed.

### API Routes
All routes in `app/api/` use Edge Runtime (`export const runtime = "edge"`):
- `/api/chat` — `streamText()` for chat
- `/api/generate-doc` — streaming document generation with previous-doc context
- Other routes: analytics/logging, email subscription, license validation

## Testing

Framework: Vitest 4.0.10 + @testing-library/react + happy-dom. Global mocks (localStorage, console) in `tests/setup.ts`.

Mock pattern for API route tests:
```typescript
vi.mock("ai", () => ({ streamText: vi.fn(() => ({ ... })) }));
vi.mock("@/app/utils/ai-provider", () => ({
  getModel: vi.fn(() => ({})),
  getOptionsModel: vi.fn(() => ({})),
}));
```

Run `npm test` before committing. All tests must pass.

## Critical Constraints

- **Never change** the localStorage key `wizard-storage` — breaks all user data
- **No Node.js APIs** in `app/api/` routes (Edge Runtime only)
- **File naming**: downloaded docs use `stepName.toUpperCase().replace(/\s+/g, '_') + '.md'` (e.g., `ONE_PAGER.md`)
- **Adding/removing steps** requires updating `stepKeyMap`, `WizardState["steps"]` in `types.ts`, and `initialStepData` in `store.ts`
- **Sample doc loading** (LOAD_SAMPLES button) is only visible in `NODE_ENV=development`

For detailed architecture, common modification patterns, and agent guardrails, see `AGENTS.md`.
