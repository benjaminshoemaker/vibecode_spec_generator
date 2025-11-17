import { StepConfig } from "@/app/types";

export const step4Config: StepConfig = {
  stepNumber: 4,
  stepName: "Agents.md",
  userInstructions: "[TO BE DEFINED]",
  systemPrompt: "[TO BE DEFINED]",
  generateButtonText: "Generate Agents.md",
  approveButtonText: "Approve Draft & Save",
  documentInputs: ["onePager", "devSpec", "checklist"], // References all previous steps
};
