export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface StepData {
  chatHistory: Message[];
  generatedDoc: string | null;
  approved: boolean;
}

export interface WizardState {
  currentStep: number;
  isGenerating: boolean;
  resetCounter: number;
  steps: {
    onePager: StepData;
    devSpec: StepData;
    checklist: StepData;
    agentsMd: StepData;
  };
  setCurrentStep: (step: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  updateStepChat: (stepKey: keyof WizardState["steps"], messages: Message[]) => void;
  updateStepDoc: (stepKey: keyof WizardState["steps"], doc: string) => void;
  approveStep: (stepKey: keyof WizardState["steps"]) => void;
  resetWizard: () => void;
  loadSampleDocs: () => void;
}

export interface StepConfig {
  stepNumber: number;
  stepName: string;
  userInstructions: string;
  systemPrompt: string;
  generateButtonText: string;
  approveButtonText: string;
  documentInputs: string[];
  initialGreeting?: string;
  generationPrompt?: string;
}
