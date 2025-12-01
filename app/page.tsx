"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Layers, Command, Cpu, GitBranch, ArrowRight, ChevronDown, X, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';
import Footer from "./components/Footer";
import StatsGrid from "./components/StatsGrid";
import GitHubStars from "./components/GitHubStars";
import { analytics } from "@/app/utils/analytics";

// Sample output excerpts for the Output Preview section
const ONE_PAGER_EXCERPT = `# Photo Captioner - One-Pager

Purpose
-------
A lightweight mobile app that generates engaging captions
for photos to help casual social sharers craft on‑point,
shareable text quickly.

Problem
-------
Social media users often struggle to find short, engaging
captions for photos. They want quick, creative text without
spending time thinking of the right tone or wording.

Target audience
---------------
- Primary: Casual social sharers - everyday users who post
  photos on social platforms (friends, family, lifestyle posts)
- Goals: Post frequently with minimal friction, make photos
  more engaging, sound natural/fun without effort

Core user flow (MVP)
--------------------
1. Open app (no account required for MVP)
2. Upload photo / take new photo
3. Select tone from presets: Funny, Heartfelt, Witty
4. Tap "Generate" → show progress
5. Display three caption suggestions
6. User taps "Copy" on chosen caption`;

const DEV_SPEC_EXCERPT = `# Photo Captioner - Developer Specification (MVP)

1) Summary & goals
------------------
- Mobile: React Native (Expo) + TypeScript
- Backend: Node.js (18+) + TypeScript + Fastify
- Inference: OpenAI gpt-5-nano (multimodal)
- Auth: Firebase Authentication - passwordless email
- Storage: Google Cloud Storage (6-hour TTL)

2) High-level architecture
--------------------------
Sequence:
1. Client requests /presign-upload with Firebase ID token
2. Backend returns presigned PUT URL and objectPath
3. Client uploads image directly to GCS
4. Client calls /generate with objectPath + tone
5. Backend validates, runs Vision SafeSearch
6. Call OpenAI gpt-5-nano → returns 3 captions
7. Run moderation, filter unsafe content
8. Return up to 3 safe captions

6) API contract
---------------
POST /generate
Request: { objectPath, tone: "funny"|"heartfelt"|"witty" }
Response: { suggestions: [{ id, text, safety_flags }] }`;

const PROMPT_PLAN_EXCERPT = `# Prompt Plan - Photo Captioner (MVP)

Overall stage breakdown
-----------------------
Stage A - Project scaffolding
Stage B - Core backend & auth
Stage C - Media processing & safety
Stage D - Model orchestration
Stage E - /generate endpoint with rate limiting
Stage F - Admin flows
Stage G - Client + CI/CD + deployment

Prompt 0 - Repo scaffolding
---------------------------
Todo checklist:
- [ ] Create package.json with scripts
- [ ] Add tsconfig.json, jest.config.js
- [ ] Implement src/index.ts with /health route
- [ ] Add test/health.test.ts
- [ ] Add Dockerfile skeleton

Prompt 2 - Firebase Auth verification
-------------------------------------
Todo checklist:
- [ ] Create src/services/authService.ts
- [ ] Add verifyFirebaseToken middleware
- [ ] Write unit tests with mocked Firebase Admin
- [ ] Protect /presign-upload and /generate routes`;

const AGENTS_EXCERPT = `# AGENTS.md

Purpose
-------
This file orients automated agents (Codex, Claude Code,
CI bots) to the repository workflow and responsibilities.

Agent responsibility
--------------------
- After completing any step, immediately update the
  TODO checklist in prompt_plan.md
- Do not consider work "done" until tests are green
- Always commit prompt_plan.md alongside code changes

Testing policy (non‑negotiable)
-------------------------------
- Tests MUST cover functionality being implemented
- NEVER ignore test output - logs contain CRITICAL info
- Write tests BEFORE implementation (TDD)

Guardrails
----------
- Make the smallest change that passes tests
- Do not duplicate files to work around issues
- If a file cannot be opened, say so and stop`;

const SAMPLE_TABS = [
  { id: 'one-pager', label: 'ONE_PAGER.md', description: 'Problem, audience, MVP scope, core flows', content: ONE_PAGER_EXCERPT },
  { id: 'dev-spec', label: 'DEV_SPEC.md', description: 'Architecture, API contracts, data models', content: DEV_SPEC_EXCERPT },
  { id: 'prompt-plan', label: 'PROMPT_PLAN.md', description: 'Step-by-step prompts with TDD checkboxes', content: PROMPT_PLAN_EXCERPT },
  { id: 'agents', label: 'AGENTS.md', description: 'Guardrails to keep AI on track', content: AGENTS_EXCERPT },
];

export default function LandingPage() {
  // Blinking cursor effect for the hero
  const [cursorVisible, setCursorVisible] = useState(true);
  // Active tab for sample output preview
  const [activeTab, setActiveTab] = useState('one-pager');
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const handleWizardStart = (source: string) => {
    analytics.trackWizardStart(source);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('wizard-started', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-accent selection:text-black flex flex-col">
      {/* Blueprint Grid Background */}
      <div className="blueprint-grid"></div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-sm font-bold tracking-tight text-white">
            <div className="w-[18px] h-[18px] bg-accent flex items-center justify-center">
              <div className="w-2 h-2 bg-zinc-950"></div>
            </div>
            VIBE_SCAFFOLD
          </div>

          <div className="flex items-center gap-4">
            <GitHubStars repo="benjaminshoemaker/vibecode_spec_generator" />
            <Link
              href="/wizard"
              onClick={() => handleWizardStart("nav_login")}
              className="text-xs font-mono text-zinc-400 hover:text-accent transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/wizard"
              onClick={() => handleWizardStart("nav_get_started")}
              className="bg-accent text-zinc-950 hover:bg-accent-light px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(245,158,11,0.15)]"
            >
              Get Started <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 flex-grow">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Hero Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900 text-2xs font-mono text-zinc-400 mb-8 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-accent animate-pulse"></span>
                For anyone using AI coding tools
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-10">
                Sound familiar?
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} ml-1 text-accent`}>_</span>
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-lg text-zinc-400 leading-relaxed">You described your app, AI built something... but not quite right</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-lg text-zinc-400 leading-relaxed">You&apos;re 47 prompts deep and it keeps breaking things it already fixed</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-lg text-zinc-400 leading-relaxed">You don&apos;t know if you&apos;re 80% done or 98% done</p>
                </div>
              </div>

              <div className="border-l-2 border-accent pl-6 py-2 mb-10">
                <p className="text-xl text-white font-semibold">The problem isn&apos;t the AI. It&apos;s the spec.</p>
              </div>

              <p className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-10">
                VibeScaffold generates the structure your AI coding tools need to finish what they start - clear specs, persistent context, and defined acceptance criteria.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/wizard"
                  onClick={() => handleWizardStart("hero_start_building")}
                  className="h-12 px-8 bg-accent text-zinc-950 font-bold flex items-center justify-center gap-2 hover:bg-accent-light transition-all text-sm tracking-wide uppercase hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)]"
                >
                  <Terminal className="w-4 h-4" />
                  Generate Your First Spec
                </Link>
                <Link
                  href="#the-80-problem"
                  className="h-12 px-8 bg-transparent border border-zinc-700 text-white font-medium flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all text-sm tracking-wide"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Hero Visual - Before/After Comparison */}
            <div className="lg:col-span-5 hidden lg:block space-y-4">
              {/* Without VibeScaffold */}
              <div className="bg-red-950 border border-red-500/20 overflow-hidden">
                <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/10">
                  <span className="text-2xs font-mono text-red-400 uppercase tracking-widest">Without VibeScaffold</span>
                </div>
                <div className="p-4 font-mono text-xs space-y-2">
                  <div><span className="text-zinc-500">You:</span> <span className="text-zinc-300">&quot;Build me a time tracking app&quot;</span></div>
                  <div><span className="text-zinc-500">AI:</span> <span className="text-zinc-600 italic">[builds something]</span></div>
                  <div><span className="text-zinc-500">You:</span> <span className="text-zinc-300">&quot;No, I meant for parents...&quot;</span></div>
                  <div><span className="text-zinc-500">AI:</span> <span className="text-zinc-600 italic">[rebuilds, breaks auth]</span></div>
                  <div className="text-zinc-600 italic">... 47 messages later ...</div>
                </div>
              </div>

              {/* With VibeScaffold */}
              <div className="bg-emerald-950 border border-emerald-500/20 overflow-hidden">
                <div className="px-4 py-2 border-b border-emerald-500/20 bg-emerald-500/10">
                  <span className="text-2xs font-mono text-emerald-400 uppercase tracking-widest">With VibeScaffold</span>
                </div>
                <div className="p-4 font-mono text-xs space-y-3">
                  <div className="flex flex-wrap gap-2 text-2xs">
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300">ONE_PAGER.md</span>
                    <span className="text-zinc-600">→</span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300">DEV_SPEC.md</span>
                    <span className="text-zinc-600">→</span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300">PROMPT_PLAN.md</span>
                    <span className="text-zinc-600">→</span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300">AGENTS.md</span>
                  </div>
                  <div><span className="text-zinc-500">You:</span> <span className="text-zinc-300">&quot;Build step 1: [Pasted Prompt #1]&quot;</span></div>
                  <div><span className="text-zinc-500">AI:</span> <span className="text-zinc-600 italic">[builds step 1, tests pass]</span> <span className="text-emerald-400">✓</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-zinc-800"></div>

        {/* The 80% Problem Section - Combined with Solutions */}
        <div id="the-80-problem" className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16">
            <h2 className="text-2xs font-mono text-zinc-400 mb-2 uppercase tracking-widest">The 80% Problem</h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">AI gets you 80% there. Then you hit the wall.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - No Clear Spec */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">No Clear Spec</h4>
              <ul className="space-y-1.5 text-sm text-zinc-400 leading-relaxed mb-5">
                <li>• Vague user stories, missing edge cases</li>
                <li>• AI fills gaps with hallucinated defaults</li>
              </ul>
              <div className="border-t border-zinc-700 pt-5">
                <h5 className="text-sm font-bold text-emerald-400 font-mono mb-2">ONE_PAGER.md + DEV_SPEC.md</h5>
                <p className="text-xs text-zinc-400">Forces decisions about audience, MVP scope, auth, data model upfront</p>
              </div>
            </div>

            {/* Card 2 - Fragmented Context */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">Fragmented Context</h4>
              <ul className="space-y-1.5 text-sm text-zinc-400 leading-relaxed mb-5">
                <li>• Ideas scattered across chat history</li>
                <li>• Agent can&apos;t hold the project in memory</li>
              </ul>
              <div className="border-t border-zinc-700 pt-5">
                <h5 className="text-sm font-bold text-emerald-400 font-mono mb-2">All 4 docs feed into each other</h5>
                <p className="text-xs text-zinc-400">Single source of truth AI agents can reference every session</p>
              </div>
            </div>

            {/* Card 3 - 'Done' is Undefined */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">&apos;Done&apos; is Undefined</h4>
              <ul className="space-y-1.5 text-sm text-zinc-400 leading-relaxed mb-5">
                <li>• No test cases, no acceptance criteria</li>
                <li>• Every fix breaks something else</li>
              </ul>
              <div className="border-t border-zinc-700 pt-5">
                <h5 className="text-sm font-bold text-emerald-400 font-mono mb-2">PROMPT_PLAN.md + AGENTS.md</h5>
                <p className="text-xs text-zinc-400">Step-by-step prompts with TDD checkboxes and acceptance criteria</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-zinc-800"></div>

        {/* Output Preview Section */}
        <div id="what-you-get" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xs font-mono text-zinc-400 mb-2 uppercase tracking-widest">What You Get</h2>
            <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Four documents. See exactly what&apos;s inside.</h3>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Real output from VibeScaffold for a Photo Captioner app
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-3 mb-6 overflow-x-auto pb-2">
            {SAMPLE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-left transition-all border ${
                  activeTab === tab.id
                    ? 'text-accent border-accent bg-zinc-900'
                    : 'text-zinc-400 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="font-mono text-sm whitespace-nowrap">{tab.label}</div>
                <div className={`text-xs mt-1 ${activeTab === tab.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {tab.description}
                </div>
              </button>
            ))}
          </div>

          {/* Code preview area */}
          <div className="relative bg-zinc-900 border border-zinc-800 overflow-hidden max-h-96">
            {SAMPLE_TABS.map((tab) => (
              <div
                key={tab.id}
                className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
              >
                <div className="flex">
                  {/* Line numbers */}
                  <div className="py-4 px-3 text-right select-none border-r border-zinc-800 bg-zinc-950">
                    {tab.content.split('\n').map((_, i) => (
                      <div key={i} className="font-mono text-xs text-zinc-600 leading-5">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {/* Content */}
                  <pre className="py-4 px-4 font-mono text-sm text-zinc-300 whitespace-pre overflow-x-auto flex-1 leading-5">
                    {tab.content}
                  </pre>
                </div>
              </div>
            ))}
            {/* Fade gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none"></div>
          </div>

          {/* Note and download button */}
          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400 mb-6">
              This is a small excerpt. Full documents are 100-800 lines of detailed specifications.
            </p>
            <a
              href="/samples/PHOTO_CAPTIONER_SAMPLES.zip"
              onClick={() => analytics.trackSampleDownload()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 text-white font-semibold uppercase tracking-wide hover:border-accent hover:text-accent transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Download Sample Pack (ZIP)
            </a>
            <p className="text-xs text-zinc-500 mt-3">
              4 complete documents for a Photo Captioner app
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-zinc-800"></div>

        {/* Social Proof Stats */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <StatsGrid />
        </div>

        {/* Divider */}
        <div className="w-full border-t border-zinc-800"></div>

        {/* Demo Video Section */}
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="relative bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-zinc-700"></div>
                <div className="w-2 h-2 bg-zinc-700"></div>
                <div className="w-2 h-2 bg-zinc-700"></div>
              </div>
              <div className="text-2xs font-mono text-zinc-400 uppercase tracking-widest">demo.mov</div>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '49.64%' }}>
              <iframe
                src="https://www.loom.com/embed/4c94b21cade442a7acf083dc2cbe01a5?hide_share=true&hideEmbedTopBar=true&hide_speed=true"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="border-t border-zinc-800 bg-zinc-900 py-24">
           <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
             <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
               Stop debugging AI-generated spaghetti.
             </h2>
             <p className="text-lg text-zinc-400 mb-8">
               Generate the spec first. Ship the whole thing.
             </p>
             <Link
               href="/wizard"
               onClick={() => handleWizardStart("footer_cta")}
               className="bg-accent text-zinc-950 px-10 py-4 font-bold text-sm uppercase tracking-wide hover:bg-accent-light transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)] flex items-center gap-2"
             >
               <Terminal className="w-4 h-4" />
               Generate Your First Spec
             </Link>
             <p className="text-xs text-zinc-600 mt-4">
               Free. No account required.
             </p>
           </div>
        </div>

      </main>

      <Footer />
      </div>
    </div>
  );
}
