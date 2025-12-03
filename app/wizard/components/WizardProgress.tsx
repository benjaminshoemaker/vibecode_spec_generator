"use client";

import { useWizardStore } from "@/app/store";
import { canAccessStep } from "../utils/stepAccess";
import { useEffect, useState } from "react";

const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;
const stepLabels = ["One Pager", "Dev Spec", "Prompt Plan", "AGENTS.md"];
const stepQuestions = ["~10-15", "~20", "1", "0"];

// Expected questions per step (used for asymptotic calculation)
const expectedQuestions = [12, 20, 1, 0];

// Calculate asymptotic fill - approaches but never reaches maxFill
// Uses a logarithmic curve that slows down as it approaches the ceiling
function calculateAsymptoticFill(messageCount: number, expectedCount: number): number {
  if (expectedCount === 0) return 0;

  const maxFill = 0.88; // Never exceed 88% before generation
  const minFill = 0.08; // Start at 8% after first message

  if (messageCount === 0) return 0;

  // Logarithmic approach: fast at first, then diminishing returns
  // k controls the "steepness" - higher = faster initial growth
  const k = 2.5 / expectedCount;
  const fill = maxFill * (1 - Math.exp(-k * messageCount));

  return Math.max(minFill, Math.min(maxFill, fill));
}

export default function WizardProgress() {
  const { currentStep, setCurrentStep, steps, isGenerating } = useWizardStore();
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV === 'development';

  const handleAddTestMessage = () => {
    const { updateStepChat } = useWizardStore.getState();
    const currentStepKey = stepKeyMap[currentStep - 1];
    const currentMessages = steps[currentStepKey].chatHistory;
    updateStepChat(currentStepKey, [
      ...currentMessages,
      { id: `test-${Date.now()}`, role: 'user', content: `Test message ${currentMessages.length + 1}` },
    ]);
  };

  // Listen for generation completion to trigger fill animation
  useEffect(() => {
    const currentStepKey = stepKeyMap[currentStep - 1];
    const stepData = steps[currentStepKey];

    // When generation completes (doc appears), trigger completion animation
    if (stepData.generatedDoc && !stepData.approved) {
      setCompletingStep(currentStepKey);
      // Clear after animation completes
      const timer = setTimeout(() => setCompletingStep(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [steps, currentStep]);

  const handleStepClick = (stepNumber: number) => {
    if (!canAccessStep(stepNumber, steps, stepKeyMap)) {
      return;
    }
    if (stepNumber > currentStep) {
      const { updateStepChat } = useWizardStore.getState();
      const targetStepKey = stepKeyMap[stepNumber - 1];
      updateStepChat(targetStepKey, []);
    }
    setCurrentStep(stepNumber);
  };

  return (
    <div className="bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60 sticky top-14 z-20 animate-fadeSlideUp animate-delay-100">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        {/* Step Counter Label */}
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            STEP
          </span>
          <span className="font-mono text-lg font-bold text-white tabular-nums">
            {currentStep}
          </span>
          <span className="font-mono text-lg text-zinc-600">/</span>
          <span className="font-mono text-lg text-zinc-500 tabular-nums">4</span>
          <span className="mx-2 text-zinc-700">—</span>
          <span className="font-mono text-lg font-medium text-white tracking-wide">
            {stepLabels[currentStep - 1]}
          </span>

          {isDev && (
            <button
              onClick={handleAddTestMessage}
              className="ml-4 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800 bg-cyan-950/30 hover:bg-cyan-900/40 transition-colors"
            >
              +MSG
            </button>
          )}
        </div>

        {/* Progress Track */}
        <div className="flex items-center gap-1">
          {stepKeyMap.map((stepKey, index) => {
            const stepNumber = index + 1;
            const stepData = steps[stepKey];
            const isCompleted = stepData.approved;
            const hasDoc = stepData.generatedDoc !== null;
            const isCurrent = currentStep === stepNumber;
            const isAccessible = canAccessStep(stepNumber, steps, stepKeyMap);
            const isCompletingNow = completingStep === stepKey;

            // Count user messages for this step
            const userMessageCount = stepData.chatHistory.filter(
              (m) => m.role === "user"
            ).length;

            // Calculate fill percentage
            let fillPercent: number;
            if (isCompleted || hasDoc) {
              fillPercent = 100;
            } else if (isCurrent && isGenerating) {
              // While generating, pulse at current level
              fillPercent = calculateAsymptoticFill(userMessageCount, expectedQuestions[index]) * 100;
            } else {
              fillPercent = calculateAsymptoticFill(userMessageCount, expectedQuestions[index]) * 100;
            }

            return (
              <button
                key={stepKey}
                onClick={() => handleStepClick(stepNumber)}
                disabled={!isAccessible}
                className={`
                  group relative flex-1 h-2 overflow-hidden
                  ${!isAccessible ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                title={isAccessible ? stepLabels[index] : "Complete previous steps first"}
              >
                {/* Track Background */}
                <div className="absolute inset-0 bg-zinc-800" />

                {/* Fill Bar */}
                <div
                  className={`
                    absolute inset-y-0 left-0 transition-all
                    ${isCompletingNow
                      ? "duration-700 ease-out"
                      : "duration-500 ease-out"
                    }
                    ${(isCompleted || hasDoc)
                      ? "bg-zinc-100"
                      : isCurrent
                        ? "bg-gradient-to-r from-zinc-200 via-zinc-100 to-white"
                        : "bg-zinc-600"
                    }
                  `}
                  style={{ width: `${fillPercent}%` }}
                />

                {/* Pulse animation for approved steps */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-white animate-pulse opacity-20" />
                )}

                {/* Glow effect for current step while filling */}
                {isCurrent && !hasDoc && fillPercent > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent blur-sm transition-all duration-500"
                    style={{ width: `${Math.min(fillPercent + 10, 100)}%` }}
                  />
                )}

                {/* Completion flash */}
                {isCompletingNow && (
                  <div className="absolute inset-0 bg-white animate-ping opacity-40" />
                )}

                {/* Shimmer effect while generating */}
                {isCurrent && isGenerating && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  />
                )}

                {/* Hover effect */}
                {isAccessible && !isCurrent && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                )}
              </button>
            );
          })}
        </div>

        {/* Question counts for all steps */}
        <div className="flex items-center gap-1 mt-2">
          {stepKeyMap.map((stepKey, index) => {
            const isCurrent = currentStep === index + 1;
            const isCompleted = steps[stepKey].approved;
            const hasDoc = steps[stepKey].generatedDoc !== null;

            return (
              <div key={stepKey} className="flex-1 text-center">
                <span className={`font-mono text-xs transition-colors duration-300 ${
                  (isCompleted || hasDoc)
                    ? "text-white"
                    : isCurrent
                      ? "text-zinc-300"
                      : "text-zinc-600"
                }`}>
                  {stepQuestions[index]} questions
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
