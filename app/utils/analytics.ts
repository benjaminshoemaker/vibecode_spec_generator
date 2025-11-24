// Google Analytics event tracking utility
// Requires GA to be initialized in layout.tsx

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

// Helper to send events to activity store
const trackActivity = (eventType: string, params?: Record<string, any>) => {
  // Only track on client side
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[Analytics] Tracking activity:', { eventType, params });

  // Use setTimeout to avoid blocking and fire-and-forget
  setTimeout(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, params }),
    })
      .then(r => r.json())
      .then(result => {
        console.log('[Analytics] Track response:', result);
      })
      .catch(error => {
        console.error('[Analytics] Failed to track activity:', error);
      });
  }, 0);
};

export const analytics = {
  // Track start of the wizard journey (CTA clicks or direct visits)
  trackWizardStart: (source?: string) => {
    trackActivity('wizard_start', { source });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_start', {
        source,
      });
    }
  },

  // Track page views for wizard steps
  trackStepView: (stepNumber: number, stepName: string) => {
    trackActivity('step_view', { step_number: stepNumber, step_name: stepName });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'step_view', {
        step_number: stepNumber,
        step_name: stepName,
      });
    }
  },

  // Track approvals for each step
  trackStepApproved: (stepNumber: number, stepName: string) => {
    trackActivity('step_approved', { step_number: stepNumber, step_name: stepName });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'step_approved', {
        step_number: stepNumber,
        step_name: stepName,
      });
    }
  },

  // Track document generation
  trackDocumentGenerate: (stepName: string, success: boolean) => {
    if (success) {
      trackActivity('document_generate', { step_name: stepName, success });
    }
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_generate', {
        step_name: stepName,
        success: success,
      });
    }
  },

  // Track individual document downloads
  trackDocumentDownload: (stepName: string) => {
    trackActivity('document_download', { step_name: stepName, download_type: 'individual' });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_download', {
        step_name: stepName,
        download_type: 'individual',
      });
    }
  },

  // Track bulk ZIP downloads
  trackBulkDownload: (documentCount: number) => {
    trackActivity('bulk_download', { document_count: documentCount, download_type: 'zip' });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bulk_download', {
        document_count: documentCount,
        download_type: 'zip',
      });
    }
  },

  // Track wizard reset
  trackWizardReset: () => {
    trackActivity('wizard_reset');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_reset');
    }
  },

  // Track wizard completion
  trackWizardComplete: () => {
    trackActivity('wizard_complete');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_complete');
    }
  },

  // Track chat message submission
  trackChatMessage: (stepName: string) => {
    trackActivity('chat_message', { step_name: stepName });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chat_message', {
        step_name: stepName,
      });
    }
  },

  // Track Finalize clicks on the last step
  trackFinalizeClick: () => {
    trackActivity('finalize_clicked');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'finalize_clicked');
    }
  },

  // Track download action from the completion modal
  trackCompletionDownload: () => {
    trackActivity('completion_modal_download');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'completion_modal_download');
    }
  },

  // Track command copy action from the completion modal
  trackCompletionCopy: () => {
    trackActivity('completion_modal_copy');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'completion_modal_copy');
    }
  },
};
