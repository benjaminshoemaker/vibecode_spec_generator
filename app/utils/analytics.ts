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
const trackActivity = async (eventType: string, params?: Record<string, any>) => {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, params }),
    });
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Failed to track activity:', error);
  }
};

export const analytics = {
  // Track start of the wizard journey (CTA clicks or direct visits)
  trackWizardStart: (source?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_start', {
        source,
      });
      trackActivity('wizard_start', { source });
    }
  },

  // Track page views for wizard steps
  trackStepView: (stepNumber: number, stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'step_view', {
        step_number: stepNumber,
        step_name: stepName,
      });
      trackActivity('step_view', { step_number: stepNumber, step_name: stepName });
    }
  },

  // Track approvals for each step
  trackStepApproved: (stepNumber: number, stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'step_approved', {
        step_number: stepNumber,
        step_name: stepName,
      });
      trackActivity('step_approved', { step_number: stepNumber, step_name: stepName });
    }
  },

  // Track document generation
  trackDocumentGenerate: (stepName: string, success: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_generate', {
        step_name: stepName,
        success: success,
      });
      if (success) {
        trackActivity('document_generate', { step_name: stepName, success });
      }
    }
  },

  // Track individual document downloads
  trackDocumentDownload: (stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_download', {
        step_name: stepName,
        download_type: 'individual',
      });
      trackActivity('document_download', { step_name: stepName, download_type: 'individual' });
    }
  },

  // Track bulk ZIP downloads
  trackBulkDownload: (documentCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bulk_download', {
        document_count: documentCount,
        download_type: 'zip',
      });
      trackActivity('bulk_download', { document_count: documentCount, download_type: 'zip' });
    }
  },

  // Track wizard reset
  trackWizardReset: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_reset');
      trackActivity('wizard_reset');
    }
  },

  // Track wizard completion
  trackWizardComplete: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_complete');
      trackActivity('wizard_complete');
    }
  },

  // Track chat message submission
  trackChatMessage: (stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chat_message', {
        step_name: stepName,
      });
      trackActivity('chat_message', { step_name: stepName });
    }
  },
};
