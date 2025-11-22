"use client";

import { useWizardStore } from "@/app/store";
import WizardStep from "./components/WizardStep";
import { step1Config } from "./steps/step1-config";
import { step2Config } from "./steps/step2-config";
import { step3Config } from "./steps/step3-config";
import { step4Config } from "./steps/step4-config";
import { StepConfig } from "@/app/types";
import { sampleDocs } from "./utils/sampleDocs";
import JSZip from "jszip";
import Footer from "../components/Footer";
import { Terminal, ChevronRight, Check, Download, RotateCcw, FileJson } from 'lucide-react';

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

  const currentConfig = stepConfigs[currentStep - 1];
  const currentStepKey = stepKeyMap[currentStep - 1];
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber > currentStep) {
      const { updateStepChat } = useWizardStore.getState();
      const targetStepKey = stepKeyMap[stepNumber - 1];
      updateStepChat(targetStepKey, []);
    }
    setCurrentStep(stepNumber);
  };

  const handleApproveAndNext = () => {
    const { approveStep, updateStepChat } = useWizardStore.getState();
    approveStep(currentStepKey);
    if (currentStep < 4) {
      const nextStepKey = stepKeyMap[currentStep];
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
    a.download = `${stepName.toUpperCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleDocs = () => {
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

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    let hasDocuments = false;
    stepNames.forEach((name, index) => {
      const stepKey = stepKeyMap[index];
      const stepData = steps[stepKey];
      if (stepData.generatedDoc) {
        const filename = `${name.toUpperCase().replace(/\s+/g, '_')}.md`;
        zip.file(filename, stepData.generatedDoc);
        hasDocuments = true;
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
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 h-14 sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-6 h-6 bg-white flex items-center justify-center">
              <div className="w-3 h-3 bg-zinc-950"></div>
           </div>
           <span className="font-mono text-sm font-bold text-white tracking-tight">VIBE_SCAFFOLD <span className="text-zinc-600">// WIZARD</span></span>
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
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        
        {/* Left Column: Interactive Wizard Area */}
        <div className="flex flex-col min-h-[600px]">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col shadow-xl">
             <WizardStep
                config={currentConfig}
                stepKey={currentStepKey}
                onApproveAndNext={handleApproveAndNext}
              />
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-6">
          
          {/* Progress Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-xs font-mono font-bold text-zinc-500 mb-4">=SEQUENCE</h3>
            
            <div className="space-y-px bg-zinc-800 border border-zinc-800">
               {stepNames.map((name, index) => {
                const stepKey = stepKeyMap[index];
                const isCompleted = steps[stepKey].approved;
                const isActive = currentStep === index + 1;
                const hasDocument = steps[stepKey].generatedDoc !== null;

                return (
                  <div key={name} className={`relative flex items-center justify-between p-3 transition-all ${
                    isActive ? 'bg-zinc-800 border-l-2 border-white' : 'bg-zinc-900 hover:bg-zinc-800/50 border-l-2 border-transparent'
                  }`}>
                    <button
                      onClick={() => handleStepClick(index + 1)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`font-mono text-xs ${
                        isCompleted ? 'text-emerald-500' : isActive ? 'text-white' : 'text-zinc-600'
                      }`}>
                        {isCompleted ? '[✓]' : `[0${index + 1}]`}
                      </div>
                      <span className={`text-xs font-bold font-mono tracking-wide ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                        {name}
                      </span>
                    </button>
                    
                    {hasDocument && (
                      <button
                        onClick={() => handleDownload(stepKey, name)}
                        className="text-zinc-500 hover:text-white transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 sticky top-20">
            <h3 className="text-xs font-mono font-bold text-zinc-500 mb-4">=ACTIONS</h3>
            
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('triggerGenerate'));
              }}
              disabled={steps[currentStepKey].chatHistory.length === 0 || isGenerating}
              className="w-full mb-3 py-3 px-4 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {isGenerating && (
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></div>
              )}
              {isGenerating ? "PROCESSING..." : currentConfig.generateButtonText.toUpperCase()}
            </button>

            <button
              onClick={handleApproveAndNext}
              disabled={!steps[currentStepKey].generatedDoc}
              className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 4 ? "FINALIZE" : "APPROVE & NEXT"}
            </button>

            <div className="h-px bg-zinc-800 my-6"></div>

            <button
              onClick={handleDownloadAll}
              disabled={!Object.values(steps).some(step => step.generatedDoc !== null)}
              className="w-full py-2 px-4 text-zinc-500 hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-2 disabled:opacity-30"
            >
              <Download className="w-3 h-3" />
              DOWNLOAD_ALL.ZIP
            </button>
          </div>

        </aside>
      </div>

      <Footer />
    </div>
  );
}