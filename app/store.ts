import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WizardState, StepData, Message } from "./types";
import { analytics } from "./utils/analytics";

const initialStepData: StepData = {
  chatHistory: [],
  generatedDoc: null,
  approved: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      isGenerating: false,
      resetCounter: 0,
      steps: {
        onePager: { ...initialStepData },
        devSpec: { ...initialStepData },
        checklist: { ...initialStepData },
        agentsMd: { ...initialStepData },
      },
      setCurrentStep: (step: number) => set({ currentStep: step }),
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
      updateStepChat: (stepKey, messages) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepKey]: {
              ...state.steps[stepKey],
              chatHistory: messages,
            },
          },
        })),
      updateStepDoc: (stepKey, doc) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepKey]: {
              ...state.steps[stepKey],
              generatedDoc: doc,
            },
          },
        })),
      approveStep: (stepKey) =>
        set((state) => ({
          steps: {
            ...state.steps,
            [stepKey]: {
              ...state.steps[stepKey],
              approved: true,
            },
          },
        })),
      resetWizard: () => {
        analytics.trackWizardReset();
        return set((state) => ({
          currentStep: 1,
          isGenerating: false,
          resetCounter: state.resetCounter + 1,
          steps: {
            onePager: { ...initialStepData },
            devSpec: { ...initialStepData },
            checklist: { ...initialStepData },
            agentsMd: { ...initialStepData },
          },
        }));
      },
      loadSampleDocs: () =>
        set({
          currentStep: 1,
          isGenerating: false,
          steps: {
            onePager: {
              chatHistory: [],
              generatedDoc: null,
              approved: false,
            },
            devSpec: {
              chatHistory: [],
              generatedDoc: null,
              approved: false,
            },
            checklist: {
              chatHistory: [],
              generatedDoc: null,
              approved: false,
            },
            agentsMd: {
              chatHistory: [],
              generatedDoc: null,
              approved: false,
            },
          },
        }),
    }),
    {
      name: "wizard-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        resetCounter: state.resetCounter,
        steps: state.steps,
        // Don't persist isGenerating (it's transient state)
      }),
    }
  )
);
