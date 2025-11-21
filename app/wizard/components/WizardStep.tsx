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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: stepData.chatHistory,
          stepName: config.stepName,
          documentInputs,
          generationPrompt: config.generationPrompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate document");
      const data = await response.json();
      updateStepDoc(stepKey, data.document);

      setTimeout(() => {
        const previewElement = document.getElementById('preview-box');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  }, [config.documentInputs, config.stepName, stepData.chatHistory, stepKey, steps, updateStepDoc, setIsGenerating]);

  const handleApprove = () => {
    approveStep(stepKey);
  };

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
      <div className="flex flex-col h-[500px] lg:h-[600px]">
        <div className="px-6 py-4 border-b-2 border-stone-100 bg-stone-50/50">
          <div className="text-lg font-black text-stone-800 mb-1">
            {config.stepName}
          </div>
          <div className="text-sm font-medium text-stone-500">
            {config.userInstructions}
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-stone-50/30">
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

      {/* Loading Box */}
      {isGenerating && !stepData.generatedDoc && (
        <div id="preview-box" className="border-t-4 border-stone-100 bg-white p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-6 animate-bounce">🪄</div>
            <div className="text-xl font-black text-stone-800 mb-2">
               Magic is happening...
            </div>
            <div className="text-stone-500 font-medium mb-8">
              We're writing your {config.stepName} right now.
            </div>
            <div className="w-64 h-4 bg-stone-100 rounded-full overflow-hidden">
               <div className="h-full bg-coral-400 w-1/2 animate-[slide_1s_linear_infinite] rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Box */}
      {stepData.generatedDoc && (
        <div id="preview-box" className="border-t-4 border-stone-100 h-[600px] flex flex-col">
          <DocumentPreview
            content={stepData.generatedDoc}
            onRegenerate={handleGenerate}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 m-6">
          <p className="text-red-500 font-bold">Uh oh! {error}</p>
        </div>
      )}
    </>
  );
}