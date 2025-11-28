"use client";

import { useState } from "react";
import { X, Download, Clipboard, CheckCircle2, Mail, MessageCircle, Sparkles } from "lucide-react";
import { analytics, getOrCreateClientId } from "@/app/utils/analytics";

interface FinalInstructionsModalProps {
  open: boolean;
  onClose: () => void;
  onDownloadAll: () => void;
  agentCommand: string;
  onCopyCommand?: () => void;
}

export function FinalInstructionsModal({
  open,
  onClose,
  onDownloadAll,
  agentCommand,
  onCopyCommand,
}: FinalInstructionsModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!open) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribeStatus("loading");
    try {
      const clientId = getOrCreateClientId();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), clientId }),
      });

      if (res.ok) {
        setSubscribeStatus("success");
        analytics.trackEmailSubscribe(true);
      } else {
        setSubscribeStatus("error");
        analytics.trackEmailSubscribe(false);
      }
    } catch {
      setSubscribeStatus("error");
      analytics.trackEmailSubscribe(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agentCommand);
      onCopyCommand?.();
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy command", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-500">Wizard complete</div>
            <div className="text-xl font-bold text-white">Hand off to your AI coding agent</div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Close final instructions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-5 text-sm text-zinc-200">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold">
              1
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white flex items-center gap-2">
                Download all documents (zip)
                <button
                  onClick={onDownloadAll}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors rounded-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1">You will get GENERATED_DOCS.zip with everything bundled.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold">
              2
            </div>
            <div>
              <div className="font-semibold text-white">Extract the ZIP into your project root</div>
              <p className="text-zinc-400 text-xs mt-1">Place all files in the directory where you want to build.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold">
              3
            </div>
            <div>
              <div className="font-semibold text-white">Open your AI coding tool in that directory</div>
              <p className="text-zinc-400 text-xs mt-1">Examples: Codex CLI, Claude Code, or your preferred agent.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold">
              4
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white mb-2">
                Tell the agent to read AGENTS.md first, then the other docs
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3 flex items-start justify-between gap-3">
                <code className="text-xs text-zinc-200 break-words">{agentCommand}</code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wide transition-colors rounded-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold">
              5
            </div>
            <div>
              <div className="font-semibold text-white">Paste prompts from the Prompt Plan and build!</div>
              <p className="text-zinc-400 text-xs mt-1">Follow PROMPT_PLAN.md in order and watch your project come together.</p>
            </div>
          </div>

          {/* Separator */}
          <div className="pt-4 mt-6 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase text-zinc-500">Stay in the loop</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email signup card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                    <Mail className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="font-semibold text-white text-sm">Get updates</div>
                </div>
                <p className="text-zinc-400 text-xs mb-3">Early access to new features and improvements.</p>
                {subscribeStatus === "success" ? (
                  <p className="text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Thanks! You&apos;re subscribed.
                  </p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={subscribeStatus === "loading"}
                      className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={subscribeStatus === "loading" || !email.trim()}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {subscribeStatus === "loading" ? "..." : "Subscribe"}
                    </button>
                  </form>
                )}
                {subscribeStatus === "error" && (
                  <p className="text-red-400 text-xs mt-2">Something went wrong. Please try again.</p>
                )}
              </div>

              {/* Connect card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="font-semibold text-white text-sm">Connect with us</div>
                </div>
                <p className="text-zinc-400 text-xs mb-3">Join the community or share your thoughts.</p>
                <div className="flex gap-2">
                  <a
                    href="https://discord.gg/9v3GpsEpCa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors rounded"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Discord
                  </a>
                  <a
                    href="https://forms.gle/CBvAEG7YLxdJvezD6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors rounded"
                  >
                    Feedback
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-mono font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Back to wizard
          </button>
        </div>
      </div>
    </div>
  );
}
