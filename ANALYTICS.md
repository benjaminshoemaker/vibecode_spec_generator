# Analytics Tracking

This project uses **Google Analytics (GA4)** to track user behavior and document generation.

## Setup

Make sure you have set `NEXT_PUBLIC_GA_ID` in your environment variables with your Google Analytics measurement ID.

## Events Being Tracked

### 1. Wizard Start
**Event Name:** `wizard_start`

Triggered when a user clicks a CTA to open the wizard (nav, hero, footer) or lands directly on `/wizard`.

**Parameters:**
- `source` - Where the journey began (e.g., `hero_start_building`, `nav_get_started`, `direct_wizard`)

### 2. Step Views
**Event Name:** `step_view`

Triggered when a user navigates to a different wizard step.

**Parameters:**
- `step_number` - The step number (1-4)
- `step_name` - The step name (ONE_PAGER, DEV_SPEC, PROMPT_PLAN, AGENTS_MD)

### 3. Step Approval
**Event Name:** `step_approved`

Triggered when a user approves a step (including finalization on step 4).

**Parameters:**
- `step_number` - The step number (1-4)
- `step_name` - The approved step name

### 4. Chat Message Submission
**Event Name:** `chat_message`

Triggered when a user submits a chat message (via Enter key or clicking the arrow button).

**Parameters:**
- `step_name` - The name of the step where the message was sent

### 5. Document Generation
**Event Name:** `document_generate`

Triggered when a user generates a document (success or failure).

**Parameters:**
- `step_name` - The name of the step/document being generated
- `success` - Boolean indicating if generation succeeded

### 6. Individual Document Download
**Event Name:** `document_download`

Triggered when a user downloads a single document.

**Parameters:**
- `step_name` - The name of the document downloaded
- `download_type` - Always "individual"

### 7. Bulk ZIP Download
**Event Name:** `bulk_download`

Triggered when a user downloads all documents as a ZIP file.

**Parameters:**
- `document_count` - Number of documents included in the ZIP
- `download_type` - Always "zip"

### 8. Wizard Reset
**Event Name:** `wizard_reset`

Triggered when a user clicks the RESET button.

### 9. Wizard Completion
**Event Name:** `wizard_complete`

Triggered when a user finalizes the last step (clicks FINALIZE on step 4).

## Viewing Events in Google Analytics

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** → **Engagement** → **Events**
3. You'll see all custom events listed there
4. Click on any event to see detailed parameters and user engagement

## Common Insights

With these events, you can answer questions like:
- Which wizard steps do users visit most?
- How engaged are users with the chat feature? (messages per step)
- How many documents are successfully generated vs. failed?
- Which documents are downloaded most frequently?
- How many users complete the entire wizard?
- What's the drop-off rate between steps?
- Which steps have the most user interaction?
