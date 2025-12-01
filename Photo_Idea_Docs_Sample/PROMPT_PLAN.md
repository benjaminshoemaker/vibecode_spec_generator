Prompt Plan — Photo Captioner (MVP)
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
```text
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
```

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
```text
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
```

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
```text
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
```

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
```text
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
```

Todo checklist:
- [ ] Implement src/services/storage.ts with generateUploadPresign, validateObjectPath, getSignedUrlForObjectFetch
- [ ] Add constants for allowed content types and maxUploadBytes
- [ ] Add unit tests mocking @google-cloud/storage
- [ ] Ensure tests run without GCP credentials

Prompt 4 — Presign endpoint route and integration test
------------------------------------------------------
Goal: Add Fastify route POST /presign-upload using verifyFirebaseAuth plugin and storage service. Add integration test using Fastify instance and mocked storage service.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/routes/presign.ts
- [ ] Register route in server startup
- [ ] Add integration tests test/presign.test.ts using supertest mocking storage
- [ ] Validate JSON schema and error mapping

Prompt 5 — Image processing service (sharp): strip EXIF, resize, re-encode
--------------------------------------------------------------------------
Goal: Implement image processing utilities that accept a Buffer/stream and return processed JPEG buffer with EXIF removed, longest side <= 1024 px, and recompressed. Provide unit tests using sample images in test/fixtures.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/imageProc.ts with processImageBuffer and isAnimated
- [ ] Add test fixtures (jpeg, png, large sample, animated gif)
- [ ] Add unit tests test/imageProc.test.ts
- [ ] Ensure tests pass locally

Prompt 6 — Google Vision SafeSearch wrapper (mockable)
-----------------------------------------------------
Goal: Implement Vision service wrapper that accepts image buffer and returns SafeSearchResult. Provide unit tests that mock @google-cloud/vision.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/vision.ts wrapper
- [ ] Implement src/lib/safety.ts with isImageRejected
- [ ] Add unit tests test/vision.test.ts mocking @google-cloud/vision
- [ ] Ensure tests assert detection and thresholds

Prompt 7 — Rate limiting & concurrency service (Redis) with mocks
----------------------------------------------------------------
Goal: Implement Redis-based rate limiting helper functions (burst counter and inflight key) using ioredis, but ensure unit tests mock Redis or run against a local test Redis. Provide functions used by /generate.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/lib/redisClient.ts
- [ ] Implement src/services/rateLimit.ts with tryAcquireBurst, acquireInFlight, releaseInFlight
- [ ] Add unit tests test/rateLimit.test.ts mocking ioredis
- [ ] Document behavior in comments

Prompt 8 — OpenAI wrapper: prompt builder, call, and strict JSON parsing with retry
---------------------------------------------------------------------------------
Goal: Implement OpenAI wrapper that builds the system + user prompts per devSpec, calls gpt-5-nano with image URL, and enforces strict JSON output with a single retry on parse failure.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/openai.ts with buildCaptionPrompt and requestCaptions
- [ ] Add JSON schema types and parsing helpers
- [ ] Add unit tests test/openai.test.ts mocking OpenAI client
- [ ] Ensure retry-on-parse logic tested

Prompt 9 — OpenAI Moderation wrapper and caption regeneration logic
------------------------------------------------------------------
Goal: Implement moderation wrapper and logic to re-generate flagged captions (single attempt per caption) and record moderation flags.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/moderation.ts with moderateText and sanitizeCaptions
- [ ] Add unit tests test/moderation.test.ts mocking moderation responses and openai regeneration
- [ ] Ensure sanitized captions match devSpec constraints

Prompt 10 — /generate route orchestration (core flow) with integration tests
-----------------------------------------------------------------------------
Goal: Implement /generate endpoint orchestrating the full server-side flow: auth, rate-limit, storage validate/fetch, image processing, Vision SafeSearch, OpenAI call, moderation, response mapping, logging, and Redis concurrency behavior. Provide integration tests with dependencies mocked.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/generateOrchestrator.ts encapsulating core flow
- [ ] Implement src/routes/generate.ts and register route
- [ ] Add integration tests test/generate.integration.test.ts mocking services
- [ ] Ensure finally block always calls releaseInFlight

Prompt 11 — Firestore moderation_flags writer & admin endpoints
--------------------------------------------------------------
Goal: Implement Firestore writer for flagged events and admin endpoints to list flags and manage whitelist/ban. Tests must mock Firestore.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/services/moderationStore.ts
- [ ] Implement src/routes/admin.ts with admin check (ENV ADMIN_UID)
- [ ] Add tests test/moderationStore.test.ts and test/admin.test.ts mocking Firestore
- [ ] Ensure admin endpoints are only accessible to admin UID in tests

Prompt 12 — Dockerfile finalization, Docker Compose for local dependencies
------------------------------------------------------------------------
Goal: Finalize the Dockerfile suitable for Cloud Run and create a docker-compose.yml for local development (Fastify app + Redis). Provide tests to ensure container builds.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Finalize Dockerfile multi-stage build
- [ ] Add docker-compose.yml with app and redis services
- [ ] Add CI workflow skeleton .github/workflows/build.yml
- [ ] Add scripts/local-build.sh and README instructions

Prompt 13 — Backend CI: GitHub Actions full workflow
---------------------------------------------------
Goal: Provide a complete CI GitHub Actions workflow that lints, tests, builds, and (optionally) builds and pushes Docker images when secrets are present. Include steps to run unit tests with cached node modules.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Add .github/workflows/ci.yml with lint/test steps
- [ ] Document optional docker-build job requiring secrets
- [ ] Ensure workflow uses node 18 and caches dependencies

Prompt 14 — Expo React Native client skeleton with Auth and Upload flow (client scaffolding)
------------------------------------------------------------------------------------------
Goal: Create an Expo TypeScript app skeleton with Firebase passwordless auth (magic link) flow, image picker, image compression/resizing (client-side best effort), and UI screens for upload and tone selection. Include unit tests or e2e guidance.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Create Expo app skeleton with AuthScreen, HomeScreen, UploadScreen, ResultsScreen
- [ ] Implement client-side image compression & resize via expo-image-manipulator
- [ ] Implement presign-upload and direct PUT logic and /generate call
- [ ] Add README instructions for Firebase config and running the app

Prompt 15 — Client integration tests + manual acceptance steps
--------------------------------------------------------------
Goal: Provide automated tests where feasible and a clear manual QA plan for the mobile flows that require cloud resources.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Add jest tests for UploadScreen and ResultsScreen with mocked fetch
- [ ] Provide manual QA checklist in client/README
- [ ] Ensure instructions for running tests locally

Prompt 16 — End-to-end test harness & local emulation guidance
--------------------------------------------------------------
Goal: Describe and provide scripts for running e2e tests locally with emulators and mocks for OpenAI and Vision; provide a sample Playwright or simple node e2e script to exercise endpoints.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Add scripts/e2e mock servers for OpenAI & Vision
- [ ] Add scripts to start local emulators and run Node-based e2e checks
- [ ] Document how to run e2e locally in README

Prompt 17 — Observability: logging, Cloud Logging hooks, and error reporting
----------------------------------------------------------------------------
Goal: Add structured logging helpers and ensure request tracing (X-Request-ID). Provide integration tests verifying logs are produced (local capture).

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Implement src/lib/logger.ts
- [ ] Add Fastify request-id plugin and add X-Request-ID header
- [ ] Replace console.log usage with logger in services
- [ ] Add test capturing logs to assert presence of request_id

Prompt 18 — Deployment: Terraform skeleton & Cloud Run Docker deploy instructions
-------------------------------------------------------------------------------
Goal: Provide a Terraform skeleton and instructions to deploy the service to Cloud Run with relevant IAM roles and Secret Manager integration.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Add infra/ Terraform skeleton for Cloud Run, storage, secret manager
- [ ] Add deploy.sh with build/push/deploy steps and comments about service account
- [ ] Document IAM roles and Service Account permissions

Prompt 19 — Final QA, acceptance tests, and release checklist
------------------------------------------------------------
Goal: Produce the final test and release checklist to move from staging to production. Include acceptance test definitions and monitoring rules.

Code-generation prompt:
```text
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
```

Todo checklist:
- [ ] Create acceptance tests scripts and checklist
- [ ] Document monitoring & alert rules
- [ ] Add scripts/release/run_acceptance.sh

Prompt 20 — Wrap-up prompt: Verify wiring, remove mocks, and production readiness runbook
--------------------------------------------------------------------------------------
Goal: Final step to remove dev-only mocks, run all tests, and produce a production runbook for operations and incident handling.

Code-generation prompt:
```text
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
```

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
- Produce a first code-generation LLM run for Prompt 0 (repo scaffold) to bootstrap the repo files now.

Which next prompt would you like me to generate (0..20) as the immediate code-generation instruction to a coding LLM?