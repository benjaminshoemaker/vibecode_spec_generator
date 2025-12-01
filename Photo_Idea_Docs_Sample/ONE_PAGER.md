# Photo Captioner — One‑Pager

Purpose
-------
A lightweight mobile app that generates engaging captions for photos to help casual social sharers craft on‑point, shareable text quickly. The MVP focuses on speed, simplicity, and high‑quality caption suggestions that users can copy and paste into their preferred social apps.

Problem
-------
Social media users often struggle to find short, engaging captions for photos. They want quick, creative text without spending time thinking of the right tone or wording. This leads to friction and lost opportunities to post consistently.

Target audience
---------------
- Primary: Casual social sharers — everyday users who post photos on social platforms (friends, family, lifestyle posts).
- Goals: Post frequently with minimal friction, make photos more engaging, sound natural/fun without effort.
- Skill level: Non‑technical, expects simple, fast mobile experiences.
- Platforms they post to: Instagram, Facebook, TikTok, Snapchat, Twitter/X — but the app itself is a mobile companion (iOS/Android) used to generate copy that users paste into these apps.

Ideal customer profile
----------------------
- Age 16–45, frequent smartphone photo takers
- Posts several times a week, seeks quick social polish
- Values speed and simplicity over advanced customization
- Willing to use a small companion app to improve captions

Value proposition
-----------------
Deliver three high‑quality, tone‑matched caption suggestions for any photo in seconds so casual users can compose and post with less friction and more confidence.

Platform
--------
- Native mobile app: iOS and Android (single codebase options like React Native or Flutter are acceptable for faster delivery; native Swift/Kotlin for best performance).
- Backend service for caption generation (model inference + moderation), with optional on‑device capabilities for privacy/offline later.

Core user flow (MVP)
--------------------
1. Open app (no account required for MVP; optional opt‑in).
2. Upload photo / take new photo (camera + photo library).
3. Select tone from presets: Funny, Heartfelt, Witty.
4. Tap "Generate" → show progress / spinner.
5. Display three caption suggestions (each clearly labeled with tone and a copy button).
6. User taps "Copy" on chosen caption (clipboard + toast confirmation).
7. Optionally: quick "Share" icon to open the chosen social app (deep linking) — considered for Phase 2.

Screens & micro‑interactions
----------------------------
- Launch / Home: camera and upload buttons, tone selector.
- Generator / Result: thumbnail of the photo, list of 3 caption cards (text, copy button, small “like”/save icon for future phases).
- Loading state: progress indicator, friendly message.
- Error state: helpful retry message (e.g., "We couldn't generate captions for this image. Try another photo.")
- Permissions: camera & photos permissions prompts with clear rationale.

MVP feature list (required)
---------------------------
- Photo upload (camera + gallery).
- Caption generation: produce 3 suggestions per photo.
- Tone presets: funny, heartfelt, witty.
- Copy button to copy caption to clipboard.
- Lightweight UX: fast feedback and minimal friction.
- Basic safety filtering (block explicit / illegal content).

Out of scope for MVP (but recommended for roadmap)
--------------------------------------------------
- Account/sign‑in (optional history, favorites).
- Hashtag and emoji suggestions.
- Platform specific length presets.
- Advanced editing UI or multi‑caption templates.
- On‑device full model inference (future privacy option).

Outputs & constraints
---------------------
- Exactly 3 caption suggestions per photo.
- Each caption labeled implicitly by tone or labeled generically (tone selector affects all suggestions).
- Aim for generation latency < 3–5 seconds (server inference target).

Data & privacy
--------------
- Default: do not store images or captions longer than required for inference.
- Transient image upload with short TTL; delete within X hours (configurable).
- Explicit opt‑in for history/favorites if accounts are introduced.
- Provide clear privacy copy during onboarding (what's uploaded, how it's used).
- Comply with GDPR/CCPA requirements for user data deletion and export.

Safety & moderation
-------------------
- Content moderation pipeline to block/flag:
  - Hate speech, explicit sexual content, violence, illegal activity.
  - Sensitive persons/face recognition concerns.
- Image safety model to detect restricted content before captioning.
- Rate limits and filters to reduce abuse.

Technical architecture (high level)
-----------------------------------
- Mobile clients (iOS/Android)
  - Simple UI, photo picker/camera, tone selector, network calls, clipboard support.
- Backend API service
  - Inference endpoint that accepts image + tone, returns 3 captions.
  - Moderation endpoint that checks images/text.
  - Authless for MVP but design to support authenticated calls.
- ML stack options
  - Vision + caption generation approach:
    - Off‑the‑shelf image captioning models (BLIP-2, OFA, ViT + decoder) to produce initial text embeddings / captions.
    - LLM (server-side) for style/tone refinement (prompt-based) or end‑to‑end multimodal model if available (e.g., multimodal LLMs).
  - Option A (MVP, fastest): server-side inference with a pre-trained image captioning model + lightweight prompt engineering to yield three variants in requested tones.
  - Option B (privacy/offline later): smaller on‑device models (quantized) for basic captioning; fallback to cloud for higher quality.
- Infrastructure
  - Containerized inference workers (K8s, autoscaling).
  - CDN for static assets, object storage for transient images.
  - Monitoring, logging, and metrics pipeline.

Integration & APIs
------------------
- Clipboard API on mobile for copy action.
- Optional deep links / share sheet integration to open social apps.
- Backend: REST/JSON endpoints for generate/moderate.
- Analytics: event tracking for generate, copy, retry, errors.

Performance & reliability targets
---------------------------------
- Typical end‑to‑end latency: < 3–5s on 4G/Wi‑Fi.
- 99% availability during core hours; graceful degradation (client‑side cached messages) if backend is unavailable.
- Reasonable cost per inference (optimize batching, model size).

Metrics & success criteria
--------------------------
Initial KPIs (first 90 days after launch)
- Conversion: % of users who generate at least one caption per session.
- Engagement: average captions generated per user / week.
- Copy rate: % of generated captions that are copied.
- Retention: 7‑day and 30‑day retention for active users.
- Latency + error rates: average generation time, % failed generations.
- Qualitative: user feedback rating on caption helpfulness (in‑app NPS/quick thumbs up/down).

Risks & mitigations
-------------------
- Low relevance/quality of captions → iterate on prompts/models, collect anonymous feedback, A/B test tones and model variants.
- Privacy concerns about image uploads → minimize storage, clear messaging, offline mode later.
- Safety exposure (biased/inappropriate captions) → strong moderation, human review of flagged cases, model filters.
- Cost of inference at scale → use model distillation, caching, and batching; tune quality/latency tradeoffs.

Roadmap (high level)
--------------------
Phase 1 — MVP (8–12 weeks)
- Core mobile UI, photo upload, tone selector, backend endpoints.
- Server-side caption generation pipeline returning 3 suggestions.
- Basic moderation and logging.
- Analytics and simple telemetry.
Phase 2 — Improvements (12–24 weeks)
- Improve quality with larger models / prompt refinement.
- Add save history, favorites, simple account option.
- Add sharing integrations (deep links / share sheet).
- A/B testing framework for tones and copy variants.
Phase 3 — Privacy & Scale (ongoing)
- On‑device capability for offline/private captioning.
- Advanced personalization and hashtag/emoji suggestions.
- Monetization experiments (premium features, coins, or subscriptions).

Team & dependencies
-------------------
- Product manager / designer for UX flows and copy.
- Mobile engineers (iOS + Android or cross‑platform).
- ML engineer(s) for model selection, prompts, and inference pipeline.
- Backend engineer(s) for API, infra, storage, and ops.
- QA & moderation resources.
- Legal / privacy advisor for compliance.

Next steps (immediate)
----------------------
1. Validate assumptions with a 1‑week research spike: prototype prompt pipeline using sample images and candidate captioning models; measure quality and latency.
2. Design mockups for core screens (upload → tone → results → copy).
3. Build a technical proof of concept (one backend inference endpoint + simple Android/iOS client).
4. Run small closed beta with internal users to gather quality and UX feedback.

Appendix: Minimal API contract (example)
---------------------------------------
- POST /generate
  - Body: { image: base64 | presignedUrl, tone: "funny"|"heartfelt"|"witty", options: {num_suggestions:3} }
  - Response: { suggestions: [{ id, text, safety_flags }], processing_time_ms }
- POST /moderate
  - Body: { image, text }
  - Response: { safe: boolean, issues: [] }

Assumptions
-----------
- Users prefer copying to clipboard over deep sharing for MVP.
- Three suggestions per photo is a sweet spot for choice without overwhelm.
- Casual users will prioritize speed and simplicity over deep customization.

Contact / Ownership
-------------------
Product owner: [TBD]  
Lead engineering: [TBD]  
ML lead: [TBD]

End of one‑pager — ready for review with product & engineering leadership.