"use client";

import { useWizardStore } from "@/app/store";
import WizardStep from "./components/WizardStep";
import { step1Config } from "./steps/step1-config";
import { step2Config } from "./steps/step2-config";
import { step3Config } from "./steps/step3-config";
import { step4Config } from "./steps/step4-config";
import { StepConfig } from "@/app/types";
import { sampleDocs } from "./utils/sampleDocs";
import { canAccessStep } from "./utils/stepAccess";
import JSZip from "jszip";
import Footer from "../components/Footer";
import WizardProgress from "./components/WizardProgress";
import { Terminal, ChevronRight, Check, Download, RotateCcw, FileJson, X } from 'lucide-react';
import { analytics, getOrCreateClientId } from "@/app/utils/analytics";
import { parseSpecMetadata } from "@/app/utils/parseSpecMetadata";
import { useEffect, useState } from "react";
import { FinalInstructionsModal } from "./components/FinalInstructionsModal";
import { spikelog } from "@/app/utils/spikelog";

const stepConfigs: StepConfig[] = [
  step1Config,
  step2Config,
  step3Config,
  step4Config,
];

const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;
const stepNames = ["ONE_PAGER", "DEV_SPEC", "PROMPT_PLAN", "AGENTS_MD"];

export default function WizardPage() {
  const { currentStep, setCurrentStep, steps, isGenerating, resetWizard, updateStepDoc, approveStep } = useWizardStore();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isDemoGenerating, setIsDemoGenerating] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);

  const currentConfig = stepConfigs[currentStep - 1];
  const currentStepKey = stepKeyMap[currentStep - 1];
  const isDevelopment = process.env.NODE_ENV === 'development';
  const agentCommand =
    "Read AGENTS.md first, then ONE_PAGER.md, DEV_SPEC.md, and PROMPT_PLAN.md. Confirm when finished loading them.";

  // Track when users land on the wizard (covers direct visits)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasStarted = sessionStorage.getItem('wizard-started');
    if (!hasStarted) {
      analytics.trackWizardStart('direct_wizard');
      spikelog.trackWizardStart('direct_wizard'); // #4
      sessionStorage.setItem('wizard-started', 'true');
    }

    // Start session heartbeat for active sessions tracking (#9)
    spikelog.startSessionHeartbeat();

    // Cleanup on unmount
    return () => {
      spikelog.endSessionHeartbeat();
    };
  }, []);

  // Track step views (#6)
  useEffect(() => {
    analytics.trackStepView(currentStep, stepNames[currentStep - 1]);
    spikelog.trackStepView(currentStep, stepNames[currentStep - 1]);
  }, [currentStep]);

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

  const handleApproveAndNext = () => {
    const { approveStep, updateStepChat } = useWizardStore.getState();
    const wasAlreadyApproved = steps[currentStepKey].approved;
    analytics.trackStepApproved(currentStep, stepNames[currentStep - 1]);
    approveStep(currentStepKey);
    if (currentStep < 4) {
      const nextStepKey = stepKeyMap[currentStep];
      updateStepChat(nextStepKey, []);
      setCurrentStep(currentStep + 1);
    } else {
      analytics.trackFinalizeClick();
      if (!wasAlreadyApproved) {
        analytics.trackWizardComplete();
        spikelog.trackWizardCompletion(); // #5
      }
      setShowCompletionModal(true);
    }
  };

  const handleDownload = (stepKey: typeof stepKeyMap[number], stepName: string) => {
    const stepData = steps[stepKey];
    if (!stepData.generatedDoc) return;

    const blob = new Blob([stepData.generatedDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stepName.toUpperCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track individual document download
    analytics.trackDocumentDownload(stepName);
    spikelog.trackDocumentDownload("individual", 1); // #7
  };

  const handleLoadSampleDocs = () => {
    setShowCompletionModal(false);
    updateStepDoc('onePager', sampleDocs.onePager);
    approveStep('onePager');
    updateStepDoc('devSpec', sampleDocs.devSpec);
    approveStep('devSpec');
    updateStepDoc('checklist', sampleDocs.promptPlan);
    approveStep('checklist');
    updateStepDoc('agentsMd', sampleDocs.agentsMd);
    approveStep('agentsMd');
    setCurrentStep(1);
  };

  const handleLoadDemoStep = async (stepKey: typeof stepKeyMap[number], stepIndex: number) => {
    const sampleMap: Record<typeof stepKeyMap[number], string> = {
      onePager: sampleDocs.onePager,
      devSpec: sampleDocs.devSpec,
      checklist: sampleDocs.promptPlan,
      agentsMd: sampleDocs.agentsMd,
    };
    setIsDemoGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateStepDoc(stepKey, sampleMap[stepKey]);
    setIsDemoGenerating(false);
  };

  const handleReset = () => {
    setShowCompletionModal(false);
    resetWizard();
  };

  const handleCompletionDownload = () => {
    analytics.trackCompletionDownload();
    handleDownloadAll();
  };

  const handleCommandCopy = () => {
    analytics.trackCompletionCopy();
  };

  const handleDownloadAll = async () => {
    // Fire and forget: log metadata for analytics
    try {
      const metadata = parseSpecMetadata(
        steps.onePager.generatedDoc,
        steps.devSpec.generatedDoc
      );
      const clientId = getOrCreateClientId();
      fetch("/api/log-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...metadata, clientId }),
      }).catch(() => {
        // Silently ignore errors - non-blocking
      });
    } catch {
      // Parsing failed, continue with download
    }

    const zip = new JSZip();
    let hasDocuments = false;
    let documentCount = 0;
    stepNames.forEach((name, index) => {
      const stepKey = stepKeyMap[index];
      const stepData = steps[stepKey];
      if (stepData.generatedDoc) {
        const filename = `${name.toUpperCase().replace(/\s+/g, '_')}.md`;
        zip.file(filename, stepData.generatedDoc);
        hasDocuments = true;
        documentCount++;
      }
    });

    if (hasDocuments) {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GENERATED_DOCS.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track bulk download
      analytics.trackBulkDownload(documentCount);
      spikelog.trackDocumentDownload("bulk", documentCount); // #7

      // If all docs exist, also surface the completion modal
      if (documentCount === stepNames.length) {
        setShowCompletionModal(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-[#e4e4e7] font-sans flex flex-col">
      {/* Blueprint Grid Background */}
      <div className="blueprint-grid"></div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">

      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 h-14 sticky top-0 z-30 px-6 flex items-center justify-between animate-fadeSlideUp">
        <div className="flex items-center gap-3">
           <div className="w-[18px] h-[18px] bg-accent flex items-center justify-center">
              <div className="w-2 h-2 bg-zinc-950"></div>
           </div>
           <span className="font-mono text-sm font-bold text-white tracking-tight">VIBE_SCAFFOLD <span className="text-zinc-600 mx-1">›</span> <span className="text-zinc-400 font-medium">WIZARD</span></span>
        </div>
        
        <div className="flex gap-4">
          {isDevelopment && (
            <button
              onClick={handleLoadSampleDocs}
              className="hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono text-emerald-500 border border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors"
            >
              <FileJson className="w-3 h-3" />
              LOAD_SAMPLES
            </button>
          )}
          {isDevelopment && (
            <button
              onClick={() => {
                const clientId = localStorage.getItem('vs_client_id');
                if (clientId) {
                  navigator.clipboard.writeText(clientId);
                }
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono text-amber-500 border border-amber-900/50 bg-amber-950/20 hover:bg-amber-950/40 transition-colors"
            >
              COPY_CLIENT_ID
            </button>
          )}
          {isDevelopment && (
            <button
              onClick={() => handleLoadDemoStep(currentStepKey, currentStep - 1)}
              disabled={isDemoGenerating}
              className="hidden md:flex items-center gap-2 px-3 py-1 text-xs font-mono text-amber-500 border border-amber-900/50 bg-amber-950/20 hover:bg-amber-950/40 transition-colors disabled:opacity-50"
            >
              {isDemoGenerating && (
                <div className="w-3 h-3 border-2 border-amber-400 border-t-amber-950 rounded-full animate-spin"></div>
              )}
              {isDemoGenerating ? "DEMO..." : `${currentConfig.generateButtonText.toUpperCase()} (DEMO)`}
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-[#a1a1aa] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <WizardProgress />

      {/* Main Layout */}
      <div className="flex-1 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        
        {/* Left Column: Interactive Wizard Area */}
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fadeSlideUp animate-delay-150">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col shadow-xl">
             <WizardStep
                config={currentConfig}
                stepKey={currentStepKey}
                onApproveAndNext={handleApproveAndNext}
              />
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-6 flex flex-col">

          {/* Example Output Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 order-3 lg:order-1 animate-fadeSlideUp animate-delay-200">
            <h3 className="text-2xs font-mono font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">EXAMPLE OUTPUT</h3>

            <div className="relative max-h-[120px] overflow-hidden">
              <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {(currentStepKey === 'onePager' ? sampleDocs.onePager :
                  currentStepKey === 'devSpec' ? sampleDocs.devSpec :
                  currentStepKey === 'checklist' ? sampleDocs.promptPlan :
                  sampleDocs.agentsMd).split('\n').slice(0, 8).join('\n')}
              </pre>
              {/* Fade gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none"></div>
            </div>

            <button
              onClick={() => setShowExampleModal(true)}
              className="text-xs text-accent hover:text-accent-light font-mono mt-3 inline-flex items-center gap-1 transition-all duration-200"
            >
              See full example →
            </button>
          </div>

          {/* Action Card - Order 1 on mobile, Order 2 on desktop */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 lg:sticky lg:top-20 order-1 lg:order-2 animate-fadeSlideUp animate-delay-250">
            <h3 className="text-2xs font-mono font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">ACTIONS</h3>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('triggerGenerate'));
              }}
              disabled={
                isGenerating ||
                (currentStepKey !== 'checklist' && currentStepKey !== 'agentsMd' && !steps[currentStepKey].chatHistory.some(msg => msg.role === 'user'))
              }
              className="w-full mb-3 py-3 px-4 bg-accent hover:bg-accent-light text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(245,158,11,0.15)] active:scale-[0.98] active:translate-y-px"
            >
              {isGenerating && (
                <div className="w-3 h-3 border-2 border-amber-400 border-t-zinc-900 rounded-full animate-spin"></div>
              )}
              {isGenerating ? "PROCESSING..." : currentConfig.generateButtonText.toUpperCase()}
            </button>

            <button
              onClick={handleApproveAndNext}
              disabled={!steps[currentStepKey].generatedDoc}
              className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-accent hover:text-accent text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] active:translate-y-px"
            >
              {currentStep === 4 ? "FINALIZE" : "APPROVE & NEXT"}
            </button>
          </div>

          {/* Progress Card - Order 2 on mobile, Order 3 on desktop */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 order-2 lg:order-3 animate-fadeSlideUp animate-delay-300">
            <h3 className="text-2xs font-mono font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">GENERATED DOCUMENTS</h3>

            <div className="space-y-px bg-zinc-800 border border-zinc-800">
               {stepNames.map((name, index) => {
                const stepKey = stepKeyMap[index];
                const isCompleted = steps[stepKey].approved;
                const isActive = currentStep === index + 1;
                const hasDocument = steps[stepKey].generatedDoc !== null;
                const isLocked = !canAccessStep(index + 1, steps, stepKeyMap);

                return (
                  <div key={name} className={`relative flex items-center justify-between p-3 transition-all ${
                    isActive
                      ? 'bg-zinc-800 border-l-2 border-white'
                      : isLocked
                        ? 'bg-zinc-900 border-l-2 border-transparent opacity-70'
                        : 'bg-zinc-900 hover:bg-zinc-800/50 border-l-2 border-transparent'
                  }`}>
                    <button
                      onClick={() => handleStepClick(index + 1)}
                      disabled={isLocked}
                      title={isLocked ? "Complete previous steps to unlock this stage" : undefined}
                      className={`flex items-center gap-3 flex-1 text-left ${
                        isLocked ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <div className={`font-mono text-xs ${
                        isCompleted
                          ? 'text-white'
                          : isActive
                            ? 'text-white'
                            : isLocked
                              ? 'text-zinc-700'
                              : 'text-[#a1a1aa]'
                      }`}>
                        {isCompleted ? '[✓]' : `[0${index + 1}]`}
                      </div>
                      <span className={`text-xs font-bold font-mono tracking-wide ${
                        (isActive || isCompleted) ? 'text-white' : isLocked ? 'text-zinc-600' : 'text-[#a1a1aa]'
                      }`}>
                        {name}
                      </span>
                    </button>

                    {hasDocument && (
                      <button
                        onClick={() => handleDownload(stepKey, name)}
                        className="text-accent hover:text-accent-light transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleDownloadAll}
              disabled={!Object.values(steps).some(step => step.generatedDoc !== null)}
              className="w-full mt-4 py-2.5 px-4 text-[#a1a1aa] hover:text-accent text-xs font-mono transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              DOWNLOAD_ALL.ZIP
            </button>
          </div>

        </aside>
      </div>

      <Footer />

      <FinalInstructionsModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onDownloadAll={handleCompletionDownload}
        agentCommand={agentCommand}
        onCopyCommand={handleCommandCopy}
      />

      {/* Example Output Modal */}
      {showExampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-backdropEnter">
          <div className="bg-zinc-900 border border-zinc-800 max-w-3xl w-full max-h-[80vh] flex flex-col animate-modalEnter shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <div className="text-2xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Example Output</div>
                <div className="text-lg font-bold text-white">{currentConfig.stepName}</div>
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
                {currentStepKey === 'onePager' ? sampleDocs.onePager :
                  currentStepKey === 'devSpec' ? sampleDocs.devSpec :
                  currentStepKey === 'checklist' ? sampleDocs.promptPlan :
                  sampleDocs.agentsMd}
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
      </div>
    </div>
  );
}
