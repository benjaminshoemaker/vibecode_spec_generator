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

const stepConfigs: StepConfig[] = [
  step1Config,
  step2Config,
  step3Config,
  step4Config,
];

const stepKeyMap = ["onePager", "devSpec", "checklist", "agentsMd"] as const;
const stepNames = ["One Pager", "Dev Spec", "Prompt Plan", "AGENTS"];

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
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b-2 border-stone-100 h-20 sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral-400 rounded-xl flex items-center justify-center text-white font-black text-xl rotate-3">V</div>
          <span className="font-black text-stone-800 text-lg tracking-tight">Vibe Scaffold</span>
        </div>
        
        <div className="flex gap-3">
          {isDevelopment && (
            <button
              onClick={handleLoadSampleDocs}
              className="hidden md:flex items-center px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
            >
              Load Sample Docs
            </button>
          )}
          <button
            onClick={resetWizard}
            className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-coral-500 transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* Left Column: Interactive Wizard Area */}
        <div className="flex flex-col min-h-[600px]">
          <div className="flex-1 bg-white rounded-[2.5rem] border-4 border-stone-100 overflow-hidden flex flex-col shadow-sm">
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
          <div className="bg-white rounded-[2rem] border-4 border-stone-100 p-6">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-wide mb-4">Your Journey</h3>
            
            <div className="space-y-2">
               {stepNames.map((name, index) => {
                const stepKey = stepKeyMap[index];
                const isCompleted = steps[stepKey].approved;
                const isActive = currentStep === index + 1;
                const hasDocument = steps[stepKey].generatedDoc !== null;

                return (
                  <div key={name} className={`relative flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActive ? 'bg-coral-50' : 'hover:bg-stone-50'
                  }`}>
                    <button
                      onClick={() => handleStepClick(index + 1)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isCompleted ? 'bg-teal-400 text-white' :
                        isActive ? 'bg-coral-400 text-white' :
                        'bg-stone-200 text-stone-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className={`text-base font-bold ${isActive ? 'text-coral-900' : 'text-stone-500'}`}>
                        {name}
                      </span>
                    </button>
                    
                    {hasDocument && (
                      <button
                        onClick={() => handleDownload(stepKey, name)}
                        className="text-stone-400 hover:text-teal-500 p-2 rounded-xl hover:bg-teal-50 transition-all"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-[2rem] border-4 border-stone-100 p-6 sticky top-28">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-wide mb-4">Next Steps</h3>
            
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('triggerGenerate'));
              }}
              disabled={steps[currentStepKey].chatHistory.length === 0 || isGenerating}
              className="w-full mb-3 py-4 px-6 bg-coral-400 hover:bg-coral-500 text-white rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transform active:scale-95"
            >
              {isGenerating && (
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {isGenerating ? "Generating..." : currentConfig.generateButtonText}
            </button>

            <button
              onClick={handleApproveAndNext}
              disabled={!steps[currentStepKey].generatedDoc}
              className="w-full py-4 px-6 bg-teal-400 hover:bg-teal-500 text-white rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transform active:scale-95"
            >
              {currentStep === 4 ? "Save Draft & Finish" : "Save Draft & Next Step"}
            </button>

            <div className="h-0.5 bg-stone-100 my-6 rounded-full"></div>

            <button
              onClick={handleDownloadAll}
              disabled={!Object.values(steps).some(step => step.generatedDoc !== null)}
              className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>⬇</span>
              Download All as ZIP
            </button>
          </div>

        </aside>
      </div>

      <Footer />
    </div>
  );
}