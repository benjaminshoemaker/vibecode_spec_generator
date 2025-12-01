"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { StepConfig, Message } from "@/app/types";
import { useWizardStore } from "@/app/store";
import ChatInterface from "./ChatInterface";
import DocumentPreview from "./DocumentPreview";
import { Terminal, Loader2, X } from 'lucide-react';
import { analytics } from "@/app/utils/analytics";
import { spikelog } from "@/app/utils/spikelog";
import { sampleDocs } from "../utils/sampleDocs";

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
  const [showExampleModal, setShowExampleModal] = useState(false);
  const hasGeneratedBefore = useRef(!!stepData.generatedDoc);

  const sampleDocMap: Record<string, string> = {
    onePager: sampleDocs.onePager,
    devSpec: sampleDocs.devSpec,
    checklist: sampleDocs.promptPlan,
    agentsMd: sampleDocs.agentsMd,
  };

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

      // Track token usage approximation (#8) - ~4 chars per token
      const promptChars = stepData.chatHistory.reduce((sum, msg) => sum + msg.content.length, 0);
      const completionChars = generatedDoc.length;
      spikelog.trackTokenUsage(
        Math.round(promptChars / 4),
        Math.round(completionChars / 4),
        config.stepName
      );

      // Track regeneration (#14) if this is not the first generation
      if (hasGeneratedBefore.current) {
        spikelog.trackRegeneration(config.stepName);
      }
      hasGeneratedBefore.current = true;

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
      <div className="flex flex-col flex-1 min-h-[400px]">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="text-2xs font-mono text-accent uppercase tracking-widest mb-1">Current Module: Step 0{stepKey === 'onePager' ? '1' : stepKey === 'devSpec' ? '2' : stepKey === 'checklist' ? '3' : '4'}</div>
          <div className="text-lg font-bold text-white tracking-tight">
            {config.stepName}
          </div>
          <div className="text-sm text-[#a1a1aa] mt-1">
            {config.userInstructions}
          </div>
          <button
            onClick={() => setShowExampleModal(true)}
            className="text-xs text-accent hover:text-accent-light font-mono mt-2 inline-flex items-center gap-1"
          >
            See example output →
          </button>
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
            placeholder={config.inputPlaceholder}
          />
        </div>
      </div>

      {/* Loading Box */}
      {isGenerating && !stepData.generatedDoc && (
        <div id="preview-box" className="border-t border-zinc-800 bg-zinc-950 p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
            <div className="text-sm font-mono font-bold text-white mb-2 tracking-widest">
               GENERATING_ASSETS...
            </div>
            <div className="text-xs text-[#a1a1aa] font-mono">
              Processing {config.stepName} requirements
            </div>

            <div className="w-64 h-1 bg-zinc-800 mt-8 overflow-hidden">
               <div className="h-full bg-accent w-1/2 animate-[slide_1s_linear_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Box */}
      {stepData.generatedDoc && (
        <div id="preview-box" className="border-t border-zinc-800 min-h-[500px] h-[70vh] max-h-[800px] flex flex-col">
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

      {showExampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <div className="text-2xs font-mono text-accent uppercase tracking-widest mb-1">Example Output</div>
                <div className="text-lg font-bold text-white">{config.stepName}</div>
              </div>
              <button
                onClick={() => setShowExampleModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {sampleDocMap[stepKey]}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950">
              <p className="text-xs text-zinc-500">
                This is sample output for a Photo Captioner app. Your output will be customized to your idea.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
