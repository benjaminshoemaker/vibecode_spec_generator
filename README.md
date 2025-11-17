# Multi-Step Wizard Application

A Next.js application with a multi-step wizard interface that uses AI to gather requirements through chat and generate documents at each step.

## Features

- **Step 1 (One-Pager)**: Fully functional - Interactive chat to gather app requirements and generate a one-pager document
- **Steps 2-4**: Placeholder structure ready for implementation
  - Step 2: Dev Spec
  - Step 3: Checklist
  - Step 4: Agents.md

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vercel AI SDK** for AI integration
- **Anthropic Claude API** for chat and document generation
- **Zustand** for state management with localStorage persistence
- **React Markdown** for document rendering

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key (get one at https://console.anthropic.com/)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (or edit the existing one):

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Replace `your_anthropic_api_key_here` with your actual Anthropic API key.

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### Step 1: One-Pager Workflow

1. **Start Chat**: Enter your app idea in the chat interface
2. **Answer Questions**: The AI assistant will ask clarifying questions one at a time
3. **Generate Document**: Once you've provided enough information, click "Generate One-Pager"
4. **Review**: Review the generated markdown document
5. **Regenerate** (optional): Click "Regenerate" if you want to create a new version
6. **Approve**: Click "Approve Draft & Save" to complete the step
7. **Next Step**: The "Next" button will enable, allowing you to proceed to Step 2

### Navigation

- Use the **Previous/Next** buttons at the bottom to navigate between steps
- Click on completed step indicators at the top to jump to that step
- Use **Reset Wizard** to start over

### Data Persistence

Your progress is automatically saved to localStorage. You can:
- Refresh the page without losing data
- Close and reopen your browser
- Continue where you left off

## Project Structure

```
wizard-app/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Streaming chat API endpoint
│   │   └── generate-doc/
│   │       └── route.ts          # Document generation endpoint
│   ├── wizard/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx      # Chat UI with streaming
│   │   │   ├── DocumentPreview.tsx    # Markdown document viewer
│   │   │   └── WizardStep.tsx         # Step orchestrator
│   │   ├── steps/
│   │   │   ├── step1-config.ts        # Fully functional config
│   │   │   ├── step2-config.ts        # Placeholder
│   │   │   ├── step3-config.ts        # Placeholder
│   │   │   └── step4-config.ts        # Placeholder
│   │   └── page.tsx              # Main wizard page
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to wizard)
│   ├── store.ts                  # Zustand store with persistence
│   └── types.ts                  # TypeScript interfaces
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Example environment file
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Architecture

### State Management

The application uses Zustand with localStorage persistence. State structure:

```typescript
{
  currentStep: number,
  steps: {
    onePager: {
      chatHistory: Message[],
      generatedDoc: string | null,
      approved: boolean
    },
    devSpec: { /* same structure */ },
    checklist: { /* same structure */ },
    agentsMd: { /* same structure */ }
  }
}
```

### Step Configuration

Each step is configured with:
- `stepNumber`: Step position in the wizard
- `stepName`: Display name
- `userInstructions`: Instructions shown to the user
- `systemPrompt`: AI assistant's behavior prompt
- `generateButtonText`: Text for the generate button
- `approveButtonText`: Text for the approve button
- `documentInputs`: Array of previous step documents to include as context

## Implementing Additional Steps

To implement Steps 2-4:

1. Open the corresponding config file (e.g., `step2-config.ts`)
2. Replace `[TO BE DEFINED]` with appropriate values:
   - `userInstructions`: What should the user do?
   - `systemPrompt`: How should the AI assistant behave?
3. The component will automatically work with the new configuration

Example for Step 2:

```typescript
export const step2Config: StepConfig = {
  stepNumber: 2,
  stepName: "Dev Spec",
  userInstructions: "Based on your one-pager, let's create a detailed development specification. The assistant will help you define technical requirements.",
  systemPrompt: "You are helping create a development specification. Ask questions about technical stack, architecture, database design, API structure, and implementation details. Reference the one-pager to stay aligned with the product vision.",
  generateButtonText: "Generate Dev Spec",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["onePager"],
};
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### API Key Issues

If you get authentication errors:
1. Verify your `.env.local` file exists
2. Check that `ANTHROPIC_API_KEY` is set correctly
3. Restart the development server after changing environment variables

### Build Errors

If you encounter TypeScript errors:
```bash
npm run build
```

This will show detailed error messages.

### Streaming Not Working

If chat messages don't stream:
1. Check browser console for errors
2. Verify the API route is accessible at `/api/chat`
3. Ensure your API key has sufficient credits

## Contributing

To extend this application:

1. **Add New Steps**: Create new step configs in `app/wizard/steps/`
2. **Customize UI**: Modify components in `app/wizard/components/`
3. **Change AI Model**: Update the model in API routes (currently using `claude-3-5-sonnet-20241022`)
4. **Add Features**: The state structure supports additional fields per step

## License

MIT
