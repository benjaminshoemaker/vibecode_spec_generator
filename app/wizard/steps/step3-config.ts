import { StepConfig } from "@/app/types";

export const step3Config: StepConfig = {
  stepNumber: 3,
  stepName: "Checklist",
  userInstructions: "[TO BE DEFINED]",
  systemPrompt: "[TO BE DEFINED]",
  generateButtonText: "Generate Checklist",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["onePager", "devSpec"], // References previous steps' documents
};
