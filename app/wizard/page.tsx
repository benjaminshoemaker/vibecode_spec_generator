"use client";

import { useWizardStore } from "@/app/store";
import WizardStep from "./components/WizardStep";
import { step1Config } from "./steps/step1-config";
import { step2Config } from "./steps/step2-config";
import { step3Config } from "./steps/step3-config";
import { step4Config } from "./steps/step4-config";
import { StepConfig } from "@/app/types";

const stepConfigs: StepConfig[] = [
  step1Config,
  step2Config,
  step3Config,
  step4Config,
];

const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;
const stepNames = ["One-Pager", "Dev Spec", "Checklist", "AGENTS.md"];

export default function WizardPage() {
  const { currentStep, setCurrentStep, steps, isGenerating, resetWizard } = useWizardStore();

  const currentConfig = stepConfigs[currentStep - 1];
  const currentStepKey = stepKeyMap[currentStep - 1];

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const handleApproveAndNext = () => {
    // Approve current step
    const { approveStep, updateStepChat } = useWizardStore.getState();
    approveStep(currentStepKey);

    // Move to next step and clear its chat
    if (currentStep < 4) {
      const nextStepKey = stepKeyMap[currentStep];
      // Clear chat history for the next step
      updateStepChat(nextStepKey, []);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDownload = (stepKey: typeof stepKeyMap[number], stepName: string) => {
    const stepData = steps[stepKey];
    if (!stepData.generatedDoc) return;

    const blob = new Blob([stepData.generatedDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stepName.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-100">
        <div className="text-sm font-medium text-gray-600">
          Step {currentStep} / 4
        </div>
        <button
          onClick={resetWizard}
          className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Start Over
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <WizardStep
              config={currentConfig}
              stepKey={currentStepKey}
              onApproveAndNext={handleApproveAndNext}
            />
          </div>

          {/* Right Sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-fit lg:sticky lg:top-20">
            <div className="text-sm font-semibold mb-4 text-gray-900">
              Saved Documents
            </div>

            {/* Document List */}
            <div className="flex flex-col gap-3 mb-5">
              {stepNames.map((name, index) => {
                const stepKey = stepKeyMap[index];
                const isCompleted = steps[stepKey].approved;
                const hasDocument = steps[stepKey].generatedDoc !== null;

                return (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <button
                      onClick={() => handleStepClick(index + 1)}
                      className={`flex items-center gap-2 hover:underline ${
                        isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <span>{isCompleted ? "✓" : "□"}</span>
                      <span>{name}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(stepKey, name)}
                      disabled={!hasDocument}
                      className={`text-base p-1 ${
                        hasDocument
                          ? "text-blue-600 hover:text-blue-800 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                      title={hasDocument ? "Download document" : "No document yet"}
                    >
                      ↓
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  // Trigger generate by dispatching custom event
                  window.dispatchEvent(new CustomEvent('triggerGenerate'));
                }}
                disabled={steps[currentStepKey].chatHistory.length === 0 || isGenerating}
                className="w-full px-3 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isGenerating ? "Generating..." : currentConfig.generateButtonText}
              </button>
              <button
                onClick={handleApproveAndNext}
                disabled={!steps[currentStepKey].generatedDoc}
                className="w-full px-3 py-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === 4 ? "Save Draft & Finish" : "Save Draft & Next Step"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
