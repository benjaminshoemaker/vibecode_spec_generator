import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WizardState, StepData, Message } from "./types";

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
      resetWizard: () =>
        set({
          currentStep: 1,
          steps: {
            onePager: { ...initialStepData },
            devSpec: { ...initialStepData },
            checklist: { ...initialStepData },
            agentsMd: { ...initialStepData },
          },
        }),
    }),
    {
      name: "wizard-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        steps: state.steps,
        // Don't persist isGenerating (it's transient state)
      }),
    }
  )
);
