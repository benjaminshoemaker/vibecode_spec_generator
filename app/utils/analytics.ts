// Google Analytics event tracking utility
// Requires GA to be initialized in layout.tsx

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const sendGtag = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === "undefined" || !window.gtag) return;
  if (params) {
    window.gtag("event", eventName, params);
  } else {
    window.gtag("event", eventName);
  }
};

// ============================================
// Client ID management for cohort tracking
// ============================================

const CLIENT_ID_KEY = "vs_client_id";
const SESSION_TRACKED_KEY = "vs_session_tracked";

// Persistent anonymous client ID for cohort tracking
export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

// Check if this is a returning user
export function isReturningUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CLIENT_ID_KEY) !== null;
}

// ============================================
// Postgres tracking for cohort analysis
// ============================================

// Track event to our Postgres database for cohort analysis
function trackToPostgres(eventType: string, metadata?: Record<string, unknown>): void {
  const clientId = getOrCreateClientId();
  if (!clientId) return;

  // Fire and forget - don't await
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, eventType, metadata }),
  }).catch(() => {
    // Silently fail - analytics should never break the app
  });
}

// Track session start (once per session)
export function trackSessionStart(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_TRACKED_KEY)) return;

  const returning = isReturningUser();
  sessionStorage.setItem(SESSION_TRACKED_KEY, "true");

  trackToPostgres("session_start", { returning });
  sendGtag("session_start", { returning });
}

// ============================================
// Analytics object with GA + Postgres tracking
// ============================================

export const analytics = {
  trackWizardStart: (source?: string) => {
    sendGtag("wizard_start", { source });
    trackToPostgres("wizard_start", { source });
  },
  trackStepView: (stepNumber: number, stepName: string) => {
    sendGtag("step_view", { step_number: stepNumber, step_name: stepName });
  },
  trackStepApproved: (stepNumber: number, stepName: string) => {
    sendGtag("step_approved", { step_number: stepNumber, step_name: stepName });
  },
  trackDocumentGenerate: (stepName: string, success: boolean) => {
    sendGtag("document_generate", { step_name: stepName, success });
    if (success) {
      trackToPostgres("doc_generated", { step_name: stepName });
    }
  },
  trackDocumentDownload: (stepName: string) => {
    sendGtag("document_download", { step_name: stepName, download_type: "individual" });
  },
  trackBulkDownload: (documentCount: number) => {
    sendGtag("bulk_download", { document_count: documentCount, download_type: "zip" });
    trackToPostgres("download", { doc_count: documentCount });
  },
  trackWizardReset: () => {
    sendGtag("wizard_reset");
  },
  trackWizardComplete: () => {
    sendGtag("wizard_complete");
    trackToPostgres("wizard_complete", {});
  },
  trackChatMessage: (stepName: string) => {
    sendGtag("chat_message", { step_name: stepName });
    trackToPostgres("chat_message", { step_name: stepName });
  },
  trackFinalizeClick: () => {
    sendGtag("finalize_clicked");
  },
  trackCompletionDownload: () => {
    sendGtag("completion_modal_download");
  },
  trackCompletionCopy: () => {
    sendGtag("completion_modal_copy");
  },
  trackEmailSubscribe: (success: boolean) => {
    sendGtag("email_subscribe", { success });
  },
  trackSampleDownload: () => {
    sendGtag("sample_download");
    trackToPostgres("sample_download", {});
  },
};
