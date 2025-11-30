"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Layers, Command, Cpu, GitBranch, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Footer from "./components/Footer";
import StatsGrid from "./components/StatsGrid";
import GitHubStars from "./components/GitHubStars";
import { analytics } from "@/app/utils/analytics";

export default function LandingPage() {
  // Blinking cursor effect for the hero
  const [cursorVisible, setCursorVisible] = useState(true);
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
    <div className="min-h-screen bg-zinc-950 text-[#e4e4e7] font-sans selection:bg-accent selection:text-black flex flex-col">
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
              className="text-xs font-mono text-[#a1a1aa] hover:text-accent transition-colors"
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
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-[10px] font-mono text-[#a1a1aa] mb-8 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-accent animate-pulse"></span>
                AI-Powered Spec Generator
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                Turn your fresh ideas into<br />
                <span className="text-[#a1a1aa]">crystal clear specs.</span>
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} ml-1 text-accent`}>_</span>
              </h1>

              <p className="text-[17px] text-[#a1a1aa] max-w-xl leading-relaxed mb-10">
                Stop writing vague prompt iterations. Generate detailed technical specifications, architecture diagrams, and agent directives from a single structured conversation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/wizard"
                  onClick={() => handleWizardStart("hero_start_building")}
                  className="h-12 px-8 bg-accent text-zinc-950 font-bold flex items-center justify-center gap-2 hover:bg-accent-light transition-all text-sm tracking-wide uppercase hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)]"
                >
                  <Terminal className="w-4 h-4" />
                  Start Building Now
                </Link>
                <Link
                  href="#capabilities"
                  className="h-12 px-8 bg-transparent border border-zinc-700 text-white font-medium flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all text-sm tracking-wide"
                >
                  Read Documentation
                </Link>
              </div>
            </div>

            {/* Hero Visual - Abstract Interface */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="relative bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-zinc-700"></div>
                      <div className="w-2 h-2 bg-zinc-700"></div>
                      <div className="w-2 h-2 bg-zinc-700"></div>
                    </div>
                    <div className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest">spec_generator.exe</div>
                  </div>
                  <div className="p-5 font-mono text-xs">
                    <div className="flex gap-4 mb-6">
                      <div className="text-zinc-600 text-right select-none">
                        01<br/>02<br/>03<br/>04<br/>05
                      </div>
                      <div className="text-[#e4e4e7]">
                        <span className="text-purple-400">function</span> <span className="text-accent">generateSpec</span>(input) {'{'}<br/>
                        &nbsp;&nbsp;<span className="text-zinc-500">// Analysis in progress...</span><br/>
                        &nbsp;&nbsp;<span className="text-blue-400">const</span> architecture = <span className="text-emerald-400">new</span> SystemDesign(input);<br/>
                        &nbsp;&nbsp;<span className="text-blue-400">return</span> architecture.compile();<br/>
                        {'}'}
                      </div>
                    </div>
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-accent mb-3">
                        <ChevronRight className="w-3 h-3" />
                        <span className="font-bold">OUTPUT GENERATED</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[#a1a1aa]">ONE_PAGER.md</div>
                        <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[#a1a1aa]">DEV_SPEC.md</div>
                        <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[#a1a1aa]">PROMPT_PLAN.md</div>
                        <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[#a1a1aa]">AGENTS.md</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof: Live Activity + Stats */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <StatsGrid />
        </div>

        {/* Divider */}
        <div className="w-full border-t border-zinc-800"></div>

        {/* Capabilities Section */}
        <div id="capabilities" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-[11px] font-mono text-[#a1a1aa] mb-2 uppercase tracking-widest">=Capabilities</h2>
              <h3 className="text-3xl font-bold text-white tracking-tight">Reason over your requirements</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-800">
            {[
              {
                title: "Product Definition",
                desc: "Converts abstract ideas into concrete MVP requirements and user stories.",
                icon: <Command className="w-5 h-5" />,
                num: "01"
              },
              {
                title: "Tech Architecture",
                desc: "Drafts complete schema designs, API routes, and security protocols.",
                icon: <Cpu className="w-5 h-5" />,
                num: "02"
              },
              {
                title: "Development Plan",
                desc: "Breaks complexity into sequential, LLM-testable prompt chains.",
                icon: <GitBranch className="w-5 h-5" />,
                num: "03"
              },
              {
                title: "Agent Directives",
                desc: "Generates system prompts (AGENTS.md) for autonomous coding agents.",
                icon: <Layers className="w-5 h-5" />,
                num: "04"
              }
            ].map((item, i) => (
              <div key={i} className="group p-8 border-r border-b border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors relative card-hover-accent">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 text-white">
                  {item.icon}
                </div>
                <div className="text-[10px] font-mono text-[#a1a1aa] mb-2">[{item.num}]</div>
                <h4 className="text-[15px] font-bold text-white mb-2">{item.title}</h4>
                <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="border-t border-zinc-800 bg-zinc-900 py-24">
           <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
             <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">
               Ready to draft?
             </h2>
             <Link
               href="/wizard"
               onClick={() => handleWizardStart("footer_cta")}
               className="bg-accent text-zinc-950 px-10 py-4 font-bold text-sm uppercase tracking-wide hover:bg-accent-light transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)] flex items-center gap-2"
             >
               Get Started
               <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
        </div>

      </main>

      <Footer />
      </div>
    </div>
  );
}
