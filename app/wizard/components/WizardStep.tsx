"use client";

import { useState, useCallback, useEffect } from "react";
import { StepConfig, Message } from "@/app/types";
import { useWizardStore } from "@/app/store";
import ChatInterface from "./ChatInterface";
import DocumentPreview from "./DocumentPreview";

interface WizardStepProps {
  config: StepConfig;
  stepKey: "onePager" | "devSpec" | "checklist" | "agentsMd";
  onApproveAndNext: () => void;
}

export default function WizardStep({ config, stepKey, onApproveAndNext }: WizardStepProps) {
  const { steps, isGenerating, setIsGenerating, updateStepChat, updateStepDoc, approveStep } =
    useWizardStore();
  const stepData = steps[stepKey];

  const [error, setError] = useState<string | null>(null);

  const handleMessagesChange = useCallback((messages: Message[]) => {
    updateStepChat(stepKey, messages);
  }, [stepKey, updateStepChat]);

  // Collect previous documents for chat context
  const documentInputsForChat: Record<string, string> = {};
  if (config.documentInputs.length > 0) {
    for (const inputKey of config.documentInputs) {
      const key = inputKey as keyof typeof steps;
      if (steps[key]?.generatedDoc) {
        documentInputsForChat[inputKey] = steps[key].generatedDoc!;
      }
    }
  }

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get previous documents if needed
      const documentInputs: Record<string, string> = {};
      if (config.documentInputs.length > 0) {
        for (const inputKey of config.documentInputs) {
          const key = inputKey as keyof typeof steps;
          if (steps[key]?.generatedDoc) {
            documentInputs[inputKey] = steps[key].generatedDoc!;
          }
        }
      }

      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatHistory: stepData.chatHistory,
          stepName: config.stepName,
          documentInputs,
          generationPrompt: config.generationPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const data = await response.json();
      updateStepDoc(stepKey, data.document);

      // Scroll to preview after generation
      setTimeout(() => {
        const previewElement = document.getElementById('preview-box');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate document"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [config.documentInputs, config.stepName, stepData.chatHistory, stepKey, steps, updateStepDoc, setIsGenerating]);

  const handleApprove = () => {
    approveStep(stepKey);
  };

  // Listen for generate event from sidebar
  useEffect(() => {
    const handleTriggerGenerate = () => {
      if (stepData.chatHistory.length > 0 && !isGenerating) {
        handleGenerate();
      }
    };

    window.addEventListener('triggerGenerate', handleTriggerGenerate);
    return () => window.removeEventListener('triggerGenerate', handleTriggerGenerate);
  }, [stepData.chatHistory.length, isGenerating, handleGenerate]);

  return (
    <>
      {/* Chat Box */}
      <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {config.stepName}
          </div>
          <div className="text-sm text-gray-600">
            {config.userInstructions}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            key={stepKey}
            systemPrompt={config.systemPrompt}
            initialMessages={stepData.chatHistory}
            onMessagesChange={handleMessagesChange}
            documentInputs={documentInputsForChat}
            initialGreeting={config.initialGreeting}
          />
        </div>
      </div>

      {/* Loading Box - Shown while generating */}
      {isGenerating && !stepData.generatedDoc && (
        <div id="preview-box" className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-base font-semibold text-gray-900 mb-2">
              Generating {config.stepName}...
            </div>
            <div className="text-sm text-gray-600">
              This may take a moment. Please wait.
            </div>
          </div>
        </div>
      )}

      {/* Preview Box - Only shown after document is generated */}
      {stepData.generatedDoc && (
        <div id="preview-box" className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-semibold text-gray-900">
              Preview: {config.stepName}
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
          <DocumentPreview
            content={stepData.generatedDoc}
            onRegenerate={handleGenerate}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </>
  );
}
