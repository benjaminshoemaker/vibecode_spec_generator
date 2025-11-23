import { canAccessStep } from "@/app/wizard/utils/stepAccess";
import { WizardState } from "@/app/types";

const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;

const buildSteps = (
  approvals: Partial<Record<(typeof stepKeyMap)[number], boolean>>,
): WizardState["steps"] => ({
  onePager: { chatHistory: [], generatedDoc: null, approved: approvals.onePager ?? false },
  devSpec: { chatHistory: [], generatedDoc: null, approved: approvals.devSpec ?? false },
  checklist: { chatHistory: [], generatedDoc: null, approved: approvals.checklist ?? false },
  agentsMd: { chatHistory: [], generatedDoc: null, approved: approvals.agentsMd ?? false },
});

describe("canAccessStep", () => {
  it("always allows the first step", () => {
    const steps = buildSteps({});
    expect(canAccessStep(1, steps, stepKeyMap)).toBe(true);
  });

  it("blocks navigation to a step when earlier steps are not approved", () => {
    const steps = buildSteps({ onePager: false });
    expect(canAccessStep(2, steps, stepKeyMap)).toBe(false);
  });

  it("allows navigation only after all prerequisite steps are approved", () => {
    const steps = buildSteps({ onePager: true, devSpec: true, checklist: true });
    expect(canAccessStep(4, steps, stepKeyMap)).toBe(true);
  });

  it("returns false for out-of-range step numbers", () => {
    const steps = buildSteps({ onePager: true });
    expect(canAccessStep(0, steps, stepKeyMap)).toBe(false);
    expect(canAccessStep(5, steps, stepKeyMap)).toBe(false);
  });
});
