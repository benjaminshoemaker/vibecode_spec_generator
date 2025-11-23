import { WizardState } from "@/app/types";

type StepKey = keyof WizardState["steps"];

export const canAccessStep = (
  targetStep: number,
  steps: WizardState["steps"],
  orderedStepKeys: readonly StepKey[],
): boolean => {
  if (targetStep < 1 || targetStep > orderedStepKeys.length) {
    return false;
  }

  const targetIndex = targetStep - 1;

  for (let index = 0; index < targetIndex; index++) {
    const stepKey = orderedStepKeys[index];
    if (!steps[stepKey].approved) {
      return false;
    }
  }

  return true;
};
