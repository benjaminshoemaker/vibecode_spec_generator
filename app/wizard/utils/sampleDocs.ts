// Sample documents for quick testing and development
export const sampleDocs = {
  onePager: `# One-Pager — Parent Time Tracking App

Date: 2025-11-17
Prepared for: Product & Engineering Leadership

---

## Executive Summary
A mobile-first app that enables parents to reliably track time spent with their children. The product solves problems around measuring quality/quantity of parenting time (bonding, custody tracking, work/life balance), providing sharable, auditable logs and insights. The initial focus is a lightweight, trustworthy MVP that supports manual and scheduled timers, child profiles, co-parent sharing, and exportable reports; later phases add automation (location/geofence/wearable detection), calendar and court-ready integrations, and richer analytics.

---

## Problem Statement
Parents need an accurate, low-friction way to log parenting time for:
- Improving bonding and self-awareness of time spent with each child.
- Managing and demonstrating custody or visitation time (shared custody situations).
- Balancing work and family commitments and tracking progress toward goals.
Current options (manual notes, calendar photos, spreadsheets) are fragmented, error-prone, not shareable/portable, and provide poor visibility.

---

## Target Audience & Ideal Customer
Primary audience
- Parents in shared custody or co-parenting arrangements who must log hours for agreements or court.
- Working parents who want to monitor and improve their time investment with children.

Ideal customer profile (ICP)
- Age 25–45, tech-savvy, smartphone user.
- Recently separated/divorced or co-parenting and needs a reliable log.
- Willing to invite co-parent or use an app to formalize time logs.
- Motivated to quantify and improve family time and/or produce records for legal or administrative needs.

Secondary audiences
- Nannies/daycare providers logging hours for parents.
- Family counselors/coaches tracking parent-child interaction.
- Employers offering family-support benefits.

---

## Value Proposition
For parents who need accurate, shareable, and private logs of parenting time, this app provides a simple, secure way to track, visualize, and export time with children. It replaces ad-hoc spreadsheets and calendars with a dedicated workflow optimized for sharing and auditability while preserving privacy.

---

## Platform & Tech Recommendations
Platform
- Mobile-first: iOS and Android native or cross-platform (React Native / Flutter) for rapid cross-device parity.
- Companion Web app for reports, admin, legal exports.
- Backend APIs and a secure cloud-hosted datastore.

Suggested stack (MVP)
- Mobile: React Native (TypeScript) OR native Swift (iOS) + Kotlin (Android) if deeper platform features needed.
- Backend: Node.js / TypeScript (Express/Nest) or serverless (AWS Lambda) API.
- Auth: AWS Cognito or Auth0 (email/phone + social optional, 2FA).
- DB: PostgreSQL for relational needs (users, children, entries) + Redis caching.
- Storage: S3 (secure attachments).
- Notifications: APNs and FCM.
- Analytics: Segment/Amplitude, crash reporting via Sentry.
- Optional: HealthKit, Google Fit, Core Location geofencing APIs for advanced tracking.

Security & compliance
- End-to-end encryption for sensitive fields (notes, attachments).
- Data at rest and in transit encrypted (TLS + server-side encryption).
- Compliance considerations: GDPR, CCPA. Minimize retention; parental consent model.
- Legal: Clarify admissibility of exports; include disclaimers and optional attestation workflows.

---

## High-Level Product Scope & Flows

Core Use Cases (MVP)
1. Onboarding & Profiles
   - Create account (email/phone), add children (name, DOB, optional photo).
   - Invite co-parent via email/SMS with role/permission (view/edit).
2. Start/Stop Timer (Manual)
   - Quick-access Start/Stop button per child or grouped session.
   - Option to tag session (in-person, virtual, travel), add notes.
   - Background timer continues if app closed (mobile OS constraints).
3. Scheduled Sessions
   - Create recurring session templates (e.g., every Mon 6–8pm).
   - Auto-start notifications or auto-start if user enables automation.
4. Edit & Approve Entries
   - Manual edits to start/end times, notes, tags.
   - Co-parent confirmation/acknowledgement flow (optional) for joint logs.
5. Reports & Export
   - Weekly/monthly summaries, hourly totals per child, time-of-day heatmaps.
   - Export CSV/PDF (court-friendly format) and print/share.
6. Sharing & Permissions
   - Share view-only or edit access with co-parent, guardians, attorneys.
   - Data sharing controls and audit trail of exports/edits.
7. Notifications & Reminders
   - Remind to start/stop scheduled sessions; weekly summaries.
8. Basic Settings & Privacy
   - Data retention controls, account deletion, export all data.

Advanced (post-MVP)
- Location-based auto-detection (geofence) for start/stop.
- Wearable proximity detection (Bluetooth beacon, Family device).
- Calendar sync (fetch events from calendars for cross-checking).
- E-signature or verified logs for court admissibility.
- Multi-child simultaneous timers and aggregated family view.
- Smart suggestions / AI-generated highlights (e.g., "You spent 40% more time with Alex this month").
- Enterprise / employer integrations.

Detailed Flows (examples)
- Onboarding flow: Sign up → Add primary parent profile → Add child(ren) → Invite co-parent → Quick tutorial (timer, reports).
- Start session flow: Select child(s) or family → Tap Start → Timer running (persistent notification) → Tap Stop → Optional note + save → Instant update to shared logs.
- Sharing flow: Invite co-parent → accepts via link → chooses permissions → shared logs sync → co-parent can confirm/flag entries.
- Export flow: Select date range → choose format (CSV/PDF) → include signatures/confirmations → generate & download/securely share.

---

## Data Model (high level)
- User: id, name, email, phone, role, settings, auth credentials
- Child: id, parent_id(s), name, dob, photo, tags
- TimeEntry: id, child_id(s), user_id (creator), start_ts, end_ts, duration, type, tags, notes, location_meta, attachment_refs, confirmed_by
- SessionTemplate: recurring schedules, default tags
- AuditLog: entry_id, action, user_id, timestamp, previous_values
- Shares/Permissions: resource_id, user_id, permission_level
- Exports: id, user_id, timestamp, content_ref, recipients

---

## MVP Requirements (must-haves)
Product
- User accounts (email/phone + auth)
- Child profile creation
- Manual timer start/stop per child
- Edit entries and basic tags/notes
- Invite & share with co-parent (view/edit)
- Reports: weekly/monthly totals
- Export CSV/PDF
- Secure backend + basic data privacy settings
- Push notifications and background timer handling

Engineering
- Mobile app (iOS + Android) or cross-platform build
- Backend API for CRUD and auth, scalable DB
- Task queue for exports, PDF generation
- Push notification service & background capabilities
- Unit & integration tests, CI/CD pipeline

Non-functional
- Data encryption, role-based access control
- High reliability for timers and offline support with conflict resolution
- Localization support (start with English, later add locales)

---

## Success Metrics (KPIs)
- Activation: % users who start a first timer within 48 hours
- Engagement: DAU/MAU, average weekly tracked hours per user
- Retention: 7-day and 30-day retention rates
- Sharing adoption: % of accounts with an invited co-parent
- Export usage: number/percentage of users generating PDF/CSV exports
- Conversion: % of users upgrading to premium (if freemium)
- NPS / user satisfaction scores

Success criteria for MVP
- 20%+ weekly active rate within first cohort
- At least 40% of users invite a co-parent within first month
- Exports used by at least 10% of active users in first 3 months

---

## Privacy, Legal & Risk Considerations
- Ownership: parents own their data; explicit consent before sharing.
- Sensitive data: children's data is sensitive — minimize retention and encrypt.
- Legal admissibility: provide stable export formats and audit trails but include disclaimers; consider enterprise legal integrations and notarization/attestation as premium.
- Child protection laws: as data pertains to minors, ensure server-side controls and avoid targeting minors directly; COPPA generally applies to collecting information from children under 13 — since data is collected by parents about their children, consult legal counsel.
- Abuse / forging logs: include audit trails, co-parent confirmations, optional digital attestation to increase credibility.
- Location tracking: obtain explicit consent; allow granular opt-outs; avoid continuous high-precision tracking by default.

---

## Monetization Strategy
- Freemium model
  - Free tier: single child, manual timers, basic reports, exports limited (e.g., 3 per month).
  - Premium subscription (monthly/annual): unlimited children, unlimited exports, advanced reports, scheduled sessions, automations (geofence/wearable), priority support.
- Enterprise/B2B: partner with family law firms, therapists, or employers offering employee family benefits.
- Additional revenue: one-off fees for certified (notarized) export packages.

---

## Roadmap & High-Level Timeline (example)
Phase 0 — Discovery & Design (2–4 weeks)
- Finalize requirements, compliance research, prototype UX flows.

Phase 1 — MVP (12–16 weeks)
- Core mobile app + backend, manual timers, child profiles, sharing, exports, basic analytics.
- QA, beta release with small user group.

Phase 2 — Stabilize & Grow (8–12 weeks)
- Improve retention features: notifications, recurring sessions, improved UI/UX.
- Add web report portal, better error handling, localization.

Phase 3 — Automation & Legal Features (3–6 months)
- Geo-fencing, calendar + wearable integrations, attestation/e-signature, advanced export formats for court.

Team (recommended for MVP)
- 1 PM / Product Owner
- 1 UX/UI Designer
- 2 Mobile Engineers (React Native or 1 iOS + 1 Android)
- 1 Backend Engineer
- 1 QA Engineer
- 1 DevOps/Infra (shared)
- Legal/Privacy consultant (part-time)
- Growth/Marketing (part-time)

Estimated engineering effort: 3–4 FTEs over 3–4 months for a robust MVP.

---

## Trade-offs & Key Technical Decisions
- Cross-platform vs native: RN/Flutter speeds time to market; native gives better background & OS-level integration reliability (geofencing, background timers).
- Auto-tracking: adds convenience but increases battery usage, privacy risk, false positives, and legal complexity. Recommend opt-in as post-MVP.
- Storage: structured relational DB for entries + object storage for attachments. Choose PostgreSQL for ACID guarantees (auditability) over NoSQL.
- E-signature/notary solutions: third-party integrations (DocuSign, HelloSign) vs built-in attestation. Third-party reduces legal overhead.

---

## Open Questions / Decisions Needed
- Legal position: will the product aim to make logs legally "verified"? If yes, define requirements for attestation.
- Monetization: confirm freemium caps and premium feature list.
- Platform priority: simultaneous iOS + Android or staggered launch?
- Data retention policy: default retention period, archival, and deletion standards.
- International launches: which countries/legal systems to support first?

---

## Next Steps (action items for leadership)
1. Align on product priorities: manual-first vs auto-tracking roadmap and legal certification goals.
2. Approve tech stack and resource allocation for MVP team.
3. Engage legal/privacy counsel to finalize compliance approach (COPPA/GDPR/CCPA & admissibility).
4. Kick off Discovery phase: detailed UX flows, wireframes, and engineering spike for background timers and sharing flows.
5. Prepare go/no-go criteria for MVP launch (KPIs and timeline).

---

If useful, I can:
- Produce a one-page UI wireframe and key screens for onboarding, timer, and reports.
- Draft user stories and acceptance criteria for the MVP backlog.
- Create a sample data schema (DDL) and API contract for engineering to start implementation.

Which of those would you like next?`,

  devSpec: `# Parent Time Tracking — Developer Specification (Markdown)

Date: 2025-11-17
Target audience: Engineers, Tech Lead, Mobile & Backend Developers, QA

This document translates the product one‑pager and earlier design decisions into a developer-ready specification for the MVP. It assumes React Native (TypeScript, bare workflow) for mobile and an AWS serverless backend (Node.js/TypeScript Lambdas + API Gateway) with Postgres (Aurora Serverless v2 or RDS) and Auth0 for authentication. It contains requirements, architecture, data model, API contracts, infra guidance, error handling, security, testing plan and an implementation roadmap so engineers can begin immediately.

[Full dev spec content would continue here - truncated for brevity as it's very long]

If you want, next steps I can deliver immediately:
- OpenAPI spec (YAML) for the endpoints above
- Full DB migration files (SQL) using your chosen migrations tool
- CDK skeleton in TypeScript with basic infra: Lambda, API Gateway, RDS, S3, SQS
- RN project scaffold with Auth0 login & local SQLite schema
Which of these should I produce next?`,

  promptPlan: `# Prompt Plan — Parent Time Tracking App (MVP)
Date: 2025-11-17

Purpose
- Provide a staged, test-driven, implementable blueprint and a sequence of LLM prompts that will generate code and artifacts to build the Parent Time Tracking MVP described in the onePager and devSpec.

[Full prompt plan content would continue here - truncated for brevity as it's very long]

If you want I can:
- Produce the first LLM invocation outputs for Prompt 2 (monorepo scaffold) now as a concrete code artifact.
- Or produce the OpenAPI spec from Prompt 6 next.
Which prompt should I generate first (or should I start by producing the design assets from Prompt 1)?`,

  agentsMd: `# AGENTS.md

Purpose
- This file orients automated agents (Codex, Claude Code, etc.) to the repo structure, primary planning/spec docs, and the expectations for automated work.
- Keep this file minimal, readable, and authoritative. If something here conflicts with upstream docs, stop and ask a human.

Key files (short descriptions)
- prompt_plan.md — Agent‑Ready planner that drives the automated workflow. It contains per-step prompts, expected artifacts, tests, rollback notes, idempotency notes, and a TODO checklist using Markdown checkboxes. Agents must update this file as tasks are completed.
- spec.md — A concise functional and technical specification for the project (may be a short spec). If the repo uses a developer-focused spec, it might be named dev_spec.md; see below.
- dev_spec.md — Developer specification translating product decisions into implementation-ready details: architecture, API contracts, data model, infra notes, testing plan, and a Definition of Done. If present, treat this as the canonical developer spec.
- idea.md — Informal notes, brainstorming, or longer-form idea dump. Useful for context but not authoritative for implementation.
- idea_one_pager.md — One-page product summary capturing Problem, Audience, Platform, Core Flow, MVP features and optional Non‑Goals. Use this to validate product intent before coding.
- /designs/ — Source of truth for UI implementation (see section below).

Repository docs
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
- Do not consider work "done" until the matching checklist item is checked and all related tests are green.
- When a stage (plan step) is complete with green tests, update the README "Release notes" section with any user-facing impact (or explicitly state "No user-facing changes" if applicable).
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
- **NEVER** claim something is "working" when any functionality is disabled or broken.
- If you can't open a file or access something requested, say so. Do not assume contents.
- **ALWAYS** identify and fix the root cause of template or compilation errors.
- If git is initialized, ensure a '.gitignore' exists and contains at least:

  .env
  .env.local
  .env.*

  Ask the human whether additional patterns should be added, and suggest any that you think are important given the project.

## When to ask for human input
Ask the human if any of the following is true:
- A test type appears "not applicable". Use the exact phrase request: **"I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME"**.
- Required anchors conflict or are missing from upstream docs.
- You need new environment variables or secrets.
- An external dependency or major architectural change is required.
- Design files are missing, unsupported or oversized

Minimal agent workflow (how to proceed)
1. Read prompt_plan.md and idea_one_pager.md before writing code. If files are missing, stop and ask.
2. Create failing tests that define the required behavior (unit, integration, E2E).
3. Implement minimal code to satisfy tests.
4. Run full test suite locally; fix until green.
5. Update prompt_plan.md checklist entries and commit code + tests + prompt_plan.md together.
6. Push branch with a short, descriptive name and a single-line commit summary. Example:
   - Branch: feat/<short-description>
   - Commit: feat: implement <short-description> — tests green
7. Open a PR and include:
   - Summary of change and linked prompt_plan step.
   - Short manual test path for a human to verify end-to-end.
   - Any relevant design file references from /designs/.
   - If there are user-visible changes, update README release notes.

What belongs in /designs/
- Source design files (Figma, Sketch exports, Adobe files) and an index README.md describing file ownership and usage.
- Exported assets used by the app (SVGs, optimized PNGs, icon sets) organized by resolution and purpose.
- Style tokens and design system artifacts (colors, typographic scales, spacing, component specs).
- Interaction and flow diagrams (screens, overlays, modals) and screenshots demonstrating expected states.
- Component-level specs (naming, states, spacing) and any code snippets for implementation.
- A manifest (designs/README.md) that maps features/screens to design files and contains any special instructions (e.g., responsive variants).
- If designs are missing or incomplete, agents must stop and ask the human before implementing UI.

Commit and branching conventions (minimal)
- Branch names: feat/, fix/, chore/, test/ prefixes, e.g. feat/auth-login.
- Commit message prefix should match branch type and be concise. Include "— tests green" when all tests pass locally.
- Always include the prompt_plan.md checklist update in the same commit that implements the task.

Failure handling and errors
- If tests fail after your change: fix the root cause. Do not suppress tests.
- If a design file referenced in a task is missing, explicitly report the missing file and halt.
- If a required doc (prompt_plan.md, dev_spec.md/ spec.md, idea_one_pager.md) cannot be opened, say so and stop.

If you need to pause work
- Mark the relevant TODO in prompt_plan.md with '(Deferred)' and a short reason.
- Mark all dependent checklist items as '(Deferred)' too.

Contact / escalation
- If the agent needs clarification or permission (e.g., skip tests), quote the exact phrase required by policy and ask the human.
- For pull requests, include a human reviewer tag in the PR description.

Quick checklist for agents before any PR
- [ ] prompt_plan.md updated for the completed step
- [ ] Tests added/updated and passing locally
- [ ] README/release notes updated if user-facing
- [ ] Design file references included for UI changes
- [ ] Commit and branch follow conventions

End of file.`
};
