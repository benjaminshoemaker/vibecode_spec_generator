# AGENTS.md

Purpose
- This file orients automated agents (Codex, Claude Code, CI bots) and human contributors to the repository's workflow, important docs, and agent responsibilities.  
- Keep this file minimal, actionable, and authoritative for agent-driven work.

Quick usage
- Read prompt_plan.md first — it drives the agent workflow.
- Update the TODO checklist in prompt_plan.md after any code/refactor/test step.
- Run tests locally and in CI; do TDD: write failing tests first.

Repository files (what they are)
- prompt_plan.md
  - Agent‑Ready Planner with per‑step prompts, expected artifacts, tests, rollback notes, idempotency notes, and a TODO checklist using Markdown checkboxes.
  - This file is the single source of truth for step-level progress; agents must update checklist items as they complete tasks.
- spec.md
  - Concise developer specification and API contract (functional + technical requirements) — maps to DEV_SPEC.md in the repository docs section.
  - Includes Definition of Done criteria that drive acceptance and testing.
- idea.md
  - Raw notes and brainstorming captured during discovery. Use for context only; not authoritative for implementation decisions unless referenced in prompt_plan.md or spec.md.
- idea_one_pager.md (aka ONE_PAGER.md)
  - Short, human‑readable summary covering Problem, Audience, Platform, Core Flow, MVP Features, and optional Non‑Goals.
  - Useful for clarifying scope to stakeholders and agents.

What lives in /designs/
- High‑fidelity and low‑fidelity design assets that the implementation should follow or reference:
  - Figma links (short human-readable URL or file id) and an export manifest (designs/manifest.md).
  - PNG/SVG/FBX exports used by the client or marketing (exported_to/png/, exported_to/svg/).
  - Wireframes and flow diagrams (PDF or PNG).
  - README in /designs/ explaining which files are canonical and any licensing notes.
- Naming conventions:
  - designs/<screen>-v1.{fig,svg,png,pdf}
  - designs/exports/<screen>-<platform>-v1.png
- If designs are missing or too large for agent processing, agents must ask for human input.

Include the following section verbatim (do not modify)
## Repository docs
- 'ONE_PAGER.md' — Captures Problem, Audience, Platform, Core Flow, MVP Features; Non‑Goals optional. 
- 'DEV_SPEC.md' — Minimal functional and technical specification consistent with prior docs, including a concise **Definition of Done**. 
- 'PROMPT_PLAN.md' — Agent‑Ready Planner with per‑step prompts, expected artifacts, tests, rollback notes, idempotency notes, and a TODO checklist using Markdown checkboxes. This file drives the agent workflow.  
- 'AGENTS.md' — This file. 

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

End of verbatim section

Agent workflow checklist (minimal)
- Read prompt_plan.md → identify first unchecked step.
- Create a small branch named: work/<step-number>-short-description
- TDD: add failing tests for the required behavior.
- Implement minimal code to pass tests.
- Run full test suite locally.
- Update prompt_plan.md checklist for the completed item (mark - [x]).
- Commit changes with concise message: "<step-number>: <short description> — tests green"
- Push branch and open PR (if required by repo policies).

Commit & PR conventions
- Commit message format: <step-number>: <scope> — <short summary>
  - Example: "3.1: generate-api — add validation for objectPath; tests green"
- Include related prompt_plan.md update in the same commit.
- If tests fail in CI, do not merge. Fix tests in the PR.

If something is missing or cannot be read
- Stop and ask the human. Do not proceed with guesses.
- Example prompts to the human:
  - "I cannot open prompt_plan.md — please upload or confirm path."
  - "spec.md is missing the Definition of Done for step 2 — please clarify."

Contact / escalation
- When blocked on missing secrets, design files, or unclear acceptance criteria, raise an issue labeled "agent-blocker" and ping a human reviewer.

Appendix: minimal / design & docs checklist
- Ensure these files exist at repository root:
  - ONE_PAGER.md (or idea_one_pager.md)
  - DEV_SPEC.md (or spec.md)
  - PROMPT_PLAN.md (or prompt_plan.md)
  - AGENTS.md (this file)
  - README.md with release notes section
- Ensure /designs/ contains a README and a manifest listing canonical files.

---

That's it — AGENTS.md should be small, authoritative, and machine-actionable. If you want, I can generate a starter prompt_plan.md template or a CI job that enforces the checklist updates and hooks into PRs. Would you like that next?

<!-- Generated with vibescaffold.dev -->
