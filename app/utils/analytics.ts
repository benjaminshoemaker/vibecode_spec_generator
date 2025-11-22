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

export const analytics = {
  // Track page views for wizard steps
  trackStepView: (stepNumber: number, stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'step_view', {
        step_number: stepNumber,
        step_name: stepName,
      });
    }
  },

  // Track document generation
  trackDocumentGenerate: (stepName: string, success: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_generate', {
        step_name: stepName,
        success: success,
      });
    }
  },

  // Track individual document downloads
  trackDocumentDownload: (stepName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'document_download', {
        step_name: stepName,
        download_type: 'individual',
      });
    }
  },

  // Track bulk ZIP downloads
  trackBulkDownload: (documentCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'bulk_download', {
        document_count: documentCount,
        download_type: 'zip',
      });
    }
  },

  // Track wizard reset
  trackWizardReset: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_reset');
    }
  },

  // Track wizard completion
  trackWizardComplete: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'wizard_complete');
    }
  },
};
