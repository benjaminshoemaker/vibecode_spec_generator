# Photo Captioner — Developer Specification (MVP)

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
- Call /generate without token — 401 returned.

---

If you want, next steps I can produce:
- Concrete JSON OpenAPI (Swagger) file for the endpoints.
- Example Dockerfile + sample Cloud Run Terraform template.
- Starter code snippets for /generate orchestration (TypeScript).
- Expo app skeleton with upload & auth flows.

Do you want the OpenAPI spec and starter repo scaffolding next?