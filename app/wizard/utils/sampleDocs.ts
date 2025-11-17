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
Which prompt should I generate first (or should I start by producing the design assets from Prompt 1)?`
};
