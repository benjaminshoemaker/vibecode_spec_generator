// Google Analytics event tracking utility
// Requires GA to be initialized in layout.tsx

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, any>) => void;
  }
}

const sendGtag = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === "undefined" || !window.gtag) return;
  if (params) {
    window.gtag("event", eventName, params);
  } else {
    window.gtag("event", eventName);
  }
};

export const analytics = {
  trackWizardStart: (source?: string) => {
    sendGtag("wizard_start", { source });
  },
  trackStepView: (stepNumber: number, stepName: string) => {
    sendGtag("step_view", { step_number: stepNumber, step_name: stepName });
  },
  trackStepApproved: (stepNumber: number, stepName: string) => {
    sendGtag("step_approved", { step_number: stepNumber, step_name: stepName });
  },
  trackDocumentGenerate: (stepName: string, success: boolean) => {
    sendGtag("document_generate", { step_name: stepName, success });
  },
  trackDocumentDownload: (stepName: string) => {
    sendGtag("document_download", { step_name: stepName, download_type: "individual" });
  },
  trackBulkDownload: (documentCount: number) => {
    sendGtag("bulk_download", { document_count: documentCount, download_type: "zip" });
  },
  trackWizardReset: () => {
    sendGtag("wizard_reset");
  },
  trackWizardComplete: () => {
    sendGtag("wizard_complete");
  },
  trackChatMessage: (stepName: string) => {
    sendGtag("chat_message", { step_name: stepName });
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
};
