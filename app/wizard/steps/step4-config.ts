import { StepConfig } from "@/app/types";

export const step4Config: StepConfig = {
  stepNumber: 4,
  stepName: "AGENTS",
  userInstructions:
    "Using all the documents we've created (one-pager, developer spec, and prompt plan), the Assistant will help you create an AGENTS.md file. This AGENTS.md file will help your AI coding agents stick to the plan, track their progress and follow Test-Driven Development.",
  systemPrompt: `On this step, we're going to generate an AGENTS.md file. The user will now optionally provide some new details about what they want to be in that file. Note them, provide feedback, and wait for them to move on to the prompt plan stage. If they don't know how to do that, guide them to click on 'Generate AGENTS.md'`,
  generateButtonText: "Generate AGENTS.md",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["devSpec"], // References all previous steps
  initialGreeting: "For this step, I don't need any new information. If you have any tweaks or changes you'd like to make or suggest, feel free to provide them now. When you're ready, click 'Generate AGENTS.md'",
  generationPrompt: `Using the information in the prompt_plan & spec attached here, write a minimal AGENTS.md file to include in the repository so that agents like Codex & Claude Code can interact well. Make sure it includes a description of what each file is (prompt_plan.md, spec.md, idea.md, idea_one_pager.md), as well as what will live in /designs/. Include the following section verbatim:

## Repository docs
- 'idea_one_pager.md' — Captures Problem, Audience, Platform, Core Flow, MVP Features; Non‑Goals optional. 
- 'dev_spec.md' — Minimal functional and technical specification consistent with prior docs, including a concise **Definition of Done**. 
- 'prompt_plan.md' — Agent‑Ready Planner with per‑step prompts, expected artifacts, tests, rollback notes, idempotency notes, and a TODO checklist using Markdown checkboxes. This file drives the agent workflow.  
- 'AGENTS.md' — This file. 

**UI Implementation Guidance:**
- **Always access files in '/designs/' and its subfolders whenever doing any UI changes or additions.**
- Follow the designs contained in that folder as a guide for layout, styling, components, and user experience.
- Reference specific design files when implementing UI features to ensure consistency with the intended design.

### Agent responsibility
- After completing any coding, refactor, or test step, **immediately update the corresponding TODO checklist item in 'prompt_plan.md'**.  
- Use the same Markdown checkbox format ('- [x]') to mark completion.  
- When creating new tasks or subtasks, add them directly under the appropriate section anchor in 'prompt_plan.md'.  
- Always commit changes to 'prompt_plan.md' alongside the code and tests that fulfill them.  
- Do not consider work “done” until the matching checklist item is checked and all related tests are green.
- When a stage (plan step) is complete with green tests, update the README “Release notes” section with any user-facing impact (or explicitly state “No user-facing changes” if applicable).
- Even when automated coverage exists, always suggest a feasible manual test path so the human can exercise the feature end-to-end.
- After a plan step is finished, document its completion state with a short checklist. Include: step name & number, test results, 'prompt_plan.md' status, manual checks performed (mark as complete only after the human confirms they ran to their satisfaction), release notes status, and an inline commit summary string the human can copy & paste.

#### Guardrails for agents
- Make the smallest change that passes tests and improves the code.
- Do not introduce new public APIs without updating 'spec.md' and relevant tests.
- Do not duplicate templates or files to work around issues. Fix the original.
- If a file cannot be opened or content is missing, say so explicitly and stop. Do not guess.
- Respect privacy and logging policy: do not log secrets, prompts, completions, or PII.

#### Deferred-work notation
- When a task is intentionally paused, keep its checkbox unchecked and prepend '(Deferred)' to the TODO label in 'prompt_plan.md', followed by a short reason.  
- Apply the same '(Deferred)' tag to every downstream checklist item that depends on the paused work.
- Remove the tag only after the work resumes; this keeps the outstanding scope visible without implying completion.




#### When the prompt plan is fully satisfied
- Once every Definition of Done task in 'prompt_plan.md' is either checked off or explicitly marked '(Deferred)', the plan is considered **complete**.  
- After that point, you no longer need to update prompt-plan TODOs or reference 'prompt_plan.md', 'spec.md', 'idea_one_pager.md', or other upstream docs to justify changes.  
- All other guardrails, testing requirements, and agent responsibilities in this file continue to apply unchanged.


---

## Testing policy (non‑negotiable)
- Tests **MUST** cover the functionality being implemented.
- **NEVER** ignore the output of the system or the tests — logs and messages often contain **CRITICAL** information.
- **TEST OUTPUT MUST BE PRISTINE TO PASS.**
- If logs are **supposed** to contain errors, capture and test it.
- **NO EXCEPTIONS POLICY:** Under no circumstances should you mark any test type as "not applicable". Every project, regardless of size or complexity, **MUST** have unit tests, integration tests, **AND** end‑to‑end tests. If you believe a test type doesn't apply, you need the human to say exactly **"I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME"**.

### TDD (how we work)
- Write tests **before** implementation.
- Only write enough code to make the failing test pass.
- Refactor continuously while keeping tests green.

**TDD cycle**
1. Write a failing test that defines a desired function or improvement.  
2. Run the test to confirm it fails as expected.  
3. Write minimal code to make the test pass.  
4. Run the test to confirm success.  
5. Refactor while keeping tests green.  
6. Repeat for each new feature or bugfix.

---

## Important checks
- **NEVER** disable functionality to hide a failure. Fix root cause.  
- **NEVER** create duplicate templates or files. Fix the original.  
- **NEVER** claim something is “working” when any functionality is disabled or broken.  
- If you can’t open a file or access something requested, say so. Do not assume contents.  
- **ALWAYS** identify and fix the root cause of template or compilation errors.  
- If git is initialized, ensure a '.gitignore' exists and contains at least:
  
  .env
  .env.local
  .env.*
  
  Ask the human whether additional patterns should be added, and suggest any that you think are important given the project. 

## When to ask for human input
Ask the human if any of the following is true:
- A test type appears “not applicable”. Use the exact phrase request: **"I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME"**.  
- Required anchors conflict or are missing from upstream docs.  
- You need new environment variables or secrets.  
- An external dependency or major architectural change is required.
- Design files are missing, unsupported or oversized
`,
};
