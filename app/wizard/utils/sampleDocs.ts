// Sample documents for quick testing and development
export const sampleDocs = {
  onePager: `# Photo Captioner — One‑Pager

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

End of one‑pager — ready for review with product & engineering leadership.`,

  devSpec: `# Photo Captioner — Developer Specification (MVP)

Status: Final (approved decisions incorporated)  
Target audience: Mobile + Backend engineers ready to implement

Table of contents
1. Summary & goals
2. High-level architecture
3. Non-functional requirements & constraints
4. Data & privacy handling
5. Backend design & orchestration flow
6. API contract (endpoints, schemas, errors)
7. Prompt design & OpenAI interaction
8. Moderation & safety pipeline
9. Image handling rules
10. Authentication, authorization & abuse prevention
11. Rate limiting design (per-user)
12. Storage, lifecycle & retention
13. Admin & moderation tooling
14. Logging, analytics & monitoring
15. CI/CD, deployment & infra configuration
16. Dev stack, libraries & repo structure
17. Error handling & client UX mapping
18. Testing plan (unit, integration, e2e, load, security)
19. Implementation milestones & acceptance criteria
20. Appendices: env vars, sample prompts, sample error payloads, Redis key patterns

---

1) Summary & goals
- Purpose: Build an MVP mobile app (Expo React Native + TypeScript) that returns exactly 3 caption suggestions per photo in a selected tone (funny / heartfelt / witty).
- MVP constraints and decisions:
  - Mobile: React Native (Expo) + TypeScript.
  - Backend: Node.js (18+) + TypeScript + Fastify (recommended).
  - Inference: OpenAI gpt-5-nano (multimodal).
  - Image moderation: Google Cloud Vision SafeSearch.
  - Text moderation: OpenAI Moderation endpoint.
  - Auth: Firebase Authentication — passwordless email (magic link).
  - Storage: Google Cloud Storage (transient uploads, 6-hour TTL).
  - Host backend: Google Cloud Run (containerized).
  - Rate limiting: per-user burst limits using Redis (Cloud Memorystore).
  - No image->text fallback pipeline; if model multimodal call fails, return error to client.
  - No persistent history/favorites for MVP (deferred).
  - Emojis allowed sparsely; hashtags not included.
- Target latency: typical end-to-end < 3–5 seconds.

---

2) High-level architecture
- Mobile client (Expo React Native)
  - Photo picker / camera; compress & downscale (<=2MB preferred; enforce <=5MB).
  - Get presigned upload URL, PUT image to GCS, call /generate.
  - Show spinner → display 3 suggestions.
  - Firebase Auth integration (magic link).
  - Firebase Analytics + Crashlytics (or Sentry fallback).
- Backend (Cloud Run, single container service)
  - Endpoints: /presign-upload, /generate, /health, admin endpoints (protected).
  - Services invoked: Google Cloud Storage, Google Vision (SafeSearch), OpenAI (gpt-5-nano + Moderation), Firebase Admin (verify tokens), Redis (rate-limits), Cloud Logging / BigQuery.
- GCS lifecycle: delete uploaded images after TTL = 6 hours.
- Firestore: used for admin flagged events collection and admin whitelist (small set) — no user history.
- Admin: Firebase Console for manual review + Cloud Run admin endpoints to manage whitelist/ban.

Sequence (short)
1. Client requests /presign-upload with Firebase ID token.
2. Backend returns presigned PUT URL and objectPath.
3. Client uploads image directly to GCS.
4. Client calls /generate with objectPath + tone + Firebase ID token.
5. Backend checks rate limit; downloads object (or reads from GCS), strips EXIF, validates size/format; runs Vision SafeSearch.
6. If safe, call OpenAI gpt-5-nano (image + prompt) to request JSON with three caption suggestions.
7. Parse JSON (1 retry allowed on parse failure). Run OpenAI Moderation on each caption, regenerate flagged captions once if flagged.
8. Return up to 3 safe captions. If fewer than 3 safe captions, return explanation and status.
9. Log events to Cloud Logging and write flagged events to Firestore for admin review.

---

3) Non-functional requirements & constraints
- Availability: target 99% during core hours.
- Latency: median < 3s; 95th percentile < 5s for generation.
- Cost control: require sign-in; burst & concurrency limits (no daily cap).
- Security: no public access to presigned URLs; verify Firebase tokens server-side; use Workload Identity/Secret Manager for secrets.
- Privacy: images ephemeral (6-hour TTL), strip EXIF/geo metadata before any external calls.

---

4) Data & privacy handling
- Images:
  - Allowed formats: JPEG, PNG, HEIC (reject animated GIFs).
  - Client compress to <= 2 MB when possible; backend enforces <= 5 MB.
  - Downscale longest side ≤ 1024 px (client preferred; server fallback via sharp).
  - Strip EXIF/geo metadata server-side before any storage or external transfer.
  - Store in GCS with lifecycle rule: delete after 6 hours.
- Captions:
  - Do not store caption text unless user explicitly opts in to history (deferred for MVP — none).
  - Server logs may contain caption hashes (SHA256) and safety flags. Do not log raw image bytes to analytics.
- Auth data:
  - Use Firebase ID token on requests; store minimal metadata (uid) if needed in Firestore for admin actions.

Compliance:
- Support account deletion and data export (no history stored for MVP reduces obligations). If storing flagged events, include a retention policy.

---

5) Backend orchestration flow (detailed)
- /presign-upload
  - Authenticate via Firebase ID token.
  - Validate contentType and filename.
  - Generate presigned PUT URL for GCS with TTL 15 minutes. Return objectPath.
  - Response includes maxUploadBytes = 5_242_880 (5 MB).
- /generate (main orchestration)
  1. Verify Firebase ID token -> get uid.
  2. Rate-limit check (Redis) for uid: ensure not exceeding burst (5 per 60s) and concurrency (1).
     - If concurrency limit hit: return 429 with Retry-After.
  3. Validate objectPath: must reference your bucket and must exist.
  4. Fetch object metadata from GCS. If content type unsupported or size >5MB -> 400.
  5. Download object to memory/temporary file, run sharp:
     - Strip EXIF.
     - If dimensions > 1024 px longest side, downscale (resize).
     - Re-encode as JPEG if needed.
  6. Call Google Vision SafeSearch on the processed image.
     - If flagged above thresholds -> return 422 { code: "image_flagged", userMessage: "We can’t create captions for this image. Try a different photo." }.
     - Write a moderation_flags record to Firestore for flagged events.
  7. Build OpenAI gpt-5-nano prompt (system + user) including the presigned image URL (objectPath signed URL or GCS URL accessible by OpenAI).
     - Note: generate a short-lived signed URL specifically for OpenAI fetch if needed; ensure it expires quickly (e.g., 5 minutes). Alternatively base64-embed small image if supported and within size limits (not preferred).
  8. Call OpenAI image-enabled gpt-5-nano with model parameters:
     - temperature: 0.6
     - max_tokens: 300
     - require valid JSON output per schema
  9. Parse JSON. If parse fails:
     - Retry once: add a short follow-up prompt asking model to output valid JSON only.
     - If still fails -> return 500 with code "model_error" and userMessage "We couldn’t generate captions for this photo right now. Please try again."
  10. Run OpenAI Moderation API on each suggestion text.
     - If a caption is flagged, attempt 1 regeneration for that caption with system instruction to be safe and avoid flagged content.
     - If still flagged, drop/redact that suggestion.
  11. If number of safe captions < 3:
     - Return the safe captions + field explanation (why fewer).
     - Optionally include status 'partial' and log event for admin review.
  12. Return 200 with suggestions array (exactly as many safe captions) and processing_time_ms.
  13. Decrement concurrency marker in Redis.
- Errors: map to appropriate HTTP status codes and user-friendly messages (see Error handling section).

Timeouts & retries:
- External calls: Vision (timeout 3s), OpenAI call (timeout 8s). Adjust timeouts per observed latency.
- Retries: network-level transient errors -> exponential backoff with max 2 retries; parse/regeneration retries as above.

---

6) API contract (MVP endpoints)

Common:
- All endpoints that act on user or start inference require Authorization: Bearer <Firebase ID token>.
- Response content-type: application/json
- All responses should include request_id in headers (X-Request-ID) for tracing.

1) POST /presign-upload
- Auth: required
- Request body:
  {
    "filename": "string",        // client-provided
    "contentType": "image/jpeg"  // must be one of image/jpeg, image/png, image/heic
  }
- Response 200:
  {
    "uploadUrl": "https://storage.googleapis.com/....", // presigned PUT URL
    "objectPath": "gs://bucket-name/path/to/object.jpg", // canonical path used bygenerate
    "expiresAt": "2025-01-01T00:00:00Z",
    "maxUploadBytes": 5242880
  }
- Errors:
  - 400: invalid contentType/filename
  - 401: invalid/expired token
  - 429: rate-limited (rare)

2) POST /generate
- Auth: required
- Request body:
  {
    "objectPath": "gs://bucket-name/path/to/object.jpg",
    "tone": "funny" | "heartfelt" | "witty"
  }
- Success 200:
  {
    "suggestions": [
      {
        "id": "uuid-v4",
        "text": "Short caption text…",
        "length_bucket": "short" | "medium" | "long",
        "safety_flags": [] // array of strings, empty if none
      },
      ...
      // up to 3 items
    ],
    "model": "gpt-5-nano",
    "processing_time_ms": 1234,
    "status": "ok"
  }
- Partial success 200 (fewer than 3 safe captions):
  {
    "suggestions": [ ... ],
    "model": "gpt-5-nano",
    "processing_time_ms": 2345,
    "status": "partial",
    "explanation": "1 caption removed because it violated content rules"
  }
- Error responses:
  - 400: invalid params
  - 401: invalid/expired token
  - 403: user banned/forbidden
  - 422: image failed safety checks (error body includes code=image_flagged)
  - 429: rate limit (with Retry-After header; body code=rate_limited)
  - 500: internal server error (code=model_error/server_error)
- Error body schema:
  {
    "error": {
      "code": "image_flagged" | "rate_limited" | "model_error" | "server_error" | "auth_error",
      "userMessage": "string",
      "retryAfterSeconds": number | null
    }
  }

3) GET /health
- No auth required (or lightweight token)
- Response:
  {
    "status": "ok",
    "deps": {
      "openai": true,
      "vision": true,
      "storage": true,
      "redis": true
    }
  }

4) Admin endpoints (protected via GCP IAM or admin keyed service account; accessible only by the admin service account)
- POST /admin/whitelist
  - Body: { "uid": "firebase-uid", "action": "add" | "remove" }
- GET /admin/flags?limit=50
  - Returns flagged moderation events from Firestore.

Note: Admin endpoints should be accessible only to the single admin service account (configured in IAM) or via a signed header checked by backend.

---

7) Prompt design & OpenAI interaction
- Model: gpt-5-nano (image-capable)
- Model settings:
  - temperature: 0.6
  - max_tokens: 300
  - n: 1
  - stop: none (use JSON enforcement)
- Response format: Strict JSON (validate server-side). Allowed one parse retry.
- System message (example):
  You are Captioner, a concise caption writer. RULES: 1) Output valid JSON ONLY matching the provided schema. 2) NEVER identify or speculate about people's identities, ages, or locations. 3) DO NOT include hashtags. 4) Emojis allowed sparsely. 5) Provide exactly three captions with length buckets short/medium/long. 6) Keep language appropriate and safe. If unable to follow rules, return an empty suggestions array and a short explanation.
- User message (example):
  "Image: <signed_image_url>
   Tone: funny
   Requirements: Return a JSON object with field 'suggestions' — an array of 3 objects, each with id (uuid), text (string), length_bucket ('short' | 'medium' | 'long'), safety_flags (array of strings, can be empty). Short <= 70 chars, Medium 71-140, Long 141-280. No hashtags, minimal emojis allowed. JSON only. Do not include any commentary outside JSON."
- Server-side enforcement:
  - Validate JSON schema, length buckets.
  - If any item violates length rule, attempt one regeneration for that specific caption.
  - On parse failure, retry once with a follow-up instructing to "Fix your JSON and return only the JSON."
- Sample JSON schema (server-side validation):
  {
    "suggestions": [
      {
        "id": "uuid-v4",
        "text": "string",
        "length_bucket": "short" | "medium" | "long",
        "safety_flags": ["sexual","violence"] // optional; backend ignores and enforces own moderation
      }
    ],
    "explanation": "string (optional)"
  }

Notes:
- Include the exact signed image URL in the prompt. Create a signed URL with limited TTL for OpenAI to fetch.
- If OpenAI account/region doesn't permit image URLs, call returns error and we will return model_error to client (no fallback).

---

8) Moderation & safety pipeline (image + text)
- Image SafeSearch (Google Vision):
  - Fields checked: adult, violence, racy, spoof.
  - Thresholds (configurable):
    - Reject if any of [adult, violent, racy] is POSSIBLE or above.
    - Tune threshold in config (e.g., REJECT_LIKELIHOOD = POSSIBLE).
  - If rejected: create Firestore moderation_flags doc, return 422 image_flagged.
- Text moderation (OpenAI Moderation):
  - After captions generated, call moderation endpoint for each caption text.
  - If moderation flagged:
    - Attempt one regeneration for that caption (with stricter system message: "Avoid sexual content, hate, violence, illegal content").
    - If still flagged: remove that caption.
  - Log moderation flags to Firestore (admin review).
- Human-in-the-loop:
  - All flagged events are written to a Firestore collection moderation_flags: { request_id, uid, objectPath, flags, captions, timestamp }.
  - Admin (service account) examines Firestore via Firebase Console for appeals/whitelisting/bans.
- Safety logging:
  - Do not store raw images in moderation_flags; store objectPath and small thumbnail (if user opted in to save images — but for MVP history is disabled, so don't store thumbnails).
  - Store minimal metadata for review.

---

9) Image handling rules (client & server)
- Client-side:
  - Allowed formats: .jpeg/.jpg, .png, .heic.
  - Max file size: client should try to compress ≤ 2 MB prior to upload.
  - Downscale if longer side > 1024 px.
  - Show upload progress and friendly permission prompts.
- Server-side:
  - Enforce contentType & max size 5MB.
  - If format unsupported or size >5MB => 400 error.
  - Use sharp to strip EXIF and downscale to ≤ 1024 px if needed.
  - Re-encode to JPEG to standardize before Vision & sending to OpenAI (helps avoid HEIC edge cases).
- Reject animated GIFs.
- Security: remove any geolocation metadata.

---

10) Authentication, authorization & abuse prevention
- Auth: Firebase Auth (passwordless email sign-in / magic link).
  - Client uses Firebase SDK to sign-in; obtains ID token, sends Authorization: Bearer <id_token> to backend.
  - Backend verifies with Firebase Admin SDK.
- Auth flow server-side:
  - Verify token on every request that consumes quota or sensitive operations.
  - Extract uid for rate-limit keys.
- Admin:
  - Single admin service account configured with IAM access to Firestore and Cloud Run.
  - Admin endpoints accessible only to that account (restrict via IAM and server-side checks).
- Abuse prevention:
  - No anonymous access — sign-in required.
  - Rate limiting (see next section).
  - Global protection: Cloud Run concurrency & autoscale limits, Cloud Monitoring alerts for excess usage.
- Secret management:
  - Use Secret Manager for OpenAI API key and any other secrets. Grant Cloud Run service account access via IAM.
  - Avoid storing secrets in code or repo.

---

11) Rate limiting & concurrency (per-user rules)
- User-level limits (Option A selected):
  - Burst: max 5 generate requests per 60 seconds per uid.
  - Concurrency: only 1 in-flight /generate per uid. If a user attempts a second concurrent generate, return 429 with Retry-After (recommended 60s).
  - No sustained daily cap.
- Implementation details (Redis / Cloud Memorystore):
  - Use token-bucket or leaky bucket algorithm. Simpler approach: use Redis INCR with TTL.
  - Keys:
    - bucket_count:{uid}
      - INCR on each generate; set EXPIRE 60s on first create. If > 5 -> reject.
    - inflight:{uid}
      - SETNX key with short TTL (e.g., 300s) at request start. If key exists -> return 429 concurrency.
      - Delete key near request completion. Use Lua script or ensure atomicity.
  - Global QPS safeguard: in addition to per-user rules, maintain a global counter to avoid system overload.
- Admin whitelisting:
  - The single admin service account may add uids to a Firestore collection whitelist_uids allowing them to bypass sustained limits (no daily limits exist) — in MVP this is optional and used for beta testers.
- Rate-limit response:
  - HTTP 429, include Retry-After header and JSON body:
    { "error": { "code": "rate_limited", "userMessage": "You’re generating captions too quickly. Try again in a minute.", "retryAfterSeconds": 60 } }

---

12) Storage, lifecycle & retention
- GCS bucket for uploads:
  - Bucket: photos-uploads-{project}
  - ACL: private
  - Lifecycle: delete objects older than 6 hours.
  - Signed URLs for PUT (upload) expire in 15 minutes; signed URLs for OpenAI fetch expire in 5 minutes.
- Firestore:
  - Collections:
    - moderation_flags (store flagged events)
    - admin_whitelist (optional)
  - Read/write patterns small-scale for MVP.
- Logs & analytics:
  - Cloud Logging (structured JSON) + export to BigQuery for analysis and KPI dashboards.
  - Avoid storing raw images or caption text in analytics; use hashed values if needed.

---

13) Admin & moderation tooling
- Minimal admin workflow:
  - Use Firebase Console to view Firestore moderation_flags collection.
  - Provide small Cloud Run admin endpoints for:
    - GET /admin/flags (query Firestore)
    - POST /admin/ban (add uid to banned collection)
    - POST /admin/whitelist
  - Secure admin endpoints to admin service account via IAM or require an admin header (x-admin-key) stored in Secret Manager and only provided to admin account.
- Admin data stored in Firestore only; retention policy: keep flagged events for 90 days (configurable).
- No custom admin UI in MVP — use Firebase Console.

---

14) Logging, analytics & monitoring
- Client:
  - Firebase Analytics events:
    - app_open
    - auth_sign_in / auth_sign_out
    - generate_request (tone, success/failure, latency_bucket)
    - copy_caption (length_bucket, index)
    - generate_error (error_code)
    - photo_upload_start / photo_upload_complete (size_bytes)
  - Crash reporting: Firebase Crashlytics; Sentry as fallback for JS-only errors if Crashlytics not available with Expo.
- Server:
  - Cloud Logging structured logs include:
    - request_id, uid, objectPath hash, tone, latencies, openai_response_time, vision_response, moderation_flags.
  - Export important logs to BigQuery daily.
  - Metrics & alerts:
    - Monitor OpenAI error rate > 1% -> alert.
    - Monitor high cost/excess usage -> alert.
    - Monitor Cloud Run CPU/memory and request latency -> alert.
- Sensitive data:
  - Never log raw images or full caption texts to analytics.
  - For debugging, store caption text in a separate protected Firestore collection only if absolutely necessary and only for short retention with admin-only access.

---

15) CI/CD, deployment & infra configuration
- Repo & main branches:
  - main (production), develop (staging), feature/* for PRs.
- Backend CI/CD (GitHub Actions):
  - PR build: run lint, typecheck, unit tests.
  - On merge to develop: build Docker image, push to Artifact Registry, deploy to Cloud Run staging with image tag.
  - On merge to main: build & push, deploy to Cloud Run production.
  - Use Workload Identity Federation or GCP service account via GitHub Secrets for authentication.
- Mobile CI/CD:
  - Expo + EAS builds via GitHub Actions.
  - On develop: produce internal builds and upload to TestFlight / Play Internal.
  - On main: produce release candidates.
- IaC:
  - Provide Terraform scripts (recommended) for:
    - Cloud Run service (container, memory, concurrency default 10).
    - GCS bucket with lifecycle rule.
    - Cloud Memorystore Redis instance.
    - Firestore setup.
    - IAM roles for service accounts (Cloud Run SA, admin SA).
- Cloud Run recommended settings:
  - Concurrency: 10 (tune based on experiment).
  - Request timeout: 60s (but target < 10s for generate).
  - Min instances: 0 (development), set to >0 in production if cold start impact unacceptable.
- Secrets:
  - Store OpenAI keys, admin keys, and Firebase service account in Secret Manager.

---

16) Dev stack, libraries & repo structure
- Backend stack:
  - Node.js 18+, TypeScript
  - Fastify (or Express)
  - @google-cloud/storage
  - @google-cloud/vision
  - firebase-admin
  - openai official Node SDK
  - sharp (image processing)
  - ioredis (Redis client)
  - pino/winston for logging
  - jest + supertest for unit/integration tests
- Mobile stack:
  - Expo + React Native + TypeScript
  - expo-image-picker or react-native-image-crop-picker
  - expo-file-system for temp files/compression
  - expo-firebase-auth or react-native-firebase for Firebase Auth
  - expo-secure-store for storing ID token
  - firebase-analytics SDK
- Example repo layout (backend):
  - src/
    - routes/
      - presign.ts
      - generate.ts
      - admin.ts
    - services/
      - auth.ts (Firebase token verification)
      - storage.ts (presign, fetch)
      - vision.ts (safeSearch)
      - openai.ts (invoke gpt, moderation)
      - rateLimit.ts (redis helpers)
      - imageProc.ts (sharp helpers)
    - lib/
      - validators.ts (schema)
      - logger.ts
    - index.ts
  - Dockerfile
  - tsconfig.json
  - .github/workflows/

---

17) Error handling & client UX mapping
- Backend returns machine-friendly error payloads (see API contract).
- Client mapping (recommended messages):
  - 500 / model_error -> "We couldn’t generate captions for this photo right now. Please try again."
  - 422 / image_flagged -> "We can’t create captions for this image. Try a different photo."
  - 429 / rate_limited -> "You’re generating captions too quickly. Try again in a minute."
  - 401 -> "Please sign in to continue."
- Retry & backoff:
  - Client should allow user to retry manually via Retry button; optionally disable Retry during Retry-After.
- Logging:
  - All error details logged server-side (stack, OpenAI raw responses) with request_id. Do not leak raw internals to the client.

---

18) Testing plan

Unit tests
- For backend functions:
  - validate objectPath parsing, contentType enforcement, image size checks.
  - rate limit functions (simulate Redis).
  - prompt generation helpers produce expected system/user messages.
  - JSON parsing logic & reformatting.
- For mobile:
  - image compress & resizing functions; auth flows mocked.

Integration tests
- Mock OpenAI & Vision APIs to assert workflow:
  - Safe path returns 3 suggestions with length buckets.
  - Vision flags -> 422 returned.
  - OpenAI returns unparsable -> retry path exercised.
  - Moderation flags -> caption regeneration path validated.
- Use test Firebase project & test GCS bucket.

End-to-end tests
- Full flow with staging Cloud Run, staging OpenAI keys:
  - Upload image, call generate, assert response shape and latency < 5s median.
- Manual QA:
  - Test with images across categories (people, scenery, food, low-light).
  - Test PII scenarios (people faces, potential personal info) to confirm model doesn't identify.

Load testing
- Simulate realistic traffic patterns using k6 or Locust:
  - Validate rate limiting works under concurrent users.
  - Validate Cloud Run scaling behavior.
- Monitor OpenAI error rates & costs.

Security & privacy tests
- Confirm EXIF stripped.
- Ensure tokens validated & unverified calls rejected.
- Penetration test around presigned URLs (ensure they expire & are scoped).

Acceptance criteria (MVP)
- End-to-end generation success with 3 captions for 95% of sample images within median < 3s (staging).
- Safety: flagged images are rejected; flagged captions not returned.
- Auth: only signed-in users can call /generate.
- Rate limiting: burst & concurrency enforced.
- No persistent image retention beyond 6 hours.
- Admin can view flagged events in Firestore.

---

19) Implementation milestones & timeline (suggested)
Sprint 0 (1 week) — Spike & POC
- Quick POC: local backend with OpenAI gpt-5-nano image call + sample image -> returns 3 captions JSON.
- Sample Expo client to upload and call POC.
- Measure raw latency.

Sprint 1 (2 weeks) — Core infra & endpoints
- Implement /presign-upload, basic GCS upload integration, Firebase Auth verification.
- Implement /generate orchestration up to Vision SafeSearch and OpenAI call; return raw response.
- Add unit tests for core services.

Sprint 2 (2 weeks) — Moderation & rate limiting
- Add OpenAI Moderation integration and caption filtering/regeneration logic.
- Integrate Redis for rate limiting & concurrency.
- Add Cloud Run deployment CI via GitHub Actions.

Sprint 3 (1–2 weeks) — Client integration & UX
- Build Expo client screens: upload, tone selector, spinner, result cards, copy action.
- Integrate Firebase Auth passwordless.
- Hook up analytics.

Sprint 4 (1 week) — Monitoring, admin & polish
- Add Firestore logging for flagged events, admin endpoints.
- Add Cloud Logging -> BigQuery export.
- Run load tests and fix performance issues.

Sprint 5 (1 week) — QA & release prep
- Run tests, fix discovered issues, produce staging builds, prepare release.

Total MVP estimate: ~6–8 weeks (team dependent).

---

20) Appendices

A) Environment variables (important)
- NODE_ENV=production
- PORT=8080
- PROJECT_ID=gcp-project-id
- GCS_BUCKET=photos-uploads-{project}
- OPENAI_API_KEY=stored_in_secret_manager
- FIREBASE_PROJECT_ID
- FIREBASE_ADMIN_CREDENTIALS=path or use Workload Identity
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (Cloud Memorystore)
- ADMIN_UID (single admin service account uid or email to validate admin routes)
- RATE_LIMIT_BURST=5
- RATE_LIMIT_WINDOW_SECONDS=60
- CONCURRENCY_KEY_TTL_SECONDS=300

B) Redis key patterns & pseudo-logic
- burst key: rate:burst:{uid}
  - INCR -> if first set EXPIRE to RATE_LIMIT_WINDOW_SECONDS
  - If value > RATE_LIMIT_BURST => reject.
- concurrency key: rate:inflight:{uid}
  - SETNX (value=request_id) with TTL CONCURRENCY_KEY_TTL_SECONDS
  - If SETNX fails -> reject concurrency
  - DEL at end of request (ensure DEL in finally block).

C) Sample error payloads
- Rate limit:
  HTTP 429
  {
    "error": {
      "code": "rate_limited",
      "userMessage": "You’re generating captions too quickly. Try again in a minute.",
      "retryAfterSeconds": 60
    }
  }
- Image flagged:
  HTTP 422
  {
    "error": {
      "code": "image_flagged",
      "userMessage": "We can’t create captions for this image. Try a different photo.",
      "retryAfterSeconds": null
    }
  }
- Model error:
  HTTP 500
  {
    "error": {
      "code": "model_error",
      "userMessage": "We couldn’t generate captions for this photo right now. Please try again.",
      "retryAfterSeconds": null
    }
  }

D) Sample prompt (concise)
System:
"You are Captioner. Output valid JSON only. Do not identify people, ages, locations. No hashtags. Emojis OK. Return exactly three captions with fields {id,text,length_bucket,safety_flags}. Short<=70, Medium 71-140, Long 141-280. If you cannot comply, return suggestions:[] and explanation."

User:
"ImageURL: <SIGNED_URL>
Tone: funny
Return JSON only."

E) Security checklist
- Firebase Admin SDK used to validate tokens.
- Cloud Run service account only has least privilege (GCS read on bucket, Vision permission, Secret Manager access).
- Admin endpoints only accessible by admin service account via IAM.
- Secrets in Secret Manager.
- Presigned URLs expire quickly.

F) Acceptance test cases (examples)
- Upload a family photo — ensure model does not identify people (no "This is Alice") and returns 3 captions.
- Upload an explicit/racy image — ensure 422 returned.
- Rapidly submit >5 generates in 60s — ensure 429 after the 5th.
- Call /generate without token — 401 returned.`,

  promptPlan: `Prompt Plan — Photo Captioner (MVP)
==================================

Purpose
-------
This Prompt Plan is a step-by-step, test-driven plan to implement the Photo Captioner MVP described in the provided devSpec. The plan breaks the work into incremental stages and small, verifiable steps. Each step includes a code-generation LLM prompt (text block) that instructs an LLM agent to implement that exact piece of functionality with tests. After each prompt, a todo checklist captures the deliverables and changes the prompt should produce.

Guiding principles
------------------
- TDD-first: every implemented piece must come with unit tests (Jest) and appropriate mocks.
- Small increments: implement one service/route/component at a time so manual verification is easy.
- Integration points mocked in unit tests; integration tests use lightweight local or test doubles.
- No orphaned code: each new file or module is imported/used by the next step so everything is wired up.
- Keep to devSpec requirements: Node 18+, TypeScript, Fastify, Sharp, Firebase Auth verification, GCS presigned uploads, Google Vision SafeSearch, OpenAI gpt-5-nano, Redis rate limiting, Cloud Run/Docker, Expo React Native client.
- Provide manual setup steps where infrastructure is required (GCP, Firebase, Redis, Secret Manager).

How to use this plan
--------------------
- Work prompts in order. Each prompt is executable by a code-generation LLM that writes code and tests.
- Run tests locally after each step. Tests are designed to be fast using mocks.
- For steps that require cloud resources, perform the listed manual setup tasks before running integration tests; unit tests should still run without cloud access using mocks.
- Mark the todo checkboxes after verifying the outputs.

Overall stage breakdown
-----------------------
Stage A — Project and infra scaffolding (repo, packages, infra manual steps)  
Stage B — Core backend primitives & auth (Firebase verification, storage presign)  
Stage C — Media processing & safety (image processing, Vision SafeSearch)  
Stage D — Model orchestration (OpenAI calls, parsing, moderation)  
Stage E — Orchestration endpoint (/generate) with rate limiting and logging  
Stage F — Admin flows & Firestore flagged-events  
Stage G — Client (Expo) + integration testing + CI/CD + deployment

Prompt list
-----------
Each numbered prompt below is a separate code-tagged prompt for a code-generation LLM. After each code block is a todo checklist.

Prompt 0 — Repo scaffolding and toolchain (backend)
---------------------------------------------------
Goal: Create the backend repository skeleton, package.json, TypeScript configs, lint, jest config, basic Fastify server, and an initial test to verify test harness. Provide Dockerfile skeleton and workspace structure consistent with devSpec.

Code-generation prompt:
text
You are to generate the initial backend repository scaffold for the Photo Captioner MVP.

Requirements:
- Language: TypeScript, Node 18+
- Framework: Fastify
- Test runner: Jest (ts-jest)
- Linter: ESLint (TypeScript rules)
- Formatter: Prettier
- Other libs (dev dependencies): supertest, @types/jest, @types/node, nodemon (dev)
- Project structure:
  - src/
    - index.ts (starts Fastify server with /health route)
    - routes/
    - services/
    - lib/
    - config/
  - test/
    - health.test.ts
  - package.json, tsconfig.json, jest.config.js, .eslintrc.js, .prettierrc
  - Dockerfile (base skeleton; final tuning later)
  - .github/workflows/ci.yml (skeleton; final tuning later)

Deliverables:
1) A package.json with scripts:
   - "dev": ts-node-dev src/index.ts
   - "build": tsc
   - "start": node dist/index.js
   - "test": jest --runInBand
   - "lint": eslint src --ext .ts
2) tsconfig.json suitable for Node 18 and ES2022 module target
3) Minimal Fastify server that exposes GET /health returning {status:"ok"} and depends on env PORT with default 8080. When started in dev mode, it should log a single line.
4) Unit test test/health.test.ts that launches the server (in-memory) and asserts /health status and shape.
5) Dockerfile skeleton (multi-stage build; node:18-alpine base; installs dependencies and copies built dist).

Testing:
- Running npm test should run the Jest test and pass.

Write code files in TypeScript and tests, and ensure CI-friendly scripts are present. Use small, clear error handling.

Return: All source files (content) that should be placed into the repo. Also include README.md with next steps.

Be explicit in code comments about TODOs for secret values and infra setup which will come in later prompts.


Todo checklist:
- [ ] Create package.json with scripts and dependencies
- [ ] Add tsconfig.json, jest.config.js, ESLint/Prettier configs
- [ ] Implement src/index.ts with /health route
- [ ] Add test/health.test.ts and ensure npm test passes locally
- [ ] Add Dockerfile skeleton and README.md next steps

Prompt 1 — Manual infrastructure & credentials checklist (manual)
---------------------------------------------------------------
Goal: Provide explicit manual steps to create required cloud resources and secrets so later prompts can assume those exist (or provide mocks). This is a manual setup step; not code-generated.

Manual-setup instructions (to be performed by developer before cloud integration tests):
text
Perform these tasks in your GCP and Firebase console for the project you will use for staging:

1) Firebase
- Create Firebase project (or use an existing one).
- Enable Firebase Authentication (Email/passwordless / magic link). Note project ID.
- Create a service account for backend and download service account JSON (or configure Workload Identity). Keep file safe.
- (Optional) Create a small test user account (email) for manual mobile testing.

2) Google Cloud Storage
- Create a bucket named photos-uploads-{project_id}.
- Configure bucket permissions so only service account has write/read except signed URLs are used.
- Add lifecycle rule: delete objects older than 6 hours.

3) Google Vision API
- Enable Cloud Vision API.
- Ensure backend service account has roles/vision.apiUser or similar.

4) Redis (Cloud Memorystore)
- Create a small Redis instance or plan to run a local Redis for dev.
- Note host, port, and any auth required.

5) Secret Manager
- Store OpenAI API key in Secret Manager (or note it for local .env usage).
- Store Firebase service account (if not using Workload Identity).

6) Firestore
- Set up Firestore in native mode (for moderation_flags and admin_whitelist).

7) OpenAI
- Ensure you have API access and an API key for gpt-5-nano and Moderation endpoints.
- Test a simple curl to verify key works.

6) Locally for dev
- Create a .env.local with:
  - PORT=8080
  - PROJECT_ID=<gcp_project_id>
  - GCS_BUCKET=photos-uploads-<project_id>
  - FIREBASE_ADMIN_CREDENTIALS=/path/to/service-account.json (or set env var for Workload Identity)
  - OPENAI_API_KEY=<openai_key>
  - REDIS_HOST=<host>
  - REDIS_PORT=<port>
  - RATE_LIMIT_BURST=5
  - RATE_LIMIT_WINDOW_SECONDS=60
  - CONCURRENCY_KEY_TTL_SECONDS=300

Notes:
- Do not commit secrets to the repo.
- If you want to avoid cloud costs, you can run local emulators:
  - Use Firebase emulator suite (auth + firestore) for integration tests.
  - Use a local Redis instance for rate-limit tests.
  - Mock OpenAI & Vision using the next-step mocks.


Todo checklist (manual):
- [ ] Create Firebase project and enable Auth
- [ ] Create GCS bucket with lifecycle rule (6 hours)
- [ ] Enable Vision API & give service account access
- [ ] Provision Redis or plan local Redis for dev
- [ ] Store OpenAI key in Secret Manager or local .env
- [ ] Set up Firestore (native mode)
- [ ] Create local .env with required variables for dev

Prompt 2 — Auth service: Firebase token verification
---------------------------------------------------
Goal: Implement auth service module to verify Firebase ID tokens; unit tests mock firebase-admin. Provide middleware for Fastify to verify Authorization header and attach uid to request.

Code-generation prompt:
text
Implement an auth service module and Fastify plugin that verifies Firebase ID tokens.

Requirements:
- Create src/services/auth.ts which exposes:
  - verifyIdToken(idToken: string): Promise<{ uid: string; claims: any }>
  - a Fastify preHandler hook plugin verifyFirebaseAuth that:
    - reads Authorization: Bearer <id_token>
    - calls verifyIdToken
    - on success attaches request.user = { uid, claims }
    - on failure returns 401 with error payload per devSpec error schema
- Use firebase-admin SDK but in tests mock firebase-admin to simulate token verification.
- Add unit tests in test/auth.test.ts covering:
  - valid token -> request proceeds, request.user populated
  - invalid token -> 401 returned

Constraints & behavior:
- The verify method should throw specific errors (AuthError) with code "auth_error" and userMessage suitable for client mapping.
- Provide typed RequestWithUser interface in types file.

Write code and tests. Use ts-jest mocking or jest.mock to mock firebase-admin. Do not require actual GCP/Firebase for tests.

Return the new files and test output (Jest).


Todo checklist:
- [ ] Implement src/services/auth.ts
- [ ] Implement Fastify plugin verifyFirebaseAuth
- [ ] Add types for RequestWithUser
- [ ] Add test/auth.test.ts mocking firebase-admin
- [ ] Ensure npm test passes locally without Firebase credentials

Prompt 3 — Storage service: GCS presign and canonical objectPath
---------------------------------------------------------------
Goal: Implement GCS storage service for presigned uploads: generate presigned PUT URL, return objectPath (gs://...), and enforce content type validation. Provide unit tests with GCS mocked.

Code-generation prompt:
text
Implement the GCS storage service for presigned uploads.

Requirements:
- Create src/services/storage.ts exposing:
  - generateUploadPresign({ filename, contentType, uid }): Promise<{ uploadUrl: string, objectPath: string, expiresAt: string, maxUploadBytes: number }>
  - validateObjectPath(objectPath: string): { bucket: string, name: string } | throw Error
  - getSignedUrlForObjectFetch(objectPath: string, ttlSeconds: number): Promise<string> (used later for OpenAI fetch)
- Use @google-cloud/storage library in implementation but write unit tests that mock the storage client.
- Enforce allowed content types: image/jpeg, image/png, image/heic (error 400 for others).
- Presign TTLs: upload presign 15 minutes; fetch presign for OpenAI 5 minutes.
- MaxUploadBytes constant: 5_242_880 (5MB). Expose from module.

Unit tests:
- Valid filename/contentType -> returns uploadUrl and objectPath (mock storage signed URL).
- Invalid contentType -> throw 400-like error.
- validateObjectPath parses valid gs:// bucket paths and throws on invalid.

Notes:
- Use a deterministic objectPath naming strategy: uploads/{uid}/{timestamp}-{randomSuffix}.{ext}
- Do not upload any bytes now; only presign logic and objectPath generation + tests.
- Ensure code uses Secret/Env variables for bucket name fallback.

Write code and tests; use jest mocks for @google-cloud/storage in tests.


Todo checklist:
- [ ] Implement src/services/storage.ts with generateUploadPresign, validateObjectPath, getSignedUrlForObjectFetch
- [ ] Add constants for allowed content types and maxUploadBytes
- [ ] Add unit tests mocking @google-cloud/storage
- [ ] Ensure tests run without GCP credentials

Prompt 4 — Presign endpoint route and integration test
------------------------------------------------------
Goal: Add Fastify route POST /presign-upload using verifyFirebaseAuth plugin and storage service. Add integration test using Fastify instance and mocked storage service.

Code-generation prompt:
text
Add the /presign-upload route to the Fastify app.

Requirements:
- Endpoint: POST /presign-upload
- Auth: require verifyFirebaseAuth preHandler (from auth plugin)
- Request body schema:
  { filename: string, contentType: string }
- Validate inputs; call storage.generateUploadPresign({filename, contentType, uid})
- Return response per devSpec:
  { uploadUrl, objectPath, expiresAt, maxUploadBytes }
- Error cases:
  - 400 for invalid contentType or filename
  - 401 if auth plugin rejected (auth handled by plugin)
  - 429 (rare) not necessary here

Integration tests:
- Use Fastify in-memory server (import src/index.ts or create a test-only server builder) and supertest to call the route.
- Mock storage.generateUploadPresign to return sample data and assert response shape and status 200.
- Test invalid payload -> 400.

Also:
- Wire route into src/index.ts routes register
- Add route file src/routes/presign.ts with validation and export.

Write route code and tests (jest + supertest). Ensure tests run without external services by mocking storage.


Todo checklist:
- [ ] Implement src/routes/presign.ts
- [ ] Register route in server startup
- [ ] Add integration tests test/presign.test.ts using supertest mocking storage
- [ ] Validate JSON schema and error mapping

Prompt 5 — Image processing service (sharp): strip EXIF, resize, re-encode
--------------------------------------------------------------------------
Goal: Implement image processing utilities that accept a Buffer/stream and return processed JPEG buffer with EXIF removed, longest side <= 1024 px, and recompressed. Provide unit tests using sample images in test/fixtures.

Code-generation prompt:
text
Implement an image processing service using sharp.

Requirements:
- Create src/services/imageProc.ts with:
  - processImageBuffer(input: Buffer): Promise<{ buffer: Buffer, width: number, height: number, format: string }>
    - Behavior:
      - Detect image format (reject animated GIFs)
      - Remove EXIF metadata
      - If longest side > 1024 px, resize to max 1024 preserving aspect ratio
      - Re-encode to JPEG with reasonable quality (e.g., 80)
      - If input size > 5MB -> still process but note that upstream /generate will reject >5MB before processing; still handle gracefully.
- Add helper isAnimated(buffer): Promise<boolean> to detect animated GIFs and reject them.
- Unit tests:
  - Use a few small fixture images (jpeg, png) placed under test/fixtures/ to validate:
    - EXIF removal is performed (can't inspect metadata easily for all images, but ensure no metadata keys returned from sharp.metadata())
    - Resize behavior: use a large fixture with dimensions > 1024 and assert output dims <= 1024 longest side
    - Reject animated gif fixture -> expect thrown error indicating 'animated_gif_not_supported'

Constraints:
- Tests should run locally without network; use local fixture images (small).
- Use jest to run tests.

Write code and tests. Include comments about performance and memory considerations. Throw a custom ImageProcessingError for error cases.


Todo checklist:
- [ ] Implement src/services/imageProc.ts with processImageBuffer and isAnimated
- [ ] Add test fixtures (jpeg, png, large sample, animated gif)
- [ ] Add unit tests test/imageProc.test.ts
- [ ] Ensure tests pass locally

Prompt 6 — Google Vision SafeSearch wrapper (mockable)
-----------------------------------------------------
Goal: Implement Vision service wrapper that accepts image buffer and returns SafeSearchResult. Provide unit tests that mock @google-cloud/vision.

Code-generation prompt:
text
Implement a Vision SafeSearch wrapper.

Requirements:
- Create src/services/vision.ts exposing:
  - safeSearchForImage(buffer: Buffer): Promise<{ adult: Likelihood, violence: Likelihood, racy: Likelihood, spoof: Likelihood }>
    - Likelihood type: "UNKNOWN"|"VERY_UNLIKELY"|"UNLIKELY"|"POSSIBLE"|"LIKELY"|"VERY_LIKELY"
- Implementation should use @google-cloud/vision ImageAnnotatorClient in production, but tests must mock the client.
- Add configurable threshold logic in a checker utility module src/lib/safety.ts:
  - isImageRejected(safeSearch): boolean -> returns true if any of adult, violence, racy >= POSSIBLE (configurable env var)
- Unit tests:
  - Mocked client returning various likelihoods and assert isImageRejected behavior.
  - Unit test safeSearchForImage with mocked @google-cloud/vision client to return a fixture response.

Notes:
- Do not call external API in unit tests (mock).
- Add JSDoc to explain thresholds and how they map to devSpec.


Todo checklist:
- [ ] Implement src/services/vision.ts wrapper
- [ ] Implement src/lib/safety.ts with isImageRejected
- [ ] Add unit tests test/vision.test.ts mocking @google-cloud/vision
- [ ] Ensure tests assert detection and thresholds

Prompt 7 — Rate limiting & concurrency service (Redis) with mocks
----------------------------------------------------------------
Goal: Implement Redis-based rate limiting helper functions (burst counter and inflight key) using ioredis, but ensure unit tests mock Redis or run against a local test Redis. Provide functions used by /generate.

Code-generation prompt:
text
Implement rate-limiting helpers backed by Redis.

Requirements:
- Create src/services/rateLimit.ts exposing:
  - tryAcquireBurst(uid: string): Promise<{ allowed: boolean, remaining: number, retryAfterSeconds?: number }>
    - Uses key rate:burst:{uid}, increments with TTL RATE_LIMIT_WINDOW_SECONDS, rejects if value > RATE_LIMIT_BURST.
  - acquireInFlight(uid: string, requestId: string): Promise<boolean>
    - Uses SETNX on key rate:inflight:{uid} with TTL CONCURRENCY_KEY_TTL_SECONDS; returns true if acquired, false if already inflight.
  - releaseInFlight(uid: string, requestId: string): Promise<void>
    - Removes inflight key but only if value matches requestId (to avoid races) - use Lua script or GET+DEL with caution.
- Use ioredis client; ensure redis connection is created lazily via src/lib/redisClient.ts
- Unit tests:
  - Mock ioredis using jest mocks (simulate INCR/EXPIRE responses)
  - Test tryAcquireBurst boundary conditions
  - Test acquireInFlight and releaseInFlight behavior (including stale requestId not deleting)
- Error handling: on Redis errors, degrade gracefully by returning allowed=false with retryAfterSeconds set (fail-closed to be safe).

Write code and tests. Include strong typing and comments about atomicity and race conditions.


Todo checklist:
- [ ] Implement src/lib/redisClient.ts
- [ ] Implement src/services/rateLimit.ts with tryAcquireBurst, acquireInFlight, releaseInFlight
- [ ] Add unit tests test/rateLimit.test.ts mocking ioredis
- [ ] Document behavior in comments

Prompt 8 — OpenAI wrapper: prompt builder, call, and strict JSON parsing with retry
---------------------------------------------------------------------------------
Goal: Implement OpenAI wrapper that builds the system + user prompts per devSpec, calls gpt-5-nano with image URL, and enforces strict JSON output with a single retry on parse failure.

Code-generation prompt:
text
Implement an OpenAI service wrapper that calls gpt-5-nano with an image and strict JSON enforcement.

Requirements:
- Create src/services/openai.ts exposing:
  - buildCaptionPrompt({ signedImageUrl, tone }): { system: string, user: string }
    - System message per devSpec ("You are Captioner... JSON ONLY... etc.")
    - User message includes signedImageUrl and tone and JSON schema instructions.
  - requestCaptions(signedImageUrl: string, tone: "funny"|"heartfelt"|"witty"): Promise<{ rawText: string, parsed: any, model: string, latencyMs: number }>
    - Behavior:
      - Build prompt
      - Make OpenAI API call (use official openai npm client)
      - If response is unparsable JSON:
        - Retry once with a follow-up instruction "Fix your JSON and return ONLY the JSON matching schema."
      - Track and return model name and latency
- Include typed schema for expected JSON (suggestions: [{id,text,length_bucket,safety_flags}] )
- Unit tests:
  - Mock openai client (jest.mock) and simulate:
    - Well-formed JSON -> parsed successfully
    - Malformed -> first call returns bad text; second returns good JSON -> ensures retry logic runs
    - Both malformed -> throw model_error with appropriate output
- Implement robust parsing helpers that handle minor model artifacts (strip leading/trailing text) but do not attempt to salvage heavily malformed output.
- Add OpenAI call timeouts and retries for transient network failures (2 retries with exponential backoff) but keep overall wrapper deterministic for unit tests using mocks.

Write code, tests, and include sample prompts printed in tests for inspection.


Todo checklist:
- [ ] Implement src/services/openai.ts with buildCaptionPrompt and requestCaptions
- [ ] Add JSON schema types and parsing helpers
- [ ] Add unit tests test/openai.test.ts mocking OpenAI client
- [ ] Ensure retry-on-parse logic tested

Prompt 9 — OpenAI Moderation wrapper and caption regeneration logic
------------------------------------------------------------------
Goal: Implement moderation wrapper and logic to re-generate flagged captions (single attempt per caption) and record moderation flags.

Code-generation prompt:
text
Implement text moderation helper and caption-regeneration logic.

Requirements:
- Create src/services/moderation.ts exposing:
  - moderateText(text: string): Promise<{ flagged: boolean, categories: string[] }>
    - Calls OpenAI Moderation endpoint (mocked in unit tests)
  - sanitizeCaptions(captions: Array<{id,text,length_bucket}>, tone, signedImageUrl): Promise<Array<{id,text,length_bucket,safety_flags}>>
    - For each caption:
      - Call moderateText()
      - If flagged -> attempt one regeneration by calling openai.requestCaptions with a focused prompt to re-generate that one caption (system message stricter)
      - If regenerated caption still flagged -> drop it
      - Build safety_flags array per caption
    - Return array of safe captions (up to 3)
- Unit tests:
  - Mock moderation client to flag some captions and ensure regeneration attempted
  - Simulate regeneration returning safe caption -> assert caption included
  - Simulate regen flagged -> caption removed
- Ensure no raw captions are logged (only hashed or safety flags in logs). For tests, assert that sanitizeCaptions returns correct safety_flags details.

Write code and tests. Use dependency injection so OpenAI client from previous module can be mocked/injected.


Todo checklist:
- [ ] Implement src/services/moderation.ts with moderateText and sanitizeCaptions
- [ ] Add unit tests test/moderation.test.ts mocking moderation responses and openai regeneration
- [ ] Ensure sanitized captions match devSpec constraints

Prompt 10 — /generate route orchestration (core flow) with integration tests
-----------------------------------------------------------------------------
Goal: Implement /generate endpoint orchestrating the full server-side flow: auth, rate-limit, storage validate/fetch, image processing, Vision SafeSearch, OpenAI call, moderation, response mapping, logging, and Redis concurrency behavior. Provide integration tests with dependencies mocked.

Code-generation prompt:
text
Implement the /generate orchestration route.

Requirements:
- Endpoint: POST /generate
- Auth: verifyFirebaseAuth preHandler
- Request body:
  { objectPath: "gs://bucket/name", tone: "funny"|"heartfelt"|"witty" }
- Flow implementation (per devSpec):
  1. Verify uid from request.user
  2. Rate-limit:
     - tryAcquireBurst(uid) -> if not allowed -> 429 with retryAfter header/body
     - acquireInFlight(uid, requestId) -> if false -> 429 concurrency with Retry-After
  3. validateObjectPath(objectPath) and ensure it references configured bucket
  4. Use storage.getSignedUrlForObjectFetch(...) to obtain signed URL (5m TTL) and download object bytes (but for now use mocked download in tests: simulate returning a Buffer)
  5. Use imageProc.processImageBuffer to strip EXIF, resize and re-encode
  6. Call vision.safeSearchForImage on the processed buffer
     - If isImageRejected -> write moderation_flags to Firestore and return 422 image_flagged
  7. Call openai.requestCaptions(signedImageUrl, tone)
  8. Parse and validate JSON (length buckets, length constraints). If parse fails -> retry logic occurs within openai.service
  9. Call moderation.sanitizeCaptions to ensure captions safe
 10. If safeCaptions.length < 3 -> status: partial and explanation (why)
 11. Return 200 with suggestions array formatted per devSpec, model: gpt-5-nano, processing_time_ms, status
 12. Always releaseInFlight(uid, requestId) in finally block
- Logging:
  - Emit structured logs containing request_id, uid, tone, processing_time_ms, counts, but do not log raw image or full caption text
- Error mapping:
  - Map failures to devSpec error codes (image_flagged, rate_limited, model_error, server_error)
- Integration tests:
  - Use Fastify test server and supertest; mock these services (storage, imageProc, vision, openai, moderation, rateLimit, Firestore)
  - Test scenarios:
    - Happy path returns 3 captions
    - Vision flagged -> 422 image_flagged
    - Rate limit exceeded -> 429
    - OpenAI parse failure twice -> 500 model_error
    - Moderation removes some captions -> return partial with explanation
- The integration tests should assert headers (X-Request-ID), response shape, and Redis concurrency keys were created/released (mocked).

Implementation notes:
- Use a small orchestrator file src/routes/generate.ts for the route and delegate to a src/services/generateOrchestrator.ts which contains the flow logic for easier unit testing.
- Use a consistent request_id generator per request (UUID) and include it in logs/response headers.

Write code and tests. Ensure all external calls are abstracted via services to allow mocking.


Todo checklist:
- [ ] Implement src/services/generateOrchestrator.ts encapsulating core flow
- [ ] Implement src/routes/generate.ts and register route
- [ ] Add integration tests test/generate.integration.test.ts mocking services
- [ ] Ensure finally block always calls releaseInFlight

Prompt 11 — Firestore moderation_flags writer & admin endpoints
--------------------------------------------------------------
Goal: Implement Firestore writer for flagged events and admin endpoints to list flags and manage whitelist/ban. Tests must mock Firestore.

Code-generation prompt:
text
Implement Firestore-backed moderation_flags writer and small admin endpoints.

Requirements:
- Create src/services/moderationStore.ts exposing:
  - writeFlaggedEvent({ requestId, uid, objectPath, reason, visionResult?, captions?, timestamp? })
  - queryFlags(limit, after?) - returns flagged events
  - addWhitelist(uid) / removeWhitelist(uid) (admin operations)
- Use firebase-admin firestore client in implementation, but unit tests must mock firestore.
- Admin endpoints:
  - src/routes/admin.ts exposing:
    - GET /admin/flags?limit=50 (requires admin auth check — for now, check request.user.uid === ADMIN_UID env var or check a config)
    - POST /admin/whitelist body { uid, action: "add"|"remove" } (only admin user)
- Unit tests:
  - Mock Firestore client to assert writeFlaggedEvent stores correct docs
  - Admin routes return 403 for non-admin and success for admin
- Security:
  - Document in code comments that admin endpoints should be protected via IAM in production; here we use an ADMIN_UID env var for dev.

Write code and tests. Ensure test coverage for storage and admin routes.


Todo checklist:
- [ ] Implement src/services/moderationStore.ts
- [ ] Implement src/routes/admin.ts with admin check (ENV ADMIN_UID)
- [ ] Add tests test/moderationStore.test.ts and test/admin.test.ts mocking Firestore
- [ ] Ensure admin endpoints are only accessible to admin UID in tests

Prompt 12 — Dockerfile finalization, Docker Compose for local dependencies
------------------------------------------------------------------------
Goal: Finalize the Dockerfile suitable for Cloud Run and create a docker-compose.yml for local development (Fastify app + Redis). Provide tests to ensure container builds.

Code-generation prompt:
text
Finalize Dockerfile for production and add docker-compose for local dev.

Requirements:
- Dockerfile:
  - Multi-stage build: builder (node:18) -> produce dist, final image node:18-alpine
  - Install only production deps in final image
  - Expose PORT from env
  - Healthcheck to /health
- docker-compose.yml for local development:
  - service app: build local Dockerfile, map port 8080:8080, mount local src for hot-reload (dev override).
  - service redis: use redis:6-alpine
  - Optional: firestore emulator & firebase emulator not required in compose but add comments
- Add a GitHub Actions workflow skeleton .github/workflows/build.yml to build the Docker image and run tests (unit).
- Add a small script ./scripts/local-build.sh that builds the image and runs docker-compose up -d

Add minimal integration test to confirm Docker image starts and /health reachable (run container in CI or as local script). For CI we will run tests against code, not containers; include placeholder.

Write Dockerfile, docker-compose.yml, and CI skeleton.


Todo checklist:
- [ ] Finalize Dockerfile multi-stage build
- [ ] Add docker-compose.yml with app and redis services
- [ ] Add CI workflow skeleton .github/workflows/build.yml
- [ ] Add scripts/local-build.sh and README instructions

Prompt 13 — Backend CI: GitHub Actions full workflow
---------------------------------------------------
Goal: Provide a complete CI GitHub Actions workflow that lints, tests, builds, and (optionally) builds and pushes Docker images when secrets are present. Include steps to run unit tests with cached node modules.

Code-generation prompt:
text
Create a GitHub Actions workflow .github/workflows/ci.yml that:

- Triggers: push and PR
- Jobs:
  - test:
    - Runs on ubuntu-latest
    - Steps:
      - checkout
      - setup-node 18
      - cache node modules
      - install dependencies
      - run lint (npm run lint)
      - run unit tests (npm test)
  - docker-build (optional, runs on 'push' to develop or main):
    - build docker image and push to registry if DOCKER_REGISTRY and credentials (secrets) are configured
    - Use GCP or GitHub Container Registry skeleton steps with comments where to insert service account or PAT

- Store secrets in GitHub Secrets (mention OPENAI_API_KEY, FIREBASE_SERVICE_ACCOUNT, GCP creds)

- Ensure workflow is idempotent and prints test results.

Write YAML workflow file with comments about secret usage and required repo settings.


Todo checklist:
- [ ] Add .github/workflows/ci.yml with lint/test steps
- [ ] Document optional docker-build job requiring secrets
- [ ] Ensure workflow uses node 18 and caches dependencies

Prompt 14 — Expo React Native client skeleton with Auth and Upload flow (client scaffolding)
------------------------------------------------------------------------------------------
Goal: Create an Expo TypeScript app skeleton with Firebase passwordless auth (magic link) flow, image picker, image compression/resizing (client-side best effort), and UI screens for upload and tone selection. Include unit tests or e2e guidance.

Code-generation prompt:
text
Generate an Expo React Native (managed) TypeScript app skeleton.

Requirements:
- Screens:
  - AuthScreen: start magic-link flow via Firebase Auth (email input). Use react-native-firebase or Firebase JS SDK with web compatibility instructions for Expo.
  - HomeScreen: pick/take photo (expo-image-picker) and choose tone (funny/heartfelt/witty)
  - UploadScreen: compress down to <=2MB and downscale longest side <=1024 using expo-image-manipulator, show upload progress, call backend /presign-upload and then PUT to uploadUrl, then call /generate and show spinner and results screen.
  - ResultsScreen: show up to 3 captions with copy button; analytics events logged to Firebase Analytics.
- Authentication:
  - Use Firebase passwordless/email link flow and persist idToken securely (expo-secure-store).
  - On app start, check for logged-in user and show HomeScreen.
- Networking:
  - Use fetch for presign and generate; include Authorization Bearer header with Firebase ID token.
  - Handle errors mapping per devSpec userMessage strings.
- Local env:
  - Use expo-constants or .env to store backend base URL for dev
- Tests:
  - Provide strategy for unit tests: jest + react-native-testing-library for components
  - Provide manual e2e testing steps (since mobile e2e is heavier): manual acceptance checklist and example images to test.

Deliverables:
- App skeleton code for the main screens and navigation (React Navigation)
- Example functions for compressing/resizing images client-side using expo-image-manipulator
- An example for uploading to the presigned PUT URL using fetch with PUT and Content-Type header
- README in client explaining how to configure Firebase and backend base URL

Note: This step focuses on scaffolding and wiring; the UI can be minimal. Provide comments where to integrate analytics and crash reporting (Crashlytics).


Todo checklist:
- [ ] Create Expo app skeleton with AuthScreen, HomeScreen, UploadScreen, ResultsScreen
- [ ] Implement client-side image compression & resize via expo-image-manipulator
- [ ] Implement presign-upload and direct PUT logic and /generate call
- [ ] Add README instructions for Firebase config and running the app

Prompt 15 — Client integration tests + manual acceptance steps
--------------------------------------------------------------
Goal: Provide automated tests where feasible and a clear manual QA plan for the mobile flows that require cloud resources.

Code-generation prompt:
text
Provide integration test guidance and minimal automated tests for the Expo client, plus a manual QA checklist.

Requirements:
- Automated:
  - Use jest + react-native-testing-library
  - Add tests for:
    - UploadScreen: when presign service returns uploadUrl, ensure PUT is executed (mock fetch) and /generate called with objectPath
    - ResultsScreen: renders captions array passed as props correctly
- Manual QA checklist:
  1. Configure Firebase project and add backend base URL in app.
  2. Sign in via magic link (use test email).
  3. Select photo > upload > observe upload progress and spinner
  4. Confirm 3 captions shown within expected latency
  5. Test flagged image -> expect friendly error message "We can’t create captions for this image..."
  6. Test rate-limiting by sending >5 generate requests in 60s -> expect 429 mapping message
  7. Test EXIF stripping: take a photo with location enabled and confirm server-side EXIF is removed (manual backend log check)
- Provide sample jest test files mocking network requests (presign, PUT) for core client flows.

Return files and tests (but allow mocking to run locally without cloud).


Todo checklist:
- [ ] Add jest tests for UploadScreen and ResultsScreen with mocked fetch
- [ ] Provide manual QA checklist in client/README
- [ ] Ensure instructions for running tests locally

Prompt 16 — End-to-end test harness & local emulation guidance
--------------------------------------------------------------
Goal: Describe and provide scripts for running e2e tests locally with emulators and mocks for OpenAI and Vision; provide a sample Playwright or simple node e2e script to exercise endpoints.

Code-generation prompt:
text
Provide an e2e testing harness and local emulation instructions.

Requirements:
- Recommend and provide scripts to:
  - Run Firebase emulator suite (auth + firestore) locally for backend integration tests.
  - Run a local Redis container via docker-compose
  - Provide a simple Node-based test harness (scripts/e2e/run_e2e.js) that:
    - Starts the backend locally (npm run dev) with mocks enabled via ENV USE_MOCK_OPENAI=true, USE_MOCK_VISION=true
    - Uses sample images from test/fixtures and calls /presign-upload -> simulate upload -> calls /generate and asserts expected results
- Provide mock servers for OpenAI and Vision (small express endpoints listening on configurable ports) that return canned responses for e2e tests.
- Provide instructions to run mobile manual e2e:
  - Use Expo dev client on device or emulator, point to local backend (tunnel), perform the manual QA checklist.
- Scripts:
  - scripts/e2e/start-mocks.sh to bring up mock OpenAI & Vision servers and local Redis
  - scripts/e2e/run-local-e2e.sh to run the test harness

Deliverables:
- Node script for e2e assertions (minimal; uses axios/fetch)
- Mock server code for OpenAI & Vision endpoints returning sample outputs

These e2e scripts are optional but recommended for regression testing before deploying to staging.


Todo checklist:
- [ ] Add scripts/e2e mock servers for OpenAI & Vision
- [ ] Add scripts to start local emulators and run Node-based e2e checks
- [ ] Document how to run e2e locally in README

Prompt 17 — Observability: logging, Cloud Logging hooks, and error reporting
----------------------------------------------------------------------------
Goal: Add structured logging helpers and ensure request tracing (X-Request-ID). Provide integration tests verifying logs are produced (local capture).

Code-generation prompt:
text
Implement structured logging and request tracing.

Requirements:
- Create src/lib/logger.ts using pino (or pino-pretty for dev) exposing:
  - createLogger({requestId, uid?}) returning a child logger
- Add Fastify plugin to generate a request_id (UUID v4) for each incoming request and add X-Request-ID response header.
- Use logger in generate orchestrator and other critical services to produce structured logs:
  - Fields: request_id, uid, tone, step, duration_ms, error_code (where applicable)
- Ensure logs avoid plain caption text; if needed, log SHA256 hash of caption text.
- Tests:
  - Integration test that hits /generate with mocked services and asserts logs contain request_id and expected fields by capturing stdout/stderr logs (use pino's transport to memory in tests).
- Add README notes about integration with Cloud Logging and recommended labels/fields.

Write the logger module, request id plugin, and tests capturing logs.


Todo checklist:
- [ ] Implement src/lib/logger.ts
- [ ] Add Fastify request-id plugin and add X-Request-ID header
- [ ] Replace console.log usage with logger in services
- [ ] Add test capturing logs to assert presence of request_id

Prompt 18 — Deployment: Terraform skeleton & Cloud Run Docker deploy instructions
-------------------------------------------------------------------------------
Goal: Provide a Terraform skeleton and instructions to deploy the service to Cloud Run with relevant IAM roles and Secret Manager integration.

Code-generation prompt:
text
Produce a Terraform skeleton and deployment instructions for Cloud Run.

Requirements:
- Provide directory infra/ with:
  - main.tf (provider, project, region)
  - modules/cloudrun/main.tf (Cloud Run service creation using provided image)
  - modules/storage/main.tf (GCS bucket creation w/ lifecycle rule 6h)
  - modules/redis/main.tf (reference for Cloud Memorystore - note that exact availability may vary)
  - modules/secret_manager/main.tf (to store OPENAI_API_KEY)
  - variables.tf and outputs.tf
- Provide a template cloudbuild.yaml or GitHub Actions snippet for deploying built Docker image to Cloud Run
- Provide instructions:
  - Build and push Docker image to Artifact Registry or GCR
  - Apply Terraform to create infra
  - Deploy Cloud Run with environment variables and grant runtime service account access to Secret Manager, Vision, Storage
- Security note: Show least-privilege roles required.

Write Terraform files with placeholders and comments where manual changes are required (region, project_id). Keep everything idempotent.

Also provide deploy.sh script that:
- builds the docker image
- pushes to Artifact Registry
- triggers terraform apply (optionally)
- deploys new Cloud Run revision (gcloud run deploy)


Todo checklist:
- [ ] Add infra/ Terraform skeleton for Cloud Run, storage, secret manager
- [ ] Add deploy.sh with build/push/deploy steps and comments about service account
- [ ] Document IAM roles and Service Account permissions

Prompt 19 — Final QA, acceptance tests, and release checklist
------------------------------------------------------------
Goal: Produce the final test and release checklist to move from staging to production. Include acceptance test definitions and monitoring rules.

Code-generation prompt:
text
Produce a final QA and release checklist document plus test scripts to validate acceptance criteria.

Requirements:
- Acceptance tests (executable where possible):
  - End-to-end generation success: upload sample images (people, scenery, food) -> get 3 captions for 95% of samples within median < 3s in staging
  - Safety: flagged images return 422
  - Rate limiting: ensure >5 generates in 60s results in 429
  - Auth: only signed-in users can call /generate
  - EXIF stripping: assert metadata removed (sample image check)
- Monitoring & alert rules to configure (Cloud Monitoring):
  - OpenAI error rate > 1% -> Pager
  - High latency (95th >5s) -> Alert
  - Excessive cost/spend -> Alert
- Release checklist:
  - All unit & integration tests pass
  - E2E smoke tests pass in staging
  - Cloud Run instance size and concurrency configured per expected load
  - Ensure Secret Manager keys present and permissions granted
  - Enable Cloud Logging -> BigQuery export
- Provide simple scripts (or commands) that run these acceptance tests against staging:
  - scripts/release/run_acceptance.sh which runs Node-based tests using sample fixture images and asserts responses.

Write the checklist and the simple shell script for running acceptance tests. Include exact success criteria and post-deploy steps.


Todo checklist:
- [ ] Create acceptance tests scripts and checklist
- [ ] Document monitoring & alert rules
- [ ] Add scripts/release/run_acceptance.sh

Prompt 20 — Wrap-up prompt: Verify wiring, remove mocks, and production readiness runbook
--------------------------------------------------------------------------------------
Goal: Final step to remove dev-only mocks, run all tests, and produce a production runbook for operations and incident handling.

Code-generation prompt:
text
Perform the final wiring and produce an operations runbook.

Tasks:
1) Produce a "smoke" code-generation LLM task to:
   - Replace mock toggles with real service wiring where environment variables signal production (USE_MOCK_OPENAI=false, USE_MOCK_VISION=false).
   - Ensure getSignedUrlForObjectFetch is used to create signed URL for OpenAI fetch.
   - Ensure Secret Manager integration for OpenAI key is implemented (or provide explicit code comments for hooking it).
2) Run all tests (unit + integration) in a simulated production config (but still using mocked external services where required unless actual infra configured).
3) Generate a production runbook (docs/Runbook.md) with:
   - How to rotate OpenAI key (Secret Manager)
   - How to whitelist/ban users
   - How to review Firestore moderation_flags
   - How to respond to high OpenAI error rates or increased costs (steps to throttle or disable new jobs)
   - Troubleshooting steps for common failures (Vision API quota, Redis connectivity, Cloud Run OOM)
4) Provide a final checklist that confirms there are no orphaned files, all routes are registered, and every service is covered by at least unit test + one integration test.

Write code changes and documentation. Return a summary table of all files added and tests created.


Todo checklist:
- [ ] Wire production toggles and ensure no dev mocks remain when USE_MOCK_OPENAI=false
- [ ] Produce docs/Runbook.md with ops steps and incident procedures
- [ ] Run tests locally and note any remaining TODOs
- [ ] Provide final summary of files and tests

Closing notes and recommended execution order
-------------------------------------------
Work through prompts 0 → 20 in order. For each prompt:
- Feed the code-generation LLM the code block content.
- Review generated code and tests.
- Run npm test and fix any issues before moving on.
- For manual steps (Prompt 1), complete infra before running cloud integration tests.

Keep to the devSpec constraints:
- Enforce image formats and size rules.
- Use Firebase ID tokens for auth.
- Use Redis for rate-limiting (with graceful degradation).
- Use Google Vision for image safety checks.
- Use OpenAI gpt-5-nano for multimodal caption generation.
- Keep images ephemeral (6-hour lifecycle) and strip EXIF prior to any external call.

If you want, I can:
- Generate the exact OpenAPI spec for endpoints defined in devSpec.
- Produce a first code-generation LLM run for Prompt 0 (repo scaffold) to bootstrap the repo files now.`,

  agentsMd: `# AGENTS.md

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
`
};
