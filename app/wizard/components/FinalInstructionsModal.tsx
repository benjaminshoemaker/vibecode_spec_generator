"use client";

import { useState } from "react";
import { X, Download, Clipboard, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { analytics } from "@/app/utils/analytics";

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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-500">Wizard complete</div>
            <div className="text-lg font-bold text-white">Hand off to your AI coding agent</div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Close final instructions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-zinc-200">
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
              <p className="text-zinc-400 text-xs mt-1">Examples: Cursor, Windsurf, Claude Code, or your preferred agent.</p>
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

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
              <Mail className="w-3 h-3" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Join the mailing list to receive updates and early access to new features:</div>
              {subscribeStatus === "success" ? (
                <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Thanks! You&apos;re subscribed.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribeStatus === "loading"}
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={subscribeStatus === "loading" || !email.trim()}
                    className="px-4 py-1.5 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subscribeStatus === "loading" ? "..." : "Subscribe"}
                  </button>
                </form>
              )}
              {subscribeStatus === "error" && (
                <p className="text-red-400 text-xs mt-1">Something went wrong. Please try again.</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
              <MessageCircle className="w-3 h-3" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Connect with us</div>
              <div className="flex gap-3 mt-2">
                <a
                  href="https://discord.gg/9v3GpsEpCa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Join our Discord
                </a>
                <span className="text-zinc-600">·</span>
                <a
                  href="https://forms.gle/CBvAEG7YLxdJvezD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Send feedback
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
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
