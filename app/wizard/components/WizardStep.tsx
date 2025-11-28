"use client";

import { useState, useCallback, useEffect } from "react";
import { StepConfig, Message } from "@/app/types";
import { useWizardStore } from "@/app/store";
import ChatInterface from "./ChatInterface";
import DocumentPreview from "./DocumentPreview";
import { Terminal, Loader2 } from 'lucide-react';
import { analytics } from "@/app/utils/analytics";

interface WizardStepProps {
  config: StepConfig;
  stepKey: "onePager" | "devSpec" | "checklist" | "agentsMd";
  onApproveAndNext: () => void;
}

export default function WizardStep({ config, stepKey, onApproveAndNext }: WizardStepProps) {
  const { steps, isGenerating, setIsGenerating, updateStepChat, updateStepDoc, approveStep, resetCounter } =
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

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let generatedDoc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        generatedDoc += decoder.decode(value);
      }

      // Append attribution for AGENTS.md
      if (stepKey === "agentsMd") {
        generatedDoc = generatedDoc.trimEnd() + "\n\n<!-- Generated with vibescaffold.dev -->\n";
      }

      updateStepDoc(stepKey, generatedDoc);

      // Track successful document generation
      analytics.trackDocumentGenerate(config.stepName, true);

      setTimeout(() => {
        const previewElement = document.getElementById('preview-box');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document");
      // Track failed document generation
      analytics.trackDocumentGenerate(config.stepName, false);
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
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Current Module</div>
          <div className="text-sm font-bold text-white tracking-wide uppercase">
            {config.stepName}
          </div>
        </div>
        
        <div className="px-6 py-2 bg-zinc-900/50 border-b border-zinc-800">
          <div className="text-xs font-mono text-zinc-500">
            <span className="text-emerald-500">$</span> {config.userInstructions}
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-zinc-950">
          <ChatInterface
            key={`${stepKey}-${resetCounter}`}
            systemPrompt={config.systemPrompt}
            initialMessages={stepData.chatHistory}
            onMessagesChange={handleMessagesChange}
            documentInputs={documentInputsForChat}
            initialGreeting={config.initialGreeting}
            stepName={config.stepName}
          />
        </div>
      </div>

      {/* Loading Box */}
      {isGenerating && !stepData.generatedDoc && (
        <div id="preview-box" className="border-t border-zinc-800 bg-zinc-950 p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
            <div className="text-sm font-mono font-bold text-white mb-2 tracking-widest">
               GENERATING_ASSETS...
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              Processing {config.stepName} requirements
            </div>
            
            <div className="w-64 h-1 bg-zinc-800 mt-8 overflow-hidden">
               <div className="h-full bg-white w-1/2 animate-[slide_1s_linear_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Box */}
      {stepData.generatedDoc && (
        <div id="preview-box" className="border-t border-zinc-800 h-[800px] flex flex-col">
          <DocumentPreview
            content={stepData.generatedDoc}
            onRegenerate={handleGenerate}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 p-4 m-6">
          <p className="text-red-400 font-mono text-xs">ERROR: {error}</p>
        </div>
      )}
    </>
  );
}
